// /src/schedulecomponent/ScheduleComponent.tsx - UNIFIED with 4 Internal Sections
import React, { useState, useEffect, useMemo } from 'react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import { getTabStyle, getTheme, getContainerStyle, getCSSAnimations } from './utils/styleUtils';
import { formatDate, formatTime, getRelativeTime, addMinutes, isValidDate } from './utils/dateUtils';
import { getPlatformIcon, formatPlatformList } from './utils/platformUtils';
import { getStatusColor, getStatusIcon, getStatusDisplayInfo, getStatusCounts, filterPostsByStatus } from './utils/statusUtils';
import { Clock, Calendar, CheckCircle, Save, Play, Edit, Trash2, Eye, X, AlertCircle, User, Hash, Plus, ChevronLeft, ChevronRight, Search, Filter, Star, TrendingUp, RefreshCw } from 'lucide-react';
import { ScheduledPost, SavedTemplate, MediaFile } from './types';

export default function ScheduleComponent() {
  // Data Management Hooks
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

  // UI State Management
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  
  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Template State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  
  // Schedule Modal State
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timezone, setTimezone] = useState('UTC+1');
  const [repeatOption, setRepeatOption] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get theme
  const { isDarkMode } = getTheme();

  // Initialize with current date/time + 1 hour for scheduling
  useEffect(() => {
    const now = new Date();
    const oneHourLater = addMinutes(now, 60);
    
    setSelectedDate(oneHourLater.toISOString().split('T')[0]);
    setSelectedTime(oneHourLater.toTimeString().split(' ')[0].slice(0, 5));
    
    // Set UK timezone
    setTimezone('UTC+1');
  }, []);

  // Filter posts by status for each section
  const pendingPosts = scheduledPosts.filter(p => p.status === 'pending_schedule');
  const scheduledPostsFiltered = scheduledPosts.filter(p => 
    ['scheduled', 'processing', 'published', 'failed'].includes(p.status)
  );

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks worth of days (42 days)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.setDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Group posts by date for calendar
  const postsByDate = useMemo(() => {
    const grouped: { [key: string]: ScheduledPost[] } = {};
    
    scheduledPostsFiltered.forEach(post => {
      if (post.scheduled_date) {
        const dateKey = formatDate(post.scheduled_date, { year: 'numeric', month: '2-digit', day: '2-digit' });
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(post);
      }
    });
    
    // Sort posts by time within each date
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => 
        new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
      );
    });
    
    return grouped;
  }, [scheduledPostsFiltered]);

  // Filter templates for search
  const filteredTemplates = useMemo(() => {
    let filtered = savedTemplates.filter(template => template.is_active);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.template_name.toLowerCase().includes(term) ||
        template.description.toLowerCase().includes(term) ||
        template.theme.toLowerCase().includes(term) ||
        template.audience.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [savedTemplates, searchTerm]);

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
      label: 'Status Manager', 
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

  // Event Handlers
  const handleSchedulePost = (post: ScheduledPost) => {
    setSelectedPost(post);
    setIsScheduleModalOpen(true);
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
      console.error('Failed to schedule post:', error);
    }
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (postId: string, updates: Partial<ScheduledPost>) => {
    try {
      await updatePost(postId, updates);
      setIsEditModalOpen(false);
      setEditingPost(null);
      await refreshPosts();
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        await refreshPosts();
      } catch (error) {
        console.error('Failed to delete post:', error);
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
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
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
      
      // Switch to pending tab
      setActiveTab('pending');
      await refreshPosts();
      
      alert('Template added to Pending Schedules!');
    } catch (error) {
      console.error('Failed to use template:', error);
      alert('Failed to use template. Please try again.');
    }
  };

  const handleUpdateStatus = async (postId: string, newStatus: string) => {
    try {
      await updatePost(postId, { status: newStatus });
      await refreshPosts();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleRetryPost = async (postId: string) => {
    try {
      const post = scheduledPosts.find(p => p.id === postId);
      if (post) {
        await updatePost(postId, { 
          status: 'scheduled',
          retry_count: (post.retry_count || 0) + 1,
          last_attempt: new Date()
        });
        await refreshPosts();
      }
    } catch (error) {
      console.error('Failed to retry post:', error);
    }
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getPostsForDay = (date: Date) => {
    const dateKey = formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
    return postsByDate[dateKey] || [];
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Quick schedule options
  const getQuickScheduleOptions = () => {
    const now = new Date();
    return [
      { label: 'In 1 hour', value: addMinutes(now, 60) },
      { label: 'In 2 hours', value: addMinutes(now, 120) },
      { label: 'Tomorrow 9 AM', value: (() => {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
      })() },
      { label: 'Next Monday 9 AM', value: (() => {
        const nextMonday = new Date(now);
        const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7;
        nextMonday.setDate(now.getDate() + daysUntilMonday);
        nextMonday.setHours(9, 0, 0, 0);
        return nextMonday;
      })() }
    ];
  };

  const handleQuickSchedule = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setSelectedTime(date.toTimeString().split(' ')[0].slice(0, 5));
  };

  const validateDateTime = () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return false;
    }

    const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();

    if (!isValidDate(scheduledDateTime)) {
      setError('Invalid date or time selected');
      return false;
    }

    if (scheduledDateTime <= now) {
      setError('Scheduled time must be in the future');
      return false;
    }

    // Check if scheduling too far in advance (1 year limit)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (scheduledDateTime > oneYearFromNow) {
      setError('Cannot schedule more than 1 year in advance');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmitSchedule = async () => {
    if (!validateDateTime()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      await handleConfirmSchedule({
        scheduledDate: scheduledDateTime.toISOString(),
        timezone: timezone,
        repeatOption: repeatOption !== 'none' ? repeatOption : undefined
      });
    } catch (err) {
      setError('Failed to schedule post. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={getContainerStyle(isDarkMode)}>
      {/* Status Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: isDarkMode ? '#60a5fa' : '#2563eb'
          }}>
            {pendingPosts.length}
          </div>
          <div style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            Pending Schedule
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: isDarkMode ? '#10b981' : '#059669'
          }}>
            {scheduledPosts.filter(p => p.status === 'scheduled').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            Scheduled
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: isDarkMode ? '#22c55e' : '#16a34a'
          }}>
            {scheduledPosts.filter(p => p.status === 'published').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            Published
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: isDarkMode ? '#ef4444' : '#dc2626'
          }}>
            {scheduledPosts.filter(p => p.status === 'failed').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            Failed
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        marginBottom: '24px'
      }}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...getTabStyle(tab.id, activeTab, isDarkMode),
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <IconComponent size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                  color: isDarkMode ? '#60a5fa' : '#1e40af',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div>
        {/* SECTION 1: PENDING SCHEDULES */}
        {activeTab === 'pending' && (
          <div>
            {/* Section Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: isDarkMode ? '#60a5fa' : '#2563eb'
                }}>
                  Pending Schedules
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  margin: '0'
                }}>
                  {pendingPosts.length} posts awaiting schedule assignment
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
                color: isDarkMode ? '#60a5fa' : '#1e40af',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <Clock size={16} />
                {pendingPosts.length} Pending
              </div>
            </div>

            {/* Pending Posts List */}
            {postsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  border: `3px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                  borderTop: `3px solid ${isDarkMode ? '#3b82f6' : '#2563eb'}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Loading pending posts...</p>
              </div>
            ) : postsError ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#ef4444'
              }}>
                <p>Error loading posts: {postsError}</p>
              </div>
            ) : pendingPosts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: isDarkMode ? '#94a3b8' : '#6b7280'
              }}>
                <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  No Pending Posts
                </h3>
                <p style={{ fontSize: '14px', margin: '0' }}>
                  Posts from Content Manager will appear here for scheduling.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {pendingPosts.map((post) => (
                  <div key={post.id} style={{
                    backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                    border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* Post Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: isDarkMode ? '#f8fafc' : '#111827',
                          margin: '0 0 8px 0'
                        }}>
                          {post.title || 'Untitled Post'}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '12px',
                          color: isDarkMode ? '#94a3b8' : '#6b7280'
                        }}>
                          <span>ID: {post.content_id}</span>
                          <span>Created: {getRelativeTime(post.created_date)}</span>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            backgroundColor: getStatusColor(post.status, isDarkMode).bg,
                            color: getStatusColor(post.status, isDarkMode).text,
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {getStatusIcon(post.status)}
                            PENDING
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p style={{
                      fontSize: '14px',
                      color: isDarkMode ? '#e2e8f0' : '#4b5563',
                      lineHeight: '1.5',
                      margin: '0 0 12px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.description}
                    </p>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginBottom: '12px'
                      }}>
                        {post.hashtags.slice(0, 5).map((tag, index) => (
                          <span key={index} style={{
                            fontSize: '12px',
                            color: isDarkMode ? '#60a5fa' : '#2563eb',
                            backgroundColor: isDarkMode ? '#1e3a8a20' : '#dbeafe',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Platforms */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      marginBottom: '16px'
                    }}>
                      <span>Platforms:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {post.selected_platforms.slice(0, 3).map((platform, index) => (
                          <span key={index} style={{
                            backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}>
                            {platform}
                          </span>
                        ))}
                        {post.selected_platforms.length > 3 && (
                          <span>+{post.selected_platforms.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '16px',
                      borderTop: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
                    }}>
                      <div style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#94a3b8' : '#6b7280'
                      }}>
                        Character: {post.character_profile || 'Not set'}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditPost(post)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: isDarkMode ? '#94a3b8' : '#6b7280',
                            border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                        
                        <button
                          onClick={() => handleSchedulePost(post)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Play size={14} />
                          Schedule Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <div>
            {/* Calendar Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: isDarkMode ? '#60a5fa' : '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Calendar size={24} />
                  Schedule Calendar
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  margin: '0'
                }}>
                  View all scheduled posts in calendar format
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDarkMode ? '#60a5fa' : '#2563eb'
                }}>
                  <Clock size={16} />
                  {scheduledPostsFiltered.length} Scheduled
                </div>
                
                <button
                  onClick={goToToday}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Today
                </button>
              </div>
            </div>

            {/* Calendar Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <button
                onClick={goToPreviousMonth}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: isDarkMode ? '#94a3b8' : '#6b7280'
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDarkMode ? '#f8fafc' : '#111827',
                margin: '0',
                minWidth: '200px',
                textAlign: 'center'
              }}>
                {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </h3>

              <button
                onClick={goToNextMonth}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: isDarkMode ? '#94a3b8' : '#6b7280'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{
                  padding: '12px 8px',
                  backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day, index) => {
                const dayPosts = getPostsForDay(day);
                const isCurrentMonthDay = isCurrentMonth(day);
                const isTodayDay = isToday(day);
                
                return (
                  <div key={index} style={{
                    minHeight: '120px',
                    padding: '8px',
                    backgroundColor: isDarkMode ? '#1e293b' : 'white',
                    opacity: isCurrentMonthDay ? 1 : 0.4,
                    position: 'relative',
                    border: isTodayDay ? `2px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}` : 'none'
                  }}>
                    {/* Day Number */}
                    <div style={{
                      fontSize: '14px',
                      fontWeight: isTodayDay ? '700' : '500',
                      color: isTodayDay 
                        ? (isDarkMode ? '#60a5fa' : '#3b82f6')
                        : (isCurrentMonthDay 
                          ? (isDarkMode ? '#f8fafc' : '#111827')
                          : (isDarkMode ? '#64748b' : '#9ca3af')
                        ),
                      marginBottom: '4px'
                    }}>
                      {day.getDate()}
                    </div>

                    {/* Posts for this day */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {dayPosts.slice(0, 3).map(post => (
                        <div
                          key={post.id}
                          onClick={() => {
                            setSelectedPost(post);
                            setIsPostDetailOpen(true);
                          }}
                          style={{
                            padding: '4px 6px',
                            backgroundColor: getStatusColor(post.status, isDarkMode).bg,
                            color: getStatusColor(post.status, isDarkMode).text,
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            overflow: 'hidden'
                          }}
                        >
                          {getStatusIcon(post.status, 10)}
                          <span>{post.scheduled_date ? formatTime(post.scheduled_date) : ''}</span>
                          <span style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}>
                            {post.title || 'Untitled'}
                          </span>
                        </div>
                      ))}
                      
                      {dayPosts.length > 3 && (
                        <div style={{
                          padding: '2px 6px',
                          fontSize: '10px',
                          color: isDarkMode ? '#94a3b8' : '#6b7280',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}>
                          +{dayPosts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: STATUS MANAGER */}
        {activeTab === 'status' && (
          <div>
            {/* Status Manager Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: isDarkMode ? '#60a5fa' : '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle size={24} />
                  Status Manager
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  margin: '0'
                }}>
                  Monitor and manage post publishing status
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                color: isDarkMode ? '#60a5fa' : '#2563eb',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <TrendingUp size={16} />
                {scheduledPostsFiltered.length} Posts
              </div>
            </div>

            {/* Status Posts */}
            {scheduledPostsFiltered.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: isDarkMode ? '#94a3b8' : '#6b7280'
              }}>
                <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  No Posts to Manage
                </h3>
                <p style={{ fontSize: '14px', margin: '0' }}>
                  Scheduled posts will appear here for status monitoring.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {scheduledPostsFiltered.map((post) => (
                  <div key={post.id} style={{
                    backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                    border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    {/* Post Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: isDarkMode ? '#f8fafc' : '#111827',
                          margin: '0 0 8px 0'
                        }}>
                          {post.title || 'Untitled Post'}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '12px',
                          color: isDarkMode ? '#94a3b8' : '#6b7280'
                        }}>
                          <span>ID: {post.content_id}</span>
                          {post.scheduled_date && (
                            <span>Scheduled: {formatDate(post.scheduled_date)} {formatTime(post.scheduled_date)}</span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: getStatusColor(post.status, isDarkMode).bg,
                        color: getStatusColor(post.status, isDarkMode).text,
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {getStatusIcon(post.status)}
                        {post.status.replace('_', ' ')}
                      </div>
                    </div>

                    {/* Post Content */}
                    <p style={{
                      fontSize: '14px',
                      color: isDarkMode ? '#e2e8f0' : '#4b5563',
                      lineHeight: '1.5',
                      margin: '0 0 16px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.description}
                    </p>

                    {/* Failure Info */}
                    {post.status === 'failed' && post.failure_reason && (
                      <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#dc2626',
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          <AlertCircle size={16} />
                          Failure Reason
                        </div>
                        <p style={{
                          fontSize: '13px',
                          color: '#7f1d1d',
                          margin: '0'
                        }}>
                          {post.failure_reason}
                        </p>
                      </div>
                    )}

                    {/* Platforms */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      marginBottom: '16px'
                    }}>
                      <span>Platforms:</span>
                      <span>{formatPlatformList(post.selected_platforms)}</span>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '16px',
                      borderTop: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
                    }}>
                      <div style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#94a3b8' : '#6b7280'
                      }}>
                        {getStatusDisplayInfo(post.status).description}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Retry for failed posts */}
                        {post.status === 'failed' && (
                          <button
                            onClick={() => handleRetryPost(post.id)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <RefreshCw size={14} />
                            Retry
                          </button>
                        )}

                        {/* Save as Template for published posts */}
                        {post.status === 'published' && (
                          <button
                            onClick={() => handleSaveAsTemplate(post)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: isDarkMode ? '#10b981' : '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Save size={14} />
                            Save as Template
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setIsPostDetailOpen(true);
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'transparent',
                            border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: isDarkMode ? '#94a3b8' : '#6b7280',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'transparent',
                            border: `1px solid #ef4444`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: SAVED TEMPLATES */}
        {activeTab === 'saved' && (
          <div>
            {/* Templates Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: isDarkMode ? '#60a5fa' : '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Save size={24} />
                  Saved Templates
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  margin: '0'
                }}>
                  {savedTemplates.length} saved templates • Reuse successful content
                </p>
              </div>
            </div>

            {/* Search */}
            <div style={{
              marginBottom: '24px'
            }}>
              <div style={{
                position: 'relative',
                maxWidth: '400px'
              }}>
                <Search size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDarkMode ? '#94a3b8' : '#6b7280'
                }} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isDarkMode ? '#334155' : 'white',
                    color: isDarkMode ? '#f8fafc' : '#111827',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Templates List */}
            {templatesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  border: `3px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                  borderTop: `3px solid ${isDarkMode ? '#3b82f6' : '#2563eb'}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Loading templates...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: isDarkMode ? '#94a3b8' : '#6b7280'
              }}>
                <Save size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  {searchTerm ? 'No Matching Templates' : 'No Templates Yet'}
                </h3>
                <p style={{ fontSize: '14px', margin: '0' }}>
                  {searchTerm 
                    ? 'Try adjusting your search terms.'
                    : 'Save successful posts as templates from Status Manager.'
                  }
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {filteredTemplates.map((template) => (
                  <div key={template.id} style={{
                    backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                    border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* Template Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: isDarkMode ? '#f8fafc' : '#111827',
                          margin: '0 0 8px 0'
                        }}>
                          {template.template_name}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '12px',
                          color: isDarkMode ? '#94a3b8' : '#6b7280'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingUp size={12} />
                            {template.usage_count} uses
                          </div>
                          <div>
                            {getRelativeTime(template.updated_at)}
                          </div>
                        </div>
                      </div>

                      {/* Popular badge */}
                      {template.usage_count >= 5 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          <Star size={10} />
                          Popular
                        </div>
                      )}
                    </div>

                    {/* Template Content */}
                    <p style={{
                      fontSize: '14px',
                      color: isDarkMode ? '#e2e8f0' : '#4b5563',
                      lineHeight: '1.5',
                      margin: '0 0 16px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {template.description}
                    </p>

                    {/* Template Tags */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '16px'
                    }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        backgroundColor: isDarkMode ? '#1e3a8a20' : '#dbeafe',
                        color: isDarkMode ? '#60a5fa' : '#2563eb',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {template.theme.replace(/_/g, ' ')}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        backgroundColor: isDarkMode ? '#065f4620' : '#d1fae5',
                        color: isDarkMode ? '#10b981' : '#059669',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {template.template_type.replace(/_/g, ' ')}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {template.audience.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Platforms */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      marginBottom: '16px'
                    }}>
                      <span>Platforms:</span>
                      <span>{formatPlatformList(template.selected_platforms, 2)}</span>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      paddingTop: '16px',
                      borderTop: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
                    }}>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px',
                          backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        <Play size={14} />
                        Use Template
                      </button>

                      <button
                        onClick={() => setSelectedTemplate(template)}
                        style={{
                          padding: '10px',
                          backgroundColor: 'transparent',
                          border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: isDarkMode ? '#94a3b8' : '#6b7280'
                        }}
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this template?')) {
                            deleteTemplate(template.id);
                          }
                        }}
                        style={{
                          padding: '10px',
                          backgroundColor: 'transparent',
                          border: `1px solid #ef4444`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SCHEDULE MODAL */}
      {isScheduleModalOpen && selectedPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setIsScheduleModalOpen(false)}>
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            fontFamily: 'inherit'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDarkMode ? '#60a5fa' : '#2563eb',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calendar size={24} />
                Schedule Post
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Post Preview */}
            <div style={{
              backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
              border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: isDarkMode ? '#f8fafc' : '#111827',
                margin: '0 0 8px 0'
              }}>
                {selectedPost.title || 'Untitled Post'}
              </h3>
              <p style={{
                fontSize: '14px',
                color: isDarkMode ? '#e2e8f0' : '#4b5563',
                margin: '0 0 12px 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {selectedPost.description}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '12px',
                color: isDarkMode ? '#94a3b8' : '#6b7280'
              }}>
                <span>ID: {selectedPost.content_id}</span>
                <span>Platforms: {selectedPost.selected_platforms.length}</span>
              </div>
            </div>

            {/* Quick Schedule Options */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: isDarkMode ? '#f8fafc' : '#111827',
                marginBottom: '12px'
              }}>
                Quick Schedule Options
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                {getQuickScheduleOptions().map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSchedule(option.value)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
                      border: `1px solid ${isDarkMode ? '#64748b' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: isDarkMode ? '#f8fafc' : '#374151',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date & Time */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: isDarkMode ? '#f8fafc' : '#111827',
                marginBottom: '12px'
              }}>
                Custom Schedule (UK Time - UTC+1)
              </label>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Date (DD/MM/YYYY)
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: isDarkMode ? '#334155' : 'white',
                      color: isDarkMode ? '#f8fafc' : '#111827',
                      fontFamily: 'inherit'
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Time (24-hour)
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: isDarkMode ? '#334155' : 'white',
                      color: isDarkMode ? '#f8fafc' : '#111827',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Repeat Options */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  marginBottom: '4px'
                }}>
                  Repeat (Optional)
                </label>
                <select
                  value={repeatOption}
                  onChange={(e) => setRepeatOption(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: isDarkMode ? '#334155' : 'white',
                    color: isDarkMode ? '#f8fafc' : '#111827',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Preview Scheduled Time */}
            {selectedDate && selectedTime && (
              <div style={{
                backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
                border: `1px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: isDarkMode ? '#60a5fa' : '#1e40af',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <Clock size={16} />
                  Scheduled for: {formatDate(new Date(`${selectedDate}T${selectedTime}`))} at {formatTime(new Date(`${selectedDate}T${selectedTime}`))}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  marginTop: '4px'
                }}>
                  Timezone: {timezone}
                  {repeatOption !== 'none' && ` • Repeats: ${repeatOption}`}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#dc2626'
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
            }}>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                disabled={isSubmitting}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  backgroundColor: 'transparent',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmitSchedule}
                disabled={isSubmitting || !selectedDate || !selectedTime}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSubmitting || !selectedDate || !selectedTime ? 'not-allowed' : 'pointer',
                  border: 'none',
                  backgroundColor: isSubmitting || !selectedDate || !selectedTime 
                    ? (isDarkMode ? '#475569' : '#d1d5db')
                    : (isDarkMode ? '#3b82f6' : '#2563eb'),
                  color: 'white',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isSubmitting || !selectedDate || !selectedTime ? 0.7 : 1
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Schedule Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST DETAIL MODAL */}
      {isPostDetailOpen && selectedPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setIsPostDetailOpen(false)}>
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0',
                color: isDarkMode ? '#60a5fa' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Eye size={20} />
                Post Details
              </h3>
              <button
                onClick={() => setIsPostDetailOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Post Content */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: isDarkMode ? '#f8fafc' : '#111827',
                margin: '0 0 16px 0'
              }}>
                {selectedPost.title || 'Untitled Post'}
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    textTransform: 'uppercase'
                  }}>
                    Content ID
                  </span>
                  <div style={{ fontSize: '14px', color: isDarkMode ? '#f8fafc' : '#111827', marginTop: '2px' }}>
                    {selectedPost.content_id}
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    textTransform: 'uppercase'
                  }}>
                    Current Status
                  </span>
                  <div style={{
                    fontSize: '14px',
                    color: getStatusColor(selectedPost.status, isDarkMode).text,
                    marginTop: '2px',
                    fontWeight: '600'
                  }}>
                    {selectedPost.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '14px',
                color: isDarkMode ? '#e2e8f0' : '#4b5563',
                lineHeight: '1.5',
                margin: '0 0 16px 0'
              }}>
                {selectedPost.description}
              </p>

              {selectedPost.scheduled_date && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  marginBottom: '16px'
                }}>
                  <Clock size={16} />
                  Scheduled: {formatDate(selectedPost.scheduled_date)} at {formatTime(selectedPost.scheduled_date)}
                </div>
              )}

              <div style={{
                fontSize: '14px',
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                marginBottom: '16px'
              }}>
                Platforms: {formatPlatformList(selectedPost.selected_platforms)}
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
            }}>
              <button
                onClick={() => {
                  handleEditPost(selectedPost);
                  setIsPostDetailOpen(false);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <Edit size={16} />
                Edit Post
              </button>

              <button
                onClick={() => setIsPostDetailOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE DETAIL MODAL */}
      {selectedTemplate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedTemplate(null)}>
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0',
                color: isDarkMode ? '#60a5fa' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Save size={20} />
                Template Details
              </h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {/* Template Content */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: isDarkMode ? '#f8fafc' : '#111827',
                margin: '0 0 16px 0'
              }}>
                {selectedTemplate.template_name}
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    textTransform: 'uppercase'
                  }}>
                    Usage Count
                  </span>
                  <div style={{ fontSize: '14px', color: isDarkMode ? '#f8fafc' : '#111827', marginTop: '2px' }}>
                    {selectedTemplate.usage_count} times
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    textTransform: 'uppercase'
                  }}>
                    Last Updated
                  </span>
                  <div style={{ fontSize: '14px', color: isDarkMode ? '#f8fafc' : '#111827', marginTop: '2px' }}>
                    {formatDate(selectedTemplate.updated_at)}
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '14px',
                color: isDarkMode ? '#e2e8f0' : '#4b5563',
                lineHeight: '1.5',
                margin: '0 0 16px 0'
              }}>
                {selectedTemplate.description}
              </p>

              <div style={{
                fontSize: '14px',
                color: isDarkMode ? '#94a3b8' : '#6b7280'
              }}>
                Platforms: {formatPlatformList(selectedTemplate.selected_platforms)}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
            }}>
              <button
                onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <Play size={16} />
                Use Template
              </button>

              <button
                onClick={() => setSelectedTemplate(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{getCSSAnimations()}</style>
    </div>
  );
}
