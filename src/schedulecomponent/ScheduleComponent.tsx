// /src/schedulecomponent/ScheduleComponent.tsx - COMPLETE IMPLEMENTATION
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, Save, Edit, Trash2, Play, RefreshCw } from 'lucide-react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import PendingTab from './components/PendingTab';
import ScheduleModal from './components/ScheduleModal';
import { scheduleAPI } from './api/scheduleAPI';
import { ScheduledPost, PendingPost } from './types';

interface ScheduleComponentProps {
  user?: { id: string } | null;
  isDarkMode?: boolean;
}

export default function ScheduleComponent({ user, isDarkMode = false }: ScheduleComponentProps) {
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
  const [selectedPost, setSelectedPost] = useState<PendingPost | null>(null);
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  // Load pending posts on component mount
  useEffect(() => {
    if (user?.id) {
      loadPendingPosts();
    }
  }, [user?.id]);

  const loadPendingPosts = async () => {
    if (!user?.id) return;
    
    try {
      setPendingLoading(true);
      setPendingError(null);
      const data = await scheduleAPI.fetchPendingPosts(user.id);
      setPendingPosts(data);
    } catch (error) {
      console.error('Error loading pending posts:', error);
      setPendingError(error instanceof Error ? error.message : 'Failed to load pending posts');
    } finally {
      setPendingLoading(false);
    }
  };

  // Event handlers
  const handleSchedulePost = (post: PendingPost) => {
    setSelectedPost(post);
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async (scheduleData: {
    scheduledDate: string;
    timezone: string;
    repeatOption?: string;
  }) => {
    if (!selectedPost || !user?.id) return;

    try {
      // Create scheduled post from pending post
      const scheduledPostData: Omit<ScheduledPost, 'id' | 'created_date'> = {
        content_id: selectedPost.content_id,
        character_profile: selectedPost.character_profile,
        theme: selectedPost.theme,
        audience: selectedPost.audience,
        media_type: selectedPost.media_type,
        template_type: selectedPost.template_type,
        platform: selectedPost.platform,
        title: selectedPost.title,
        description: selectedPost.description,
        hashtags: selectedPost.hashtags,
        keywords: selectedPost.keywords,
        cta: selectedPost.cta,
        media_files: selectedPost.media_files,
        selected_platforms: selectedPost.selected_platforms,
        scheduled_date: new Date(scheduleData.scheduledDate),
        status: 'scheduled',
        user_id: user.id,
        created_by: user.id,
        is_from_template: selectedPost.is_from_template,
        source_template_id: selectedPost.source_template_id
      };

      // Create the scheduled post
      await createPost(scheduledPostData);

      // Remove from pending posts
      await scheduleAPI.deletePendingPost(selectedPost.id);
      
      // Refresh pending posts list
      await loadPendingPosts();

      setIsScheduleModalOpen(false);
      setSelectedPost(null);

      console.log('Post scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule post:', error);
      alert('Failed to schedule post. Please try again.');
    }
  };

  const handleEditPost = async (post: PendingPost) => {
    // For now, just log - can be extended to open edit modal
    console.log('Edit post:', post);
    alert('Edit functionality will be implemented in the next phase.');
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await scheduleAPI.deletePendingPost(postId);
      await loadPendingPosts();
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Style utilities
  const getTabStyle = (tabId: string, activeTabId: string, isDark: boolean) => ({
    padding: '12px 24px',
    backgroundColor: tabId === activeTabId 
      ? (isDark ? '#3b82f6' : '#2563eb') 
      : 'transparent',
    color: tabId === activeTabId 
      ? 'white' 
      : (isDark ? '#94a3b8' : '#6b7280'),
    border: 'none',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  const containerStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderRadius: '12px',
    padding: '0',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxShadow: isDarkMode ? '0 10px 25px rgba(0, 0, 0, 0.3)' : '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '24px 24px 16px',
    backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
    borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
  };

  const tabsContainerStyle = {
    display: 'flex',
    backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
    padding: '4px',
    margin: '0 24px',
    borderRadius: '8px',
    marginBottom: '0'
  };

  const contentStyle = {
    padding: '0'
  };

  // Tab definitions
  const tabs = [
    { id: 'pending', label: 'Pending Scheduling', icon: Clock, count: pendingPosts.length },
    { id: 'calendar', label: 'Calendar View', icon: Calendar, count: scheduledPosts.filter(p => p.status === 'scheduled').length },
    { id: 'status', label: 'Status Management', icon: CheckCircle, count: scheduledPosts.length },
    { id: 'templates', label: 'Saved Templates', icon: Save, count: savedTemplates.length }
  ];

  // Get status summary for display
  const statusSummary = {
    pending: pendingPosts.length,
    scheduled: scheduledPosts.filter(p => p.status === 'scheduled').length,
    published: scheduledPosts.filter(p => p.status === 'published').length,
    failed: scheduledPosts.filter(p => p.status === 'failed').length,
    total: pendingPosts.length + scheduledPosts.length
  };

  return (
    <div style={containerStyle}>
      {/* Header with Status Summary */}
      <div style={headerStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: isDarkMode ? '#60a5fa' : '#1e40af',
              margin: '0 0 8px 0'
            }}>
              Schedule Manager
            </h1>
            <p style={{
              fontSize: '14px',
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              margin: '0'
            }}>
              Manage your content scheduling and publication pipeline
            </p>
          </div>
          
          <button
            onClick={() => {
              refreshPosts();
              loadPendingPosts();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
              border: `1px solid ${isDarkMode ? '#64748b' : '#d1d5db'}`,
              borderRadius: '8px',
              color: isDarkMode ? '#f8fafc' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#60a5fa' : '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#475569' : '#f3f4f6';
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Status Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px'
        }}>
          {[
            { label: 'Total Posts', value: statusSummary.total, color: '#6b7280' },
            { label: 'Pending', value: statusSummary.pending, color: '#f59e0b' },
            { label: 'Scheduled', value: statusSummary.scheduled, color: '#10b981' },
            { label: 'Published', value: statusSummary.published, color: '#3b82f6' },
            { label: 'Failed', value: statusSummary.failed, color: '#ef4444' }
          ].map((stat, index) => (
            <div key={index} style={{
              padding: '12px',
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
              borderRadius: '8px',
              border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
              textAlign: 'center'
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

      {/* Tabs Navigation */}
      <div style={tabsContainerStyle}>
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={getTabStyle(id, activeTab, isDarkMode)}
            onMouseOver={(e) => {
              if (id !== activeTab) {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#64748b' : '#e5e7eb';
              }
            }}
            onMouseOut={(e) => {
              if (id !== activeTab) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <Icon size={18} />
            {label}
            {count > 0 && (
              <span style={{
                backgroundColor: id === activeTab 
                  ? (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)')
                  : (isDarkMode ? '#60a5fa' : '#3b82f6'),
                color: id === activeTab ? 'white' : 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '600',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={contentStyle}>
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
        
        {activeTab === 'calendar' && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Calendar View Coming Soon
            </h3>
            <p style={{ fontSize: '14px', margin: '0' }}>
              Visual calendar interface for managing scheduled posts will be available in the next release.
            </p>
          </div>
        )}
        
        {activeTab === 'status' && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Status Management Coming Soon
            </h3>
            <p style={{ fontSize: '14px', margin: '0' }}>
              Advanced status tracking and bulk operations will be available in the next release.
            </p>
            
            {/* Show current posts by status */}
            <div style={{
              marginTop: '32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              maxWidth: '600px',
              margin: '32px auto 0'
            }}>
              {[
                { status: 'scheduled', posts: scheduledPosts.filter(p => p.status === 'scheduled'), color: '#10b981' },
                { status: 'published', posts: scheduledPosts.filter(p => p.status === 'published'), color: '#3b82f6' },
                { status: 'failed', posts: scheduledPosts.filter(p => p.status === 'failed'), color: '#ef4444' }
              ].map(({ status, posts, color }) => (
                <div key={status} style={{
                  padding: '16px',
                  backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  textAlign: 'left'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: color,
                      borderRadius: '50%'
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isDarkMode ? '#f8fafc' : '#111827',
                      textTransform: 'capitalize'
                    }}>
                      {status}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: color
                  }}>
                    {posts.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'templates' && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            <Save size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Template Management Coming Soon
            </h3>
            <p style={{ fontSize: '14px', margin: '0' }}>
              Save, organize, and reuse content templates to streamline your workflow.
            </p>
            <div style={{
              marginTop: '16px',
              padding: '12px 20px',
              backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
              color: isDarkMode ? '#60a5fa' : '#1e40af',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              {savedTemplates.length} Templates Available
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && selectedPost && (
        <ScheduleModal
          post={{
            id: selectedPost.id,
            contentId: selectedPost.content_id,
            title: selectedPost.title,
            description: selectedPost.description,
            selectedPlatforms: selectedPost.selected_platforms,
            characterProfile: selectedPost.character_profile
          }}
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
