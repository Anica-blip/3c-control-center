// /src/marketingcomponent/config.ts - Supabase Configuration for Marketing System

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 * 
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 * 
 * Make sure these are set in your .env file:
 * VITE_SUPABASE_URL=https://your-project.supabase.co
 * VITE_SUPABASE_ANON_KEY=your-anon-key
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'Please add it to your .env file.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Please add it to your .env file.'
  );
}

/**
 * Supabase Client Instance
 * 
 * This client is used for all marketing-related database operations:
 * - Personas management
 * - Keywords and tags
 * - Marketing intelligence
 * - Research insights
 * - Analytics tools
 * - Channel management
 * - Content strategies
 * 
 * The client automatically handles:
 * - Authentication
 * - Real-time subscriptions
 * - Storage operations
 * - Row-level security (RLS)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

/**
 * Database Table Names
 * 
 * Centralized table name constants to avoid typos and make refactoring easier.
 * Update these if your Supabase table names differ.
 */
export const TABLES = {
  PERSONAS: 'personas',
  KEYWORDS: 'keywords',
  TAGS: 'tags',
  CHANNELS: 'channels',
  STRATEGIES: 'content_strategies',
  INTEL: 'marketing_intel',
  RESEARCH: 'research_insights',
  ANALYTICS_TOOLS: 'analytics_tools',
  CONTENT_POSTS: 'content_posts',           // Main content creation table
  SCHEDULED_POSTS: 'scheduled_posts',        // Posts ready for cron runners
  DASHBOARD_POSTS: 'dashboard_posts'         // Completed posts for analysis
} as const;

/**
 * Storage Bucket Names
 * 
 * Supabase storage buckets for file uploads.
 */
export const BUCKETS = {
  AUDIO: 'audio-files',           // Marketing intel audio recordings
  MEDIA: 'media-files',           // General media files
  ARCHIVES: 'archive-files'       // Archived content
} as const;

/**
 * Helper function to check Supabase connection
 * 
 * @returns Promise<boolean> - True if connection is successful
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from(TABLES.PERSONAS).select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection test error:', err);
    return false;
  }
};

/**
 * Helper function to get current user
 * 
 * @returns Promise<string | null> - User email or null if not authenticated
 */
export const getCurrentUser = async (): Promise<string | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user.email || null;
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
};


export default supabase;
