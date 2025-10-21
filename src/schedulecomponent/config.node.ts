// Node.js-only config for Render cron jobs - DIRECT POSTGRES CONNECTION
import { createClient } from '@supabase/supabase-js'

// ✅ PREFERRED: Direct Postgres connection for server cron
const supabaseDbUrl = process.env.SUPABASE_DB_URL || ''

// ✅ FALLBACK: Supabase client with service role (if not using direct Postgres)
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Validation
if (!supabaseDbUrl && (!supabaseUrl || !supabaseServiceRoleKey)) {
  console.error('Missing required environment variables:')
  console.error('  SUPABASE_DB_URL (preferred):', supabaseDbUrl ? 'SET' : 'MISSING')
  console.error('  OR')
  console.error('  SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'SET' : 'MISSING')
  throw new Error('Server-side database credentials not configured')
}

// ✅ Use Supabase client (works with both direct DB and service role)
export const supabase = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null

if (supabaseDbUrl) {
  console.log('Using DIRECT POSTGRES connection (preferred)')
  console.log('  DB URL:', supabaseDbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@'))
} else if (supabase) {
  console.log('Using Supabase client with SERVICE_ROLE_KEY')
  console.log('  URL:', supabaseUrl)
}

// Export DB URL for direct Postgres queries if needed
export const dbUrl = supabaseDbUrl
