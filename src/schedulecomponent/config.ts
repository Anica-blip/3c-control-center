// Repo path: src/schedulecomponent/config.ts
// The Supabase client now comes from the one shared client (src/lib/supabaseClient.ts),
// so it carries the owner's sign-in. Do not create a client here.
export { supabase } from '../lib/supabaseClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => Boolean(supabaseUrl && supabaseAnonKey)

// Log configuration status
if (supabaseUrl && supabaseAnonKey) {
  console.log('Supabase client ready (shared instance)')
} else {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    urlValue: supabaseUrl ? 'set' : 'missing',
    keyValue: supabaseAnonKey ? 'set' : 'missing'
  })
}
