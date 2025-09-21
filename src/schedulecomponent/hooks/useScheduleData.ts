import { useState, useEffect } from 'react';
import { scheduleAPI } from '../api/scheduleAPI';
import { ScheduledPost, SavedTemplate } from '../types';
import { supabase } from '../../supabase/config';

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
      setError(err instanceof Error ? err.message : 'Failed to load posts');
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

  const createTemplate = async (templateData: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>) => {
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
