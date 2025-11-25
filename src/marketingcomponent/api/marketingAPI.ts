// /src/marketingcomponent/api/marketingAPI.ts - Supabase API Operations

import { supabase, TABLES, BUCKETS, getCurrentUser } from '../config';
import {
  Persona,
  Keyword,
  Tag,
  Channel,
  Strategy,
  IntelEntry,
  ResearchInsight,
  AnalyticsTool,
  ApiError,
  BulkUploadResult
} from '../types';

// ============================================================================
// ERROR HANDLING UTILITY
// ============================================================================

/**
 * Standardized error handler for all API operations
 */
const handleApiError = (error: any, operation: string): ApiError => {
  console.error(`[MarketingAPI] ${operation} failed:`, error);
  
  return {
    message: error.message || `Failed to ${operation}`,
    code: error.code || 'UNKNOWN_ERROR',
    details: error.details || error.hint || ''
  };
};

// ============================================================================
// PERSONAS API
// ============================================================================

export const personasAPI = {
  /**
   * Fetch all personas
   */
  fetchPersonas: async (): Promise<Persona[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PERSONAS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch personas');
    }
  },

  /**
   * Create new persona
   */
  createPersona: async (persona: Omit<Persona, 'id' | 'created_at' | 'updated_at'>): Promise<Persona> => {
    try {
      const currentUser = await getCurrentUser();
      
      const { data, error } = await supabase
        .from(TABLES.PERSONAS)
        .insert([{
          ...persona,
          last_edited_by: persona.last_edited_by || currentUser || 'Unknown'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'create persona');
    }
  },

  /**
   * Update existing persona
   */
  updatePersona: async (id: string, updates: Partial<Persona>): Promise<Persona> => {
    try {
      const currentUser = await getCurrentUser();
      
      const { data, error } = await supabase
        .from(TABLES.PERSONAS)
        .update({
          ...updates,
          last_edited_by: currentUser || updates.last_edited_by || 'Unknown',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'update persona');
    }
  },

  /**
   * Delete persona
   */
  deletePersona: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from(TABLES.PERSONAS)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'delete persona');
    }
  },

  /**
   * Fetch persona by ID
   */
  fetchPersonaById: async (id: string): Promise<Persona | null> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PERSONAS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'fetch persona by ID');
    }
  }
};

// ============================================================================
// KEYWORDS API
// ============================================================================

export const keywordsAPI = {
  /**
   * Fetch all keywords
   */
  fetchKeywords: async (): Promise<Keyword[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.KEYWORDS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch keywords');
    }
  },

  /**
   * Create new keyword
   */
  createKeyword: async (keyword: Omit<Keyword, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<Keyword> => {
    try {
      const currentUser = await getCurrentUser();
      
      const { data, error } = await supabase
        .from(TABLES.KEYWORDS)
        .insert([{
          ...keyword,
          added_by: keyword.added_by || currentUser || 'Unknown',
          usage_count: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'create keyword');
    }
  },

  /**
   * Update existing keyword
   */
  updateKeyword: async (id: string, updates: Partial<Keyword>): Promise<Keyword> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.KEYWORDS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'update keyword');
    }
  },

  /**
   * Delete keyword
   */
  deleteKeyword: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from(TABLES.KEYWORDS)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'delete keyword');
    }
  },

  /**
   * Increment keyword usage count
   */
  incrementUsage: async (id: string): Promise<void> => {
    try {
      const { data: keyword, error: fetchError } = await supabase
        .from(TABLES.KEYWORDS)
        .select('usage_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from(TABLES.KEYWORDS)
        .update({ usage_count: (keyword.usage_count || 0) + 1 })
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (error) {
      throw handleApiError(error, 'increment keyword usage');
    }
  },

  /**
   * Bulk upload keywords from CSV
   */
  bulkUploadKeywords: async (keywords: Array<Omit<Keyword, 'id' | 'created_at' | 'updated_at' | 'usage_count'>>): Promise<BulkUploadResult> => {
    try {
      const currentUser = await getCurrentUser();
      const results: BulkUploadResult = { success: 0, failed: 0, errors: [] };

      for (const keyword of keywords) {
        try {
          await keywordsAPI.createKeyword({
            ...keyword,
            added_by: keyword.added_by || currentUser || 'CSV Import'
          });
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Failed to import "${keyword.keyword}": ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      throw handleApiError(error, 'bulk upload keywords');
    }
  }
};

// ============================================================================
// TAGS API
// ============================================================================

export const tagsAPI = {
  /**
   * Fetch all tags
   */
  fetchTags: async (): Promise<Tag[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.TAGS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch tags');
    }
  },

  /**
   * Create new tag
   */
  createTag: async (tag: Omit<Tag, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<Tag> => {
    try {
      const currentUser = await getCurrentUser();
      
      const { data, error } = await supabase
        .from(TABLES.TAGS)
        .insert([{
          ...tag,
          added_by: tag.added_by || currentUser || 'Unknown',
          usage_count: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'create tag');
    }
  },

  /**
   * Update existing tag
   */
  updateTag: async (id: string, updates: Partial<Tag>): Promise<Tag> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.TAGS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'update tag');
    }
  },

  /**
   * Delete tag
   */
  deleteTag: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from(TABLES.TAGS)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'delete tag');
    }
  },

  /**
   * Increment tag usage count
   */
  incrementUsage: async (id: string): Promise<void> => {
    try {
      const { data: tag, error: fetchError } = await supabase
        .from(TABLES.TAGS)
        .select('usage_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from(TABLES.TAGS)
        .update({ usage_count: (tag.usage_count || 0) + 1 })
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (error) {
      throw handleApiError(error, 'increment tag usage');
    }
  },

  /**
   * Fetch tags by category
   */
  fetchTagsByCategory: async (category: string): Promise<Tag[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.TAGS)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch tags by category');
    }
  }
};

// ============================================================================
// CHANNELS API
// ============================================================================

export const channelsAPI = {
  /**
   * Fetch all channels
   */
  fetchChannels: async (): Promise<Channel[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHANNELS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch channels');
    }
  },

  /**
   * Create new channel
   */
  createChannel: async (channel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>): Promise<Channel> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHANNELS)
        .insert([channel])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'create channel');
    }
  },

  /**
   * Update existing channel
   */
  updateChannel: async (id: string, updates: Partial<Channel>): Promise<Channel> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHANNELS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'update channel');
    }
  },

  /**
   * Delete channel
   */
  deleteChannel: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from(TABLES.CHANNELS)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'delete channel');
    }
  },

  /**
   * Fetch active channels only
   */
  fetchActiveChannels: async (): Promise<Channel[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHANNELS)
        .select('*')
        .eq('status', 'Active')
        .order('priority_level', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch active channels');
    }
  }
};

// ============================================================================
// STRATEGIES API
// ============================================================================

export const strategiesAPI = {
  /**
   * Fetch all strategies
   */
  fetchStrategies: async (): Promise<Strategy[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.STRATEGIES)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch strategies');
    }
  },

  /**
   * Create new strategy
   */
  createStrategy: async (strategy: Omit<Strategy, 'id' | 'created_at' | 'updated_at'>): Promise<Strategy> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.STRATEGIES)
        .insert([strategy])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'create strategy');
    }
  },

  /**
   * Update existing strategy
   */
  updateStrategy: async (id: string, updates: Partial<Strategy>): Promise<Strategy> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.STRATEGIES)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'update strategy');
    }
  },

  /**
   * Delete strategy
   */
  deleteStrategy: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from(TABLES.STRATEGIES)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'delete strategy');
    }
  },

  /**
   * Fetch strategies by status
   */
  fetchStrategiesByStatus: async (status: string): Promise<Strategy[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.STRATEGIES)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch strategies by status');
    }
  }
};

// ============================================================================
// INTEL API
// ============================================================================

export const intelAPI = {
  /**
   * Fetch all intel entries
   */
  fetchIntel: async (): Promise<IntelEntry[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.INTEL)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch intel entries');
    }
  },

  /**
   * Create new intel entry
   */
  createIntel: async (intel: Omit<IntelEntry, 'id' | 'created_at' | 'updated_at'>): Promise<IntelEntry> => {
    try {
      const currentUser = await getCurrentUser();
      
      const { data, error } = await supabase
        .from(TABLES.INTEL)
        .insert([{
          ...intel,
          created_by: currentUser || 'Unknown'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'create intel entry');
    }
  },

  /**
   * Update existing intel entry
   */
  updateIntel: async (id: string, updates: Partial<IntelEntry>): Promise<IntelEntry> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.INTEL)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'update intel entry');
    }
  },

  /**
   * Delete intel entry
   */
  deleteIntel: async (id: string): Promise<void> => {
    try {
      // First, get the intel entry to check for audio file
      const { data: intel, error: fetchError } = await supabase
        .from(TABLES.INTEL)
        .select('audio_file_url, audio_filename')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete audio file from storage if exists
      if (intel.audio_filename) {
        const { error: storageError } = await supabase
          .storage
          .from(BUCKETS.AUDIO)
          .remove([intel.audio_filename]);

        if (storageError) {
          console.warn('Failed to delete audio file:', storageError);
        }
      }

      // Delete the intel entry
      const { error } = await supabase
        .from(TABLES.INTEL)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'delete intel entry');
    }
  },

  /**
   * Upload audio file to Supabase storage
   */
  uploadAudioFile: async (file: File): Promise<{ url: string; filename: string }> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `intel/${filename}`;

      const { error: uploadError } = await supabase
        .storage
        .from(BUCKETS.AUDIO)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from(BUCKETS.AUDIO)
        .getPublicUrl(filePath);

      return { url: publicUrl, filename: filePath };
    } catch (error) {
      throw handleApiError(error, 'upload audio file');
    }
  },

  /**
   * Fetch intel by priority level
   */
  fetchIntelByPriority: async (priorityLevel: string): Promise<IntelEntry[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.INTEL)
        .select('*')
        .eq('priority_level', priorityLevel)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch intel by priority');
    }
  }
};

// ============================================================================
// RESEARCH INSIGHTS API
// ============================================================================

export const researchAPI = {
  /**
   * Fetch all research insights
   */
  fetchResearchInsights: async (): Promise<ResearchInsight[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESEARCH)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch research insights');
    }
  },

  /**
   * Create new research insight
   */
  createResearchInsight: async (insight: Omit<ResearchInsight, 'id' | 'created_at' | 'updated_at'>): Promise<ResearchInsight> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESEARCH)
        .insert([insight])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'create research insight');
    }
  },

  /**
   * Update existing research insight
   */
  updateResearchInsight: async (id: string, updates: Partial<ResearchInsight>): Promise<ResearchInsight> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESEARCH)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'update research insight');
    }
  },

  /**
   * Delete research insight
   */
  deleteResearchInsight: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from(TABLES.RESEARCH)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'delete research insight');
    }
  },

  /**
   * Fetch research insights by review status
   */
  fetchInsightsByStatus: async (reviewStatus: string): Promise<ResearchInsight[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESEARCH)
        .select('*')
        .eq('review_status', reviewStatus)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch insights by status');
    }
  }
};

// ============================================================================
// ANALYTICS TOOLS API
// ============================================================================

export const analyticsToolsAPI = {
  /**
   * Fetch all analytics tools
   */
  fetchAnalyticsTools: async (): Promise<AnalyticsTool[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ANALYTICS_TOOLS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch analytics tools');
    }
  },

  /**
   * Create new analytics tool
   */
  createAnalyticsTool: async (tool: Omit<AnalyticsTool, 'id' | 'created_at' | 'updated_at'>): Promise<AnalyticsTool> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ANALYTICS_TOOLS)
        .insert([tool])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'create analytics tool');
    }
  },

  /**
   * Update existing analytics tool
   */
  updateAnalyticsTool: async (id: string, updates: Partial<AnalyticsTool>): Promise<AnalyticsTool> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ANALYTICS_TOOLS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'update analytics tool');
    }
  },

  /**
   * Delete analytics tool
   */
  deleteAnalyticsTool: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from(TABLES.ANALYTICS_TOOLS)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'delete analytics tool');
    }
  },

  /**
   * Fetch active analytics tools only
   */
  fetchActiveTools: async (): Promise<AnalyticsTool[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ANALYTICS_TOOLS)
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'fetch active tools');
    }
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  personasAPI,
  keywordsAPI,
  tagsAPI,
  channelsAPI,
  strategiesAPI,
  intelAPI,
  researchAPI,
  analyticsToolsAPI
};
