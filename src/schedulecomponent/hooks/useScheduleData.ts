// /src/schedulecomponent/hooks/useScheduleData.ts - ENHANCED with error handling, NO AUTH REQUIRED

import { useState, useEffect, useCallback } from 'react';
import { scheduleAPI } from '../api/scheduleAPI';
import { ScheduledPost, SavedTemplate, ApiError, OperationResult, ValidationError } from '../types';

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

// ✅ VALIDATION UTILITIES
const validatePost = (postData: Partial<ScheduledPost>): ValidationError[] => {
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
      
      // ✅ NO AUTH REQUIRED - use default UUID for personal dashboard
      const defaultUserId = '00000000-0000-0000-0000-000000000000';
      const data = await withRetry(() => scheduleAPI.fetchScheduledPosts(defaultUserId));
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

  const createPost = useCallback(async (
    postData: Omit<ScheduledPost, 'id' | 'created_date'>
  ): Promise<OperationResult<ScheduledPost>> => {
    try {
      setError(null);
      
      // ✅ VALIDATION
      const validationErrors = validatePost(postData);
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
      
      const newPost = await withRetry(() => scheduleAPI.createScheduledPost(postData));
      setPosts(prev => [newPost, ...prev]);
      
      return { success: true, data: newPost };
    } catch (err) {
      const apiError = createApiError(err, 'create post');
      setError(apiError);
      return { success: false, error: apiError };
    }
  }, []);

  const updatePost = useCallback(async (
    id: string, 
    updates: Partial<ScheduledPost>
  ): Promise<OperationResult<ScheduledPost>> => {
    try {
      setError(null);
      
      if (!id?.trim()) {
        throw new Error('Post ID is required');
      }
      
      // ✅ VALIDATION
      const validationErrors = validatePost(updates);
      if (validationErrors.length > 0) {
        return { 
          success: false, 
          validationErrors,
          error: createApiError(
            { message: 'Validation failed' }, 
            'update post'
          )
        };
      }
      
      const updatedPost = await withRetry(() => scheduleAPI.updateScheduledPost(id, updates));
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
      
      await withRetry(() => scheduleAPI.deleteScheduledPost(id));
      setPosts(prev => prev.filter(p => p.id !== id));
      
      return { success: true };
    } catch (err) {
      const apiError = createApiError(err, 'delete post');
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
      
      // ✅ NO AUTH REQUIRED - just call API directly
      const data = await withRetry(() => scheduleAPI.fetchTemplates(''));
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
