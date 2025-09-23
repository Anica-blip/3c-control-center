import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// SINGLE Supabase client instance - no duplicates
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => Boolean(supabaseUrl && supabaseAnonKey)

// Log configuration status
if (supabaseUrl && supabaseAnonKey) {
  console.log('Supabase client created successfully (SINGLE INSTANCE)')
} else {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    urlValue: supabaseUrl ? 'set' : 'missing',
    keyValue: supabaseAnonKey ? 'set' : 'missing'
  })
}
