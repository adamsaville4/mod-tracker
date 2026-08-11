-- Assumes pgcrypto (Supabase default)

-- ── Controlled vocabularies ──────────────────────────────────────
-- Free text here fragments every filter and fitment query downstream.
-- Both are seeded via migration and closed to API writes.
-- Lookup tables rather than enums: enum values can be added but not
-- renamed or removed without a type rewrite.

create table mod_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null
);

create table vehicle_models (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  generation text,
  slug text unique not null,
  created_at timestamptz default now()
);
create unique index vehicle_models_uniq
  on vehicle_models (lower(make), lower(model), coalesce(lower(generation), ''));

-- ── Users ────────────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null
    check (username ~ '^[a-z0-9][a-z0-9-]{2,29}$'),
  username_chosen boolean not null default false,
  display_name text,
  created_at timestamptz default now()
);

-- Supabase does NOT create this row automatically. Without the trigger
-- below, the first vehicle insert fails with an FK violation.
-- The placeholder username is random, not email-derived: usernames are
-- public URL segments, and it must not break when email is null (which
-- happens with some OAuth providers).
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username)
  values (
    new.id,
    'user-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Shared updated_at trigger. A default alone only records creation
-- time under a misleading name.
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── Vehicles ─────────────────────────────────────────────────────

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  model_id uuid not null references vehicle_models(id) on delete restrict,
  nickname text,
  year int,
  slug text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Scoped per user, not global. See identifier rules above.
  unique (owner_id, slug)
);
create index on vehicles (owner_id);

create trigger vehicles_set_updated_at
  before update on vehicles
  for each row execute function set_updated_at();

-- ── Mod catalogue ────────────────────────────────────────────────

create table mods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  category_id uuid not null references mod_categories(id) on delete restrict,
  typical_cost_low numeric,
  typical_cost_high numeric,
  slug text unique not null,
  created_at timestamptz default now()
);
create index on mods (category_id);
-- Case-insensitive dedup guard; coalesce handles null brand, which a
-- plain UNIQUE constraint would let through.
create unique index mods_name_brand_uniq
  on mods (lower(name), coalesce(lower(brand), ''));

-- verified marks fitment a human has confirmed. Costs nothing now and
-- avoids backfilling every row later, once fitment is drafted from
-- affiliate product feeds. Unverified rows should render with a caveat
-- in the UI.
create table mod_fitment (
  mod_id uuid not null references mods(id) on delete cascade,
  vehicle_model_id uuid not null references vehicle_models(id) on delete cascade,
  verified boolean not null default false,
  primary key (mod_id, vehicle_model_id)
);

-- Retailer links, including affiliate URLs. A separate table rather
-- than a column on mods, so one part can carry several retailers with
-- different tags, and so links can be swapped without touching the
-- catalogue row. UK affiliate links must be clearly disclosed to the
-- user; is_affiliate drives that label in the UI.
create table mod_links (
  id uuid primary key default gen_random_uuid(),
  mod_id uuid not null references mods(id) on delete cascade,
  retailer text not null,
  url text not null,
  is_affiliate boolean not null default false,
  created_at timestamptz default now(),
  unique (mod_id, retailer)
);
create index on mod_links (mod_id);

-- ── Installs ─────────────────────────────────────────────────────
-- The hinge table. Everything community-facing derives from this.

create table vehicle_mods (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  mod_id uuid not null references mods(id) on delete restrict,
  date_fitted date,
  date_removed date,
  cost_paid numeric,
  notes text,
  install_hours numeric,
  created_at timestamptz default now(),
  -- One row per car per mod. This is the anti-gaming guard: ratings
  -- hang off installs, so allowing duplicates would let one user
  -- stack multiple ratings on the same part. Removals and re-fits are
  -- recorded with date_removed rather than a second row.
  unique (vehicle_id, mod_id),
  unique (id, mod_id)            -- target for the composite FK below
);
create index on vehicle_mods (vehicle_id);
create index on vehicle_mods (mod_id);

-- ── Ratings (phase 2 UI, phase 1 schema) ─────────────────────────
-- Ratings hang off the install, not the mod, so build context is
-- preserved. mod_id is denormalised for fast aggregates; the composite
-- FK stops it drifting from the parent row.

create table ratings (
  id uuid primary key default gen_random_uuid(),
  vehicle_mod_id uuid not null unique,
  mod_id uuid not null,
  user_id uuid not null references profiles(id) on delete cascade,
  score int not null check (score between 1 and 5),
  review text,
  created_at timestamptz default now(),
  foreign key (vehicle_mod_id, mod_id)
    references vehicle_mods(id, mod_id) on delete cascade
);
create index on ratings (mod_id);

-- ── Supporting tables ────────────────────────────────────────────

create table mod_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references profiles(id) on delete cascade,
  name text not null,
  brand text,
  category_id uuid references mod_categories(id) on delete set null,
  notes text,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, vehicle_id)
);

-- security_invoker matters: without it a view runs with the owner's
-- permissions and reads straight past RLS on the underlying table.
-- Harmless while ratings are publicly readable, a silent leak the day
-- that policy tightens.
create view mod_rating_summary
with (security_invoker = true) as
select mod_id,
       round(avg(score), 1) as avg_score,
       count(*) as rating_count
from ratings
group by mod_id;
