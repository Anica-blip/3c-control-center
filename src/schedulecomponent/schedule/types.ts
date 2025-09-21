// All TypeScript interfaces and types
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
}

export interface ScheduledPost extends Omit<PendingPost, 'status'> {
  scheduled_date: Date;
  status: 'pending' | 'processing' | 'complete' | 'failed' | 'resending';
  failure_reason?: string;
  last_attempt?: Date;
  retry_count?: number;
  is_from_template?: boolean;
  source_template_id?: string;
}

export interface PostTemplate {
  id: string;
  name: string;
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
  user_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// ... other interfaces
