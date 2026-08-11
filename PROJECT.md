# Mod Tracker — Project Spec

## Overview
A web app for car enthusiasts (starting niche: Ford Focus ST / Fiesta ST
owners) to log modifications on their vehicles and maintain public build
logs. Phase 2 adds mod ratings and build comparison.

## Stack
- Next.js (App Router), TypeScript
- Supabase (Postgres + Auth)
- Deploy target: decided at step 8, not before (see hosting note)

**Hosting note.** This is a step 8 decision. Nothing before it depends
on the choice.

*Vercel* runs Next.js natively with the least setup, but its fair use
guidelines restrict Hobby to non-commercial personal use, and their
definition of commercial includes advertising and affiliate links. With
affiliate links this needs Pro, roughly £16/month, from launch rather
than later. Hobby also has no overage option: hitting a limit pauses the
deployment until the next billing cycle rather than throttling.

*Cloudflare Workers* permits commercial use on its free tier, which
covers 100,000 requests/day, with paid starting around $5/month. The
cost is friction: Next.js needs the OpenNext adapter rather than running
natively, so deployment problems mean debugging the adapter as well as
the app.

Supabase's free tier pauses projects after roughly 7 days idle
regardless of which host you pick. Verify all of the above against
current terms before deploying.

## Phase 1 scope (build this first, nothing else)

1. **Auth** — Supabase email/password + magic link, with a `profiles`
   table extending `auth.users` and a trigger that creates the profile
   row on signup. Onboarding must force the user to choose a username
   before they can create a vehicle (see username rules below).
2. **Vehicle CRUD** — user adds, edits and deletes a vehicle, selecting
   its model from the seeded `vehicle_models` catalogue. Deletes must
   cascade cleanly.
3. **Mod logging** — user logs a mod against their vehicle (date fitted,
   cost, notes, install hours). Mods come from a **read-only seeded
   catalogue** via typeahead, filtered to those that fit the vehicle's
   model. Users cannot create catalogue entries; a "request a mod" form
   writes to `mod_requests` for review.
4. **Public build log** — `/builds/[username]/[vehicle-slug]`, shows the
   vehicle plus logged mods in chronological order. No auth to view.
5. **Dashboard** — logged-in user sees their own vehicles.

## Explicitly out of scope for phase 1
- Ratings and reviews (schema included, no UI)
- Build comparison
- Follows / activity feed
- Maintenance reminders
- Service and fault logging

## Identifier rules

Both of these appear in public URLs, so get them right before any page
is built.

**Username.** Never derived from the email address, since that would
publish the local part of a private email on every build log page.
The signup trigger assigns a neutral placeholder; onboarding then
requires the user to pick a real one, validated against
`^[a-z0-9][a-z0-9-]{2,29}$` and checked for uniqueness.

**Vehicle slug.** Generated from the nickname if set, otherwise from the
model name, lowercased and stripped to `[a-z0-9-]`. On collision within
the same owner, append `-2`, `-3` and so on. Uniqueness is scoped per
owner, not globally, so two users can both have `focus-st`.

## Database schema

```sql
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
```

## Row-level security

**Enable RLS and write these policies immediately after the migration,
before building any UI.** Building CRUD with RLS off means every query
works in dev and breaks the moment it goes on. It also means anything
deployed before that point is writable by anyone holding the anon key,
which is public by design.

Required behaviour:

- `vehicles` — owner can insert, update, delete their own rows. Anyone,
  including anonymous, can select.
- `vehicle_mods` — writable only where the parent vehicle's `owner_id`
  matches the caller. Publicly selectable.
- `mods`, `mod_fitment`, `mod_links`, `vehicle_models`, `mod_categories`
  — a select policy only, and no insert, update or delete policies at
  all. In RLS, no matching policy means the operation is denied, so no
  API caller can touch the catalogue. Seeds and migrations run as the
  `postgres` role, which bypasses RLS, so they are unaffected. Add an
  admin role later only if you build catalogue management screens in
  the browser.
- `ratings` — insert and update require **both** that `user_id` equals
  `auth.uid()` **and** that the caller owns the vehicle behind
  `vehicle_mod_id`. Checking only one lets a user attribute a rating to
  someone else, or rate an install that isn't theirs. Either breaks the
  integrity of every aggregate score. Publicly selectable.
- `mod_requests` — insertable by any authenticated user, selectable by
  the requester only. You review the queue in the Supabase dashboard.
- `profiles` — self-update only, publicly selectable.
- `follows` — follower can insert and delete their own rows.

Review every generated policy by hand. Test with two real accounts:
sign in as user A, attempt a write against user B's vehicle, and confirm
the database rejects it rather than the UI merely hiding it.

## Build sequence

1. Migration for the schema above, then `supabase gen types typescript`
2. RLS policies, reviewed by hand and tested with two accounts
3. Auth flow, the profile trigger, and the username selection step
4. Seed `mod_categories`, `vehicle_models` (Focus ST and Fiesta ST
   generations) and 20-30 mods with fitment rows
5. Vehicle CRUD, including the delete path (this is where the cascades
   get proven)
6. Mod logging with fitment-filtered typeahead
7. Public build log page
8. Deploy, log your own car with real mods, costs and dates

### Seed file requirements
Write it as a re-runnable SQL file in the repo, not hand-entered rows.
Re-runnable means every insert carries `on conflict do nothing`.

Conflict on the plain `slug` column, not on the expression index:

```sql
insert into mods (name, brand, category_id, slug)
values (...)
on conflict (slug) do nothing;
```

Conflicting on `slug` handles re-runs, and it deliberately leaves the
`lower(name), coalesce(lower(brand), '')` index free to raise an error.
That is the behaviour you want: a second row with a different slug but
the same name and brand is a genuine duplicate and should fail loudly
rather than be silently skipped.

## Non-functional requirements
- Mobile-first responsive layout
- No premature abstraction. Build the phase 1 feature set only. Ratings
  and follows exist in the schema so migrations stay stable; do not
  build their UI.

## Success criteria for phase 1
Create an account, add a Focus ST, log 5 real mods against it, and share
the public build log URL to a forum post.

## Stop condition
After step 8, stop building. Post the build log link into one owners'
community and see whether anyone clicks through or asks how to make
their own. Phase 2 only makes sense once other people's builds are
actually in the database.
