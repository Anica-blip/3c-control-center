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
      
      // ✅ FIX: Use SYSTEM_USER_ID instead of NULL
      const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
      const userId = user?.id || SYSTEM_USER_ID;

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

      // FIXED: Use selectedPlatforms (array of IDs), get first platform Url
      if (postData.selectedPlatforms && postData.selectedPlatforms.length > 0) {
        try {
          const primaryPlatformId = postData.selectedPlatforms[0]; // First platform ID
          console.log('Looking up platform with Id:', primaryPlatformId);
          
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
              url: selectedPlatform.url || null,
              channel_group_id: null,
              thread_id: null
            };
          } else {
            // Try to find in telegram_configurations
            const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformId);
            if (selectedTelegram) {
              console.log('Found Telegram channel:', selectedTelegram.name);
              platformDetails = {
                platform_id: selectedTelegram.id.toString(),
                social_platform: selectedTelegram.name || null,
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
        thread_id: platformDetails.thread_id
      };

      console.log('Saving post data to content_posts:', dbData);

      const { data, error } = await client
        .from('content_posts')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
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
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      console.log('Content post saved successfully. Supabase ID:', contentPost.supabaseId);
      return contentPost;
    } catch (error) {
      console.error('Error saving content post:', error);
      throw error;
    } finally {
      saveInProgress = false;
    }
  },

  // ⭐⭐⭐ NEW FUNCTION: Add to Schedule - FIX #1 ⭐⭐⭐
  // This function handles scheduling a post by:
  // 1. Updating/Inserting into content_posts with status='scheduled'
  // 2. Inserting into scheduled_posts with posting_status='pending'
  async addToSchedule(postData: any): Promise<{ success: boolean; data?: any; error?: any }> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured - cannot schedule post');
    }

    try {
      const client = getSupabaseClient();
      const { data: { user } } = await client.auth.getUser();
      
      console.log('🎯 SCHEDULING POST - Starting schedule workflow...');
      console.log('Post data received:', postData);
      
      // ✅ FIX: Ensure user_id and created_by are NEVER NULL
      const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
      const finalUserId = postData.user_id || user?.id || SYSTEM_USER_ID;
      const finalCreatedBy = postData.created_by || user?.id || SYSTEM_USER_ID;
      
      console.log('Using user_id:', finalUserId);
      console.log('Using created_by:', finalCreatedBy);

      // --- Get Character Profile Details ---
      let characterDetails = {
        character_avatar: null as string | null,
        name: null as string | null,
        username: null as string | null,
        role: null as string | null,
        voice_style: postData.voiceStyle || null
      };

      if (postData.characterProfile) {
        try {
          const characterProfiles = await this.loadCharacterProfiles();
          const selectedProfile = characterProfiles.find((p: any) => p.id === postData.characterProfile);
          if (selectedProfile) {
            characterDetails = {
              character_avatar: selectedProfile.avatar_id || null,
              name: selectedProfile.name || null,
              username: selectedProfile.username || null,
              role: selectedProfile.role || null,
              voice_style: postData.voiceStyle || null
            };
            console.log('✅ Character profile details loaded:', characterDetails);
          }
        } catch (error) {
          console.error('Error loading character profile:', error);
        }
      }

      // --- Get Platform Details ---
      let platformDetails = {
        platform_id: null as string | null,
        social_platform: null as string | null,
        url: null as string | null,
        channel_group_id: null as string | null,
        thread_id: null as string | null,
        platform_icon: null as string | null,
        type: null as string | null
      };

      if (postData.selectedPlatforms && postData.selectedPlatforms.length > 0) {
        try {
          const primaryPlatformId = postData.selectedPlatforms[0];
          console.log('Looking up platform with ID:', primaryPlatformId);
          
          const [platforms, telegramChannels] = await Promise.all([
            this.loadPlatforms(),
            this.loadTelegramChannels()
          ]);
          
          const selectedPlatform = platforms.find((p: any) => p.id === primaryPlatformId);
          
          if (selectedPlatform) {
            console.log('✅ Found social platform:', selectedPlatform.name);
            platformDetails = {
              platform_id: selectedPlatform.id.toString(),
              social_platform: selectedPlatform.name || null,
              url: selectedPlatform.url || null,
              channel_group_id: null,
              thread_id: null,
              platform_icon: selectedPlatform.platform_icon || null,
              type: selectedPlatform.type || 'social'
            };
          } else {
            const selectedTelegram = telegramChannels.find((t: any) => t.id.toString() === primaryPlatformId);
            if (selectedTelegram) {
              console.log('✅ Found Telegram channel:', selectedTelegram.name);
              platformDetails = {
                platform_id: selectedTelegram.id.toString(),
                social_platform: selectedTelegram.name || 'Telegram',
                url: selectedTelegram.url || null,
                channel_group_id: selectedTelegram.channel_group_id || null,
                thread_id: selectedTelegram.thread_id || null,
                platform_icon: 'TG',
                type: selectedTelegram.thread_id ? 'telegram_group' : 'telegram_channel'
              };
            }
          }
          console.log('✅ Platform details loaded:', platformDetails);
        } catch (error) {
          console.error('Error loading platform details:', error);
        }
      }

      // --- Upload media files if needed ---
      const uploadedMediaFiles = await Promise.all(
        (postData.mediaFiles || []).map(async (mediaFile: any) => {
          if (mediaFile.url?.startsWith('blob:')) {
            try {
              const response = await fetch(mediaFile.url);
              const blob = await response.blob();
              const file = new File([blob], mediaFile.name, { type: blob.type });
              const supabaseUrl = await this.uploadMediaFile(file, postData.contentId, finalUserId);
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

      // ========================================================================
      // STEP 1: Update or Insert into content_posts
      // ========================================================================
      let contentPostId: number;
      
      if (postData.id) {
        // UPDATE existing post in content_posts
        console.log('📝 UPDATING existing post in content_posts with id:', postData.id);
        
        const updateData = {
          status: 'scheduled',
          scheduled_date: postData.scheduledDate || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Update other fields if provided
          title: postData.title || null,
          description: postData.description || null,
          hashtags: postData.hashtags || [],
          keywords: postData.keywords || null,
          cta: postData.cta || null,
          media_files: uploadedMediaFiles,
          selected_platforms: postData.selectedPlatforms || [],
          ...characterDetails,
          ...platformDetails
        };
        
        const { error: updateError } = await client
          .from('content_posts')
          .update(updateData)
          .eq('id', postData.id);
        
        if (updateError) {
          console.error('❌ Error updating content_posts:', updateError);
          throw updateError;
        }
        
        contentPostId = postData.id;
        console.log('✅ content_posts updated successfully with status: scheduled');
        
      } else {
        // INSERT new post into content_posts
        console.log('📝 INSERTING new post into content_posts');
        
        const insertData = {
          content_id: postData.contentId,
          character_profile: postData.characterProfile || null,
          theme: postData.theme || null,
          audience: postData.audience || null,
          media_type: postData.mediaType || null,
          template_type: postData.templateType || null,
          platform: postData.platform || '',
          title: postData.title || '',
          description: postData.description || '',
          hashtags: postData.hashtags || [],
          keywords: postData.keywords || '',
          cta: postData.cta || '',
          media_files: uploadedMediaFiles,
          selected_platforms: postData.selectedPlatforms || [],
          status: 'scheduled',
          is_from_template: postData.isFromTemplate || false,
          source_template_id: postData.sourceTemplateId || null,
          scheduled_date: postData.scheduledDate || new Date().toISOString(),
          user_id: finalUserId,
          created_by: finalCreatedBy,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...characterDetails,
          ...platformDetails
        };
        
        const { data: newPost, error: insertError } = await client
          .from('content_posts')
          .insert(insertData)
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ Error inserting into content_posts:', insertError);
          throw insertError;
        }
        
        contentPostId = newPost.id;
        console.log('✅ New post inserted into content_posts with id:', contentPostId);
      }

      // ========================================================================
      // STEP 2: ⭐ INSERT into scheduled_posts (THIS IS THE CRITICAL FIX) ⭐
      // ========================================================================
      console.log('🚀 INSERTING into scheduled_posts with content_id:', postData.contentId);
      
      // ⭐ FIX #2: Leave scheduled_date, timezone, service_type as NULL
      // This makes the post appear in the PENDING TAB
      // User will add these values in Schedule Manager's Pending tab
      let scheduledDateTime = postData.scheduledDate || null;
      let scheduledTime = null;
      
      if (scheduledDateTime) {
        const date = new Date(scheduledDateTime);
        scheduledTime = date.toTimeString().split(' ')[0]; // Extract HH:MM:SS
      }
      
      const scheduledPostData = {
        // Core content fields (38 columns)
        content_id: postData.contentId,
        character_profile: postData.characterProfile || null,
        theme: postData.theme || null,
        audience: postData.audience || null,
        media_type: postData.mediaType || null,
        template_type: postData.templateType || null,
        platform: postData.platform || '',
        title: postData.title || '',
        description: postData.description || '',
        hashtags: postData.hashtags || [],
        keywords: postData.keywords || '',
        cta: postData.cta || '',
        media_files: uploadedMediaFiles,
        selected_platforms: postData.selectedPlatforms || [],
        status: 'pending', // ⭐ FIX: Set to 'pending' not 'scheduled'
        is_from_template: postData.isFromTemplate || false,
        source_template_id: postData.sourceTemplateId || null,
        created_date: new Date().toISOString(),
        scheduled_date: null, // ⭐ FIX #2: NULL until user schedules in Pending tab
        user_id: finalUserId,
        created_by: finalCreatedBy,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Character details
        ...characterDetails,
        
        // Platform details
        ...platformDetails,
        
        // Scheduled_posts specific columns
        posting_status: 'pending', // ⭐ CRITICAL: Set to 'pending' for runner
        service_type: null, // ⭐ FIX #2: NULL until user selects in Pending tab
        scheduled_time: null, // ⭐ FIX #2: NULL until user schedules
        timezone: null, // ⭐ FIX #2: NULL until user selects in Pending tab
        retry_count: 0,
        failure_reason: null,
        is_deleted: false,
        deleted_at: null
      };
      
      console.log('Scheduled post data to insert:', scheduledPostData);
      
      const { data: scheduledPost, error: scheduleError } = await client
        .from('scheduled_posts')
        .insert(scheduledPostData)
        .select()
        .single();
      
      if (scheduleError) {
        console.error('❌ Error inserting into scheduled_posts:', scheduleError);
        throw scheduleError;
      }
      
      console.log('✅✅✅ POST SCHEDULED SUCCESSFULLY! ✅✅✅');
      console.log('scheduled_posts row created with id:', scheduledPost.id);
      console.log('Content ID:', scheduledPost.content_id);
      console.log('Posting status:', scheduledPost.posting_status);
      console.log('Scheduled date:', scheduledPost.scheduled_date);
      
      return { 
        success: true, 
        data: {
          contentPost: { id: contentPostId },
          scheduledPost: scheduledPost
        }
      };
      
    } catch (error) {
      console.error('❌ Error in addToSchedule:', error);
      return { success: false, error };
    }
  },

  // Update content post
  async updateContentPost(postId: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    
    try {
      const client = getSupabaseClient();
      
      // --- Character Profile Details ---
      let updatedCharacterDetails = {};
      if (updates.characterProfile !== undefined) {
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
            console.error('Error loading updated character profile:', error);
          }
        } else {
          // Clear character details
          updatedCharacterDetails = {
            character_avatar: null,
            name: null,
            username: null,
            role: null
          };
        }
      }

      // --- Platform Details ---
      let updatedPlatformDetails = {};
      if (updates.selectedPlatforms !== undefined) {
        if (updates.selectedPlatforms && updates.selectedPlatforms.length > 0) {
          try {
            const primaryPlatformUrl = updates.selectedPlatforms[0];
            console.log('Looking up updated platform with Url:', primaryPlatformUrl);
            
            const [platforms, telegramChannels] = await Promise.all([
              this.loadPlatforms(),
              this.loadTelegramChannels()
            ]);
            
            const selectedPlatform = platforms.find(p => p.id === primaryPlatformUrl);
            
            if (selectedPlatform) {
              console.log('Found platform for update:', selectedPlatform.name);
              updatedPlatformDetails = {
                platform_id: selectedPlatform.id.toString(),
                social_platform: selectedPlatform.name || null,
                url: selectedPlatform.url || null,
                channel_group_id: null,
                thread_id: null
              };
            } else {
              const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformUrl);
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

      // --- Handle media file updates ---
      let updatedMediaFiles;
      if (updates.mediaFiles !== undefined) {
        const { data: { user } } = await client.auth.getUser();
        const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
        const userId = user?.id || SYSTEM_USER_ID;

        updatedMediaFiles = await Promise.all(
          (updates.mediaFiles || []).map(async (mediaFile) => {
            if (mediaFile.url.startsWith('blob:')) {
              try {
                const response = await fetch(mediaFile.url);
                const blob = await response.blob();
                const file = new File([blob], mediaFile.name, { type: blob.type });
                const supabaseUrl = await this.uploadMediaFile(file, updates.contentId || 'temp', userId);
                return {
                  ...mediaFile,
                  supabaseUrl: supabaseUrl,
                  url: supabaseUrl
                };
              } catch (uploadError) {
                console.error('Error uploading updated media file:', uploadError);
                return mediaFile;
              }
            }
            return mediaFile;
          })
        );
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
  
  // Load Telegram_configurations
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
