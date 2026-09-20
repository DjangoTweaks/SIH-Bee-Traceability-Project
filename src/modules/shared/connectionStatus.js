import { supabase } from '../../lib/supabaseClient.js';

export async function checkConnection() {
  const dot = document.getElementById('connection-dot');
  if (!dot) return;
  const { error } = await supabase.from('collectors').select('id').limit(1);
  if (error) {
    dot.className = 'w-2 h-2 rounded-full bg-rose-500';
    dot.closest('[title]')?.setAttribute('title', `Supabase connection error: ${error.message}`);
  } else {
    dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
  }
}
