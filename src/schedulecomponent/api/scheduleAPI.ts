// /src/schedulecomponent/api/scheduleAPI.ts - FIXED EXPORTS
import { ScheduledPost, SavedTemplate, PendingPost } from '../types';

// Dynamic import for supabase to avoid import issues
const getSupabase = async () => {
  const { supabase } = await import('../config');
  return supabase;
};

// Helper function to map database records to TypeScript interface
const mapDatabaseToScheduledPost = (data: any): ScheduledPost => {
  return {
    id: data.id,
    content_id: data.content_id || data.media_content_id || '',
    character_profile: data.character_profile || data.character_profile_id || '',
    theme: data.theme || '',
    audience: data.audience || '',
    media_type: data.media_type || '',
    template_type: data.template_type || '',
    platform: data.platform || '',
    title: data.title || '',
    description: data.post_description || data.description || '',
    hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
    keywords: data.keywords || '',
    cta: data.cta || '',
    media_files: Array.isArray(data.media_files) ? data.media_files : [],
    selected_platforms: Array.isArray(data.selected_platforms) ? data.selected_platforms : [],
    scheduled_date: new Date(data.scheduled_time || data.scheduled_date),
    status: data.status,
    failure_reason: data.error_message,
    last_attempt: data.last_attempt_at ? new Date(data.last_attempt_at) : undefined,
    retry_count: data.attempt_count || 0,
    created_date: new Date(data.created_at),
    user_id: data.user_id || '',
    created_by: data.created_by || '',
    is_from_template: data.is_from_template,
    source_template_id: data.source_template_id,
    original_post_id: data.original_post_id,
    priority_level: data.priority_level,
    persona_target: data.persona_target,
    audience_segment: data.audience_segment,
    campaign_id: data.campaign_id
  };
};

// Scheduled Posts Operations
export const fetchScheduledPosts = async (userId: string): Promise<ScheduledPost[]> => {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select(`
        *,
        character_profiles(name, username, role),
        platform_assignment_details(*)
      `)
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(post => mapDatabaseToScheduledPost(post));
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    throw error;
  }
};

export const createScheduledPost = async (postData: Omit<ScheduledPost, 'id' | 'created_date'>): Promise<ScheduledPost> => {
  try {
    const supabase = await getSupabase();
    
    // Map dashboard fields to database fields
    const databaseRecord = {
      // Existing telegram bot fields (maintain compatibility)
      media_content_id: postData.content_id,
      post_description: postData.description,
      scheduled_time: postData.scheduled_date.toISOString(),
      character_profile_id: postData.character_profile,
      status: postData.status,
      
      // New dashboard fields
      content_id: postData.content_id,
      original_post_id: postData.original_post_id,
      theme: postData.theme,
      audience: postData.audience,
      media_type: postData.media_type,
      template_type: postData.template_type,
      platform: postData.platform,
      title: postData.title,
      hashtags: postData.hashtags,
      keywords: postData.keywords,
      cta: postData.cta,
      media_files: postData.media_files,
      selected_platforms: postData.selected_platforms,
      is_from_template: postData.is_from_template,
      source_template_id: postData.source_template_id,
      user_id: postData.user_id,
      created_by: postData.created_by,
      priority_level: postData.priority_level,
      persona_target: postData.persona_target,
      audience_segment: postData.audience_segment,
      campaign_id: postData.campaign_id,
      
      // Error tracking fields
      error_message: postData.failure_reason,
      attempt_count: postData.retry_count || 0,
      last_attempt_at: postData.last_attempt?.toISOString()
    };
    
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert(databaseRecord)
      .select()
      .single();
      
    if (error) throw error;
    return mapDatabaseToScheduledPost(data);
  } catch (error) {
    console.error('Error creating scheduled post:', error);
    throw error;
  }
};

export const updateScheduledPost = async (id: string, updates: Partial<ScheduledPost>): Promise<ScheduledPost> => {
  try {
    const supabase = await getSupabase();
    const updateData: any = {};
    
    // Map dashboard fields back to database fields
    if (updates.description !== undefined) updateData.post_description = updates.description;
    if (updates.scheduled_date !== undefined) updateData.scheduled_time = updates.scheduled_date.toISOString();
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.failure_reason !== undefined) updateData.error_message = updates.failure_reason;
    if (updates.retry_count !== undefined) updateData.attempt_count = updates.retry_count;
    if (updates.theme !== undefined) updateData.theme = updates.theme;
    if (updates.audience !== undefined) updateData.audience = updates.audience;
    if (updates.media_type !== undefined) updateData.media_type = updates.media_type;
    if (updates.template_type !== undefined) updateData.template_type = updates.template_type;
    if (updates.platform !== undefined) updateData.platform = updates.platform;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
    if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
    if (updates.cta !== undefined) updateData.cta = updates.cta;
    if (updates.media_files !== undefined) updateData.media_files = updates.media_files;
    if (updates.selected_platforms !== undefined) updateData.selected_platforms = updates.selected_platforms;
    if (updates.last_attempt !== undefined) updateData.last_attempt_at = updates.last_attempt.toISOString();

    const { data, error } = await supabase
      .from('scheduled_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return mapDatabaseToScheduledPost(data);
  } catch (error) {
    console.error('Error updating scheduled post:', error);
    throw error;
  }
};

export const deleteScheduledPost = async (id: string): Promise<void> => {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting scheduled post:', error);
    throw error;
  }
};

// Template Operations
export const fetchTemplates = async (userId: string): Promise<SavedTemplate[]> => {
  try {
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
    
    // Try to use RPC function first, fallback to manual update
    try {
      const { error } = await supabase.rpc('increment_template_usage', { template_id: id });
      if (error) throw error;
    } catch (rpcError) {
      console.warn('RPC increment failed, using manual update:', rpcError);
      
      // Fallback: Manual increment
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
    }
  } catch (error) {
    console.error('Error incrementing template usage:', error);
    throw error;
  }
};

// Pending Posts Operations (for content creation integration)
export const createPendingPost = async (postData: any): Promise<any> => {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('pending_schedule')
      .insert({
        original_post_id: postData.original_post_id,
        content_id: postData.contentId,
        character_profile_id: postData.characterProfile,
        theme: postData.theme,
        audience: postData.audience,
        media_type: postData.mediaType,
        template_type: postData.templateType,
        platform: postData.platform,
        voice_style: postData.voiceStyle,
        title: postData.title,
        description: postData.description,
        hashtags: postData.hashtags,
        keywords: postData.keywords,
        cta: postData.cta,
        media_files: postData.mediaFiles,
        selected_platforms: postData.selectedPlatforms,
        status: postData.status,
        is_from_template: postData.isFromTemplate,
        source_template_id: postData.sourceTemplateId,
        user_id: postData.user_id,
        created_by: postData.created_by
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating pending post:', error);
    throw error;
  }
};

// MAIN API OBJECT EXPORT - This is what gets imported
export const scheduleAPI = {
  fetchScheduledPosts,
  createScheduledPost,
  updateScheduledPost,
  deleteScheduledPost,
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementTemplateUsage,
  createPendingPost,
  mapDatabaseToScheduledPost
};
