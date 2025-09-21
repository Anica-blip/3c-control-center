export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'gif' | 'interactive' | 'other';
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
  status: 'pending' | 'processing' | 'complete' | 'failed' | 'resending';
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
