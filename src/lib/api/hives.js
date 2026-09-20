import { supabase } from '../supabaseClient.js';

const SELECT_WITH_BEEKEEPER = '*, beekeeper:beekeepers(id, display_id, name, region)';

export async function listHives() {
  const { data, error } = await supabase
    .from('hives')
    .select(SELECT_WITH_BEEKEEPER)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addHive({ beekeeperId, location }) {
  const { data, error } = await supabase
    .from('hives')
    .insert({ beekeeper_id: beekeeperId, location: location || undefined })
    .select(SELECT_WITH_BEEKEEPER)
    .single();
  if (error) throw error;
  return data;
}

export async function verifyHive({ hiveId, trustTier, verifiedBy }) {
  const { data, error } = await supabase
    .from('hives')
    .update({
      trust_tier: trustTier,
      verified_at: new Date().toISOString(),
      verified_by: verifiedBy ?? null,
    })
    .eq('id', hiveId)
    .select(SELECT_WITH_BEEKEEPER)
    .single();
  if (error) throw error;
  return data;
}

// Non-consuming read of the hive display-id sequence via a security-definer
// RPC, so the "next auto ID" preview doesn't burn a sequence value just by
// rendering the form.
export async function previewNextHiveDisplayId() {
  const { data, error } = await supabase.rpc('next_hive_display_id_preview');
  if (error) throw error;
  return data;
}
