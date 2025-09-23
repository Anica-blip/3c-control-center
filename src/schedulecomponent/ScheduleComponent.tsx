// /src/schedulecomponent/ScheduleComponent.tsx - FIXED
import React, { useState } from 'react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import PendingTab from './components/PendingTab';
import ScheduleModal from './components/ScheduleModal';
import CalendarView from './components/CalendarView';
import StatusManagement from './components/StatusManagement';
import TemplateManager from './components/TemplateManager';
import { getTabStyle, getTheme, getContainerStyle, getCSSAnimations } from './utils/styleUtils';
import { Clock, Calendar, CheckCircle, Save } from 'lucide-react';

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

  // Get theme
  const { isDarkMode } = getTheme();

  // Filter posts by status for each tab
  const pendingPosts = scheduledPosts.filter(p => p.status === 'pending_schedule');
  const scheduledPostsFiltered = scheduledPosts.filter(p => p.status === 'scheduled');
  const publishedPosts = scheduledPosts.filter(p => p.status === 'published');
  const failedPosts = scheduledPosts.filter(p => p.status === 'failed');

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
      
      await createPost({
        ...selectedPost,
        scheduled_date: new Date(scheduleData.scheduledDate),
        status: 'scheduled'
      });
      
      setIsScheduleModalOpen(false);
      setSelectedPost(null);
      await refreshPosts();
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  };

  const handleEditPost = (post: any) => {
    // TODO: Implement edit functionality
    console.log('Edit post:', post.id);
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

  const handleRetryPost = async (postId: string) => {
    try {
      await updatePost(postId, { status: 'pending', retry_count: 0 });
      await refreshPosts();
    } catch (error) {
      console.error('Failed to retry post:', error);
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

  // Tab configuration
  const tabs = [
    { 
      id: 'pending', 
      label: 'Pending Scheduling', 
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
          <PendingTab
            posts={pendingPosts}
            loading={postsLoading}
            error={postsError}
            onSchedule={handleSchedulePost}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        )}
        
        {activeTab === 'calendar' && (
          <CalendarView
            posts={scheduledPostsFiltered}
            onEditPost={handleEditPost}
            loading={postsLoading}
            error={postsError}
          />
        )}
        
        {activeTab === 'status' && (
          <StatusManagement
            posts={scheduledPosts}
            loading={postsLoading}
            error={postsError}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
            onRetry={handleRetryPost}
          />
        )}
        
        {activeTab === 'saved' && (
          <TemplateManager
            templates={savedTemplates}
            loading={templatesLoading}
            error={null}
            onCreate={createTemplate}
            onUpdate={updateTemplate}
            onDelete={deleteTemplate}
            onUse={incrementUsage}
            onLoadTemplate={(template) => {
              // Convert template to pending post and switch to pending tab
              const pendingPost = {
                id: `pending-${Date.now()}`,
                content_id: `template-${template.id}`,
                title: template.template_name,
                description: template.description,
                character_profile: template.character_profile,
                theme: template.theme,
                audience: template.audience,
                media_type: template.media_type,
                template_type: template.template_type,
                platform: template.platform,
                hashtags: template.hashtags,
                keywords: template.keywords,
                cta: template.cta,
                selected_platforms: template.selected_platforms,
                status: 'pending_schedule',
                created_date: new Date(),
                is_from_template: true,
                source_template_id: template.id,
                user_id: template.user_id,
                created_by: template.created_by
              };
              
              createPost(pendingPost);
              setActiveTab('pending');
            }}
          />
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
