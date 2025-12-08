// =============================================================================
// WEBCHAT COMPONENT - TYPE DEFINITIONS
// =============================================================================

// Email Account stored in database
export interface EmailAccount {
  id: string;
  email: string;
  label: string;
  provider: 'gmail' | 'mailcom' | 'other';
  created_at: string;
}

// Notification count entry in database
export interface NotificationCount {
  id: string;
  source_type: 'email' | 'livechat';
  source_id: string | null;
  source_name: string;
  unread_count: number;
  last_checked: string;
  updated_at: string;
}

// Chat message in Aurion webchat
export interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
}

// AI Configuration
export interface AIConfig {
  primaryAI: string;
  backupAI: string;
  claudeEnabled: boolean;
  apiEndpoint: string;
}

// Email credentials (not stored in frontend, used by Edge Function)
export interface EmailCredentials {
  id: string;
  email_account_id: string;
  imap_host: string;
  imap_port: number;
  imap_user: string;
  encrypted_password: string;
  created_at: string;
}

// Edge Function response
export interface EmailCheckResult {
  success: boolean;
  email: string;
  unread_count: number;
  error?: string;
}

// Component props
export interface AurionWebchatProps {
  apiEndpoint?: string;
  className?: string;
  isDarkMode?: boolean;
}

export interface ChatManagerPublicProps {
  // Reserved for future props if needed
}
