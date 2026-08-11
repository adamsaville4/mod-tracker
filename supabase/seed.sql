-- ============================================================
-- Mod Tracker seed data
--
-- VERIFY BEFORE RUNNING:
--   * All cost ranges are placeholder estimates in GBP. Check them
--     against Pumaspeed, Demon Tweeks or the manufacturer directly.
--     Wrong figures here become wrong figures on every mod page.
--   * Fitment rows are a first pass. Facelift variants and engine
--     changes within a generation often break part compatibility,
--     so confirm each mapping before this goes public.
--   * You know this catalogue better than any generic source does.
--     Treat this as a skeleton to correct, not a finished list.
--   * Fiesta ST Mk6 is deliberately absent. Seeding a generation with
--     no compatible parts gives that owner an empty typeahead and no
--     way to log anything. Add it back with fitment rows attached.
--
-- Re-runnable: every insert carries ON CONFLICT DO NOTHING.
-- ============================================================

begin;

-- ── Categories ───────────────────────────────────────────────

insert into mod_categories (name, slug) values
  ('Intake',       'intake'),
  ('Exhaust',      'exhaust'),
  ('ECU / Tuning', 'ecu'),
  ('Intercooler',  'intercooler'),
  ('Cooling',      'cooling'),
  ('Suspension',   'suspension'),
  ('Brakes',       'brakes'),
  ('Wheels',       'wheels'),
  ('Tyres',        'tyres'),
  ('Drivetrain',   'drivetrain'),
  ('Cosmetic',     'cosmetic'),
  ('Interior',     'interior')
on conflict (slug) do nothing;

-- ── Vehicle models ───────────────────────────────────────────

insert into vehicle_models (make, model, generation, slug) values
  ('Ford', 'Focus ST',  'Mk2 (2005-2010)',    'ford-focus-st-mk2'),
  ('Ford', 'Focus ST',  'Mk3 (2012-2018)',    'ford-focus-st-mk3'),
  ('Ford', 'Focus ST',  'Mk4 (2019-present)', 'ford-focus-st-mk4'),
  ('Ford', 'Fiesta ST', 'Mk7 (2013-2017)',    'ford-fiesta-st-mk7'),
  ('Ford', 'Fiesta ST', 'Mk8 (2018-2023)',    'ford-fiesta-st-mk8')
on conflict (slug) do nothing;

-- ── Mods ─────────────────────────────────────────────────────

insert into mods (name, brand, category_id, typical_cost_low, typical_cost_high, slug)
select v.name, v.brand, c.id, v.lo, v.hi, v.slug
from (values
  -- ECU / tuning
  ('m330 Power Upgrade',        'Mountune',        'ecu',         600,  800,  'mountune-m330'),
  ('mTune SMARTflash',          'Mountune',        'ecu',         400,  600,  'mountune-mtune-smartflash'),
  ('Accessport V3',             'Cobb',            'ecu',         550,  700,  'cobb-accessport-v3'),
  ('Stage 1 Remap',             'Dreamscience',    'ecu',         350,  550,  'dreamscience-stage-1'),
  ('Bluefin Remap',             'Superchips',      'ecu',         350,  500,  'superchips-bluefin'),

  -- Intake
  ('Induction Kit',             'Mountune',        'intake',      250,  400,  'mountune-induction-kit'),
  ('Carbon Intake',             'ZeroNine',        'intake',      350,  500,  'zeronine-carbon-intake'),
  ('Panel Air Filter',          'Pipercross',      'intake',       40,   70,  'pipercross-panel-filter'),
  ('57i Induction Kit',         'K&N',             'intake',      200,  300,  'kn-57i-induction-kit'),
  ('Silicone Induction Hose',   'Forge Motorsport','intake',       80,  150,  'forge-induction-hose'),

  -- Exhaust
  ('Cat-Back Exhaust',          'Milltek Sport',   'exhaust',     700, 1200,  'milltek-cat-back'),
  ('Sports Cat Downpipe',       'Milltek Sport',   'exhaust',     500,  900,  'milltek-sports-cat-downpipe'),
  ('Cat-Back Exhaust',          'Scorpion',        'exhaust',     600, 1000,  'scorpion-cat-back'),
  ('Resonator Delete Pipe',     'Pumaspeed',       'exhaust',     150,  300,  'pumaspeed-resonator-delete'),

  -- Intercooler / cooling
  ('Front Mount Intercooler',   'AIRTEC',          'intercooler', 450,  700,  'airtec-fmic'),
  ('Uprated Intercooler',       'Mishimoto',       'intercooler', 500,  750,  'mishimoto-intercooler'),
  ('Boost Pipe Kit',            'AIRTEC',          'intercooler', 150,  300,  'airtec-boost-pipe-kit'),
  ('Oil Catch Can',             'Mishimoto',       'cooling',     150,  250,  'mishimoto-oil-catch-can'),

  -- Suspension
  ('Pro-Kit Lowering Springs',  'Eibach',          'suspension',  200,  300,  'eibach-pro-kit'),
  ('Variant 3 Coilovers',       'KW',              'suspension', 1200, 1800,  'kw-variant-3'),
  ('B14 Coilovers',             'Bilstein',        'suspension',  900, 1300,  'bilstein-b14'),
  ('Rear Anti-Roll Bar',        'Whiteline',       'suspension',  200,  350,  'whiteline-rear-arb'),
  ('Full Bush Kit',             'Powerflex',       'suspension',  300,  600,  'powerflex-full-bush-kit'),

  -- Brakes
  ('Yellowstuff Brake Pads',    'EBC',             'brakes',      100,  180,  'ebc-yellowstuff-pads'),
  ('Braided Brake Lines',       'HEL Performance', 'brakes',       90,  150,  'hel-braided-lines'),
  ('Big Brake Kit',             'Tarox',           'brakes',      900, 1500,  'tarox-big-brake-kit'),

  -- Wheels / tyres
  ('Pro Race 1.2 Wheels',       'Team Dynamics',   'wheels',      500,  800,  'team-dynamics-pro-race-12'),
  ('Eagle F1 Asymmetric 6',     'Goodyear',        'tyres',       500,  750,  'goodyear-eagle-f1-asym-6'),
  ('Pilot Sport 4S',            'Michelin',        'tyres',       600,  900,  'michelin-pilot-sport-4s'),

  -- Drivetrain
  ('Billet Short Shifter',      'Mountune',        'drivetrain',  250,  400,  'mountune-billet-short-shifter'),
  ('ATB Limited Slip Diff',     'Quaife',          'drivetrain', 1000, 1500,  'quaife-atb-lsd')
) as v(name, brand, cat_slug, lo, hi, slug)
join mod_categories c on c.slug = v.cat_slug
on conflict (slug) do nothing;

-- ── Fitment ──────────────────────────────────────────────────
-- One row per mod per compatible generation. This is the table
-- that most needs your eyes on it.

insert into mod_fitment (mod_id, vehicle_model_id)
select m.id, vm.id
from (values
  -- ECU / tuning
  ('mountune-m330',                 'ford-focus-st-mk4'),
  ('mountune-mtune-smartflash',     'ford-focus-st-mk3'),
  ('mountune-mtune-smartflash',     'ford-fiesta-st-mk7'),
  ('mountune-mtune-smartflash',     'ford-fiesta-st-mk8'),
  ('cobb-accessport-v3',            'ford-focus-st-mk3'),
  ('cobb-accessport-v3',            'ford-fiesta-st-mk7'),
  ('dreamscience-stage-1',          'ford-focus-st-mk2'),
  ('dreamscience-stage-1',          'ford-focus-st-mk3'),
  ('superchips-bluefin',            'ford-focus-st-mk3'),
  ('superchips-bluefin',            'ford-fiesta-st-mk7'),

  -- Intake
  ('mountune-induction-kit',        'ford-focus-st-mk3'),
  ('mountune-induction-kit',        'ford-focus-st-mk4'),
  ('zeronine-carbon-intake',        'ford-focus-st-mk4'),
  ('pipercross-panel-filter',       'ford-focus-st-mk2'),
  ('pipercross-panel-filter',       'ford-focus-st-mk3'),
  ('pipercross-panel-filter',       'ford-focus-st-mk4'),
  ('pipercross-panel-filter',       'ford-fiesta-st-mk7'),
  ('pipercross-panel-filter',       'ford-fiesta-st-mk8'),
  ('kn-57i-induction-kit',          'ford-focus-st-mk2'),
  ('kn-57i-induction-kit',          'ford-focus-st-mk3'),
  ('forge-induction-hose',          'ford-fiesta-st-mk7'),

  -- Exhaust
  ('milltek-cat-back',              'ford-focus-st-mk3'),
  ('milltek-cat-back',              'ford-focus-st-mk4'),
  ('milltek-cat-back',              'ford-fiesta-st-mk7'),
  ('milltek-cat-back',              'ford-fiesta-st-mk8'),
  ('milltek-sports-cat-downpipe',   'ford-focus-st-mk3'),
  ('milltek-sports-cat-downpipe',   'ford-focus-st-mk4'),
  ('milltek-sports-cat-downpipe',   'ford-fiesta-st-mk7'),
  ('scorpion-cat-back',             'ford-focus-st-mk3'),
  ('scorpion-cat-back',             'ford-fiesta-st-mk7'),
  ('pumaspeed-resonator-delete',    'ford-focus-st-mk3'),

  -- Intercooler / cooling
  ('airtec-fmic',                   'ford-focus-st-mk3'),
  ('airtec-fmic',                   'ford-focus-st-mk4'),
  ('airtec-fmic',                   'ford-fiesta-st-mk7'),
  ('airtec-fmic',                   'ford-fiesta-st-mk8'),
  ('mishimoto-intercooler',         'ford-focus-st-mk3'),
  ('airtec-boost-pipe-kit',         'ford-focus-st-mk3'),
  ('mishimoto-oil-catch-can',       'ford-focus-st-mk3'),
  ('mishimoto-oil-catch-can',       'ford-focus-st-mk4'),

  -- Suspension
  ('eibach-pro-kit',                'ford-focus-st-mk3'),
  ('eibach-pro-kit',                'ford-focus-st-mk4'),
  ('eibach-pro-kit',                'ford-fiesta-st-mk7'),
  ('eibach-pro-kit',                'ford-fiesta-st-mk8'),
  ('kw-variant-3',                  'ford-focus-st-mk3'),
  ('kw-variant-3',                  'ford-focus-st-mk4'),
  ('bilstein-b14',                  'ford-focus-st-mk3'),
  ('bilstein-b14',                  'ford-fiesta-st-mk7'),
  ('whiteline-rear-arb',            'ford-focus-st-mk3'),
  ('whiteline-rear-arb',            'ford-fiesta-st-mk7'),
  ('powerflex-full-bush-kit',       'ford-focus-st-mk2'),
  ('powerflex-full-bush-kit',       'ford-focus-st-mk3'),

  -- Brakes
  ('ebc-yellowstuff-pads',          'ford-focus-st-mk2'),
  ('ebc-yellowstuff-pads',          'ford-focus-st-mk3'),
  ('ebc-yellowstuff-pads',          'ford-focus-st-mk4'),
  ('ebc-yellowstuff-pads',          'ford-fiesta-st-mk7'),
  ('ebc-yellowstuff-pads',          'ford-fiesta-st-mk8'),
  ('hel-braided-lines',             'ford-focus-st-mk2'),
  ('hel-braided-lines',             'ford-focus-st-mk3'),
  ('hel-braided-lines',             'ford-focus-st-mk4'),
  ('hel-braided-lines',             'ford-fiesta-st-mk7'),
  ('tarox-big-brake-kit',           'ford-focus-st-mk3'),
  ('tarox-big-brake-kit',           'ford-focus-st-mk4'),

  -- Wheels / tyres
  ('team-dynamics-pro-race-12',     'ford-focus-st-mk3'),
  ('team-dynamics-pro-race-12',     'ford-fiesta-st-mk7'),
  ('goodyear-eagle-f1-asym-6',      'ford-focus-st-mk3'),
  ('goodyear-eagle-f1-asym-6',      'ford-focus-st-mk4'),
  ('goodyear-eagle-f1-asym-6',      'ford-fiesta-st-mk7'),
  ('goodyear-eagle-f1-asym-6',      'ford-fiesta-st-mk8'),
  ('michelin-pilot-sport-4s',       'ford-focus-st-mk3'),
  ('michelin-pilot-sport-4s',       'ford-focus-st-mk4'),
  ('michelin-pilot-sport-4s',       'ford-fiesta-st-mk7'),
  ('michelin-pilot-sport-4s',       'ford-fiesta-st-mk8'),

  -- Drivetrain
  ('mountune-billet-short-shifter', 'ford-focus-st-mk3'),
  ('mountune-billet-short-shifter', 'ford-focus-st-mk4'),
  ('mountune-billet-short-shifter', 'ford-fiesta-st-mk7'),
  ('quaife-atb-lsd',                'ford-focus-st-mk2'),
  ('quaife-atb-lsd',                'ford-focus-st-mk3'),
  ('quaife-atb-lsd',                'ford-fiesta-st-mk7')
) as f(mod_slug, model_slug)
join mods m           on m.slug  = f.mod_slug
join vehicle_models vm on vm.slug = f.model_slug
on conflict do nothing;

commit;
