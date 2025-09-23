// /src/schedulecomponent/utils/platformUtils.ts - FIXED for Schedule Manager integration
import React from 'react';
import { SocialPlatform, ScheduledPost } from '../types';

/**
 * Platform utility functions for the Schedule Manager
 * Handles platform-specific logic, icons, and formatting
 * Configured for UK English and Schedule Manager requirements
 */

export interface PlatformInfo {
  id: string;
  name: string;
  displayName: string;
  abbreviation: string; // For Schedule Manager display (IG, FB, etc.)
  color: string;
  icon: string;
  maxLength?: {
    title?: number;
    description?: number;
    hashtags?: number;
  };
  features: string[];
  postTypes: string[];
  ukOptimalTimes: number[]; // UK timezone optimal posting hours
}

/**
 * Platform configuration data - optimised for Schedule Manager
 */
export const PLATFORM_CONFIG: Record<string, PlatformInfo> = {
  instagram: {
    id: 'instagram',
    name: 'instagram',
    displayName: 'Instagram',
    abbreviation: 'IG',
    color: '#E4405F',
    icon: '📷',
    maxLength: {
      title: 125,
      description: 2200,
      hashtags: 30
    },
    features: ['images', 'videos', 'stories', 'reels'],
    postTypes: ['feed', 'story', 'reel'],
    ukOptimalTimes: [8, 11, 13, 17, 19] // 8am, 11am, 1pm, 5pm, 7pm UK time
  },
  facebook: {
    id: 'facebook',
    name: 'facebook',
    displayName: 'Facebook',
    abbreviation: 'FB',
    color: '#1877F2',
    icon: '📘',
    maxLength: {
      title: 120,
      description: 2000,
      hashtags: 5
    },
    features: ['images', 'videos', 'links', 'events'],
    postTypes: ['feed', 'story', 'event'],
    ukOptimalTimes: [9, 13, 15, 18, 20] // 9am, 1pm, 3pm, 6pm, 8pm UK time
  },
  twitter: {
    id: 'twitter',
    name: 'twitter',
    displayName: 'Twitter/X',
    abbreviation: 'TW',
    color: '#000000',
    icon: '🦅',
    maxLength: {
      description: 280,
      hashtags: 2
    },
    features: ['text', 'images', 'videos', 'threads'],
    postTypes: ['tweet', 'thread', 'reply'],
    ukOptimalTimes: [8, 12, 17, 18, 19] // 8am, 12pm, 5pm, 6pm, 7pm UK time
  },
  linkedin: {
    id: 'linkedin',
    name: 'linkedin',
    displayName: 'LinkedIn',
    abbreviation: 'LI',
    color: '#0A66C2',
    icon: '💼',
    maxLength: {
      title: 150,
      description: 3000,
      hashtags: 5
    },
    features: ['articles', 'images', 'videos', 'documents'],
    postTypes: ['post', 'article', 'story'],
    ukOptimalTimes: [8, 9, 12, 17, 18] // 8am, 9am, 12pm, 5pm, 6pm UK business hours
  },
  youtube: {
    id: 'youtube',
    name: 'youtube',
    displayName: 'YouTube',
    abbreviation: 'YT',
    color: '#FF0000',
    icon: '🎥',
    maxLength: {
      title: 100,
      description: 5000,
      hashtags: 15
    },
    features: ['videos', 'live', 'shorts', 'community'],
    postTypes: ['video', 'short', 'live', 'community'],
    ukOptimalTimes: [14, 15, 16, 18, 19] // 2pm, 3pm, 4pm, 6pm, 7pm UK time
  },
  tiktok: {
    id: 'tiktok',
    name: 'tiktok',
    displayName: 'TikTok',
    abbreviation: 'TT',
    color: '#000000',
    icon: '🎵',
    maxLength: {
      title: 150,
      description: 2200,
      hashtags: 20
    },
    features: ['videos', 'live', 'duets', 'effects'],
    postTypes: ['video', 'live'],
    ukOptimalTimes: [6, 10, 12, 19, 20] // 6am, 10am, 12pm, 7pm, 8pm UK time
  },
  telegram: {
    id: 'telegram',
    name: 'telegram',
    displayName: 'Telegram',
    abbreviation: 'TG',
    color: '#0088CC',
    icon: '✈️',
    maxLength: {
      description: 4096,
      hashtags: 50
    },
    features: ['messages', 'media', 'files', 'channels'],
    postTypes: ['message', 'channel', 'group'],
    ukOptimalTimes: [9, 12, 18, 20, 21] // 9am, 12pm, 6pm, 8pm, 9pm UK time
  },
  pinterest: {
    id: 'pinterest',
    name: 'pinterest',
    displayName: 'Pinterest',
    abbreviation: 'PT',
    color: '#BD081C',
    icon: '📌',
    maxLength: {
      title: 100,
      description: 500,
      hashtags: 20
    },
    features: ['images', 'videos', 'boards', 'shopping'],
    postTypes: ['pin', 'story', 'video'],
    ukOptimalTimes: [8, 11, 13, 15, 20] // 8am, 11am, 1pm, 3pm, 8pm UK time
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'whatsapp',
    displayName: 'WhatsApp',
    abbreviation: 'WA',
    color: '#25D366',
    icon: '💬',
    maxLength: {
      description: 4096
    },
    features: ['messages', 'media', 'status', 'broadcast'],
    postTypes: ['message', 'status', 'broadcast'],
    ukOptimalTimes: [10, 12, 14, 19, 21] // 10am, 12pm, 2pm, 7pm, 9pm UK time
  }
};

/**
 * Get platform icon as React element - optimised for Schedule Manager
 * @param platformId - Platform identifier
 * @param size - Icon size (default: 16)
 * @returns Platform icon
 */
export const getPlatformIcon = (
  platformId: string, 
  size: number = 16
): React.ReactElement => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  
  const icon = platform?.icon || '🌐'; // Generic globe icon for unknown platforms

  return React.createElement('span', {
    style: {
      fontSize: `${size}px`,
      lineHeight: 1,
      display: 'inline-block',
      verticalAlign: 'middle'
    },
    title: platform?.displayName || platformId // Tooltip for accessibility
  }, icon);
};

/**
 * Get platform abbreviation for Schedule Manager display
 * @param platformId - Platform identifier
 * @returns Platform abbreviation (IG, FB, TW, etc.)
 */
export const getPlatformAbbreviation = (platformId: string): string => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  return platform?.abbreviation || platformId.toUpperCase().slice(0, 2);
};

/**
 * Get platform colour (UK spelling)
 * @param platformId - Platform identifier
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Platform colour hex code
 */
export const getPlatformColor = (
  platformId: string, 
  isDarkMode: boolean = false
): string => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  
  if (!platform) {
    return isDarkMode ? '#94a3b8' : '#6b7280'; // Default grey
  }

  // Adjust colours for dark mode visibility
  const colorAdjustments: Record<string, { light: string; dark: string }> = {
    '#000000': { light: '#000000', dark: '#ffffff' }, // Twitter/TikTok - invert for dark mode
    '#BD081C': { light: '#BD081C', dark: '#ef4444' }, // Pinterest - brighter for dark mode
  };

  const adjustment = colorAdjustments[platform.color];
  if (adjustment) {
    return isDarkMode ? adjustment.dark : adjustment.light;
  }

  return platform.color;
};

/**
 * Get platform display name
 * @param platformId - Platform identifier
 * @returns Human-readable platform name
 */
export const getPlatformDisplayName = (platformId: string): string => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  return platform?.displayName || platformId;
};

/**
 * Get platform character limits
 * @param platformId - Platform identifier
 * @returns Object with character limits for different content types
 */
export const getPlatformLimits = (platformId: string) => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  return platform?.maxLength || {
    title: 150,
    description: 2200,
    hashtags: 30
  };
};

/**
 * Format platform list for Schedule Manager display - UK English phrasing
 * @param platformIds - Array of platform IDs
 * @param maxDisplay - Maximum number to display before showing "and X more"
 * @param useAbbreviations - Whether to use abbreviations (IG, FB) or full names
 * @returns Formatted platform list string
 */
export const formatPlatformList = (
  platformIds: string[], 
  maxDisplay: number = 3,
  useAbbreviations: boolean = false
): string => {
  if (!platformIds || platformIds.length === 0) {
    return 'No platforms selected';
  }

  const platformNames = platformIds.map(id => 
    useAbbreviations ? getPlatformAbbreviation(id) : getPlatformDisplayName(id)
  );

  if (platformNames.length <= maxDisplay) {
    if (platformNames.length === 1) return platformNames[0];
    if (platformNames.length === 2) return `${platformNames[0]} and ${platformNames[1]}`;
    return `${platformNames.slice(0, -1).join(', ')}, and ${platformNames[platformNames.length - 1]}`;
  }

  const displayed = platformNames.slice(0, maxDisplay);
  const remaining = platformNames.length - maxDisplay;
  return `${displayed.join(', ')} and ${remaining} more`;
};

/**
 * Get platform list as icon array for Schedule Manager - space-efficient display
 * @param platformIds - Array of platform IDs
 * @param maxIcons - Maximum icons to show before "+X"
 * @param iconSize - Size of each icon
 * @returns Array of React elements
 */
export const getPlatformIconList = (
  platformIds: string[],
  maxIcons: number = 4,
  iconSize: number = 14
): React.ReactElement[] => {
  if (!platformIds || platformIds.length === 0) return [];

  const icons: React.ReactElement[] = [];
  const displayCount = Math.min(platformIds.length, maxIcons);

  // Add platform icons
  for (let i = 0; i < displayCount; i++) {
    icons.push(
      React.createElement('span', {
        key: platformIds[i],
        style: { marginRight: '2px' }
      }, getPlatformIcon(platformIds[i], iconSize))
    );
  }

  // Add "+X more" indicator if needed
  if (platformIds.length > maxIcons) {
    const remaining = platformIds.length - maxIcons;
    icons.push(
      React.createElement('span', {
        key: 'more',
        style: {
          fontSize: `${iconSize - 2}px`,
          color: '#6b7280',
          marginLeft: '2px'
        }
      }, `+${remaining}`)
    );
  }

  return icons;
};

/**
 * Check if platform supports a specific feature
 * @param platformId - Platform identifier
 * @param feature - Feature to check
 * @returns Whether platform supports the feature
 */
export const platformSupportsFeature = (
  platformId: string, 
  feature: string
): boolean => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  return platform?.features.includes(feature) || false;
};

/**
 * Get optimal posting times for UK timezone (UTC+1)
 * @param platformId - Platform identifier
 * @returns Array of optimal posting times (hours in 24h format)
 */
export const getOptimalPostingTimesUK = (platformId: string): number[] => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  return platform?.ukOptimalTimes || [9, 12, 15, 18]; // Default UK business hours
};

/**
 * Get next optimal posting time for UK timezone
 * @param platformId - Platform identifier
 * @param afterTime - Time to search after (default: now)
 * @returns Next optimal posting time as Date object
 */
export const getNextOptimalPostingTime = (
  platformId: string,
  afterTime: Date = new Date()
): Date => {
  const optimalHours = getOptimalPostingTimesUK(platformId);
  const now = new Date(afterTime);
  const currentHour = now.getHours();
  
  // Find next optimal hour today
  const nextHourToday = optimalHours.find(hour => hour > currentHour);
  
  if (nextHourToday !== undefined) {
    const nextTime = new Date(now);
    nextTime.setHours(nextHourToday, 0, 0, 0);
    return nextTime;
  }
  
  // If no optimal time left today, use first optimal time tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(optimalHours[0], 0, 0, 0);
  return tomorrow;
};

/**
 * Get platform-specific hashtag recommendations (UK focused)
 * @param platformId - Platform identifier
 * @returns Hashtag usage recommendations
 */
export const getHashtagRecommendations = (platformId: string) => {
  const recommendations: Record<string, {
    recommended: number;
    maximum: number;
    tips: string[];
  }> = {
    instagram: {
      recommended: 11,
      maximum: 30,
      tips: [
        'Use a mix of popular and niche hashtags',
        'Research hashtag performance regularly',
        'Include UK-specific hashtags for local reach'
      ]
    },
    facebook: {
      recommended: 2,
      maximum: 5,
      tips: [
        'Use fewer, more targeted hashtags',
        'Focus on UK community and local hashtags',
        'Hashtags are less important than on other platforms'
      ]
    },
    twitter: {
      recommended: 1,
      maximum: 2,
      tips: [
        'Use hashtags sparingly',
        'Join UK trending conversations',
        'Create unique branded hashtags'
      ]
    },
    linkedin: {
      recommended: 3,
      maximum: 5,
      tips: [
        'Use professional UK industry hashtags',
        'Follow relevant UK business conversations',
        'Mix broad and niche professional topics'
      ]
    }
  };

  return recommendations[platformId.toLowerCase()] || {
    recommended: 5,
    maximum: 10,
    tips: ['Research platform-specific hashtag best practices for UK audience']
  };
};

/**
 * Validate content for platform requirements - Schedule Manager integration
 * @param platformId - Platform identifier
 * @param post - ScheduledPost to validate
 * @returns Validation result with errors/warnings
 */
export const validateContentForPlatform = (
  platformId: string,
  post: ScheduledPost
) => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!platform) {
    warnings.push('Unknown platform - using generic validation');
    return { isValid: true, errors, warnings };
  }

  const limits = platform.maxLength;

  // Title validation
  if (limits?.title && post.title && post.title.length > limits.title) {
    errors.push(`Title exceeds ${limits.title} character limit for ${platform.displayName}`);
  }

  // Description validation
  if (limits?.description && post.description.length > limits.description) {
    errors.push(`Description exceeds ${limits.description} character limit for ${platform.displayName}`);
  }

  // Hashtag validation
  if (limits?.hashtags && post.hashtags && post.hashtags.length > limits.hashtags) {
    errors.push(`Too many hashtags for ${platform.displayName} (${post.hashtags.length}/${limits.hashtags})`);
  }

  // Platform-specific UK requirements
  if (platformId === 'twitter' && !post.description.trim()) {
    errors.push('Twitter posts must have content');
  }

  if (platformId === 'youtube' && !post.title) {
    warnings.push('YouTube videos should have descriptive titles');
  }

  if (platformId === 'instagram' && (!post.media_files || post.media_files.length === 0)) {
    warnings.push('Instagram posts typically include images or videos');
  }

  if (platformId === 'linkedin' && post.description.length < 50) {
    warnings.push('LinkedIn posts perform better with detailed descriptions');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get platform-specific content suggestions (UK focused)
 * @param platformId - Platform identifier
 * @returns Content suggestions for UK audience
 */
export const getPlatformContentSuggestions = (platformId: string): string[] => {
  const suggestions: Record<string, string[]> = {
    instagram: [
      'Use high-quality, visually appealing images',
      'Write engaging captions that encourage interaction',
      'Post during UK peak hours (11am-1pm, 5pm-7pm)',
      'Use UK-relevant hashtags and locations'
    ],
    facebook: [
      'Share valuable, shareable content for UK audience',
      'Use Facebook Groups to build UK community',
      'Post videos for higher UK engagement',
      'Respond promptly to comments (UK business hours)'
    ],
    twitter: [
      'Keep tweets concise and to the point',
      'Join UK trending conversations',
      'Use threads for longer-form content',
      'Engage during UK active hours (8am-7pm)'
    ],
    linkedin: [
      'Share professional insights relevant to UK market',
      'Write thoughtful, value-driven posts',
      'Use LinkedIn Articles for thought leadership',
      'Network with UK industry professionals'
    ]
  };

  return suggestions[platformId.toLowerCase()] || [
    'Research UK audience preferences for this platform',
    'Post during UK peak engagement times',
    'Use UK English spelling and terminology',
    'Engage authentically with UK users'
  ];
};

/**
 * Get estimated reach potential for UK audience
 * @param platformId - Platform identifier
 * @param followerCount - Number of UK followers
 * @returns Estimated reach percentage and description
 */
export const getEstimatedReachUK = (
  platformId: string, 
  followerCount: number
): { percentage: number; description: string } => {
  const reachRates: Record<string, { rate: number; description: string }> = {
    instagram: { 
      rate: 0.09, 
      description: 'Instagram UK organic reach averages 9% of followers' 
    },
    facebook: { 
      rate: 0.06, 
      description: 'Facebook UK organic reach averages 6% of page likes' 
    },
    twitter: { 
      rate: 0.18, 
      description: 'Twitter UK reach can be 18% or higher with engagement' 
    },
    linkedin: { 
      rate: 0.12, 
      description: 'LinkedIn UK professional content reaches about 12% of connections' 
    },
    youtube: { 
      rate: 0.25, 
      description: 'YouTube UK subscriber notification rate is around 25%' 
    },
    tiktok: { 
      rate: 0.30, 
      description: 'TikTok UK algorithm can reach 30% or more with good content' 
    }
  };

  const platform = reachRates[platformId.toLowerCase()] || { 
    rate: 0.10, 
    description: 'Estimated UK organic reach varies by platform' 
  };

  return {
    percentage: Math.round(platform.rate * 100),
    description: platform.description
  };
};

/**
 * Convert SocialPlatform array to platform IDs for Schedule Manager
 * @param platforms - Array of SocialPlatform objects
 * @returns Array of platform ID strings
 */
export const extractPlatformIds = (platforms: SocialPlatform[]): string[] => {
  return platforms.filter(p => p.isActive).map(p => p.id);
};

/**
 * Schedule Manager specific utilities
 */

/**
 * Get platform badge component for Schedule Manager tabs
 * @param platformId - Platform identifier
 * @param isDarkMode - Dark mode flag
 * @param variant - Badge style variant
 * @returns React element for platform badge
 */
export const getPlatformBadge = (
  platformId: string,
  isDarkMode: boolean = false,
  variant: 'icon' | 'abbreviated' | 'full' = 'abbreviated'
): React.ReactElement => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  const color = getPlatformColor(platformId, isDarkMode);
  
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: variant === 'full' ? '4px 8px' : '2px 6px',
    backgroundColor: `${color}20`,
    color: color,
    borderRadius: '12px',
    fontSize: variant === 'full' ? '12px' : '11px',
    fontWeight: '600',
    border: `1px solid ${color}40`
  };

  const content = (() => {
    switch (variant) {
      case 'icon':
        return getPlatformIcon(platformId, 12);
      case 'abbreviated':
        return `${getPlatformIcon(platformId, 12)} ${getPlatformAbbreviation(platformId)}`;
      case 'full':
        return `${getPlatformIcon(platformId, 14)} ${getPlatformDisplayName(platformId)}`;
    }
  })();

  return React.createElement('span', { style: badgeStyle }, content);
};

/**
 * Get multiple platform badges for Schedule Manager display
 * @param platformIds - Array of platform IDs
 * @param isDarkMode - Dark mode flag
 * @param maxDisplay - Maximum badges to show
 * @returns Array of React elements
 */
export const getPlatformBadges = (
  platformIds: string[],
  isDarkMode: boolean = false,
  maxDisplay: number = 3
): React.ReactElement[] => {
  if (!platformIds || platformIds.length === 0) return [];

  const badges: React.ReactElement[] = [];
  const displayCount = Math.min(platformIds.length, maxDisplay);

  // Create badges for platforms
  for (let i = 0; i < displayCount; i++) {
    badges.push(
      React.createElement('span', {
        key: platformIds[i],
        style: { marginRight: '4px', marginBottom: '4px' }
      }, getPlatformBadge(platformIds[i], isDarkMode, 'abbreviated'))
    );
  }

  // Add "+X more" indicator if needed
  if (platformIds.length > maxDisplay) {
    const remaining = platformIds.length - maxDisplay;
    badges.push(
      React.createElement('span', {
        key: 'more',
        style: {
          padding: '2px 6px',
          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500',
          marginRight: '4px'
        }
      }, `+${remaining} more`)
    );
  }

  return badges;
};
