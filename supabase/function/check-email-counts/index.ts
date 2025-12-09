// =============================================================================
// EDGE FUNCTION: CHECK EMAIL COUNTS (MOCK VERSION FOR TESTING)
// =============================================================================
// Returns mock data to test dashboard without IMAP complications
// Replace with real version once IMAP issues are resolved

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DB_TABLES = {
  emailAccounts: 'webchat_email_accounts',
  notificationCounts: 'webchat_notification_counts',
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Starting email count check (MOCK VERSION)...');

    // Fetch email accounts from database
    const emailAccountsResponse = await supabase
      .from(DB_TABLES.emailAccounts)
      .select('*')
      .order('created_at', { ascending: true });

    if (emailAccountsResponse.error) {
      throw new Error(`Failed to fetch email accounts: ${emailAccountsResponse.error.message}`);
    }

    const emailAccounts = emailAccountsResponse.data;

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

    const results = [];
    
    // Generate mock unread counts for each account
    for (const account of emailAccounts) {
      const mockUnreadCount = Math.floor(Math.random() * 20); // Random 0-19
      
      console.log(`✅ ${account.email}: ${mockUnreadCount} unread (MOCK DATA)`);

      // Update notification count in database
      const updateResponse = await supabase
        .from(DB_TABLES.notificationCounts)
        .update({
          unread_count: mockUnreadCount,
          last_checked: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('source_id', account.id)
        .eq('source_type', 'email');

      if (updateResponse.error) {
        console.error(`⚠️ Failed to update count for ${account.email}:`, updateResponse.error.message);
      }

      results.push({
        success: true,
        email: account.email,
        unreadCount: mockUnreadCount,
      });
    }

    const totalUnread = results.reduce((sum, r) => sum + r.unreadCount, 0);

    console.log(`\n✅ Check complete: ${results.length}/${results.length} successful (MOCK)`);
    console.log(`📊 Total unread: ${totalUnread} (MOCK DATA)`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        mock_mode: true,
        summary: {
          total_accounts: results.length,
          successful_checks: results.length,
          failed_checks: 0,
          total_unread: totalUnread,
        },
        results: results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in Edge Function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
