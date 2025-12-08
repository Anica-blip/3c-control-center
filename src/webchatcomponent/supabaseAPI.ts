// =============================================================================
// WEBCHAT COMPONENT - SUPABASE API OPERATIONS
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, DB_TABLES, detectEmailProvider } from './config';
import type { EmailAccount, NotificationCount } from './types';

// Initialize Supabase client
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// =============================================================================
// EMAIL ACCOUNTS OPERATIONS
// =============================================================================

/**
 * Load all email accounts from database
 */
export const loadEmailAccounts = async (): Promise<{
  data: EmailAccount[] | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.emailAccounts)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error loading email accounts:', error);
    return { data: null, error: 'Failed to load email accounts' };
  }
};

/**
 * Add new email account to database
 */
export const addEmailAccount = async (
  email: string,
  label: string
): Promise<{
  data: EmailAccount | null;
  error: string | null;
}> => {
  try {
    const provider = detectEmailProvider(email);

    const { data, error } = await supabase
      .from(DB_TABLES.emailAccounts)
      .insert([
        {
          email: email.trim(),
          label: label.trim(),
          provider: provider,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Also create a notification count entry for this email
    if (data) {
      await createNotificationCountForEmail(data.id, label.trim());
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error adding email account:', error);
    return { data: null, error: 'Failed to add email account' };
  }
};

/**
 * Delete email account from database
 */
export const deleteEmailAccount = async (
  id: string
): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    // Delete from database
    const { error: deleteError } = await supabase
      .from(DB_TABLES.emailAccounts)
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Also delete associated notification count
    await supabase
      .from(DB_TABLES.notificationCounts)
      .delete()
      .eq('source_id', id);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting email account:', error);
    return { success: false, error: 'Failed to delete email account' };
  }
};

/**
 * Check if email already exists in database
 */
export const emailExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.emailAccounts)
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    return !error && data !== null;
  } catch (error) {
    return false;
  }
};

// =============================================================================
// NOTIFICATION COUNTS OPERATIONS
// =============================================================================

/**
 * Load all notification counts from database
 */
export const loadNotificationCounts = async (): Promise<{
  data: NotificationCount[] | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.notificationCounts)
      .select('*')
      .order('source_name', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error loading notification counts:', error);
    return { data: null, error: 'Failed to load notifications' };
  }
};

/**
 * Create notification count entry for new email account
 */
const createNotificationCountForEmail = async (
  emailAccountId: string,
  sourceName: string
): Promise<void> => {
  try {
    await supabase.from(DB_TABLES.notificationCounts).insert([
      {
        source_type: 'email',
        source_id: emailAccountId,
        source_name: sourceName,
        unread_count: 0,
      },
    ]);
  } catch (error) {
    console.error('Error creating notification count:', error);
    // Non-critical error, don't throw
  }
};

/**
 * Update notification count (called by Edge Function)
 * This is primarily used by the backend, but included for completeness
 */
export const updateNotificationCount = async (
  sourceId: string,
  unreadCount: number
): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    const { error } = await supabase
      .from(DB_TABLES.notificationCounts)
      .update({
        unread_count: unreadCount,
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('source_id', sourceId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating notification count:', error);
    return { success: false, error: 'Failed to update notification count' };
  }
};

/**
 * Calculate total unread count across all sources
 */
export const calculateTotalUnread = (
  notifications: NotificationCount[]
): number => {
  return notifications.reduce((sum, item) => sum + (item.unread_count || 0), 0);
};

// =============================================================================
// REAL-TIME SUBSCRIPTIONS (Optional - for future enhancement)
// =============================================================================

/**
 * Subscribe to notification count changes
 * Can be used for real-time updates instead of polling
 */
export const subscribeToNotificationCounts = (
  callback: (payload: NotificationCount) => void
) => {
  return supabase
    .channel('notification_counts_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: DB_TABLES.notificationCounts,
      },
      (payload) => {
        callback(payload.new as NotificationCount);
      }
    )
    .subscribe();
};

// Export the supabase client for direct access if needed
export { supabase };
