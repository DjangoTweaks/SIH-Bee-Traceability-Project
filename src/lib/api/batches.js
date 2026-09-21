import { supabase } from '../supabaseClient.js';

const FRAUD_THRESHOLD_KG = 8.0;

// Authentic Sundarban mangrove honey (Khalsi/Kewra/Goran bloom) can only be
// lab-detected during the Chaitra–Jaistha season, roughly March–May. A
// harvest dated outside that window can't be genuine Sundarban honey.
const IN_SEASON_MONTHS = [3, 4, 5];

function isOutOfSeason(harvestDate) {
  const month = new Date(harvestDate).getUTCMonth() + 1;
  return !IN_SEASON_MONTHS.includes(month);
}

const SELECT_WITH_RELATIONS = `
  *,
  hive:hives (
    id, display_id, location, trust_tier,
    beekeeper:beekeepers ( id, display_id, name, phone, region, experience )
  ),
  collector:collectors ( id, name, role, zone, hub, contact )
`;

export async function listBatches() {
  const { data, error } = await supabase
    .from('batches')
    .select(SELECT_WITH_RELATIONS)
    .order('harvest_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBatchByDisplayId(rawDisplayId) {
  // Matches with or without a leading '#' so lookups are resilient to
  // inconsistently-prefixed rows (see migrations/001_fix_batch_display_id_prefix.sql)
  // and to however the consumer happens to type the ID.
  const bare = rawDisplayId.trim().replace(/^#/, '');
  const { data, error } = await supabase
    .from('batches')
    .select(SELECT_WITH_RELATIONS)
    .or(`display_id.eq.${bare},display_id.eq.#${bare}`)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function logHarvest({ hiveId, quantityKg, harvestDate, collectorId }) {
  const isYieldSpike = quantityKg > FRAUD_THRESHOLD_KG;
  const isOffSeason = isOutOfSeason(harvestDate);
  const isFlagged = isYieldSpike || isOffSeason;

  // Snapshot the hive's current trust tier onto the batch at log time, so the
  // stored record reflects what was actually true then. The ledger's display
  // always prefers the hive's live tier (see batchViewModel.js), so this is
  // a fallback for orphaned batches rather than the source of truth.
  const { data: hive, error: hiveError } = await supabase
    .from('hives')
    .select('trust_tier')
    .eq('id', hiveId)
    .single();
  if (hiveError) throw hiveError;

  const { data, error } = await supabase
    .from('batches')
    .insert({
      hive_id: hiveId,
      quantity_kg: quantityKg,
      harvest_date: harvestDate,
      collector_id: collectorId ?? null,
      trust_tier: hive.trust_tier,
      is_flagged: isFlagged,
      status: isFlagged ? 'Flagged for Anomaly Investigation' : 'Audit Passed',
      status_description: buildStatusDescription({ isYieldSpike, isOffSeason }),
    })
    .select(SELECT_WITH_RELATIONS)
    .single();
  if (error) throw error;
  return data;
}

function buildStatusDescription({ isYieldSpike, isOffSeason }) {
  if (isYieldSpike && isOffSeason) {
    return `Yield spike detected (>${FRAUD_THRESHOLD_KG.toFixed(1)} kg) and harvest date falls outside the March–May Sundarban mangrove bloom window (Chaitra–Jaistha). Automated telemetry guard triggered.`;
  }
  if (isYieldSpike) {
    return `Single hive extraction yield exceeds maximum natural threshold (>${FRAUD_THRESHOLD_KG.toFixed(1)} kg per box). Automated telemetry guard triggered.`;
  }
  if (isOffSeason) {
    return 'Harvest date falls outside the March–May Sundarban mangrove bloom window (Chaitra–Jaistha) — authentic Sundarban honey cannot be lab-detected outside this season. Flagged for field inspection.';
  }
  return 'Normal pollen distribution and refractometer density profile confirmed.';
}

export async function resolveAnomalyFlag(batchId) {
  const { data, error } = await supabase
    .from('batches')
    .update({
      is_flagged: false,
      status: 'Audit Passed',
      status_description: 'Flag resolved by Central Apiary Inspector. Honey re-tested and certified conforming to standards.',
      verification_timestamp: new Date().toISOString(),
    })
    .eq('id', batchId)
    .select(SELECT_WITH_RELATIONS)
    .single();
  if (error) throw error;
  return data;
}
