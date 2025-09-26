// /src/schedulecomponent/ScheduleComponent.tsx - ENHANCED with error handling + THEME FIXES
import React, { useState, useEffect, useCallback } from 'react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import ScheduleModal from './components/ScheduleModal';
import EditModal from './components/EditModal';
import { getTabStyle, getTheme, getContainerStyle, getCSSAnimations } from './utils/styleUtils';
import { Calendar, Clock, Edit3, Trash2, RefreshCw, Eye, AlertCircle, CheckCircle, Play, X, Plus, ChevronLeft, ChevronRight, Save, XCircle, WifiOff } from 'lucide-react';
import { ScheduledPost, SavedTemplate, ErrorNotification, ApiError } from './types';

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
  
  // ✅ NEW ERROR HANDLING STATE
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const [operationStates, setOperationStates] = useState<Record<string, boolean>>({});

  // ✅ ALL OTHER HOOKS
  const { isDarkMode, theme } = getTheme();

  // ✅ NOTIFICATION HELPERS
  const addNotification = useCallback((notification: Omit<ErrorNotification, 'id' | 'timestamp'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: ErrorNotification = {
      ...notification,
      id,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 5)); // Keep max 5 notifications
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

  // ✅ NOW CONDITIONAL RETURNS ARE SAFE - ALL HOOKS CALLED
  if (postsLoading || templatesLoading) {
    return (
      <div style={{
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '24px',
          backgroundColor: theme.cardBg,
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: `3px solid ${theme.border}`,
            borderTop: `3px solid ${theme.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ 
            color: theme.text,
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Loading Schedule Manager...
          </span>
        </div>
      </div>
    );
  }

  if (postsError || templatesError) {
    return (
      <div style={{
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background
      }}>
        <div style={{
          padding: '24px',
          backgroundColor: theme.dangerBg,
          borderRadius: '12px',
          border: `1px solid ${theme.danger}`,
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <AlertCircle style={{
            height: '48px',
            width: '48px',
            color: theme.danger,
            margin: '0 auto 16px auto'
          }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: theme.danger,
            margin: '0 0 8px 0'
          }}>
            Error Loading Schedule Manager
          </h3>
          <p style={{
            color: theme.danger,
            margin: '0 0 16px 0',
            fontSize: '14px'
          }}>
            {postsError?.message || templatesError?.message}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                refreshPosts();
                window.location.reload();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: theme.danger,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: theme.textSecondary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FIXED: Proper filtering - Pending ONLY from content_posts, Calendar ONLY from dashboard_posts
  const pendingPosts = scheduledPosts.filter(p => p.status === 'scheduled'); // From content_posts
  const scheduledPostsFiltered = scheduledPosts.filter(p => 
    ['processing', 'publishing', 'published', 'failed'].includes(p.status) // REMOVED 'scheduled' - only dashboard_posts
  );
  const publishedPosts = scheduledPosts.filter(p => p.status === 'published');
  const failedPosts = scheduledPosts.filter(p => p.status === 'failed');

  // Platform configuration
  const platforms = [
    { id: '1', name: 'Telegram', icon: 'TG', color: '#3b82f6' },
    { id: '2', name: 'YouTube', icon: 'YT', color: '#ef4444' },
    { id: '3', name: 'Facebook', icon: 'FB', color: '#2563eb' },
    { id: '4', name: 'Twitter', icon: 'TW', color: '#0ea5e9' },
    { id: '5', name: 'Forum', icon: 'FR', color: '#4b5563' },
  ];

  // Helper function to truncate description
  const truncateDescription = (description: string, maxLength: number = 120) => {
    if (description.length <= maxLength) return description;
    
    const truncated = description.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform || { icon: 'UN', color: theme.textSecondary };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { borderLeft: `4px solid ${theme.warning}`, backgroundColor: theme.warningBg };
      case 'processing': return { borderLeft: `4px solid ${theme.primary}`, backgroundColor: theme.primaryBg };
      case 'complete': return { borderLeft: `4px solid ${theme.success}`, backgroundColor: theme.successBg };
      case 'failed': return { borderLeft: `4px solid ${theme.danger}`, backgroundColor: theme.dangerBg };
      case 'resending': return { borderLeft: `4px solid ${theme.warning}`, backgroundColor: theme.warningBg };
      default: return { borderLeft: `4px solid ${theme.textSecondary}`, backgroundColor: theme.cardBg };
    }
  };

  const getStatusIcon = (status: string) => {
    const iconStyle = { height: '12px', width: '12px' };
    switch (status) {
      case 'pending': return <Clock style={{...iconStyle, color: theme.warning}} />;
      case 'processing': return <Play style={{...iconStyle, color: theme.primary}} />;
      case 'complete': return <CheckCircle style={{...iconStyle, color: theme.success}} />;
      case 'failed': return <AlertCircle style={{...iconStyle, color: theme.danger}} />;
      case 'resending': return <RefreshCw style={{...iconStyle, color: theme.warning}} />;
      default: return null;
    }
  };

  // Calendar helper functions remain the same...
  const getPostsForDate = (date: Date) => {
    return scheduledPostsFiltered.filter(post => {
      const postDate = new Date(post.scheduled_date);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const getHourlyPostsForDay = (date: Date) => {
    const dayPosts = getPostsForDate(date);
    const hourlyPosts: { [key: number]: ScheduledPost[] } = {};
    
    for (let hour = 0; hour < 24; hour++) {
      hourlyPosts[hour] = dayPosts.filter(post => new Date(post.scheduled_date).getHours() === hour);
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
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
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
    if (calendarView === 'day') {
      return currentDate.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (calendarView === 'week') {
      const weekDates = getWeekDates(currentDate);
      const start = weekDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const end = weekDates[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `${start} - ${end}, ${weekDates[0].getFullYear()}`;
    } else {
      return currentDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
    }
  };

  // ✅ ENHANCED EVENT HANDLERS WITH ERROR HANDLING
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
      // FIXED: Move post from content_posts to dashboard_posts with date/time
      const scheduledPostData = {
        ...selectedPost,
        scheduled_date: new Date(scheduleData.scheduledDate),
        status: 'scheduled' as const
      };

      // Use createPost (which calls createScheduledPost API) to move between tables
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
      const result = await updatePost(postId, updates);
      
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

  // FIXED: Delete function - Remove from dashboard view only
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

  // CALENDAR RENDER FUNCTIONS - KEEPING ORIGINAL LOGIC...
  const renderDayView = () => {
    const hourlyPosts = getHourlyPostsForDay(currentDate);
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr',
        gap: '1px',
        backgroundColor: theme.border,
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div style={{
              padding: '12px 8px',
              backgroundColor: theme.background,
              fontSize: '12px',
              color: theme.textSecondary,
              textAlign: 'right',
              fontWeight: 'bold'
            }}>
              {hour === 0 ? '00:00' : hour < 10 ? `0${hour}:00` : `${hour}:00`}
            </div>
            <div style={{
              minHeight: '60px',
              backgroundColor: theme.cardBg,
              padding: '8px',
              position: 'relative'
            }}>
              {hourlyPosts[hour]?.map((post, idx) => (
                <div
                  key={post.id}
                  style={{
                    padding: '6px 8px',
                    marginBottom: idx < hourlyPosts[hour].length - 1 ? '4px' : '0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: theme.text,
                    ...getStatusColor(post.status)
                  }}
                  title={`${post.description} - ${post.character_profile}`}
                  onClick={() => handleEditPost(post)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '2px'
                  }}>
                    {getStatusIcon(post.status)}
                    <span style={{ fontSize: '10px', color: theme.textSecondary }}>
                      {new Date(post.scheduled_date).toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false
                      })}
                    </span>
                  </div>
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {post.description}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: theme.textSecondary,
                    marginTop: '2px'
                  }}>
                    {post.character_profile}
                  </div>
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: theme.border,
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {weekDates.map((date, idx) => {
          const dayPosts = getPostsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          
          return (
            <div
              key={date.toISOString()}
              style={{
                backgroundColor: theme.cardBg,
                minHeight: '200px',
                padding: '8px'
              }}
            >
              <div style={{
                textAlign: 'center',
                marginBottom: '8px',
                padding: '4px'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: theme.textSecondary,
                  fontWeight: 'bold'
                }}>
                  {dayNames[idx]}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: isToday ? theme.primary : (isCurrentMonth ? theme.text : theme.textSecondary),
                  backgroundColor: isToday ? theme.primaryBg : 'transparent',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  {date.getDate()}
                </div>
              </div>
              
              <div style={{ display: 'grid', gap: '4px' }}>
                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      color: theme.text,
                      ...getStatusColor(post.status)
                    }}
                    title={`${post.description} - ${new Date(post.scheduled_date).toLocaleTimeString('en-GB', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false
                    })}`}
                    onClick={() => handleEditPost(post)}
                  >
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {post.description.length > 20 ? 
                        post.description.substring(0, 20) + '...' : 
                        post.description
                      }
                    </div>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <div style={{
                    padding: '4px 6px',
                    fontSize: '10px',
                    color: theme.textSecondary,
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    +{dayPosts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div>
        {/* Day headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: theme.border,
          borderRadius: '8px 8px 0 0',
          overflow: 'hidden'
        }}>
          {dayNames.map((day) => (
            <div
              key={day}
              style={{
                backgroundColor: theme.background,
                padding: '12px 8px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: theme.text
              }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: theme.border
        }}>
          {monthDates.map((date) => {
            const dayPosts = getPostsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={date.toISOString()}
                style={{
                  backgroundColor: theme.cardBg,
                  minHeight: '120px',
                  padding: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentDate(new Date(date))}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isToday ? theme.primary : (isCurrentMonth ? theme.text : theme.textSecondary),
                  marginBottom: '4px',
                  textAlign: 'right'
                }}>
                  {isToday && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: theme.primary,
                      borderRadius: '50%',
                      display: 'inline-block',
                      marginRight: '4px'
                    }} />
                  )}
                  {date.getDate()}
                </div>
                
                <div style={{ display: 'grid', gap: '2px' }}>
                  {dayPosts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      style={{
                        padding: '2px 4px',
                        borderRadius: '2px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        color: theme.text,
                        ...getStatusColor(post.status)
                      }}
                      title={`${post.description} - ${new Date(post.scheduled_date).toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false
                      })}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPost(post);
                      }}
                    >
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {post.description.length > 15 ? 
                          post.description.substring(0, 15) + '...' : 
                          post.description
                        }
                      </div>
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div style={{
                      padding: '2px 4px',
                      fontSize: '8px',
                      color: theme.textSecondary,
                      fontWeight: 'bold'
                    }}>
                      +{dayPosts.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStatusManagement = () => {
    const statusCounts = {
      all: scheduledPostsFiltered.length,
      scheduled: scheduledPostsFiltered.filter(p => p.status === 'scheduled').length,
      processing: scheduledPostsFiltered.filter(p => p.status === 'processing').length,
      published: scheduledPostsFiltered.filter(p => p.status === 'published').length,
      failed: scheduledPostsFiltered.filter(p => p.status === 'failed').length,
    };

    const filteredPosts = statusFilter === 'all' 
      ? scheduledPostsFiltered 
      : scheduledPostsFiltered.filter(post => post.status === statusFilter);

    const statusTabs = [
      { id: 'all', label: 'All Posts', count: statusCounts.all },
      { id: 'scheduled', label: 'Scheduled', count: statusCounts.scheduled },
      { id: 'processing', label: 'Processing', count: statusCounts.processing },
      { id: 'published', label: 'Published', count: statusCounts.published },
      { id: 'failed', label: 'Failed', count: statusCounts.failed },
    ];

    if (scheduledPostsFiltered.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: theme.textSecondary
        }}>
          <Calendar style={{
            height: '64px',
            width: '64px',
            color: theme.textSecondary,
            margin: '0 auto 16px auto'
          }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: theme.text,
            margin: '0 0 8px 0'
          }}>
            No scheduled posts yet
          </h3>
          <p style={{
            color: theme.textSecondary,
            maxWidth: '400px',
            margin: '0 auto',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            Posts will appear here once you schedule them from the Pending Scheduling tab. 
            Start by scheduling your first post!
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gap: '24px' }}>
        <div style={{ borderBottom: `1px solid ${theme.border}` }}>
          <div style={{
            display: 'flex',
            gap: '32px',
            overflowX: 'auto',
            marginBottom: '-1px'
          }}>
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '8px 4px',
                  borderBottom: statusFilter === tab.id ? `2px solid ${theme.primary}` : '2px solid transparent',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  color: statusFilter === tab.id ? theme.primary : theme.textSecondary,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    padding: '2px 8px',
                    fontSize: '12px',
                    borderRadius: '12px',
                    backgroundColor: statusFilter === tab.id ? theme.primaryBg : theme.background,
                    color: statusFilter === tab.id ? theme.primary : theme.textSecondary
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredPosts.map((post) => (
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
                      padding: '6px 12px',
                      fontSize: '12px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 
                        post.status === 'scheduled' ? theme.warningBg :
                        post.status === 'processing' ? theme.primaryBg :
                        post.status === 'published' ? theme.successBg :
                        post.status === 'failed' ? theme.dangerBg : theme.warningBg,
                      color:
                        post.status === 'scheduled' ? theme.warning :
                        post.status === 'processing' ? theme.primary :
                        post.status === 'published' ? theme.success :
                        post.status === 'failed' ? theme.danger : theme.warning
                    }}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: theme.textSecondary,
                      fontWeight: 'bold'
                    }}>
                      {new Date(post.scheduled_date).toLocaleString('en-GB')}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: theme.primary
                    }}>
                      {post.character_profile}
                    </span>
                  </div>
                  
                  <p style={{
                    color: theme.text,
                    marginBottom: '12px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    fontWeight: 'bold',
                    margin: '0 0 12px 0'
                  }}>
                    {post.description}
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
                        {post.selected_platforms?.map((platformId, idx) => {
                          const platform = getPlatformIcon(platformId);
                          return (
                            <span
                              key={idx}
                              style={{
                                padding: '4px 8px',
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
                    
                    {post.media_files && post.media_files.length > 0 && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: theme.textSecondary,
                        fontWeight: 'bold'
                      }}>
                        <Eye style={{ height: '14px', width: '14px' }} />
                        <span>{post.media_files.length} file(s)</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginLeft: '24px'
                }}>
                  <button
                    onClick={() => handleEditPost(post)}
                    disabled={isOperationLoading(`edit-${post.id}`)}
                    style={{
                      padding: '8px',
                      color: theme.textSecondary,
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isOperationLoading(`edit-${post.id}`) ? 'not-allowed' : 'pointer',
                      opacity: isOperationLoading(`edit-${post.id}`) ? 0.5 : 1
                    }}
                    title="Edit"
                  >
                    <Edit3 style={{ height: '16px', width: '16px' }} />
                  </button>
                  
                  {post.status === 'published' && (
                    <button
                      onClick={() => handleSaveAsTemplate(post)}
                      disabled={isOperationLoading(`save-template-${post.id}`)}
                      style={{
                        padding: '8px',
                        color: theme.textSecondary,
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isOperationLoading(`save-template-${post.id}`) ? 'not-allowed' : 'pointer',
                        opacity: isOperationLoading(`save-template-${post.id}`) ? 0.5 : 1
                      }}
                      title="Save as Template"
                    >
                      {isOperationLoading(`save-template-${post.id}`) ? (
                        <RefreshCw style={{ height: '16px', width: '16px', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Save style={{ height: '16px', width: '16px' }} />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyToPending(post)}
                    disabled={isOperationLoading(`copy-${post.id}`)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: isOperationLoading(`copy-${post.id}`) ? theme.background : theme.primaryBg,
                      color: isOperationLoading(`copy-${post.id}`) ? theme.textSecondary : theme.primary,
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: isOperationLoading(`copy-${post.id}`) ? 'not-allowed' : 'pointer'
                    }}
                    title="Copy to Pending Scheduling"
                  >
                    {isOperationLoading(`copy-${post.id}`) ? 'Copying...' : 'Copy'}
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
          ))}
        </div>
      </div>
    );
  };

  const renderSavedTemplates = () => {
    return (
      <div style={{ display: 'grid', gap: '24px' }}>
        {savedTemplates.length === 0 ? (
          <div style={{
            backgroundColor: theme.cardBg,
            padding: '32px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
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
              color: theme.text,
              margin: '0 0 8px 0'
            }}>
              No Saved Templates
            </h3>
            <p style={{
              color: theme.textSecondary,
              fontSize: '12px',
              fontWeight: 'bold',
              margin: '0'
            }}>
              Save templates from Status Management to reuse them here.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            {savedTemplates.map((template) => (
              <div key={template.id} style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: theme.text,
                    margin: '0'
                  }}>
                    {template.template_name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          deleteTemplate(template.id);
                        }
                      }}
                      style={{
                        padding: '4px',
                        color: theme.textSecondary,
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Delete Template"
                    >
                      <Trash2 style={{ height: '14px', width: '14px' }} />
                    </button>
                  </div>
                </div>
                
                <div style={{
                  display: 'grid',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Profile:</span>
                    <span style={{
                      fontWeight: 'bold',
                      color: theme.primary
                    }}>
                      {template.character_profile}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Type:</span>
                    <span style={{ color: theme.text, fontWeight: 'bold' }}>{template.template_type}</span>
                  </div>
                  
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Description:</span>
                    <p style={{
                      color: theme.text,
                      marginTop: '4px',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      fontWeight: 'bold',
                      margin: '4px 0 0 0'
                    }}>
                      {truncateDescription(template.description)}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Platforms:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {template.selected_platforms?.map((platformId, idx) => {
                        const platformInfo = getPlatformIcon(platformId);
                        return (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 6px',
                              borderRadius: '4px',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              backgroundColor: platformInfo.color
                            }}
                          >
                            {platformInfo.icon}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '11px',
                    color: theme.textSecondary,
                    fontWeight: 'bold'
                  }}>
                    Used {template.usage_count} times
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    disabled={isOperationLoading(`use-template-${template.id}`)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: isOperationLoading(`use-template-${template.id}`) ? theme.textSecondary : theme.primary,
                      color: 'white',
                      fontSize: '12px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: isOperationLoading(`use-template-${template.id}`) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {isOperationLoading(`use-template-${template.id}`) && (
                      <RefreshCw style={{ height: '12px', width: '12px', animation: 'spin 1s linear infinite' }} />
                    )}
                    {isOperationLoading(`use-template-${template.id}`) ? 'Using...' : 'Use Template'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Tab configuration
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
      count: savedTemplates.length
    }
  ];

  return (
    <div style={getContainerStyle(isDarkMode)}>
      {/* Header */}
      <div style={{
        marginBottom: '32px'
      }}>
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

      {/* ✅ ERROR NOTIFICATIONS */}
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

      {/* Compact Status Summary */}
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
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme.primary
            }}>
              {pendingPosts.length}
            </div>
            <span style={{ fontSize: '13px', color: theme.textSecondary }}>Pending</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme.success
            }}>
              {scheduledPosts.filter(p => p.status === 'scheduled').length}
            </div>
            <span style={{ fontSize: '13px', color: theme.textSecondary }}>Scheduled</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme.success
            }}>
              {publishedPosts.length}
            </div>
            <span style={{ fontSize: '13px', color: theme.textSecondary }}>Published</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme.danger
            }}>
              {failedPosts.length}
            </div>
            <span style={{ fontSize: '13px', color: theme.textSecondary }}>Failed</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Light Blue Bar Style */}
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
                {pendingPosts.map((post) => (
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
                          <span style={{
                            fontSize: '12px',
                            color: theme.textSecondary,
                            fontWeight: 'bold'
                          }}>
                            Created {new Date(post.created_date).toLocaleDateString('en-GB')}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: theme.primary
                          }}>
                            {post.character_profile}
                          </span>
                        </div>
                        
                        <p style={{
                          color: theme.text,
                          fontSize: '14px',
                          lineHeight: '1.5',
                          fontWeight: 'bold',
                          margin: '0 0 16px 0'
                        }}>
                          {post.description}
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
                              {post.selected_platforms?.map((platformId, idx) => {
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
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'calendar' && (
          <div style={{ padding: '24px' }}>
            {/* Calendar Header */}
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
                    color: theme.textSecondary,
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft style={{ height: '16px', width: '16px' }} />
                </button>
                
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: theme.text,
                  margin: '0',
                  minWidth: '300px'
                }}>
                  {formatCalendarTitle()}
                </h2>
                
                <button
                  onClick={() => navigateCalendar('next')}
                  style={{
                    padding: '8px',
                    color: theme.textSecondary,
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight style={{ height: '16px', width: '16px' }} />
                </button>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Today
                </button>
                
                <div style={{
                  display: 'flex',
                  backgroundColor: theme.background,
                  borderRadius: '6px',
                  padding: '2px'
                }}>
                  {(['day', 'week', 'month'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setCalendarView(view)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: calendarView === view ? theme.cardBg : 'transparent',
                        color: calendarView === view ? theme.text : theme.textSecondary,
                        boxShadow: calendarView === view ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                      }}
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Calendar Content */}
            <div style={{ marginBottom: '16px' }}>
              {calendarView === 'day' && renderDayView()}
              {calendarView === 'week' && renderWeekView()}
              {calendarView === 'month' && renderMonthView()}
            </div>
          </div>
        )}
        
        {activeTab === 'status' && (
          <div style={{ padding: '24px' }}>
            {renderStatusManagement()}
          </div>
        )}
        
        {activeTab === 'saved' && (
          <div style={{ padding: '24px' }}>
            {renderSavedTemplates()}
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
        />
      )}

      {/* CSS Animations */}
      <style>{getCSSAnimations()}</style>
    </div>
  );
}
