// /src/schedulecomponent/config.ts - FIXED with consistent environment variables
import { createClient } from '@supabase/supabase-js';

// Use consistent environment variable names to match supabaseAPI.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Validate environment variables
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  console.error('Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable');
}

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper function to check if Supabase is configured correctly
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey);
};

// Log configuration status for debugging
if (isSupabaseConfigured()) {
  console.log('Supabase client configured successfully for Schedule Manager');
} else {
  console.error('Supabase configuration incomplete:', {
    hasUrl: Boolean(supabaseUrl),
    hasKey: Boolean(supabaseKey)
  });
}
