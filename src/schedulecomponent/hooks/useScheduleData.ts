import { useState, useEffect, useCallback } from 'react';
import { scheduleAPI } from '../api/scheduleAPI';
import { ScheduledPost, SavedTemplate, PendingPost } from '../types';
import { supabase } from '../../supabase/config';

// FIXED: Proper user context and error handling
const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Auth error:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

export const useScheduledPosts = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await getCurrentUser();
      if (!user?.id) {
        console.warn('No authenticated user found');
        setPosts([]);
        return;
      }

      const data = await scheduleAPI.fetchScheduledPosts(user.id);
      setPosts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      console.error('Error refreshing posts:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async (postData: Omit<ScheduledPost, 'id' | 'created_date'>) => {
    try {
      setError(null);
      const user = await getCurrentUser();
      if (!user?.id) {
        throw new Error('Authentication required');
      }

      // Ensure user fields are set
      const postWithUser = {
        ...postData,
        user_id: user.id,
        created_by: user.id
      };

      const newPost = await scheduleAPI.createScheduledPost(postWithUser);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      console.error('Error creating post:', errorMessage);
      setError(errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      console.error('Error updating post:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      setError(null);
      await scheduleAPI.deleteScheduledPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      console.error('Error deleting post:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  // Load posts on hook initialization
  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

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

export const usePendingPosts = () => {
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await getCurrentUser();
      if (!user?.id) {
        console.warn('No authenticated user found');
        setPosts([]);
        return;
      }

      const data = await scheduleAPI.fetchPendingPosts(user.id);
      setPosts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pending posts';
      console.error('Error refreshing pending posts:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async (postData: Omit<PendingPost, 'id' | 'created_date'>) => {
    try {
      setError(null);
      const user = await getCurrentUser();
      if (!user?.id) {
        throw new Error('Authentication required');
      }

      // Ensure user fields are set
      const postWithUser = {
        ...postData,
        user_id: user.id,
        created_by: user.id,
        status: 'pending_schedule' as const
      };

      const newPost = await scheduleAPI.createPendingPost(postWithUser);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pending post';
      console.error('Error creating pending post:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const updatePost = async (id: string, updates: Partial<PendingPost>) => {
    try {
      setError(null);
      const updatedPost = await scheduleAPI.updatePendingPost(id, updates);
      setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
      return updatedPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update pending post';
      console.error('Error updating pending post:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      setError(null);
      await scheduleAPI.deletePendingPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete pending post';
      console.error('Error deleting pending post:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  // Load posts on hook initialization
  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

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

  const refreshTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await getCurrentUser();
      if (!user?.id) {
        console.warn('No authenticated user found');
        setTemplates([]);
        return;
      }

      const data = await scheduleAPI.fetchTemplates(user.id);
      setTemplates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      console.error('Error refreshing templates:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = async (templateData: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const user = await getCurrentUser();
      if (!user?.id) {
        throw new Error('Authentication required');
      }

      // Ensure user fields are set
      const templateWithUser = {
        ...templateData,
        user_id: user.id,
        created_by: user.id,
        usage_count: 0,
        is_active: true,
        template_version: 1
      };

      const newTemplate = await scheduleAPI.createTemplate(templateWithUser);
      setTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      console.error('Error creating template:', errorMessage);
      setError(errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      console.error('Error updating template:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setError(null);
      await scheduleAPI.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      console.error('Error deleting template:', errorMessage);
      setError(errorMessage);
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
      console.error('Error incrementing template usage:', err);
      // Don't throw error for usage increment - it's not critical
    }
  };

  // Load templates on hook initialization
  useEffect(() => {
    refreshTemplates();
  }, [refreshTemplates]);

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

// COMBINED HOOK FOR SCHEDULE MANAGER DASHBOARD
export const useScheduleManager = () => {
  const scheduledPosts = useScheduledPosts();
  const pendingPosts = usePendingPosts();
  const templates = useTemplates();

  const refreshAll = useCallback(async () => {
    await Promise.all([
      scheduledPosts.refreshPosts(),
      pendingPosts.refreshPosts(),
      templates.refreshTemplates()
    ]);
  }, [scheduledPosts.refreshPosts, pendingPosts.refreshPosts, templates.refreshTemplates]);

  const isLoading = scheduledPosts.loading || pendingPosts.loading || templates.loading;
  const hasError = !!(scheduledPosts.error || pendingPosts.error || templates.error);
  const errors = [scheduledPosts.error, pendingPosts.error, templates.error].filter(Boolean);

  // Status summary calculations
  const statusSummary = {
    totalPosts: scheduledPosts.posts.length + pendingPosts.posts.length,
    pending: pendingPosts.posts.length,
    scheduled: scheduledPosts.posts.filter(p => p.status === 'scheduled').length,
    published: scheduledPosts.posts.filter(p => p.status === 'published').length,
    failed: scheduledPosts.posts.filter(p => p.status === 'failed').length,
    templates: templates.templates.length
  };

  return {
    scheduledPosts,
    pendingPosts,
    templates,
    refreshAll,
    isLoading,
    hasError,
    errors,
    statusSummary
  };
};

// UTILITY HOOK FOR AUTHENTICATION STATUS
export const useAuthStatus = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Authentication error');
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(session?.user || null);
          setError(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user
  };
};
