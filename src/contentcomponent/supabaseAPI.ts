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

  // ENHANCED: Save content post to content_posts table with additional columns
  async saveContentPost(postData: Omit<ContentPost, 'id' | 'createdDate'>): Promise<ContentPost> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured - cannot save to database');
    }
    
    try {
      const client = getSupabaseClient();
      const { data: { user } } = await client.auth.getUser();
      const userId = user?.id || null;

      // Upload media files first
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
                url: supabaseUrl
              };
            } catch (uploadError) {
              console.error('Error uploading media file:', uploadError);
              return mediaFile;
            }
          }
          return mediaFile;
        })
      );

      // ENHANCEMENT: Extract character profile details for additional columns
      let characterDetails = {
        avatar_id: null,
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
              avatar_id: selectedProfile.avatar_id || null,
              name: selectedProfile.name || null,
              username: selectedProfile.username || null,
              role: selectedProfile.role || null
            };
            console.log('Character profile details extracted:', characterDetails);
          }
        } catch (error) {
          console.error('Error loading character profile details:', error);
        }
      }

      // ENHANCEMENT: Extract platform details for additional columns
      let platformDetails = {
        social_platform: null,
        url: null,
        channel_group: null,
        thread_id: null
      };

      if (postData.selectedPlatforms && postData.selectedPlatforms.length > 0) {
        try {
          // Load both regular platforms and Telegram channels
          const [platforms, telegramChannels] = await Promise.all([
            this.loadPlatforms(),
            this.loadTelegramChannels()
          ]);

          // Find the first selected platform details (primary platform for column storage)
          const primaryPlatformId = postData.selectedPlatforms[0];
          
          // Check regular platforms first
          let selectedPlatform = platforms.find(p => p.id === primaryPlatformId);
          
          if (selectedPlatform) {
            platformDetails = {
              social_platform: selectedPlatform.name || null,
              url: selectedPlatform.url || null,
              channel_group: null, // Regular platforms don't have channel_group
              thread_id: null // Regular platforms don't have thread_id
            };
          } else {
            // Check Telegram channels
            const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformId);
            if (selectedTelegram) {
              platformDetails = {
                social_platform: selectedTelegram.name ? `${selectedTelegram.name} (Telegram)` : 'Telegram',
                url: selectedTelegram.channel_group_id ? `https://t.me/${selectedTelegram.channel_group_id}` : null,
                channel_group: selectedTelegram.channel_group_id || null,
                thread_id: selectedTelegram.thread_id || null
              };
            }
          }
          
          console.log('Platform details extracted:', platformDetails);
        } catch (error) {
          console.error('Error loading platform details:', error);
        }
      }

      // Prepare data for database insert with BOTH JSON and individual columns
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
        media_files: uploadedMediaFiles, // JSON field for publishing
        selected_platforms: postData.selectedPlatforms || [], // JSON field for publishing
        status: postData.status || 'pending',
        is_from_template: postData.isFromTemplate || false,
        source_template_id: postData.sourceTemplateId || null,
        user_id: userId,
        created_by: userId,
        is_active: true,
        // ENHANCEMENT: Additional individual columns for fast querying
        avatar_id: characterDetails.avatar_id,
        name: characterDetails.name,
        username: characterDetails.username,
        role: characterDetails.role,
        social_platform: platformDetails.social_platform,
        url: platformDetails.url,
        channel_group: platformDetails.channel_group,
        thread_id: platformDetails.thread_id
      };

      console.log('Saving content post with enhanced data:', {
        contentId: postData.contentId,
        characterDetails,
        platformDetails,
        mediaFilesCount: uploadedMediaFiles.length,
        selectedPlatformsCount: postData.selectedPlatforms?.length || 0
      });

      const { data, error } = await client
        .from('content_posts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Convert back to ContentPost format
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
        status: data.status || 'pending',
        createdDate: new Date(data.created_at),
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      console.log('Content post saved successfully with enhanced data');
      return contentPost;
    } catch (error) {
      console.error('Error saving content post:', error);
      throw error;
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

  // ENHANCED: Update content post with additional columns sync
  async updateContentPost(postId: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    
    try {
      const client = getSupabaseClient();
      const { data: { user } } = await client.auth.getUser();
      const userId = user?.id || null;
      
      // Handle media file updates if needed
      let updatedMediaFiles = updates.mediaFiles;
      if (updates.mediaFiles) {
        updatedMediaFiles = await Promise.all(
          updates.mediaFiles.map(async (mediaFile) => {
            if (mediaFile.url.startsWith('blob:')) {
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

      // ENHANCEMENT: Re-extract character profile details if character changed
      let characterDetails = {};
      if (updates.characterProfile) {
        try {
          const characterProfiles = await this.loadCharacterProfiles();
          const selectedProfile = characterProfiles.find(p => p.id === updates.characterProfile);
          if (selectedProfile) {
            characterDetails = {
              avatar_id: selectedProfile.avatar_id || null,
              name: selectedProfile.name || null,
              username: selectedProfile.username || null,
              role: selectedProfile.role || null
            };
            console.log('Updated character profile details:', characterDetails);
          }
        } catch (error) {
          console.error('Error loading updated character profile details:', error);
        }
      }

      // ENHANCEMENT: Re-extract platform details if platforms changed
      let platformDetails = {};
      if (updates.selectedPlatforms && updates.selectedPlatforms.length > 0) {
        try {
          const [platforms, telegramChannels] = await Promise.all([
            this.loadPlatforms(),
            this.loadTelegramChannels()
          ]);

          const primaryPlatformId = updates.selectedPlatforms[0];
          
          let selectedPlatform = platforms.find(p => p.id === primaryPlatformId);
          
          if (selectedPlatform) {
            platformDetails = {
              social_platform: selectedPlatform.name || null,
              url: selectedPlatform.url || null,
              channel_group: null,
              thread_id: null
            };
          } else {
            const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformId);
            if (selectedTelegram) {
              platformDetails = {
                social_platform: selectedTelegram.name ? `${selectedTelegram.name} (Telegram)` : 'Telegram',
                url: selectedTelegram.channel_group_id ? `https://t.me/${selectedTelegram.channel_group_id}` : null,
                channel_group: selectedTelegram.channel_group_id || null,
                thread_id: selectedTelegram.thread_id || null
              };
            }
          }
          
          console.log('Updated platform details:', platformDetails);
        } catch (error) {
          console.error('Error loading updated platform details:', error);
        }
      }

      // Prepare update data with BOTH JSON and individual columns
      const updateData: Record<string, any> = {};
      if (updates.characterProfile) updateData.character_profile = updates.characterProfile;
      if (updates.theme) updateData.theme = updates.theme;
      if (updates.audience) updateData.audience = updates.audience;
      if (updates.mediaType) updateData.media_type = updates.mediaType;
      if (updates.templateType) updateData.template_type = updates.templateType;
      if (updates.platform !== undefined) updateData.platform = updates.platform;
      if (updates.voiceStyle !== undefined) updateData.voice_style = updates.voiceStyle;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
      if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
      if (updates.cta !== undefined) updateData.cta = updates.cta;
      if (updatedMediaFiles !== undefined) updateData.media_files = updatedMediaFiles;
      if (updates.selectedPlatforms !== undefined) updateData.selected_platforms = updates.selectedPlatforms;
      if (updates.status) updateData.status = updates.status;
      
      // ENHANCEMENT: Add individual columns to update data
      Object.assign(updateData, characterDetails, platformDetails);
      
      updateData.updated_at = new Date().toISOString();

      console.log('Updating content post with enhanced data:', {
        postId,
        updateFields: Object.keys(updateData),
        hasCharacterUpdates: Object.keys(characterDetails).length > 0,
        hasPlatformUpdates: Object.keys(platformDetails).length > 0
      });

      const { data, error } = await client
        .from('content_posts')
        .update(updateData)
        .eq('id', parseInt(postId))
        .select()
        .single();

      if (error) throw error;

      // Convert back to ContentPost format
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
        status: data.status || 'pending',
        createdDate: new Date(data.created_at),
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      console.log('Content post updated successfully with enhanced data');
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
        .order('created_at', { ascending: false });
      
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
