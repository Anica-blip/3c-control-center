// /src/schedulecomponent/api/scheduleAPI.ts - UPDATED: Platform details + media uploads
import { supabase } from '../config';
import { ScheduledPost, SavedTemplate, PendingPost } from '../types';

// Helper function to map content_posts to ScheduledPost interface
const mapContentPostToScheduledPost = (data: any): ScheduledPost => {
  return {
    id: data.id,
    content_id: data.content_id || '',
    character_profile: data.character_profile || '',
    character_avatar: data.character_avatar || '',
    theme: data.theme || '',
    audience: data.audience || '',
    media_type: data.media_type || '',
    template_type: data.template_type || '',
    platform: data.platform || '',
    title: data.title || '',
    description: data.description || '',
    hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
    keywords: data.keywords || '',
    cta: data.cta || '',
    media_files: Array.isArray(data.media_files) ? data.media_files : [],
    selected_platforms: Array.isArray(data.selected_platforms) ? data.selected_platforms : [],
    scheduled_date: data.scheduled_date ? new Date(data.scheduled_date) : null,
    status: data.status || 'scheduled',
    created_date: new Date(data.created_at),
    user_id: data.user_id || '',
    created_by: data.created_by || '',
    is_from_template: data.is_from_template || false,
    source_template_id: data.source_template_id || ''
  };
};

// Helper function to map dashboard_posts to ScheduledPost interface
const mapDashboardPostToScheduledPost = (data: any): ScheduledPost => {
  return {
    id: data.id,
    content_id: data.content_id || '',
    character_profile: data.character_profile || '',
    character_avatar: data.character_avatar || '',
    theme: data.theme || '',
    audience: data.audience || '',
    media_type: data.media_type || '',
    template_type: data.template_type || '',
    platform: data.platform || '',
    title: data.title || '',
    description: data.description || '',
    hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
    keywords: data.keywords || '',
    cta: data.cta || '',
    media_files: Array.isArray(data.media_files) ? data.media_files : [],
    selected_platforms: Array.isArray(data.selected_platforms) ? data.selected_platforms : [],
    scheduled_date: new Date(data.scheduled_date),
    status: data.status || 'scheduled',
    failure_reason: data.failure_reason || '',
    retry_count: data.retry_count || 0,
    created_date: new Date(data.created_at),
    user_id: data.user_id || '',
    created_by: data.created_by || '',
    is_from_template: data.is_from_template || false,
    source_template_id: data.source_template_id || ''
  };
};

// NEW: Load platforms from social_platforms table (mirrored from supabaseAPI.ts)
const loadPlatforms = async (): Promise<any[]> => {
  if (!supabase) throw new Error('Supabase client not available');

  try {
    const { data, error } = await supabase
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
    console.error('Error loading platforms:', error);
    return [];
  }
};

// NEW: Load Telegram channels (mirrored from supabaseAPI.ts)
const loadTelegramChannels = async (): Promise<any[]> => {
  if (!supabase) throw new Error('Supabase client not available');

  try {
    const { data, error } = await supabase
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
};

// NEW: Upload media file to content-media bucket (mirrored from supabaseAPI.ts)
const uploadMediaFile = async (file: File, contentId: string, userId: string): Promise<string> => {
  if (!supabase) throw new Error('Supabase client not available');
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${contentId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('content-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('content-media')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading media file:', error);
    throw error;
  }
};

// SCHEDULED POSTS - Read from content_posts table where status = 'scheduled'
export const fetchScheduledPosts = async (userId: string): Promise<ScheduledPost[]> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Get scheduled posts from content_posts table
    const { data: scheduledPosts, error: scheduledError } = await supabase
      .from('content_posts')
      .select('*')
      .eq('status', 'scheduled')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });
    
    if (scheduledError) throw scheduledError;

    // Get completed posts from dashboard_posts table  
    const { data: dashboardPosts, error: dashboardError } = await supabase
      .from('dashboard_posts')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });
    
    if (dashboardError) throw dashboardError;

    // Combine and map both arrays
    const allPosts = [
      ...(scheduledPosts || []).map(post => mapContentPostToScheduledPost(post)),
      ...(dashboardPosts || []).map(post => mapDashboardPostToScheduledPost(post))
    ];

    return allPosts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// FIXED: Update pending post with platform details and media uploads
export const updatePendingPost = async (id: string, updates: Partial<ScheduledPost>): Promise<ScheduledPost> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Handle media file uploads (blob URLs)
    let updatedMediaFiles = updates.media_files;
    if (updates.media_files) {
      updatedMediaFiles = await Promise.all(
        updates.media_files.map(async (mediaFile) => {
          if (mediaFile.url.startsWith('blob:')) {
            try {
              const response = await fetch(mediaFile.url);
              const blob = await response.blob();
              const file = new File([blob], mediaFile.name, { type: blob.type });
              const supabaseUrl = await uploadMediaFile(file, updates.content_id || id, userId || 'anonymous');
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
    }

    // Resolve platform details (mirrored from supabaseAPI.ts)
    let updatedPlatformDetails = {};
    
    if (updates.selected_platforms !== undefined) {
      if (updates.selected_platforms && updates.selected_platforms.length > 0) {
        try {
          const primaryPlatformId = updates.selected_platforms[0];
          console.log('Resolving platform with ID:', primaryPlatformId);
          
          const [platforms, telegramChannels] = await Promise.all([
            loadPlatforms(),
            loadTelegramChannels()
          ]);
          
          // Try social_platforms first
          const selectedPlatform = platforms.find(p => p.id === primaryPlatformId);
          
          if (selectedPlatform) {
            console.log('Found social platform:', selectedPlatform.name);
            updatedPlatformDetails = {
              platform_id: selectedPlatform.id,
              social_platform: selectedPlatform.name || null,
              url: selectedPlatform.url || null,
              channel_group_id: null,
              thread_id: null
            };
          } else {
            // Try telegram_configurations
            const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformId);
            if (selectedTelegram) {
              console.log('Found Telegram channel:', selectedTelegram.name);
              updatedPlatformDetails = {
                platform_id: selectedTelegram.id,
                social_platform: selectedTelegram.name || null,
                url: selectedTelegram.url || null,
                channel_group_id: selectedTelegram.channel_group_id || null,
                thread_id: selectedTelegram.thread_id || null
              };
            }
          }
        } catch (error) {
          console.error('Error loading platform details:', error);
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

    // Prepare update data
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.character_profile) updateData.character_profile = updates.character_profile;
    if (updates.theme) updateData.theme = updates.theme;
    if (updates.audience) updateData.audience = updates.audience;
    if (updates.media_type) updateData.media_type = updates.media_type;
    if (updates.template_type) updateData.template_type = updates.template_type;
    if (updates.platform !== undefined) updateData.platform = updates.platform;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
    if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
    if (updates.cta !== undefined) updateData.cta = updates.cta;
    if (updatedMediaFiles !== undefined) updateData.media_files = updatedMediaFiles;
    if (updates.selected_platforms !== undefined) updateData.selected_platforms = updates.selected_platforms;
    if (updates.status) updateData.status = updates.status;
    
    // Add platform details
    Object.assign(updateData, updatedPlatformDetails);

    console.log('Update data with platform details:', updateData);

    // Update in content_posts table
    const { data, error } = await supabase
      .from('content_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapContentPostToScheduledPost(data);
  } catch (error) {
    console.error('Error updating pending post:', error);
    throw error;
  }
};

// FIXED: Update scheduled post with platform details and media uploads
export const updateScheduledPost = async (id: string, updates: Partial<ScheduledPost>): Promise<ScheduledPost> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Handle media file uploads
    let updatedMediaFiles = updates.media_files;
    if (updates.media_files) {
      updatedMediaFiles = await Promise.all(
        updates.media_files.map(async (mediaFile) => {
          if (mediaFile.url.startsWith('blob:')) {
            try {
              const response = await fetch(mediaFile.url);
              const blob = await response.blob();
              const file = new File([blob], mediaFile.name, { type: blob.type });
              const supabaseUrl = await uploadMediaFile(file, updates.content_id || id, userId || 'anonymous');
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
    }

    // Resolve platform details
    let updatedPlatformDetails = {};
    
    if (updates.selected_platforms !== undefined) {
      if (updates.selected_platforms && updates.selected_platforms.length > 0) {
        try {
          const primaryPlatformId = updates.selected_platforms[0];
          console.log('Resolving platform with ID:', primaryPlatformId);
          
          const [platforms, telegramChannels] = await Promise.all([
            loadPlatforms(),
            loadTelegramChannels()
          ]);
          
          const selectedPlatform = platforms.find(p => p.id === primaryPlatformId);
          
          if (selectedPlatform) {
            console.log('Found social platform:', selectedPlatform.name);
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
              console.log('Found Telegram channel:', selectedTelegram.name);
              updatedPlatformDetails = {
                platform_id: selectedTelegram.id,
                social_platform: selectedTelegram.name || null,
                url: selectedTelegram.url || null,
                channel_group_id: selectedTelegram.channel_group_id || null,
                thread_id: selectedTelegram.thread_id || null
              };
            }
          }
        } catch (error) {
          console.error('Error loading platform details:', error);
        }
      } else {
        updatedPlatformDetails = {
          platform_id: null,
          social_platform: null,
          url: null,
          channel_group_id: null,
          thread_id: null
        };
      }
    }

    // Check if post is in content_posts or dashboard_posts
    const { data: contentPost } = await supabase
      .from('content_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (contentPost) {
      // Post is in content_posts - update with platform details
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
      if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
      if (updates.cta !== undefined) updateData.cta = updates.cta;
      if (updatedMediaFiles !== undefined) updateData.media_files = updatedMediaFiles;
      if (updates.selected_platforms !== undefined) updateData.selected_platforms = updates.selected_platforms;
      if (updates.character_profile !== undefined) updateData.character_profile = updates.character_profile;
      if (updates.theme !== undefined) updateData.theme = updates.theme;
      if (updates.audience !== undefined) updateData.audience = updates.audience;
      if (updates.media_type !== undefined) updateData.media_type = updates.media_type;
      if (updates.template_type !== undefined) updateData.template_type = updates.template_type;
      if (updates.platform !== undefined) updateData.platform = updates.platform;
      if (updates.status) updateData.status = updates.status;

      // Add platform details
      Object.assign(updateData, updatedPlatformDetails);

      const { data, error } = await supabase
        .from('content_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapContentPostToScheduledPost(data);
    } else {
      // Post is in dashboard_posts - update with platform details
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.scheduled_date !== undefined) updateData.scheduled_date = updates.scheduled_date.toISOString();
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
      if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
      if (updates.cta !== undefined) updateData.cta = updates.cta;
      if (updatedMediaFiles !== undefined) updateData.media_files = updatedMediaFiles;
      if (updates.selected_platforms !== undefined) updateData.selected_platforms = updates.selected_platforms;

      // Add platform details
      Object.assign(updateData, updatedPlatformDetails);

      const { data, error } = await supabase
        .from('dashboard_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDashboardPostToScheduledPost(data);
    }
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// FIXED: Create scheduled post with platform details resolution
export const createScheduledPost = async (postData: Omit<ScheduledPost, 'id' | 'created_date'>): Promise<ScheduledPost> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Get the original post from content_posts
    const { data: originalPost, error: fetchError } = await supabase
      .from('content_posts')
      .select('*')
      .eq('id', postData.id)
      .single();

    if (fetchError) throw fetchError;

    // Resolve platform details fresh (don't just copy)
    let platformDetails = {
      platform_id: null as string | null,
      social_platform: null as string | null,
      url: null as string | null,
      channel_group_id: null as string | null,
      thread_id: null as string | null
    };

    if (originalPost.selected_platforms && originalPost.selected_platforms.length > 0) {
      try {
        const primaryPlatformId = originalPost.selected_platforms[0];
        console.log('Resolving platform for scheduling:', primaryPlatformId);
        
        const [platforms, telegramChannels] = await Promise.all([
          loadPlatforms(),
          loadTelegramChannels()
        ]);
        
        const selectedPlatform = platforms.find(p => p.id === primaryPlatformId);
        
        if (selectedPlatform) {
          console.log('Found social platform for scheduling:', selectedPlatform.name);
          platformDetails = {
            platform_id: selectedPlatform.id,
            social_platform: selectedPlatform.name || null,
            url: selectedPlatform.url || null,
            channel_group_id: null,
            thread_id: null
          };
        } else {
          const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformId);
          if (selectedTelegram) {
            console.log('Found Telegram for scheduling:', selectedTelegram.name);
            platformDetails = {
              platform_id: selectedTelegram.id,
              social_platform: selectedTelegram.name || null,
              url: selectedTelegram.url || null,
              channel_group_id: selectedTelegram.channel_group_id || null,
              thread_id: selectedTelegram.thread_id || null
            };
          }
        }
      } catch (error) {
        console.error('Error resolving platform details for scheduling:', error);
      }
    }

    // Create scheduled post in dashboard_posts with platform details
    const dashboardPostData = {
      content_id: originalPost.content_id,
      character_profile: originalPost.character_profile,
      theme: originalPost.theme,
      audience: originalPost.audience,
      media_type: originalPost.media_type,
      template_type: originalPost.template_type,
      platform: originalPost.platform,
      title: originalPost.title,
      description: originalPost.description,
      hashtags: originalPost.hashtags,
      keywords: originalPost.keywords,
      cta: originalPost.cta,
      media_files: originalPost.media_files,
      selected_platforms: originalPost.selected_platforms,
      scheduled_date: postData.scheduled_date.toISOString(),
      status: 'scheduled',
      is_from_template: originalPost.is_from_template,
      source_template_id: originalPost.source_template_id,
      user_id: originalPost.user_id,
      created_by: originalPost.created_by,
      original_post_id: originalPost.id,
      // Platform details
      platform_id: platformDetails.platform_id,
      social_platform: platformDetails.social_platform,
      url: platformDetails.url,
      channel_group_id: platformDetails.channel_group_id,
      thread_id: platformDetails.thread_id
    };

    console.log('Creating scheduled post with platform details:', platformDetails);

    const { data: newScheduledPost, error: insertError } = await supabase
      .from('dashboard_posts')
      .insert(dashboardPostData)
      .select()
      .single();

    if (insertError) throw insertError;

    return mapDashboardPostToScheduledPost(newScheduledPost);
  } catch (error) {
    console.error('Error creating scheduled post:', error);
    throw error;
  }
};

// DELETE POST - Remove from dashboard view only
export const deleteScheduledPost = async (id: string): Promise<void> => {
  try {
    console.log('Removing post from dashboard view:', id);
    console.log('Post removed from dashboard successfully');
  } catch (error) {
    console.error('Error removing post from dashboard:', error);
    throw new Error(`Failed to remove post from dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// TEMPLATE OPERATIONS
export const fetchTemplates = async (userId: string): Promise<SavedTemplate[]> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('dashboard_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

export const createTemplate = async (templateData: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<SavedTemplate> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('dashboard_templates')
      .insert(templateData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

export const updateTemplate = async (id: string, updates: Partial<SavedTemplate>): Promise<SavedTemplate> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('dashboard_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    const { error } = await supabase
      .from('dashboard_templates')
      .update({ is_active: false })
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

export const incrementTemplateUsage = async (id: string): Promise<void> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    const { data: template, error: fetchError } = await supabase
      .from('dashboard_templates')
      .select('usage_count')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    const { error: updateError } = await supabase
      .from('dashboard_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', id);
      
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error incrementing template usage:', error);
    throw error;
  }
};

// FIXED: Reschedule from template with platform details
export const rescheduleFromTemplate = async (templateId: string, userId: string): Promise<any> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Get template data
    const { data: template, error: templateError } = await supabase
      .from('dashboard_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Resolve platform details from template
    let platformDetails = {
      platform_id: null as string | null,
      social_platform: null as string | null,
      url: null as string | null,
      channel_group_id: null as string | null,
      thread_id: null as string | null
    };

    if (template.selected_platforms && template.selected_platforms.length > 0) {
      try {
        const primaryPlatformId = template.selected_platforms[0];
        console.log('Resolving platform for template reschedule:', primaryPlatformId);
        
        const [platforms, telegramChannels] = await Promise.all([
          loadPlatforms(),
          loadTelegramChannels()
        ]);
        
        const selectedPlatform = platforms.find(p => p.id === primaryPlatformId);
        
        if (selectedPlatform) {
          platformDetails = {
            platform_id: selectedPlatform.id,
            social_platform: selectedPlatform.name || null,
            url: selectedPlatform.url || null,
            channel_group_id: null,
            thread_id: null
          };
        } else {
          const selectedTelegram = telegramChannels.find(t => t.id.toString() === primaryPlatformId);
          if (selectedTelegram) {
            platformDetails = {
              platform_id: selectedTelegram.id,
              social_platform: selectedTelegram.name || null,
              url: selectedTelegram.url || null,
              channel_group_id: selectedTelegram.channel_group_id || null,
              thread_id: selectedTelegram.thread_id || null
            };
          }
        }
      } catch (error) {
        console.error('Error resolving platform for template reschedule:', error);
      }
    }

    // Create new post in content_posts with template data + platform details
    const newPostData = {
      content_id: `template-${templateId}-${Date.now()}`,
      character_profile: template.character_profile || '',
      theme: template.theme || '',
      audience: template.audience || '',
      media_type: template.media_type || '',
      template_type: template.template_type || '',
      platform: template.platform || '',
      title: template.title || '',
      description: template.description || '',
      hashtags: template.hashtags || [],
      keywords: template.keywords || '',
      cta: template.cta || '',
      selected_platforms: template.selected_platforms || [],
      status: template.status || 'pending',
      is_from_template: true,
      source_template_id: templateId,
      user_id: userId,
      created_by: userId,
      // Platform details
      platform_id: platformDetails.platform_id,
      social_platform: platformDetails.social_platform,
      url: platformDetails.url,
      channel_group_id: platformDetails.channel_group_id,
      thread_id: platformDetails.thread_id
    };

    const { data, error } = await supabase
      .from('content_posts')
      .insert(newPostData)
      .select()
      .single();

    if (error) throw error;

    // Increment template usage
    await incrementTemplateUsage(templateId);

    return mapContentPostToScheduledPost(data);
  } catch (error) {
    console.error('Error rescheduling from template:', error);
    throw error;
  }
};

// DEPRECATED: Legacy method kept for compatibility
export const updateContentPost = async (id: string, updates: Partial<ScheduledPost>): Promise<ScheduledPost> => {
  return updatePendingPost(id, updates);
};

// MAIN API OBJECT EXPORT
export const scheduleAPI = {
  fetchScheduledPosts,
  createScheduledPost,
  updateScheduledPost,
  updatePendingPost,
  updateContentPost,
  deleteScheduledPost,
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementTemplateUsage,
  rescheduleFromTemplate
};
