// Node.js-only config for Render cron jobs
import { createClient } from '@supabase/supabase-js'

// ✅ SERVER-SIDE environment variables (following Supabase AI instructions)
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseDbUrl = process.env.SUPABASE_DB_URL || ''

// Log what we're using
if (supabaseDbUrl) {
  console.log('SUPABASE_DB_URL found (preferred for server cron):', supabaseDbUrl.replace(/:[^:@]+@/, ':****@'))
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials:')
  console.error('  SUPABASE_DB_URL:', supabaseDbUrl ? 'SET' : 'MISSING')
  console.error('  SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'SET' : 'MISSING')
  throw new Error('Server-side Supabase credentials not configured')
}

// SINGLE Supabase client instance with SERVICE ROLE KEY
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

console.log('Supabase client created successfully (Node.js/Render - Service Role)')

console.log('Supabase client created successfully (Node.js/Render)')
