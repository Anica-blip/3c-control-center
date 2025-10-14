// /src/schedulecomponent/hooks/useScheduleData.ts - FIXED FOR GITHUB

import { useState, useEffect, useCallback } from 'react';
import { scheduleAPI } from '../api/scheduleAPI';
import { ScheduledPost, SavedTemplate, ApiError, OperationResult, ValidationError } from '../types';

// ✅ USER CONTEXT HELPER - Gets current user ID from app context/session
const getCurrentUserId = (): string => {
  // Safe localStorage access with fallback
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'system-user';
  }

  try {
    // Check localStorage for user session
    const userSession = localStorage.getItem('user_session');
    if (userSession) {
      const session = JSON.parse(userSession);
      if (session.user?.id) return session.user.id;
      if (session.userId) return session.userId;
    }
    
    // Fallback to app state
    const appState = localStorage.getItem('app_state');
    if (appState) {
      const state = JSON.parse(appState);
      if (state.currentUser?.id) return state.currentUser.id;
      if (state.userId) return state.userId;
    }
    
    // Generate session user ID if none exists
    let sessionUserId = localStorage.getItem('session_user_id');
    if (!sessionUserId) {
      sessionUserId = generateUUID();
      localStorage.setItem('session_user_id', sessionUserId);
    }
    
    return sessionUserId;
  } catch (e) {
    console.warn('Error accessing localStorage:', e);
    return 'fallback-user';
  }
};

// ✅ CROSS-PLATFORM UUID GENERATOR
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ✅ ERROR UTILITIES
const createApiError = (error: any, operation: string): ApiError => {
  const timestamp = new Date();
  
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
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

// ✅ VALIDATION - Only for COMPLETE posts
const validateCompletePost = (postData: ScheduledPost): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!postData.description?.trim()) {
    errors.push({
      field: 'description',
      message: 'Description is required',
      code: 'REQUIRED_FIELD'
    });
  }
  
  if (!postData.character_profile?.trim()) {
    errors.push({
      field: 'character_profile',
      message: 'Character profile is required',
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

  // ✅ FIXED: createPost handles scheduling workflow correctly
  const createPost = useCallback(async (
    postData: Omit<ScheduledPost, 'id' | 'created_date'> | ScheduledPost
  ): Promise<OperationResult<ScheduledPost>> => {
    try {
      setError(null);
      
      // Check if this is a scheduling operation
      const isSchedulingOperation = 'scheduled_date' in postData && 
                                    postData.scheduled_date && 
                                    ('content_id' in postData || 'original_post_id' in postData);
      
      if (isSchedulingOperation) {
        // Scheduling existing post - move from content_posts to scheduled_posts
        const scheduledPostData = postData as Omit<ScheduledPost, 'id' | 'created_date'>;
        const newPost = await withRetry(() => scheduleAPI.createScheduledPost(scheduledPostData));
        
        // Update local state
        setPosts(prev => {
          const filtered = prev.filter(p => {
            if ('id' in postData && p.id === postData.id) return false;
            if (p.content_id === scheduledPostData.content_id) return false;
            return true;
          });
          return [newPost, ...filtered];
        });
        
        return { success: true, data: newPost };
      } else {
        // Creating new post from template/copy
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
        
        // Create new post in local state only (will be persisted when scheduled)
        const newPostData: ScheduledPost = {
          id: generateUUID(),
          ...postData,
          created_date: new Date(),
          scheduled_date: null
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

  // ✅ FIXED: Direct pending post updates
  const updatePost = useCallback(async (
    id: string, 
    updates: Partial<ScheduledPost>
  ): Promise<OperationResult<ScheduledPost>> => {
    try {
      setError(null);
      
      if (!id?.trim()) {
        throw new Error('Post ID is required');
      }
      
      // Use direct updatePendingPost for pending posts
      const updatedPost = await withRetry(() => scheduleAPI.updatePendingPost(id, updates));
      
      // Update local state
      setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
      
      return { success: true, data: updatedPost };
    } catch (err) {
      const apiError = createApiError(err, 'update post');
      setError(apiError);
      return { success: false, error: apiError };
    }
  }, []);

  const deletePost = useCallback(async (id: string): Promise<OperationResult> => {
    try {
      setError(null);
      
      if (!id?.trim()) {
        throw new Error('Post ID is required');
      }
      
      // Remove from dashboard view only
      await withRetry(() => scheduleAPI.deleteScheduledPost(id));
      
      // Update local state
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
