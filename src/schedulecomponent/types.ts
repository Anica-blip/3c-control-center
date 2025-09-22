// /src/types.ts - COMPLETE TYPE DEFINITIONS FOR SCHEDULE MANAGER

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'gif' | 'interactive' | 'other' | 'url_link';
  size: number;
  url: string;
  urlPreview?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  };
}

export interface PlatformAssignment {
  platformId: string;
  platformName: string;
  platformIcon: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  errorMessage?: string;
}

export interface PendingPost {
  id: string;
  content_id: string;
  character_profile: string;
  theme: string;
  audience: string;
  media_type: string;
  template_type: string;
  platform: string;
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  media_files: MediaFile[];
  selected_platforms: string[];
  status: 'pending_schedule';
  created_date: Date;
  user_id: string;
  created_by: string;
  is_from_template?: boolean;
  source_template_id?: string;
}

export interface ScheduledPost extends Omit<PendingPost, 'status'> {
  scheduled_date: Date;
  status: 'pending' | 'processing' | 'complete' | 'failed' | 'resending' | 'scheduled' | 'published';
  failure_reason?: string;
  last_attempt?: Date;
  retry_count?: number;
  original_post_id?: string;
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  persona_target?: string;
  audience_segment?: string;
  campaign_id?: string;
}

export interface SavedTemplate {
  id: string;
  template_name: string;
  character_profile: string;
  theme: string;
  audience: string;
  media_type: string;
  template_type: string;
  platform: string;
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  selected_platforms: string[];
  usage_count: number;
  is_active: boolean;
  template_version: number;
  persona_target?: string;
  audience_segment?: string;
  campaign_type?: string;
  user_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// MISSING INTERFACES USED BY ENHANCED CONTENT CREATION FORM

export interface ContentPost {
  id: string;
  contentId: string;
  characterProfile: string;
  theme: string;
  audience: string;
  mediaType: string;
  templateType: string;
  platform: string;
  voiceStyle: string;
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  mediaFiles: MediaFile[];
  selectedPlatforms: string[];
  status: 'draft' | 'pending' | 'published' | 'scheduled';
  createdDate: Date;
  isFromTemplate?: boolean;
  sourceTemplateId?: string;
  user_id?: string;
  created_by?: string;
}

export interface SocialPlatform {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  isDefault: boolean;
  color?: string;
  icon?: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  username: string;
  role: string;
  avatar_id?: string;
  bio?: string;
  personality?: string;
  voice_style?: string;
  expertise?: string[];
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// TEMPLATE LIBRARY INTEGRATION TYPES

export interface PendingLibraryTemplate {
  template_id?: string;
  source_template_id?: string;
  character_profile?: string;
  theme?: string;
  audience?: string;
  media_type?: string;
  template_type?: string;
  platform?: string;
  voiceStyle?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  keywords?: string;
  cta?: string;
  selected_platforms?: string[];
}

// TELEGRAM CHANNEL TYPES FOR PLATFORM INTEGRATION

export interface TelegramChannel {
  id: number;
  name: string;
  channel_group_id?: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// STATUS AND UTILITY TYPES

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

export type MediaType = 
  | 'image' 
  | 'video' 
  | 'pdf' 
  | 'gif' 
  | 'interactive' 
  | 'other' 
  | 'url_link';

export type ThemeType = 
  | 'news_alert'
  | 'promotion' 
  | 'standard_post'
  | 'cta_quiz'
  | 'cta_game'
  | 'cta_puzzle'
  | 'cta_challenge'
  | 'news'
  | 'blog'
  | 'tutorial_guide'
  | 'course_tool'
  | 'assessment';

export type AudienceType = 
  | 'existing_members'
  | 'new_members'
  | 'persona_falcon'
  | 'persona_panther'
  | 'persona_wolf'
  | 'persona_lion'
  | 'general_public';

export type TemplateType = 
  | 'social_media'
  | 'presentation'
  | 'video_message'
  | 'anica_chat'
  | 'blog_posts'
  | 'news_article'
  | 'newsletter'
  | 'email_templates'
  | 'custom_templates';

export type VoiceStyle = 
  | 'casual'
  | 'friendly'
  | 'professional'
  | 'creative';

export type PriorityLevel = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'urgent';

// API RESPONSE TYPES

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// FORM AND UI TYPES

export interface FormSelections {
  characterProfile: string;
  theme: string;
  audience: string;
  mediaType: string;
  templateType: string;
  platform: string;
  voiceStyle: string;
}

export interface FormContent {
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
}

export interface PlatformConfig {
  title?: {
    show: boolean;
    maxLength: number;
  };
  description: {
    maxLength: number;
  };
  hashtags: {
    maxCount: number;
    recommended: number;
  };
}

export interface PlatformPreviewStyle {
  aspectRatio: string;
  maxWidth: string;
  label: string;
}

// URL PREVIEW TYPES

export interface UrlPreview {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url: string;
}

// SCHEDULE MODAL TYPES

export interface ScheduleData {
  scheduledDate: string;
  timezone: string;
  repeatOption?: string;
}

export interface ScheduleModalPost {
  id: string;
  contentId: string;
  title: string;
  description: string;
  selectedPlatforms: string[];
  characterProfile: string;
}

// USER AUTHENTICATION TYPES

export interface User {
  id: string;
  email?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}

// DASHBOARD ANALYTICS TYPES

export interface StatusSummary {
  total: number;
  pending: number;
  scheduled: number;
  published: number;
  failed: number;
  actionable: number;
  percentages: Record<PostStatus, number>;
  counts: Record<PostStatus, number>;
}

export interface AnalyticsData {
  totalPosts: number;
  postsThisWeek: number;
  postsThisMonth: number;
  successRate: number;
  platformBreakdown: Record<string, number>;
  statusBreakdown: Record<PostStatus, number>;
  topHashtags: Array<{ tag: string; count: number }>;
  topPlatforms: Array<{ platform: string; count: number }>;
}

// ERROR HANDLING TYPES

export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
  warnings: string[];
}

// EXPORT ALL TYPES FOR EASY IMPORTING
export type {
  // Core entities
  MediaFile,
  ContentPost,
  ScheduledPost,
  PendingPost,
  SavedTemplate,
  CharacterProfile,
  SocialPlatform,
  TelegramChannel,
  User,
  
  // Configuration and UI
  PlatformConfig,
  PlatformPreviewStyle,
  FormSelections,
  FormContent,
  ScheduleData,
  ScheduleModalPost,
  
  // API and responses
  ApiResponse,
  PaginatedResponse,
  UrlPreview,
  ValidationResult,
  
  // Analytics and dashboard
  StatusSummary,
  AnalyticsData,
  
  // Enums and unions
  PostStatus,
  MediaType,
  ThemeType,
  AudienceType,
  TemplateType,
  VoiceStyle,
  PriorityLevel
};
