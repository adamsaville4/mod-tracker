-- Row-level security, per the "Row-level security" section of PROJECT.md.

-- ── mod_categories ───────────────────────────────────────────────
alter table mod_categories enable row level security;

create policy "mod_categories_select_all"
  on mod_categories for select
  using (true);

-- ── vehicle_models ───────────────────────────────────────────────
alter table vehicle_models enable row level security;

create policy "vehicle_models_select_all"
  on vehicle_models for select
  using (true);

-- ── profiles ─────────────────────────────────────────────────────
alter table profiles enable row level security;

create policy "profiles_select_all"
  on profiles for select
  using (true);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── vehicles ─────────────────────────────────────────────────────
alter table vehicles enable row level security;

create policy "vehicles_select_all"
  on vehicles for select
  using (true);

create policy "vehicles_insert_own"
  on vehicles for insert
  with check (auth.uid() = owner_id);

create policy "vehicles_update_own"
  on vehicles for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "vehicles_delete_own"
  on vehicles for delete
  using (auth.uid() = owner_id);

-- ── mods ─────────────────────────────────────────────────────────
alter table mods enable row level security;

create policy "mods_select_all"
  on mods for select
  using (true);

-- ── mod_fitment ──────────────────────────────────────────────────
alter table mod_fitment enable row level security;

create policy "mod_fitment_select_all"
  on mod_fitment for select
  using (true);

-- ── mod_links ────────────────────────────────────────────────────
alter table mod_links enable row level security;

create policy "mod_links_select_all"
  on mod_links for select
  using (true);

-- ── vehicle_mods ─────────────────────────────────────────────────
alter table vehicle_mods enable row level security;

create policy "vehicle_mods_select_all"
  on vehicle_mods for select
  using (true);

create policy "vehicle_mods_insert_own_vehicle"
  on vehicle_mods for insert
  with check (
    exists (
      select 1 from vehicles v
      where v.id = vehicle_mods.vehicle_id
        and v.owner_id = auth.uid()
    )
  );

create policy "vehicle_mods_update_own_vehicle"
  on vehicle_mods for update
  using (
    exists (
      select 1 from vehicles v
      where v.id = vehicle_mods.vehicle_id
        and v.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from vehicles v
      where v.id = vehicle_mods.vehicle_id
        and v.owner_id = auth.uid()
    )
  );

create policy "vehicle_mods_delete_own_vehicle"
  on vehicle_mods for delete
  using (
    exists (
      select 1 from vehicles v
      where v.id = vehicle_mods.vehicle_id
        and v.owner_id = auth.uid()
    )
  );

-- ── ratings ──────────────────────────────────────────────────────
alter table ratings enable row level security;

create policy "ratings_select_all"
  on ratings for select
  using (true);

create policy "ratings_insert_own"
  on ratings for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from vehicle_mods vm
      join vehicles v on v.id = vm.vehicle_id
      where vm.id = ratings.vehicle_mod_id
        and v.owner_id = auth.uid()
    )
  );

create policy "ratings_update_own"
  on ratings for update
  using (
    user_id = auth.uid()
    and exists (
      select 1 from vehicle_mods vm
      join vehicles v on v.id = vm.vehicle_id
      where vm.id = ratings.vehicle_mod_id
        and v.owner_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from vehicle_mods vm
      join vehicles v on v.id = vm.vehicle_id
      where vm.id = ratings.vehicle_mod_id
        and v.owner_id = auth.uid()
    )
  );

-- ── mod_requests ─────────────────────────────────────────────────
alter table mod_requests enable row level security;

create policy "mod_requests_insert_own"
  on mod_requests for insert
  with check (auth.uid() = requested_by);

create policy "mod_requests_select_own"
  on mod_requests for select
  using (auth.uid() = requested_by);

-- ── follows ──────────────────────────────────────────────────────
alter table follows enable row level security;

create policy "follows_insert_own"
  on follows for insert
  with check (auth.uid() = follower_id);

create policy "follows_delete_own"
  on follows for delete
  using (auth.uid() = follower_id);
