// /src/schedulecomponent/types.ts - ENHANCED with error handling types

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'gif' | 'interactive' | 'url_link' | 'other';
  size: number;
  url: string;
  urlPreview?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  };
}

export interface SocialPlatform {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface CharacterProfile {
  id: string;
  name: string;
  username: string;
  role: string;
  avatar_id?: string;
}

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
  status: 'draft' | 'pending' | 'pending_schedule' | 'scheduled' | 'published' | 'failed';
  createdDate: Date;
  isFromTemplate?: boolean;
  sourceTemplateId?: string;
  user_id?: string;
  created_by?: string;
}

export interface DashboardPost {
  id: string;
  content_id: string;
  character_profile: string;
  theme: string;
  audience: string;
  media_type: string;
  template_type: string;
  platform: string;
  voice_style?: string;
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  media_files: MediaFile[];
  selected_platforms: string[];
  status: 'draft' | 'pending' | 'pending_schedule' | 'scheduled' | 'published' | 'failed';
  created_date: Date;
  is_from_template?: boolean;
  source_template_id?: string;
  user_id?: string;
  created_by?: string;
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
  character_avatar?: string;
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

export interface ScheduledPost {
  id: string;
  content_id: string;
  character_profile: string;
  character_avatar?: string;
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
  scheduled_date: Date | null;
  timezone?: string;
  service_type?: string;
  post_content?: {
    media_files: MediaFile[];
    text_post: {
      sender_profile: {
        profile_id: string;
        avatar: string;
        name: string;
        username: string;
        role: string;
      } | null;
      title: string;
      description: string;
      hashtags: string[];
      seo_keywords: string;
      cta: string;
    };
  };
  status: 'scheduled' | 'pending' | 'processing' | 'publishing' | 'published' | 'complete' | 'failed' | 'resending';
  failure_reason?: string;
  last_attempt?: Date;
  retry_count?: number;
  original_post_id?: string;
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  persona_target?: string;
  audience_segment?: string;
  campaign_id?: string;
  platformDetails?: any[];
  created_date: Date;
  user_id: string;
  created_by: string;
  is_from_template?: boolean;
  source_template_id?: string;
}

export interface SavedTemplate {
  id: string;
  template_name: string;
  character_profile: string;
  character_avatar?: string;
  theme: string;
  audience: string;
  media_type: string;
  template_type: string;
  platform: string;
  voice_style?: string;
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  media_files?: MediaFile[];
  selected_platforms: string[];
  usage_count: number;
  is_active: boolean;
  is_deleted?: boolean;
  template_version: number;
  persona_target?: string;
  audience_segment?: string;
  campaign_type?: string;
  source_template_id?: string;
  // Character profile details
  name?: string;
  username?: string;
  role?: string;
  // Platform details
  social_platform?: string;
  channel_group_id?: string;
  thread_id?: string;
  url?: string;
  platform_id?: string;
  platform_icon?: string;
  type?: string;
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

// Error handling types
export interface ApiError {
  message: string;
  code: string;
  type: 'network' | 'validation' | 'authorization' | 'server' | 'unknown';
  details?: Record<string, any>;
  timestamp: Date;
  retryable: boolean;
}

export interface OperationState {
  loading: boolean;
  error: ApiError | null;
  success: boolean;
  message?: string;
}

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  dismissible: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  validationErrors?: ValidationError[];
}

// External Service for cron job forwarding
export interface ExternalService {
  id: string;
  service_type: string;
  url: string;
  is_active: boolean;
  api_key?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Platform Assignment for tracking delivery status
export interface DashboardPlatformAssignment {
  id: string;
  scheduled_post_id: string;
  platform_id: string;
  platform_name: string;
  delivery_status: 'pending' | 'sent' | 'failed';
  sent_at?: Date;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

