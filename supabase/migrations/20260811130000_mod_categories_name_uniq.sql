-- Case-insensitive dedup guard, matching the pattern on mods
-- (mods_name_brand_uniq) and vehicle_models (vehicle_models_uniq).
create unique index mod_categories_name_uniq
  on mod_categories (lower(name));
