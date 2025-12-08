// =============================================================================
// EMAIL PROVIDERS - IMAP CONNECTION & UNREAD COUNT LOGIC
// =============================================================================

/**
 * Email provider configuration
 */
export interface EmailProviderConfig {
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
}

/**
 * Email credentials from database
 */
export interface EmailCredentials {
  email: string;
  password: string; // App-specific password
  provider: 'gmail' | 'mailcom' | 'other';
}

/**
 * Result from checking email
 */
export interface EmailCheckResult {
  success: boolean;
  email: string;
  unreadCount: number;
  error?: string;
}

/**
 * Provider configurations
 */
export const EMAIL_PROVIDERS: Record<string, EmailProviderConfig> = {
  gmail: {
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecure: true,
  },
  mailcom: {
    imapHost: 'imap.mail.com',
    imapPort: 993,
    imapSecure: true,
    // All Mail.com domains (@mail.com, @post.com, @email.com, @usa.com, etc.) use this server
  },
};

/**
 * Check unread count for Gmail via IMAP
 * 
 * IMPORTANT: Requires Gmail app-specific password
 * Setup: https://support.google.com/accounts/answer/185833
 */
export async function checkGmailUnread(
  email: string,
  password: string
): Promise<EmailCheckResult> {
  try {
    const config = EMAIL_PROVIDERS.gmail;
    
    // Use basic IMAP connection
    const unreadCount = await getImapUnreadCount(
      config.imapHost,
      config.imapPort,
      email,
      password
    );

    return {
      success: true,
      email,
      unreadCount,
    };
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

/**
 * Check unread count for Mail.com via IMAP
 * 
 * Works with all Mail.com domains: @mail.com, @post.com, @email.com, @usa.com, etc.
 * All use the same IMAP server: imap.mail.com:993
 * 
 * IMPORTANT: Requires Mail.com account password
 */
export async function checkMailcomUnread(
  email: string,
  password: string
): Promise<EmailCheckResult> {
  try {
    const config = EMAIL_PROVIDERS.mailcom;
    
    const unreadCount = await getImapUnreadCount(
      config.imapHost,
      config.imapPort,
      email,
      password
    );

    return {
      success: true,
      email,
      unreadCount,
    };
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

/**
 * Generic IMAP unread count checker
 * 
 * Uses a simple IMAP SEARCH command to count UNSEEN messages
 * This is a basic implementation - for production, consider using a proper IMAP library
 */
async function getImapUnreadCount(
  host: string,
  port: number,
  username: string,
  password: string
): Promise<number> {
  try {
    // Connect to IMAP server with TLS
    const conn = await Deno.connectTls({
      hostname: host,
      port: port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper to send command and read response
    const sendCommand = async (command: string): Promise<string> => {
      await conn.write(encoder.encode(command + '\r\n'));
      
      const buffer = new Uint8Array(4096);
      let response = '';
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const n = await conn.read(buffer);
        if (n === null) break;
        
        response += decoder.decode(buffer.subarray(0, n));
        
        // Check if we have a complete response (ends with command tag)
        if (response.includes('a001 OK') || 
            response.includes('a002 OK') || 
            response.includes('a003 OK') ||
            response.includes('a004 OK')) {
          break;
        }
        
        attempts++;
      }
      
      return response;
    };

    // 1. Wait for server greeting
    const greeting = await sendCommand('');
    console.log('IMAP Greeting:', greeting.substring(0, 100));

    // 2. Login
    const loginCmd = `a001 LOGIN "${username}" "${password}"`;
    const loginResponse = await sendCommand(loginCmd);
    
    if (!loginResponse.includes('a001 OK')) {
      throw new Error('IMAP login failed');
    }

    // 3. Select INBOX
    const selectResponse = await sendCommand('a002 SELECT INBOX');
    
    if (!selectResponse.includes('a002 OK')) {
      throw new Error('IMAP SELECT INBOX failed');
    }

    // 4. Search for UNSEEN messages
    const searchResponse = await sendCommand('a003 SEARCH UNSEEN');
    
    // 5. Logout
    await sendCommand('a004 LOGOUT');
    conn.close();

    // Parse unread count from SEARCH response
    // Response format: "* SEARCH 1 2 3" or "* SEARCH" (if no unread)
    const searchMatch = searchResponse.match(/\* SEARCH(.*?)(?:\r|\n|a003)/s);
    if (!searchMatch) {
      return 0;
    }

    const messageIds = searchMatch[1].trim().split(/\s+/).filter(id => id && /^\d+$/.test(id));
    return messageIds.length;

  } catch (error) {
    console.error('IMAP connection error:', error);
    throw error;
  }
}

/**
 * Check email based on provider
 */
export async function checkEmailUnread(
  credentials: EmailCredentials
): Promise<EmailCheckResult> {
  // Detect if it's a mail.com domain (they offer multiple domains)
  const email = credentials.email.toLowerCase();
  const domain = email.split('@')[1] || '';
  
  // Mail.com domains: mail.com, post.com, email.com, usa.com, myself.com, etc.
  const isMailcomDomain = domain.includes('mail.com') || 
                          domain.includes('post.com') || 
                          domain.includes('email.com') ||
                          domain.includes('usa.com') ||
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
