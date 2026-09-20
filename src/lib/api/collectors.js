import { supabase } from '../supabaseClient.js';

export async function listCollectors() {
  const { data, error } = await supabase.from('collectors').select('*').order('name');
  if (error) throw error;
  return data;
}

// The prototype has no auth layer yet, so writes are attributed to whichever
// collector was registered first, standing in for "the logged-in collector".
export async function getDefaultCollector() {
  const { data, error } = await supabase
    .from('collectors')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
