-- Wipes all Madhukosh data and resets the auto-ID sequences back to their
-- original starting points (see schema.sql). Run this in the Supabase SQL
-- editor whenever you want a clean slate before re-seeding, e.g. with
-- seed.sql's Sundarbans dataset.
--
-- This does NOT drop the tables/functions/policies themselves — it only
-- clears rows. Re-run schema.sql instead if you need to rebuild the schema
-- from scratch.

truncate table batches, hives, beekeepers, collectors cascade;

alter sequence beekeeper_display_seq restart with 104;
alter sequence hive_display_seq restart with 43;
alter sequence batch_display_seq restart with 8922;
