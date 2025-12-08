// =============================================================================
// EDGE FUNCTION: CHECK EMAIL COUNTS
// =============================================================================
// This function checks unread email counts for all configured email accounts
// and updates the webchat_notification_counts table.
//
// Triggered by: GitHub Actions (every 10 minutes)
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { checkEmailUnread, type EmailCredentials, type EmailCheckResult } from './emailProviders.ts';

// Supabase client setup
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database table names
const TABLES = {
  emailAccounts: 'webchat_email_accounts',
  notificationCounts: 'webchat_notification_counts',
};

/**
 * Get email credentials from environment variables
 * Credentials are stored as: EMAIL_PASSWORD_[INDEX] or EMAIL_PASSWORD_[EMAIL_HASH]
 */
function getEmailPassword(email: string, index: number): string | null {
  // Try with index first
  const passwordByIndex = Deno.env.get(`EMAIL_PASSWORD_${index}`);
  if (passwordByIndex) return passwordByIndex;
  
  // Try with email hash (simplified - replace @ and . with _)
  const emailKey = email.replace(/@/g, '_AT_').replace(/\./g, '_DOT_').toUpperCase();
  const passwordByEmail = Deno.env.get(`EMAIL_PASSWORD_${emailKey}`);
  if (passwordByEmail) return passwordByEmail;
  
  return null;
}

/**
 * Main handler function
 */
Deno.serve(async (req: Request) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Starting email count check...');

    // 1. Fetch all email accounts from database
    const { data: emailAccounts, error: fetchError } = await supabase
      .from(TABLES.emailAccounts)
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch email accounts: ${fetchError.message}`);
    }

    if (!emailAccounts || emailAccounts.length === 0) {
      console.log('📭 No email accounts configured');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No email accounts to check',
          results: []
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Found ${emailAccounts.length} email account(s) to check`);

    // 2. Check each email account
    const results: EmailCheckResult[] = [];
    
    for (let i = 0; i < emailAccounts.length; i++) {
      const account = emailAccounts[i];
      console.log(`\n📨 Checking ${i + 1}/${emailAccounts.length}: ${account.email}`);

      // Get password from environment
      const password = getEmailPassword(account.email, i);
      
      if (!password) {
        console.error(`❌ No password found for ${account.email}`);
        results.push({
          success: false,
          email: account.email,
          unreadCount: 0,
          error: 'Password not configured',
        });
        continue;
      }

      // Check email via IMAP
      const credentials: EmailCredentials = {
        email: account.email,
        password: password,
        provider: account.provider,
      };

      const result = await checkEmailUnread(credentials);
      results.push(result);

      if (result.success) {
        console.log(`✅ ${account.email}: ${result.unreadCount} unread`);

        // 3. Update notification count in database
        const { error: updateError } = await supabase
          .from(TABLES.notificationCounts)
          .update({
            unread_count: result.unreadCount,
            last_checked: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('source_id', account.id)
          .eq('source_type', 'email');

        if (updateError) {
          console.error(`⚠️ Failed to update count for ${account.email}:`, updateError.message);
        }
      } else {
        console.error(`❌ ${account.email}: ${result.error}`);
      }
    }

    // 4. Return results
    const successCount = results.filter(r => r.success).length;
    const totalUnread = results.reduce((sum, r) => sum + r.unreadCount, 0);

    console.log(`\n✅ Check complete: ${successCount}/${results.length} successful`);
    console.log(`📊 Total unread: ${totalUnread}`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        summary: {
          total_accounts: results.length,
          successful_checks: successCount,
          failed_checks: results.length - successCount,
          total_unread: totalUnread,
        },
        results: results,
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in Edge Function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
});
