// /src/schedulecomponent/ScheduleComponent.tsx - SYNC FIXES for hooks and workflow
import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle, Save } from 'lucide-react';
// FIXED: Import correct hooks that actually exist in useScheduleData.ts
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import PendingTab from './components/PendingTab';
import CalendarView from './components/CalendarView';
import StatusManagement from './components/StatusManagement';
import TemplateManager from './components/TemplateManager';
import ScheduleModal from './components/ScheduleModal';
import EditModal from './components/EditModal';
import { scheduleAPI } from './api/scheduleAPI';

interface ScheduleComponentProps {
  user?: { id: string } | null;
}

export default function ScheduleComponent({ user }: ScheduleComponentProps) {
  // FIXED: Use actual hooks from useScheduleData.ts instead of non-existent useScheduleManager
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
    templates,
    loading: templatesLoading,
    error: templatesError,
    refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage
  } = useTemplates();

  // FIXED: Add separate state for pending posts (workflow sync)
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState('pending');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // FIXED: Load pending posts function (workflow sync)
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

  // FIXED: Event handlers matching corrected workflow
  const handleSchedulePost = (post) => {
    setSelectedPost(post);
    setIsScheduleModalOpen(true);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await scheduleAPI.deletePendingPost(postId);
      await loadPendingPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleConfirmSchedule = async (scheduleData) => {
    if (!selectedPost) return;
    
    try {
      // FIXED: Create scheduled post from pending post (workflow sync)
      const scheduledPostData = {
        ...selectedPost,
        scheduled_date: new Date(scheduleData.scheduledDate),
        status: 'scheduled',
        timezone: scheduleData.timezone,
        repeatOption: scheduleData.repeatOption
      };

      await createScheduledPost(scheduledPostData);
      await scheduleAPI.deletePendingPost(selectedPost.id);
      await loadPendingPosts();
      
      setIsScheduleModalOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Failed to schedule post:', error);
      alert('Failed to schedule post');
    }
  };

  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setSelectedPost(null);
    loadPendingPosts();
    refreshScheduledPosts();
  };

  // FIXED: Load data on mount (workflow sync)
  React.useEffect(() => {
    if (user?.id) {
      loadPendingPosts();
      refreshScheduledPosts();
      refreshTemplates();
    }
  }, [user?.id]);

  // Tab configuration
  const tabs = [
    { id: 'pending', label: 'Pending Scheduling', icon: Clock, count: pendingPosts.length },
    { id: 'calendar', label: 'Calendar View', icon: Calendar, count: scheduledPosts.length },
    { id: 'status', label: 'Status Management', icon: CheckCircle, count: scheduledPosts.length },
    { id: 'templates', label: 'Saved Templates', icon: Save, count: templates.length }
  ];

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      borderRadius: '8px',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        paddingBottom: '16px',
        marginBottom: '24px'
      }}>
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

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        paddingBottom: '16px'
      }}>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: isActive 
                  ? (isDarkMode ? '#3b82f6' : '#2563eb')
                  : 'transparent',
                color: isActive 
                  ? 'white' 
                  : (isDarkMode ? '#94a3b8' : '#6b7280'),
                fontFamily: 'inherit'
              }}
            >
              <IconComponent size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  backgroundColor: isActive 
                    ? 'rgba(255,255,255,0.2)' 
                    : (isDarkMode ? '#475569' : '#e5e7eb'),
                  padding: '2px 6px',
                  borderRadius: '10px',
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
            loading={pendingLoading}
            error={pendingError}
            onSchedule={handleSchedulePost}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        )}
        
        {activeTab === 'calendar' && (
          <CalendarView
            posts={scheduledPosts}
            onEditPost={handleEditPost}
          />
        )}
        
        {activeTab === 'status' && (
          <StatusManagement
            posts={scheduledPosts}
            loading={scheduledLoading}
            error={scheduledError}
            onUpdateStatus={updateScheduledPost}
            onDelete={deleteScheduledPost}
            onEdit={handleEditPost}
          />
        )}
        
        {activeTab === 'templates' && (
          <TemplateManager
            templates={templates}
            loading={templatesLoading}
            onCreate={createTemplate}
            onUpdate={updateTemplate}
            onDelete={deleteTemplate}
            onUse={incrementUsage}
            user={user}
          />
        )}
      </div>

      {/* Modals */}
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

      {isEditModalOpen && (
        <EditModal
          post={selectedPost}
          onSave={async (postId, updates) => {
            try {
              await scheduleAPI.updatePendingPost(postId, updates);
              handleEditComplete();
            } catch (error) {
              console.error('Failed to save post:', error);
              throw error;
            }
          }}
          onCancel={handleEditComplete}
        />
      )}
    </div>
  );
}
