// /src/schedulecomponent/types.ts - FIXED to match EnhancedContentCreationForm patterns
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

// Content Post from EnhancedContentCreationForm (draft state)
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
  status: 'draft' | 'pending' | 'scheduled' | 'published';
  createdDate: Date;
  isFromTemplate?: boolean;
  sourceTemplateId?: string;
  user_id?: string;
  created_by?: string;
}

// Dashboard Post (in Schedule Manager - forwarded from ContentPost)
export interface DashboardPost {
  id: string;
  original_content_id: string; // Reference to content_posts.id
  content_id: string; // The contentId from content creation
  character_profile: string;
  theme: string;
  audience: string;
  media_type: string;
  template_type: string;
  platform: string;
  voice_style: string;
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  media_files: MediaFile[];
  selected_platforms: string[];
  status: 'pending_schedule' | 'scheduled' | 'publishing' | 'published' | 'failed';
  created_date: Date;
  updated_at: Date;
}

// Scheduled Post (final scheduled state)
export interface ScheduledPost {
  id: string;
  dashboard_post_id: string; // Reference to dashboard_posts.id
  content_id: string;
  character_profile: string;
  theme: string;
  audience: string;
  media_type: string;
  template_type: string;
  platform: string;
  voice_style: string;
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  media_files: MediaFile[];
  selected_platforms: string[];
  scheduled_date: Date;
  status: 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
  failure_reason?: string;
  last_attempt?: Date;
  retry_count?: number;
  created_date: Date;
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  persona_target?: string;
  audience_segment?: string;
  campaign_id?: string;
}

// Platform Assignment (for tracking which platforms posts go to)
export interface PlatformAssignment {
  id: string;
  scheduled_post_id: string;
  platform_id: string;
  platform_name: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: Date;
  error_message?: string;
  created_at: Date;
}

// Dashboard Template (saved templates in Schedule Manager)
export interface DashboardTemplate {
  id: string;
  template_name: string;
  character_profile: string;
  theme: string;
  audience: string;
  media_type: string;
  template_type: string;
  platform: string;
  voice_style: string;
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
  created_at: Date;
  updated_at: Date;
}

// Platform Info
export interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}
