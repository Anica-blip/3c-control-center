// Repo path: src/lib/supabaseClient.ts
// =============================================================================
// THE ONE SUPABASE CLIENT FOR THE DASHBOARD (3c-control-center)
// =============================================================================
// Every component imports `supabase` from here. Do not call createClient anywhere else.
//
// Why: the dashboard is owner-only. The owner signs in with GitHub through Supabase,
// and that sign-in (the session) is kept under the name below. If a component made its
// own client, that client would not see the session and every read, save and upload
// would reach Supabase as a visitor, which the owner-only rules refuse.
//
// Only the Supabase URL and the public key are used here. No secrets.
// =============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Session name. Pattern from the Standard (section C / G): sb-<app>-login.
export const OWNER_SESSION_KEY = 'sb-3c-control-center-owner-login';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: OWNER_SESSION_KEY
  }
});

// True when the URL and the public key are both present in the build.
export const isSupabaseConfigured = (): boolean => Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase settings: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
}
