// /src/schedulecomponent/ScheduleComponent.tsx - PHASE 3: JSON Integration + Calendar & Status Views
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import ScheduleModal from './components/ScheduleModal';
import EditModal from './components/EditModal';
import { getTheme, getContainerStyle, getCSSAnimations } from './utils/styleUtils';
import { Calendar, Clock, Edit3, Trash2, RefreshCw, AlertCircle, CheckCircle, Play, X, ChevronLeft, ChevronRight, Save, XCircle, WifiOff, FileText, ExternalLink, Image, Video } from 'lucide-react';
import { ScheduledPost, SavedTemplate, ErrorNotification, ApiError } from './types';
import { supabase } from './config';
import { updatePendingPost } from './api/scheduleAPI';
import StatusManagement from './components/StatusManagement';
import TemplateManager from './components/TemplateManager';

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

  const {
    templates: savedTemplates,
    loading: templatesLoading,
    error: templatesError,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage
  } = useTemplates();

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
  
  // Fetch posts directly from scheduled_posts table
  const [scheduledPostsFromDB, setScheduledPostsFromDB] = useState<ScheduledPost[]>([]);
  const [loadingScheduledPosts, setLoadingScheduledPosts] = useState(false);

  const fetchScheduledPostsFromDB = useCallback(async () => {
    setLoadingScheduledPosts(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .order('scheduled_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching scheduled posts:', error);
      } else {
        // Fetch platform details for each post
        const postsWithPlatforms = await Promise.all((data || []).map(async (post) => {
          if (post.selected_platforms && Array.isArray(post.selected_platforms)) {
            const platformIds = post.selected_platforms;
            const { data: platformsData, error: platformsError } = await supabase
              .from('platforms')
              .select('*')
              .in('id', platformIds);
            
            if (!platformsError && platformsData) {
              return { ...post, platformDetails: platformsData };
            }
          }
          return { ...post, platformDetails: [] };
        }));
        
        setScheduledPostsFromDB(postsWithPlatforms);
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
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

  // Combine posts from both sources
  const allPosts = useMemo(() => {
    return [...(scheduledPosts || []), ...scheduledPostsFromDB];
  }, [scheduledPosts, scheduledPostsFromDB]);

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

  // Filter posts by whether they have been scheduled (have date + time + service_type)
  const pendingPosts = useMemo(() => 
    allPosts.filter(p => 
      // Posts WITHOUT scheduled_date, timezone, or service_type are pending
      !p?.scheduled_date || !p?.timezone || !p?.service_type
    ),
    [allPosts]
  );

  const scheduledPostsFiltered = useMemo(() => 
    allPosts.filter(p => 
      // Posts WITH scheduled_date, timezone, AND service_type go to calendar/status
      p?.scheduled_date && p?.timezone && p?.service_type
    ),
    [allPosts]
  );

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
        character_avatar: selectedPost.character_avatar || ''
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

const handleDeletePost = async (postId: string) => {
  if (!confirm('Are you sure you want to remove this post from the dashboard?')) return;
  
  const operationKey = `delete-${postId}`;
  setOperationLoading(operationKey, true);
  
  try {
    // Remove from local state ONLY - dashboard display removal
    setScheduledPostsFromDB(prev => prev.filter(p => p.id !== postId));
    showSuccess('Post removed from dashboard view!');
  } catch (error) {
    showError({
      message: 'Failed to remove post from dashboard. Please try again.',
      code: 'DELETE_ERROR',
      type: 'unknown',
      timestamp: new Date(),
      retryable: true
    }, () => handleDeletePost(postId));
  } finally {
    setOperationLoading(operationKey, false);
  }
};

  const handleSaveAsTemplate = async (post: ScheduledPost) => {
    const operationKey = `save-template-${post.id}`;
    setOperationLoading(operationKey, true);
    
    try {
      const templateData = {
        template_name: post.title || 'Saved Template',
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
        selected_platforms: post.selected_platforms,
        usage_count: 0,
        is_active: true,
        template_version: 1,
        user_id: post.user_id || '',
        created_by: post.created_by || ''
      };

      const result = await createTemplate(templateData);
      
      if (result.success) {
        showSuccess('Post saved as template successfully!');
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
    <div style={getContainerStyle(isDarkMode)}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: theme.text,
          margin: '0 0 8px 0'
        }}>
          Schedule Manager
        </h1>
        <p style={{
          fontSize: '16px',
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
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
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
                padding: '20px 24px',
                backgroundColor: '#4a90e2',
                cursor: 'pointer',
                borderRadius: '12px',
                border: 'none',
                transition: 'all 0.3s ease',
                opacity: activeTab === tab.id ? 1 : 0.8,
                transform: activeTab === tab.id ? 'scale(1.02)' : 'scale(1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <IconComponent size={20} style={{ color: '#ffffff', flexShrink: 0 }} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#ffffff',
                  lineHeight: '1.2'
                }}>
                  {tab.label}
                </div>
              </div>
              {tab.count > 0 && (
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  minWidth: '20px',
                  textAlign: 'center'
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
        minHeight: '600px'
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
                      padding: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ flex: 1 }}>
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
                            margin: '0 0 16px 0'
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
                              <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Platforms:</span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {(post.platformDetails && post.platformDetails.length > 0) ? (
                                  post.platformDetails.map((platform, idx) => (
                                    <PlatformBadge key={idx} platform={platform} />
                                  ))
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
                            onClick={() => handleDeletePost(post.id)}
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
          fontSize: '18px',
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
              padding: '8px 16px',
              backgroundColor: calendarView === view ? theme.primary : 'transparent',
              color: calendarView === view ? 'white' : theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
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
                                  fontSize: '9px',
                                  fontWeight: 'bold',
                                  backgroundColor: 'rgba(0,0,0,0.3)',
                                  color: 'white',
                                  padding: '2px 4px',
                                  borderRadius: '3px',
                                  border: '1px solid rgba(255,255,255,0.4)'
                                }}>
                                  {getIconFromPlatform(platform)}
                                </span>
                              );
                            })
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
                fontSize: '14px',
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
                        fontSize: '13px'
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
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                color: 'white',
                                padding: '3px 6px',
                                borderRadius: '4px',
                                border: '1px solid rgba(255,255,255,0.4)'
                              }}>
                                {getIconFromPlatform(platform)}
                              </span>
                            );
                          })
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
              fontSize: '13px',
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
                      fontSize: '14px'
                    }}>
                      {post.scheduled_date && new Date(post.scheduled_date).toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    
                    <div style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '12px'
                    }}>
                      {profileData?.name || 'No profile'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '2px' }}>
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
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: 'rgba(0,0,0,0.3)',
                              color: 'white',
                              padding: '4px 7px',
                              borderRadius: '4px',
                              border: '1px solid rgba(255,255,255,0.4)'
                            }}>
                              {getIconFromPlatform(platform)}
                            </span>
                          );
                        })
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
          <StatusManagement
            posts={scheduledPostsFiltered}
            loading={postsLoading}
            error={postsError?.message || null}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
            onRetry={async (postId) => {
              await handleCopyToPending(scheduledPostsFiltered.find(p => p.id === postId));
          <div style={{ padding: '24px' }}>
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
                    fontSize: '14px',
                    textTransform: 'capitalize'
                  }}
                >
                  {status} 
                  {status !== 'all' && (
                    <span style={{ marginLeft: '4px', opacity: 0.8 }}>
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
                        ...getStatusColor(post.status)
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ flex: 1 }}>
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
                            lineHeight: '1.4'
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
        )}

        {activeTab === 'saved' && (
          <TemplateManager
            templates={savedTemplates || []}
            loading={templatesLoading}
            error={templatesError?.message || null}
            onCreate={handleCreateTemplate}
            onUpdate={handleUpdateTemplate}
            onDelete={handleDeleteTemplate}
            onUse={handleUseTemplate}
            onLoadTemplate={(template) => {
              // Load template into pending post creation
              console.log('Loading template:', template);
            }}
          />
        )}
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
                {(savedTemplates || []).map((template) => (
                  <div
                    key={template.id}
                    style={{
                      padding: '20px',
                      backgroundColor: theme.cardBg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: theme.text,
                            margin: '0'
                          }}>
                            {template.template_name}
                          </h4>
                          <span style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: theme.primaryBg,
                            color: theme.primary,
                            borderRadius: '12px',
                            fontWeight: 'bold'
                          }}>
                            Used {template.usage_count || 0} times
                          </span>
                          {template.template_type && (
                            <span style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              backgroundColor: theme.background,
                              color: theme.textSecondary,
                              borderRadius: '12px',
                              fontWeight: 'bold'
                            }}>
                              {template.template_type}
                            </span>
                          )}
                        </div>
                        
                        {template.description && (
                          <p style={{
                            fontSize: '14px',
                            color: theme.text,
                            margin: '0 0 12px 0',
                            lineHeight: '1.4'
                          }}>
                            {truncateDescription(template.description)}
                          </p>
                        )}
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '12px'
                        }}>
                          {template.selected_platforms && template.selected_platforms.length > 0 && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Platforms:</span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {template.selected_platforms.map((platformId, idx) => {
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
                              </div>
                            </div>
                          )}
                          
                          {template.theme && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Theme:</span>
                              <span style={{ color: theme.text, fontWeight: 'bold' }}>{template.theme}</span>
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
                        <button
                          onClick={() => handleUseTemplate(template)}
                          disabled={isOperationLoading(`use-template-${template.id}`)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: isOperationLoading(`use-template-${template.id}`) ? theme.textSecondary : theme.primary,
                            color: 'white',
                            fontSize: '12px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: isOperationLoading(`use-template-${template.id}`) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isOperationLoading(`use-template-${template.id}`) && (
                            <RefreshCw style={{ height: '12px', width: '12px', animation: 'spin 1s linear infinite' }} />
                          )}
                          {isOperationLoading(`use-template-${template.id}`) ? 'Using...' : 'Use Template'}
                        </button>
                        
                        <button
                          onClick={() => setEditingTemplate(template)}
                          style={{
                            padding: '6px',
                            color: theme.textSecondary,
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Edit template"
                        >
                          <Edit3 style={{ height: '14px', width: '14px' }} />
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this template?')) {
                              deleteTemplate(template.id);
                            }
                          }}
                          style={{
                            padding: '6px',
                            color: theme.danger,
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Delete template"
                        >
                          <Trash2 style={{ height: '14px', width: '14px' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
