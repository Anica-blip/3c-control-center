// =============================================================================
// WEBCHAT COMPONENT - UTILITY FUNCTIONS
// =============================================================================

import { EMAIL_REGEX, EMAIL_PROVIDERS, getProviderWebUrl } from './config';
import type { NotificationCount } from './types';

// =============================================================================
// EMAIL VALIDATION
// =============================================================================

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate email and label before adding
 */
export const validateEmailInput = (
  email: string,
  label: string
): { valid: boolean; error: string | null } => {
  if (!email.trim() || !label.trim()) {
    return { valid: false, error: 'Please fill in both email and label fields' };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true, error: null };
};

// =============================================================================
// PROVIDER HELPERS
// =============================================================================

/**
 * Get provider icon emoji
 */
export const getProviderIcon = (provider: 'gmail' | 'mailcom' | 'other'): string => {
  return EMAIL_PROVIDERS[provider]?.icon || '📮';
};

/**
 * Get provider display name
 */
export const getProviderName = (provider: 'gmail' | 'mailcom' | 'other'): string => {
  return EMAIL_PROVIDERS[provider]?.name || 'Other';
};

/**
 * Open email provider in new tab
 */
export const openEmailInBrowser = (
  provider: 'gmail' | 'mailcom' | 'other',
  email?: string
): void => {
  const url = getProviderWebUrl(provider, email);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// =============================================================================
// DATE & TIME FORMATTING
// =============================================================================

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: Date | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format full date and time
 */
export const formatDateTime = (timestamp: Date | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time string (e.g., "2 min ago", "1 hour ago")
 */
export const getRelativeTime = (timestamp: Date | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  
  return formatDateTime(date);
};

// =============================================================================
// DARK MODE HELPERS
// =============================================================================

/**
 * Get dark mode from localStorage
 */
export const getDarkModeFromStorage = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('darkMode') === 'true';
};

/**
 * Save dark mode to localStorage
 */
export const saveDarkModeToStorage = (isDark: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('darkMode', String(isDark));
};

// =============================================================================
// NOTIFICATION HELPERS
// =============================================================================

/**
 * Get notification badge color based on count
 */
export const getNotificationBadgeColor = (count: number): string => {
  if (count === 0) return '#10b981'; // Green
  if (count < 10) return '#f59e0b'; // Amber
  return '#ef4444'; // Red
};

/**
 * Get notification source type icon
 */
export const getNotificationTypeIcon = (type: 'email' | 'livechat'): string => {
  return type === 'email' ? '📧' : '💬';
};

/**
 * Sort notifications by unread count (highest first)
 */
export const sortNotificationsByUnread = (
  notifications: NotificationCount[]
): NotificationCount[] => {
  return [...notifications].sort((a, b) => b.unread_count - a.unread_count);
};

/**
 * Filter notifications by type
 */
export const filterNotificationsByType = (
  notifications: NotificationCount[],
  type: 'email' | 'livechat' | 'all'
): NotificationCount[] => {
  if (type === 'all') return notifications;
  return notifications.filter((n) => n.source_type === type);
};

// =============================================================================
// UI HELPERS
// =============================================================================

/**
 * Truncate long text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Show browser notification (if permitted)
 */
export const showBrowserNotification = (title: string, body: string): void => {
  if (typeof window === 'undefined') return;
  
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
};

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// =============================================================================
// DEBOUNCE & THROTTLE
// =============================================================================

/**
 * Debounce function - delays execution until after wait time
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function - limits execution to once per wait time
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  let lastRan: number | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (!lastRan || now - lastRan >= wait) {
      func(...args);
      lastRan = now;
    } else {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
        lastRan = Date.now();
      }, wait - (now - lastRan));
    }
  };
};
