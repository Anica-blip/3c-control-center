// /src/schedulecomponent/api/scheduleAPI.ts - PHASE 3: Complete Database Workflow
import { supabase } from '../config';
import { ScheduledPost, SavedTemplate, PendingPost } from '../types';

// ============================================================================
// RUNNER SPECIFICATIONS - CRITICAL FOR CRON JOBS
// ============================================================================
/*
COMPLETE WORKFLOW - STATUS TRANSITIONS:

STEP 1: Content Manager → Schedule Manager
   - User clicks "Schedule Post" in Content Manager
   - Creates row in scheduled_posts with posting_status = 'scheduled'
   - Post appears in PENDING TAB (awaiting time + date + service_type)

STEP 2: Pending Tab → Status Manager
   - User edits post in Pending Tab (uses UPDATE not INSERT)
   - User adds time + date + service_type
   - Updates posting_status from 'scheduled' → 'pending'
   - Post moves to STATUS MANAGER & CALENDAR

STEP 3: Runner Execution
   - Runner reads from scheduled_posts WHERE:
     * posting_status = 'pending'
     * scheduled_date <= CURRENT_DATE
     * scheduled_time <= CURRENT_TIME
   
   - Columns runners must read:
     * id (primary key)
     * content_id, title, description
     * scheduled_date, scheduled_time, timezone
     * media_files (JSONB array)
     * selected_platforms (JSONB array)
     * platform_id, social_platform, url
     * channel_group_id, thread_id
     * posting_status, retry_count

STEP 4: After Publishing Attempt
   
   IF SUCCESS:
   - UPDATE scheduled_posts SET 
       posting_status = 'sent',
       updated_at = NOW()
     WHERE id = <post_id>
   
   - INSERT INTO dashboard_posts (copy entire row from scheduled_posts)
   - Post remains in scheduled_posts with status 'sent'
   - Post now appears in BOTH Status Manager AND dashboard_posts
   
   IF FAILED:
   - UPDATE scheduled_posts SET 
       posting_status = 'failed',
       failure_reason = '<error_message>',
       retry_count = retry_count + 1,
       updated_at = NOW()
     WHERE id = <post_id>
   - Post remains in Status Manager as 'failed'

CRITICAL NOTES:
   - posting_status values: 'scheduled' → 'pending' → 'sent' (or 'failed')
   - dashboard_posts is analytics/history table (READ-ONLY for UI)
   - scheduled_posts is source of truth for all scheduling
   - Runner does NOT delete from scheduled_posts after publishing
   - All edits use UPDATE not INSERT to avoid content_id conflicts
*/
// ============================================================================

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

// ⭐ DEPRECATED: Platform assignments are NOT needed
// Platforms are stored in scheduled_posts.selected_platforms (JSONB column)
// The runner reads directly from that column - no separate table needed
/*
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
*/

// NEW: Get dashboard statistics for Quick Stats badges
export const getDashboardStats = async (userId: string): Promise<{
  scheduled: number;
  published: number;
  failed: number;
}> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Get all posts from scheduled_posts ONLY (dashboard_posts is for analytics only)
    const { data: scheduledPosts, error: scheduledError } = await supabase
      .from('scheduled_posts')
      .select('posting_status')
      .or(`user_id.eq.${userId},user_id.is.null`);

    if (scheduledError) throw scheduledError;

    // ✅ Count by posting_status column from database
    // posting_status values: 'pending' | 'sent' | 'failed'
    // Dashboard mapping: pending → Scheduled, sent → Published, failed → Failed
    const stats = {
      scheduled: 0,  // posting_status = 'pending'
      published: 0,  // posting_status = 'sent'
      failed: 0      // posting_status = 'failed'
    };

    (scheduledPosts || []).forEach(post => {
      if (post.posting_status === 'pending') {
        stats.scheduled++;
      } else if (post.posting_status === 'sent') {
        stats.published++;
      } else if (post.posting_status === 'failed') {
        stats.failed++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      scheduled: 0,
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
    const allScheduledPosts = [
      ...(contentPosts || []).map(post => mapContentPostToScheduledPost(post)),
      ...(scheduledPosts || []).map(post => mapDashboardPostToScheduledPost(post))
    ];

    // ✅ FIX #3: Get UI-deleted posts from localStorage and filter them out BEFORE returning
    const deletedPostsUI = JSON.parse(localStorage.getItem('deleted_posts_ui') || '[]');
    const filteredPosts = allScheduledPosts.filter(post => !deletedPostsUI.includes(post.id));
    
    console.log(`✅ Fetched ${allScheduledPosts.length} scheduled posts, filtered out ${deletedPostsUI.length} UI-deleted posts`);
    return filteredPosts;
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
    
    // ⭐⭐⭐ CRITICAL: Set posting_status and post_status when scheduling
    if (updates.scheduled_date || updates.scheduled_time || updates.service_type) {
      updateData.posting_status = 'pending';  // ✅ CRITICAL for runner
      updateData.post_status = 'pending';     // ✅ CRITICAL for runner
    }
    
    // Add scheduling fields
    if (updates.scheduled_date) updateData.scheduled_date = updates.scheduled_date;
    if (updates.scheduled_time) updateData.scheduled_time = updates.scheduled_time;
    if (updates.service_type) updateData.service_type = updates.service_type;
    if (updates.timezone) updateData.timezone = updates.timezone;
    
    // Add platform details
    Object.assign(updateData, updatedPlatformDetails);

    // ⭐ FIX: Check if post exists in content_posts OR scheduled_posts
    // Try content_posts first
    const { data: contentData, error: contentError } = await supabase
      .from('content_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (!contentError && contentData) {
      console.log('✅ Updated post in content_posts table');
      return mapContentPostToScheduledPost(contentData);
    }

    // If not in content_posts, try scheduled_posts (for posts with posting_status='scheduled')
    console.log('Post not in content_posts, trying scheduled_posts...');
    const { data: scheduledData, error: scheduledError } = await supabase
      .from('scheduled_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (scheduledError) {
      console.error('Error updating in both tables:', { contentError, scheduledError });
      throw scheduledError;
    }

    console.log('✅ Updated post in scheduled_posts table');
    return mapDashboardPostToScheduledPost(scheduledData);
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

    // ✅ FIX: Ensure we have a valid user_id with system UUID as absolute fallback
    const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
    const finalUserId = userId || originalPost?.user_id || SYSTEM_USER_ID;
    
    console.log('User ID resolution:', { userId, originalPostUserId: originalPost?.user_id, finalUserId });

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
      thread_id: null as string | null,
      platform_icon: null as string | null,
      type: null as string | null
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
        
        console.log('🔍 Platform lookup:', { 
          primaryPlatformId, 
          selectedPlatform: selectedPlatform ? {
            id: selectedPlatform.id,
            name: selectedPlatform.name,
            platform_icon: selectedPlatform.platform_icon
          } : null
        });
        
        if (selectedPlatform) {
          platformDetails = {
            platform_id: selectedPlatform.id.toString(),
            social_platform: selectedPlatform.name || null,
            url: selectedPlatform.url || null,
            channel_group_id: null,
            thread_id: null,
            platform_icon: selectedPlatform.platform_icon || null,
            type: selectedPlatform.type || 'social'
          };
          
          console.log('✅ Platform details set:', platformDetails);
        } else {
          const selectedTelegram = telegramChannels.find(t => String(t.id) === primaryPlatformId);
          if (selectedTelegram) {
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

    // PHASE 3: Create scheduled post in scheduled_posts table - COMPLETE FOR CRON JOBS
    const isUUID = (val: any): boolean => {
      if (!val || typeof val !== 'string') return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    };

    const scheduledDateTime = postData.scheduled_date ? new Date(postData.scheduled_date) : new Date();

    // ✅ FIX: Use TIMESTAMP WITH TIME ZONE for scheduled_date (not separate date/time)
    const scheduledTimeOnly = scheduledDateTime.toISOString().split('T')[1].slice(0, 8); // "11:00:00"

    const scheduledPostData = {
      // Core identifiers
      content_id: originalPost.content_id,
      original_post_id: isUUID(originalPost.id) ? originalPost.id : null,
      
      // ALL content_posts fields
      character_profile: originalPost.character_profile,
      character_avatar: originalPost.character_avatar,
      name: originalPost.name || null,
      username: originalPost.username || null,
      role: originalPost.role || null,
      voice_style: originalPost.voice_style || null,
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
      
      // ✅ CRITICAL COLUMNS FOR CRON JOBS - Use TIMESTAMP WITH TIME ZONE
      scheduled_date: scheduledDateTime, // TIMESTAMP WITH TIME ZONE
      scheduled_time: scheduledTimeOnly, // TIME type: "11:00:00"
      timezone: postData.timezone || 'UTC',
      post_status: 'pending',  // ✅ CRITICAL: post_status for runner workflow
      posting_status: 'pending',  // ✅ STATUS TRANSITION: 'scheduled' → 'pending' (when time+date+service added) → 'sent' (runner completes)
      service_type: postData.service_type,
      retry_count: 0,
      
      // Template tracking
      is_from_template: originalPost.is_from_template,
      source_template_id: isUUID(originalPost.source_template_id) ? originalPost.source_template_id : null,
      
      // User tracking
      user_id: finalUserId,
      created_by: finalUserId,
      
      // ✅ CRITICAL: Set visibility flags so post appears in UI
      is_hidden: false,
      is_deleted: false,
      
      // Platform details
      platform_id: isUUID(platformDetails.platform_id) ? platformDetails.platform_id : null,
      social_platform: platformDetails.social_platform,
      url: platformDetails.url,
      channel_group_id: platformDetails.channel_group_id,
      thread_id: platformDetails.thread_id,
      platform_icon: platformDetails.platform_icon,
      type: platformDetails.type,
      
      // ✅ COMPLETE POST DATA FOR CRON JOB (column name: post_content)
      post_content: {
        content_id: originalPost.content_id,
        title: originalPost.title,
        description: originalPost.description,
        hashtags: originalPost.hashtags,
        keywords: originalPost.keywords,
        cta: originalPost.cta,
        media_files: originalPost.media_files,
        character_profile: originalPost.character_profile,
        character_avatar: originalPost.character_avatar,
        theme: originalPost.theme,
        audience: originalPost.audience,
        media_type: originalPost.media_type,
        template_type: originalPost.template_type,
        selected_platforms: originalPost.selected_platforms,
        platform_details: {
          platform_id: platformDetails.platform_id,
          social_platform: platformDetails.social_platform,
          url: platformDetails.url,
          channel_group_id: platformDetails.channel_group_id,
          thread_id: platformDetails.thread_id
        }
      }
    };

    console.log('✅ INSERTING TO scheduled_posts TABLE');
    console.log('Scheduled DateTime:', scheduledDateTime.toISOString());
    console.log('Timezone:', postData.timezone || 'UTC');
    console.log('Service:', postData.service_type);

    const { data: newScheduledPost, error: insertError } = await supabase
      .from('scheduled_posts')
      .insert(scheduledPostData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ SUPABASE INSERT FAILED:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      throw new Error(`Failed to save scheduled post: ${insertError.message}`);
    }

    if (!newScheduledPost) {
      console.error('❌ NO DATA RETURNED FROM INSERT');
      throw new Error('Failed to save scheduled post: No data returned');
    }

    console.log('✅ POST SAVED SUCCESSFULLY:', newScheduledPost.id);

    // ⭐ Platform assignments are NOT needed - platforms are stored in selected_platforms JSONB column
    // The runner will read directly from scheduled_posts.selected_platforms
    // No need for separate dashboard_platform_assignments table

    return mapDashboardPostToScheduledPost(newScheduledPost);
  } catch (error) {
    console.error('❌ ERROR IN createScheduledPost:', error);
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
      
      // ✅ FIX: Use TIMESTAMP WITH TIME ZONE for scheduled_date
      if (updates.scheduled_date !== undefined) {
        const scheduledDateTime = new Date(updates.scheduled_date);
        updateData.scheduled_date = scheduledDateTime; // TIMESTAMP WITH TIME ZONE
        updateData.scheduled_time = scheduledDateTime.toISOString().split('T')[1].slice(0, 8); // "11:00:00"
      }
      
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

// DELETE POST - Dashboard view removal only (NO database deletion)
// UI-ONLY DELETE - Does NOT touch database, uses localStorage to track deleted posts
export const deleteScheduledPost = async (id: string): Promise<void> => {
  try {
    // Get current deleted posts from localStorage
    const deletedPosts = JSON.parse(localStorage.getItem('deleted_posts_ui') || '[]');
    
    // Add this post ID to deleted list
    if (!deletedPosts.includes(id)) {
      deletedPosts.push(id);
      localStorage.setItem('deleted_posts_ui', JSON.stringify(deletedPosts));
    }
    
    console.log('Post removed from UI (database untouched):', id);
  } catch (error) {
    console.error('Error removing post from UI:', error);
    throw new Error(`Failed to remove from UI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// TEMPLATE OPERATIONS
export const fetchTemplates = async (userId: string): Promise<SavedTemplate[]> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Fetch from dashboard_templates table
    const { data: dashboardTemplates, error: dashboardError } = await supabase
      .from('dashboard_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    
    // Also fetch from content_posts where is_template = true (similar to pending posts logic)
    const { data: contentTemplates, error: contentError } = await supabase
      .from('content_posts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_template', true)
      .order('created_at', { ascending: false });
    
    // Combine both sources
    const allTemplates = [
      ...(dashboardTemplates || []),
      ...(contentTemplates || []).map(ct => ({
        ...ct,
        template_name: ct.title || ct.template_name || 'Untitled Template',
        // Map content_posts fields to template fields
        id: ct.id,
        user_id: ct.user_id,
        created_at: ct.created_at,
        updated_at: ct.updated_at,
        is_active: true,
        is_deleted: false,
        usage_count: 0
      }))
    ];
    
    console.log('✅ Fetched templates:', {
      fromDashboard: dashboardTemplates?.length || 0,
      fromContent: contentTemplates?.length || 0,
      total: allTemplates.length
    });
      
    return allTemplates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

export const createTemplate = async (templateData: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<SavedTemplate> => {
  try {
    if (!supabase) throw new Error('Supabase client not available');

    // Get auth user with system UUID fallback
    const { data: { user } } = await supabase.auth.getUser();
    const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
    const finalUserId = user?.id || templateData.user_id || SYSTEM_USER_ID;

    // ✅ FIX #2: Ensure is_active AND is_deleted are ALWAYS set for template persistence
    // Sanitize empty string UUIDs and ensure user_id/created_by are never NULL
    const sanitizedData = {
      ...templateData,
      character_profile: templateData.character_profile?.trim() || null,
      source_template_id: templateData.source_template_id?.trim() || null,
      user_id: finalUserId,  // ✅ Never NULL
      created_by: finalUserId,  // ✅ Never NULL
      is_active: true,  // ✅ CRITICAL: Always set to true for template to appear after refresh
      is_deleted: false  // ✅ FIX #2: Ensure template is NOT marked as deleted
    };

    const { data, error } = await supabase
      .from('dashboard_templates')
      .insert(sanitizedData)
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

    // ✅ Ensure userId is never NULL
    const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
    const finalUserId = userId || SYSTEM_USER_ID;

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
      user_id: finalUserId,  // ✅ Never NULL
      created_by: finalUserId,  // ✅ Never NULL
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

// Default export for compatibility
export default scheduleAPI;
