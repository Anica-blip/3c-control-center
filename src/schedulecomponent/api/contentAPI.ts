// /src/schedulecomponent/api/contentAPI.ts - FIXED to work with corrected workflow
import { supabase } from '../../../supabase/config';
import { ContentPost, DashboardPost } from '../types';

export const contentAPI = {
  // ===== CONTENT POSTS (Draft posts in Content Creation) =====
  
  /**
   * Fetch content posts (drafts in content creation)
   * @param userId - User ID to filter posts
   * @returns Array of content posts
   */
  async fetchContentPosts(userId: string): Promise<ContentPost[]> {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          character_profiles(name, username, role)
        `)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(post => ({
        id: post.id,
        contentId: post.content_id,
        characterProfile: post.character_profile_id || '',
        theme: post.theme || '',
        audience: post.audience || '',
        mediaType: post.media_type || '',
        templateType: post.template_type || '',
        platform: post.platform || '',
        voiceStyle: post.voice_style || '',
        title: post.title || '',
        description: post.description || '',
        hashtags: post.hashtags || [],
        keywords: post.keywords || '',
        cta: post.cta || '',
        mediaFiles: post.media_files || [],
        selectedPlatforms: post.selected_platforms || [],
        status: post.status,
        createdDate: new Date(post.created_at),
        isFromTemplate: post.is_from_template || false,
        sourceTemplateId: post.source_template_id,
        user_id: post.user_id,
        created_by: post.created_by
      }));
    } catch (error) {
      console.error('Error fetching content posts:', error);
      throw error;
    }
  },

  /**
   * Save content post (draft in content creation)
   * @param postData - Content post data
   * @returns Created content post
   */
  async saveContentPost(postData: Omit<ContentPost, 'id' | 'createdDate'>): Promise<ContentPost> {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .insert({
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
      return this.mapDatabaseToContentPost(data);
    } catch (error) {
      console.error('Error saving content post:', error);
      throw error;
    }
  },

  /**
   * Update content post
   * @param id - Post ID
   * @param updates - Partial updates
   * @returns Updated content post
   */
  async updateContentPost(id: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    try {
      const updateData: any = {};
      
      // Map content post fields to database fields
      if (updates.contentId !== undefined) updateData.content_id = updates.contentId;
      if (updates.characterProfile !== undefined) updateData.character_profile_id = updates.characterProfile;
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
      if (updates.mediaFiles !== undefined) updateData.media_files = updates.mediaFiles;
      if (updates.selectedPlatforms !== undefined) updateData.selected_platforms = updates.selectedPlatforms;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.isFromTemplate !== undefined) updateData.is_from_template = updates.isFromTemplate;
      if (updates.sourceTemplateId !== undefined) updateData.source_template_id = updates.sourceTemplateId;

      const { data, error } = await supabase
        .from('content_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return this.mapDatabaseToContentPost(data);
    } catch (error) {
      console.error('Error updating content post:', error);
      throw error;
    }
  },

  /**
   * Delete content post
   * @param id - Post ID
   */
  async deleteContentPost(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting content post:', error);
      throw error;
    }
  },

  /**
   * Forward content post to Schedule Manager
   * This creates a dashboard post from a content post
   * @param contentPost - Content post to forward
   * @returns Created dashboard post
   */
  async forwardToScheduleManager(contentPost: ContentPost): Promise<DashboardPost> {
    try {
      // Create dashboard post from content post
      const dashboardPostData = {
        original_content_id: contentPost.id,
        content_id: contentPost.contentId,
        character_profile: contentPost.characterProfile,
        theme: contentPost.theme,
        audience: contentPost.audience,
        media_type: contentPost.mediaType,
        template_type: contentPost.templateType,
        platform: contentPost.platform,
        voice_style: contentPost.voiceStyle,
        title: contentPost.title,
        description: contentPost.description,
        hashtags: contentPost.hashtags,
        keywords: contentPost.keywords,
        cta: contentPost.cta,
        media_files: contentPost.mediaFiles,
        selected_platforms: contentPost.selectedPlatforms,
        status: 'pending_schedule' as const // Always pending_schedule when forwarded
      };

      const { data, error } = await supabase
        .from('dashboard_posts')
        .insert(dashboardPostData)
        .select()
        .single();
        
      if (error) throw error;

      // Update original content post status to 'pending'
      await this.updateContentPost(contentPost.id, { status: 'pending' });

      return this.mapDatabaseToDashboardPost(data);
    } catch (error) {
      console.error('Error forwarding to schedule manager:', error);
      throw error;
    }
  },

  /**
   * Duplicate content post
   * @param id - Post ID to duplicate
   * @returns Duplicated content post
   */
  async duplicateContentPost(id: string): Promise<ContentPost> {
    try {
      // First, fetch the original post
      const { data: originalPost, error: fetchError } = await supabase
        .from('content_posts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Create a new post with the same data but new ID and timestamp
      const duplicateData = {
        ...originalPost,
        id: undefined, // Let Supabase generate new ID
        content_id: `${originalPost.content_id}-copy-${Date.now()}`,
        created_at: undefined, // Let Supabase set current timestamp
        updated_at: undefined
      };
      
      const { data, error } = await supabase
        .from('content_posts')
        .insert(duplicateData)
        .select()
        .single();
        
      if (error) throw error;
      return this.mapDatabaseToContentPost(data);
    } catch (error) {
      console.error('Error duplicating content post:', error);
      throw error;
    }
  },

  /**
   * Search content posts
   * @param userId - User ID to filter posts
   * @param searchTerm - Search term
   * @returns Filtered array of content posts
   */
  async searchContentPosts(userId: string, searchTerm: string): Promise<ContentPost[]> {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          character_profiles(name, username, role)
        `)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,keywords.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(post => this.mapDatabaseToContentPost(post));
    } catch (error) {
      console.error('Error searching content posts:', error);
      throw error;
    }
  },

  /**
   * Get content posts by status
   * @param userId - User ID to filter posts
   * @param status - Status to filter by
   * @returns Filtered array of content posts
   */
  async getContentPostsByStatus(userId: string, status: string): Promise<ContentPost[]> {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          character_profiles(name, username, role)
        `)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('status', status)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(post => this.mapDatabaseToContentPost(post));
    } catch (error) {
      console.error('Error fetching posts by status:', error);
      throw error;
    }
  },

  // ===== HELPER FUNCTIONS =====

  /**
   * Map database record to ContentPost interface
   * @param data - Database record
   * @returns ContentPost object
   */
  mapDatabaseToContentPost(data: any): ContentPost {
    return {
      id: data.id,
      contentId: data.content_id,
      characterProfile: data.character_profile_id || '',
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
      status: data.status,
      createdDate: new Date(data.created_at),
      isFromTemplate: data.is_from_template || false,
      sourceTemplateId: data.source_template_id,
      user_id: data.user_id,
      created_by: data.created_by
    };
  },

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
  }
};
