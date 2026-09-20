-- Seed data mirroring the original static prototype (legacy/code.html)
-- so the refactored app looks identical on first run. Run after schema.sql.

insert into collectors (id, name, role, zone, hub, contact) values
  ('11111111-1111-1111-1111-111111111101', 'Anand Shinde', 'Cluster Lead — Western Ghats South', 'Mahabaleshwar Plateau Cluster', 'Assigned Hub #C-04', '+91 94211 88421'),
  ('11111111-1111-1111-1111-111111111102', 'Pooja Kulkarni', 'Cluster Lead — Foothill Flora & Reserves', 'Mahabaleshwar Forest Reserve', 'Assigned Hub #C-02', '+91 98600 55123')
on conflict (id) do nothing;

insert into beekeepers (id, display_id, name, phone, region, experience, registered_by) values
  ('22222222-2222-2222-2222-222222222101', '#BK-101', 'Ramesh Patil', '+91 98220 12345', 'Mahabaleshwar Plateau Flora', '8 Years Apiary Partner', '11111111-1111-1111-1111-111111111101'),
  ('22222222-2222-2222-2222-222222222102', '#BK-102', 'Sunita Deshmukh', '+91 94235 67890', 'East Orchard Micro-climate', '5 Years Apiary Partner', '11111111-1111-1111-1111-111111111101'),
  ('22222222-2222-2222-2222-222222222103', '#BK-103', 'Kiran Shinde', '+91 97631 88902', 'Forest Reserve Sanctuary Zone', '3 Years Apiary Partner', '11111111-1111-1111-1111-111111111102'),
  ('22222222-2222-2222-2222-222222222108', '#BK-108', 'Suresh Deshmukh', '+91 98902 44719', 'Mahabaleshwar Valley Unit', '1 Year Apiary Partner', '11111111-1111-1111-1111-111111111101')
on conflict (id) do nothing;

insert into hives (id, display_id, beekeeper_id, location, trust_tier, status, verified_at, verified_by) values
  ('33333333-3333-3333-3333-333333333042', 'HIVE-042', '22222222-2222-2222-2222-222222222101', 'Mahabaleshwar (Plateau Flora, Zone 3)', 'Lab-Verified', 'Active', now() - interval '10 days', '11111111-1111-1111-1111-111111111101'),
  ('33333333-3333-3333-3333-333333333089', 'HIVE-089', '22222222-2222-2222-2222-222222222103', 'Mahabaleshwar (Forest Reserve Buffer)', 'Self-Attested', 'Active', null, null),
  ('33333333-3333-3333-3333-333333333022', 'HIVE-022', '22222222-2222-2222-2222-222222222102', 'Mahabaleshwar (East Orchard Belt)', 'Lab-Verified', 'Active', now() - interval '15 days', '11111111-1111-1111-1111-111111111101'),
  ('33333333-3333-3333-3333-333333333014', 'HIVE-014', '22222222-2222-2222-2222-222222222108', 'Mahabaleshwar (Valley Unit Sector 2)', 'Self-Attested', 'Active', null, null)
on conflict (id) do nothing;

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
    'Consistent floral pollen spectra detected. Yield matches historical hive average for late-monsoon blooms.',
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
    'Missing geolocation cryptographic sync packet during box extraction. Optical refractometer reading pending submission.',
    'sha256:7a83d9b012cef811904a62174c89201f99c2d1b7024ea55776a9b13904dd2b55'
  ),
  (
    '44444444-4444-4444-4444-444444448918', '#MK-8918',
    '33333333-3333-3333-3333-333333333022', '11111111-1111-1111-1111-111111111101',
    32.2, '2026-09-15',
    '2026-09-15 07:10:00+05:30', '2026-09-15 10:45:00+05:30',
    'Lab-Verified', 'Audit Passed', false,
    'Moisture content verified at 17.4% (compliant with FSSAI raw honey standards). Carbon isotope purity test: 99.2% authentic flora.',
    'sha256:9b2d4f8812ce00391abf83907c112e457f9011ba28374dcc77610a52003ea614'
  )
on conflict (id) do nothing;
