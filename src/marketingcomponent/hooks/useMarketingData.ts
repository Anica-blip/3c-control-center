// /src/marketingcomponent/hooks/useMarketingData.ts - Custom React Hooks for Marketing Data

import { useState, useEffect, useCallback } from 'react';
import {
  personasAPI,
  keywordsAPI,
  tagsAPI,
  channelsAPI,
  strategiesAPI,
  intelAPI,
  researchAPI,
  analyticsToolsAPI
} from '../api/marketingAPI';
import {
  Persona,
  Keyword,
  Tag,
  Channel,
  Strategy,
  IntelEntry,
  ResearchInsight,
  AnalyticsTool,
  ApiError
} from '../types';

// ============================================================================
// PERSONAS HOOK
// ============================================================================

export const usePersonas = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loadPersonas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await personasAPI.fetchPersonas();
      setPersonas(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPersona = useCallback(async (persona: Omit<Persona, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newPersona = await personasAPI.createPersona(persona);
      setPersonas(prev => [newPersona, ...prev]);
      return newPersona;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePersona = useCallback(async (id: string, updates: Partial<Persona>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedPersona = await personasAPI.updatePersona(id, updates);
      setPersonas(prev => prev.map(p => p.id === id ? updatedPersona : p));
      return updatedPersona;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePersona = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await personasAPI.deletePersona(id);
      setPersonas(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  return {
    personas,
    loading,
    error,
    loadPersonas,
    createPersona,
    updatePersona,
    deletePersona
  };
};

// ============================================================================
// KEYWORDS HOOK
// ============================================================================

export const useKeywords = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loadKeywords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await keywordsAPI.fetchKeywords();
      setKeywords(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createKeyword = useCallback(async (keyword: Omit<Keyword, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
    try {
      setLoading(true);
      setError(null);
      const newKeyword = await keywordsAPI.createKeyword(keyword);
      setKeywords(prev => [newKeyword, ...prev]);
      return newKeyword;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateKeyword = useCallback(async (id: string, updates: Partial<Keyword>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedKeyword = await keywordsAPI.updateKeyword(id, updates);
      setKeywords(prev => prev.map(k => k.id === id ? updatedKeyword : k));
      return updatedKeyword;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteKeyword = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await keywordsAPI.deleteKeyword(id);
      setKeywords(prev => prev.filter(k => k.id !== id));
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUploadKeywords = useCallback(async (keywordsData: Array<Omit<Keyword, 'id' | 'created_at' | 'updated_at' | 'usage_count'>>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await keywordsAPI.bulkUploadKeywords(keywordsData);
      await loadKeywords(); // Reload all keywords after bulk upload
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadKeywords]);

  useEffect(() => {
    loadKeywords();
  }, [loadKeywords]);

  return {
    keywords,
    loading,
    error,
    loadKeywords,
    createKeyword,
    updateKeyword,
    deleteKeyword,
    bulkUploadKeywords
  };
};

// ============================================================================
// TAGS HOOK
// ============================================================================

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tagsAPI.fetchTags();
      setTags(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(async (tag: Omit<Tag, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
    try {
      setLoading(true);
      setError(null);
      const newTag = await tagsAPI.createTag(tag);
      setTags(prev => [newTag, ...prev]);
      return newTag;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTag = useCallback(async (id: string, updates: Partial<Tag>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTag = await tagsAPI.updateTag(id, updates);
      setTags(prev => prev.map(t => t.id === id ? updatedTag : t));
      return updatedTag;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await tagsAPI.deleteTag(id);
      setTags(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTagsByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await tagsAPI.fetchTagsByCategory(category);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    tags,
    loading,
    error,
    loadTags,
    createTag,
    updateTag,
    deleteTag,
    fetchTagsByCategory
  };
};

// ============================================================================
// CHANNELS HOOK
// ============================================================================

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loadChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await channelsAPI.fetchChannels();
      setChannels(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createChannel = useCallback(async (channel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newChannel = await channelsAPI.createChannel(channel);
      setChannels(prev => [newChannel, ...prev]);
      return newChannel;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateChannel = useCallback(async (id: string, updates: Partial<Channel>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedChannel = await channelsAPI.updateChannel(id, updates);
      setChannels(prev => prev.map(c => c.id === id ? updatedChannel : c));
      return updatedChannel;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteChannel = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await channelsAPI.deleteChannel(id);
      setChannels(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await channelsAPI.fetchActiveChannels();
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  return {
    channels,
    loading,
    error,
    loadChannels,
    createChannel,
    updateChannel,
    deleteChannel,
    fetchActiveChannels
  };
};

// ============================================================================
// STRATEGIES HOOK
// ============================================================================

export const useStrategies = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loadStrategies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await strategiesAPI.fetchStrategies();
      setStrategies(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStrategy = useCallback(async (strategy: Omit<Strategy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newStrategy = await strategiesAPI.createStrategy(strategy);
      setStrategies(prev => [newStrategy, ...prev]);
      return newStrategy;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStrategy = useCallback(async (id: string, updates: Partial<Strategy>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedStrategy = await strategiesAPI.updateStrategy(id, updates);
      setStrategies(prev => prev.map(s => s.id === id ? updatedStrategy : s));
      return updatedStrategy;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStrategy = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await strategiesAPI.deleteStrategy(id);
      setStrategies(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStrategiesByStatus = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await strategiesAPI.fetchStrategiesByStatus(status);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  return {
    strategies,
    loading,
    error,
    loadStrategies,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    fetchStrategiesByStatus
  };
};

// ============================================================================
// INTEL HOOK
// ============================================================================

export const useIntel = () => {
  const [intelEntries, setIntelEntries] = useState<IntelEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState<boolean>(false);

  const loadIntel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await intelAPI.fetchIntel();
      setIntelEntries(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createIntel = useCallback(async (intel: Omit<IntelEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newIntel = await intelAPI.createIntel(intel);
      setIntelEntries(prev => [newIntel, ...prev]);
      return newIntel;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIntel = useCallback(async (id: string, updates: Partial<IntelEntry>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedIntel = await intelAPI.updateIntel(id, updates);
      setIntelEntries(prev => prev.map(i => i.id === id ? updatedIntel : i));
      return updatedIntel;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIntel = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await intelAPI.deleteIntel(id);
      setIntelEntries(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAudioFile = useCallback(async (file: File) => {
    try {
      setUploadingAudio(true);
      setError(null);
      const result = await intelAPI.uploadAudioFile(file);
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setUploadingAudio(false);
    }
  }, []);

  const fetchIntelByPriority = useCallback(async (priorityLevel: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await intelAPI.fetchIntelByPriority(priorityLevel);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntel();
  }, [loadIntel]);

  return {
    intelEntries,
    loading,
    error,
    uploadingAudio,
    loadIntel,
    createIntel,
    updateIntel,
    deleteIntel,
    uploadAudioFile,
    fetchIntelByPriority
  };
};

// ============================================================================
// RESEARCH INSIGHTS HOOK
// ============================================================================

export const useResearchInsights = () => {
  const [researchInsights, setResearchInsights] = useState<ResearchInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loadResearchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await researchAPI.fetchResearchInsights();
      setResearchInsights(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createResearchInsight = useCallback(async (insight: Omit<ResearchInsight, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newInsight = await researchAPI.createResearchInsight(insight);
      setResearchInsights(prev => [newInsight, ...prev]);
      return newInsight;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateResearchInsight = useCallback(async (id: string, updates: Partial<ResearchInsight>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedInsight = await researchAPI.updateResearchInsight(id, updates);
      setResearchInsights(prev => prev.map(i => i.id === id ? updatedInsight : i));
      return updatedInsight;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteResearchInsight = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await researchAPI.deleteResearchInsight(id);
      setResearchInsights(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInsightsByStatus = useCallback(async (reviewStatus: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await researchAPI.fetchInsightsByStatus(reviewStatus);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResearchInsights();
  }, [loadResearchInsights]);

  return {
    researchInsights,
    loading,
    error,
    loadResearchInsights,
    createResearchInsight,
    updateResearchInsight,
    deleteResearchInsight,
    fetchInsightsByStatus
  };
};

// ============================================================================
// ANALYTICS TOOLS HOOK
// ============================================================================

export const useAnalyticsTools = () => {
  const [analyticsTools, setAnalyticsTools] = useState<AnalyticsTool[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loadAnalyticsTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsToolsAPI.fetchAnalyticsTools();
      setAnalyticsTools(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAnalyticsTool = useCallback(async (tool: Omit<AnalyticsTool, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newTool = await analyticsToolsAPI.createAnalyticsTool(tool);
      setAnalyticsTools(prev => [newTool, ...prev]);
      return newTool;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAnalyticsTool = useCallback(async (id: string, updates: Partial<AnalyticsTool>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTool = await analyticsToolsAPI.updateAnalyticsTool(id, updates);
      setAnalyticsTools(prev => prev.map(t => t.id === id ? updatedTool : t));
      return updatedTool;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAnalyticsTool = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await analyticsToolsAPI.deleteAnalyticsTool(id);
      setAnalyticsTools(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsToolsAPI.fetchActiveTools();
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsTools();
  }, [loadAnalyticsTools]);

  return {
    analyticsTools,
    loading,
    error,
    loadAnalyticsTools,
    createAnalyticsTool,
    updateAnalyticsTool,
    deleteAnalyticsTool,
    fetchActiveTools
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  usePersonas,
  useKeywords,
  useTags,
  useChannels,
  useStrategies,
  useIntel,
  useResearchInsights,
  useAnalyticsTools
};
