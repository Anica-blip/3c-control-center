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
            textAlign: 'center',
            padding: '60px 20px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Calendar View
            </h3>
            <p style={{ fontSize: '14px', margin: '0' }}>
              {scheduledPostsFiltered.length} scheduled posts - Calendar view restored
            </p>
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
