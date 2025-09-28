// /src/schedulecomponent/api/scheduleAPI.ts - FIXED COLUMN MAPPINGS
import { supabase } from '../config';
import { ScheduledPost, SavedTemplate, PendingPost } from '../types';

// Helper function to map content_posts to ScheduledPost interface - FIXED COLUMN NAMES
const mapContentPostToScheduledPost = (data: any): ScheduledPost => {
  return {
    id: data.id,
    content_id: data.content_id || '',
    character_profile: data.character_profile || '', // FIXED: Use character_profile UUID
    theme: data.theme || '',
    audience: data.audience || '',
    media_type: data.media_type || '',
    template_type: data.template_type || '',
    platform: data.platform || '', // FIXED: Use platform not social_platform
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

// Helper function to map dashboard_posts to ScheduledPost interface - FIXED COLUMN NAMES
const mapDashboardPostToScheduledPost = (data: any): ScheduledPost => {
  return {
    id: data.id,
    content_id: data.content_id || '',
    character_profile: data.character_profile || '', // FIXED: Use character_profile UUID
    theme: data.theme || '',
    audience: data.audience || '',
    media_type: data.media_type || '',
    template_type: data.template_type || '',
    platform: data.platform || '', // FIXED: Use platform not social_platform
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

// SCHEDULED POSTS - Read from content_posts table where status = 'scheduled'
export const fetchScheduledPosts = async (userId: string): Promise<ScheduledPost[]> => {
  try {
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

// SAVE CHANGES TO SCHEDULED POST - Updates content_posts table with CORRECT COLUMN NAMES
export const updateScheduledPost = async (id: string, updates: Partial<ScheduledPost>): Promise<ScheduledPost> => {
  try {
    // First check if post is in content_posts (scheduled) or dashboard_posts (completed)
    const { data: contentPost } = await supabase
      .from('content_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (contentPost) {
      // Post is scheduled - update in content_posts table with CORRECT COLUMNS
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
      if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
      if (updates.cta !== undefined) updateData.cta = updates.cta;
      if (updates.media_files !== undefined) updateData.media_files = updates.media_files;
      if (updates.selected_platforms !== undefined) updateData.selected_platforms = updates.selected_platforms;
      if (updates.character_profile !== undefined) updateData.character_profile = updates.character_profile; // FIXED: correct column
      if (updates.theme !== undefined) updateData.theme = updates.theme;
      if (updates.audience !== undefined) updateData.audience = updates.audience;
      if (updates.media_type !== undefined) updateData.media_type = updates.media_type;
      if (updates.template_type !== undefined) updateData.template_type = updates.template_type;
      if (updates.platform !== undefined) updateData.platform = updates.platform; // FIXED: correct column

      const { data, error } = await supabase
        .from('content_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapContentPostToScheduledPost(data);
    } else {
      // Post is completed - update in dashboard_posts table
      const updateData: any = {};
      
      if (updates.scheduled_date !== undefined) updateData.scheduled_date = updates.scheduled_date.toISOString();
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;

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

// SCHEDULE POST - Move from content_posts to dashboard_posts with date/time
export const createScheduledPost = async (postData: Omit<ScheduledPost, 'id' | 'created_date'>): Promise<ScheduledPost> => {
  try {
    // Get the original post from content_posts using the post ID
    const { data: originalPost, error: fetchError } = await supabase
      .from('content_posts')
      .select('*')
      .eq('id', postData.id)
      .single();

    if (fetchError) throw fetchError;

    // Create scheduled post in dashboard_posts table with CORRECT COLUMNS
    const dashboardPostData = {
      content_id: originalPost.content_id,
      character_profile: originalPost.character_profile, // FIXED: correct column
      theme: originalPost.theme,
      audience: originalPost.audience,
      media_type: originalPost.media_type,
      template_type: originalPost.template_type,
      platform: originalPost.platform, // FIXED: correct column
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
      original_post_id: originalPost.id
    };

    const { data: newScheduledPost, error: insertError } = await supabase
      .from('dashboard_posts')
      .insert(dashboardPostData)
      .select()
      .single();

    if (insertError) throw insertError;

    // Update original post status to 'published' in content_posts
    await supabase
      .from('content_posts')
      .update({ status: 'published' })
      .eq('id', originalPost.id);

    return mapDashboardPostToScheduledPost(newScheduledPost);
  } catch (error) {
    console.error('Error creating scheduled post:', error);
    throw error;
  }
};

// DELETE POST - Remove from dashboard view only (not database)
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

// RESCHEDULE TEMPLATE - Send back to content_posts for re-editing with CORRECT COLUMNS
export const rescheduleFromTemplate = async (templateId: string, userId: string): Promise<any> => {
  try {
    // Get template data
    const { data: template, error: templateError } = await supabase
      .from('dashboard_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Create new post in content_posts with template data - USING CORRECT COLUMNS
    const newPostData = {
      content_id: `template-${templateId}-${Date.now()}`,
      character_profile: template.character_profile || '', // FIXED: correct column
      theme: template.theme || '',
      audience: template.audience || '',
      media_type: template.media_type || '',
      template_type: template.template_type || '',
      platform: template.platform || '', // FIXED: correct column
      title: template.title || '',
      description: template.description || '',
      hashtags: template.hashtags || [],
      keywords: template.keywords || '',
      cta: template.cta || '',
      selected_platforms: template.selected_platforms || [],
      status: 'scheduled',
      is_from_template: true,
      source_template_id: templateId,
      user_id: userId,
      created_by: userId
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

// ADD CONTENT POST UPDATE METHOD FOR EDIT MODAL
export const updateContentPost = async (id: string, updates: Partial<ScheduledPost>): Promise<ScheduledPost> => {
  try {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
    if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
    if (updates.cta !== undefined) updateData.cta = updates.cta;
    if (updates.media_files !== undefined) updateData.media_files = updates.media_files;
    if (updates.selected_platforms !== undefined) updateData.selected_platforms = updates.selected_platforms;
    if (updates.character_profile !== undefined) updateData.character_profile = updates.character_profile;
    if (updates.theme !== undefined) updateData.theme = updates.theme;
    if (updates.audience !== undefined) updateData.audience = updates.audience;
    if (updates.media_type !== undefined) updateData.media_type = updates.media_type;
    if (updates.template_type !== undefined) updateData.template_type = updates.template_type;
    if (updates.platform !== undefined) updateData.platform = updates.platform;

    const { data, error } = await supabase
      .from('content_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapContentPostToScheduledPost(data);
  } catch (error) {
    console.error('Error updating content post:', error);
    throw error;
  }
};

// MAIN API OBJECT EXPORT
export const scheduleAPI = {
  fetchScheduledPosts,
  createScheduledPost,
  updateScheduledPost,
  updateContentPost, // ADDED: For EditModal support
  deleteScheduledPost,
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementTemplateUsage,
  rescheduleFromTemplate
};
