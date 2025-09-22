// /src/schedulecomponent/utils/dateUtils.ts
import { ScheduledPost, DashboardPost } from '../types';

/**
 * Date utility functions for the Schedule Manager
 * Provides consistent date formatting, validation, and manipulation
 */

/**
 * Format a date to a readable string (UK English format)
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string, 
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(dateObj)) {
    return 'Invalid Date';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  return dateObj.toLocaleDateString('en-GB', defaultOptions);
};

/**
 * Format time to a readable string (24-hour format for UK)
 * @param date - Date to extract time from
 * @param use24Hour - Whether to use 24-hour format (default: true)
 * @returns Formatted time string
 */
export const formatTime = (
  date: Date | string, 
  use24Hour: boolean = true
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(dateObj)) {
    return 'Invalid Time';
  }

  return dateObj.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour
  });
};

/**
 * Format date and time together (UK format)
 * @param date - Date to format
 * @param options - Custom format options
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  date: Date | string,
  options?: {
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
    use24Hour?: boolean;
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(dateObj)) {
    return 'Invalid DateTime';
  }

  const dateStyle = options?.dateStyle || 'medium';
  const timeStyle = options?.timeStyle || 'short';
  const use24Hour = options?.use24Hour ?? true;

  return dateObj.toLocaleString('en-GB', {
    dateStyle,
    timeStyle,
    hour12: !use24Hour
  });
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to compare
 * @param relativeTo - Date to compare against (default: now)
 * @returns Relative time string
 */
export const getRelativeTime = (
  date: Date | string,
  relativeTo?: Date
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const compareDate = relativeTo || new Date();
  
  if (!isValidDate(dateObj)) {
    return 'Invalid Date';
  }

  const diffMs = dateObj.getTime() - compareDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Future dates
  if (diffMs > 0) {
    if (diffSeconds < 60) return 'in a few seconds';
    if (diffMinutes === 1) return 'in 1 minute';
    if (diffMinutes < 60) return `in ${diffMinutes} minutes`;
    if (diffHours === 1) return 'in 1 hour';
    if (diffHours < 24) return `in ${diffHours} hours`;
    if (diffDays === 1) return 'tomorrow';
    if (diffDays < 7) return `in ${diffDays} days`;
    if (diffWeeks === 1) return 'in 1 week';
    if (diffWeeks < 4) return `in ${diffWeeks} weeks`;
    if (diffMonths === 1) return 'in 1 month';
    if (diffMonths < 12) return `in ${diffMonths} months`;
    if (diffYears === 1) return 'in 1 year';
    return `in ${diffYears} years`;
  }
  
  // Past dates
  const absDiffSeconds = Math.abs(diffSeconds);
  const absDiffMinutes = Math.abs(diffMinutes);
  const absDiffHours = Math.abs(diffHours);
  const absDiffDays = Math.abs(diffDays);
  const absDiffWeeks = Math.abs(diffWeeks);
  const absDiffMonths = Math.abs(diffMonths);
  const absDiffYears = Math.abs(diffYears);

  if (absDiffSeconds < 60) return 'just now';
  if (absDiffMinutes === 1) return '1 minute ago';
  if (absDiffMinutes < 60) return `${absDiffMinutes} minutes ago`;
  if (absDiffHours === 1) return '1 hour ago';
  if (absDiffHours < 24) return `${absDiffHours} hours ago`;
  if (absDiffDays === 1) return 'yesterday';
  if (absDiffDays < 7) return `${absDiffDays} days ago`;
  if (absDiffWeeks === 1) return '1 week ago';
  if (absDiffWeeks < 4) return `${absDiffWeeks} weeks ago`;
  if (absDiffMonths === 1) return '1 month ago';
  if (absDiffMonths < 12) return `${absDiffMonths} months ago`;
  if (absDiffYears === 1) return '1 year ago';
  return `${absDiffYears} years ago`;
};

/**
 * Check if a date is valid
 * @param date - Date to validate
 * @returns Whether the date is valid
 */
export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Add minutes to a date
 * @param date - Starting date
 * @param minutes - Minutes to add
 * @returns New date with added minutes
 */
export const addMinutes = (date: Date, minutes: number): Date => {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutes);
  return newDate;
};

/**
 * Add hours to a date
 * @param date - Starting date
 * @param hours - Hours to add
 * @returns New date with added hours
 */
export const addHours = (date: Date, hours: number): Date => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

/**
 * Add days to a date
 * @param date - Starting date
 * @param days - Days to add
 * @returns New date with added days
 */
export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

/**
 * Get the start of the day for a given date
 * @param date - Input date
 * @returns Date at 00:00:00
 */
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get the end of the day for a given date
 * @param date - Input date
 * @returns Date at 23:59:59.999
 */
export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Check if two dates are on the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Whether dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns Whether the date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Check if a date is tomorrow
 * @param date - Date to check
 * @returns Whether the date is tomorrow
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(date, tomorrow);
};

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns Whether the date is in the past
 */
export const isPast = (date: Date): boolean => {
  return date.getTime() < Date.now();
};

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns Whether the date is in the future
 */
export const isFuture = (date: Date): boolean => {
  return date.getTime() > Date.now();
};

/**
 * Get time until a scheduled date
 * @param scheduledDate - The scheduled date
 * @returns Object with time components until the date
 */
export const getTimeUntil = (scheduledDate: Date | string) => {
  const target = typeof scheduledDate === 'string' ? new Date(scheduledDate) : scheduledDate;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { 
      isPast: true, 
      days: 0, 
      hours: 0, 
      minutes: 0, 
      seconds: 0,
      totalMs: diffMs
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    isPast: false,
    days,
    hours,
    minutes,
    seconds,
    totalMs: diffMs
  };
};

/**
 * Convert a date to ISO string for input fields
 * @param date - Date to convert
 * @returns ISO date string for HTML inputs
 */
export const toInputDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Convert a date to time string for input fields
 * @param date - Date to convert
 * @returns Time string in HH:MM format
 */
export const toInputTime = (date: Date): string => {
  return date.toTimeString().split(' ')[0].slice(0, 5);
};

/**
 * Parse a date string safely with fallback
 * @param dateString - Date string to parse
 * @param fallback - Fallback date if parsing fails
 * @returns Parsed date or fallback
 */
export const safeParseDate = (
  dateString: string | null | undefined, 
  fallback: Date = new Date()
): Date => {
  if (!dateString) return fallback;
  
  const parsed = new Date(dateString);
  return isValidDate(parsed) ? parsed : fallback;
};

/**
 * Get timezone offset in hours
 * @param date - Date to get offset for (default: now)
 * @returns Timezone offset in hours
 */
export const getTimezoneOffset = (date: Date = new Date()): number => {
  return -date.getTimezoneOffset() / 60;
};

/**
 * Format timezone offset as string
 * @param offsetHours - Offset in hours
 * @returns Formatted timezone offset (e.g., "+01:00", "-05:00")
 */
export const formatTimezoneOffset = (offsetHours: number): string => {
  const sign = offsetHours >= 0 ? '+' : '-';
  const absHours = Math.abs(offsetHours);
  const hours = Math.floor(absHours);
  const minutes = Math.round((absHours - hours) * 60);
  
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
