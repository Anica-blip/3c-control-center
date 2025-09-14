import { createClient } from '@supabase/supabase-js';
import { ContentPost, MediaFile } from './types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client created successfully for Content Manager');
} else {
  console.error('Missing Supabase environment variables in Content Manager');
}

export const supabaseAPI = {
  // Upload media file to content-media bucket
  async uploadMediaFile(file: File, contentId: string, userId: string): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');
    
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
  }, 

  // Save content post to content_posts table
  async saveContentPost(postData: Omit<ContentPost, 'id' | 'createdDate'>): Promise<ContentPost> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      // Upload media files first
      const uploadedMediaFiles = await Promise.all(
        postData.mediaFiles.map(async (mediaFile) => {
          if (mediaFile.url.startsWith('blob:')) {
            // Convert blob URL to file and upload
            const response = await fetch(mediaFile.url);
            const blob = await response.blob();
            const file = new File([blob], mediaFile.name, { type: blob.type });
            
            const supabaseUrl = await this.uploadMediaFile(file, postData.contentId, userId);
            
            return {
              ...mediaFile,
              supabaseUrl: supabaseUrl,
              url: supabaseUrl // Update URL to Supabase URL
            };
          }
          return mediaFile;
        })
      );

      // Prepare data for database insert
      const insertData = {
        content_id: postData.contentId,
        character_profile: postData.characterProfile,
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
        media_files: uploadedMediaFiles,
        selected_platforms: postData.selectedPlatforms,
        status: postData.status,
        is_from_template: postData.isFromTemplate || false,
        source_template_id: postData.sourceTemplateId,
        user_id: userId, // REQUIRED for RLS
        created_by: userId, // REQUIRED for tracking
        is_active: true
      };

      const { data, error } = await supabase
        .from('content_posts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Convert back to ContentPost format
      const contentPost: ContentPost = {
        id: data.id.toString(),
        contentId: data.content_id,
        characterProfile: data.character_profile,
        theme: data.theme,
        audience: data.audience,
        mediaType: data.media_type,
        templateType: data.template_type,
        platform: data.platform,
        voiceStyle: data.voice_style || '',
        title: data.title,
        description: data.description,
        hashtags: data.hashtags || [],
        keywords: data.keywords || '',
        cta: data.cta || '',
        mediaFiles: uploadedMediaFiles,
        selectedPlatforms: data.selected_platforms || [],
        status: data.status,
        createdDate: new Date(data.created_at),
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      return contentPost;
    } catch (error) {
      console.error('Error saving content post:', error);
      throw error;
    }
  },

  // Load content posts from content_posts table
  async loadContentPosts(): Promise<ContentPost[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to ContentPost format
      const contentPosts: ContentPost[] = (data || []).map(record => ({
        id: record.id.toString(),
        contentId: record.content_id,
        characterProfile: record.character_profile,
        theme: record.theme,
        audience: record.audience,
        mediaType: record.media_type,
        templateType: record.template_type,
        platform: record.platform || '',
        voiceStyle: record.voice_style || '',
        title: record.title || '',
        description: record.description || '',
        hashtags: record.hashtags || [],
        keywords: record.keywords || '',
        cta: record.cta || '',
        mediaFiles: record.media_files || [],
        selectedPlatforms: record.selected_platforms || [],
        status: record.status || 'pending',
        createdDate: new Date(record.created_at),
        scheduledDate: record.scheduled_date ? new Date(record.scheduled_date) : undefined,
        isFromTemplate: record.is_from_template || false,
        sourceTemplateId: record.source_template_id,
        supabaseId: record.id.toString()
      }));

      return contentPosts;
    } catch (error) {
      console.error('Error loading content posts:', error);
      return [];
    }
  },

  // Update content post
  async updateContentPost(postId: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      // Handle media file updates if needed
      let updatedMediaFiles = updates.mediaFiles;
      if (updates.mediaFiles) {
        updatedMediaFiles = await Promise.all(
          updates.mediaFiles.map(async (mediaFile) => {
            if (mediaFile.url.startsWith('blob:')) {
              // Upload new media file
              const response = await fetch(mediaFile.url);
              const blob = await response.blob();
              const file = new File([blob], mediaFile.name, { type: blob.type });
              
              const supabaseUrl = await this.uploadMediaFile(file, updates.contentId || 'updated', userId);
              
              return {
                ...mediaFile,
                supabaseUrl: supabaseUrl,
                url: supabaseUrl
              };
            }
            return mediaFile;
          })
        );
      }

      // Prepare update data
      const updateData: any = {};
      if (updates.characterProfile) updateData.character_profile = updates.characterProfile;
      if (updates.theme) updateData.theme = updates.theme;
      if (updates.audience) updateData.audience = updates.audience;
      if (updates.mediaType) updateData.media_type = updates.mediaType;
      if (updates.templateType) updateData.template_type = updates.templateType;
      if (updates.platform) updateData.platform = updates.platform;
      if (updates.voiceStyle) updateData.voice_style = updates.voiceStyle;
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.hashtags) updateData.hashtags = updates.hashtags;
      if (updates.keywords) updateData.keywords = updates.keywords;
      if (updates.cta) updateData.cta = updates.cta;
      if (updatedMediaFiles) updateData.media_files = updatedMediaFiles;
      if (updates.selectedPlatforms) updateData.selected_platforms = updates.selectedPlatforms;
      if (updates.status) updateData.status = updates.status;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('content_posts')
        .update(updateData)
        .eq('id', parseInt(postId))
        .select()
        .single();

      if (error) throw error;

      // Convert back to ContentPost format
      const contentPost: ContentPost = {
        id: data.id.toString(),
        contentId: data.content_id,
        characterProfile: data.character_profile,
        theme: data.theme,
        audience: data.audience,
        mediaType: data.media_type,
        templateType: data.template_type,
        platform: data.platform,
        voiceStyle: data.voice_style || '',
        title: data.title,
        description: data.description,
        hashtags: data.hashtags || [],
        keywords: data.keywords || '',
        cta: data.cta || '',
        mediaFiles: data.media_files || [],
        selectedPlatforms: data.selected_platforms || [],
        status: data.status,
        createdDate: new Date(data.created_at),
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      return contentPost;
    } catch (error) {
      console.error('Error updating content post:', error);
      throw error;
    }
  },

  // Soft delete content post
  async deleteContentPost(postId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      const { error } = await supabase
        .from('content_posts')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', parseInt(postId));

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting content post:', error);
      throw error;
    }
  }
};

export { supabase };
