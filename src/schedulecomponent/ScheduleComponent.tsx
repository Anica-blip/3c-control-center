// /src/schedulecomponent/ScheduleComponent.tsx - FIXED with proper imports and integration
import React, { useState } from 'react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import PendingTab from './components/PendingTab';
import CalendarView from './components/CalendarView';
import StatusManagement from './components/StatusManagement';
import TemplateManager from './components/TemplateManager';
import ScheduleModal from './components/ScheduleModal';
import EditModal from './components/EditModal';
import { getTabStyle, getTheme, getContainerStyle, getCSSAnimations } from './utils/styleUtils';
import { Clock, Calendar, CheckCircle, Save } from 'lucide-react';
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

  // UI state
  const [activeTab, setActiveTab] = useState('pending');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

  // Get theme
  const { isDarkMode, theme } = getTheme();

  // Filter posts by status for each tab
  const pendingPosts = scheduledPosts.filter(p => p.status === 'pending_schedule');
  const scheduledPostsFiltered = scheduledPosts.filter(p => 
    ['scheduled', 'processing', 'publishing', 'published', 'failed'].includes(p.status)
  );
  const publishedPosts = scheduledPosts.filter(p => p.status === 'published');
  const failedPosts = scheduledPosts.filter(p => p.status === 'failed');

  // Event handlers
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
      
      // Switch to pending tab to show the new post
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

      {/* Status Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
        padding: '20px',
        backgroundColor: theme.cardBg,
        borderRadius: '12px',
        border: `1px solid ${theme.border}`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: theme.primary,
            marginBottom: '4px'
          }}>
            {pendingPosts.length}
          </div>
          <div style={{
            fontSize: '14px',
            color: theme.textSecondary,
            fontWeight: '500'
          }}>
            Pending Schedule
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: theme.success,
            marginBottom: '4px'
          }}>
            {scheduledPosts.filter(p => p.status === 'scheduled').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: theme.textSecondary,
            fontWeight: '500'
          }}>
            Scheduled
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: theme.success,
            marginBottom: '4px'
          }}>
            {publishedPosts.length}
          </div>
          <div style={{
            fontSize: '14px',
            color: theme.textSecondary,
            fontWeight: '500'
          }}>
            Published
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: theme.danger,
            marginBottom: '4px'
          }}>
            {failedPosts.length}
          </div>
          <div style={{
            fontSize: '14px',
            color: theme.textSecondary,
            fontWeight: '500'
          }}>
            Failed
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${theme.border}`,
        marginBottom: '32px',
        backgroundColor: theme.cardBg,
        borderRadius: '12px 12px 0 0',
        padding: '0 8px'
      }}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={getTabStyle(tab.id, activeTab, isDarkMode)}
            >
              <IconComponent size={18} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span style={{
                  backgroundColor: activeTab === tab.id ? theme.primary : theme.textSecondary,
                  color: activeTab === tab.id ? 'white' : theme.bg,
                  padding: '2px 8px',
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
        borderRadius: '0 0 12px 12px',
        border: `1px solid ${theme.border}`,
        borderTop: 'none',
        minHeight: '600px'
      }}>
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
            posts={scheduledPostsFiltered}
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
            error={templatesError}
            onCreate={createTemplate}
            onUpdate={updateTemplate}
            onDelete={deleteTemplate}
            onUse={handleUseTemplate}
            onLoadTemplate={handleUseTemplate}
          />
        )}
      </div>

      {/* Loading State Overlay */}
      {(postsLoading || templatesLoading) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: theme.bg,
            padding: '24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
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
      )}

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
