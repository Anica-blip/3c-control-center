// /src/schedulecomponent/ScheduleComponent.tsx - FIXED
import React, { useState, useEffect } from 'react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import PendingTab from './components/PendingTab';
import ScheduleModal from './components/ScheduleModal';
import { getTabStyle, getTheme, getContainerStyle, getCSSAnimations } from './utils/styleUtils';
import { Clock, Calendar, CheckCircle, Save, ChevronLeft, ChevronRight, Edit3, Trash2, RefreshCw, Eye, AlertCircle, Play, Plus } from 'lucide-react';

// Types for backward compatibility
interface PendingPost {
  id: string;
  characterProfile: string;
  type: string;
  template: string;
  description: string;
  mediaFiles: any[];
  platforms: any[];
  status: 'pending_schedule';
  createdDate: Date;
  contentId?: string;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

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
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage
  } = useTemplates();

  // UI state
  const [activeTab, setActiveTab] = useState('pending');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);

  // Get theme
  const { isDarkMode } = getTheme();

  // Platform configuration
  const platforms: Platform[] = [
    { id: '1', name: 'Telegram', icon: 'TG', color: '#3b82f6' },
    { id: '2', name: 'YouTube', icon: 'YT', color: '#ef4444' },
    { id: '3', name: 'Facebook', icon: 'FB', color: '#2563eb' },
    { id: '4', name: 'Twitter', icon: 'TW', color: '#0ea5e9' },
    { id: '5', name: 'Forum', icon: 'FR', color: '#4b5563' },
  ];

  // Load pending posts from localStorage and listen for new ones
  useEffect(() => {
    const handleNewPendingPost = (event: CustomEvent) => {
      const newPost = event.detail;
      setPendingPosts(prev => {
        const exists = prev.some(p => p.contentId === newPost.contentId);
        if (exists) return prev;
        return [newPost, ...prev];
      });
    };

    const loadPendingPosts = () => {
      try {
        const stored = localStorage.getItem('pendingSchedulePosts');
        if (stored) {
          const posts = JSON.parse(stored).map((post: any) => ({
            ...post,
            createdDate: new Date(post.createdDate)
          }));
          setPendingPosts(posts);
        }
      } catch (error) {
        console.error('Error loading pending posts:', error);
      }
    };

    loadPendingPosts();
    window.addEventListener('newPendingPost', handleNewPendingPost as EventListener);

    return () => {
      window.removeEventListener('newPendingPost', handleNewPendingPost as EventListener);
    };
  }, []);

  // Filter posts by status for each tab
  const pendingPostsFromHook = scheduledPosts.filter(p => p.status === 'pending_schedule');
  const scheduledPostsFiltered = scheduledPosts.filter(p => p.status === 'scheduled');
  const publishedPosts = scheduledPosts.filter(p => p.status === 'published');
  const failedPosts = scheduledPosts.filter(p => p.status === 'failed');

  // Use localStorage pending posts or hook pending posts
  const allPendingPosts = pendingPosts.length > 0 ? pendingPosts : pendingPostsFromHook;

  // Helper functions
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

  // Event handlers
  const handleSchedulePost = (post: any) => {
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
      
      const scheduledPost = {
        ...selectedPost,
        scheduled_date: new Date(scheduleData.scheduledDate),
        status: 'scheduled'
      };

      if (createPost) {
        await createPost(scheduledPost);
      }

      // Remove from localStorage pending posts
      setPendingPosts(prev => prev.filter(p => p.id !== selectedPost.id));
      const storedPosts = JSON.parse(localStorage.getItem('pendingSchedulePosts') || '[]');
      const updatedPosts = storedPosts.filter((p: any) => p.id !== selectedPost.id);
      localStorage.setItem('pendingSchedulePosts', JSON.stringify(updatedPosts));
      
      setIsScheduleModalOpen(false);
      setSelectedPost(null);
      if (refreshPosts) await refreshPosts();
      
      alert(`Post scheduled for ${new Date(scheduleData.scheduledDate).toLocaleString()}!`);
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  };

  const handleEditPost = (post: any) => {
    console.log('Edit post:', post.id);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        // Delete from pending posts
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
        const storedPosts = JSON.parse(localStorage.getItem('pendingSchedulePosts') || '[]');
        const updatedPosts = storedPosts.filter((p: any) => p.id !== postId);
        localStorage.setItem('pendingSchedulePosts', JSON.stringify(updatedPosts));

        // Delete from scheduled posts
        if (deletePost) await deletePost(postId);
        if (refreshPosts) await refreshPosts();
        
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleUseTemplate = (template: any) => {
    const newPendingPost: PendingPost = {
      id: 'pending-' + Date.now(),
      characterProfile: template.character_profile || template.characterProfile,
      type: template.template_type || template.type,
      template: template.template_name || template.name,
      description: template.description,
      mediaFiles: [],
      platforms: template.selected_platforms || template.platforms || [],
      status: 'pending_schedule',
      createdDate: new Date()
    };
    
    setPendingPosts(prev => [newPendingPost, ...prev]);
    if (incrementUsage) incrementUsage(template.id);
    setActiveTab('pending');
    alert('Template added to Pending Scheduling!');
  };

  // Tab configuration
  const tabs = [
    { 
      id: 'pending', 
      label: 'Pending Scheduling', 
      icon: Clock,
      count: allPendingPosts.length
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
      count: publishedPosts.length + failedPosts.length
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
            {allPendingPosts.length}
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
            {scheduledPostsFiltered.length}
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
            {publishedPosts.length}
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
            {failedPosts.length}
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

      {/* Tab Content */}
      <div>
        {activeTab === 'pending' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            {allPendingPosts.length === 0 ? (
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
              <div style={{
                backgroundColor: isDarkMode ? '#1e293b' : 'white',
                border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                borderRadius: '8px'
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                  borderBottom: `1px solid ${isDarkMode ? '#1d4ed8' : '#93c5fd'}`,
                  borderRadius: '8px 8px 0 0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Clock style={{
                      height: '20px',
                      width: '20px',
                      color: '#2563eb'
                    }} />
                    <h2 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: isDarkMode ? '#93c5fd' : '#1e3a8a',
                      margin: '0'
                    }}>
                      Pending Scheduling ({allPendingPosts.length})
                    </h2>
                  </div>
                </div>
                
                <div>
                  {allPendingPosts.map((post, index) => (
                    <div key={post.id} style={{
                      padding: '20px',
                      borderBottom: index < allPendingPosts.length - 1 ? `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}` : 'none'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
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
                              Created {post.createdDate.toLocaleDateString()}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: '#2563eb'
                            }}>
                              {post.characterProfile}
                            </span>
                          </div>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{
                              color: isDarkMode ? '#e2e8f0' : '#111827',
                              fontSize: '14px',
                              lineHeight: '1.5',
                              fontWeight: 'bold',
                              margin: '0'
                            }}>
                              {truncateDescription(post.description)}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginLeft: '24px'
                        }}>
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
                          >
                            <Trash2 style={{ height: '16px', width: '16px' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'calendar' && (
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '8px',
            padding: '24px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
          }}>
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
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (calendarView === 'month') {
                      newDate.setMonth(newDate.getMonth() - 1);
                    } else if (calendarView === 'week') {
                      newDate.setDate(newDate.getDate() - 7);
                    } else {
                      newDate.setDate(newDate.getDate() - 1);
                    }
                    setCurrentDate(newDate);
                  }}
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
                  {calendarView === 'month' 
                    ? currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                    : currentDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                  }
                </h2>
                
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (calendarView === 'month') {
                      newDate.setMonth(newDate.getMonth() + 1);
                    } else if (calendarView === 'week') {
                      newDate.setDate(newDate.getDate() + 7);
                    } else {
                      newDate.setDate(newDate.getDate() + 1);
                    }
                    setCurrentDate(newDate);
                  }}
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
                        color: calendarView === view ? (isDarkMode ? '#e2e8f0' : '#111827') : (isDarkMode ? '#94a3b8' : '#6b7280')
                      }}
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Calendar Content */}
            {scheduledPostsFiltered.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: isDarkMode ? '#94a3b8' : '#6b7280'
              }}>
                <Calendar style={{
                  height: '48px',
                  width: '48px',
                  color: isDarkMode ? '#475569' : '#d1d5db',
                  margin: '0 auto 16px auto'
                }} />
                <p style={{
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  margin: '0'
                }}>
                  No scheduled posts to display. Schedule some posts to see them on the calendar.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
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
                
                {/* Calendar Days */}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const dayPosts = scheduledPostsFiltered.filter(post => 
                    new Date(post.scheduled_date).toDateString() === date.toDateString()
                  );
                  
                  return (
                    <div
                      key={i}
                      style={{
                        backgroundColor: isDarkMode ? '#1e293b' : 'white',
                        minHeight: '100px',
                        padding: '6px',
                        opacity: isCurrentMonth ? 1 : 0.4
                      }}
                    >
                      <div style={{
                        fontSize: '14px',
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isToday ? '#2563eb' : (isCurrentMonth ? (isDarkMode ? '#e2e8f0' : '#111827') : (isDarkMode ? '#64748b' : '#9ca3af')),
                        marginBottom: '4px',
                        textAlign: 'right'
                      }}>
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
                            title={post.title || post.description}
                          >
                            <div style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {(post.title || post.description).length > 15 ? 
                                (post.title || post.description).substring(0, 15) + '...' : 
                                (post.title || post.description)
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
            )}
          </div>
        )}
        
        {activeTab === 'status' && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Status Management
            </h3>
            <p style={{ fontSize: '14px', margin: '0' }}>
              {scheduledPosts.length} posts to manage - Status management restored
            </p>
          </div>
        )}
        
        {activeTab === 'saved' && (
          <div>
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
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: isDarkMode ? '#e2e8f0' : '#111827',
                      margin: '0 0 12px 0'
                    }}>
                      {template.template_name || template.name}
                    </h3>
                    
                    <p style={{
                      color: isDarkMode ? '#e2e8f0' : '#111827',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      fontWeight: 'bold',
                      margin: '0 0 16px 0'
                    }}>
                      {truncateDescription(template.description)}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
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
        )}
      </div>

      {/* Modals */}
      {isScheduleModalOpen && (
        <ScheduleModal
          post={selectedPost}
          onConfirm={handleConfirmSchedule}
          onCancel={() => setIsScheduleModalOpen(false)}
        />
      )}

      {/* CSS Animations */}
      <style>{getCSSAnimations()}</style>
    </div>
  );
}
