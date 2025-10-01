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

      // --- Character Profile Details (WORKING PATTERN) ---
      let characterDetails = {
        character_avatar: null as string | null,
        name: null as string | null,
        username: null as string | null,
        role: null as string | null
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

      // --- Platform Details (SAME PATTERN AS CHARACTER PROFILE) ---
      let platformDetails = {
        platform_id: null as string | null,
        social_platform: null as string | null,
        url: null as string | null,
        channel_group_id: null as string | null,
        thread_id: null as string | null
      };

      // FIXED: Use selectedPlatforms (array of IDs), get first platform ID
      if (postData.selectedPlatforms && postData.selectedPlatforms.length > 0) {
        try {
          const primaryPlatformId = postData.selectedPlatforms[0]; // First platform ID
          console.log('Looking up platform with ID:', primaryPlatformId);
          
          // Load both platforms and telegram
          const [platforms, telegramChannels] = await Promise.all([
            this.loadPlatforms(),
            this.loadTelegramChannels()
          ]);
          
          // Try to find in social_platforms first
          const selectedPlatform = platforms.find(p => p.id === primaryPlatformId);
          
          if (selectedPlatform) {
            console.log('Found social platform:', selectedPlatform.name);
            platformDetails = {
              platform_id: selectedPlatform.id,
              social_platform: selectedPlatform.name || null,
              url: selectedPlatform.url || null
              channel_group_id: null,
              thread_id: null
            };
          } else {
            // Try to find in telegram_configurations
            const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformId);
            if (selectedTelegram) {
              console.log('Found Telegram channel:', selectedTelegram.name);
              platformDetails = {
                id: selectedTelegram.id, || null,
                name: selectedTelegram.name || null,
                url: selectedTelegram.url || null,
                channel_group_id: selectedTelegram.channel_group_id || null,
                thread_id: selectedTelegram.thread_id || null
              };
            }
          }
        } catch (error) {
          console.error('Error loading telegramChannels details:', error);
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

      // --- Prepare data for database ---
      const dbData = {
        content_id: postData.contentId,
        character_profile: postData.characterProfile || null,
        theme: postData.theme || null,
        audience: postData.audience || null,
        media_type: postData.mediaType || null,
        template_type: postData.templateType || null,
        platform: postData.platform || '',
        voice_style: postData.voiceStyle || '',
        title: postData.title || '',
        description: postData.description || '',
        hashtags: postData.hashtags || [],
        keywords: postData.keywords || '',
        cta: postData.cta || '',
        media_files: uploadedMediaFiles,
        selected_platforms: postData.selectedPlatforms || [],
        status: postData.status || 'pending',
        is_from_template: postData.isFromTemplate || false,
        source_template_id: postData.sourceTemplateId || null,
        user_id: userId,
        created_by: userId,
        is_active: true,
        // Character details
        character_avatar: characterDetails.character_avatar,
        name: characterDetails.name,
        username: characterDetails.username,
        role: characterDetails.role,
        // Platform details
        platform_id: platformDetails.platform_id,
        social_platform: platformDetails.social_platform,
        url: platformDetails.url,
        channel_group_id: platformDetails.channel_group_id,
        thread_id: platformDetails.thread_id,
        updated_at: new Date().toISOString()
      };

      console.log('Platform details to save:', platformDetails);

      let finalData;

      // Use UPDATE or UPSERT based on whether we have a supabaseId
      if (postData.supabaseId) {
        console.log(`UPDATING existing post with Supabase ID: ${postData.supabaseId}`);
        
        const { data, error } = await client
          .from('content_posts')
          .update(dbData)
          .eq('id', parseInt(postData.supabaseId))
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        finalData = data;
      } else {
        console.log(`UPSERTING post with content_id: ${postData.contentId}`);
        
        const insertData = {
          ...dbData,
          created_at: new Date().toISOString()
        };

        const { data, error } = await client
          .from('content_posts')
          .upsert(insertData, { 
            onConflict: 'content_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (error) {
          console.error('Upsert error:', error);
          throw error;
        }
        finalData = data;
      }

      // --- Convert back to ContentPost format ---
      const contentPost: ContentPost = {
        id: finalData.id.toString(),
        contentId: finalData.content_id,
        characterProfile: finalData.character_profile || '',
        theme: finalData.theme || '',
        audience: finalData.audience || '',
        mediaType: finalData.media_type || '',
        templateType: finalData.template_type || '',
        platform: finalData.platform || '',
        voiceStyle: finalData.voice_style || '',
        title: finalData.title || '',
        description: finalData.description || '',
        hashtags: finalData.hashtags || [],
        keywords: finalData.keywords || '',
        cta: finalData.cta || '',
        mediaFiles: uploadedMediaFiles,
        selectedPlatforms: finalData.selected_platforms || [],
        detailedPlatforms: finalData.selected_platforms || [],
        status: finalData.status || 'pending',
        createdDate: new Date(finalData.created_at),
        scheduledDate: finalData.scheduled_date ? new Date(finalData.scheduled_date) : undefined,
        isFromTemplate: finalData.is_from_template || false,
        sourceTemplateId: finalData.source_template_id,
        supabaseId: finalData.id.toString()
      };

      console.log('Post saved/updated successfully. Supabase ID:', contentPost.supabaseId);
      return contentPost;
    } catch (error) {
      console.error('Error saving/updating content post:', error);
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

      const contentPosts: ContentPost[] = (data || []).map(record => ({
        id: record.id.toString(),
        contentId: record.content_id || `content-${record.id}`,
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

  // Update content post - ALWAYS uses UPDATE, never INSERT
  async updateContentPost(postId: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    
    console.log(`Updating post with ID: ${postId}`);
    console.log('Updates received:', updates);
    
    try {
      const client = getSupabaseClient();
      const { data: { user } } = await client.auth.getUser();
      const userId = user?.id || null;
      
      // Handle media file updates
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

      // Resolve character profile details if updated
      let updatedCharacterDetails = {};
      if (updates.characterProfile !== undefined) {
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
          } else {
            updatedCharacterDetails = {
              character_avatar: null,
              name: null,
              username: null,
              role: null
            };
          }
        } catch (error) {
          console.error('Error loading updated character profile details:', error);
        }
      }

      // FIXED: Resolve platform details using SAME PATTERN as character profile
      let updatedPlatformDetails = {};
      
      if (updates.selectedPlatforms !== undefined) {
        if (updates.selectedPlatforms && updates.selectedPlatforms.length > 0) {
          try {
            const primaryPlatformId = updates.selectedPlatforms[0]; // First platform ID
            console.log('Updating platform to ID:', primaryPlatformId);
            
            const [platforms, telegramChannels] = await Promise.all([
              this.loadPlatforms(),
              this.loadTelegramChannels()
            ]);
            
            const selectedPlatform = platforms.find(p => p.id === primaryPlatformId);
            
            if (selectedPlatform) {
              console.log('Found platform for update:', selectedPlatform.name);
              updatedPlatformDetails = {
                platform_id: selectedPlatform.id,
                social_platform: selectedPlatform.name || null,
                url: selectedPlatform.url || null,
                channel_group_id: null,
                thread_id: null
              };
            } else {
              const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformId);
              if (selectedTelegram) {
                console.log('Found Telegram for update:', selectedTelegram.name);
                updatedPlatformDetails = {
                  platform_id: selectedTelegram.id.toString(),
                  social_platform: selectedTelegram.name || 'Telegram',
                  url: selectedTelegram.url || null,
                  channel_group_id: selectedTelegram.channel_group_id || null,
                  thread_id: selectedTelegram.thread_id || null
                };
              }
            }
          } catch (error) {
            console.error('Error loading updated platform details:', error);
          }
        } else {
          // Clear platform details
          updatedPlatformDetails = {
            platform_id: null,
            social_platform: null,
            url: null,
            channel_group_id: null,
            thread_id: null
          };
        }
      }

      // Build update data
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (updates.contentId !== undefined) updateData.content_id = updates.contentId;
      if (updates.characterProfile !== undefined) updateData.character_profile = updates.characterProfile;
      if (updates.theme !== undefined) updateData.theme = updates.theme;
      if (updates.audience !== undefined) updateData.audience = updates.audience;
      if (updates.mediaType !== undefined) updateData.media_type = updates.mediaType;
      if (updates.templateType !== undefined) updateData.template_type = updates.templateType;
      if (updates.platform !== undefined) updateData.platform = updates.platform;
      if (updates.voiceStyle !== undefined) updateData.voice_style = updates.voiceStyle;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
      if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
      if (updates.cta !== undefined) updateData.cta = updates.cta;
      if (updatedMediaFiles !== undefined) updateData.media_files = updatedMediaFiles;
      if (updates.selectedPlatforms !== undefined) updateData.selected_platforms = updates.selectedPlatforms;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.scheduledDate !== undefined) updateData.scheduled_date = updates.scheduledDate?.toISOString() || null;
      
      // Add character and platform details
      Object.assign(updateData, updatedCharacterDetails, updatedPlatformDetails);

      console.log('Update data being sent:', updateData);

      const { data, error } = await client
        .from('content_posts')
        .update(updateData)
        .eq('id', parseInt(postId))
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      const contentPost: ContentPost = {
        id: data.id.toString(),
        contentId: data.content_id,
        characterProfile: data.character_profile || '',
        theme: data.theme || '',
        audience: data.audience || '',
        mediaType: data.media_type || '',
        templateType: data.template_type || '',
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

      console.log('Post updated successfully. Supabase ID:', contentPost.supabaseId);
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
      
      const transformedData = (data || []).map(platform => ({
        ...platform,
        isActive: platform.is_active,
        isDefault: false,
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

// Export the client safely for TemplateLibrary.tsx
export { supabase };
