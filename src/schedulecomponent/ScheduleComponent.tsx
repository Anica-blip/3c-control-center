// /src/schedulecomponent/ScheduleComponent.tsx - FIXED FOR WORKFLOW SYNC
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import { scheduleAPI } from './api/scheduleAPI';
import { contentAPI } from './api/contentAPI';
import PendingTab from './components/PendingTab';
import ScheduleModal from './components/ScheduleModal';
import { ScheduledPost, PendingPost, SavedTemplate } from './types';

interface ScheduleComponentProps {
  user?: { id: string } | null;
  isDarkMode?: boolean;
  onClose?: () => void;
}

export default function ScheduleComponent({ 
  user, 
  isDarkMode = false,
  onClose 
}: ScheduleComponentProps) {
  // Use existing hooks (FIXED: these work with the current implementation)
  const {
    posts: scheduledPosts,
    loading: scheduledLoading,
    error: scheduledError,
    refreshPosts: refreshScheduledPosts,
    createPost: createScheduledPost,
    updatePost: updateScheduledPost,
    deletePost: deleteScheduledPost
  } = useScheduledPosts();

  const {
    templates: savedTemplates,
    loading: templatesLoading,
    error: templatesError,
    refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage
  } = useTemplates();

  // Local state for pending posts (FIXED: use separate API call)
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  // UI state (FIXED: simplified, following EnhancedContentCreationForm patterns)
  const [activeTab, setActiveTab] = useState('pending');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Theme following EnhancedContentCreationForm pattern
  const theme = {
    container: {
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      color: isDarkMode ? '#f8fafc' : '#111827',
      borderRadius: '8px',
      border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`,
      boxShadow: isDarkMode 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
      paddingBottom: '16px',
      marginBottom: '24px'
    },
    tab: (isActive: boolean) => ({
      padding: '12px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      backgroundColor: isActive 
        ? (isDarkMode ? '#3b82f6' : '#2563eb')
        : 'transparent',
      color: isActive 
        ? 'white' 
        : (isDarkMode ? '#94a3b8' : '#6b7280'),
      fontFamily: 'inherit'
    })
  };

  // FIXED: Load pending posts separately (workflow sync)
  const loadPendingPosts = async () => {
    if (!user?.id) return;
    
    try {
      setPendingLoading(true);
      setPendingError(null);
      const posts = await scheduleAPI.fetchPendingPosts(user.id);
      setPendingPosts(posts);
    } catch (error) {
      console.error('Error loading pending posts:', error);
      setPendingError('Failed to load pending posts');
    } finally {
      setPendingLoading(false);
    }
  };

  // Load data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadPendingPosts();
      refreshScheduledPosts();
      refreshTemplates();
    }
  }, [user?.id, refreshScheduledPosts, refreshTemplates]);

  // FIXED: Event handlers following EnhancedContentCreationForm patterns
  const handleSchedulePost = (post: PendingPost) => {
    setSelectedPost(post);
    setIsScheduleModalOpen(true);
  };

  const handleEditPost = async (post: PendingPost) => {
    try {
      // FIXED: Forward back to content creation for editing
      // This should trigger the content creation form with the post data
      console.log('Edit post:', post);
      alert('Post editing will open in Content Creation tab. Feature coming soon.');
    } catch (error) {
      console.error('Error handling edit:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await scheduleAPI.deletePendingPost(postId);
      await loadPendingPosts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleConfirmSchedule = async (scheduleData: {
    scheduledDate: string;
    timezone: string;
    repeatOption?: string;
  }) => {
    if (!selectedPost) return;
    
    try {
      // FIXED: Create scheduled post from pending post
      const scheduledPostData = {
        ...selectedPost,
        scheduled_date: new Date(scheduleData.scheduledDate),
        status: 'scheduled' as const,
        timezone: scheduleData.timezone,
        repeatOption: scheduleData.repeatOption
      };

      await createScheduledPost(scheduledPostData);
      
      // Remove from pending list
      await scheduleAPI.deletePendingPost(selectedPost.id);
      await loadPendingPosts();
      
      setIsScheduleModalOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Failed to schedule post:', error);
      alert('Failed to schedule post');
    }
  };

  // FIXED: Tab configuration (only use existing components)
  const tabs = [
    { 
      id: 'pending', 
      label: 'Pending Scheduling', 
      icon: Clock,
      count: pendingPosts.length 
    },
    { 
      id: 'scheduled', 
      label: 'Scheduled Posts', 
      icon: Calendar,
      count: scheduledPosts.filter(p => p.status === 'scheduled').length 
    },
    { 
      id: 'templates', 
      label: 'Saved Templates', 
      icon: CheckCircle,
      count: savedTemplates.length 
    }
  ];

  // FIXED: Status summary (following EnhancedContentCreationForm layout)
  const getStatusSummary = () => {
    const total = pendingPosts.length + scheduledPosts.length;
    const scheduled = scheduledPosts.filter(p => p.status === 'scheduled').length;
    const published = scheduledPosts.filter(p => p.status === 'published').length;
    const failed = scheduledPosts.filter(p => p.status === 'failed').length;

    return { total, pending: pendingPosts.length, scheduled, published, failed };
  };

  const summary = getStatusSummary();

  return (
    <div style={{ padding: '24px' }}>
      <div style={theme.container}>
        {/* FIXED: Header with summary (following EnhancedContentCreationForm pattern) */}
        <div style={{ padding: '24px' }}>
          <div style={theme.header}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: isDarkMode ? '#60a5fa' : '#3b82f6',
                  margin: '0 0 8px 0'
                }}>
                  Schedule Manager
                </h1>
                <p style={{
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  fontSize: '14px',
                  margin: '0'
                }}>
                  Manage your content scheduling and publishing workflow
                </p>
              </div>
              
              {/* Status Summary Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px'
              }}>
                {[
                  { label: 'Pending', value: summary.pending, color: '#f59e0b' },
                  { label: 'Scheduled', value: summary.scheduled, color: '#10b981' },
                  { label: 'Published', value: summary.published, color: '#3b82f6' },
                  { label: 'Failed', value: summary.failed, color: '#ef4444' }
                ].map((stat) => (
                  <div key={stat.label} style={{
                    padding: '12px',
                    backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                    borderRadius: '8px',
                    border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                    textAlign: 'center' as const
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: stat.color,
                      marginBottom: '4px'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontWeight: '500'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FIXED: Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
            paddingBottom: '16px'
          }}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={theme.tab(activeTab === tab.id)}
                >
                  <IconComponent size={16} />
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{
                      backgroundColor: activeTab === tab.id 
                        ? 'rgba(255,255,255,0.2)' 
                        : (isDarkMode ? '#475569' : '#e5e7eb'),
                      color: activeTab === tab.id 
                        ? 'white' 
                        : (isDarkMode ? '#f8fafc' : '#374151'),
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      minWidth: '18px',
                      textAlign: 'center' as const
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
            
            {/* Refresh Button */}
            <button
              onClick={() => {
                loadPendingPosts();
                refreshScheduledPosts();
                refreshTemplates();
              }}
              style={{
                ...theme.tab(false),
                marginLeft: 'auto'
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* FIXED: Tab Content (only using existing components) */}
          <div>
            {activeTab === 'pending' && (
              <PendingTab
                posts={pendingPosts}
                loading={pendingLoading}
                error={pendingError}
                onSchedule={handleSchedulePost}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            )}

            {activeTab === 'scheduled' && (
              <div style={{
                textAlign: 'center' as const,
                padding: '60px 20px',
                color: isDarkMode ? '#94a3b8' : '#6b7280'
              }}>
                <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  Scheduled Posts View
                </h3>
                <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>
                  Calendar and list view for scheduled posts coming soon.
                </p>
                <div style={{
                  padding: '16px',
                  backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                  borderRadius: '8px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                  textAlign: 'left' as const
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                    Current Scheduled Posts: {scheduledPosts.length}
                  </div>
                  {scheduledPosts.slice(0, 3).map(post => (
                    <div key={post.id} style={{ 
                      fontSize: '12px', 
                      marginBottom: '4px',
                      color: isDarkMode ? '#e2e8f0' : '#4b5563'
                    }}>
                      • {post.title || post.description.substring(0, 50)}...
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div style={{
                textAlign: 'center' as const,
                padding: '60px 20px',
                color: isDarkMode ? '#94a3b8' : '#6b7280'
              }}>
                <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  Template Management
                </h3>
                <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>
                  Saved template management coming soon.
                </p>
                <div style={{
                  padding: '16px',
                  backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                  borderRadius: '8px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                  textAlign: 'left' as const
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                    Available Templates: {savedTemplates.length}
                  </div>
                  {savedTemplates.slice(0, 3).map(template => (
                    <div key={template.id} style={{ 
                      fontSize: '12px', 
                      marginBottom: '4px',
                      color: isDarkMode ? '#e2e8f0' : '#4b5563'
                    }}>
                      • {template.template_name} (Used {template.usage_count} times)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FIXED: Schedule Modal (using existing component) */}
      {isScheduleModalOpen && (
        <ScheduleModal
          post={selectedPost}
          onConfirm={handleConfirmSchedule}
          onCancel={() => {
            setIsScheduleModalOpen(false);
            setSelectedPost(null);
          }}
        />
      )}
    </div>
  );
}
