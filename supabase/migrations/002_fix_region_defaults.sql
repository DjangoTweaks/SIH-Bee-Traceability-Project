-- Fixes a schema bug: beekeepers.region and hives.location still defaulted
-- to 'Mahabaleshwar ...' at the database level even after the app switched
-- to the Sundarbans theme, because only schema.sql (used for fresh installs)
-- was updated — the already-running database's column defaults were never
-- migrated. Confirmed live: hives HIVE-043 through HIVE-046, added via the
-- Cluster Collector "Add a hive" form (which doesn't collect a location),
-- silently picked up "Mahabaleshwar Field Cluster" from this stale default.
--
-- Already included in reset_and_reseed_sundarbans.sql — only run this file
-- standalone if you don't also want to wipe/reseed data right now.

alter table beekeepers alter column region set default 'Sundarbans';
alter table hives alter column location set default 'Sundarban Mangrove Cluster';
