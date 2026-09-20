import { formatDateTime, formatQuantity } from './format.js';

const FRAUD_THRESHOLD_KG = 50.0;

// Maps a raw Supabase `batches` row (joined with hive/beekeeper/collector)
// into the flat shape the UI templates expect.
export function toBatchViewModel(batch) {
  const hive = batch.hive || {};
  const beekeeper = hive.beekeeper || {};
  const collector = batch.collector || {};

  return {
    id: batch.id,
    batchId: batch.display_id,
    hiveId: hive.display_id || '—',
    hiveLocation: hive.location || 'Sundarban Mangrove Cluster',
    quantityKg: Number(batch.quantity_kg),
    quantity: formatQuantity(batch.quantity_kg),
    isYieldSpike: Number(batch.quantity_kg) > FRAUD_THRESHOLD_KG,
    harvestDate: batch.harvest_date,
    harvestTimestamp: formatDateTime(batch.harvest_timestamp),
    verificationTimestamp: formatDateTime(batch.verification_timestamp),
    // Trust tier is a live property of the hive's sensor/attestation status,
    // not a per-batch snapshot — so re-verifying a hive on the Cluster
    // Collector screen immediately reflects on every batch from that hive,
    // past or future. Falls back to the batch's own column for orphaned
    // batches whose hive has been deleted.
    trustTier: hive.trust_tier || batch.trust_tier,
    status: batch.status,
    isFlagged: batch.is_flagged,
    statusDescription: batch.status_description || 'Standard telemetry recorded on decentralized apiary ledger.',
    beekeeper: {
      name: beekeeper.name || 'Unregistered',
      id: beekeeper.display_id || '—',
      phone: beekeeper.phone || '—',
      experience: beekeeper.experience || 'Registered Beekeeper',
      region: beekeeper.region || 'Sundarbans',
    },
    collector: {
      name: collector.name || 'Unassigned',
      role: collector.role || '—',
      zone: collector.zone || '—',
      hub: collector.hub || '—',
      contact: collector.contact || '—',
    },
    cryptoHash: batch.crypto_hash,
  };
}
