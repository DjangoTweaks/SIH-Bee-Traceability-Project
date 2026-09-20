-- Madhukosh Apiary & Traceability Network — database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
--
-- Entities:
--   collectors  — cluster collector / regional verification leads
--   beekeepers  — apiary partners registered by a collector
--   hives       — smart hive boxes provisioned for a beekeeper
--   batches     — individual harvest extractions logged against a hive
--
-- Human-readable display IDs (BK-101, HIVE-042, MK-8921) are generated
-- server-side via sequences + triggers so concurrent inserts never collide,
-- and the app never has to guess the "next" number on the client.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Sequences backing the human-readable IDs
-- ---------------------------------------------------------------------------
create sequence if not exists beekeeper_display_seq start with 104; -- BK-101..103 pre-exist (seed data)
create sequence if not exists hive_display_seq start with 43;       -- HIVE-001..042 pre-exist
create sequence if not exists batch_display_seq start with 8922;    -- MK-8918..8921 pre-exist

-- ---------------------------------------------------------------------------
-- collectors
-- ---------------------------------------------------------------------------
create table if not exists collectors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  zone text not null,
  hub text not null,
  contact text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- beekeepers
-- ---------------------------------------------------------------------------
create table if not exists beekeepers (
  id uuid primary key default gen_random_uuid(),
  display_id text unique not null default ('#BK-' || nextval('beekeeper_display_seq')::text),
  name text not null,
  phone text not null,
  region text not null default 'Sundarbans',
  experience text,
  registered_by uuid references collectors(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- hives
-- ---------------------------------------------------------------------------
create table if not exists hives (
  id uuid primary key default gen_random_uuid(),
  display_id text unique not null default ('HIVE-' || lpad(nextval('hive_display_seq')::text, 3, '0')),
  beekeeper_id uuid references beekeepers(id) on delete set null,
  location text not null default 'Sundarban Mangrove Cluster',
  trust_tier text not null default 'Self-Attested' check (trust_tier in ('Lab-Verified', 'Self-Attested')),
  status text not null default 'Active',
  verified_at timestamptz,
  verified_by uuid references collectors(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists hives_beekeeper_id_idx on hives (beekeeper_id);

-- ---------------------------------------------------------------------------
-- batches (harvest logs)
-- ---------------------------------------------------------------------------
create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  display_id text unique not null default ('#MK-' || nextval('batch_display_seq')::text),
  hive_id uuid references hives(id) on delete set null,
  collector_id uuid references collectors(id) on delete set null,
  quantity_kg numeric(8, 2) not null check (quantity_kg > 0),
  harvest_date date not null,
  harvest_timestamp timestamptz not null default now(),
  verification_timestamp timestamptz,
  trust_tier text not null default 'Lab-Verified' check (trust_tier in ('Lab-Verified', 'Self-Attested')),
  status text not null default 'Audit Passed',
  is_flagged boolean not null default false,
  status_description text,
  crypto_hash text not null default ('sha256:' || encode(gen_random_bytes(32), 'hex')),
  created_at timestamptz not null default now()
);

create index if not exists batches_hive_id_idx on batches (hive_id);
create index if not exists batches_is_flagged_idx on batches (is_flagged);

-- Auto-flag any batch whose yield exceeds the anomaly threshold (50kg),
-- mirroring the fraud-detection rule from the original prototype.
create or replace function batches_apply_fraud_guard()
returns trigger as $$
begin
  if new.quantity_kg > 50.0 and new.is_flagged is distinct from true then
    new.is_flagged := true;
    if new.status = 'Audit Passed' or new.status is null then
      new.status := 'Flagged for Anomaly Investigation';
    end if;
    if new.status_description is null then
      new.status_description := 'Single hive extraction yield exceeds maximum natural threshold (>50kg per box). Automated telemetry guard triggered.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_batches_fraud_guard on batches;
create trigger trg_batches_fraud_guard
  before insert on batches
  for each row execute function batches_apply_fraud_guard();

-- ---------------------------------------------------------------------------
-- Next hive-ID preview
--
-- Reads the hive sequence's current position without consuming a value
-- (unlike nextval), so the "Add a hive" form can show what ID will be
-- assigned on save. security definer lets the anon role call it without
-- needing direct SELECT/USAGE grants on the sequence itself.
-- ---------------------------------------------------------------------------
create or replace function next_hive_display_id_preview()
returns text
language sql
security definer
set search_path = public
as $$
  select 'HIVE-' || lpad((last_value + case when is_called then 1 else 0 end)::text, 3, '0')
  from hive_display_seq;
$$;

grant execute on function next_hive_display_id_preview() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- This prototype runs with no authentication layer yet, so every table is
-- open to the anon key for read/insert/update. Tighten these policies (e.g.
-- scope writes to authenticated collector/admin roles) before going beyond
-- an internal prototype.
-- ---------------------------------------------------------------------------
alter table collectors enable row level security;
alter table beekeepers enable row level security;
alter table hives enable row level security;
alter table batches enable row level security;

drop policy if exists "public read collectors" on collectors;
create policy "public read collectors" on collectors for select using (true);

drop policy if exists "public read beekeepers" on beekeepers;
create policy "public read beekeepers" on beekeepers for select using (true);
drop policy if exists "public insert beekeepers" on beekeepers;
create policy "public insert beekeepers" on beekeepers for insert with check (true);

drop policy if exists "public read hives" on hives;
create policy "public read hives" on hives for select using (true);
drop policy if exists "public insert hives" on hives;
create policy "public insert hives" on hives for insert with check (true);
drop policy if exists "public update hives" on hives;
create policy "public update hives" on hives for update using (true) with check (true);

drop policy if exists "public read batches" on batches;
create policy "public read batches" on batches for select using (true);
drop policy if exists "public insert batches" on batches;
create policy "public insert batches" on batches for insert with check (true);
drop policy if exists "public update batches" on batches;
create policy "public update batches" on batches for update using (true) with check (true);
