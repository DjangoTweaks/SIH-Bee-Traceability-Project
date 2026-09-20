-- Fixes a schema bug: batches.display_id was defaulting to 'MK-1234'
-- instead of '#MK-1234' (unlike beekeepers' '#BK-...' default), so any
-- batch logged through the app before this migration is missing its '#'.
-- That silently broke Batch Verification lookups for those batches, since
-- the app always searched for the '#'-prefixed form.
--
-- Run this once in the Supabase SQL editor.

-- 1. Fix the column default so future auto-generated batches match.
alter table batches
  alter column display_id set default ('#MK-' || nextval('batch_display_seq')::text);

-- 2. Backfill existing rows that were created without the '#'.
update batches
set display_id = '#' || display_id
where display_id not like '#%';
