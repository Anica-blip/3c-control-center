export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'gif' | 'interactive' | 'other';
  size: number;
  url: string;
  supabaseUrl?: string; // URL after upload to Supabase
  urlPreview?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  };
}

export interface ContentPost {
  id: string;
  contentId: string; // CP-YYYY-### format
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
  status: 'pending' | 'scheduled' | 'published';
  createdDate: Date;
  scheduledDate?: Date;
  isFromTemplate?: boolean;
  sourceTemplateId?: string;
  supabaseId?: string; // Supabase record ID
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
  description: string;
  avatar_id: string | null;
  is_active: boolean;
  created_at: string;
}
