// /src/schedulecomponent/utils/platformUtils.ts - FIXED to match corrected types
import React from 'react';
import { SocialPlatform, DashboardPost, ScheduledPost } from '../types';

/**
 * Platform utility functions for the Schedule Manager
 * Handles platform-specific logic, icons, and formatting
 */

export interface PlatformInfo {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  maxLength?: {
    title?: number;
    description?: number;
    hashtags?: number;
  };
  features: string[];
  postTypes: string[];
}

/**
 * Platform configuration data - matches EnhancedContentCreationForm patterns
 */
export const PLATFORM_CONFIG: Record<string, PlatformInfo> = {
  instagram: {
    id: 'instagram',
    name: 'instagram',
    displayName: 'Instagram',
    color: '#E4405F',
    icon: '📷',
    maxLength: {
      title: 125,
      description: 2200,
      hashtags: 30
    },
    features: ['images', 'videos', 'stories', 'reels'],
    postTypes: ['feed', 'story', 'reel']
  },
  facebook: {
    id: 'facebook',
    name: 'facebook',
    displayName: 'Facebook',
    color: '#1877F2',
    icon: '📘',
    maxLength: {
      title: 120,
      description: 2000,
      hashtags: 5
    },
    features: ['images', 'videos', 'links', 'events'],
    postTypes: ['feed', 'story', 'event']
  },
  twitter: {
    id: 'twitter',
    name: 'twitter',
    displayName: 'Twitter/X',
    color: '#000000',
    icon: '🦅',
    maxLength: {
      description: 280,
      hashtags: 2
    },
    features: ['text', 'images', 'videos', 'threads'],
    postTypes: ['tweet', 'thread', 'reply']
  },
  linkedin: {
    id: 'linkedin',
    name: 'linkedin',
    displayName: 'LinkedIn',
    color: '#0A66C2',
    icon: '💼',
    maxLength: {
      title: 150,
      description: 3000,
      hashtags: 5
    },
    features: ['articles', 'images', 'videos', 'documents'],
    postTypes: ['post', 'article', 'story']
  },
  youtube: {
    id: 'youtube',
    name: 'youtube',
    displayName: 'YouTube',
    color: '#FF0000',
    icon: '🎥',
    maxLength: {
      title: 100,
      description: 5000,
      hashtags: 15
    },
    features: ['videos', 'live', 'shorts', 'community'],
    postTypes: ['video', 'short', 'live', 'community']
  },
  tiktok: {
    id: 'tiktok',
    name: 'tiktok',
    displayName: 'TikTok',
    color: '#000000',
    icon: '🎵',
    maxLength: {
      title: 150,
      description: 2200,
      hashtags: 20
    },
    features: ['videos', 'live', 'duets', 'effects'],
    postTypes: ['video', 'live']
  },
  telegram: {
    id: 'telegram',
    name: 'telegram',
    displayName: 'Telegram',
    color: '#0088CC',
    icon: '✈️',
    maxLength: {
      description: 4096,
      hashtags: 50
    },
    features: ['messages', 'media', 'files', 'channels'],
    postTypes: ['message', 'channel', 'group']
  },
  pinterest: {
    id: 'pinterest',
    name: 'pinterest',
    displayName: 'Pinterest',
    color: '#BD081C',
    icon: '📌',
    maxLength: {
      title: 100,
      description: 500,
      hashtags: 20
    },
    features: ['images', 'videos', 'boards', 'shopping'],
    postTypes: ['pin', 'story', 'video']
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'whatsapp',
    displayName: 'WhatsApp',
    color: '#25D366',
    icon: '💬',
    maxLength: {
      description: 4096
    },
    features: ['messages', 'media', 'status', 'broadcast'],
    postTypes: ['message', 'status', 'broadcast']
  }
};

/**
 * Get platform icon as React element or emoji
 * @param platformId - Platform identifier
 * @param size - Icon size (default: 16)
 * @returns Platform icon
 */
export const getPlatformIcon = (
  platformId: string, 
  size: number = 16
): React.ReactElement | string => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  
  if (!platform) {
    return '🌐'; // Generic globe icon for unknown platforms
  }

  // Return emoji icon with size styling
  return React.createElement('span', {
    style: {
      fontSize: `${size}px`,
      lineHeight: 1,
      display: 'inline-block'
    }
  }, platform.icon);
};

/**
 * Get platform color
 * @param platformId - Platform identifier
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Platform color hex code
 */
export const getPlatformColor = (
  platformId: string, 
  isDarkMode: boolean = false
): string => {
  const platform = PLATFORM_CONFIG[platformId.toLowerCase()];
  
  if (!platform) {
    return isDarkMode ? '#94a3b8' : '#6b7280'; // Default gray
  }

  // Adjust colors for dark mode if needed
  const colorAdjustments: Record<string, string> = {
    '#000000': isDarkMode ? '#ffffff' : '#000000', // Twitter/TikTok - invert for dark mode
  };

  return colorAdjustments[platform.color] || platform.color;
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
 * Format platform list for display - matches Schedule Manager needs
 * @param platformIds - Array of platform IDs
 * @param maxDisplay - Maximum number to display before showing "and X more"
 * @returns Formatted platform list string
 */
export const formatPlatformList = (
  platformIds: string[], 
  maxDisplay: number = 3
): string => {
  if (!platformIds || platformIds.length === 0) {
    return 'No platforms selected';
  }

  const platformNames = platformIds.map(id => getPlatformDisplayName(id));

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
 * Get optimal posting times for a platform (UK timezone)
 * @param platformId - Platform identifier
 * @returns Array of optimal posting times (hours in 24h format)
 */
export const getOptimalPostingTimes = (platformId: string): number[] => {
  const optimalTimes: Record<string, number[]> = {
    instagram: [8, 11, 13, 17, 19], // 8am, 11am, 1pm, 5pm, 7pm
    facebook: [9, 13, 15, 18, 20], // 9am, 1pm, 3pm, 6pm, 8pm
    twitter: [8, 12, 17, 18, 19], // 8am, 12pm, 5pm, 6pm, 7pm
    linkedin: [8, 9, 12, 17, 18], // 8am, 9am, 12pm, 5pm, 6pm (business hours)
    youtube: [14, 15, 16, 18, 19], // 2pm, 3pm, 4pm, 6pm, 7pm
    tiktok: [6, 10, 12, 19, 20], // 6am, 10am, 12pm, 7pm, 8pm
    telegram: [9, 12, 18, 20, 21], // 9am, 12pm, 6pm, 8pm, 9pm
    pinterest: [8, 11, 13, 15, 20], // 8am, 11am, 1pm, 3pm, 8pm
    whatsapp: [10, 12, 14, 19, 21] // 10am, 12pm, 2pm, 7pm, 9pm
  };

  return optimalTimes[platformId.toLowerCase()] || [9, 12, 15, 18]; // Default UK business hours
};

/**
 * Get platform-specific hashtag recommendations
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
        'Avoid banned or shadow-banned hashtags'
      ]
    },
    facebook: {
      recommended: 2,
      maximum: 5,
      tips: [
        'Use fewer, more targeted hashtags',
        'Focus on community and local hashtags',
        'Hashtags are less important than on other platforms'
      ]
    },
    twitter: {
      recommended: 1,
      maximum: 2,
      tips: [
        'Use hashtags sparingly',
        'Join trending conversations',
        'Create unique branded hashtags'
      ]
    },
    linkedin: {
      recommended: 3,
      maximum: 5,
      tips: [
        'Use professional and industry-specific hashtags',
        'Follow relevant hashtag conversations',
        'Mix broad and niche professional topics'
      ]
    },
    youtube: {
      recommended: 5,
      maximum: 15,
      tips: [
        'Use hashtags in description and title',
        'Research trending hashtags in your niche',
        'Include branded hashtags'
      ]
    },
    tiktok: {
      recommended: 3,
      maximum: 20,
      tips: [
        'Mix trending and niche hashtags',
        'Use hashtags that match your content',
        'Include location-based hashtags when relevant'
      ]
    }
  };

  return recommendations[platformId.toLowerCase()] || {
    recommended: 5,
    maximum: 10,
    tips: ['Research platform-specific hashtag best practices']
  };
};

/**
 * Validate content for platform requirements - works with Schedule Manager types
 * @param platformId - Platform identifier
 * @param post - DashboardPost or ScheduledPost to validate
 * @returns Validation result with errors/warnings
 */
export const validateContentForPlatform = (
  platformId: string,
  post: DashboardPost | ScheduledPost
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

  // Platform-specific requirements
  if (platformId === 'twitter' && !post.description.trim()) {
    errors.push('Twitter posts must have content');
  }

  if (platformId === 'youtube' && !post.title) {
    warnings.push('YouTube videos should have titles');
  }

  if (platformId === 'instagram' && (!post.media_files || post.media_files.length === 0)) {
    warnings.push('Instagram posts typically include images or videos');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get platform-specific content suggestions
 * @param platformId - Platform identifier
 * @returns Content suggestions for the platform
 */
export const getPlatformContentSuggestions = (platformId: string): string[] => {
  const suggestions: Record<string, string[]> = {
    instagram: [
      'Use high-quality, visually appealing images',
      'Write engaging captions that encourage interaction',
      'Use Instagram Stories for behind-the-scenes content',
      'Post consistently and use relevant hashtags'
    ],
    facebook: [
      'Share valuable, shareable content',
      'Use Facebook Groups to build community',
      'Post videos for higher engagement',
      'Respond promptly to comments and messages'
    ],
    twitter: [
      'Keep tweets concise and to the point',
      'Join trending conversations',
      'Use threads for longer-form content',
      'Engage with other users regularly'
    ],
    linkedin: [
      'Share professional insights and industry news',
      'Write thoughtful, value-driven posts',
      'Use LinkedIn Articles for long-form content',
      'Network and engage with industry professionals'
    ],
    youtube: [
      'Create compelling thumbnails and titles',
      'Focus on video quality and audio clarity',
      'Optimise descriptions with keywords',
      'Engage with comments and build community'
    ],
    tiktok: [
      'Create short, engaging videos',
      'Use trending sounds and effects',
      'Jump on viral challenges and trends',
      'Post consistently and at optimal times'
    ]
  };

  return suggestions[platformId.toLowerCase()] || [
    'Research platform-specific best practices',
    'Analyse successful content in your niche',
    'Engage authentically with your audience',
    'Post consistently and track performance'
  ];
};

/**
 * Get estimated reach potential for platform
 * @param platformId - Platform identifier
 * @param followerCount - Number of followers
 * @returns Estimated reach percentage
 */
export const getEstimatedReach = (
  platformId: string, 
  followerCount: number
): { percentage: number; description: string } => {
  const reachRates: Record<string, { rate: number; description: string }> = {
    instagram: { 
      rate: 0.08, 
      description: 'Instagram organic reach averages 8% of followers' 
    },
    facebook: { 
      rate: 0.05, 
      description: 'Facebook organic reach averages 5% of followers' 
    },
    twitter: { 
      rate: 0.15, 
      description: 'Twitter reach can be 15% or higher with engagement' 
    },
    linkedin: { 
      rate: 0.09, 
      description: 'LinkedIn professional content reaches about 9% of connections' 
    },
    youtube: { 
      rate: 0.20, 
      description: 'YouTube subscriber notification rate is around 20%' 
    },
    tiktok: { 
      rate: 0.25, 
      description: 'TikTok algorithm can reach 25% or more with good content' 
    }
  };

  const platform = reachRates[platformId.toLowerCase()] || { 
    rate: 0.10, 
    description: 'Estimated organic reach varies by platform' 
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
 * Get platform preview configuration for Schedule Manager
 * @param platformId - Platform identifier
 * @returns Preview configuration object
 */
export const getPlatformPreviewConfig = (platformId: string) => {
  const previewConfigs: Record<string, any> = {
    instagram: {
      aspectRatio: '1 / 1',
      maxWidth: '400px',
      label: 'Instagram Square Post (1:1)'
    },
    facebook: {
      aspectRatio: '1.91 / 1',
      maxWidth: '500px',
      label: 'Facebook Post (1.91:1)'
    },
    twitter: {
      aspectRatio: '16 / 9',
      maxWidth: '500px',
      label: 'Twitter/X Post (16:9)'
    },
    linkedin: {
      aspectRatio: '1.91 / 1',
      maxWidth: '500px',
      label: 'LinkedIn Post (1.91:1)'
    },
    youtube: {
      aspectRatio: '16 / 9',
      maxWidth: '480px',
      label: 'YouTube Thumbnail (16:9)'
    },
    tiktok: {
      aspectRatio: '9 / 16',
      maxWidth: '300px',
      label: 'TikTok Video (9:16)'
    },
    telegram: {
      aspectRatio: 'auto',
      maxWidth: '100%',
      label: 'Telegram Post (Original Size)'
    },
    pinterest: {
      aspectRatio: '2 / 3',
      maxWidth: '400px',
      label: 'Pinterest Pin (2:3)'
    },
    whatsapp: {
      aspectRatio: '16 / 9',
      maxWidth: '500px',
      label: 'WhatsApp Post (16:9)'
    }
  };
  
  return previewConfigs[platformId] || {
    aspectRatio: '16 / 9',
    maxWidth: '600px',
    label: 'Standard Format (16:9)'
  };
};
