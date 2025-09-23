// /src/schedulecomponent/utils/dateUtils.ts - FIXED for UK timezone and Schedule Manager
import { ScheduledPost } from '../types';

/**
 * Date utility functions for the Schedule Manager
 * Provides consistent UK date formatting, validation, and manipulation
 * All times are handled in UK timezone (UTC+1/UTC+0 depending on DST)
 */

/**
 * UK timezone configuration
 */
export const UK_TIMEZONE = 'Europe/London';
export const UK_LOCALE = 'en-GB';

/**
 * Format a date to UK readable string (DD/MM/YYYY format)
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in UK format
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
    timeZone: UK_TIMEZONE,
    ...options
  };

  return dateObj.toLocaleDateString(UK_LOCALE, defaultOptions);
};

/**
 * Format time to UK readable string (24-hour format)
 * @param date - Date to extract time from
 * @param use24Hour - Whether to use 24-hour format (default: true for UK)
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

  return dateObj.toLocaleTimeString(UK_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour,
    timeZone: UK_TIMEZONE
  });
};

/**
 * Format date and time together (UK format with timezone)
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
    showTimezone?: boolean;
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(dateObj)) {
    return 'Invalid DateTime';
  }

  const dateStyle = options?.dateStyle || 'medium';
  const timeStyle = options?.timeStyle || 'short';
  const use24Hour = options?.use24Hour ?? true;
  const showTimezone = options?.showTimezone ?? false;

  const formatted = dateObj.toLocaleString(UK_LOCALE, {
    dateStyle,
    timeStyle,
    hour12: !use24Hour,
    timeZone: UK_TIMEZONE,
    timeZoneName: showTimezone ? 'short' : undefined
  });

  return formatted;
};

/**
 * Get relative time with UK English phrasing (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to compare
 * @param relativeTo - Date to compare against (default: now in UK timezone)
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

  // Future dates (UK English phrasing)
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
  
  // Past dates (UK English phrasing)
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
 * Get the start of the day for a given date (UK timezone)
 * @param date - Input date
 * @returns Date at 00:00:00 UK time
 */
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get the end of the day for a given date (UK timezone)
 * @param date - Input date
 * @returns Date at 23:59:59.999 UK time
 */
export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Check if two dates are on the same day (UK timezone)
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
 * Check if a date is today (UK timezone)
 * @param date - Date to check
 * @returns Whether the date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Check if a date is tomorrow (UK timezone)
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
 * Get time until a scheduled date (UK timezone aware)
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
 * Convert a date to ISO string for HTML input fields
 * @param date - Date to convert
 * @returns ISO date string for HTML inputs (YYYY-MM-DD)
 */
export const toInputDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Convert a date to time string for HTML input fields
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
 * Get UK timezone offset in hours (accounts for BST/GMT)
 * @param date - Date to get offset for (default: now)
 * @returns UK timezone offset in hours
 */
export const getUKTimezoneOffset = (date: Date = new Date()): number => {
  // Use Intl API to get accurate UK timezone offset including DST
  const ukTime = new Date(date.toLocaleString('en-US', { timeZone: UK_TIMEZONE }));
  const utcTime = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  return (ukTime.getTime() - utcTime.getTime()) / (1000 * 60 * 60);
};

/**
 * Format timezone offset as string
 * @param offsetHours - Offset in hours
 * @returns Formatted timezone offset (e.g., "+01:00", "+00:00")
 */
export const formatTimezoneOffset = (offsetHours: number): string => {
  const sign = offsetHours >= 0 ? '+' : '-';
  const absHours = Math.abs(offsetHours);
  const hours = Math.floor(absHours);
  const minutes = Math.round((absHours - hours) * 60);
  
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Get current UK timezone name (GMT or BST)
 * @param date - Date to check (default: now)
 * @returns Timezone name string
 */
export const getUKTimezoneName = (date: Date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    timeZoneName: 'short'
  });
  
  const parts = formatter.formatToParts(date);
  const timeZonePart = parts.find(part => part.type === 'timeZoneName');
  return timeZonePart?.value || 'GMT';
};

/**
 * Schedule Manager specific date utilities
 */

/**
 * Get quick schedule options for UK timezone
 * @param baseTime - Base time to calculate from (default: now)
 * @returns Array of quick schedule options
 */
export const getQuickScheduleOptions = (baseTime: Date = new Date()) => {
  return [
    {
      label: 'In 1 hour',
      value: addHours(baseTime, 1),
      description: 'Schedule for 1 hour from now'
    },
    {
      label: 'In 2 hours',
      value: addHours(baseTime, 2),
      description: 'Schedule for 2 hours from now'
    },
    {
      label: 'Tomorrow 9 AM',
      value: (() => {
        const tomorrow = addDays(baseTime, 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
      })(),
      description: 'Schedule for tomorrow morning'
    },
    {
      label: 'Next Monday 9 AM',
      value: (() => {
        const nextMonday = new Date(baseTime);
        const daysUntilMonday = (1 + 7 - baseTime.getDay()) % 7 || 7;
        nextMonday.setDate(baseTime.getDate() + daysUntilMonday);
        nextMonday.setHours(9, 0, 0, 0);
        return nextMonday;
      })(),
      description: 'Schedule for next Monday morning'
    }
  ];
};

/**
 * Validate scheduling time for UK business requirements
 * @param scheduledDate - Proposed schedule date
 * @param currentTime - Current time (default: now)
 * @returns Validation result with any warnings
 */
export const validateScheduleTime = (
  scheduledDate: Date,
  currentTime: Date = new Date()
) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Must be in future
  if (scheduledDate <= currentTime) {
    errors.push('Scheduled time must be in the future');
  }

  // Check if more than 1 year in advance
  const oneYearFromNow = addDays(currentTime, 365);
  if (scheduledDate > oneYearFromNow) {
    errors.push('Cannot schedule more than 1 year in advance');
  }

  // Check if scheduling outside reasonable hours (UK timezone)
  const hour = scheduledDate.getHours();
  if (hour < 6 || hour > 23) {
    warnings.push('Scheduling outside typical engagement hours (06:00-23:00 UK time)');
  }

  // Check if weekend
  const dayOfWeek = scheduledDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    warnings.push('Scheduled for weekend - engagement may be lower');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get UK working hours range
 * @returns Object with start and end hours for UK working day
 */
export const getUKWorkingHours = () => {
  return {
    start: 9,  // 9 AM
    end: 17,   // 5 PM
    lunch: { start: 12, end: 13 } // 12-1 PM lunch break
  };
};

/**
 * Check if time is during UK working hours
 * @param date - Date to check
 * @returns Whether the time is during UK working hours
 */
export const isUKWorkingHours = (date: Date): boolean => {
  const hour = date.getHours();
  const dayOfWeek = date.getDay();
  const workingHours = getUKWorkingHours();
  
  // Monday to Friday
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return hour >= workingHours.start && hour < workingHours.end;
  }
  
  return false;
};

/**
 * Get next UK working day
 * @param fromDate - Date to start from (default: now)
 * @returns Next UK working day at 9 AM
 */
export const getNextUKWorkingDay = (fromDate: Date = new Date()): Date => {
  let nextDay = addDays(fromDate, 1);
  
  // Skip weekends
  while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
    nextDay = addDays(nextDay, 1);
  }
  
  // Set to 9 AM
  nextDay.setHours(9, 0, 0, 0);
  return nextDay;
};

/**
 * Format schedule date for Schedule Manager display
 * @param date - Date to format
 * @param includeRelative - Whether to include relative time
 * @returns Formatted string for Schedule Manager UI
 */
export const formatScheduleDate = (
  date: Date,
  includeRelative: boolean = true
): string => {
  const formatted = formatDateTime(date, {
    dateStyle: 'medium',
    timeStyle: 'short',
    use24Hour: true
  });
  
  if (includeRelative) {
    const relative = getRelativeTime(date);
    return `${formatted} (${relative})`;
  }
  
  return formatted;
};

/**
 * Group scheduled posts by date for Calendar View
 * @param posts - Array of scheduled posts
 * @returns Object with dates as keys and posts as values
 */
export const groupPostsByDate = (posts: ScheduledPost[]): Record<string, ScheduledPost[]> => {
  const grouped: Record<string, ScheduledPost[]> = {};
  
  posts.forEach(post => {
    if (post.scheduled_date) {
      const dateKey = toInputDate(post.scheduled_date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(post);
    }
  });
  
  // Sort posts within each date by time
  Object.keys(grouped).forEach(dateKey => {
    grouped[dateKey].sort((a, b) => 
      new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
    );
  });
  
  return grouped;
};

/**
 * Get calendar weeks for a given month (UK week starts Monday)
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Array of weeks, each containing 7 dates
 */
export const getCalendarWeeks = (year: number, month: number): Date[][] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Adjust for UK week starting Monday (getDay() returns 0 for Sunday)
  const startDate = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
  startDate.setDate(firstDay.getDate() - daysBack);
  
  const weeks: Date[][] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= lastDay || weeks.length === 0 || weeks[weeks.length - 1].length < 7) {
    if (weeks.length === 0 || weeks[weeks.length - 1].length === 7) {
      weeks.push([]);
    }
    
    weeks[weeks.length - 1].push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Stop after 6 weeks maximum
    if (weeks.length >= 6 && weeks[weeks.length - 1].length === 7) {
      break;
    }
  }
  
  return weeks;
};
