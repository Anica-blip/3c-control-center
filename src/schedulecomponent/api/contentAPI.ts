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

  async createPendingPost(postData: any): Promise<any> {
    try {
      // This method is called by scheduleAPI to create the pending schedule entry
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
