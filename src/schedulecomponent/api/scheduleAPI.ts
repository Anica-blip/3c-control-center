// /src/schedulecomponent/api/scheduleAPI.ts - FIXED to work with corrected types
import { supabase } from '../../supabase/config';
import { DashboardPost, ScheduledPost, DashboardTemplate } from '../types';

export const scheduleAPI = {
  // ===== DASHBOARD POSTS (Posts in Schedule Manager) =====
  
  /**
   * Fetch dashboard posts (posts forwarded to Schedule Manager)
   * @param userId - User ID to filter posts
   * @returns Array of dashboard posts
   */
  async fetchDashboardPosts(userId: string): Promise<DashboardPost[]> {
    try {
      const { data, error } = await supabase
        .from('dashboard_posts')
        .select(`
          *,
          character_profiles(name, username, role)
        `)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(post => ({
        id: post.id,
        original_content_id: post.original_content_id,
        content_id: post.content_id,
        character_profile: post.character_profile || '',
        theme: post.theme || '',
        audience: post.audience || '',
        media_type: post.media_type || '',
        template_type: post.template_type || '',
        platform: post.platform || '',
        voice_style: post.voice_style || '',
        title: post.title || '',
        description: post.description || '',
        hashtags: post.hashtags || [],
        keywords: post.keywords || '',
        cta: post.cta || '',
        media_files: post.media_files || [],
        selected_platforms: post.selected_platforms || [],
        status: post.status,
        created_date: new Date(post.created_at),
        updated_at: new Date(post.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching dashboard posts:', error);
      throw error;
    }
  },

  /**
   * Create dashboard post (when forwarded from Content Creation)
   * @param postData - Dashboard post data
   * @returns Created dashboard post
   */
  async createDashboardPost(postData: Omit<DashboardPost, 'id' | 'created_date' | 'updated_at'>): Promise<DashboardPost> {
    try {
      const { data, error } = await supabase
        .from('dashboard_posts')
        .insert({
          original_content_id: postData.original_content_id,
          content_id: postData.content_id,
          character_profile: postData.character_profile,
          theme: postData.theme,
          audience: postData.audience,
          media_type: postData.media_type,
          template_type: postData.template_type,
          platform: postData.platform,
          voice_style: postData.voice_style,
          title: postData.title,
          description: postData.description,
          hashtags: postData.hashtags,
          keywords: postData.keywords,
          cta: postData.cta,
          media_files: postData.media_files,
          selected_platforms: postData.selected_platforms,
          status: postData.status
        })
        .select()
        .single();
        
      if (error) throw error;
      return this.mapDatabaseToDashboardPost(data);
    } catch (error) {
      console.error('Error creating dashboard post:', error);
      throw error;
    }
  },

  /**
   * Update dashboard post
   * @param id - Post ID
   * @param updates - Partial updates
   * @returns Updated dashboard post
   */
  async updateDashboardPost(id: string, updates: Partial<DashboardPost>): Promise<DashboardPost> {
    try {
      const updateData: any = {};
      
      // Map fields for database update
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
      if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
      if (updates.cta !== undefined) updateData.cta = updates.cta;
      if (updates.media_files !== undefined) updateData.media_files = updates.media_files;
      if (updates.selected_platforms !== undefined) updateData.selected_platforms = updates.selected_platforms;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { data, error } = await supabase
        .from('dashboard_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return this.mapDatabaseToDashboardPost(data);
    } catch (error) {
      console.error('Error updating dashboard post:', error);
      throw error;
    }
  },

  /**
   * Delete dashboard post
   * @param id - Post ID
   */
  async deleteDashboardPost(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('dashboard_posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting dashboard post:', error);
      throw error;
    }
  },

  // ===== SCHEDULED POSTS (Posts with assigned schedule) =====

  /**
   * Fetch scheduled posts
   * @param userId - User ID to filter posts
   * @returns Array of scheduled posts
   */
  async fetchScheduledPosts(userId: string): Promise<ScheduledPost[]> {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          *,
          character_profiles(name, username, role)
        `)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(post => ({
        id: post.id,
        dashboard_post_id: post.dashboard_post_id,
        content_id: post.content_id,
        character_profile: post.character_profile || '',
        theme: post.theme || '',
        audience: post.audience || '',
        media_type: post.media_type || '',
        template_type: post.template_type || '',
        platform: post.platform || '',
        voice_style: post.voice_style || '',
        title: post.title || '',
        description: post.description || '',
        hashtags: post.hashtags || [],
        keywords: post.keywords || '',
        cta: post.cta || '',
        media_files: post.media_files || [],
        selected_platforms: post.selected_platforms || [],
        scheduled_date: new Date(post.scheduled_date),
        status: post.status,
        failure_reason: post.failure_reason,
        last_attempt: post.last_attempt ? new Date(post.last_attempt) : undefined,
        retry_count: post.retry_count || 0,
        created_date: new Date(post.created_at),
        priority_level: post.priority_level,
        persona_target: post.persona_target,
        audience_segment: post.audience_segment,
        campaign_id: post.campaign_id
      }));
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      throw error;
    }
  },

  /**
   * Create scheduled post (from dashboard post)
   * @param postData - Scheduled post data
   * @returns Created scheduled post
   */
  async createScheduledPost(postData: Omit<ScheduledPost, 'id' | 'created_date'>): Promise<ScheduledPost> {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          dashboard_post_id: postData.dashboard_post_id,
          content_id: postData.content_id,
          character_profile: postData.character_profile,
          theme: postData.theme,
          audience: postData.audience,
          media_type: postData.media_type,
          template_type: postData.template_type,
          platform: postData.platform,
          voice_style: postData.voice_style,
          title: postData.title,
          description: postData.description,
          hashtags: postData.hashtags,
          keywords: postData.keywords,
          cta: postData.cta,
          media_files: postData.media_files,
          selected_platforms: postData.selected_platforms,
          scheduled_date: postData.scheduled_date.toISOString(),
          status: postData.status,
          priority_level: postData.priority_level,
          persona_target: postData.persona_target,
          audience_segment: postData.audience_segment,
          campaign_id: postData.campaign_id
        })
        .select()
        .single();
        
      if (error) throw error;
      return this.mapDatabaseToScheduledPost(data);
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      throw error;
    }
  },

  /**
   * Update scheduled post
   * @param id - Post ID
   * @param updates - Partial updates
   * @returns Updated scheduled post
   */
  async updateScheduledPost(id: string, updates: Partial<ScheduledPost>): Promise<ScheduledPost> {
    try {
      const updateData: any = {};
      
      // Map fields for database update
      if (updates.scheduled_date !== undefined) updateData.scheduled_date = updates.scheduled_date.toISOString();
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.failure_reason !== undefined) updateData.failure_reason = updates.failure_reason;
      if (updates.retry_count !== undefined) updateData.retry_count = updates.retry_count;
      if (updates.priority_level !== undefined) updateData.priority_level = updates.priority_level;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
      if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
      if (updates.cta !== undefined) updateData.cta = updates.cta;
      if (updates.media_files !== undefined) updateData.media_files = updates.media_files;
      if (updates.selected_platforms !== undefined) updateData.selected_platforms = updates.selected_platforms;

      const { data, error } = await supabase
        .from('scheduled_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return this.mapDatabaseToScheduledPost(data);
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      throw error;
    }
  },

  /**
   * Delete scheduled post
   * @param id - Post ID
   */
  async deleteScheduledPost(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      throw error;
    }
  },

  // ===== DASHBOARD TEMPLATES =====

  /**
   * Fetch dashboard templates
   * @param userId - User ID to filter templates
   * @returns Array of dashboard templates
   */
  async fetchTemplates(userId: string): Promise<DashboardTemplate[]> {
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
  },

  /**
   * Create dashboard template
   * @param templateData - Template data
   * @returns Created template
   */
  async createTemplate(templateData: Omit<DashboardTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<DashboardTemplate> {
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
  },

  /**
   * Update dashboard template
   * @param id - Template ID
   * @param updates - Partial updates
   * @returns Updated template
   */
  async updateTemplate(id: string, updates: Partial<DashboardTemplate>): Promise<DashboardTemplate> {
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
  },

  /**
   * Delete dashboard template
   * @param id - Template ID
   */
  async deleteTemplate(id: string): Promise<void> {
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
  },

  /**
   * Increment template usage count
   * @param id - Template ID
   */
  async incrementTemplateUsage(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('increment_template_usage', { template_id: id });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing template usage:', error);
      throw error;
    }
  },

  // ===== HELPER FUNCTIONS =====

  /**
   * Map database record to DashboardPost interface
   * @param data - Database record
   * @returns DashboardPost object
   */
  mapDatabaseToDashboardPost(data: any): DashboardPost {
    return {
      id: data.id,
      original_content_id: data.original_content_id,
      content_id: data.content_id,
      character_profile: data.character_profile || '',
      theme: data.theme || '',
      audience: data.audience || '',
      media_type: data.media_type || '',
      template_type: data.template_type || '',
      platform: data.platform || '',
      voice_style: data.voice_style || '',
      title: data.title || '',
      description: data.description || '',
      hashtags: data.hashtags || [],
      keywords: data.keywords || '',
      cta: data.cta || '',
      media_files: data.media_files || [],
      selected_platforms: data.selected_platforms || [],
      status: data.status,
      created_date: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  },

  /**
   * Map database record to ScheduledPost interface
   * @param data - Database record
   * @returns ScheduledPost object
   */
  mapDatabaseToScheduledPost(data: any): ScheduledPost {
    return {
      id: data.id,
      dashboard_post_id: data.dashboard_post_id,
      content_id: data.content_id,
      character_profile: data.character_profile || '',
      theme: data.theme || '',
      audience: data.audience || '',
      media_type: data.media_type || '',
      template_type: data.template_type || '',
      platform: data.platform || '',
      voice_style: data.voice_style || '',
      title: data.title || '',
      description: data.description || '',
      hashtags: data.hashtags || [],
      keywords: data.keywords || '',
      cta: data.cta || '',
      media_files: data.media_files || [],
      selected_platforms: data.selected_platforms || [],
      scheduled_date: new Date(data.scheduled_date),
      status: data.status,
      failure_reason: data.failure_reason,
      last_attempt: data.last_attempt ? new Date(data.last_attempt) : undefined,
      retry_count: data.retry_count || 0,
      created_date: new Date(data.created_at),
      priority_level: data.priority_level,
      persona_target: data.persona_target,
      audience_segment: data.audience_segment,
      campaign_id: data.campaign_id
    };
  }
};
