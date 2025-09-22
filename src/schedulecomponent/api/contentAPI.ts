// /src/schedulecomponent/api/contentAPI.ts - FIXED IMPORTS
import { ContentPost, MediaFile } from '../types';

// Try multiple possible supabase import paths
const getSupabase = async () => {
  try {
    // Try the most common paths
    const paths = [
      '../../supabase/config',
      '../../lib/supabase', 
      '../../utils/supabase',
      '../../../supabase/config',
      '../../supabaseClient',
      '../../config/supabase'
    ];
    
    for (const path of paths) {
      try {
        const module = await import(path);
        if (module.supabase) {
          return module.supabase;
        }
        // Sometimes it's exported as default
        if (module.default) {
          return module.default;
        }
      } catch (pathError) {
        // Continue to next path
        continue;
      }
    }
    
    // If no path works, throw descriptive error
    throw new Error(`Could not find supabase config. Tried paths: ${paths.join(', ')}`);
  } catch (error) {
    console.error('Supabase import error:', error);
    throw new Error('Supabase client not available. Please check your supabase configuration.');
  }
};

export const contentAPI = {
  // Content Posts Operations
  async fetchPosts(userId: string): Promise<ContentPost[]> {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          character_profiles(name, username, role)
        `)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map((post: any) => this.mapDatabaseToContentPost(post));
    } catch (error) {
      console.error('Error fetching content posts:', error);
      throw error;
    }
  },

  async savePost(postData: Omit<ContentPost, 'id' | 'createdDate'>): Promise<ContentPost> {
    try {
      const supabase = await getSupabase();
      
      // Prepare database record
      const databaseRecord = {
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
      };
      
      const { data, error } = await supabase
        .from('content_posts')
        .insert(databaseRecord)
        .select()
        .single();
        
      if (error) throw error;
      return this.mapDatabaseToContentPost(data);
    } catch (error) {
      console.error('Error saving content post:', error);
      throw error;
    }
  },

  async updatePost(id: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    try {
      const supabase = await getSupabase();
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

  async deletePost(id: string): Promise<void> {
    try {
      const supabase = await getSupabase();
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

  async duplicatePost(id: string): Promise<ContentPost> {
    try {
      const supabase = await getSupabase();
      
      // First, fetch the original post
      const { data: originalPost, error: fetchError } = await supabase
        .from('content_posts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Create a new post with the same data but new ID an
