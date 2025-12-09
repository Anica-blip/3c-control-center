// =============================================================================
// EDGE FUNCTION: CHECK EMAIL COUNTS (SINGLE FILE VERSION)
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// =============================================================================
// EMAIL PROVIDERS - IMAP LOGIC
// =============================================================================

interface EmailProviderConfig {
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
}

interface EmailCredentials {
  email: string;
  password: string;
  provider: 'gmail' | 'mailcom' | 'other';
}

interface EmailCheckResult {
  success: boolean;
  email: string;
  unreadCount: number;
  error?: string;
}

const EMAIL_PROVIDERS: Record<string, EmailProviderConfig> = {
  gmail: {
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecure: true,
  },
  mailcom: {
    imapHost: 'imap.mail.com',
    imapPort: 993,
    imapSecure: true,
  },
};

async function checkGmailUnread(email: string, password: string): Promise<EmailCheckResult> {
  try {
    const config = EMAIL_PROVIDERS.gmail;
    const unreadCount = await getImapUnreadCount(config.imapHost, config.imapPort, email, password);
    return { success: true, email, unreadCount };
  } catch (error) {
    console.error(`Error checking Gmail (${email}):`, error);
    return {
      success: false,
      email,
      unreadCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkMailcomUnread(email: string, password: string): Promise<EmailCheckResult> {
  try {
    const config = EMAIL_PROVIDERS.mailcom;
    const unreadCount = await getImapUnreadCount(config.imapHost, config.imapPort, email, password);
    return { success: true, email, unreadCount };
  } catch (error) {
    console.error(`Error checking Mail.com (${email}):`, error);
    return {
      success: false,
      email,
      unreadCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function getImapUnreadCount(
  host: string,
  port: number,
  username: string,
  password: string
): Promise<number> {
  // Wrap in timeout to prevent hanging
  const timeoutPromise = new Promise<number>((_, reject) => {
    setTimeout(() => reject(new Error('IMAP connection timeout (30s)')), 30000);
  });
  
  const imapPromise = async (): Promise<number> => {
    let conn: Deno.TlsConn | null = null;
    try {
      console.log(`  Connecting to ${host}:${port}...`);
      conn = await Deno.connectTls({ hostname: host, port: port });
      console.log(`  Connected! Authenticating...`);
      
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      // Read initial server greeting (no command, just read)
      const readGreeting = async (): Promise<string> => {
        const buffer = new Uint8Array(4096);
        let response = '';
        let attempts = 0;
        
        while (attempts < 3) {
          const n = await conn!.read(buffer);
          if (n === null) break;
          response += decoder.decode(buffer.subarray(0, n));
          // Greetings usually end with "ready" or newline
          if (response.includes('\n')) break;
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return response;
      };

      const sendCommand = async (command: string): Promise<string> => {
        await conn!.write(encoder.encode(command + '\r\n'));
        const buffer = new Uint8Array(4096);
        let response = '';
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
          const n = await conn!.read(buffer);
          if (n === null) break;
          response += decoder.decode(buffer.subarray(0, n));
          if (response.includes('a001 OK') || response.includes('a002 OK') || 
              response.includes('a003 OK') || response.includes('a004 OK')) {
            break;
          }
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return response;
      };

      const greeting = await readGreeting();
      console.log(`  Server greeting received`);
      
      console.log(`  Logging in...`);
      const loginResponse = await sendCommand(`a001 LOGIN "${username}" "${password}"`);
      if (!loginResponse.includes('a001 OK')) {
        throw new Error('IMAP login failed');
      }

      console.log(`  Selecting INBOX...`);
      const selectResponse = await sendCommand('a002 SELECT INBOX');
      if (!selectResponse.includes('a002 OK')) {
        throw new Error('IMAP SELECT INBOX failed');
      }

      console.log(`  Searching for unread...`);
      const searchResponse = await sendCommand('a003 SEARCH UNSEEN');
      await sendCommand('a004 LOGOUT');
      
      if (conn) {
        conn.close();
        conn = null;
      }

      const searchMatch = searchResponse.match(/\* SEARCH(.*?)(?:\r|\n|a003)/s);
      if (!searchMatch) return 0;

      const messageIds = searchMatch[1].trim().split(/\s+/).filter(id => id && /^\d+$/.test(id));
      console.log(`  Found ${messageIds.length} unread messages`);
      return messageIds.length;
      
    } catch (error) {
      if (conn) {
        try { conn.close(); } catch {}
      }
      throw error;
    }
  };
  
  try {
    return await Promise.race([imapPromise(), timeoutPromise]);
  } catch (error) {
    console.error('  IMAP error:', error);
    throw error;
  }
}

async function checkEmailUnread(credentials: EmailCredentials): Promise<EmailCheckResult> {
  const email = credentials.email.toLowerCase();
  const domain = email.split('@')[1] || '';
  
  const isMailcomDomain = domain.includes('mail.com') || domain.includes('post.com') || 
                          domain.includes('email.com') || domain.includes('usa.com') ||
                          domain.includes('myself.com');
  
  if (credentials.provider === 'gmail') {
    return checkGmailUnread(credentials.email, credentials.password);
  } else if (credentials.provider === 'mailcom' || isMailcomDomain) {
    return checkMailcomUnread(credentials.email, credentials.password);
  } else {
    return {
      success: false,
      email: credentials.email,
      unreadCount: 0,
      error: `Unsupported provider: ${credentials.provider}`,
    };
  }
}

// =============================================================================
// MAIN EDGE FUNCTION
// =============================================================================

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DB_TABLES = {
  emailAccounts: 'webchat_email_accounts',
  notificationCounts: 'webchat_notification_counts',
};

function getEmailPassword(email: string): string | null {
  const emailKey = email
    .replace(/-/g, '_DASH_')
    .replace(/@/g, '_AT_')
    .replace(/\./g, '_DOT_')
    .toUpperCase();
  const secretName = `EMAIL_PASSWORD_${emailKey}`;
  const password = Deno.env.get(secretName);
  
  if (!password) {
    console.log(`⚠️ No password found for ${email}`);
    console.log(`   Expected secret name: ${secretName}`);
  }
  
  return password;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Starting email count check...');

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

    const results: EmailCheckResult[] = [];
    
    for (const account of emailAccounts) {
      console.log(`\n📨 Checking: ${account.email}`);

      const password = getEmailPassword(account.email);
      
      if (!password) {
        console.error(`❌ No password configured for ${account.email}`);
        results.push({
          success: false,
          email: account.email,
          unreadCount: 0,
          error: 'Password not configured',
        });
        continue;
      }

      const credentials: EmailCredentials = {
        email: account.email,
        password: password,
        provider: account.provider,
      };

      const result = await checkEmailUnread(credentials);
      results.push(result);

      if (result.success) {
        console.log(`✅ ${account.email}: ${result.unreadCount} unread`);

        const updateResponse = await supabase
          .from(DB_TABLES.notificationCounts)
          .update({
            unread_count: result.unreadCount,
            last_checked: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('source_id', account.id)
          .eq('source_type', 'email');

        if (updateResponse.error) {
          console.error(`⚠️ Failed to update count for ${account.email}:`, updateResponse.error.message);
        }
      } else {
        console.error(`❌ ${account.email}: ${result.error}`);
      }
    }

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
