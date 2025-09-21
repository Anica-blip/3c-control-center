// /src/schedulecomponent/utils/statusUtils.ts
import React from 'react';

/**
 * Status utility functions for the Schedule Manager
 * Handles status colors, icons, and status management logic
 */

export type PostStatus = 
  | 'draft'
  | 'pending'
  | 'pending_schedule'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'cancelled'
  | 'archived';

export interface StatusInfo {
  id: PostStatus;
  label: string;
  description: string;
  color: {
    light: string;
    dark: string;
  };
  bgColor: {
    light: string;
    dark: string;
  };
  icon: string;
  priority: number; // Lower number = higher priority for sorting
  isActionable: boolean; // Whether user can take action on this status
  nextStates: PostStatus[]; // Possible transitions from this status
}

/**
 * Complete status configuration
 */
export const STATUS_CONFIG: Record<PostStatus, StatusInfo> = {
  draft: {
    id: 'draft',
    label: 'Draft',
    description: 'Post is saved as draft and not scheduled',
    color: { light: '#6b7280', dark: '#9ca3af' },
    bgColor: { light: '#f9fafb', dark: '#374151' },
    icon: '📝',
    priority: 1,
    isActionable: true,
    nextStates: ['pending_schedule', 'scheduled', 'archived']
  },
  pending: {
    id: 'pending',
    label: 'Pending',
    description: 'Post is ready but needs review',
    color: { light: '#d97706', dark: '#f59e0b' },
    bgColor: { light: '#fef3c7', dark: '#451a03' },
    icon: '⏳',
    priority: 2,
    isActionable: true,
    nextStates: ['pending_schedule', 'scheduled', 'draft', 'cancelled']
  },
  pending_schedule: {
    id: 'pending_schedule',
    label: 'Pending Schedule',
    description: 'Post is awaiting schedule assignment',
    color: { light: '#2563eb', dark: '#60a5fa' },
    bgColor: { light: '#dbeafe', dark: '#1e3a8a' },
    icon: '🕐',
    priority: 3,
    isActionable: true,
    nextStates: ['scheduled', 'draft', 'cancelled']
  },
  scheduled: {
    id: 'scheduled',
    label: 'Scheduled',
    description: 'Post is scheduled for future publishing',
    color: { light: '#059669', dark: '#10b981' },
    bgColor: { light: '#d1fae5', dark: '#064e3b' },
    icon: '📅',
    priority: 4,
    isActionable: true,
    nextStates: ['publishing', 'cancelled', 'pending_schedule']
  },
  publishing: {
    id: 'publishing',
    label: 'Publishing',
    description: 'Post is currently being published',
    color: { light: '#7c3aed', dark: '#a78bfa' },
    bgColor: { light: '#ede9fe', dark: '#3c1d5b' },
    icon: '🚀',
    priority: 5,
    isActionable: false,
    nextStates: ['published', 'failed']
  },
  published: {
    id: 'published',
    label: 'Published',
    description: 'Post has been successfully published',
    color: { light: '#16a34a', dark: '#22c55e' },
    bgColor: { light: '#dcfce7', dark: '#14532d' },
    icon: '✅',
    priority: 6,
    isActionable: false,
    nextStates: ['archived']
  },
  failed: {
    id: 'failed',
    label: 'Failed',
    description: 'Post publishing failed and needs attention',
    color: { light: '#dc2626', dark: '#ef4444' },
    bgColor: { light: '#fee2e2', dark: '#7f1d1d' },
    icon: '❌',
    priority: 7,
    isActionable: true,
    nextStates: ['scheduled', 'pending_schedule', 'cancelled']
  },
  cancelled: {
    id: 'cancelled',
    label: 'Cancelled',
    description: 'Post was cancelled and will not be published',
    color: { light: '#4b5563', dark: '#6b7280' },
    bgColor: { light: '#f3f4f6', dark: '#374151' },
    icon: '🚫',
    priority: 8,
    isActionable: true,
    nextStates: ['draft', 'pending_schedule', 'archived']
  },
  archived: {
    id: 'archived',
    label: 'Archived',
    description: 'Post is archived and hidden from active lists',
    color: { light: '#6b7280', dark: '#9ca3af' },
    bgColor: { light: '#f9fafb', dark: '#1f2937' },
    icon: '📦',
    priority: 9,
    isActionable: true,
    nextStates: ['draft', 'pending_schedule']
  }
};

/**
 * Get status color configuration
 * @param status - Post status
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Object with text and background colors
 */
export const getStatusColor = (
  status: PostStatus, 
  isDarkMode: boolean = false
) => {
  const statusInfo = STATUS_CONFIG[status];
  
  if (!statusInfo) {
    return {
      text: isDarkMode ? '#9ca3af' : '#6b7280',
      bg: isDarkMode ? '#374151' : '#f9fafb'
    };
  }

  return {
    text: isDarkMode ? statusInfo.color.dark : statusInfo.color.light,
    bg: isDarkMode ? statusInfo.bgColor.dark : statusInfo.bgColor.light
  };
};

/**
 * Get status icon
 * @param status - Post status
 * @param size - Icon size (default: 16)
 * @returns Status icon as React element
 */
export const getStatusIcon = (
  status: PostStatus, 
  size: number = 16
): React.ReactElement => {
  const statusInfo = STATUS_CONFIG[status];
  const icon = statusInfo?.icon || '❓';

  return React.createElement('span', {
    style: {
      fontSize: `${size}px`,
      lineHeight: 1,
      display: 'inline-block'
    }
  }, icon);
};

/**
 * Get status display information
 * @param status - Post status
 * @returns Status label and description
 */
export const getStatusDisplayInfo = (status: PostStatus) => {
  const statusInfo = STATUS_CONFIG[status];
  
  if (!statusInfo) {
    return {
      label: 'Unknown',
      description: 'Unknown status'
    };
  }

  return {
    label: statusInfo.label,
    description: statusInfo.description
  };
};

/**
 * Check if status is actionable (user can modify)
 * @param status - Post status
 * @returns Whether the status allows user actions
 */
export const isStatusActionable = (status: PostStatus): boolean => {
  const statusInfo = STATUS_CONFIG[status];
  return statusInfo?.isActionable || false;
};

/**
 * Get possible next states for a status
 * @param status - Current post status
 * @returns Array of possible next statuses
 */
export const getNextStates = (status: PostStatus): PostStatus[] => {
  const statusInfo = STATUS_CONFIG[status];
  return statusInfo?.nextStates || [];
};

/**
 * Check if status transition is valid
 * @param fromStatus - Current status
 * @param toStatus - Target status
 * @returns Whether the transition is allowed
 */
export const isValidStatusTransition = (
  fromStatus: PostStatus, 
  toStatus: PostStatus
): boolean => {
  const nextStates = getNextStates(fromStatus);
  return nextStates.includes(toStatus);
};

/**
 * Get status priority for sorting
 * @param status - Post status
 * @returns Priority number (lower = higher priority)
 */
export const getStatusPriority = (status: PostStatus): number => {
  const statusInfo = STATUS_CONFIG[status];
  return statusInfo?.priority || 999;
};

/**
 * Sort posts by status priority
 * @param posts - Array of posts with status
 * @returns Sorted array (highest priority first)
 */
export const sortByStatusPriority = <T extends { status: PostStatus }>(
  posts: T[]
): T[] => {
  return [...posts].sort((a, b) => 
    getStatusPriority(a.status) - getStatusPriority(b.status)
  );
};

/**
 * Group posts by status
 * @param posts - Array of posts with status
 * @returns Object with status as keys and arrays of posts as values
 */
export const groupPostsByStatus = <T extends { status: PostStatus }>(
  posts: T[]
): Record<PostStatus, T[]> => {
  const groups = {} as Record<PostStatus, T[]>;
  
  // Initialize all status groups
  Object.keys(STATUS_CONFIG).forEach(status => {
    groups[status as PostStatus] = [];
  });
  
  // Group posts
  posts.forEach(post => {
    if (groups[post.status]) {
      groups[post.status].push(post);
    }
  });
  
  return groups;
};

/**
 * Get status counts from an array of posts
 * @param posts - Array of posts with status
 * @returns Object with status counts
 */
export const getStatusCounts = <T extends { status: PostStatus }>(
  posts: T[]
): Record<PostStatus, number> => {
  const counts = {} as Record<PostStatus, number>;
  
  // Initialize all counts to 0
  Object.keys(STATUS_CONFIG).forEach(status => {
    counts[status as PostStatus] = 0;
  });
  
  // Count posts
  posts.forEach(post => {
    if (counts[post.status] !== undefined) {
      counts[post.status]++;
    }
  });
  
  return counts;
};

/**
 * Filter posts by status
 * @param posts - Array of posts with status
 * @param statuses - Status or array of statuses to filter by
 * @returns Filtered array of posts
 */
export const filterPostsByStatus = <T extends { status: PostStatus }>(
  posts: T[],
  statuses: PostStatus | PostStatus[]
): T[] => {
  const statusArray = Array.isArray(statuses) ? statuses : [statuses];
  return posts.filter(post => statusArray.includes(post.status));
};

/**
 * Get actionable posts (posts that can be modified)
 * @param posts - Array of posts with status
 * @returns Array of actionable posts
 */
export const getActionablePosts = <T extends { status: PostStatus }>(
  posts: T[]
): T[] => {
  return posts.filter(post => isStatusActionable(post.status));
};

/**
 * Get status badge style for UI components
 * @param status - Post status
 * @param isDarkMode - Whether dark mode is enabled
 * @param variant - Badge style variant
 * @returns CSS style object for status badge
 */
export const getStatusBadgeStyle = (
  status: PostStatus,
  isDarkMode: boolean = false,
  variant: 'default' | 'subtle' | 'outline' = 'default'
) => {
  const colors = getStatusColor(status, isDarkMode);
  
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  };

  switch (variant) {
    case 'subtle':
      return {
        ...baseStyle,
        backgroundColor: colors.bg,
        color: colors.text,
        border: 'none'
      };
    
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        color: colors.text,
        border: `1px solid ${colors.text}`
      };
    
    default:
      return {
        ...baseStyle,
        backgroundColor: colors.text,
        color: isDarkMode ? '#1f2937' : '#ffffff',
        border: 'none'
      };
  }
};

/**
 * Get status summary for dashboard display
 * @param posts - Array of posts with status
 * @returns Summary object with key metrics
 */
export const getStatusSummary = <T extends { status: PostStatus }>(
  posts: T[]
) => {
  const counts = getStatusCounts(posts);
  const total = posts.length;
  
  return {
    total,
    counts,
    pending: counts.pending + counts.pending_schedule,
    scheduled: counts.scheduled,
    published: counts.published,
    failed: counts.failed,
    actionable: getActionablePosts(posts).length,
    percentages: Object.fromEntries(
      Object.entries(counts).map(([status, count]) => [
        status,
        total > 0 ? Math.round((count / total) * 100) : 0
      ])
    ) as Record<PostStatus, number>
  };
};

/**
 * Get suggested actions for a status
 * @param status - Post status
 * @returns Array of suggested action labels
 */
export const getSuggestedActions = (status: PostStatus): string[] => {
  const actionMap: Record<PostStatus, string[]> = {
    draft: ['Schedule Post', 'Edit Content', 'Archive'],
    pending: ['Schedule Post', 'Edit Content', 'Cancel'],
    pending_schedule: ['Set Schedule', 'Edit Content', 'Cancel'],
    scheduled: ['Edit Schedule', 'Cancel Schedule', 'Edit Content'],
    publishing: [], // No actions during publishing
    published: ['View Post', 'Archive', 'Create Similar'],
    failed: ['Retry Publishing', 'Edit Content', 'Reschedule'],
    cancelled: ['Reschedule', 'Edit Content', 'Archive'],
    archived: ['Restore', 'Delete Permanently']
  };

  return actionMap[status] || [];
};

/**
 * Get status workflow steps
 * @returns Array of status workflow information
 */
export const getStatusWorkflow = () => {
  return [
    {
      status: 'draft' as PostStatus,
      title: 'Create Content',
      description: 'Write and design your post content'
    },
    {
      status: 'pending_schedule' as PostStatus,
      title: 'Set Schedule',
      description: 'Choose when to publish your content'
    },
    {
      status: 'scheduled' as PostStatus,
      title: 'Await Publishing',
      description: 'Post is queued for automatic publishing'
    },
    {
      status: 'publishing' as PostStatus,
      title: 'Publishing',
      description: 'Post is being published to platforms'
    },
    {
      status: 'published' as PostStatus,
      title: 'Live',
      description: 'Post is live on your social platforms'
    }
  ];
};

/**
 * Check if status indicates an error state
 * @param status - Post status
 * @returns Whether the status indicates an error
 */
export const isErrorStatus = (status: PostStatus): boolean => {
  return status === 'failed';
};

/**
 * Check if status indicates a success state
 * @param status - Post status
 * @returns Whether the status indicates success
 */
export const isSuccessStatus = (status: PostStatus): boolean => {
  return status === 'published';
};

/**
 * Check if status indicates work in progress
 * @param status - Post status
 * @returns Whether the status indicates ongoing work
 */
export const isProgressStatus = (status: PostStatus): boolean => {
  return ['pending', 'pending_schedule', 'scheduled', 'publishing'].includes(status);
};

/**
 * Get status emoji for quick visual reference
 * @param status - Post status
 * @returns Single emoji representing the status
 */
export const getStatusEmoji = (status: PostStatus): string => {
  const statusInfo = STATUS_CONFIG[status];
  return statusInfo?.icon || '❓';
};
