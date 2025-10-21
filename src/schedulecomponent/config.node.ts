// Node.js-only config for Render cron jobs
import { createClient } from '@supabase/supabase-js'

// ✅ SERVER-SIDE environment variables (following Supabase AI instructions)
const supabaseDbUrl = process.env.SUPABASE_DB_URL || ''
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Log what we're using
if (supabaseDbUrl) {
  console.log('SUPABASE_DB_URL found (preferred for server cron):', supabaseDbUrl.replace(/:[^:@]+@/, ':****@'))
}

// Validation: Need EITHER DB URL OR (URL + Service Role Key)
if (!supabaseDbUrl && (!supabaseUrl || !supabaseServiceRoleKey)) {
  console.error('Missing Supabase credentials:')
  console.error('  SUPABASE_DB_URL:', supabaseDbUrl ? 'SET' : 'MISSING')
  console.error('  OR')
  console.error('  SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'SET' : 'MISSING')
  throw new Error('Server-side Supabase credentials not configured')
}

// Use URL + Service Role Key for Supabase client (DB URL is used elsewhere if needed)
const finalUrl = supabaseUrl || supabaseDbUrl.replace(/^postgres:\/\//, 'https://').split('@')[1]?.split('/')[0] || ''
const finalKey = supabaseServiceRoleKey

if (!finalUrl || !finalKey) {
  throw new Error('Cannot create Supabase client with available credentials')
}

// SINGLE Supabase client instance with SERVICE ROLE KEY
export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

console.log('Supabase client created successfully (Node.js/Render - Service Role)')
