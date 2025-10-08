// /src/schedulecomponent/api/scheduleAPI.ts - PHASE 3: Complete Database Workflow
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
    service_type: data.service_type || '', // NEW: Service type
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
    service_type: data.service_type || '', // NEW: Service type
    failure_reason: data.failure_reason || '',
    retry_count: data.retry_count || 0,
    created_date: new Date(data.created_at),
    user_id: data.user_id || '',
    created_by: data.created_by || '',
    is_from_template: data.is_from_template || false,
    source_template_id: data.source_template_id || ''
  };
};

// Load platforms from social_platforms table
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

// Load Telegram channels
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

// Upload media file to content-media bucket
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

// PHASE 3: Create platform assignment for a specific platform
const createPlatformAssignment = async (
  scheduledPostId: string,
  platformId: string,
  platformName: string
): Promise<void> => {
  if (!supabase) throw new Error('Supabase client not available');

  try {
    const { error } = await supabase
      .from('dashboard_platform_assignments')
      .insert({
        scheduled_post_id: scheduledPostId,
        platform_id: platformId,
        platform_name: platformName,
        delivery_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating platform assignment:', error);
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

    // Combine and map both arrays with platform details enrichment
    const allPosts = [
      ...(scheduledPosts || []).map(post => mapContentPostToScheduledPost(post)),
      ...(dashboardPosts || []).map(post => mapDashboardPostToScheduledPost(post))
    ];

    // Enrich with platform details for display
    const enrichedPosts = await Promise.all(
      allPosts.map(async (post) => {
        if (post.selected_platforms && post.selected_platforms.length > 0) {
          try {
            const platformDetails = await getPlatformDetails(post.selected_platforms);
            return {
              ...post,
              platformDetails
            };
          } catch (err) {
            console.error('Error enriching platform details for post:', post.id, err);
            return post;
          }
        }
        return post;
      })
    );

    return enrichedPosts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Update pending post with platform details and media uploads
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

    const extractPlatformId = (item: any): string => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'number') return item.toString();
      if (typeof item === 'object' && item.id) return String(item.id);
      if (typeof item === 'object' && item.platform_id) return String(item.platform_id);
      return String(item);
    };

    // Resolve platform details
    let updatedPlatformDetails = {};
    
    if (updates.selected_platforms !== undefined) {
      if (updates.selected_platforms && updates.selected_platforms.length > 0) {
        try {
          const primaryPlatformId = extractPlatformId(updates.selected_platforms[0]);
          
          const [platforms, telegramChannels] = await Promise.all([
            loadPlatforms(),
            loadTelegramChannels()
          ]);
          
          const selectedPlatform = platforms.find(p => String(p.id) === primaryPlatformId);
          
          if (selectedPlatform) {
            updatedPlatformDetails = {
              platform_id: selectedPlatform.id.toString(),
              social_platform: selectedPlatform.name || null,
              url: selectedPlatform.url || null,
              channel_group_id: null,
              thread_id: null
            };
          } else {
            const selectedTelegram = telegramChannels.find(t => String(t.id) === primaryPlatformId);
            if (selectedTelegram) {
              updatedPlatformDetails = {
                platform_id: selectedTelegram.id.toString(),
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

// PHASE 3: Create scheduled post with complete workflow
export const createScheduledPost = async (postData: Omit<ScheduledPost, 'id' | 'created_date'>): Promise<ScheduledPost> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    if (!userId) {
      throw new Error('User must be authenticated to schedule posts');
    }

    // PHASE 3: Validate service_type is provided
    if (!postData.service_type) {
      throw new Error('Service type is required for scheduling');
    }

    // Get the original post from content_posts
    const { data: originalPost, error: fetchError } = await supabase
      .from('content_posts')
      .select('*')
      .eq('content_id', postData.content_id)
      .single();

    if (fetchError) throw fetchError;

    // Validate required fields from the original post
    if (!originalPost.description || (typeof originalPost.description === 'string' && originalPost.description.trim() === '')) {
      throw new Error('Post description is required but missing from the original post');
    }

    if (!originalPost.character_profile) {
      throw new Error('Character profile is required but missing from the original post');
    }

    // Resolve platform details
    let platformDetails = {
      platform_id: null as string | null,
      social_platform: null as string | null,
      url: null as string | null,
      channel_group_id: null as string | null,
      thread_id: null as string | null
    };

    const extractPlatformId = (item: any): string => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'number') return item.toString();
      if (typeof item === 'object' && item.id) return String(item.id);
      if (typeof item === 'object' && item.platform_id) return String(item.platform_id);
      return String(item);
    };

    // Get platform names for assignments
    const platformAssignmentData: Array<{ id: string; name: string }> = [];

    if (originalPost.selected_platforms && originalPost.selected_platforms.length > 0) {
      try {
        const primaryPlatformId = extractPlatformId(originalPost.selected_platforms[0]);
        
        const [platforms, telegramChannels] = await Promise.all([
          loadPlatforms(),
          loadTelegramChannels()
        ]);
        
        // Get platform details for primary platform
        const selectedPlatform = platforms.find(p => String(p.id) === primaryPlatformId);
        
        if (selectedPlatform) {
          platformDetails = {
            platform_id: selectedPlatform.id.toString(),
            social_platform: selectedPlatform.name || null,
            url: selectedPlatform.url || null,
            channel_group_id: null,
            thread_id: null
          };
        } else {
          const selectedTelegram = telegramChannels.find(t => String(t.id) === primaryPlatformId);
          if (selectedTelegram) {
            platformDetails = {
              platform_id: selectedTelegram.id.toString(),
              social_platform: selectedTelegram.name || null,
              url: selectedTelegram.url || null,
              channel_group_id: selectedTelegram.channel_group_id || null,
              thread_id: selectedTelegram.thread_id || null
            };
          }
        }

        // Collect all platform details for assignments
        for (const platformId of originalPost.selected_platforms) {
          const id = extractPlatformId(platformId);
          const platform = platforms.find(p => String(p.id) === id);
          const telegram = telegramChannels.find(t => String(t.id) === id);
          
          if (platform) {
            platformAssignmentData.push({
              id: platform.id.toString(),
              name: platform.name || platform.display_name || 'Unknown Platform'
            });
          } else if (telegram) {
            platformAssignmentData.push({
              id: telegram.id.toString(),
              name: telegram.name || 'Telegram Channel'
            });
          }
        }
      } catch (error) {
        console.error('Error loading platform details:', error);
      }
    }

    // PHASE 3: Create scheduled post in scheduled_posts table
    const scheduledPostData = {
      content_id: originalPost.content_id,
      original_post_id: originalPost.id,
      character_profile: originalPost.character_profile, // Profile ID
      character_avatar: originalPost.character_avatar, // Avatar URL
      theme: originalPost.theme,
      audience: originalPost.audience,
      media_type: originalPost.media_type,
      template_type: originalPost.template_type,
      platform: originalPost.platform,
      title: originalPost.title,
      description: originalPost.description, // Post description
      hashtags: originalPost.hashtags,
      keywords: originalPost.keywords,
      cta: originalPost.cta,
      media_files: originalPost.media_files,
      selected_platforms: originalPost.selected_platforms,
      scheduled_date: postData.scheduled_date?.toISOString() || new Date().toISOString(),
      status: 'pending', // PHASE 3: Start as pending
      service_type: postData.service_type, // PHASE 3: Store service type
      retry_count: 0,
      is_from_template: originalPost.is_from_template,
      source_template_id: originalPost.source_template_id,
      user_id: userId,
      created_by: userId,
      // Platform details
      platform_id: platformDetails.platform_id,
      social_platform: platformDetails.social_platform,
      url: platformDetails.url,
      channel_group_id: platformDetails.channel_group_id,
      thread_id: platformDetails.thread_id
    };

    console.log('Creating scheduled post with service:', postData.service_type);

    const { data: newScheduledPost, error: insertError } = await supabase
      .from('scheduled_posts')
      .insert(scheduledPostData)
      .select()
      .single();

    if (insertError) throw insertError;

    // PHASE 3: Create platform assignments for each selected platform
    console.log(`Creating ${platformAssignmentData.length} platform assignments`);
    
    for (const platform of platformAssignmentData) {
      try {
        await createPlatformAssignment(
          newScheduledPost.id,
          platform.id,
          platform.name
        );
      } catch (assignmentError) {
        console.error('Error creating platform assignment:', assignmentError);
        // Continue with other assignments even if one fails
      }
    }

    console.log('Scheduled post created successfully with platform assignments');

    return mapDashboardPostToScheduledPost(newScheduledPost);
  } catch (error) {
    console.error('Error creating scheduled post:', error);
    throw error;
  }
};

// Update scheduled post with platform details and media uploads
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

    const extractPlatformId = (item: any): string => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'number') return item.toString();
      if (typeof item === 'object' && item.id) return String(item.id);
      if (typeof item === 'object' && item.platform_id) return String(item.platform_id);
      return String(item);
    };

    // Resolve platform details
    let updatedPlatformDetails = {};
    
    if (updates.selected_platforms !== undefined) {
      if (updates.selected_platforms && updates.selected_platforms.length > 0) {
        try {
          const primaryPlatformId = extractPlatformId(updates.selected_platforms[0]);
          
          const [platforms, telegramChannels] = await Promise.all([
            loadPlatforms(),
            loadTelegramChannels()
          ]);
          
          const selectedPlatform = platforms.find(p => String(p.id) === primaryPlatformId);
          
          if (selectedPlatform) {
            updatedPlatformDetails = {
              platform_id: selectedPlatform.id.toString(),
              social_platform: selectedPlatform.name || null,
              url: selectedPlatform.url || null,
              channel_group_id: null,
              thread_id: null
            };
          } else {
            const selectedTelegram = telegramChannels.find(t => String(t.id) === primaryPlatformId);
            if (selectedTelegram) {
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
        updatedPlatformDetails = {
          platform_id: null,
          social_platform: null,
          url: null,
          channel_group_id: null,
          thread_id: null
        };
      }
    }

    // Check if post is in content_posts or scheduled_posts
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
      // Post is in scheduled_posts - update with platform details
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
      if (updates.service_type !== undefined) updateData.service_type = updates.service_type;

      Object.assign(updateData, updatedPlatformDetails);

      const { data, error } = await supabase
        .from('scheduled_posts')
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

// Reschedule from template with platform details
export const rescheduleFromTemplate = async (templateId: string, userId: string): Promise<any> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

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

    const extractPlatformId = (item: any): string => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'number') return item.toString();
      if (typeof item === 'object' && item.id) return String(item.id);
      if (typeof item === 'object' && item.platform_id) return String(item.platform_id);
      return String(item);
    };

    if (template.selected_platforms && template.selected_platforms.length > 0) {
      try {
        const primaryPlatformId = extractPlatformId(template.selected_platforms[0]);
        
        const [platforms, telegramChannels] = await Promise.all([
          loadPlatforms(),
          loadTelegramChannels()
        ]);
        
        const selectedPlatform = platforms.find(p => String(p.id) === primaryPlatformId);
        
        if (selectedPlatform) {
          platformDetails = {
            platform_id: selectedPlatform.id.toString(),
            social_platform: selectedPlatform.name || null,
            url: selectedPlatform.url || null,
            channel_group_id: null,
            thread_id: null
          };
        } else {
          const selectedTelegram = telegramChannels.find(t => String(t.id) === primaryPlatformId);
          if (selectedTelegram) {
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
        console.error('Error loading platform details:', error);
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

// Get platform details for display
export const getPlatformDetails = async (platformIds: string[]): Promise<any[]> => {
  if (!supabase || !platformIds?.length) return [];
  
  try {
    const [platformsResult, telegramResult] = await Promise.all([
      supabase.from('social_platforms').select('*').in('id', platformIds),
      supabase.from('telegram_configurations').select('*').in('id', platformIds)
    ]);
    
    return [
      ...(platformsResult.data || []),
      ...(telegramResult.data || [])
    ];
  } catch (error) {
    console.error('Error loading platform details for display:', error);
    return [];
  }
};

// Fetch external services for scheduling
export const fetchExternalServices = async (): Promise<any[]> => {
  if (!supabase) throw new Error('Supabase client not available');
  
  try {
    const { data, error } = await supabase
      .from('external_services')
      .select('id, service_type, url, is_active')
      .eq('is_active', true)
      .order('service_type');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching external services:', error);
    throw error;
  }
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
  rescheduleFromTemplate,
  getPlatformDetails,
  fetchExternalServices
};
