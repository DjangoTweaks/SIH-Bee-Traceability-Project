-- One-shot: wipe every row of Madhukosh data and replace it with the
-- Sundarbans-region dataset. Run this once, in full, in the Supabase SQL
-- editor: https://supabase.com/dashboard/project/cljxvdqcnverxlzwrril/sql/new
--
-- This also fixes the underlying column defaults (region/location), which
-- previously still defaulted to 'Mahabaleshwar ...' at the database level
-- even after the app's own code was updated — any hive added via the
-- Cluster Collector form without an explicit location was silently falling
-- back to that stale default. Confirmed live: HIVE-043 through HIVE-046
-- all picked up "Mahabaleshwar Field Cluster" this way.

-- ---------------------------------------------------------------------------
-- 1. Fix column defaults so future rows never default to Mahabaleshwar again
-- ---------------------------------------------------------------------------
alter table beekeepers alter column region set default 'Sundarbans';
alter table hives alter column location set default 'Sundarban Mangrove Cluster';

-- ---------------------------------------------------------------------------
-- 2. Wipe all existing data and reset the auto-ID sequences
-- ---------------------------------------------------------------------------
truncate table batches, hives, beekeepers, collectors cascade;

alter sequence beekeeper_display_seq restart with 104;
alter sequence hive_display_seq restart with 43;
alter sequence batch_display_seq restart with 8922;

-- ---------------------------------------------------------------------------
-- 3. Seed the Sundarbans-region dataset
--
-- Reflects the Sundarbans mangrove forest delta (West Bengal, India):
-- traditional honey collectors ("Moulis") harvest wild mangrove honey from
-- forest blocks inside and around the Sundarban Tiger Reserve, working
-- Khalsi (Aegiceras corniculatum), Kewra (Sonneratia apetala) and Goran
-- (Ceriops) mangrove blooms during the Chaitra-Jaistha honey season.
-- ---------------------------------------------------------------------------
insert into collectors (id, name, role, zone, hub, contact) values
  ('11111111-1111-1111-1111-111111111101', 'Debashish Halder', 'Cluster Lead — Sundarban Delta North', 'Gosaba–Basanti Range Cluster', 'Assigned Hub #S-01', '+91 98300 41256'),
  ('11111111-1111-1111-1111-111111111102', 'Farida Sardar', 'Cluster Lead — Tiger Reserve Buffer South', 'Kultali Forest Fringe Cluster', 'Assigned Hub #S-03', '+91 96351 78420');

insert into beekeepers (id, display_id, name, phone, region, experience, registered_by) values
  ('22222222-2222-2222-2222-222222222101', '#BK-101', 'Provat Mondal', '+91 90512 34567', 'Gosaba Mangrove Belt', '12 Years Registered Mouli', '11111111-1111-1111-1111-111111111101'),
  ('22222222-2222-2222-2222-222222222102', '#BK-102', 'Anupama Sardar', '+91 89621 55210', 'Sagar Island Coastal Grove', '6 Years Registered Mouli', '11111111-1111-1111-1111-111111111101'),
  ('22222222-2222-2222-2222-222222222103', '#BK-103', 'Biswajit Mridha', '+91 97331 90876', 'Kultali Forest Fringe', '4 Years Registered Mouli', '11111111-1111-1111-1111-111111111102'),
  ('22222222-2222-2222-2222-222222222108', '#BK-108', 'Sukumar Bag', '+91 91234 66789', 'Bali Island Buffer Zone', '2 Years Registered Mouli', '11111111-1111-1111-1111-111111111101');

insert into hives (id, display_id, beekeeper_id, location, trust_tier, status, verified_at, verified_by) values
  ('33333333-3333-3333-3333-333333333042', 'HIVE-042', '22222222-2222-2222-2222-222222222101', 'Sundarbans (Pirkhali Forest Block, Zone 2)', 'Lab-Verified', 'Active', now() - interval '10 days', '11111111-1111-1111-1111-111111111101'),
  ('33333333-3333-3333-3333-333333333089', 'HIVE-089', '22222222-2222-2222-2222-222222222103', 'Sundarbans (Jhilla Forest Camp Buffer)', 'Self-Attested', 'Active', null, null),
  ('33333333-3333-3333-3333-333333333022', 'HIVE-022', '22222222-2222-2222-2222-222222222102', 'Sundarbans (Sagar Island, Bakkhali Grove)', 'Lab-Verified', 'Active', now() - interval '15 days', '11111111-1111-1111-1111-111111111101'),
  ('33333333-3333-3333-3333-333333333014', 'HIVE-014', '22222222-2222-2222-2222-222222222108', 'Sundarbans (Netidhopani, Sector 4)', 'Self-Attested', 'Active', null, null);

insert into batches (
  id, display_id, hive_id, collector_id, quantity_kg, harvest_date,
  harvest_timestamp, verification_timestamp, trust_tier, status, is_flagged,
  status_description, crypto_hash
) values
  (
    '44444444-4444-4444-4444-444444448921', '#MK-8921',
    '33333333-3333-3333-3333-333333333042', '11111111-1111-1111-1111-111111111101',
    24.5, '2026-09-18',
    '2026-09-18 07:45:00+05:30', '2026-09-18 11:20:00+05:30',
    'Lab-Verified', 'Audit Passed', false,
    'Consistent Khalsi (Aegiceras corniculatum) and Kewra pollen spectra detected. Yield matches historical hive average for peak Sundarban honey season (Chaitra–Jaistha).',
    'sha256:4f9e8a12bc9033de81c5a1762b90d4e3f6517a20c389be88a6d71b4029ce37ab'
  ),
  (
    '44444444-4444-4444-4444-444444448920', '#MK-8920',
    '33333333-3333-3333-3333-333333333014', '11111111-1111-1111-1111-111111111101',
    182.0, '2026-09-17',
    '2026-09-17 06:15:00+05:30', '2026-09-17 09:30:00+05:30',
    'Self-Attested', 'Flagged for Anomaly Investigation', true,
    'Yield spike detected: Single hive reported 182.0 kg (Threshold >50.0 kg). Potential sugar syrup blending or aggregation fraud flagged for field inspection.',
    'sha256:e87c09312bba74fd09115dca8305c48b291d7912ab09d43efca5519102c918ee'
  ),
  (
    '44444444-4444-4444-4444-444444448919', '#MK-8919',
    '33333333-3333-3333-3333-333333333089', '11111111-1111-1111-1111-111111111102',
    18.0, '2026-09-16',
    '2026-09-16 08:30:00+05:30', '2026-09-16 14:10:00+05:30',
    'Self-Attested', 'Flagged for Anomaly Investigation', true,
    'Missing geolocation cryptographic sync packet during box extraction inside the tiger reserve buffer zone. Optical refractometer reading pending submission.',
    'sha256:7a83d9b012cef811904a62174c89201f99c2d1b7024ea55776a9b13904dd2b55'
  ),
  (
    '44444444-4444-4444-4444-444444448918', '#MK-8918',
    '33333333-3333-3333-3333-333333333022', '11111111-1111-1111-1111-111111111101',
    32.2, '2026-09-15',
    '2026-09-15 07:10:00+05:30', '2026-09-15 10:45:00+05:30',
    'Lab-Verified', 'Audit Passed', false,
    'Moisture content verified at 18.1% (compliant with FSSAI raw honey standards for mangrove-forest honey). Carbon isotope purity test: 99.4% authentic Sundarban mangrove flora (Kewra/Khalsi dominant).',
    'sha256:9b2d4f8812ce00391abf83907c112e457f9011ba28374dcc77610a52003ea614'
  );
