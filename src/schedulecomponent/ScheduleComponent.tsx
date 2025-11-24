// /src/schedulecomponent/ScheduleComponent.tsx - PHASE 3: JSON Integration + Calendar & Status Views
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import ScheduleModal from './components/ScheduleModal';
import EditModal from './components/EditModal';
import { getTheme, getContainerStyle, getCSSAnimations } from './utils/styleUtils';
import { Calendar, Clock, Edit3, Trash2, RefreshCw, AlertCircle, CheckCircle, Play, X, ChevronLeft, ChevronRight, Save, XCircle, WifiOff, FileText, ExternalLink, Image, Video, User } from 'lucide-react';
import { ScheduledPost, SavedTemplate, ErrorNotification, ApiError } from './types';
import { supabase } from './config';
import { updatePendingPost } from './api/scheduleAPI';

// Platform badge component
const PlatformBadge: React.FC<{ platform: any }> = ({ platform }) => {
  const getPlatformTypeFromUrl = (url: string): string => {
    if (!url) return '';
    
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram')) return 'telegram';
    if (lowerUrl.includes('instagram.com') || lowerUrl.includes('ig.me')) return 'instagram';
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) return 'facebook';
    if (lowerUrl.includes('linkedin.com')) return 'linkedin';
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
    if (lowerUrl.includes('tiktok.com')) return 'tiktok';
    if (lowerUrl.includes('pinterest.com')) return 'pinterest';
    if (lowerUrl.includes('whatsapp.com') || lowerUrl.includes('wa.me')) return 'whatsapp';
    if (lowerUrl.includes('discord.com') || lowerUrl.includes('discord.gg')) return 'discord';
    
    return '';
  };

  const getPlatformIcon = (platform: any): string => {
    const urlType = getPlatformTypeFromUrl(platform.url || '');
    
    if (urlType === 'telegram') return 'TG';
    if (urlType === 'instagram') return 'IG';
    if (urlType === 'facebook') return 'FB';
    if (urlType === 'linkedin') return 'LI';
    if (urlType === 'twitter') return 'TW';
    if (urlType === 'youtube') return 'YT';
    if (urlType === 'tiktok') return 'TK';
    if (urlType === 'pinterest') return 'PT';
    if (urlType === 'whatsapp') return 'WA';
    if (urlType === 'discord') return 'DS';
    
    if (platform.platform_icon) {
      return platform.platform_icon;
    }
    
    return '??';
  };

  const getPlatformColor = (platform: any): string => {
    if (platform.type === 'telegram_group') {
      return '#f97316';
    }
    if (platform.type === 'telegram_channel') {
      return '#3b82f6';
    }
    
    const urlType = getPlatformTypeFromUrl(platform.url || '');
    
    if (urlType === 'telegram') return '#3b82f6';
    if (urlType === 'instagram') return '#E4405F';
    if (urlType === 'facebook') return '#1877F2';
    if (urlType === 'linkedin') return '#0A66C2';
    if (urlType === 'twitter') return '#000000';
    if (urlType === 'youtube') return '#FF0000';
    if (urlType === 'tiktok') return '#000000';
    if (urlType === 'pinterest') return '#BD081C';
    if (urlType === 'whatsapp') return '#25D366';
    if (urlType === 'discord') return '#5865F2';
    
    const icon = platform.platform_icon;
    if (icon === 'TG') return '#3b82f6';
    if (icon === 'IG') return '#E4405F';
    if (icon === 'FB') return '#1877F2';
    if (icon === 'LI') return '#0A66C2';
    if (icon === 'TW') return '#000000';
    if (icon === 'YT') return '#FF0000';
    if (icon === 'TK') return '#000000';
    if (icon === 'PT') return '#BD081C';
    if (icon === 'WA') return '#25D366';
    if (icon === 'FR') return '#4b5563';
    if (icon === 'DS') return '#5865F2';
    
    return '#6b7280';
  };

  return (
    <span
      style={{
        padding: '4px 6px',
        borderRadius: '4px',
        color: 'white',
        fontSize: '10px',
        fontWeight: 'bold',
        backgroundColor: getPlatformColor(platform),
        display: 'inline-block'
      }}
      title={platform.name || platform.display_name || platform.url}
    >
      {getPlatformIcon(platform)}
    </span>
  );
};

const SuccessNotification: React.FC<{
  message: string;
  onDismiss: () => void;
}> = ({ message, onDismiss }) => {
  const { theme } = getTheme();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: theme.successBg,
      border: `1px solid ${theme.success}`,
      borderRadius: '8px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CheckCircle style={{ 
          height: '16px', 
          width: '16px', 
          color: theme.success
        }} />
        <span style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: theme.success
        }}>
          {message}
        </span>
      </div>
      <button
        onClick={onDismiss}
        style={{
          padding: '4px',
          backgroundColor: 'transparent',
          border: 'none',
          color: theme.success,
          cursor: 'pointer',
          opacity: 0.7
        }}
      >
        <X style={{ height: '14px', width: '14px' }} />
      </button>
    </div>
  );
};

const ErrorNotificationBanner: React.FC<{
  error: ApiError;
  onDismiss: () => void;
  onRetry?: () => void;
}> = ({ error, onDismiss, onRetry }) => {
  const { theme } = getTheme();

  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: theme.dangerBg,
      border: `1px solid ${theme.danger}`,
      borderRadius: '8px',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <AlertCircle style={{ 
          height: '16px', 
          width: '16px', 
          color: theme.danger,
          flexShrink: 0,
          marginTop: '2px'
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: theme.danger,
            marginBottom: '4px'
          }}>
            {error.message}
          </div>
          {error.code && (
            <div style={{
              fontSize: '12px',
              color: theme.danger,
              opacity: 0.8
            }}>
              Error Code: {error.code}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onRetry && error.retryable && (
            <button
              onClick={onRetry}
              style={{
                padding: '4px 8px',
                backgroundColor: theme.danger,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Retry
            </button>
          )}
          <button
            onClick={onDismiss}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: theme.danger,
              cursor: 'pointer',
              opacity: 0.7
            }}
          >
            <X style={{ height: '14px', width: '14px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ScheduleComponent() {
  const {
    posts: scheduledPosts,
    loading: postsLoading,
    error: postsError,
    createPost,
    deletePost,
    refreshPosts
  } = useScheduledPosts();

  // ⭐ FIX #22: Fetch templates directly from dashboard_templates table
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<ApiError | null>(null);

  // Fetch templates from dashboard_templates table
  const fetchTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    setTemplatesError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // ✅ FIX: Use system UUID fallback instead of empty string
      const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
      const userId = user?.id || SYSTEM_USER_ID;
      
      console.log('🔍 Fetching templates for user:', userId);

      const { data, error } = await supabase
        .from('dashboard_templates')
        .select('*')
        .eq('user_id', userId)  // ✅ Now always a valid UUID
        .eq('is_deleted', false)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching templates:', error);
        setTemplatesError({
          message: 'Failed to load templates',
          code: 'FETCH_TEMPLATES_ERROR',
          type: 'database',
          timestamp: new Date(),
          retryable: true
        });
        setSavedTemplates([]);
      } else {
        console.log('✅ Fetched templates from dashboard_templates:', data?.length || 0, 'templates');
        if (data && data.length > 0) {
          console.log('📋 Template IDs:', data.map(t => ({id: t.id, name: t.template_name})));
        }
        setSavedTemplates(data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      setTemplatesError({
        message: 'Failed to load templates',
        code: 'FETCH_TEMPLATES_ERROR',
        type: 'unknown',
        timestamp: new Date(),
        retryable: true
      });
      setSavedTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  // Fetch templates on mount and when switching to templates tab
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Create template in dashboard_templates
  const createTemplate = useCallback(async (templateData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // ✅ FIX: Use system UUID fallback instead of empty string
      const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
      const userId = user?.id || SYSTEM_USER_ID;
      
      const { data, error } = await supabase
        .from('dashboard_templates')
        .insert([{
          ...templateData,
          user_id: userId,  // ✅ Never NULL or empty string
          created_by: userId,  // ✅ Never NULL or empty string
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating template:', error);
        return { 
          success: false, 
          error: {
            message: 'Failed to save template',
            code: 'CREATE_TEMPLATE_ERROR',
            type: 'database',
            timestamp: new Date(),
            retryable: true
          }
        };
      }
      
      console.log('✅ Template created in dashboard_templates:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error creating template:', error);
      return { 
        success: false, 
        error: {
          message: 'Failed to save template',
          code: 'CREATE_TEMPLATE_ERROR',
          type: 'unknown',
          timestamp: new Date(),
          retryable: true
        }
      };
    }
  }, []);

  // Update template
  const updateTemplate = useCallback(async (templateId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('dashboard_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error updating template:', error);
        return { success: false, error };
      }
      
      console.log('✅ Template updated:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error updating template:', error);
      return { success: false, error };
    }
  }, []);

  // Delete template
  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_templates')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', templateId);
      
      if (error) {
        console.error('❌ Error deleting template:', error);
        showError({
          message: 'Failed to delete template',
          code: 'DELETE_TEMPLATE_ERROR',
          type: 'database',
          timestamp: new Date(),
          retryable: true
        });
      } else {
        console.log('✅ Template marked as deleted');
        await fetchTemplates(); // Refresh list
        showSuccess('Template deleted successfully!');
      }
    } catch (error) {
      console.error('❌ Error deleting template:', error);
      showError({
        message: 'Failed to delete template',
        code: 'DELETE_TEMPLATE_ERROR',
        type: 'unknown',
        timestamp: new Date(),
        retryable: true
      });
    }
  }, [fetchTemplates]);

  // Increment usage count
  const incrementUsage = useCallback(async (templateId: string) => {
    try {
      const { error } = await supabase
        .rpc('increment_template_usage', { template_id: templateId });
      
      if (error) {
        console.error('❌ Error incrementing usage:', error);
        // Non-critical, just log
      } else {
        console.log('✅ Template usage incremented');
      }
    } catch (error) {
      console.error('❌ Error incrementing usage:', error);
    }
  }, []);

  const refreshTemplates = fetchTemplates;

  const [activeTab, setActiveTab] = useState('pending');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const [operationStates, setOperationStates] = useState<Record<string, boolean>>({});

  const [characterProfiles, setCharacterProfiles] = useState<Record<string, any>>({});
  const [profilesLoading, setProfilesLoading] = useState<Record<string, boolean>>({});
  
  // Fetch posts from content_posts (for pending tab) and scheduled_posts (for status/calendar)
  const [contentPosts, setContentPosts] = useState<ScheduledPost[]>([]);
  const [scheduledPostsFromDB, setScheduledPostsFromDB] = useState<ScheduledPost[]>([]);
  const [loadingScheduledPosts, setLoadingScheduledPosts] = useState(false);

  const fetchScheduledPostsFromDB = useCallback(async () => {
    setLoadingScheduledPosts(true);
    try {
      console.log('🔍 Fetching posts from database...');
      
      // Fetch from content_posts table (for pending tab - posts being edited)
      const { data: contentData, error: contentError } = await supabase
        .from('content_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (contentError) {
        console.error('❌ Error fetching content posts:', contentError);
      } else {
        console.log('✅ Fetched content_posts:', contentData?.length || 0, 'posts');
        
        // Fetch platform details for content posts
        const contentWithPlatforms = await Promise.all((contentData || []).map(async (post) => {
          if (post.selected_platforms && Array.isArray(post.selected_platforms)) {
            const platformIds = post.selected_platforms;
            // Try social_platforms first, then telegram_channels
            const { data: platformsData, error: platformsError } = await supabase
              .from('social_platforms')
              .select('*')
              .in('id', platformIds);
            
            const { data: telegramData, error: telegramError } = await supabase
              .from('telegram_channels')
              .select('*')
              .in('id', platformIds);
            
            // Add platform_icon to telegram channels if missing
            const telegramWithIcons = (telegramData || []).map(tg => ({
              ...tg,
              platform_icon: tg.platform_icon || 'TG',
              type: tg.type || (tg.thread_id ? 'telegram_group' : 'telegram_channel')
            }));
            
            const allPlatforms = [...(platformsData || []), ...telegramWithIcons];
            
            if (allPlatforms.length > 0) {
              return { ...post, platformDetails: allPlatforms };
            }
          }
          return { ...post, platformDetails: [] };
        }));
        
        setContentPosts(contentWithPlatforms);
      }
      
      // Fetch from scheduled_posts table (for status manager & calendar)
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('is_hidden', false)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (scheduledError) {
        console.error('❌ Error fetching scheduled posts:', scheduledError);
      } else {
        console.log('✅ Fetched scheduled_posts:', scheduledData?.length || 0, 'posts');
        
        // Fetch platform details for scheduled posts
        const scheduledWithPlatforms = await Promise.all((scheduledData || []).map(async (post) => {
          if (post.selected_platforms && Array.isArray(post.selected_platforms)) {
            const platformIds = post.selected_platforms;
            // Try social_platforms first, then telegram_channels
            const { data: platformsData, error: platformsError } = await supabase
              .from('social_platforms')
              .select('*')
              .in('id', platformIds);
            
            const { data: telegramData, error: telegramError } = await supabase
              .from('telegram_channels')
              .select('*')
              .in('id', platformIds);
            
            // Add platform_icon to telegram channels if missing
            const telegramWithIcons = (telegramData || []).map(tg => ({
              ...tg,
              platform_icon: tg.platform_icon || 'TG',
              type: tg.type || (tg.thread_id ? 'telegram_group' : 'telegram_channel')
            }));
            
            const allPlatforms = [...(platformsData || []), ...telegramWithIcons];
            
            if (allPlatforms.length > 0) {
              return { ...post, platformDetails: allPlatforms };
            }
          }
          return { ...post, platformDetails: [] };
        }));
        
        setScheduledPostsFromDB(scheduledWithPlatforms);
      }
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
    } finally {
      setLoadingScheduledPosts(false);
    }
  }, []);

  // Fetch scheduled posts on mount
  useEffect(() => {
    fetchScheduledPostsFromDB();
  }, [fetchScheduledPostsFromDB]);

  // Combined refresh function
  const refreshAllPosts = useCallback(async () => {
    await refreshPosts();
    await fetchScheduledPostsFromDB();
  }, [refreshPosts, fetchScheduledPostsFromDB]);

  // Combine posts from all sources
  const allPosts = useMemo(() => {
    const combined = [...(scheduledPosts || []), ...contentPosts, ...scheduledPostsFromDB];
    console.log('📊 Combined posts:', {
      fromHook: scheduledPosts?.length || 0,
      fromContentPosts: contentPosts.length,
      fromScheduledPosts: scheduledPostsFromDB.length,
      total: combined.length
    });
    return combined;
  }, [scheduledPosts, contentPosts, scheduledPostsFromDB]);

  const { isDarkMode, theme } = getTheme();

  const isUUID = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const fetchCharacterProfile = useCallback(async (profileId: string) => {
    if (!profileId || !isUUID(profileId) || characterProfiles[profileId] !== undefined) return;
    
    try {
      setProfilesLoading(prev => ({ ...prev, [profileId]: true }));
      
      const { data, error } = await supabase
        .from('character_profiles')
        .select('avatar_id, name, username, role')
        .eq('id', profileId)
        .single();
      
      if (error) {
        console.error('Error fetching character profile:', error);
        setCharacterProfiles(prev => ({ ...prev, [profileId]: null }));
      } else {
        setCharacterProfiles(prev => ({ ...prev, [profileId]: data }));
      }
    } catch (error) {
      console.error('Error fetching character profile:', error);
      setCharacterProfiles(prev => ({ ...prev, [profileId]: null }));
    } finally {
      setProfilesLoading(prev => ({ ...prev, [profileId]: false }));
    }
  }, [characterProfiles]);

  const addNotification = useCallback((notification: Omit<ErrorNotification, 'id' | 'timestamp'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: ErrorNotification = {
      ...notification,
      id,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 5));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => {
    addNotification({
      type: 'success',
      title: 'Success',
      message,
      dismissible: true
    });
  }, [addNotification]);

  const showError = useCallback((error: ApiError, retryAction?: () => void) => {
    addNotification({
      type: 'error',
      title: 'Operation Failed',
      message: error.message,
      dismissible: true,
      action: error.retryable && retryAction ? {
        label: 'Retry',
        handler: retryAction
      } : undefined
    });
  }, [addNotification]);

  const setOperationLoading = useCallback((operation: string, loading: boolean) => {
    setOperationStates(prev => ({ ...prev, [operation]: loading }));
  }, []);

  const isOperationLoading = useCallback((operation: string) => {
    return operationStates[operation] || false;
  }, [operationStates]);

  // Pending tab: Shows posts from content_posts table + scheduled_posts with posting_status='scheduled'
  const pendingPosts = useMemo(() => {
    // Posts from content_posts (being edited before scheduling)
    const fromContentPosts = contentPosts;
    
    // Posts from scheduled_posts with posting_status='scheduled' (ready for time/date/service)
    const fromScheduledPosts = scheduledPostsFromDB.filter(p => p.posting_status === 'scheduled');
    
    const pending = [...fromContentPosts, ...fromScheduledPosts];
    
    console.log('📋 Pending posts:', pending.length, 'posts');
    console.log('  - From content_posts:', fromContentPosts.length);
    console.log('  - From scheduled_posts (status=scheduled):', fromScheduledPosts.length);
    
    return pending;
  }, [contentPosts, scheduledPostsFromDB]);

  // Status Manager & Calendar: Shows posts from scheduled_posts with posting_status='pending' or 'sent' or 'failed'
  const scheduledPostsFiltered = useMemo(() => {
    const scheduled = scheduledPostsFromDB.filter(p => 
      p.posting_status === 'pending' || p.posting_status === 'sent' || p.posting_status === 'failed'
    );
    console.log('📅 Scheduled posts (Status Manager/Calendar):', scheduled.length, 'posts');
    console.log('  - posting_status=pending:', scheduledPostsFromDB.filter(p => p.posting_status === 'pending').length);
    console.log('  - posting_status=sent:', scheduledPostsFromDB.filter(p => p.posting_status === 'sent').length);
    console.log('  - posting_status=failed:', scheduledPostsFromDB.filter(p => p.posting_status === 'failed').length);
    return scheduled;
  }, [scheduledPostsFromDB]);

  const publishedPosts = useMemo(() => 
    allPosts.filter(p => p?.status === 'published'),
    [allPosts]
  );

  const failedPosts = useMemo(() => 
    allPosts.filter(p => p?.status === 'failed'),
    [allPosts]
  );

  // CALENDAR UTILITY FUNCTIONS
  const getMonthDates = useCallback((date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    startDate.setDate(firstDay.getDate() - dayOfWeek);
    
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }, []);

  const getWeekDates = useCallback((date: Date): Date[] => {
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      dates.push(current);
    }
    
    return dates;
  }, []);

  const getPostsForDate = useCallback((date: Date): ScheduledPost[] => {
    if (!scheduledPostsFiltered) return [];
    
    return scheduledPostsFiltered.filter(post => {
      if (!post.scheduled_date) return false;
      
      const postDate = new Date(post.scheduled_date);
      return (
        postDate.getFullYear() === date.getFullYear() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getDate() === date.getDate()
      );
    }).sort((a, b) => {
      const dateA = new Date(a.scheduled_date);
      const dateB = new Date(b.scheduled_date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [scheduledPostsFiltered]);

  const getHourlyPostsForDay = useCallback((date: Date): Record<number, ScheduledPost[]> => {
    const postsForDay = getPostsForDate(date);
    const hourlyPosts: Record<number, ScheduledPost[]> = {};
    
    for (let hour = 0; hour < 24; hour++) {
      hourlyPosts[hour] = postsForDay.filter(post => {
        const postDate = new Date(post.scheduled_date);
        return postDate.getHours() === hour;
      });
    }
    
    return hourlyPosts;
  }, [getPostsForDate]);

  const navigateCalendar = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      
      if (calendarView === 'month') {
        newDate.setMonth(prevDate.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (calendarView === 'week') {
        newDate.setDate(prevDate.getDate() + (direction === 'next' ? 7 : -7));
      } else if (calendarView === 'day') {
        newDate.setDate(prevDate.getDate() + (direction === 'next' ? 1 : -1));
      }
      
      return newDate;
    });
  }, [calendarView]);

  const formatCalendarTitle = useCallback((): string => {
    if (calendarView === 'month') {
      return currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    } else if (calendarView === 'week') {
      const weekStart = getWeekDates(currentDate)[0];
      const weekEnd = getWeekDates(currentDate)[6];
      return `${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
  }, [calendarView, currentDate, getWeekDates]);

  useEffect(() => {
    if (!pendingPosts?.length) return;
    
    pendingPosts.forEach(post => {
      if (post?.character_profile && typeof post.character_profile === 'string' && isUUID(post.character_profile)) {
        fetchCharacterProfile(post.character_profile);
      }
    });
  }, [pendingPosts.length, fetchCharacterProfile]);

  useEffect(() => {
    if (!scheduledPostsFiltered?.length) return;
    
    scheduledPostsFiltered.forEach(post => {
      if (post?.character_profile && typeof post.character_profile === 'string' && isUUID(post.character_profile)) {
        fetchCharacterProfile(post.character_profile);
      }
    });
  }, [scheduledPostsFiltered.length, fetchCharacterProfile]);

  // ⭐ Load character profiles for saved templates
  useEffect(() => {
    if (!savedTemplates?.length) return;
    
    savedTemplates.forEach(template => {
      if (template?.character_profile && typeof template.character_profile === 'string' && isUUID(template.character_profile)) {
        fetchCharacterProfile(template.character_profile);
      }
    });
  }, [savedTemplates.length, fetchCharacterProfile]);

  const platforms = [
    { id: '1', name: 'Telegram', icon: 'TG', color: '#3b82f6' },
    { id: '2', name: 'YouTube', icon: 'YT', color: '#ef4444' },
    { id: '3', name: 'Facebook', icon: 'FB', color: '#2563eb' },
    { id: '4', name: 'Twitter', icon: 'TW', color: '#0ea5e9' },
    { id: '5', name: 'Forum', icon: 'FR', color: '#4b5563' },
  ];

  const truncateDescription = (description: string = '', maxLength: number = 120) => {
    if (!description || description.length <= maxLength) return description;
    
    const truncated = description.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  };

  const getPlatformIcon = (platformId: string | undefined) => {
    if (!platformId) {
      return { id: '', name: 'Unknown', icon: '??', color: theme.textSecondary };
    }

    const normalizedId = platformId.toString().toLowerCase();
    
    let platform = platforms.find(p => p.id === platformId);
    
    if (!platform) {
      platform = platforms.find(p => 
        p.name.toLowerCase() === normalizedId ||
        p.icon.toLowerCase() === normalizedId ||
        normalizedId.includes(p.name.toLowerCase()) ||
        normalizedId.includes(p.icon.toLowerCase())
      );
    }
    
    if (!platform) {
      switch (normalizedId) {
        case 'telegram':
        case 'tg':
          platform = { id: '1', name: 'Telegram', icon: 'TG', color: '#3b82f6' };
          break;
        case 'youtube':
        case 'yt':
          platform = { id: '2', name: 'YouTube', icon: 'YT', color: '#ef4444' };
          break;
        case 'facebook':
        case 'fb':
          platform = { id: '3', name: 'Facebook', icon: 'FB', color: '#2563eb' };
          break;
        case 'twitter':
        case 'tw':
        case 'x':
          platform = { id: '4', name: 'Twitter', icon: 'TW', color: '#0ea5e9' };
          break;
        case 'forum':
        case 'fr':
          platform = { id: '5', name: 'Forum', icon: 'FR', color: '#4b5563' };
          break;
        default:
          platform = { 
            id: platformId, 
            name: platformId, 
            icon: platformId.substring(0, 2).toUpperCase(), 
            color: theme.textSecondary 
          };
      }
    }
    
    return platform;
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'pending': 
      case 'pending_schedule':
      case 'scheduled': 
        return { borderLeft: `4px solid ${theme.warning}`, backgroundColor: theme.warningBg };
      case 'processing': 
        return { borderLeft: `4px solid ${theme.primary}`, backgroundColor: theme.primaryBg };
      case 'complete': 
      case 'published':
        return { borderLeft: `4px solid ${theme.success}`, backgroundColor: theme.successBg };
      case 'failed': 
        return { borderLeft: `4px solid ${theme.danger}`, backgroundColor: theme.dangerBg };
      case 'resending': 
        return { borderLeft: `4px solid ${theme.warning}`, backgroundColor: theme.warningBg };
      default: 
        return { borderLeft: `4px solid ${theme.textSecondary}`, backgroundColor: theme.cardBg };
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    const iconStyle = { height: '12px', width: '12px' };
    switch (status) {
      case 'pending':
      case 'pending_schedule':
      case 'scheduled': 
        return <Clock style={{...iconStyle, color: theme.warning}} />;
      case 'processing': 
        return <Play style={{...iconStyle, color: theme.primary}} />;
      case 'complete': 
      case 'published':
        return <CheckCircle style={{...iconStyle, color: theme.success}} />;
      case 'failed': 
        return <AlertCircle style={{...iconStyle, color: theme.danger}} />;
      case 'resending': 
        return <RefreshCw style={{...iconStyle, color: theme.warning}} />;
      default: 
        return null;
    }
  };

  const getPlatformBadgeColor = (icon: string | undefined) => {
    if (!icon) return 'rgba(0,0,0,0.3)';
    const upper = icon.toUpperCase();
    if (upper === 'TG') return '#3b82f6';
    if (upper === 'IG') return '#E4405F';
    if (upper === 'FB') return '#1877F2';
    if (upper === 'LI') return '#0A66C2';
    if (upper === 'TW') return '#0ea5e9';
    if (upper === 'YT') return '#ef4444';
    if (upper === 'TK') return '#000000';
    if (upper === 'PT') return '#BD081C';
    if (upper === 'WA') return '#25D366';
    if (upper === 'FR') return '#4b5563';
    if (upper === 'DS') return '#5865F2';
    return 'rgba(0,0,0,0.3)';
  };

  const handleSchedulePost = (post: ScheduledPost) => {
    setSelectedPost(post);
    setIsScheduleModalOpen(true);
  };

  // PHASE 3: JSON Structure + Timezone Integration
  const handleConfirmSchedule = async (scheduleData: {
    scheduledDate: string;
    timezone: string;
    repeatOption?: string;
    serviceType: string;
  }) => {
    if (!selectedPost) return;
    
    const operationKey = `schedule-${selectedPost.id}`;
    setOperationLoading(operationKey, true);
    
    try {
      // Fetch full character profile data for sender
      let senderProfile = null;
      if (selectedPost.character_profile && typeof selectedPost.character_profile === 'string') {
        const { data: profileData, error: profileError } = await supabase
          .from('character_profiles')
          .select('id, avatar_id, name, username, role')
          .eq('id', selectedPost.character_profile)
          .single();
        
        if (!profileError && profileData) {
          senderProfile = {
            profile_id: profileData.id,
            avatar: profileData.avatar_id,
            name: profileData.name,
            username: profileData.username,
            role: profileData.role
          };
        }
      }

      // Build JSON post_content structure
      const postContent = {
        media_files: selectedPost.media_files || [],
        text_post: {
          sender_profile: senderProfile,
          title: selectedPost.title || '',
          description: selectedPost.description || '',
          hashtags: selectedPost.hashtags || [],
          seo_keywords: selectedPost.keywords || '',
          cta: selectedPost.cta || ''
        }
      };

      // Create scheduled post with JSON structure
      const scheduledPostData = {
        content_id: selectedPost.content_id,
        original_post_id: selectedPost.id,
        scheduled_date: new Date(scheduleData.scheduledDate),
        timezone: scheduleData.timezone,
        service_type: scheduleData.serviceType,
        post_content: postContent,
        selected_platforms: selectedPost.selected_platforms,
        status: 'scheduled' as const,
        user_id: selectedPost.user_id,
        created_by: selectedPost.created_by,
        description: selectedPost.description || '',
        character_profile: selectedPost.character_profile || '',
        character_avatar: selectedPost.character_avatar || '',
        // ⭐ Add character details as direct columns for scheduled_posts table
        name: senderProfile?.name || '',
        username: senderProfile?.username || '',
        role: senderProfile?.role || ''
      };

      const result = await createPost(scheduledPostData);
      
      if (result.success) {
        setIsScheduleModalOpen(false);
        setSelectedPost(null);
        showSuccess(`Post scheduled successfully via ${scheduleData.serviceType} for ${scheduleData.timezone}!`);
        await refreshAllPosts();
      } else {
        if (result.validationErrors?.length) {
          const errorMsg = result.validationErrors.map(e => e.message).join(', ');
          showError({ 
            ...result.error!, 
            message: `Validation failed: ${errorMsg}` 
          });
        } else {
          showError(result.error!, () => handleConfirmSchedule(scheduleData));
        }
      }
    } catch (error) {
      showError({
        message: 'Failed to schedule post. Please try again.',
        code: 'SCHEDULE_ERROR',
        type: 'unknown',
        timestamp: new Date(),
        retryable: true
      }, () => handleConfirmSchedule(scheduleData));
    } finally {
      setOperationLoading(operationKey, false);
    }
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (postId: string, updates: Partial<ScheduledPost>) => {
    const operationKey = `edit-${postId}`;
    setOperationLoading(operationKey, true);
    
    try {
      const safeUpdates = {
        ...updates,
        status: updates.status || 'scheduled' as const
      };
      
      const result = await updatePendingPost(postId, safeUpdates);
      
      setIsEditModalOpen(false);
      setEditingPost(null);
      showSuccess('Post updated successfully!');
      await refreshAllPosts();
    } catch (error) {
      showError({
        message: 'Failed to update post. Please try again.',
        code: 'UPDATE_ERROR',
        type: 'unknown',
        timestamp: new Date(),
        retryable: true
      }, () => handleSaveEdit(postId, updates));
    } finally {
      setOperationLoading(operationKey, false);
    }
  };

// ⭐ DATABASE-DRIVEN DELETE: Hide post using Supabase columns (no localStorage!)
const handleDeletePost = async (postId: string) => {
  if (!confirm('Hide this post from your dashboard? (Can be restored later)')) return;
  
  const operationKey = `delete-${postId}`;
  setOperationLoading(operationKey, true);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // ⭐ Update database columns instead of localStorage
    const { error } = await supabase
      .from('scheduled_posts')
      .update({
        is_hidden: true,
        deleted_at: new Date().toISOString()
        // ⭐ Note: deleted_by column removed - add to schema if audit trail needed
      })
      .eq('id', postId);
    
    if (error) throw error;
    
    console.log('✅ Post hidden in database (scheduled_posts):', postId);
    
    // Remove from local state immediately
    setScheduledPostsFromDB(prev => prev.filter(p => p.id !== postId));
    showSuccess('Post hidden from dashboard! (Stored in database)');
  } catch (error) {
    console.error('❌ Error hiding post:', error);
    showError({
      message: 'Failed to hide post. Please try again.',
      code: 'DELETE_ERROR',
      type: 'unknown',
      timestamp: new Date(),
      retryable: true
    }, () => handleDeletePost(postId));
  } finally {
    setOperationLoading(operationKey, false);
  }
};

// ⭐ DELETE PENDING POST: Soft delete from content_posts (hide from dashboard, don't delete from Supabase)
const handleDeletePendingPost = async (postId: string) => {
  if (!confirm('Hide this post from your dashboard? (Can be restored later)')) return;
  
  const operationKey = `delete-${postId}`;
  setOperationLoading(operationKey, true);
  
  try {
    // ⭐ Soft delete: Update is_hidden flag, DON'T delete from Supabase
    const { error } = await supabase
      .from('content_posts')
      .update({
        is_hidden: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', postId);
    
    if (error) throw error;
    
    console.log('✅ Post hidden from dashboard (content_posts):', postId);
    
    // Refresh pending posts to remove hidden post from view
    await refreshAllPosts();
    showSuccess('Post hidden from dashboard!');
  } catch (error) {
    console.error('❌ Error hiding pending post:', error);
    showError({
      message: 'Failed to hide post. Please try again.',
      code: 'DELETE_PENDING_ERROR',
      type: 'unknown',
      timestamp: new Date(),
      retryable: true
    }, () => handleDeletePendingPost(postId));
  } finally {
    setOperationLoading(operationKey, false);
  }
};

  const handleSaveAsTemplate = async (post: ScheduledPost) => {
    const operationKey = `save-template-${post.id}`;
    setOperationLoading(operationKey, true);
    
    try {
      // ⭐ FETCH character profile data BEFORE saving template
      let characterData = { name: '', username: '', role: '' };
      
      if (post.character_profile && isUUID(post.character_profile)) {
        try {
          const { data: profileData, error } = await supabase
            .from('character_profiles')
            .select('name, username, role')
            .eq('id', post.character_profile)
            .single();
          
          if (!error && profileData) {
            characterData = {
              name: profileData.name || '',
              username: profileData.username || '',
              role: profileData.role || ''
            };
            console.log('✅ Fetched character profile for template:', characterData);
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch character profile:', error);
        }
      }
      
      // ✅ ENHANCED: Capture ALL fields including new ones requested
      const templateData = {
        content_id: post.content_id,  // ⭐ Store original content_id for pattern preservation
        template_name: post.title || 'Saved Template',
        character_profile: post.character_profile,
        character_avatar: post.character_avatar || '',
        theme: post.theme || '',
        audience: post.audience || '',
        media_type: post.media_type || '',
        template_type: post.template_type || '',
        platform: post.platform || '',
        voice_style: (post as any).voice_style || '',
        title: post.title || '',
        description: post.description,
        hashtags: post.hashtags || [],
        keywords: post.keywords || '',
        cta: post.cta || '',
        media_files: post.media_files || [],
        selected_platforms: post.selected_platforms,
        usage_count: 0,
        is_active: true,
        is_deleted: false,
        template_version: 1,
        source_template_id: post.source_template_id || null,
        // ⭐ Character profile details from DATABASE (not post_content)
        name: characterData.name,
        username: characterData.username,
        role: characterData.role,
        // Platform details
        social_platform: (post as any).social_platform || null,
        channel_group_id: (post as any).channel_group_id || null,
        thread_id: (post as any).thread_id || null,
        url: (post as any).url || null,
        platform_id: (post as any).platform_id || null,
        platform_icon: (post as any).platform_icon || null,
        type: (post as any).type || null,
        user_id: post.user_id || '',
        created_by: post.created_by || ''
      };

      console.log('📝 Saving template with ENHANCED data (character from DB):', templateData);
      const result = await createTemplate(templateData);
      console.log('📝 Template save result:', result);
      
      if (result.success) {
        console.log('✅ Template saved successfully, refreshing templates...');
        
        // ⭐ Wait for templates to refresh BEFORE switching tabs
        await fetchTemplates();
        
        console.log('✅ Templates refreshed, switching to Saved Templates tab');
        setActiveTab('saved');  // ⭐ FIX: Use 'saved' not 'templates'
        
        showSuccess('✅ Template saved with all details!');
      } else {
        if (result.validationErrors?.length) {
          const errorMsg = result.validationErrors.map(e => e.message).join(', ');
          showError({ 
            ...result.error!, 
            message: `Validation failed: ${errorMsg}` 
          });
        } else {
          showError(result.error!, () => handleSaveAsTemplate(post));
        }
      }
    } catch (error) {
      showError({
        message: 'Failed to save template. Please try again.',
        code: 'SAVE_TEMPLATE_ERROR',
        type: 'unknown',
        timestamp: new Date(),
        retryable: true
      }, () => handleSaveAsTemplate(post));
    } finally {
      setOperationLoading(operationKey, false);
    }
  };

  const handleUseTemplate = async (template: SavedTemplate) => {
    const operationKey = `use-template-${template.id}`;
    setOperationLoading(operationKey, true);
    
    try {
      const pendingPostData = {
        content_id: `template-${template.id}-${Date.now()}`,
        character_profile: template.character_profile,
        character_avatar: template.character_avatar || '',
        theme: template.theme,
        audience: template.audience,
        media_type: template.media_type,
        template_type: template.template_type,
        platform: template.platform,
        title: template.title,
        description: template.description,
        hashtags: template.hashtags,
        keywords: template.keywords,
        cta: template.cta,
        media_files: [],
        selected_platforms: template.selected_platforms,
        status: 'pending' as const,
        user_id: template.user_id,
        created_by: template.created_by,
        is_from_template: true,
        source_template_id: template.id
      };

      const result = await createPost(pendingPostData);
      
      if (result.success) {
        await incrementUsage(template.id);
        setActiveTab('pending');
        await refreshAllPosts();
        showSuccess('Template added to Pending Schedules!');
      } else {
        if (result.validationErrors?.length) {
          const errorMsg = result.validationErrors.map(e => e.message).join(', ');
          showError({ 
            ...result.error!, 
            message: `Validation failed: ${errorMsg}` 
          });
        } else {
          showError(result.error!, () => handleUseTemplate(template));
        }
      }
    } catch (error) {
      showError({
        message: 'Failed to use template. Please try again.',
        code: 'USE_TEMPLATE_ERROR',
        type: 'unknown',
        timestamp: new Date(),
        retryable: true
      }, () => handleUseTemplate(template));
    } finally {
      setOperationLoading(operationKey, false);
    }
  };

  // ⭐ NEW: Move template to content_posts table
  const handleMoveTemplateToContent = async (template: SavedTemplate) => {
    if (!confirm('Move this template to Content Posts? This will create a new post in the Pending tab.')) return;
    
    const operationKey = `move-template-${template.id}`;
    setOperationLoading(operationKey, true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
      const userId = user?.id || SYSTEM_USER_ID;

      // ⭐ Generate new content_id preserving original pattern
      let newContentId: string;
      if (template.content_id) {
        // Extract pattern (everything before last hyphen)
        const parts = template.content_id.split('-');
        if (parts.length > 1) {
          // Remove last part (old number)
          const pattern = parts.slice(0, -1).join('-');
          // Generate new 6-digit number from timestamp
          const timestamp = Date.now().toString().slice(-6);
          newContentId = `${pattern}-${timestamp}`;
          console.log(`🔢 Generated content_id: ${template.content_id} → ${newContentId}`);
        } else {
          // Fallback if no hyphens found
          const timestamp = Date.now().toString().slice(-6);
          newContentId = `${template.content_id}-${timestamp}`;
        }
      } else {
        // Fallback if no content_id stored
        newContentId = `template-move-${Date.now()}`;
        console.log('⚠️ No content_id pattern found, using fallback:', newContentId);
      }

      // Create new post in content_posts with ALL template fields
      const contentPostData = {
        content_id: newContentId,  // ⭐ Preserves pattern, new timestamp
        character_profile: template.character_profile,
        character_avatar: template.character_avatar || '',
        theme: template.theme,
        audience: template.audience,
        media_type: template.media_type,
        template_type: template.template_type,
        platform: template.platform,
        voice_style: template.voice_style || '',
        title: template.title,
        description: template.description,
        hashtags: template.hashtags || [],
        keywords: template.keywords,
        cta: template.cta,
        media_files: template.media_files || [],
        selected_platforms: template.selected_platforms,
        status: 'pending',
        is_from_template: true,
        source_template_id: template.id,
        user_id: userId,
        created_by: userId,
        // Platform details
        social_platform: template.social_platform || null,
        channel_group_id: template.channel_group_id || null,
        thread_id: template.thread_id || null,
        url: template.url || null,
        platform_id: template.platform_id || null,
        platform_icon: template.platform_icon || null,
        type: template.type || null
      };

      console.log('📦 Moving template to content_posts:', contentPostData);

      const { data, error } = await supabase
        .from('content_posts')
        .insert(contentPostData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Template moved to content_posts:', data);
      
      // Increment template usage count
      await supabase
        .from('dashboard_templates')
        .update({ 
          usage_count: (template.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id);

      // Refresh posts and switch to pending tab
      await refreshAllPosts();
      setActiveTab('pending');
      showSuccess('✅ Template moved to Pending tab!');
    } catch (error) {
      console.error('❌ Error moving template:', error);
      showError({
        message: 'Failed to move template. Please try again.',
        code: 'MOVE_TEMPLATE_ERROR',
        type: 'unknown',
        timestamp: new Date(),
        retryable: true
      }, () => handleMoveTemplateToContent(template));
    } finally {
      setOperationLoading(operationKey, false);
    }
  };

  // ⭐ NEW: Delete template from dashboard_templates (soft delete)
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;
    
    const operationKey = `delete-template-${templateId}`;
    setOperationLoading(operationKey, true);
    
    try {
      console.log('🗑️ Deleting template:', templateId);

      const { error } = await supabase
        .from('dashboard_templates')
        .update({
          is_deleted: true,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;

      console.log('✅ Template deleted successfully');
      
      // Refresh templates list
      await fetchTemplates();
      showSuccess('✅ Template deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting template:', error);
      showError({
        message: 'Failed to delete template. Please try again.',
        code: 'DELETE_TEMPLATE_ERROR',
        type: 'unknown',
        timestamp: new Date(),
        retryable: true
      }, () => handleDeleteTemplate(templateId));
    } finally {
      setOperationLoading(operationKey, false);
    }
  };

  const handleCopyToPending = async (post: ScheduledPost) => {
    const operationKey = `copy-${post.id}`;
    setOperationLoading(operationKey, true);
    
    try {
      const pendingPostData = {
        content_id: `copy-${post.id}-${Date.now()}`,
        character_profile: post.character_profile,
        character_avatar: post.character_avatar || '',
        theme: post.theme || '',
        audience: post.audience || '',
        media_type: post.media_type || '',
        template_type: post.template_type || '',
        platform: post.platform || '',
        title: post.title || '',
        description: post.description,
        hashtags: post.hashtags || [],
        keywords: post.keywords || '',
        cta: post.cta || '',
        media_files: post.media_files || [],
        selected_platforms: post.selected_platforms,
        status: 'pending' as const,
        user_id: post.user_id || '',
        created_by: post.created_by || ''
      };

      const result = await createPost(pendingPostData);
      
      if (result.success) {
        await refreshAllPosts();
        showSuccess('Post copied to Pending Scheduling for modification!');
      } else {
        showError(result.error!, () => handleCopyToPending(post));
      }
    } catch (error) {
      showError({
        message: 'Failed to copy post. Please try again.',
        code: 'COPY_ERROR',
        type: 'unknown',
        timestamp: new Date(),
        retryable: true
      }, () => handleCopyToPending(post));
    } finally {
      setOperationLoading(operationKey, false);
    }
  };

  const tabs = [
    { 
      id: 'pending', 
      label: 'Pending Schedules', 
      icon: Clock,
      count: pendingPosts.length
    },
    { 
      id: 'calendar', 
      label: 'Calendar View', 
      icon: Calendar,
      count: scheduledPostsFiltered.length
    },
    { 
      id: 'status', 
      label: 'Status Management', 
      icon: CheckCircle,
      count: scheduledPostsFiltered.length
    },
    { 
      id: 'saved', 
      label: 'Saved Templates', 
      icon: Save,
      count: (savedTemplates || []).length
    }
  ];

  return (
    <div style={{
      ...getContainerStyle(isDarkMode),
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      wordBreak: 'break-word'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: theme.text,
          margin: '0 0 6px 0'
        }}>
          Schedule Manager
        </h1>
        <p style={{
          fontSize: '14px',
          color: theme.textSecondary,
          margin: '0'
        }}>
          Manage your social media content scheduling and templates
        </p>
      </div>

      {/* Error Notifications */}
      <div style={{ marginBottom: '16px' }}>
        {postsError && (
          <ErrorNotificationBanner
            error={postsError}
            onDismiss={() => {}}
            onRetry={refreshAllPosts}
          />
        )}
        {templatesError && (
          <ErrorNotificationBanner
            error={templatesError}
            onDismiss={() => {}}
            onRetry={() => {}}
          />
        )}
        {notifications.filter(n => n.type === 'success').map((notification) => (
          <SuccessNotification
            key={notification.id}
            message={notification.message}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
        {notifications.filter(n => n.type === 'error').map((notification) => (
          <ErrorNotificationBanner
            key={notification.id}
            error={{
              message: notification.message,
              code: 'NOTIFICATION_ERROR',
              type: 'unknown',
              timestamp: notification.timestamp,
              retryable: !!notification.action
            }}
            onDismiss={() => dismissNotification(notification.id)}
            onRetry={notification.action?.handler}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        padding: '12px 16px',
        backgroundColor: theme.cardBg,
        borderRadius: '8px',
        border: `1px solid ${theme.border}`,
        alignItems: 'center'
      }}>
        <span style={{ color: theme.textSecondary, fontSize: '14px', fontWeight: '500' }}>Quick Stats:</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: theme.primary }}>
              {pendingPosts.length}
            </div>
            <span style={{ fontSize: '13px', color: theme.textSecondary }}>Pending</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: theme.success }}>
              {scheduledPostsFiltered.length}
            </div>
            <span style={{ fontSize: '13px', color: theme.textSecondary }}>Scheduled</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: theme.success }}>
              {publishedPosts.length}
            </div>
            <span style={{ fontSize: '13px', color: theme.textSecondary }}>Published</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: theme.danger }}>
              {failedPosts.length}
            </div>
            <span style={{ fontSize: '13px', color: theme.textSecondary }}>Failed</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '32px'
      }}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 8px',
                backgroundColor: '#4a90e2',
                cursor: 'pointer',
                borderRadius: '12px',
                border: 'none',
                transition: 'all 0.3s ease',
                opacity: activeTab === tab.id ? 1 : 0.8,
                transform: activeTab === tab.id ? 'scale(1.02)' : 'scale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minWidth: 0
              }}
            >
              <IconComponent size={16} style={{ color: '#ffffff', flexShrink: 0 }} />
              <div style={{ textAlign: 'left', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ffffff',
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {tab.label}
                </div>
              </div>
              {tab.count > 0 && (
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: '700',
                  minWidth: '16px',
                  textAlign: 'center',
                  flexShrink: 0
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{
        backgroundColor: theme.cardBg,
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        minHeight: '600px',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {activeTab === 'pending' && (
          <div style={{ padding: '24px' }}>
            {pendingPosts.length === 0 ? (
              <div style={{
                backgroundColor: theme.primaryBg,
                border: `1px solid ${theme.primary}`,
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center'
              }}>
                <Clock style={{
                  height: '48px',
                  width: '48px',
                  color: theme.primary,
                  margin: '0 auto 16px auto'
                }} />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: theme.primary,
                  margin: '0 0 8px 0'
                }}>
                  Ready for Scheduling
                </h3>
                <p style={{
                  color: theme.primary,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  margin: '0'
                }}>
                  Posts from Content Manager will appear here for scheduling
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {pendingPosts.map((post) => {
                  const profileData = characterProfiles[post.character_profile as string];
                  const isProfileLoading = profilesLoading[post.character_profile as string];
                  
                  return (
                    <div key={post.id} style={{
                      backgroundColor: theme.cardBg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      padding: '20px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '12px',
                            flexWrap: 'wrap'
                          }}>
                            {/* ⭐ Content ID Display */}
                            {post.content_id && (
                              <span style={{
                                fontSize: '11px',
                                color: theme.text,
                                fontWeight: 'bold',
                                fontFamily: 'monospace',
                                backgroundColor: theme.background,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: `1px solid ${theme.border}`,
                                maxWidth: '250px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-block'
                              }}
                              title={post.content_id}
                              >
                                {post.content_id}
                              </span>
                            )}
                            <span style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              backgroundColor: theme.warningBg,
                              color: theme.warning,
                              borderRadius: '12px',
                              fontWeight: 'bold'
                            }}>
                              Ready to Schedule
                            </span>
                            {post.created_date && (
                              <span style={{
                                fontSize: '12px',
                                color: theme.textSecondary,
                                fontWeight: 'bold'
                              }}>
                                Created {new Date(post.created_date).toLocaleDateString('en-GB')}
                              </span>
                            )}
                            
                            {/* Character Profile Display */}
                            {post.character_profile && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: theme.background,
                                borderRadius: '6px',
                                border: `1px solid ${theme.border}`
                              }}>
                                {isProfileLoading ? (
                                  <div style={{
                                    width: '10px',
                                    height: '10px',
                                    border: `1px solid ${theme.border}`,
                                    borderTop: `1px solid ${theme.primary}`,
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                  }} />
                                ) : profileData ? (
                                  <>
                                    {profileData.avatar_id && (
                                      <img 
                                        src={profileData.avatar_id} 
                                        alt={profileData.name || 'Profile'}
                                        style={{
                                          width: '20px',
                                          height: '20px',
                                          borderRadius: '50%',
                                          objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '1px'
                                    }}>
                                      {profileData.name && (
                                        <span style={{
                                          fontSize: '12px',
                                          fontWeight: 'bold',
                                          color: theme.text,
                                          lineHeight: '1.1'
                                        }}>
                                          {profileData.name}
                                        </span>
                                      )}
                                      {profileData.username && (
                                        <span style={{
                                          fontSize: '11px',
                                          fontWeight: '500',
                                          color: theme.primary,
                                          lineHeight: '1.1'
                                        }}>
                                          {profileData.username}
                                        </span>
                                      )}
                                      {profileData.role && (
                                        <span style={{
                                          fontSize: '10px',
                                          color: theme.textSecondary,
                                          lineHeight: '1.1'
                                        }}>
                                          {profileData.role}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            )}
                          </div>
                          
                          <p style={{
                            color: theme.text,
                            fontSize: '14px',
                            lineHeight: '1.5',
                            fontWeight: 'bold',
                            margin: '0 0 16px 0',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}>
                            {truncateDescription(post.description)}
                          </p>

                          {/* Media Files Preview */}
                          {post.media_files && post.media_files.length > 0 && (
                            <div style={{
                              marginBottom: '16px',
                              padding: '12px',
                              backgroundColor: theme.background,
                              borderRadius: '6px',
                              border: `1px solid ${theme.border}`
                            }}>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: theme.textSecondary,
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <FileText size={14} />
                                Media Files ({post.media_files.length})
                              </div>
                              <div style={{ display: 'grid', gap: '6px' }}>
                                {post.media_files.slice(0, 3).map((file, idx) => (
                                  <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 8px',
                                    backgroundColor: theme.cardBg,
                                    borderRadius: '4px'
                                  }}>
                                    {file.type === 'image' && file.url ? (
                                      <img 
                                        src={file.url}
                                        alt={file.name}
                                        style={{
                                          width: '24px',
                                          height: '24px',
                                          borderRadius: '3px',
                                          objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '3px',
                                        backgroundColor: theme.primary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '8px',
                                        fontWeight: 'bold'
                                      }}>
                                        {file.type === 'video' ? <Video size={12} /> : 
                                         file.type === 'url_link' ? <ExternalLink size={12} /> : 
                                         <FileText size={12} />}
                                      </div>
                                    )}
                                    <span style={{
                                      fontSize: '11px',
                                      color: theme.text,
                                      flex: 1,
                                      textOverflow: 'ellipsis',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {file.name}
                                    </span>
                                  </div>
                                ))}
                                {post.media_files.length > 3 && (
                                  <div style={{
                                    fontSize: '10px',
                                    color: theme.textSecondary,
                                    textAlign: 'center',
                                    padding: '4px'
                                  }}>
                                    +{post.media_files.length - 3} more files
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Platform badges */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                            fontSize: '12px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Platform:</span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {(post.platformDetails && post.platformDetails.length > 0) ? (
                                  post.platformDetails.map((platform, idx) => (
                                    <PlatformBadge key={idx} platform={platform} />
                                  ))
                                ) : post.platform_icon ? (
                                  <span style={{ 
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#3b82f6',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace'
                                  }}>
                                    {post.platform_icon}
                                  </span>
                                ) : post.selected_platforms && Array.isArray(post.selected_platforms) && post.selected_platforms.length > 0 ? (
                                  <span style={{ 
                                    color: theme.text, 
                                    fontSize: '11px',
                                    backgroundColor: theme.primary + '20',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                  }}>
                                    {post.selected_platforms.length} platform{post.selected_platforms.length > 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span style={{ color: theme.textSecondary, fontSize: '11px' }}>
                                    No platforms
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginLeft: '24px'
                        }}>
                          <button
                            onClick={() => handleEditPost(post)}
                            disabled={isOperationLoading(`edit-${post.id}`)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: isOperationLoading(`edit-${post.id}`) ? theme.background : theme.textSecondary,
                              color: 'white',
                              fontSize: '12px',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              border: 'none',
                              cursor: isOperationLoading(`edit-${post.id}`) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isOperationLoading(`edit-${post.id}`) ? 'Loading...' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleSchedulePost(post)}
                            disabled={isOperationLoading(`schedule-${post.id}`)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: isOperationLoading(`schedule-${post.id}`) ? theme.textSecondary : theme.primary,
                              color: 'white',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              border: 'none',
                              cursor: isOperationLoading(`schedule-${post.id}`) ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {isOperationLoading(`schedule-${post.id}`) && (
                              <RefreshCw style={{ height: '14px', width: '14px', animation: 'spin 1s linear infinite' }} />
                            )}
                            {isOperationLoading(`schedule-${post.id}`) ? 'Scheduling...' : 'Schedule'}
                          </button>
                          <button
                            onClick={() => handleDeletePendingPost(post.id)}
                            disabled={isOperationLoading(`delete-${post.id}`)}
                            style={{
                              padding: '8px',
                              color: theme.textSecondary,
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: isOperationLoading(`delete-${post.id}`) ? 'not-allowed' : 'pointer',
                              opacity: isOperationLoading(`delete-${post.id}`) ? 0.5 : 1
                            }}
                            title="Delete"
                          >
                            {isOperationLoading(`delete-${post.id}`) ? (
                              <RefreshCw style={{ height: '16px', width: '16px', animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Trash2 style={{ height: '16px', width: '16px' }} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
{activeTab === 'calendar' && (
  <div style={{ padding: '24px' }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={() => navigateCalendar('prev')}
          style={{
            padding: '8px',
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            color: theme.text
          }}
        >
          <ChevronLeft style={{ height: '16px', width: '16px' }} />
        </button>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: theme.text,
          margin: '0'
        }}>
          {formatCalendarTitle()}
        </h3>
        <button
          onClick={() => navigateCalendar('next')}
          style={{
            padding: '8px',
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            color: theme.text
          }}
        >
          <ChevronRight style={{ height: '16px', width: '16px' }} />
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['day', 'week', 'month'] as const).map(view => (
          <button
            key={view}
            onClick={() => setCalendarView(view)}
            style={{
              padding: '6px 12px',
              backgroundColor: calendarView === view ? theme.primary : 'transparent',
              color: calendarView === view ? 'white' : theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              textTransform: 'capitalize'
            }}
          >
            {view}
          </button>
        ))}
      </div>
    </div>

    {/* ============ MONTH VIEW ============ */}
    {calendarView === 'month' && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: theme.border,
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            style={{
              padding: '12px',
              backgroundColor: theme.background,
              fontSize: '12px',
              fontWeight: 'bold',
              color: theme.textSecondary,
              textAlign: 'center'
            }}
          >
            {day}
          </div>
        ))}
        
        {getMonthDates(currentDate).map((date, index) => {
          const postsForDate = getPostsForDate(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              style={{
                padding: '8px',
                backgroundColor: theme.cardBg,
                minHeight: '100px',
                opacity: isCurrentMonth ? 1 : 0.5
              }}
            >
              <div style={{
                fontSize: '13px',
                fontWeight: isToday ? 'bold' : 'normal',
                color: isToday ? theme.primary : theme.text,
                marginBottom: '6px'
              }}>
                {date.getDate()}
              </div>
              
              {postsForDate.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {postsForDate.slice(0, 3).map((post, idx) => {
                    const statusStyle = getStatusColor(post.status);
                    const borderParts = statusStyle.borderLeft.split(' ');
                    const statusColor = borderParts[2] || theme.primary;
                    const profileData = characterProfiles[post.character_profile as string];
                    
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '4px 6px',
                          backgroundColor: statusColor,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                        onClick={() => handleEditPost(post)}
                        title={`${post.scheduled_date && new Date(post.scheduled_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${profileData?.name || 'No profile'}`}
                      >
                        <div style={{ 
                          fontWeight: 'bold', 
                          fontSize: '11px',
                          color: 'white'
                        }}>
                          {post.scheduled_date && new Date(post.scheduled_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div style={{ 
                          fontWeight: '600',
                          fontSize: '10px',
                          color: 'white',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}>
                          {profileData?.name || 'No profile'}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {(post.platformDetails && post.platformDetails.length > 0) ? (
                            post.platformDetails.slice(0, 4).map((platform, pIdx) => {
                              const icon = platform.platform_icon || (() => {
                                const url = (platform.url || '').toLowerCase();
                                if (url.includes('telegram') || url.includes('t.me')) return 'TG';
                                if (url.includes('instagram')) return 'IG';
                                if (url.includes('facebook')) return 'FB';
                                if (url.includes('linkedin')) return 'LI';
                                if (url.includes('twitter') || url.includes('x.com')) return 'TW';
                                if (url.includes('youtube')) return 'YT';
                                return '??';
                              })();
                              return (
                                <span key={pIdx} style={{
                                  fontSize: '9px',
                                  fontWeight: 'bold',
                                  backgroundColor: getPlatformBadgeColor(icon),
                                  color: 'white',
                                  padding: '2px 4px',
                                  borderRadius: '3px',
                                  border: '1px solid rgba(255,255,255,0.4)'
                                }}>
                                  {icon}
                                </span>
                              );
                            })
                          ) : post.platform_icon ? (
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 'bold',
                              backgroundColor: getPlatformBadgeColor(post.platform_icon),
                              color: 'white',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              border: '1px solid rgba(255,255,255,0.4)'
                            }}>
                              {post.platform_icon}
                            </span>
                          ) : post.selected_platforms && Array.isArray(post.selected_platforms) && post.selected_platforms.length > 0 ? (
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 'bold',
                              backgroundColor: 'rgba(0,0,0,0.3)',
                              color: 'white',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              border: '1px solid rgba(255,255,255,0.4)'
                            }}>
                              {post.selected_platforms.length} platform{post.selected_platforms.length > 1 ? 's' : ''}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  {postsForDate.length > 3 && (
                    <div style={{
                      fontSize: '9px',
                      color: theme.textSecondary,
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      +{postsForDate.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* ============ WEEK VIEW ============ */}
    {calendarView === 'week' && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px'
      }}>
        {getWeekDates(currentDate).map((date, index) => {
          const postsForDate = getPostsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              style={{
                padding: '16px',
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                minHeight: '250px'
              }}
            >
              <div style={{
                fontSize: '12px',
                fontWeight: isToday ? 'bold' : 'normal',
                color: isToday ? theme.primary : theme.text,
                marginBottom: '12px',
                textAlign: 'center',
                paddingBottom: '8px',
                borderBottom: `2px solid ${theme.border}`
              }}>
                {date.toLocaleDateString('en-GB', { 
                  weekday: 'short',
                  day: 'numeric' 
                })}
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {postsForDate.map((post, idx) => {
                  const profileData = characterProfiles[post.character_profile as string];
                  const statusStyle = getStatusColor(post.status);
                  const borderParts = statusStyle.borderLeft.split(' ');
                  const statusColor = borderParts[2] || theme.primary;
                  
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '8px',
                        backgroundColor: statusColor,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                      onClick={() => handleEditPost(post)}
                      title="Click to edit"
                    >
                      <div style={{
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: '11px'
                      }}>
                        {post.scheduled_date && new Date(post.scheduled_date).toLocaleTimeString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      
                      <div style={{
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '11px'
                      }}>
                        {profileData?.name || 'No profile'}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(post.platformDetails && post.platformDetails.length > 0) ? (
                          post.platformDetails.map((platform, pIdx) => {
                            const getIconFromPlatform = (plat: any): string => {
                              if (plat.platform_icon) return plat.platform_icon;
                              const url = (plat.url || '').toLowerCase();
                              if (url.includes('telegram') || url.includes('t.me')) return 'TG';
                              if (url.includes('instagram')) return 'IG';
                              if (url.includes('facebook')) return 'FB';
                              if (url.includes('linkedin')) return 'LI';
                              if (url.includes('twitter') || url.includes('x.com')) return 'TW';
                              if (url.includes('youtube')) return 'YT';
                              return '??';
                            };
                            return (
                              <span key={pIdx} style={{
                                fontSize: '10px',
                                fontWeight: 'bold',
                                backgroundColor: getPlatformBadgeColor(getIconFromPlatform(platform)),
                                color: 'white',
                                padding: '3px 6px',
                                borderRadius: '4px',
                                border: '1px solid rgba(255,255,255,0.4)'
                              }}>
                                {getIconFromPlatform(platform)}
                              </span>
                            );
                          })
                        ) : post.platform_icon ? (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            backgroundColor: getPlatformBadgeColor(post.platform_icon),
                            color: 'white',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.4)'
                          }}>
                            {post.platform_icon}
                          </span>
                        ) : post.selected_platforms && Array.isArray(post.selected_platforms) && post.selected_platforms.length > 0 ? (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            color: 'white',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.4)'
                          }}>
                            {post.selected_platforms.length} platform{post.selected_platforms.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px' }}>No platforms</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* ============ DAY VIEW ============ */}
    {calendarView === 'day' && (
      <div style={{
        display: 'grid',
        gap: '1px',
        backgroundColor: theme.border,
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {Object.entries(getHourlyPostsForDay(currentDate)).map(([hour, posts]) => (
          <div
            key={hour}
            style={{
              display: 'flex',
              backgroundColor: theme.cardBg,
              minHeight: '70px'
            }}
          >
            <div style={{
              width: '70px',
              padding: '12px',
              backgroundColor: theme.background,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold',
              color: theme.textSecondary,
              borderRight: `2px solid ${theme.border}`
            }}>
              {String(hour).padStart(2, '0')}:00
            </div>
            <div style={{
              flex: 1,
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {posts.map((post, idx) => {
                const profileData = characterProfiles[post.character_profile as string];
                const statusStyle = getStatusColor(post.status);
                const borderParts = statusStyle.borderLeft.split(' ');
                const statusColor = borderParts[2] || theme.primary;
                
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: statusColor,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                    onClick={() => handleEditPost(post)}
                    title="Click to edit"
                  >
                    <div style={{
                      fontWeight: 'bold',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {post.scheduled_date && new Date(post.scheduled_date).toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    
                    <div style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '10px'
                    }}>
                      {profileData?.name || 'No profile'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '2px' }}>
                      {(post.platformDetails && post.platformDetails.length > 0) ? (
                        post.platformDetails.map((platform, pIdx) => {
                          const icon = platform.platform_icon || (() => {
                            const url = (platform.url || '').toLowerCase();
                            if (url.includes('telegram') || url.includes('t.me')) return 'TG';
                            if (url.includes('instagram')) return 'IG';
                            if (url.includes('facebook')) return 'FB';
                            if (url.includes('linkedin')) return 'LI';
                            if (url.includes('twitter') || url.includes('x.com')) return 'TW';
                            if (url.includes('youtube')) return 'YT';
                            return '??';
                          })();
                          return (
                            <span key={pIdx} style={{
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: getPlatformBadgeColor(icon),
                              color: 'white',
                              padding: '4px 7px',
                              borderRadius: '4px',
                              border: '1px solid rgba(255,255,255,0.4)'
                            }}>
                              {icon}
                            </span>
                          );
                        })
                      ) : post.platform_icon ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: getPlatformBadgeColor(post.platform_icon),
                          color: 'white',
                          padding: '4px 7px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.4)'
                        }}>
                          {post.platform_icon}
                        </span>
                      ) : post.selected_platforms && Array.isArray(post.selected_platforms) && post.selected_platforms.length > 0 ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          color: 'white',
                          padding: '4px 7px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.4)'
                        }}>
                          {post.selected_platforms.length} platform{post.selected_platforms.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>No platforms</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
        
        {activeTab === 'status' && (
          <div style={{ padding: '24px' }}>
            <div style={{
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              {['all', 'scheduled', 'processing', 'published', 'failed'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: statusFilter === status ? theme.primary : 'transparent',
                    color: statusFilter === status ? 'white' : theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {status} 
                  {status !== 'all' && (
                    <span style={{ opacity: 0.8 }}>
                      ({scheduledPostsFiltered.filter(p => status === 'all' || p?.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {scheduledPostsFiltered
                .filter(post => statusFilter === 'all' || post?.status === statusFilter)
                .map((post) => {
                  const profileData = characterProfiles[post.character_profile as string];
                  const isProfileLoading = profilesLoading[post.character_profile as string];
                  
                  return (
                    <div
                      key={post.id}
                      style={{
                        padding: '16px',
                        backgroundColor: theme.cardBg,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        ...getStatusColor(post.status),
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px',
                            flexWrap: 'wrap'
                          }}>
                            {getStatusIcon(post.status)}
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: theme.text,
                              textTransform: 'uppercase'
                            }}>
                              {post.status}
                            </span>
                            {post.scheduled_date && (
                              <span style={{
                                fontSize: '12px',
                                color: theme.textSecondary
                              }}>
                                {new Date(post.scheduled_date).toLocaleString('en-GB')}
                              </span>
                            )}
                            
                            {/* Character Profile Display */}
                            {post.character_profile && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px 8px',
                                backgroundColor: theme.background,
                                borderRadius: '4px',
                                border: `1px solid ${theme.border}`
                              }}>
                                {isProfileLoading ? (
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    border: `1px solid ${theme.border}`,
                                    borderTop: `1px solid ${theme.primary}`,
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                  }} />
                                ) : profileData ? (
                                  <>
                                    {profileData.avatar_id && (
                                      <img 
                                        src={profileData.avatar_id} 
                                        alt={profileData.name || 'Profile'}
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '50%',
                                          objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <span style={{
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      color: theme.text
                                    }}>
                                      {profileData.name || profileData.username}
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            )}
                          </div>
                          
                          <p style={{
                            fontSize: '13px',
                            color: theme.text,
                            margin: '0 0 10px 0',
                            lineHeight: '1.4',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}>
                            {truncateDescription(post.description, 100)}
                          </p>
                          
                          {/* Platform badges and service_type */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            fontSize: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{ color: theme.textSecondary, fontWeight: '600' }}>Platforms:</span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {(post.platformDetails && post.platformDetails.length > 0) ? (
                                  post.platformDetails.map((platform, idx) => (
                                    <PlatformBadge key={idx} platform={platform} />
                                  ))
                                ) : post.platform_icon ? (
                                  <span style={{
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#3b82f6',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace'
                                  }}>
                                    {post.platform_icon}
                                  </span>
                                ) : post.selected_platforms && Array.isArray(post.selected_platforms) && post.selected_platforms.length > 0 ? (
                                  <span style={{
                                    color: theme.text,
                                    fontSize: '11px',
                                    backgroundColor: theme.primary + '20',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                  }}>
                                    {post.selected_platforms.length} platform{post.selected_platforms.length > 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span style={{ color: theme.textSecondary, fontSize: '11px' }}>
                                    No platforms
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {post.service_type && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span style={{ color: theme.textSecondary, fontWeight: '600' }}>Service:</span>
                                <span style={{
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  backgroundColor: theme.primaryBg,
                                  color: theme.primary,
                                  borderRadius: '4px',
                                  fontWeight: 'bold'
                                }}>
                                  {post.service_type}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginLeft: '16px'
                        }}>
                          {post.status === 'failed' && (
                            <button
                              onClick={() => handleCopyToPending(post)}
                              disabled={isOperationLoading(`copy-${post.id}`)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: theme.warning,
                                color: 'white',
                                fontSize: '12px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: isOperationLoading(`copy-${post.id}`) ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {isOperationLoading(`copy-${post.id}`) ? 'Copying...' : 'Retry'}
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleEditPost(post)}
                            disabled={isOperationLoading(`edit-${post.id}`) || post.status === 'published'}
                            style={{
                              padding: '6px',
                              color: theme.textSecondary,
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: (isOperationLoading(`edit-${post.id}`) || post.status === 'published') ? 'not-allowed' : 'pointer',
                              opacity: (isOperationLoading(`edit-${post.id}`) || post.status === 'published') ? 0.5 : 1
                            }}
                            title={post.status === 'published' ? 'Cannot edit published posts' : 'Edit post'}
                          >
                            <Edit3 style={{ height: '14px', width: '14px' }} />
                          </button>
                          
                          <button
                            onClick={() => handleSaveAsTemplate(post)}
                            disabled={isOperationLoading(`save-template-${post.id}`)}
                            style={{
                              padding: '6px',
                              color: theme.textSecondary,
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: isOperationLoading(`save-template-${post.id}`) ? 'not-allowed' : 'pointer',
                              opacity: isOperationLoading(`save-template-${post.id}`) ? 0.5 : 1
                            }}
                            title="Save as template"
                          >
                            <Save style={{ height: '14px', width: '14px' }} />
                          </button>
                          
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            disabled={isOperationLoading(`delete-${post.id}`) || post.status === 'processing'}
                            style={{
                              padding: '6px',
                              color: theme.danger,
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: (isOperationLoading(`delete-${post.id}`) || post.status === 'processing') ? 'not-allowed' : 'pointer',
                              opacity: (isOperationLoading(`delete-${post.id}`) || post.status === 'processing') ? 0.5 : 1
                            }}
                            title={post.status === 'processing' ? 'Cannot delete processing posts' : 'Delete post'}
                          >
                            <Trash2 style={{ height: '14px', width: '14px' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {scheduledPostsFiltered.filter(post => statusFilter === 'all' || post?.status === statusFilter).length === 0 && (
                <div style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center'
                }}>
                  <CheckCircle style={{
                    height: '48px',
                    width: '48px',
                    color: theme.textSecondary,
                    margin: '0 auto 16px auto'
                  }} />
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: theme.textSecondary,
                    margin: '0 0 8px 0'
                  }}>
                    No posts found
                  </h3>
                  <p style={{
                    color: theme.textSecondary,
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    No posts match the selected status filter
                  </p>
                </div>
              )}
            </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div style={{ padding: '24px' }}>
            {templatesLoading ? (
              <div style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center'
              }}>
                <RefreshCw style={{
                  height: '48px',
                  width: '48px',
                  color: theme.textSecondary,
                  margin: '0 auto 16px auto',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '14px',
                  margin: '0'
                }}>
                  Loading templates...
                </p>
              </div>
            ) : (savedTemplates || []).length === 0 ? (
              <div style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center'
              }}>
                <Save style={{
                  height: '48px',
                  width: '48px',
                  color: theme.textSecondary,
                  margin: '0 auto 16px auto'
                }} />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: theme.textSecondary,
                  margin: '0 0 8px 0'
                }}>
                  No Saved Templates
                </h3>
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '14px',
                  margin: '0'
                }}>
                  Save posts as templates to reuse them quickly
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {(savedTemplates || []).map((template) => {
                  const profileData = characterProfiles[template.character_profile as string];
                  const isProfileLoading = profilesLoading[template.character_profile as string];
                  
                  return (
                    <div
                      key={template.id}
                      style={{
                        backgroundColor: theme.cardBg,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: '20px',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          {/* Header with badges */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              backgroundColor: theme.primaryBg,
                              color: theme.primary,
                              borderRadius: '12px',
                              fontWeight: 'bold'
                            }}>
                              Template
                            </span>
                            <span style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              backgroundColor: theme.successBg,
                              color: theme.success,
                              borderRadius: '12px',
                              fontWeight: 'bold'
                            }}>
                              Used {template.usage_count || 0} times
                            </span>
                            {template.created_at && (
                              <span style={{
                                fontSize: '12px',
                                color: theme.textSecondary,
                                fontWeight: 'bold'
                              }}>
                                Created {new Date(template.created_at).toLocaleDateString('en-GB')}
                              </span>
                            )}
                          </div>

                          {/* Character profile info */}
                          {(profileData || template.name) && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '12px',
                              padding: '8px',
                              backgroundColor: theme.background,
                              borderRadius: '6px'
                            }}>
                              {profileData?.avatar_url || template.character_avatar ? (
                                <img 
                                  src={profileData?.avatar_url || template.character_avatar}
                                  alt="Avatar"
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <User style={{ height: '32px', width: '32px', color: theme.textSecondary }} />
                              )}
                              <div>
                                <div style={{
                                  fontSize: '13px',
                                  fontWeight: 'bold',
                                  color: theme.text
                                }}>
                                  {profileData?.name || template.name || 'Unknown'}
                                </div>
                                {(profileData?.username || template.username) && (
                                  <div style={{
                                    fontSize: '11px',
                                    color: theme.textSecondary
                                  }}>
                                    {profileData?.username || template.username}
                                  </div>
                                )}
                                {(profileData?.role || template.role) && (
                                  <div style={{
                                    fontSize: '10px',
                                    color: theme.primary,
                                    fontWeight: '600'
                                  }}>
                                    {profileData?.role || template.role}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Title */}
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: theme.text,
                            margin: '0 0 12px 0',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}>
                            {template.template_name || template.title}
                          </h4>

                          {/* Description */}
                          {template.description && (
                            <p style={{
                              fontSize: '14px',
                              color: theme.text,
                              margin: '0 0 12px 0',
                              lineHeight: '1.5',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              maxHeight: '100px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {template.description}
                            </p>
                          )}

                          {/* Media files indicator */}
                          {template.media_files && template.media_files.length > 0 && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px',
                              backgroundColor: theme.background,
                              borderRadius: '6px',
                              marginBottom: '12px'
                            }}>
                              {template.media_files[0].type === 'image' && <Image style={{ height: '16px', width: '16px', color: theme.primary }} />}
                              {template.media_files[0].type === 'video' && <Video style={{ height: '16px', width: '16px', color: theme.primary }} />}
                              {template.media_files[0].type === 'pdf' && <FileText style={{ height: '16px', width: '16px', color: theme.primary }} />}
                              <span style={{ fontSize: '12px', color: theme.text, fontWeight: 'bold' }}>
                                Media Files ({template.media_files.length})
                              </span>
                            </div>
                          )}

                          {/* Hashtags */}
                          {template.hashtags && template.hashtags.length > 0 && (
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '6px',
                              marginBottom: '12px'
                            }}>
                              {template.hashtags.slice(0, 5).map((tag, idx) => (
                                <span key={idx} style={{
                                  fontSize: '11px',
                                  color: theme.primary,
                                  backgroundColor: isDarkMode ? '#1e3a8a20' : '#dbeafe',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 'bold'
                                }}>
                                  #{tag}
                                </span>
                              ))}
                              {template.hashtags.length > 5 && (
                                <span style={{
                                  fontSize: '11px',
                                  color: theme.textSecondary,
                                  padding: '4px 8px'
                                }}>
                                  +{template.hashtags.length - 5} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Platform & Service info */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            fontSize: '12px',
                            flexWrap: 'wrap'
                          }}>
                            {/* Platforms - with fallback for platform_icon */}
                            {(template.selected_platforms && template.selected_platforms.length > 0) ? (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Platforms:</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {template.selected_platforms.slice(0, 3).map((platformId, idx) => {
                                    const platform = getPlatformIcon(platformId);
                                    return (
                                      <span
                                        key={idx}
                                        style={{
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          color: 'white',
                                          fontSize: '10px',
                                          fontWeight: 'bold',
                                          backgroundColor: platform.color
                                        }}
                                      >
                                        {platform.icon}
                                      </span>
                                    );
                                  })}
                                  {template.selected_platforms.length > 3 && (
                                    <span style={{
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      color: theme.textSecondary
                                    }}>
                                      +{template.selected_platforms.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : template.platform_icon ? (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Platforms:</span>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  backgroundColor: getPlatformBadgeColor(template.platform_icon),
                                  color: 'white',
                                  padding: '4px 7px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255,255,255,0.4)'
                                }}>
                                  {template.platform_icon}
                                </span>
                              </div>
                            ) : null}

                            {/* Theme */}
                            {template.theme && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Theme:</span>
                                <span style={{ color: theme.text, fontWeight: 'bold' }}>
                                  {template.theme.replace(/_/g, ' ')}
                                </span>
                              </div>
                            )}

                            {/* Media type */}
                            {template.media_type && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Type:</span>
                                <span style={{ color: theme.text, fontWeight: 'bold' }}>
                                  {template.media_type.replace(/_/g, ' ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          marginLeft: '16px'
                        }}>
                          <button
                            onClick={() => handleMoveTemplateToContent(template)}
                            disabled={isOperationLoading(`move-template-${template.id}`)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: isOperationLoading(`move-template-${template.id}`) ? theme.textSecondary : theme.primary,
                              color: 'white',
                              fontSize: '12px',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              border: 'none',
                              cursor: isOperationLoading(`move-template-${template.id}`) ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap'
                            }}
                            title="Move to Content Posts (Pending tab)"
                          >
                            {isOperationLoading(`move-template-${template.id}`) ? (
                              <>
                                <RefreshCw style={{ height: '12px', width: '12px', animation: 'spin 1s linear infinite' }} />
                                Moving...
                              </>
                            ) : (
                              <>
                                <Play style={{ height: '12px', width: '12px' }} />
                                Move
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            disabled={isOperationLoading(`delete-template-${template.id}`)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: 'transparent',
                              color: theme.danger,
                              fontSize: '12px',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              border: `1px solid ${theme.danger}`,
                              cursor: isOperationLoading(`delete-template-${template.id}`) ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap'
                            }}
                            title="Delete template"
                          >
                            {isOperationLoading(`delete-template-${template.id}`) ? (
                              <>
                                <RefreshCw style={{ height: '12px', width: '12px', animation: 'spin 1s linear infinite' }} />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 style={{ height: '12px', width: '12px' }} />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isScheduleModalOpen && selectedPost && (
        <ScheduleModal
          post={selectedPost}
          onConfirm={handleConfirmSchedule}
          onCancel={() => {
            setIsScheduleModalOpen(false);
            setSelectedPost(null);
          }}
        />
      )}

      {isEditModalOpen && editingPost && (
        <EditModal
          post={editingPost}
          onSave={handleSaveEdit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingPost(null);
          }}
          isLoading={isOperationLoading(`edit-${editingPost.id}`)}
        />
      )}

      <style>{getCSSAnimations()}</style>
    </div>
  );
}
