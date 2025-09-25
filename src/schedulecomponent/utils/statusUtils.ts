// /src/schedulecomponent/utils/statusUtils.ts - FIXED React element creation
import React from 'react';
import { ScheduledPost } from '../types';

export type PostStatus = 
  | 'draft'
  | 'pending'
  | 'pending_schedule'
  | 'scheduled'
  | 'processing'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'cancelled'
  | 'complete';

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
  priority: number;
  isActionable: boolean;
  nextStates: PostStatus[];
}

export const STATUS_CONFIG: Record<PostStatus, StatusInfo> = {
  draft: {
    id: 'draft',
    label: 'Draft',
    description: 'Post is saved as draft in content creation',
    color: { light: '#6b7280', dark: '#9ca3af' },
    bgColor: { light: '#f9fafb', dark: '#374151' },
    icon: '📝',
    priority: 1,
    isActionable: true,
    nextStates: ['pending_schedule', 'scheduled', 'cancelled']
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
    description: 'Post is in Schedule Manager awaiting schedule assignment',
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
    nextStates: ['processing', 'cancelled', 'pending_schedule']
  },
  processing: {
    id: 'processing',
    label: 'Processing',
    description: 'Post is being prepared for publishing',
    color: { light: '#7c3aed', dark: '#a78bfa' },
    bgColor: { light: '#ede9fe', dark: '#3c1d5b' },
    icon: '⚙️',
    priority: 5,
    isActionable: false,
    nextStates: ['publishing', 'failed']
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
    nextStates: ['published', 'complete', 'failed']
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
    nextStates: ['complete']
  },
  complete: {
    id: 'complete',
    label: 'Complete',
    description: 'Post workflow completed successfully',
    color: { light: '#16a34a', dark: '#22c55e' },
    bgColor: { light: '#dcfce7', dark: '#14532d' },
    icon: '🎉',
    priority: 7,
    isActionable: false,
    nextStates: []
  },
  failed: {
    id: 'failed',
    label: 'Failed',
    description: 'Post publishing failed and needs attention',
    color: { light: '#dc2626', dark: '#ef4444' },
    bgColor: { light: '#fee2e2', dark: '#7f1d1d' },
    icon: '❌',
    priority: 8,
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
    priority: 9,
    isActionable: true,
    nextStates: ['draft', 'pending_schedule']
  }
};

// FIXED: Proper null checking and string return instead of React element
export const getStatusIcon = (
  status: PostStatus, 
  size: number = 16
): string => {
  const statusInfo = STATUS_CONFIG[status];
  return statusInfo?.icon || '❓';
};

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

export const isStatusActionable = (status: PostStatus): boolean => {
  const statusInfo = STATUS_CONFIG[status];
  return statusInfo?.isActionable || false;
};

export const getNextStates = (status: PostStatus): PostStatus[] => {
  const statusInfo = STATUS_CONFIG[status];
  return statusInfo?.nextStates || [];
};

export const isValidStatusTransition = (
  fromStatus: PostStatus, 
  toStatus: PostStatus
): boolean => {
  const nextStates = getNextStates(fromStatus);
  return nextStates.includes(toStatus);
};

export const getStatusPriority = (status: PostStatus): number => {
  const statusInfo = STATUS_CONFIG[status];
  return statusInfo?.priority || 999;
};
