import { supabase } from '../supabaseClient.js';

export async function listBeekeepers() {
  const { data, error } = await supabase
    .from('beekeepers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function registerBeekeeper({ name, phone, region, registeredBy }) {
  const { data, error } = await supabase
    .from('beekeepers')
    .insert({ name, phone, region, registered_by: registeredBy ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}
