import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client - SINGLE INSTANCE with proper typing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  console.log('Supabase client created successfully (schedule component instance)');
} else {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseKey,
    urlValue: supabaseUrl ? 'set' : 'missing',
    keyValue: supabaseKey ? 'set' : 'missing'
  });
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => Boolean(supabase && supabaseUrl && supabaseKey);

// Type-safe helper to get supabase client
const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  return supabase;
};

// Export supabase for schedule component APIs
export { supabase };
