// /src/schedulecomponent/ScheduleComponent.tsx
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, Save } from 'lucide-react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import PendingTab from './components/PendingTab';
import CalendarView from './components/CalendarView';
import StatusManagement from './components/StatusManagement';
import TemplateManager from './components/TemplateManager';
import ScheduleModal from './components/ScheduleModal';
import EditModal from './components/EditModal';
import { scheduleAPI } from './api/scheduleAPI';
import { contentAPI } from './api/contentAPI';
import { supabaseAPI } from './supabaseAPI';

interface ScheduleComponentProps {
  user?: { id: string } | null;
  onClose?: () => void;
}

export default function ScheduleComponent({ user, onClose }: ScheduleComponentProps) {
  // Use hooks for data management
  const {
    posts: scheduledPosts,
    loading: postsLoading,
    error: postsError,
    refreshPosts,
    createPost,
    updatePost,
    deletePost
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

  // UI state management
  const [activeTab, setActiveTab] = useState('pending');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // Get theme
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // Load pending posts from content_posts table
  useEffect(() => {
    const loadPendingPosts = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingPending(true);
        // Get posts that need scheduling from content_posts
        const posts = await contentAPI.getPostsByStatus(user.id, 'pending');
        setPendingPosts(posts);
      } catch (error) {
        console.error('Error loading pending posts:', error);
      } finally {
        setLoadingPending(false);
      }
    };

    loadPendingPosts();
    refreshPosts();
    refreshTemplates();
  }, [user?.id, refreshPosts, refreshTemplates]);

  // Event handlers
  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleSchedulePost = (post) => {
    setSelectedPost(post);
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async (scheduleData) => {
    if (!selectedPost || !user?.id) return;

    try {
      // Create scheduled post using scheduleAPI
      await scheduleAPI.createScheduledPost({
        content_id: selectedPost.contentId || selectedPost.content_id,
        character_profile: selectedPost.characterProfile || selectedPost.character_profile,
        theme: selectedPost.theme,
        audience: selectedPost.audience,
        media_type: selectedPost.mediaType || selectedPost.media_type,
        template_type: selectedPost.templateType || selectedPost.template_type,
        platform: selectedPost.platform,
        title: selectedPost.title,
        description: selectedPost.description,
        hashtags: selectedPost.hashtags || [],
        keywords: selectedPost.keywords || '',
        cta: selectedPost.cta || '',
        media_files: selectedPost.mediaFiles || selectedPost.media_files || [],
        selected_platforms: selectedPost.selectedPlatforms || selectedPost.selected_platforms || [],
        scheduled_date: new Date(scheduleData.scheduledDate),
        status: 'scheduled',
        user_id: user.id,
        created_by: user.id,
        is_from_template: selectedPost.isFromTemplate || selectedPost.is_from_template,
        source_template_id: selectedPost.sourceTemplateId || selectedPost.source_template_id
      });
      
      // Update the original post status
      if (selectedPost.id) {
        await contentAPI.updatePost(selectedPost.id, { status: 'scheduled' });
      }
      
      // Refresh data
      await refreshPosts();
      const posts = await contentAPI.getPostsByStatus(user.id, 'pending');
      setPendingPosts(posts);
      
      setIsScheduleModalOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  };

  const handleUpdatePostStatus = async (postId, updates) => {
    try {
      await updatePost(postId, updates);
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      // Also refresh pending posts if needed
      if (user?.id) {
        const posts = await contentAPI.getPostsByStatus(user.id, 'pending');
        setPendingPosts(posts);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleEditComplete = async (updatedPost) => {
    if (!editingPost?.id) return;
    
    try {
      await contentAPI.updatePost(editingPost.id, updatedPost);
      setIsEditModalOpen(false);
      setEditingPost(null);
      
      // Refresh pending posts
      if (user?.id) {
        const posts = await contentAPI.getPostsByStatus(user.id, 'pending');
        setPendingPosts(posts);
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  // Style functions
  const getTabStyle = (tabId, activeTab, isDarkMode) => ({
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    backgroundColor: activeTab === tabId 
      ? (isDarkMode ? '#3b82f6' : '#2563eb')
      : 'transparent',
    color: activeTab === tabId 
      ? 'white' 
      : (isDarkMode ? '#94a3b8' : '#6b7280'),
    fontFamily: 'inherit'
  });

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
      count: scheduledPosts.filter(p => p.status === 'scheduled').length 
    },
    { 
      id: 'status', 
      label: 'Status Management', 
      icon: CheckCircle, 
      count: scheduledPosts.length 
    },
    { 
      id: 'saved', 
      label: 'Saved Templates', 
      icon: Save, 
      count: savedTemplates.length 
    }
  ];

  return (
    <div style={{
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: isDarkMode ? '#60a5fa' : '#2563eb',
            margin: '0 0 8px 0'
          }}>
            Schedule Manager
          </h1>
          <p style={{
            fontSize: '16px',
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            margin: '0'
          }}>
            Manage, schedule, and track your social media content
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
              color: isDarkMode ? '#f8fafc' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Close
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '12px',
        padding: '8px',
        marginBottom: '24px',
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        display: 'flex',
        gap: '4px'
      }}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={getTabStyle(tab.id, activeTab, isDarkMode)}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f3f4f6';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <IconComponent size={18} />
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  backgroundColor: activeTab === tab.id 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : (isDarkMode ? '#60a5fa' : '#2563eb'),
                  color: 'white',
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
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '12px',
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        overflow: 'hidden'
      }}>
        {activeTab === 'pending' && (
          <PendingTab
            posts={pendingPosts}
            loading={loadingPending}
            error={postsError}
            onSchedule={handleSchedulePost}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        )}
        
        {activeTab === 'calendar' && (
          <CalendarView
            posts={scheduledPosts.filter(p => p.status === 'scheduled')}
            onEditPost={handleEditPost}
            onUpdateStatus={handleUpdatePostStatus}
          />
        )}
        
        {activeTab === 'status' && (
          <StatusManagement
            posts={scheduledPosts}
            loading={postsLoading}
            onUpdateStatus={handleUpdatePostStatus}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
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
            onUse={incrementUsage}
          />
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
          onSave={handleEditComplete}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
}
