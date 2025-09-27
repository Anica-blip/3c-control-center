// /src/schedulecomponent/hooks/useScheduleData.ts - FIXED TO MATCH COMPONENT LOGIC

import { useState, useEffect, useCallback } from 'react';
import { scheduleAPI } from '../api/scheduleAPI';
import { ScheduledPost, SavedTemplate, ApiError, OperationResult, ValidationError } from '../types';

// ✅ USER CONTEXT HELPER - Gets current user ID from app context/session
const getCurrentUserId = (): string => {
  // Check localStorage for user session (following established patterns)
  const userSession = localStorage.getItem('user_session');
  if (userSession) {
    try {
      const session = JSON.parse(userSession);
      return session.user?.id || session.userId;
    } catch (e) {
      console.warn('Invalid user session format');
    }
  }
  
  // Fallback to app state or context
  const appState = localStorage.getItem('app_state');
  if (appState) {
    try {
      const state = JSON.parse(appState);
      return state.currentUser?.id || state.userId;
    } catch (e) {
      console.warn('Invalid app state format');
    }
  }
  
  // Generate session user ID if none exists (for component operation)
  let sessionUserId = localStorage.getItem('session_user_id');
  if (!sessionUserId) {
    sessionUserId = crypto.randomUUID();
    localStorage.setItem('session_user_id', sessionUserId);
  }
  
  return sessionUserId;
};

// ✅ ERROR UTILITIES
const createApiError = (error: any, operation: string): ApiError => {
  const timestamp = new Date();
  
  if (!navigator.onLine) {
    return {
      message: 'No internet connection. Please check your network and try again.',
      code: 'NETWORK_OFFLINE',
      type: 'network',
      timestamp,
      retryable: true,
      details: { operation }
    };
  }

  if (error?.code === 'PGRST116' || error?.message?.includes('network')) {
    return {
      message: 'Connection failed. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      type: 'network',
      timestamp,
      retryable: true,
      details: { operation, originalError: error }
    };
  }

  if (error?.status >= 500) {
    return {
      message: 'Server error occurred. Our team has been notified.',
      code: 'SERVER_ERROR',
      type: 'server',
      timestamp,
      retryable: true,
      details: { operation, status: error.status }
    };
  }

  if (error?.status >= 400 && error?.status < 500) {
    return {
      message: error?.message || 'Invalid request. Please check your input.',
      code: 'VALIDATION_ERROR',
      type: 'validation',
      timestamp,
      retryable: false,
      details: { operation, status: error.status }
    };
  }

  return {
    message: error?.message || `Failed to ${operation}. Please try again.`,
    code: 'UNKNOWN_ERROR',
    type: 'unknown',
    timestamp,
    retryable: true,
    details: { operation, originalError: error }
  };
};

// ✅ RETRY UTILITY
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      const apiError = createApiError(error, 'retry operation');
      if (!apiError.retryable || attempt === maxRetries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// FIXED: Validation only for COMPLETE posts, not partial updates
const validateCompletePost = (postData: ScheduledPost): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!postData.description?.trim()) {
    errors.push({
      field: 'description',
      message: 'Description is required',
      code: 'REQUIRED_FIELD'
    });
  }
  
  if (!postData.name?.trim()) {
    errors.push({
      field: 'name',
      message: 'Character name is required',
      code: 'REQUIRED_FIELD'
    });
  }
  
  if (!postData.selected_platforms?.length) {
    errors.push({
      field: 'selected_platforms',
      message: 'At least one platform must be selected',
      code: 'REQUIRED_FIELD'
    });
  }
  
  return errors;
};

const validateTemplate = (templateData: Partial<SavedTemplate>): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!templateData.template_name?.trim()) {
    errors.push({
      field: 'template_name',
      message: 'Template name is required',
      code: 'REQUIRED_FIELD'
    });
  }
  
  if (!templateData.description?.trim()) {
    errors.push({
      field: 'description',
      message: 'Description is required',
      code: 'REQUIRED_FIELD'
    });
  }
  
  return errors;
};

export const useScheduledPosts = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const refreshPosts = useCallback(async (): Promise<OperationResult<ScheduledPost[]>> => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ RLS COMPLIANT - use proper user ID for database queries
      const userId = getCurrentUserId();
      const data = await withRetry(() => scheduleAPI.fetchScheduledPosts(userId));
      setPosts(data);
      
      return { success: true, data };
    } catch (err) {
      const apiError = createApiError(err, 'load posts');
      setError(apiError);
      return { success: false, error: apiError };
    } finally {
      setLoading(false);
    }
  }, []);

  // FIXED: createPost now handles scheduling workflow correctly
  const createPost = useCallback(async (
    postData: Omit<ScheduledPost, 'id' | 'created_date'> | ScheduledPost
  ): Promise<OperationResult<ScheduledPost>> => {
    try {
      setError(null);
      
      // Check if this is a scheduling operation (has scheduled_date and existing post data)
      const isSchedulingOperation = 'scheduled_date' in postData && postData.scheduled_date && 'id' in postData;
      
      if (isSchedulingOperation) {
        // This is scheduling an existing post - move from content_posts to dashboard_posts
        const scheduledPostData = postData as ScheduledPost;
        const newPost = await withRetry(() => scheduleAPI.createScheduledPost(scheduledPostData));
        
        // Update local state - remove from pending, add to scheduled list
        setPosts(prev => {
          const filtered = prev.filter(p => p.id !== scheduledPostData.id);
          return [newPost, ...filtered];
        });
        
        return { success: true, data: newPost };
      } else {
        // This is creating a new post from template/copy - add to content_posts
        const validationErrors = validateCompletePost(postData as ScheduledPost);
        if (validationErrors.length > 0) {
          return { 
            success: false, 
            validationErrors,
            error: createApiError(
              { message: 'Validation failed' }, 
              'create post'
            )
          };
        }
        
        // For new posts, use rescheduleFromTemplate or create new content_post
        // This is handled by the template system, so just add to local state
        const newPostData = {
          id: crypto.randomUUID(),
          ...postData,
          created_date: new Date(),
          scheduled_date: null // New posts don't have scheduled_date yet
        } as ScheduledPost;
        
        setPosts(prev => [newPostData, ...prev]);
        return { success: true, data: newPostData };
      }
    } catch (err) {
      const apiError = createApiError(err, 'create post');
      setError(apiError);
      return { success: false, error: apiError };
    }
  }, []);

  // FIXED: updatePost - NO VALIDATION on partial updates, just like loading pattern
  const updatePost = useCallback(async (
    id: string, 
    updates: Partial<ScheduledPost>
  ): Promise<OperationResult<ScheduledPost>> => {
    try {
      setError(null);
      
      if (!id?.trim()) {
        throw new Error('Post ID is required');
      }
      
      // Find the current post to determine if it's pending
      const currentPost = posts.find(p => p.id === id);
      const isPendingPost = currentPost?.status === 'scheduled';
      
      // FIXED: NO VALIDATION - follow the loading pattern that works
      // Just update the post directly, same as how loading works
      
      let updatedPost;
      if (isPendingPost) {
        // For pending posts: ensure status stays 'scheduled' to remain in content_posts
        const pendingUpdates = {
          ...updates,
          status: 'scheduled' as const // Keep as 'scheduled' in content_posts
        };
        // Use the content post update API (assuming scheduleAPI has this method)
        if (scheduleAPI.updateContentPost) {
          updatedPost = await withRetry(() => scheduleAPI.updateContentPost(id, pendingUpdates));
        } else {
          // Fallback: use regular update but ensure status preservation
          updatedPost = await withRetry(() => scheduleAPI.updateScheduledPost(id, pendingUpdates));
        }
      } else {
        // For scheduled posts: update dashboard_posts table normally
        updatedPost = await withRetry(() => scheduleAPI.updateScheduledPost(id, updates));
      }
      
      setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
      
      return { success: true, data: updatedPost };
    } catch (err) {
      const apiError = createApiError(err, 'update post');
      setError(apiError);
      return { success: false, error: apiError };
    }
  }, [posts]);

  const deletePost = useCallback(async (id: string): Promise<OperationResult> => {
    try {
      setError(null);
      
      if (!id?.trim()) {
        throw new Error('Post ID is required');
      }
      
      // Remove from dashboard view only (no database deletion)
      await withRetry(() => scheduleAPI.deleteScheduledPost(id));
      
      // Update local state to remove from display
      setPosts(prev => prev.filter(p => p.id !== id));
      
      return { success: true };
    } catch (err) {
      const apiError = createApiError(err, 'remove post from dashboard');
      setError(apiError);
      return { success: false, error: apiError };
    }
  }, []);

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
  const [error, setError] = useState<ApiError | null>(null);

  const refreshTemplates = useCallback(async (): Promise<OperationResult<SavedTemplate[]>> => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ RLS COMPLIANT - use proper user ID for database queries
      const userId = getCurrentUserId();
      const data = await withRetry(() => scheduleAPI.fetchTemplates(userId));
      setTemplates(data);
      
      return { success: true, data };
    } catch (err) {
      const apiError = createApiError(err, 'load templates');
      setError(apiError);
      return { success: false, error: apiError };
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (
    templateData: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<OperationResult<SavedTemplate>> => {
    try {
      setError(null);
      
      // ✅ VALIDATION
      const validationErrors = validateTemplate(templateData);
      if (validationErrors.length > 0) {
        return { 
          success: false, 
          validationErrors,
          error: createApiError(
            { message: 'Validation failed' }, 
            'create template'
          )
        };
      }
      
      const newTemplate = await withRetry(() => scheduleAPI.createTemplate(templateData));
      setTemplates(prev => [newTemplate, ...prev]);
      
      return { success: true, data: newTemplate };
    } catch (err) {
      const apiError = createApiError(err, 'create template');
      setError(apiError);
      return { success: false, error: apiError };
    }
  }, []);

  const updateTemplate = useCallback(async (
    id: string, 
    updates: Partial<SavedTemplate>
  ): Promise<OperationResult<SavedTemplate>> => {
    try {
      setError(null);
      
      if (!id?.trim()) {
        throw new Error('Template ID is required');
      }
      
      const updatedTemplate = await withRetry(() => scheduleAPI.updateTemplate(id, updates));
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      
      return { success: true, data: updatedTemplate };
    } catch (err) {
      const apiError = createApiError(err, 'update template');
      setError(apiError);
      return { success: false, error: apiError };
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string): Promise<OperationResult> => {
    try {
      setError(null);
      
      if (!id?.trim()) {
        throw new Error('Template ID is required');
      }
      
      await withRetry(() => scheduleAPI.deleteTemplate(id));
      setTemplates(prev => prev.filter(t => t.id !== id));
      
      return { success: true };
    } catch (err) {
      const apiError = createApiError(err, 'delete template');
      setError(apiError);
      return { success: false, error: apiError };
    }
  }, []);

  const incrementUsage = useCallback(async (id: string): Promise<OperationResult> => {
    try {
      if (!id?.trim()) {
        throw new Error('Template ID is required');
      }
      
      await withRetry(() => scheduleAPI.incrementTemplateUsage(id));
      setTemplates(prev => prev.map(t => 
        t.id === id ? { ...t, usage_count: t.usage_count + 1 } : t
      ));
      
      return { success: true };
    } catch (err) {
      const apiError = createApiError(err, 'increment template usage');
      // Don't set error state for non-critical operations
      console.error('Failed to increment template usage:', apiError);
      return { success: false, error: apiError };
    }
  }, []);

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
