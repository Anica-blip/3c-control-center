// /src/marketingcomponent/types.ts - TypeScript interfaces for Marketing Intelligence System

// ============================================================================
// DATABASE ENTITIES
// ============================================================================

/**
 * Persona - Character profiles for content targeting
 * Table: personas
 */
export interface Persona {
  id: string;
  name: string;
  audience_segment: 'EM' | 'NM' | 'GP'; // Existing Member, New Member, General Public
  user_role: string;
  description: string;
  key_messages: string;
  last_edited_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Keyword - SEO and content keywords
 * Table: keywords
 */
export interface Keyword {
  id: string;
  keyword: string;
  category?: string;
  date_added: string;
  added_by: string;
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Tag - Content categorization tags
 * Table: tags
 */
export interface Tag {
  id: string;
  tag: string;
  category: 'hashtag' | 'topic' | 'campaign' | 'other';
  date_added: string;
  added_by: string;
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Channel - Platform distribution channels
 * Table: channels
 */
export interface Channel {
  id: string;
  channel_name: string;
  platform_type: string;
  priority_level: 'high' | 'medium' | 'low';
  priority_change_log: string;
  date: string;
  status: 'Active' | 'Inactive' | 'Paused';
  created_at: string;
  updated_at: string;
}

/**
 * Strategy - Content strategy entries
 * Table: content_strategies
 */
export interface Strategy {
  id: string;
  content_title: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  ai_suggestion_rating?: number;
  hashtags: string[];
  tags: string[];
  persona: string;
  audience_segment: 'EM' | 'NM' | 'GP';
  created_at: string;
  updated_at: string;
}

/**
 * IntelEntry - Marketing intelligence and insights
 * Table: marketing_intel
 */
export interface IntelEntry {
  id: string;
  priority_level: 'critical' | 'high' | 'medium' | 'low';
  insight_entry: string;
  audio_file_url?: string;
  audio_filename?: string;
  persona?: string;
  audience_segment?: 'EM' | 'NM' | 'GP';
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * ResearchInsight - Research findings and insights
 * Table: research_insights
 */
export interface ResearchInsight {
  id: string;
  insight: string;
  persona?: string;
  audience_segment?: 'EM' | 'NM' | 'GP';
  review_status: 'new' | 'reviewed' | 'archived';
  upload_date: string;
  created_at: string;
  updated_at: string;
}

/**
 * AnalyticsTool - External analytics and research tools
 * Table: analytics_tools
 */
export interface AnalyticsTool {
  id: string;
  name: string;
  category: 'SEO' | 'Social Media' | 'Audience Research' | 'Video Analytics' | 'Hashtag Analysis' | 'Other';
  status: 'Active' | 'Inactive';
  url: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FORM STATE TYPES
// ============================================================================

export interface PersonaFormState {
  name: string;
  audience_segment: string;
  user_role: string;
  description: string;
  key_messages: string;
  last_edited_by: string;
}

export interface KeywordFormState {
  keyword: string;
  category?: string;
  dateAdded: string;
  addedBy: string;
}

export interface TagFormState {
  tag: string;
  category: 'hashtag' | 'topic' | 'campaign' | 'other';
  dateAdded: string;
  addedBy: string;
}

export interface ChannelFormState {
  channelName: string;
  platformType: string;
  priorityLevel: 'high' | 'medium' | 'low';
  priorityChangeLog: string;
  date: string;
  status: 'Active' | 'Inactive' | 'Paused';
}

export interface StrategyFormState {
  contentTitle: string;
  status: string;
  aiSuggestionRating: string;
  hashtags: string;
  tags: string;
  persona: string;
  audienceSegment: string;
}

export interface IntelFormState {
  priorityLevel: string;
  insightEntry: string;
  audioFile: File | null;
  audioFileUrl: string;
  audioFilename: string;
  persona: string;
  audienceSegment: string;
}

export interface ResearchInsightFormState {
  insight: string;
  persona: string;
  audienceSegment: string;
  reviewStatus: 'new' | 'reviewed' | 'archived';
  uploadDate: string;
}

export interface AnalyticsToolFormState {
  name: string;
  category: string;
  status: 'Active' | 'Inactive';
  url: string;
  notes: string;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export type TabId = 
  | 'personas'
  | 'content-tools'
  | 'strategy'
  | 'channels'
  | 'intel'
  | 'research'
  | 'analytics'
  | 'archives';

export interface TabGroup {
  name: string;
  color: string;
  tabs: Array<{
    id: TabId;
    label: string;
  }>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface BulkUploadResult {
  success: number;
  failed: number;
  errors: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface LoadingStates {
  personas: boolean;
  keywords: boolean;
  tags: boolean;
  intel: boolean;
  channels: boolean;
  strategies: boolean;
  research: boolean;
  analytics: boolean;
}

export interface ThemeConfig {
  background: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  danger: string;
  warning: string;
  inputBg: string;
  inputBorder: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PERSONA_OPTIONS = ['Falcon', 'Panther', 'Wolf', 'Lion'] as const;

export const AUDIENCE_OPTIONS = [
  { value: 'EM', label: 'Existing Member (EM)' },
  { value: 'NM', label: 'New Member (NM)' },
  { value: 'GP', label: 'General Public (GP)' }
] as const;

export const PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

export const CHANNEL_STATUSES = ['Active', 'Inactive', 'Paused'] as const;

export const STRATEGY_STATUSES = ['draft', 'review', 'approved', 'archived'] as const;

export const REVIEW_STATUSES = ['new', 'reviewed', 'archived'] as const;

export const TAG_CATEGORIES = ['hashtag', 'topic', 'campaign', 'other'] as const;

export const ANALYTICS_CATEGORIES = [
  'SEO',
  'Social Media',
  'Audience Research',
  'Video Analytics',
  'Hashtag Analysis',
  'Other'
] as const;
