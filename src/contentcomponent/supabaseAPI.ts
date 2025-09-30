import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ContentPost, MediaFile } from './types';

// Initialize Supabase client - SINGLE INSTANCE with proper typing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  console.log('Supabase client created successfully (centralized instance)');
} else {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseKey,
    urlValue: supabaseUrl ? 'set' : 'missing',
    keyValue: supabaseKey ? 'set' : 'missing'
  });
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => Boolean(supabase && supabaseUrl && supabaseKey);

// Type-safe helper to get supabase client
const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  return supabase;
};

// Internal lock to prevent duplicate saves
let saveInProgress = false;

// FIXED: Export supabaseAPI as named export for other components
export const supabaseAPI = {
  // Upload media file to content-media bucket
  async uploadMediaFile(file: File, contentId: string, userId: string): Promise<string> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    
    try {
      const client = getSupabaseClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${contentId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await client.storage
        .from('content-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = client.storage
        .from('content-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media file:', error);
      throw error;
    }
  }, 

  // Save content post to content_posts table
  async saveContentPost(postData: Omit<ContentPost, 'id' | 'createdDate'>): Promise<ContentPost> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured - cannot save to database');
    }

    // Prevent duplicate saves
    if (saveInProgress) {
      throw new Error('Save already in progress. Please wait.');
    }
    saveInProgress = true;

    try {
      const client = getSupabaseClient();
      const { data: { user } } = await client.auth.getUser();
      const userId = user?.id || null;

      // --- Character Profile Details ---
      let characterDetails = {
        character_avatar: null,
        name: null,
        username: null,
        role: null
      };

      if (postData.characterProfile) {
        try {
          const characterProfiles = await this.loadCharacterProfiles();
          const selectedProfile = characterProfiles.find(p => p.id === postData.characterProfile);
          if (selectedProfile) {
            characterDetails = {
              character_avatar: selectedProfile.avatar_id || null,
              name: selectedProfile.name || null,
              username: selectedProfile.username || null,
              role: selectedProfile.role || null
            };
          }
        } catch (error) {
          console.error('Error loading character profile details:', error);
        }
      }

      // --- Platform Details ---
      let platformDetails = {
        social_platform: null,
        url: null,
        channel_group_id: null,
        thread_id: null
      };

      let platformsToStore: string[] = [];
      let detailedPlatforms: any[] = [];

      // Always use detailedPlatforms if present
      if (postData.detailedPlatforms && postData.detailedPlatforms.length > 0) {
        platformsToStore = postData.detailedPlatforms;
        detailedPlatforms = postData.detailedPlatforms;
      } else if (postData.selectedPlatforms && postData.selectedPlatforms.length > 0) {
        platformsToStore = postData.selectedPlatforms;
        detailedPlatforms = postData.selectedPlatforms;
      }

      if (platformsToStore.length > 0) {
        try {
          const [platforms, telegramChannels] = await Promise.all([
            this.loadPlatforms(),
            this.loadTelegramChannels()
          ]);
          const primaryPlatformId = platformsToStore[0];
          let selectedPlatform = platforms.find(p => p.id === primaryPlatformId);
          if (selectedPlatform) {
            platformDetails = {
              social_platform: selectedPlatform.name || null,
              url: selectedPlatform.url || null,
              channel_group_id: null,
              thread_id: null
            };
          } else {
            const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformId);
            if (selectedTelegram) {
              platformDetails = {
                social_platform: selectedTelegram.name ? `${selectedTelegram.name} (Telegram)` : 'Telegram',
                url: selectedTelegram.channel_group_id ? `https://t.me/${selectedTelegram.channel_group_id}` : null,
                channel_group_id: selectedTelegram.channel_group_id || null,
                thread_id: selectedTelegram.thread_id || null
              };
            }
          }
        } catch (error) {
          console.error('Error loading platform details:', error);
        }
      }

      // --- Upload media files ---
      const uploadedMediaFiles = await Promise.all(
        (postData.mediaFiles || []).map(async (mediaFile) => {
          if (mediaFile.url.startsWith('blob:')) {
            try {
              const response = await fetch(mediaFile.url);
              const blob = await response.blob();
              const file = new File([blob], mediaFile.name, { type: blob.type });
              const supabaseUrl = await this.uploadMediaFile(file, postData.contentId, userId || 'anonymous');
              return {
                ...mediaFile,
                supabaseUrl: supabaseUrl,
                url: supabaseUrl // Update URL to Supabase URL
              };
            } catch (uploadError) {
              console.error('Error uploading media file:', uploadError);
              return mediaFile; // Keep original if upload fails
            }
          }
          return mediaFile;
        })
      );

      // --- Prepare data for database insert ---
      const insertData = {
        content_id: postData.contentId,
        character_profile: postData.characterProfile,
        theme: postData.theme,
        audience: postData.audience,
        media_type: postData.mediaType,
        template_type: postData.templateType,
        platform: postData.platform || '',
        voice_style: postData.voiceStyle || '',
        title: postData.title || '',
        description: postData.description || '',
        hashtags: postData.hashtags || [],
        keywords: postData.keywords || '',
        cta: postData.cta || '',
        media_files: uploadedMediaFiles,
        selected_platforms: platformsToStore,
        status: postData.status || 'pending',
        is_from_template: postData.isFromTemplate || false,
        source_template_id: postData.sourceTemplateId || null,
        user_id: userId, // REQUIRED for RLS
        created_by: userId, // REQUIRED for tracking
        is_active: true,
        character_avatar: characterDetails.character_avatar,
        name: characterDetails.name,
        username: characterDetails.username,
        role: characterDetails.role,
        social_platform: platformDetails.social_platform,
        url: platformDetails.url,
        channel_group_id: platformDetails.channel_group_id,
        thread_id: platformDetails.thread_id,
        created_at: new Date().toISOString()
      };

      // --- Prevent accidental multiple inserts ---
      const { data, error } = await client
        .from('content_posts')
        .insert([insertData], { upsert: false })
        .select()
        .single();

      if (error) throw error;

      // --- Convert back to ContentPost format ---
      const contentPost: ContentPost = {
        id: data.id.toString(),
        contentId: data.content_id,
        characterProfile: data.character_profile,
        theme: data.theme,
        audience: data.audience,
        mediaType: data.media_type,
        templateType: data.template_type,
        platform: data.platform || '',
        voiceStyle: data.voice_style || '',
        title: data.title || '',
        description: data.description || '',
        hashtags: data.hashtags || [],
        keywords: data.keywords || '',
        cta: data.cta || '',
        mediaFiles: uploadedMediaFiles,
        selectedPlatforms: data.selected_platforms || [],
        detailedPlatforms: data.selected_platforms || [],
        status: data.status || 'pending',
        createdDate: new Date(data.created_at),
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      return contentPost;
    } catch (error) {
      console.error('Error saving content post:', error);
      throw error;
    } finally {
      saveInProgress = false;
    }
  },

  // Load content posts from content_posts table
  async loadContentPosts(): Promise<ContentPost[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured - cannot load from database');
    }
    
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('content_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to ContentPost format
      const contentPosts: ContentPost[] = (data || []).map(record => ({
        id: record.id.toString(),
        contentId: record.content_id || '',
        characterProfile: record.character_profile || '',
        theme: record.theme || '',
        audience: record.audience || '',
        mediaType: record.media_type || '',
        templateType: record.template_type || '',
        platform: record.platform || '',
        voiceStyle: record.voice_style || '',
        title: record.title || '',
        description: record.description || '',
        hashtags: Array.isArray(record.hashtags) ? record.hashtags : [],
        keywords: record.keywords || '',
        cta: record.cta || '',
        mediaFiles: Array.isArray(record.media_files) ? record.media_files : [],
        selectedPlatforms: Array.isArray(record.selected_platforms) ? record.selected_platforms : [],
        detailedPlatforms: Array.isArray(record.selected_platforms) ? record.selected_platforms : [],
        status: record.status || 'pending',
        createdDate: new Date(record.created_at),
        scheduledDate: record.scheduled_date ? new Date(record.scheduled_date) : undefined,
        isFromTemplate: record.is_from_template || false,
        sourceTemplateId: record.source_template_id || undefined,
        supabaseId: record.id.toString()
      }));

      return contentPosts;
    } catch (error) {
      console.error('Error loading content posts:', error);
      return [];
    }
  },

  // Update content post - GPT-4.1 FIXED VERSION
  async updateContentPost(postId: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    
    try {
      const client = getSupabaseClient();
      const { data: { user } } = await client.auth.getUser();
      const userId = user?.id || null;
      
      // Handle media file updates if needed (unchanged)
      let updatedMediaFiles = updates.mediaFiles;
      if (updates.mediaFiles) {
        updatedMediaFiles = await Promise.all(
          updates.mediaFiles.map(async (mediaFile) => {
            if (mediaFile.url.startsWith('blob:')) {
              // Upload new media file
              try {
                const response = await fetch(mediaFile.url);
                const blob = await response.blob();
                const file = new File([blob], mediaFile.name, { type: blob.type });
                const supabaseUrl = await this.uploadMediaFile(file, updates.contentId || 'updated', userId || 'anonymous');
                return {
                  ...mediaFile,
                  supabaseUrl: supabaseUrl,
                  url: supabaseUrl
                };
              } catch (uploadError) {
                console.error('Error uploading new media file:', uploadError);
                return mediaFile;
              }
            }
            return mediaFile;
          })
        );
      }

      // Always resolve character profile details if characterProfile is present
      let updatedCharacterDetails = {};
      if (updates.characterProfile) {
        try {
          const characterProfiles = await this.loadCharacterProfiles();
          const selectedProfile = characterProfiles.find(p => p.id === updates.characterProfile);
          if (selectedProfile) {
            updatedCharacterDetails = {
              character_avatar: selectedProfile.avatar_id || null,
              name: selectedProfile.name || null,
              username: selectedProfile.username || null,
              role: selectedProfile.role || null
            };
          }
        } catch (error) {
          console.error('Error loading updated character profile details:', error);
        }
      }

      // --- NEW: Always resolve platform details on update ---
      let updatedPlatformDetails = {
        social_platform: null,
        url: null,
        channel_group_id: null,
        thread_id: null
      };
      // Prefer updates.selectedPlatforms, else keep DB value unchanged (you may want to fetch current row here for true "no change")
      let platformsToUpdate = [];
      if (updates.detailedPlatforms && updates.detailedPlatforms.length > 0) {
        platformsToUpdate = updates.detailedPlatforms;
      } else if (updates.selectedPlatforms && updates.selectedPlatforms.length > 0) {
        platformsToUpdate = updates.selectedPlatforms;
      }
      if (platformsToUpdate.length > 0) {
        try {
          const [platforms, telegramChannels] = await Promise.all([
            this.loadPlatforms(),
            this.loadTelegramChannels()
          ]);
          const primaryPlatformId = platformsToUpdate[0];
          let selectedPlatform = platforms.find(p => p.id === primaryPlatformId);
          if (selectedPlatform) {
            updatedPlatformDetails = {
              social_platform: selectedPlatform.name || null,
              url: selectedPlatform.url || null,
              channel_group_id: null,
              thread_id: null
            };
          } else {
            const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformId);
            if (selectedTelegram) {
              updatedPlatformDetails = {
                social_platform: selectedTelegram.name ? `${selectedTelegram.name} (Telegram)` : 'Telegram',
                url: selectedTelegram.channel_group_id ? `https://t.me/${selectedTelegram.channel_group_id}` : null,
                channel_group_id: selectedTelegram.channel_group_id || null,
                thread_id: selectedTelegram.thread_id || null
              };
            }
          }
        } catch (error) {
          console.error('Error loading updated platform details:', error);
        }
      }
      // --- END NEW LOGIC ---

      // --- ALWAYS pass all these fields, not just the changed ones ---
      const updateData: Record<string, any> = {
        character_profile: updates.characterProfile,
        theme: updates.theme,
        audience: updates.audience,
        media_type: updates.mediaType,
        template_type: updates.templateType,
        platform: updates.platform,
        voice_style: updates.voiceStyle,
        title: updates.title,
        description: updates.description,
        hashtags: updates.hashtags,
        keywords: updates.keywords,
        cta: updates.cta,
        media_files: updatedMediaFiles,
        selected_platforms: platformsToUpdate,
        status: updates.status,
        ...updatedCharacterDetails,
        ...updatedPlatformDetails,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('content_posts')
        .update(updateData)
        .eq('id', parseInt(postId))
        .select()
        .single();

      if (error) throw error;

      // Convert back to ContentPost format (unchanged)
      const contentPost: ContentPost = {
        id: data.id.toString(),
        contentId: data.content_id,
        characterProfile: data.character_profile,
        theme: data.theme,
        audience: data.audience,
        mediaType: data.media_type,
        templateType: data.template_type,
        platform: data.platform || '',
        voiceStyle: data.voice_style || '',
        title: data.title || '',
        description: data.description || '',
        hashtags: data.hashtags || [],
        keywords: data.keywords || '',
        cta: data.cta || '',
        mediaFiles: data.media_files || [],
        selectedPlatforms: data.selected_platforms || [],
        detailedPlatforms: data.selected_platforms || [],
        status: data.status || 'pending',
        createdDate: new Date(data.created_at),
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      return contentPost;
    } catch (error) {
      console.error('Error updating content post:', error);
      throw error;
    }
  },

  // Soft delete content post
  async deleteContentPost(postId: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('content_posts')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', parseInt(postId));

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting content post:', error);
      throw error;
    }
  },

  // Load character profiles
  async loadCharacterProfiles(): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured - cannot load character profiles');
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('character_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading character profiles:', error);
      return [];
    }
  },

  // Load platforms from social_platforms table
  async loadPlatforms(): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured - cannot load platforms');
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('social_platforms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to ensure compatibility with existing components
      const transformedData = (data || []).map(platform => ({
        ...platform,
        // Ensure both naming conventions are available for compatibility
        isActive: platform.is_active,
        isDefault: false, // FIXED: Remove default flag completely
        displayName: platform.display_name || platform.name
      }));
      
      return transformedData;
    } catch (error) {
      console.error('Error loading platforms from social_platforms table:', error);
      return [];
    }
  },

  // Load Telegram configurations
  async loadTelegramChannels(): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured - cannot load Telegram channels');
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('telegram_configurations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false});
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading Telegram channels:', error);
      return [];
    }
  }
};

// FIXED: Export the client safely for TemplateLibrary.tsx
export { supabase };
