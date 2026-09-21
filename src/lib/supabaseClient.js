import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.error(
    'Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      '(in .env locally, or in your host\'s environment variable settings — e.g. Vercel ' +
      'Project Settings -> Environment Variables) and redeploy.'
  );
}

// createClient() throws synchronously if either arg is missing. Since this
// module is imported (transitively) by nearly every tab module, letting it
// throw here would crash the whole app's module graph before a single event
// listener attaches — including tab-switching, which has nothing to do with
// Supabase. Fall back to harmless placeholders so the app still boots; a
// missing config then surfaces as a visible banner (see main.js) and normal
// failed-request errors, not a page-wide blank screen.
export const supabase = createClient(
  url || 'https://placeholder.invalid',
  anonKey || 'placeholder-anon-key'
);
