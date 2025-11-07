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
    service_type: data.service_type || '',
    created_date: new Date(data.created_at),
    user_id: data.user_id || '',
    created_by: data.created_by || '',
    is_from_template: data.is_from_template || false,
    source_template_id: data.source_template_id || ''
  };
};

// Helper function to map dashboard_posts to ScheduledPost interface
const mapDashboardPostToScheduledPost = (data: any): ScheduledPost => {
  // ✅ FIX: Combine DATE + TIME to create proper datetime
  let scheduledDateTime = null;
  if (data.scheduled_date && data.scheduled_time) {
    // Combine "2025-10-21" + "06:00:00" = "2025-10-21T06:00:00"
    const combinedDateTime = `${data.scheduled_date}T${data.scheduled_time}`;
    scheduledDateTime = new Date(combinedDateTime);
  } else if (data.scheduled_date) {
    scheduledDateTime = new Date(data.scheduled_date);
  }

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
    scheduled_date: scheduledDateTime,
    timezone: data.timezone || '',
    status: data.status || 'scheduled',
    service_type: data.service_type || '',
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

// ============================================================================
// NEW: STATUS MANAGEMENT - Dashboard Posts with Status Filtering
// ============================================================================

// Determine status directly from posting_status column in scheduled_posts
const determinePostStatus = (post: any): 'scheduled' | 'processing' | 'published' | 'failed' => {
  // Use posting_status directly from scheduled_posts table
  if (post.posting_status === 'failed') return 'failed';
  if (post.posting_status === 'sent' || post.posting_status === 'published') return 'published';
  if (post.posting_status === 'processing') return 'processing';
  
  // Default to scheduled if posting_status is 'pending' or null
  return 'scheduled';
};

// NEW: Fetch dashboard posts filtered by status - ONLY from scheduled_posts
export const fetchDashboardPostsByStatus = async (
  userId: string,
  statusFilter?: 'scheduled' | 'processing' | 'published' | 'failed'
): Promise<ScheduledPost[]> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // ONLY fetch from scheduled_posts table (dashboard_posts is runner analytics only)
    const { data: scheduledPosts, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Map and determine status from posting_status
    const allPosts = (scheduledPosts || []).map((post: any) => ({
      ...mapDashboardPostToScheduledPost(post),
      status: determinePostStatus(post)
    }));

    // Filter by status if provided
    if (statusFilter) {
      const filtered = allPosts.filter(post => post.status === statusFilter);
      
      // Enrich with platform details
      const enriched = await Promise.all(
        filtered.map(async (post) => {
          if (post.selected_platforms?.length > 0) {
            try {
              const platformDetails = await getPlatformDetails(post.selected_platforms);
              return { ...post, platformDetails };
            } catch (err) {
              console.error('Error enriching platform details:', err);
              return post;
            }
          }
          return post;
        })
      );
      
      return enriched;
    }

    // Return all if no filter
    const enriched = await Promise.all(
      allPosts.map(async (post) => {
        if (post.selected_platforms?.length > 0) {
          try {
            const platformDetails = await getPlatformDetails(post.selected_platforms);
            return { ...post, platformDetails };
          } catch (err) {
            console.error('Error enriching platform details:', err);
            return post;
          }
        }
        return post;
      })
    );

    return enriched;
  } catch (error) {
    console.error('Error fetching dashboard posts by status:', error);
    throw error;
  }
};

// NEW: Get dashboard statistics for Quick Stats badges
export const getDashboardStats = async (userId: string): Promise<{
  pending: number;
  scheduled: number;
  processing: number;
  published: number;
  failed: number;
}> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Get pending posts from content_posts
    const { data: contentPosts, error: contentError } = await supabase
      .from('content_posts')
      .select('id', { count: 'exact' })
      .eq('status', 'pending_schedule')
      .or(`user_id.eq.${userId},user_id.is.null`);
    
    if (contentError) throw contentError;

    // Get all posts from scheduled_posts ONLY (dashboard_posts is for analytics only)
    const { data: scheduledPosts, error: scheduledError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`);

    if (scheduledError) throw scheduledError;

    // Count by posting_status
    const stats = {
      pending: contentPosts?.length || 0,
      scheduled: 0,
      processing: 0,
      published: 0,
      failed: 0
    };

    (scheduledPosts || []).forEach(post => {
      const status = determinePostStatus(post);
      stats[status]++;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      pending: 0,
      scheduled: 0,
      processing: 0,
      published: 0,
      failed: 0
    };
  }
};

// ============================================================================
// EXISTING METHODS (Keep as-is)
// ============================================================================

// SCHEDULED POSTS - Read from content_posts and scheduled_posts ONLY
export const fetchScheduledPosts = async (userId: string): Promise<ScheduledPost[]> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Get scheduled posts from content_posts table
    const { data: contentPosts, error: contentError } = await supabase
      .from('content_posts')
      .select('*')
      .eq('status', 'scheduled')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });
    
    if (contentError) throw contentError;

    // Get scheduled posts from scheduled_posts table
    const { data: scheduledPosts, error: scheduledError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });
    
    if (scheduledError) throw scheduledError;

    // Combine and map both arrays with platform details enrichment
    // NOTE: dashboard_posts excluded (cron runner analytics only)
    const allPosts = [
      ...(contentPosts || []).map(post => mapContentPostToScheduledPost(post)),
      ...(scheduledPosts || []).map(post => mapDashboardPostToScheduledPost(post))
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
export const updatePendingPost = async (
  id: string, 
  updates: Partial<ScheduledPost>
): Promise<ScheduledPost> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Check only content_posts and scheduled_posts (dashboard_posts is read-only analytics)
    const tables = ['content_posts', 'scheduled_posts'];
    let foundTable = null;
    let currentPost = null;

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (!error && data) {
        foundTable = table;
        currentPost = data;
        break;
      }
    }

    if (!foundTable || !currentPost) {
      throw new Error(`Post with ID ${id} not found in any table`);
    }

    // Prepare update data
    const updateData: any = {
      character_profile: updates.character_profile,
      theme: updates.theme,
      audience: updates.audience,
      media_type: updates.media_type,
      template_type: updates.template_type,
      platform: updates.platform,
      title: updates.title,
      description: updates.description,
      hashtags: updates.hashtags,
      keywords: updates.keywords,
      cta: updates.cta,
      selected_platforms: updates.selected_platforms,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Update in the found table
    const { data: updatedPost, error: updateError } = await supabase
      .from(foundTable)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return foundTable === 'content_posts' 
      ? mapContentPostToScheduledPost(updatedPost)
      : mapDashboardPostToScheduledPost(updatedPost);
  } catch (error) {
    console.error('Error updating pending post:', error);
    throw error;
  }
};

// Create scheduled post - PHASE 3: Enhanced workflow
export const createScheduledPost = async (
  postData: Omit<ScheduledPost, 'id' | 'created_date'>
): Promise<ScheduledPost> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Extract platform details from first selected platform
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

    if (postData.selected_platforms && postData.selected_platforms.length > 0) {
      try {
        const primaryPlatformId = extractPlatformId(postData.selected_platforms[0]);
        
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

    // Prepare scheduled_date and scheduled_time
    let scheduledDate = null;
    let scheduledTime = null;
    
    if (postData.scheduled_date) {
      const date = new Date(postData.scheduled_date);
      scheduledDate = date.toISOString().split('T')[0]; // "2025-11-07"
      scheduledTime = date.toTimeString().split(' ')[0]; // "14:30:00"
    }

    // Insert into scheduled_posts table with all required fields
    const scheduleData = {
      content_id: postData.content_id || `post-${Date.now()}`,
      character_profile: postData.character_profile,
      theme: postData.theme,
      audience: postData.audience,
      media_type: postData.media_type,
      template_type: postData.template_type,
      platform: postData.platform,
      title: postData.title,
      description: postData.description,
      hashtags: postData.hashtags || [],
      keywords: postData.keywords || '',
      cta: postData.cta || '',
      media_files: postData.media_files || [],
      selected_platforms: postData.selected_platforms || [],
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      timezone: postData.timezone || 'UTC',
      service_type: postData.service_type || null,
      status: 'scheduled',
      posting_status: 'pending',
      user_id: postData.user_id,
      created_by: postData.created_by,
      is_from_template: postData.is_from_template || false,
      source_template_id: postData.source_template_id || null,
      platform_id: platformDetails.platform_id,
      social_platform: platformDetails.social_platform,
      url: platformDetails.url,
      channel_group_id: platformDetails.channel_group_id,
      thread_id: platformDetails.thread_id
    };

    const { data: newSchedule, error: scheduleError } = await supabase
      .from('scheduled_posts')
      .insert(scheduleData)
      .select()
      .single();

    if (scheduleError) throw scheduleError;

    // Create platform assignments for tracking
    if (postData.selected_platforms && postData.selected_platforms.length > 0) {
      await Promise.all(
        postData.selected_platforms.map(async (platformId) => {
          try {
            const platform = platformDetails.social_platform || 'Unknown';
            await createPlatformAssignment(newSchedule.id, String(platformId), platform);
          } catch (err) {
            console.error('Error creating platform assignment:', err);
          }
        })
      );
    }

    // If there was an original post in content_posts, delete it
    if (postData.content_id) {
      try {
        await supabase
          .from('content_posts')
          .delete()
          .eq('content_id', postData.content_id);
      } catch (err) {
        console.error('Error deleting original content post:', err);
      }
    }

    return mapDashboardPostToScheduledPost(newSchedule);
  } catch (error) {
    console.error('Error creating scheduled post:', error);
    throw error;
  }
};

// Update scheduled post
export const updateScheduledPost = async (
  id: string,
  updates: Partial<ScheduledPost>
): Promise<ScheduledPost> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Prepare scheduled_date and scheduled_time if date is being updated
    let updateData: any = { ...updates };
    
    if (updates.scheduled_date) {
      const date = new Date(updates.scheduled_date);
      updateData.scheduled_date = date.toISOString().split('T')[0];
      updateData.scheduled_time = date.toTimeString().split(' ')[0];
    }

    // Remove the original scheduled_date from updates to avoid column name conflict
    delete updateData.scheduled_date;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('scheduled_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return mapDashboardPostToScheduledPost(data);
  } catch (error) {
    console.error('Error updating scheduled post:', error);
    throw error;
  }
};

// Delete scheduled post - DASHBOARD VIEW ONLY (no Supabase deletion)
export const deleteScheduledPost = async (id: string): Promise<void> => {
  try {
    // Dashboard-only deletion - UI state handles removal
    // NO Supabase table changes (user manages Supabase manually)
    console.log('Post removed from dashboard view:', id);
    return;
  } catch (error) {
    console.error('Error removing post from dashboard view:', error);
    throw error;
  }
};

// TEMPLATES - Fetch all templates
export const fetchTemplates = async (userId: string): Promise<SavedTemplate[]> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('dashboard_templates')
      .select('*')
      .eq('is_active', true)
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(template => ({
      ...template,
      created_at: new Date(template.created_at),
      updated_at: new Date(template.updated_at)
    }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

// Create new template
export const createTemplate = async (
  templateData: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<SavedTemplate> => {
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
  fetchDashboardPostsByStatus,
  getDashboardStats,
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
