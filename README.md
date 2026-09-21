# Madhukosh — Apiary & Traceability Network

A working prototype of the Madhukosh honey-traceability portal: cluster
collectors register beekeepers and hives, beekeepers log harvests, an admin
dashboard surfaces the batch ledger with fraud flagging, and consumers can
verify a bottle's provenance by Batch ID. Backed by Supabase (Postgres) for
persistence.

The original static mockup lives in [`legacy/code.html`](legacy/code.html) —
a single 887-line file with everything (markup, mock data, event handlers)
inlined. This app is the same UI and behavior, refactored into ES modules per
tab and wired to a real database.

## Stack

- Vanilla JS (ES modules) + [Vite](https://vitejs.dev) — no framework, matches the original's simplicity
- Tailwind CSS via CDN (same as the original mockup)
- [Supabase](https://supabase.com) (Postgres + PostgREST) for data

No authentication layer yet — see "Known limitations" below.

## Project structure

```
index.html                   Static shell: header/nav, section containers, modal chrome
src/
  main.js                    Entry point — boots nav, modal, connection check
  styles/main.css            Honeycomb background + flagged-row styles
  lib/
    supabaseClient.js        Supabase client (reads VITE_SUPABASE_* env vars)
    eventBus.js               Tiny pub/sub so tabs can react to each other's writes
    format.js                 Date/quantity formatting helpers
    batchViewModel.js         Maps a raw Supabase batch row -> UI-friendly shape
    api/
      collectors.js           Collector reads
      beekeepers.js            Beekeeper reads/writes
      hives.js                 Hive reads/writes + next-ID preview RPC
      batches.js               Batch reads/writes (harvest logging, lookups, flag resolution)
  modules/
    nav.js                     Tab router: shows/hides sections, lazy-mounts each tab once
    admin/admin.js              Admin Dashboard tab: batch ledger table + audit actions
    collector/collector.js      Cluster Collector tab: register beekeeper / add hive / verify hive
    beekeeper/beekeeper.js      Harvest Logging tab: log a harvest
    verification/verification.js Batch Verification tab: consumer batch lookup
    shared/
      auditModal.js             The one audit-detail modal, reused by Admin + Verification
      batchDetails.js            HTML template for the modal's rich content
      statusBox.js                Inline form success/error banners
      connectionStatus.js         Header dot reflecting live Supabase connectivity
supabase/
  schema.sql                  Tables, sequences, fraud-guard trigger, RLS policies
  seed.sql                    Sundarbans-region example beekeepers/hives/batches
  reset.sql                   Wipes all rows and resets auto-ID sequences (run before re-seeding)
  reset_and_reseed_sundarbans.sql   Recommended: reset.sql + defaults fix + seed.sql, in one paste
  migrations/
    001_fix_batch_display_id_prefix.sql   One-off fix for a batch-ID formatting bug (see git history)
    002_fix_region_defaults.sql           One-off fix for stale Mahabaleshwar column defaults
legacy/
  code.html, screen.png       Original static prototype, kept for reference
```

Each tab module owns its DOM wiring and Supabase calls; cross-tab updates
(e.g. a new hive should appear in the harvest-logging dropdown) go through
`lib/eventBus.js` rather than modules reaching into each other's DOM.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

`.env` is already populated with the project you gave me:

```
VITE_SUPABASE_URL=https://cljxvdqcnverxlzwrril.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

(`.env` is gitignored — `.env.example` shows the shape for a fresh clone.)

### 3. Run the database schema

**This is the one step I can't do for you** — I only have the anon/public
key, which can't run DDL. In the [Supabase SQL Editor](https://supabase.com/dashboard/project/cljxvdqcnverxlzwrril/sql/new):

1. Paste and run all of [`supabase/schema.sql`](supabase/schema.sql) — creates the
   `collectors`, `beekeepers`, `hives`, `batches` tables, the auto-ID sequences,
   the fraud-guard trigger, and RLS policies.
2. Paste and run all of [`supabase/seed.sql`](supabase/seed.sql) — inserts example
   Sundarbans-region beekeepers ("Moulis"), hives, and batches (Provat Mondal,
   HIVE-042, #MK-8921, etc.) so the app has data to show on first load.

To wipe all data and reseed with a clean Sundarbans dataset in one go (e.g.
after testing has left stray/leftover rows), run
[`supabase/reset_and_reseed_sundarbans.sql`](supabase/reset_and_reseed_sundarbans.sql)
instead — it fixes the `region`/`location` column defaults (an earlier bug
let these still default to `'Mahabaleshwar ...'` at the DB level even after
the app code was updated), truncates every table, resets the auto-ID
sequences, and inserts the full Sundarbans seed set, all in one paste.
(`reset.sql` and `seed.sql` still exist separately if you want to run those
steps independently.)

### 4. Run the app

```bash
npm run dev
```

Open the printed local URL. The dot next to the nav turns green once it can
reach Supabase, red if the schema hasn't been applied yet or credentials are
wrong.

## Data model

| Table        | Purpose                                                            | Human-readable ID |
|--------------|---------------------------------------------------------------------|--------------------|
| `collectors` | Cluster collectors / regional verification leads                  | —                  |
| `beekeepers` | Apiary partners, registered by a collector                        | `#BK-101`          |
| `hives`      | Smart hive boxes provisioned for a beekeeper                      | `HIVE-042`         |
| `batches`    | Individual harvest extractions logged against a hive              | `#MK-8921`         |

Display IDs (`BK-`, `HIVE-`, `MK-` prefixes) are assigned server-side via
Postgres sequences + column defaults, so concurrent inserts never collide and
the client never has to guess the next number. A `before insert` trigger on
`batches` also enforces the >50kg fraud-flag rule at the database layer, as a
backstop in case a write ever bypasses the app's own check.

RLS is enabled on every table with permissive anon policies (read everywhere,
write on `beekeepers`/`hives`/`batches`) since there's no auth yet — see
"Known limitations".

## Known limitations (by design, for this pass)

- **No authentication.** Tabs are open navigation, like the original mockup.
  All writes are attributed to whichever collector was registered first
  (`getDefaultCollector()`), standing in for "the logged-in collector". Once
  real auth is added, RLS policies in `schema.sql` should be tightened to
  scope writes to authenticated roles.
- **No pagination** on the batches table — fine for a prototype, would need
  it before a large ledger.
- **"Download Traceability Report" / "Generate PDF"** actions are `alert()`
  stubs, same as the original mockup — no PDF generation is wired up.
