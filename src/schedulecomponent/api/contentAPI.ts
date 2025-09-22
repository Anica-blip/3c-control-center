import { supabase } from '../../supabase/config';
import { ContentPost, MediaFile } from '../types';

export const contentAPI = {
  // Content Posts Operations
  async fetchPosts(userId: string): Promise<ContentPost[]> {
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
      
      return data.map(post => this.mapDatabaseToContentPost(post));
    } catch (error) {
      console.error('Error fetching content posts:', error);
      throw error;
    }
  },

  async savePost(postData: Omit<ContentPost, 'id' | 'createdDate'>): Promise<ContentPost> {
    try {
      console.log('Saving post to content_posts:', postData);
      
      const insertData = {
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
        is_from_template: postData.isFromTemplate || false,
        source_template_id: postData.sourceTemplateId,
        user_id: postData.user_id,
        created_by: postData.created_by
      };

      console.log('Insert data for content_posts:', insertData);

      const { data, error } = await supabase
        .from('content_posts')
        .insert(insertData)
        .select()
        .single();
        
      if (error) {
        console.error('Supabase error saving post:', error);
        throw error;
      }

      console.log('Post saved successfully:', data);
      return this.mapDatabaseToContentPost(data);
    } catch (error) {
      console.error('Error saving content post:', error);
      throw error;
    }
  },

  async updatePost(id: string, updates: Partial<ContentPost>): Promise<ContentPost> {
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

  async deletePost(id: string): Promise<void> {
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

  async duplicatePost(id: string): Promise<ContentPost> {
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

  async searchPosts(userId: string, searchTerm: string): Promise<ContentPost[]> {
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

  async getPostsByStatus(userId: string, status: string): Promise<ContentPost[]> {
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

  // FIXED: Get posts by character profile for analytics
  async getPostsByCharacter(userId: string, characterId: string): Promise<ContentPost[]> {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          character_profiles(name, username, role)
        `)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('character_profile_id', characterId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(post => this.mapDatabaseToContentPost(post));
    } catch (error) {
      console.error('Error fetching posts by character:', error);
      throw error;
    }
  },

  // FIXED: Get posts by theme for analytics
  async getPostsByTheme(userId: string, theme: string): Promise<ContentPost[]> {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          character_profiles(name, username, role)
        `)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('theme', theme)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(post => this.mapDatabaseToContentPost(post));
    } catch (error) {
      console.error('Error fetching posts by theme:', error);
      throw error;
    }
  },

  // FIXED: Get posts created from templates
  async getPostsFromTemplates(userId: string): Promise<ContentPost[]> {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          character_profiles(name, username, role)
        `)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('is_from_template', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(post => this.mapDatabaseToContentPost(post));
    } catch (error) {
      console.error('Error fetching posts from templates:', error);
      throw error;
    }
  },

  // FIXED: Get analytics data for dashboard
  async getAnalyticsData(userId: string): Promise<{
    totalPosts: number;
    postsThisWeek: number;
    postsThisMonth: number;
    statusBreakdown: Record<string, number>;
    platformBreakdown: Record<string, number>;
    themeBreakdown: Record<string, number>;
    recentActivity: ContentPost[];
  }> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Get all posts for analysis
      const posts = await this.fetchPosts(userId);
      
      // Calculate analytics
      const totalPosts = posts.length;
      
      const postsThisWeek = posts.filter(post => 
        new Date(post.createdDate) >= oneWeekAgo
      ).length;
      
      const postsThisMonth = posts.filter(post => 
        new Date(post.createdDate) >= oneMonthAgo
      ).length;

      // Status breakdown
      const statusBreakdown = posts.reduce((acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Platform breakdown (count all selected platforms)
      const platformBreakdown = posts.reduce((acc, post) => {
        post.selectedPlatforms.forEach(platform => {
          acc[platform] = (acc[platform] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      // Theme breakdown
      const themeBreakdown = posts.reduce((acc, post) => {
        if (post.theme) {
          acc[post.theme] = (acc[post.theme] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Recent activity (last 10 posts)
      const recentActivity = posts.slice(0, 10);

      return {
        totalPosts,
        postsThisWeek,
        postsThisMonth,
        statusBreakdown,
        platformBreakdown,
        themeBreakdown,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  },

  // FIXED: Batch operations for efficiency
  async batchUpdateStatus(postIds: string[], status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_posts')
        .update({ status })
        .in('id', postIds);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error batch updating status:', error);
      throw error;
    }
  },

  async batchDeletePosts(postIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .in('id', postIds);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error batch deleting posts:', error);
      throw error;
    }
  },

  // FIXED: Export posts as JSON for backup
  async exportPosts(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const posts = await this.fetchPosts(userId);
      
      if (format === 'json') {
        return JSON.stringify(posts, null, 2);
      } else {
        // Simple CSV export
        const headers = [
          'ID', 'Content ID', 'Title', 'Description', 'Theme', 'Audience', 
          'Status', 'Created Date', 'Selected Platforms', 'Hashtags'
        ];
        
        const rows = posts.map(post => [
          post.id,
          post.contentId,
          post.title,
          post.description?.substring(0, 100) + '...',
          post.theme,
          post.audience,
          post.status,
          post.createdDate.toISOString().split('T')[0],
          post.selectedPlatforms.join('; '),
          post.hashtags.join('; ')
        ]);

        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
          
        return csvContent;
      }
    } catch (error) {
      console.error('Error exporting posts:', error);
      throw error;
    }
  },

  // Helper function to map database records to TypeScript interface
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
  }
};
