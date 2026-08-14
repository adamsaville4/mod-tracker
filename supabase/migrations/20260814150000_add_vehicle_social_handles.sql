-- Nullable per-vehicle social handles, shown on the public build log page.
-- Raw handle only (no @, no URL) — sanitized in the app layer, with a
-- matching check constraint here as defense-in-depth (same pattern as
-- profiles.username's format check).

alter table vehicles
  add column instagram_handle text check (instagram_handle ~ '^[A-Za-z0-9_.]+$'),
  add column tiktok_handle text check (tiktok_handle ~ '^[A-Za-z0-9_.]+$'),
  add column x_handle text check (x_handle ~ '^[A-Za-z0-9_.]+$');
