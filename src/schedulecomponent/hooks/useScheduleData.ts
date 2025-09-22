// /src/schedulecomponent/hooks/useScheduleData.ts - FIXED to work with corrected API and types
import { useState, useEffect } from 'react';
import { scheduleAPI } from '../api/scheduleAPI';
import { DashboardPost, ScheduledPost, DashboardTemplate } from '../types';
import { supabase } from '../../supabase/config';

/**
 * Hook for managing dashboard posts (posts in Schedule Manager)
 */
export const useDashboardPosts = () => {
  const [posts, setPosts] = useState<DashboardPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUserId = () => {
    const { data: { user } } = supabase.auth.getUser();
    return user?.id || '';
  };

  const refreshPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getCurrentUserId();
      const data = await scheduleAPI.fetchDashboardPosts(userId);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: Omit<DashboardPost, 'id' | 'created_date' | 'updated_at'>) => {
    try {
      setError(null);
      const newPost = await scheduleAPI.createDashboardPost(postData);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dashboard post');
      throw err;
    }
  };

  const updatePost = async (id: string, updates: Partial<DashboardPost>) => {
    try {
      setError(null);
      const updatedPost = await scheduleAPI.updateDashboardPost(id, updates);
      setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
      return updatedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dashboard post');
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      setError(null);
      await scheduleAPI.deleteDashboardPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dashboard post');
      throw err;
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    refreshPosts,
    createPost,
    updatePost,
    deletePost
  };
};

/**
 * Hook for managing scheduled posts
 */
export const useScheduledPosts = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUserId = () => {
    const { data: { user } } = supabase.auth.getUser();
    return user?.id || '';
  };

  const refreshPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getCurrentUserId();
      const data = await scheduleAPI.fetchScheduledPosts(userId);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: Omit<ScheduledPost, 'id' | 'created_date'>) => {
    try {
      setError(null);
      const newPost = await scheduleAPI.createScheduledPost(postData);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scheduled post');
      throw err;
    }
  };

  const updatePost = async (id: string, updates: Partial<ScheduledPost>) => {
    try {
      setError(null);
      const updatedPost = await scheduleAPI.updateScheduledPost(id, updates);
      setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
      return updatedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update scheduled post');
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      setError(null);
      await scheduleAPI.deleteScheduledPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scheduled post');
      throw err;
    }
  };

  // Schedule a dashboard post (convert to scheduled post)
  const schedulePost = async (
    dashboardPost: DashboardPost,
    scheduleData: {
      scheduledDate: Date;
      priorityLevel?: 'low' | 'medium' | 'high' | 'urgent';
      campaignId?: string;
    }
  ) => {
    try {
      setError(null);
      
      // Create scheduled post from dashboard post
      const scheduledPostData: Omit<ScheduledPost, 'id' | 'created_date'> = {
        dashboard_post_id: dashboardPost.id,
        content_id: dashboardPost.content_id,
        character_profile: dashboardPost.character_profile,
        theme: dashboardPost.theme,
        audience: dashboardPost.audience,
        media_type: dashboardPost.media_type,
        template_type: dashboardPost.template_type,
        platform: dashboardPost.platform,
        voice_style: dashboardPost.voice_style,
        title: dashboardPost.title,
        description: dashboardPost.description,
        hashtags: dashboardPost.hashtags,
        keywords: dashboardPost.keywords,
        cta: dashboardPost.cta,
        media_files: dashboardPost.media_files,
        selected_platforms: dashboardPost.selected_platforms,
        scheduled_date: scheduleData.scheduledDate,
        status: 'scheduled',
        priority_level: scheduleData.priorityLevel,
        campaign_id: scheduleData.campaignId,
        retry_count: 0
      };

      const newScheduledPost = await scheduleAPI.createScheduledPost(scheduledPostData);
      setPosts(prev => [newScheduledPost, ...prev]);
      
      return newScheduledPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule post');
      throw err;
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    refreshPosts,
    createPost,
    updatePost,
    deletePost,
    schedulePost
  };
};

/**
 * Hook for managing dashboard templates
 */
export const useTemplates = () => {
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUserId = () => {
    const { data: { user } } = supabase.auth.getUser();
    return user?.id || '';
  };

  const refreshTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getCurrentUserId();
      const data = await scheduleAPI.fetchTemplates(userId);
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<DashboardTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newTemplate = await scheduleAPI.createTemplate(templateData);
      setTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<DashboardTemplate>) => {
    try {
      setError(null);
      const updatedTemplate = await scheduleAPI.updateTemplate(id, updates);
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      return updatedTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setError(null);
      await scheduleAPI.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  };

  const incrementUsage = async (id: string) => {
    try {
      await scheduleAPI.incrementTemplateUsage(id);
      setTemplates(prev => prev.map(t => 
        t.id === id ? { ...t, usage_count: t.usage_count + 1 } : t
      ));
    } catch (err) {
      console.error('Failed to increment template usage:', err);
    }
  };

  useEffect(() => {
    refreshTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage
  };
};

/**
 * Combined hook for Schedule Manager data (dashboard + scheduled posts)
 */
export const useScheduleManager = () => {
  const dashboardPosts = useDashboardPosts();
  const scheduledPosts = useScheduledPosts();
  const templates = useTemplates();

  // Get posts pending schedule (in dashboard with pending_schedule status)
  const pendingSchedulePosts = dashboardPosts.posts.filter(
    post => post.status === 'pending_schedule'
  );

  // Get all posts (dashboard + scheduled) for overview
  const allPosts = [
    ...dashboardPosts.posts,
    ...scheduledPosts.posts
  ];

  // Overall loading state
  const loading = dashboardPosts.loading || scheduledPosts.loading || templates.loading;

  // Combined errors
  const errors = [
    dashboardPosts.error,
    scheduledPosts.error,
    templates.error
  ].filter(Boolean);

  const error = errors.length > 0 ? errors.join('; ') : null;

  return {
    // Dashboard posts
    dashboardPosts: dashboardPosts.posts,
    dashboardLoading: dashboardPosts.loading,
    dashboardError: dashboardPosts.error,
    createDashboardPost: dashboardPosts.createPost,
    updateDashboardPost: dashboardPosts.updatePost,
    deleteDashboardPost: dashboardPosts.deletePost,
    refreshDashboardPosts: dashboardPosts.refreshPosts,
    
    // Scheduled posts
    scheduledPosts: scheduledPosts.posts,
    scheduledLoading: scheduledPosts.loading,
    scheduledError: scheduledPosts.error,
    createScheduledPost: scheduledPosts.createPost,
    updateScheduledPost: scheduledPosts.updatePost,
    deleteScheduledPost: scheduledPosts.deletePost,
    refreshScheduledPosts: scheduledPosts.refreshPosts,
    schedulePost: scheduledPosts.schedulePost,
    
    // Templates
    templates: templates.templates,
    templatesLoading: templates.loading,
    templatesError: templates.error,
    createTemplate: templates.createTemplate,
    updateTemplate: templates.updateTemplate,
    deleteTemplate: templates.deleteTemplate,
    incrementTemplateUsage: templates.incrementUsage,
    refreshTemplates: templates.refreshTemplates,
    
    // Combined data
    pendingSchedulePosts,
    allPosts,
    loading,
    error
  };
};
