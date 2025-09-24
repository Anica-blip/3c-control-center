// /src/schedulecomponent/hooks/useScheduleData.ts - FIXED
import { useState, useEffect } from 'react';
import { scheduleAPI } from '../api/scheduleAPI';
import { ScheduledPost, SavedTemplate } from '../types';

// Helper function to get current user ID
const getCurrentUserId = async () => {
  try {
    // Try to get user from localStorage first (faster)
    const cachedUser = localStorage.getItem('supabase.auth.token');
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      if (parsed?.user?.id) {
        return parsed.user.id;
      }
    }
    
    // Fallback: Import supabase and get user
    const { supabase } = await import('../../../config');
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || 'anonymous';
  } catch (error) {
    console.warn('Could not get user ID, using anonymous:', error);
    return 'anonymous';
  }
};

export const useScheduledPosts = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await getCurrentUserId();
      const data = await scheduleAPI.fetchScheduledPosts(userId);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      console.error('Error refreshing posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: Omit<ScheduledPost, 'id' | 'created_date'>) => {
    try {
      setError(null);
      const userId = await getCurrentUserId();
      const postWithUser = {
        ...postData,
        user_id: userId,
        created_by: userId
      };
      const newPost = await scheduleAPI.createScheduledPost(postWithUser);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
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
      setError(err instanceof Error ? err.message : 'Failed to update post');
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      setError(null);
      await scheduleAPI.deleteScheduledPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
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

export const useTemplates = () => {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await getCurrentUserId();
      const data = await scheduleAPI.fetchTemplates(userId);
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      console.error('Error refreshing templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const userId = await getCurrentUserId();
      const templateWithUser = {
        ...templateData,
        user_id: userId,
        created_by: userId
      };
      const newTemplate = await scheduleAPI.createTemplate(templateWithUser);
      setTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<SavedTemplate>) => {
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
