// Node.js-only config for Render cron jobs
import { createClient } from '@supabase/supabase-js'

// ✅ Works with either VITE_* variables (existing) OR server-side variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  console.error('  URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('  Key:', supabaseKey ? 'SET' : 'MISSING')
}

// SINGLE Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

console.log('Supabase client created successfully (Node.js/Render)')
