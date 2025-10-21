// Node.js-only config for Render cron jobs
import { createClient } from '@supabase/supabase-js'

// ✅ Node.js environment variables (process.env)
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

// SINGLE Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,  // ✅ No session persistence needed for cron jobs
    autoRefreshToken: false, // ✅ No token refresh needed for cron jobs
    detectSessionInUrl: false // ✅ No URL detection needed for cron jobs
  }
})

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => Boolean(supabaseUrl && supabaseAnonKey)

// Log configuration status
if (supabaseUrl && supabaseAnonKey) {
  console.log('Supabase client created successfully (Node.js/Render)')
} else {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    urlValue: supabaseUrl ? 'set' : 'missing',
    keyValue: supabaseAnonKey ? 'set' : 'missing'
  })
}
