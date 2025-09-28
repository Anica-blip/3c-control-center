// /src/schedulecomponent/ScheduleComponent.tsx - DEFENSIVE ERROR-FREE VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import ScheduleModal from './components/ScheduleModal';
import EditModal from './components/EditModal';
import { getTheme, getContainerStyle, getCSSAnimations } from './utils/styleUtils';
import { Calendar, Clock, Edit3, Trash2, RefreshCw, AlertCircle, CheckCircle, Play, X, ChevronLeft, ChevronRight, Save, XCircle, WifiOff } from 'lucide-react';
import { ScheduledPost, SavedTemplate, ErrorNotification, ApiError } from './types';
import { supabase } from './config'; // FIXED: Import from centralized config

// ✅ ERROR NOTIFICATION COMPONENT
const ErrorNotificationBanner: React.FC<{
  error: ApiError;
  onDismiss: () => void;
  onRetry?: () => void;
}> = ({ error, onDismiss, onRetry }) => {
  const { theme } = getTheme();
  
  const getErrorIcon = () => {
    switch (error.type) {
      case 'network': return <WifiOff style={{ height: '16px', width: '16px' }} />;
      case 'authorization': return <XCircle style={{ height: '16px', width: '16px' }} />;
      default: return <AlertCircle style={{ height: '16px', width: '16px' }} />;
    }
  };

  const getErrorColors = () => {
    if (error.type === 'network') {
      return {
        background: theme.warningBg,
        border: theme.warning,
        text: theme.warning
      };
    }
    return {
      background: theme.dangerBg,
      border: theme.danger,
      text: theme.danger
    };
  };

  const colors = getErrorColors();

  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: colors.background,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{ color: colors.border }}>
          {getErrorIcon()}
        </div>
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: '2px'
          }}>
            {error.type === 'network' ? 'Connection Issue' : 'Error'}
          </div>
          <div style={{
            fontSize: '13px',
            color: colors.text,
            opacity: 0.9
          }}>
            {error.message}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {error.retryable && onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: colors.border,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
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
            color: colors.text,
            cursor: 'pointer',
            opacity: 0.7
          }}
        >
          <X style={{ height: '14px', width: '14px' }} />
        </button>
      </div>
    </div>
  );
};

// ✅ SUCCESS NOTIFICATION COMPONENT
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

export default function ScheduleComponent() {
  // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY RETURNS
  const {
    posts: scheduledPosts,
    loading: postsLoading,
    error: postsError,
    createPost,
    updatePost,
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

  // ✅ ALL STATE HOOKS CALLED UNCONDITIONALLY
  const [activeTab, setActiveTab] = useState('pending');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  
  // ✅ ERROR HANDLING STATE
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const [operationStates, setOperationStates] = useState<Record<string, boolean>>({});

  // ✅ SIMPLIFIED CHARACTER PROFILE STATE - NO LONGER NEEDED
  const [characterProfiles, setCharacterProfiles] = useState<Record<string, any>>({});
  const [profilesLoading, setProfilesLoading] = useState<Record<string, boolean>>({});

  // ✅ THEME HOOK
  const { isDarkMode, theme } = getTheme();

  // ✅ DEFENSIVE UUID CHECK
  const isUUID = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // ✅ SIMPLIFIED CHARACTER PROFILE FETCHING - STILL KEEP FOR ADDITIONAL DATA
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
  }, []); // Remove characterProfiles dependency to prevent infinite loops

  // ✅ NOTIFICATION HELPERS
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

  // ✅ OPERATION LOADING STATES
  const setOperationLoading = useCallback((operation: string, loading: boolean) => {
    setOperationStates(prev => ({ ...prev, [operation]: loading }));
  }, []);

  const isOperationLoading = useCallback((operation: string) => {
    return operationStates[operation] || false;
  }, [operationStates]);

  // ✅ DEFENSIVE POST FILTERING
  const pendingPosts = (scheduledPosts || []).filter(p => p?.status === 'scheduled');
  const scheduledPostsFiltered = (scheduledPosts || []).filter(p => 
    p?.status && ['processing', 'publishing', 'published', 'failed'].includes(p.status)
  );
  const publishedPosts = (scheduledPosts || []).filter(p => p?.status === 'published');
  const failedPosts = (scheduledPosts || []).filter(p => p?.status === 'failed');

  // ✅ SIMPLIFIED CHARACTER PROFILE FETCHING - STILL FETCH FOR NAME/USERNAME/ROLE
  useEffect(() => {
    if (!pendingPosts?.length) return;
    
    pendingPosts.forEach(post => {
      if (post?.character_profile && typeof post.character_profile === 'string' && isUUID(post.character_profile)) {
        fetchCharacterProfile(post.character_profile);
      }
    });
  }, [pendingPosts.length, fetchCharacterProfile]); // Use length instead of full array

  // ✅ PLATFORM CONFIGURATION
  const platforms = [
    { id: '1', name: 'Telegram', icon: 'TG', color: '#3b82f6' },
    { id: '2', name: 'YouTube', icon: 'YT', color: '#ef4444' },
    { id: '3', name: 'Facebook', icon: 'FB', color: '#2563eb' },
    { id: '4', name: 'Twitter', icon: 'TW', color: '#0ea5e9' },
    { id: '5', name: 'Forum', icon: 'FR', color: '#4b5563' },
  ];

  // ✅ DEFENSIVE DESCRIPTION TRUNCATION
  const truncateDescription = (description: string = '', maxLength: number = 120) => {
    if (!description || description.length <= maxLength) return description;
    
    const truncated = description.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  };

  // ✅ DEFENSIVE PLATFORM ICON MAPPING
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

  // ✅ DEFENSIVE STATUS COLOR MAPPING
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'pending': 
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

  // ✅ DEFENSIVE STATUS ICON MAPPING
  const getStatusIcon = (status: string | undefined) => {
    const iconStyle = { height: '12px', width: '12px' };
    switch (status) {
      case 'pending':
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

  // ✅ DEFENSIVE DATE HELPERS
  const getPostsForDate = (date: Date) => {
    if (!scheduledPostsFiltered?.length) return [];
    return scheduledPostsFiltered.filter(post => {
      if (!post?.scheduled_date) return false;
      try {
        const postDate = new Date(post.scheduled_date);
        return postDate.toDateString() === date.toDateString();
      } catch {
        return false;
      }
    });
  };

  const getHourlyPostsForDay = (date: Date) => {
    const dayPosts = getPostsForDate(date);
    const hourlyPosts: { [key: number]: ScheduledPost[] } = {};
    
    for (let hour = 0; hour < 24; hour++) {
      hourlyPosts[hour] = dayPosts.filter(post => {
        try {
          return new Date(post.scheduled_date).getHours() === hour;
        } catch {
          return false;
        }
      });
    }
    
    return hourlyPosts;
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const formatCalendarTitle = () => {
    try {
      if (calendarView === 'day') {
        return currentDate.toLocaleDateString('en-GB', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } else if (calendarView === 'week') {
        const weekDates = getWeekDates(currentDate);
        const start = weekDates[0]?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const end = weekDates[6]?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        return `${start} - ${end}, ${weekDates[0]?.getFullYear()}`;
      } else {
        return currentDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
      }
    } catch {
      return 'Invalid Date';
    }
  };

  // ✅ DEFENSIVE EVENT HANDLERS
  const handleSchedulePost = (post: ScheduledPost) => {
    setSelectedPost(post);
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async (scheduleData: {
    scheduledDate: string;
    timezone: string;
    repeatOption?: string;
  }) => {
    if (!selectedPost) return;
    
    const operationKey = `schedule-${selectedPost.id}`;
    setOperationLoading(operationKey, true);
    
    try {
      const scheduledPostData = {
        ...selectedPost,
        scheduled_date: new Date(scheduleData.scheduledDate),
        status: 'scheduled' as const
      };

      const result = await createPost(scheduledPostData);
      
      if (result.success) {
        setIsScheduleModalOpen(false);
        setSelectedPost(null);
        showSuccess('Post scheduled successfully!');
        await refreshPosts();
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
        status: 'scheduled' as const
      };
      
      const result = await updatePost(postId, safeUpdates);
      
      if (result.success) {
        setIsEditModalOpen(false);
        setEditingPost(null);
        showSuccess('Post updated successfully!');
        await refreshPosts();
      } else {
        if (result.validationErrors?.length) {
          const errorMsg = result.validationErrors.map(e => e.message).join(', ');
          showError({ 
            ...result.error!, 
            message: `Validation failed: ${errorMsg}` 
          });
        } else {
          showError(result.error!, () => handleSaveEdit(postId, updates));
        }
      }
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
      const result = await deletePost(postId);
      
      if (result.success) {
        showSuccess('Post removed from dashboard successfully!');
        await refreshPosts();
      } else {
        showError(result.error!, () => handleDeletePost(postId));
      }
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
        status: 'scheduled' as const,
        user_id: template.user_id,
        created_by: template.created_by,
        is_from_template: true,
        source_template_id: template.id
      };

      const result = await createPost(pendingPostData);
      
      if (result.success) {
        await incrementUsage(template.id);
        setActiveTab('pending');
        await refreshPosts();
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
        status: 'scheduled' as const,
        user_id: post.user_id || '',
        created_by: post.created_by || ''
      };

      const result = await createPost(pendingPostData);
      
      if (result.success) {
        await refreshPosts();
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

  // ✅ TAB CONFIGURATION
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
            onRetry={refreshPosts}
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
              {(scheduledPosts || []).filter(p => p?.status === 'scheduled').length}
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
                            marginBottom: '12px'
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
                            
                            {/* FIXED: Character Profile Display - Use character_avatar directly */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              {post.character_avatar && (
                                <img 
                                  src={post.character_avatar} 
                                  alt={profileData?.name || 'Profile'}
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                  }}
                                />
                              )}
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1px'
                              }}>
                                {profileData?.name && (
                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: theme.text,
                                    lineHeight: '1.1'
                                  }}>
                                    {profileData.name}
                                  </span>
                                )}
                                {profileData?.username && (
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    color: theme.primary,
                                    lineHeight: '1.1'
                                  }}>
                                    {profileData.username}
                                  </span>
                                )}
                                {profileData?.role && (
                                  <span style={{
                                    fontSize: '10px',
                                    color: theme.textSecondary,
                                    lineHeight: '1.1'
                                  }}>
                                    {profileData.role}
                                  </span>
                                )}
                              </div>
                              {isProfileLoading && (
                                <div style={{
                                  width: '10px',
                                  height: '10px',
                                  border: `1px solid ${theme.border}`,
                                  borderTop: `1px solid ${theme.primary}`,
                                  borderRadius: '50%',
                                  animation: 'spin 1s linear infinite'
                                }} />
                              )}
                            </div>
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
                                {(post.selected_platforms || []).map((platformId, idx) => {
                                  const platform = getPlatformIcon(platformId);
                                  return (
                                    <span
                                      key={idx}
                                      style={{
                                        padding: '4px 6px',
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
                        minHeight: '80px',
                        opacity: isCurrentMonth ? 1 : 0.5
                      }}
                    >
                      <div style={{
                        fontSize: '12px',
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isToday ? theme.primary : theme.text,
                        marginBottom: '4px'
                      }}>
                        {date.getDate()}
                      </div>
                      
                      {postsForDate.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}>
                          {postsForDate.slice(0, 3).map((post, idx) => {
                            const statusStyle = getStatusColor(post.status);
                            const borderParts = statusStyle.borderLeft.split(' ');
                            const statusColor = borderParts[2] || theme.primary;
                            
                            return (
                              <div
                                key={idx}
                                style={{
                                  padding: '2px 4px',
                                  backgroundColor: statusColor,
                                  borderRadius: '2px',
                                  fontSize: '10px',
                                  color: 'white',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {post.scheduled_date && new Date(post.scheduled_date).toLocaleTimeString('en-GB', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            );
                          })}
                          {postsForDate.length > 3 && (
                            <div style={{
                              fontSize: '10px',
                              color: theme.textSecondary,
                              textAlign: 'center'
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
                        minHeight: '200px'
                      }}
                    >
                      <div style={{
                        fontSize: '14px',
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isToday ? theme.primary : theme.text,
                        marginBottom: '12px',
                        textAlign: 'center'
                      }}>
                        {date.toLocaleDateString('en-GB', { 
                          weekday: 'short',
                          day: 'numeric' 
                        })}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        {postsForDate.map((post, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: theme.background,
                              border: getStatusColor(post.status).borderLeft,
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}
                          >
                            <div style={{
                              fontWeight: 'bold',
                              color: theme.text,
                              marginBottom: '2px'
                            }}>
                              {post.scheduled_date && new Date(post.scheduled_date).toLocaleTimeString('en-GB', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div style={{
                              color: theme.textSecondary,
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}>
                              {truncateDescription(post.description, 40)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                      minHeight: '60px'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      padding: '12px',
                      backgroundColor: theme.background,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: theme.textSecondary
                    }}>
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      {posts.map((post, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: theme.background,
                            border: getStatusColor(post.status).borderLeft,
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px'
                          }}>
                            <span style={{
                              fontWeight: 'bold',
                              color: theme.text
                            }}>
                              {post.scheduled_date && new Date(post.scheduled_date).toLocaleTimeString('en-GB', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {getStatusIcon(post.status)}
                            <span style={{
                              fontSize: '10px',
                              color: theme.textSecondary,
                              textTransform: 'capitalize'
                            }}>
                              {post.status}
                            </span>
                          </div>
                          <div style={{ color: theme.textSecondary }}>
                            {truncateDescription(post.description, 80)}
                          </div>
                        </div>
                      ))}
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
              display: 'flex',
              gap: '8px',
              marginBottom: '24px'
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
                .map((post) => (
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
                          marginBottom: '8px'
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
                        </div>
                        
                        <p style={{
                          fontSize: '14px',
                          color: theme.text,
                          margin: '0 0 8px 0',
                          lineHeight: '1.4'
                        }}>
                          {truncateDescription(post.description)}
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '12px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span style={{ color: theme.textSecondary }}>Platforms:</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {(post.selected_platforms || []).map((platformId, idx) => {
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
                ))}
              
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
          <div style={{ padding: '24px' }}>
            {(savedTemplates || []).length === 0 ? (
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
