// /src/schedulecomponent/ScheduleComponent.tsx - ENHANCED ERROR HANDLING
import React, { useState, useEffect } from 'react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import ScheduleModal from './components/ScheduleModal';
import EditModal from './components/EditModal';
import { getTabStyle, getTheme, getContainerStyle, getCSSAnimations } from './utils/styleUtils';
import { Calendar, Clock, Edit3, Trash2, RefreshCw, Eye, AlertCircle, CheckCircle, Play, X, Plus, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { ScheduledPost, SavedTemplate } from './types';

export default function ScheduleComponent() {
  // Use hooks for data management
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

  // ENHANCED ERROR STATE MANAGEMENT
  const [persistentError, setPersistentError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    source: string;
    timestamp: Date;
    fullMessage: string;
  } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // AGGREGATE AND PERSIST ERRORS
  useEffect(() => {
    const aggregatedError = postsError || templatesError;
    if (aggregatedError && aggregatedError !== persistentError) {
      const errorSource = postsError ? 'Posts Data' : 'Templates Data';
      setPersistentError(aggregatedError);
      setErrorDetails({
        source: errorSource,
        timestamp: new Date(),
        fullMessage: aggregatedError
      });
      setShowErrorModal(true);
    }
  }, [postsError, templatesError, persistentError]);

  // MANUAL ERROR DISMISSAL ONLY
  const handleErrorClose = () => {
    setPersistentError(null);
    setErrorDetails(null);
    setShowErrorModal(false);
  };

  // CRITICAL FIX: Early returns for loading/error states BEFORE any rendering
  if (postsLoading || templatesLoading) {
    return (
      <div style={{
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ 
            color: '#111827',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Loading Schedule Manager...
          </span>
        </div>
      </div>
    );
  }

  // ENHANCED ERROR DISPLAY WITH COMPLETE INFORMATION
  if (showErrorModal && errorDetails) {
    return (
      <div style={{
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          margin: '20px',
          padding: '32px',
          backgroundColor: '#fee2e2',
          borderRadius: '12px',
          border: '2px solid #fca5a5',
          boxShadow: '0 8px 25px rgba(220, 38, 38, 0.15)'
        }}>
          {/* Error Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertCircle style={{
                height: '32px',
                width: '32px',
                color: '#dc2626'
              }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#991b1b',
                margin: '0'
              }}>
                Schedule Manager Error
              </h3>
            </div>
            
            {/* MANUAL CLOSE BUTTON */}
            <button
              onClick={handleErrorClose}
              style={{
                padding: '8px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <X size={16} />
              Close
            </button>
          </div>

          {/* COMPLETE ERROR DETAILS */}
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#7f1d1d',
              marginBottom: '8px'
            }}>
              Error Source: {errorDetails.source}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#991b1b',
              marginBottom: '12px'
            }}>
              Timestamp: {errorDetails.timestamp.toLocaleString()}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#7f1d1d',
              lineHeight: '1.5',
              fontFamily: 'monospace',
              backgroundColor: 'white',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #fca5a5',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {errorDetails.fullMessage}
            </div>
          </div>

          {/* ERROR ACTIONS */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 20px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
            
            <button
              onClick={handleErrorClose}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                color: '#7f1d1d',
                border: '2px solid #dc2626',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UI state
  const [activeTab, setActiveTab] = useState('pending');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');

  // Get theme
  const { isDarkMode, colors: theme } = getTheme();

  // Filter posts by status for each tab
  const pendingPosts = scheduledPosts.filter(p => p.status === 'pending_schedule');
  const scheduledPostsFiltered = scheduledPosts.filter(p => 
    ['scheduled', 'processing', 'publishing', 'published', 'failed'].includes(p.status)
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
    return platform || { icon: 'UN', color: '#9ca3af' };
  };

  const getStatusColor = (status: string) => {
    if (isDarkMode) {
      switch (status) {
        case 'pending': return { borderLeft: '4px solid #f59e0b', backgroundColor: '#451a03' };
        case 'processing': return { borderLeft: '4px solid #3b82f6', backgroundColor: '#1e3a8a' };
        case 'complete': return { borderLeft: '4px solid #10b981', backgroundColor: '#14532d' };
        case 'failed': return { borderLeft: '4px solid #ef4444', backgroundColor: '#451a1a' };
        case 'resending': return { borderLeft: '4px solid #f97316', backgroundColor: '#7c2d12' };
        default: return { borderLeft: '4px solid #9ca3af', backgroundColor: '#334155' };
      }
    } else {
      switch (status) {
        case 'pending': return { borderLeft: '4px solid #f59e0b', backgroundColor: '#fefce8' };
        case 'processing': return { borderLeft: '4px solid #3b82f6', backgroundColor: '#dbeafe' };
        case 'complete': return { borderLeft: '4px solid #10b981', backgroundColor: '#d1fae5' };
        case 'failed': return { borderLeft: '4px solid #ef4444', backgroundColor: '#fee2e2' };
        case 'resending': return { borderLeft: '4px solid #f97316', backgroundColor: '#fed7aa' };
        default: return { borderLeft: '4px solid #9ca3af', backgroundColor: '#f9fafb' };
      }
    }
  };

  const getStatusIcon = (status: string) => {
    const iconStyle = { height: '12px', width: '12px' };
    switch (status) {
      case 'pending': return <Clock style={{...iconStyle, color: '#d97706'}} />;
      case 'processing': return <Play style={{...iconStyle, color: '#2563eb'}} />;
      case 'complete': return <CheckCircle style={{...iconStyle, color: '#059669'}} />;
      case 'failed': return <AlertCircle style={{...iconStyle, color: '#dc2626'}} />;
      case 'resending': return <RefreshCw style={{...iconStyle, color: '#ea580c'}} />;
      default: return null;
    }
  };

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

  // Event handlers with error boundaries
  const handleSchedulePost = async (post: ScheduledPost) => {
    try {
      setSelectedPost(post);
      setIsScheduleModalOpen(true);
    } catch (error) {
      const errorMsg = `Failed to open schedule modal: ${error instanceof Error ? error.message : String(error)}`;
      setErrorDetails({
        source: 'Schedule Modal',
        timestamp: new Date(),
        fullMessage: errorMsg
      });
      setShowErrorModal(true);
    }
  };

  const handleConfirmSchedule = async (scheduleData: {
    scheduledDate: string;
    timezone: string;
    repeatOption?: string;
  }) => {
    try {
      if (!selectedPost) return;
      
      const updatedPost = {
        ...selectedPost,
        scheduled_date: new Date(scheduleData.scheduledDate),
        status: 'scheduled' as const
      };

      await updatePost(selectedPost.id, updatedPost);
      
      setIsScheduleModalOpen(false);
      setSelectedPost(null);
      await refreshPosts();
    } catch (error) {
      const errorMsg = `Failed to schedule post: ${error instanceof Error ? error.message : String(error)}`;
      setErrorDetails({
        source: 'Post Scheduling',
        timestamp: new Date(),
        fullMessage: errorMsg
      });
      setShowErrorModal(true);
    }
  };

  const handleEditPost = async (post: ScheduledPost) => {
    try {
      setEditingPost(post);
      setIsEditModalOpen(true);
    } catch (error) {
      const errorMsg = `Failed to open edit modal: ${error instanceof Error ? error.message : String(error)}`;
      setErrorDetails({
        source: 'Edit Modal',
        timestamp: new Date(),
        fullMessage: errorMsg
      });
      setShowErrorModal(true);
    }
  };

  const handleSaveEdit = async (postId: string, updates: Partial<ScheduledPost>) => {
    try {
      await updatePost(postId, updates);
      setIsEditModalOpen(false);
      setEditingPost(null);
      await refreshPosts();
    } catch (error) {
      const errorMsg = `Failed to update post: ${error instanceof Error ? error.message : String(error)}`;
      setErrorDetails({
        source: 'Post Update',
        timestamp: new Date(),
        fullMessage: errorMsg
      });
      setShowErrorModal(true);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        await refreshPosts();
      } catch (error) {
        const errorMsg = `Failed to delete post: ${error instanceof Error ? error.message : String(error)}`;
        setErrorDetails({
          source: 'Post Deletion',
          timestamp: new Date(),
          fullMessage: errorMsg
        });
        setShowErrorModal(true);
      }
    }
  };

  const handleSaveAsTemplate = async (post: ScheduledPost) => {
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

      await createTemplate(templateData);
      alert('Post saved as template successfully!');
    } catch (error) {
      const errorMsg = `Failed to save template: ${error instanceof Error ? error.message : String(error)}`;
      setErrorDetails({
        source: 'Template Creation',
        timestamp: new Date(),
        fullMessage: errorMsg
      });
      setShowErrorModal(true);
    }
  };

  const handleUseTemplate = async (template: SavedTemplate) => {
    try {
      // Create a new pending post from the template
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
        status: 'pending_schedule' as const,
        user_id: template.user_id,
        created_by: template.created_by,
        is_from_template: true,
        source_template_id: template.id
      };

      await createPost(pendingPostData);
      await incrementUsage(template.id);
      
      // Switch to pending tab to show the new post
      setActiveTab('pending');
      await refreshPosts();
      
      alert('Template added to Pending Schedules!');
    } catch (error) {
      const errorMsg = `Failed to use template: ${error instanceof Error ? error.message : String(error)}`;
      setErrorDetails({
        source: 'Template Usage',
        timestamp: new Date(),
        fullMessage: errorMsg
      });
      setShowErrorModal(true);
    }
  };

  const handleCopyToPending = async (post: ScheduledPost) => {
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
        status: 'pending_schedule' as const,
        user_id: post.user_id || '',
        created_by: post.created_by || ''
      };

      await createPost(pendingPostData);
      await refreshPosts();
      
      alert('Post copied to Pending Scheduling for modification!');
    } catch (error) {
      const errorMsg = `Failed to copy post: ${error instanceof Error ? error.message : String(error)}`;
      setErrorDetails({
        source: 'Post Copy',
        timestamp: new Date(),
        fullMessage: errorMsg
      });
      setShowErrorModal(true);
    }
  };

  // ORIGINAL TAB RENDER FUNCTIONS RESTORED

  const renderDayView = () => {
    const hourlyPosts = getHourlyPostsForDay(currentDate);
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr',
        gap: '1px',
        backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div style={{
              padding: '12px 8px',
              backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              textAlign: 'right',
              fontWeight: 'bold'
            }}>
              {hour === 0 ? '00:00' : hour < 10 ? `0${hour}:00` : `${hour}:00`}
            </div>
            <div style={{
              minHeight: '60px',
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
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
                    color: isDarkMode ? '#e2e8f0' : '#111827',
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
                    <span style={{ fontSize: '10px', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>
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
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
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
        backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
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
                backgroundColor: isDarkMode ? '#1e293b' : 'white',
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
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  fontWeight: 'bold'
                }}>
                  {dayNames[idx]}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: isToday ? '#2563eb' : (isCurrentMonth ? (isDarkMode ? '#e2e8f0' : '#111827') : (isDarkMode ? '#64748b' : '#9ca3af')),
                  backgroundColor: isToday ? (isDarkMode ? '#1e3a8a' : '#dbeafe') : 'transparent',
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
                      color: isDarkMode ? '#e2e8f0' : '#111827',
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
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
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
          backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
          borderRadius: '8px 8px 0 0',
          overflow: 'hidden'
        }}>
          {dayNames.map((day) => (
            <div
              key={day}
              style={{
                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                padding: '12px 8px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: isDarkMode ? '#e2e8f0' : '#374151'
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
          backgroundColor: isDarkMode ? '#475569' : '#e5e7eb'
        }}>
          {monthDates.map((date) => {
            const dayPosts = getPostsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={date.toISOString()}
                style={{
                  backgroundColor: isDarkMode ? '#1e293b' : 'white',
                  minHeight: '120px',
                  padding: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentDate(new Date(date))}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isToday ? '#2563eb' : (isCurrentMonth ? (isDarkMode ? '#e2e8f0' : '#111827') : (isDarkMode ? '#64748b' : '#9ca3af')),
                  marginBottom: '4px',
                  textAlign: 'right'
                }}>
                  {isToday && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#2563eb',
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
                        color: isDarkMode ? '#e2e8f0' : '#111827',
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
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
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
          color: isDarkMode ? '#94a3b8' : '#6b7280'
        }}>
          <Calendar style={{
            height: '64px',
            width: '64px',
            color: isDarkMode ? '#475569' : '#d1d5db',
            margin: '0 auto 16px auto'
          }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: isDarkMode ? '#e2e8f0' : '#111827',
            margin: '0 0 8px 0'
          }}>
            No scheduled posts yet
          </h3>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
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
        <div style={{ borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}` }}>
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
                  borderBottom: statusFilter === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  color: statusFilter === tab.id ? '#2563eb' : (isDarkMode ? '#94a3b8' : '#6b7280'),
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
                    backgroundColor: statusFilter === tab.id ? (isDarkMode ? '#1e3a8a' : '#dbeafe') : (isDarkMode ? '#374151' : '#f3f4f6'),
                    color: statusFilter === tab.id ? '#2563eb' : (isDarkMode ? '#94a3b8' : '#6b7280')
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
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
              border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
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
                        post.status === 'scheduled' ? (isDarkMode ? '#451a03' : '#fef3c7') :
                        post.status === 'processing' ? (isDarkMode ? '#1e3a8a' : '#dbeafe') :
                        post.status === 'published' ? (isDarkMode ? '#14532d' : '#d1fae5') :
                        post.status === 'failed' ? (isDarkMode ? '#451a1a' : '#fee2e2') : (isDarkMode ? '#7c2d12' : '#fed7aa'),
                      color:
                        post.status === 'scheduled' ? (isDarkMode ? '#fbbf24' : '#92400e') :
                        post.status === 'processing' ? (isDarkMode ? '#60a5fa' : '#1e40af') :
                        post.status === 'published' ? (isDarkMode ? '#4ade80' : '#065f46') :
                        post.status === 'failed' ? (isDarkMode ? '#f87171' : '#991b1b') : (isDarkMode ? '#fb923c' : '#9a3412')
                    }}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontWeight: 'bold'
                    }}>
                      {new Date(post.scheduled_date).toLocaleString('en-GB')}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#2563eb'
                    }}>
                      {post.character_profile}
                    </span>
                  </div>
                  
                  <p style={{
                    color: isDarkMode ? '#e2e8f0' : '#111827',
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
                      <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Platforms:</span>
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
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
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
                    style={{
                      padding: '8px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Edit"
                  >
                    <Edit3 style={{ height: '16px', width: '16px' }} />
                  </button>
                  
                  {post.status === 'published' && (
                    <button
                      onClick={() => handleSaveAsTemplate(post)}
                      style={{
                        padding: '8px',
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Save as Template"
                    >
                      <Save style={{ height: '16px', width: '16px' }} />
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyToPending(post)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="Copy to Pending Scheduling"
                  >
                    Copy
                  </button>
                  
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    style={{
                      padding: '8px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Delete"
                  >
                    <Trash2 style={{ height: '16px', width: '16px' }} />
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
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            padding: '32px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
            textAlign: 'center'
          }}>
            <Save style={{
              height: '48px',
              width: '48px',
              color: isDarkMode ? '#64748b' : '#9ca3af',
              margin: '0 auto 16px auto'
            }} />
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: isDarkMode ? '#e2e8f0' : '#111827',
              margin: '0 0 8px 0'
            }}>
              No Saved Templates
            </h3>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
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
                backgroundColor: isDarkMode ? '#1e293b' : 'white',
                border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
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
                    color: isDarkMode ? '#e2e8f0' : '#111827',
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
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
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
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Profile:</span>
                    <span style={{
                      fontWeight: 'bold',
                      color: '#2563eb'
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
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Type:</span>
                    <span style={{ color: isDarkMode ? '#e2e8f0' : '#111827', fontWeight: 'bold' }}>{template.template_type}</span>
                  </div>
                  
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Description:</span>
                    <p style={{
                      color: isDarkMode ? '#e2e8f0' : '#111827',
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
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Platforms:</span>
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
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
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
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontSize: '12px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Use Template
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
                backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                border: `1px solid ${isDarkMode ? '#1d4ed8' : '#93c5fd'}`,
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center'
              }}>
                <Clock style={{
                  height: '48px',
                  width: '48px',
                  color: '#3b82f6',
                  margin: '0 auto 16px auto'
                }} />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#93c5fd' : '#1e3a8a',
                  margin: '0 0 8px 0'
                }}>
                  Ready for Scheduling
                </h3>
                <p style={{
                  color: isDarkMode ? '#93c5fd' : '#1e40af',
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
                    backgroundColor: isDarkMode ? '#1e293b' : 'white',
                    border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
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
                            backgroundColor: isDarkMode ? '#f59e0b' : '#fed7aa',
                            color: isDarkMode ? '#000000' : '#9a3412',
                            borderRadius: '12px',
                            fontWeight: 'bold'
                          }}>
                            Ready to Schedule
                          </span>
                          <span style={{
                            fontSize: '12px',
                            color: isDarkMode ? '#94a3b8' : '#6b7280',
                            fontWeight: 'bold'
                          }}>
                            Created {new Date(post.created_at).toLocaleDateString('en-GB')}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#2563eb'
                          }}>
                            {post.character_profile}
                          </span>
                        </div>
                        
                        <p style={{
                          color: isDarkMode ? '#e2e8f0' : '#111827',
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
                            <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Platforms:</span>
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
                          style={{
                            padding: '8px 16px',
                            backgroundColor: isDarkMode ? '#475569' : '#4b5563',
                            color: 'white',
                            fontSize: '12px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSchedulePost(post)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          style={{
                            padding: '8px',
                            color: isDarkMode ? '#94a3b8' : '#6b7280',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Delete"
                        >
                          <Trash2 style={{ height: '16px', width: '16px' }} />
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
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    backgroundColor: 'transparent',
                    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft style={{ height: '16px', width: '16px' }} />
                </button>
                
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#e2e8f0' : '#111827',
                  margin: '0',
                  minWidth: '300px'
                }}>
                  {formatCalendarTitle()}
                </h2>
                
                <button
                  onClick={() => navigateCalendar('next')}
                  style={{
                    padding: '8px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    backgroundColor: 'transparent',
                    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
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
                    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                    color: isDarkMode ? '#e2e8f0' : '#374151',
                    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Today
                </button>
                
                <div style={{
                  display: 'flex',
                  backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
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
                        backgroundColor: calendarView === view ? (isDarkMode ? '#1e293b' : 'white') : 'transparent',
                        color: calendarView === view ? (isDarkMode ? '#e2e8f0' : '#111827') : (isDarkMode ? '#94a3b8' : '#6b7280'),
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
