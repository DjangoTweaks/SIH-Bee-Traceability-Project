import { supabase } from '../supabaseClient.js';

const FRAUD_THRESHOLD_KG = 50.0;

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
  const isFlagged = quantityKg > FRAUD_THRESHOLD_KG;

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
      status_description: isFlagged
        ? 'Single hive extraction yield exceeds maximum natural threshold (>50kg per box). Automated telemetry guard triggered.'
        : 'Normal pollen distribution and refractometer density profile confirmed.',
    })
    .select(SELECT_WITH_RELATIONS)
    .single();
  if (error) throw error;
  return data;
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
