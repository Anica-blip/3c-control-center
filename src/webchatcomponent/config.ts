// =============================================================================
// WEBCHAT COMPONENT - CONFIGURATION
// =============================================================================

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://uqyqpwhkzlhqxcqajhkn.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
};

// Database Table Names
export const DB_TABLES = {
  emailAccounts: 'webchat_email_accounts',
  notificationCounts: 'webchat_notification_counts',
  emailCredentials: 'webchat_email_credentials', // For Edge Function only
};

// Email Provider IMAP Configurations
export const EMAIL_PROVIDERS = {
  gmail: {
    name: 'Gmail',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecure: true,
    webUrl: 'https://mail.google.com/mail/u/0/#inbox',
    icon: '📧',
  },
  mailcom: {
    name: 'Mail.com',
    imapHost: 'imap.mail.com',
    imapPort: 993,
    imapSecure: true,
    webUrl: 'https://www.mail.com/',
    icon: '📬',
  },
  other: {
    name: 'Other',
    imapHost: '',
    imapPort: 993,
    imapSecure: true,
    webUrl: '',
    icon: '📮',
  },
};

// Auto-refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  notificationCounts: 30000, // 30 seconds
  emailCheck: 600000, // 10 minutes (Edge Function trigger frequency)
};

// Aurion Chat Configuration
export const AURION_CONFIG = {
  defaultEndpoint: 'http://localhost:8080',
  defaultGreeting: "Hi, I'm Aurion!\nHow can I help?",
};

// UI Constants
export const UI_CONSTANTS = {
  maxEmailsDisplayed: 50,
  toastDuration: 3000,
  animationDuration: 200,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  darkMode: 'darkMode',
  aiConfig: 'webchat_ai_config',
};

// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Provider detection from email domain
export const detectEmailProvider = (email: string): 'gmail' | 'mailcom' | 'other' => {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  
  if (domain.includes('gmail')) return 'gmail';
  if (domain.includes('mail.com')) return 'mailcom';
  
  return 'other';
};

// Get provider web URL for opening email in browser
export const getProviderWebUrl = (provider: 'gmail' | 'mailcom' | 'other', email?: string): string => {
  const config = EMAIL_PROVIDERS[provider];
  
  if (provider === 'gmail' && email) {
    // Gmail supports direct account selection
    const accountIndex = 0; // Could be enhanced to track multiple accounts
    return `https://mail.google.com/mail/u/${accountIndex}/#inbox`;
  }
  
  return config.webUrl;
};

