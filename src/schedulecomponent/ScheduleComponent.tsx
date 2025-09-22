// /src/schedulecomponent/ScheduleComponent.tsx - SYNC FIXES for hooks and workflow
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, Save, Edit3 } from 'lucide-react';
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
  onClose?: () => void;
}

export default function ScheduleComponent({ user, onClose }: ScheduleComponentProps) {
  // FIXED: Use correct hooks that actually exist and destructure properly
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

  // FIXED: Get theme from localStorage like other components
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // FIXED: Load pending posts on component mount
  useEffect(() => {
    const loadPendingPosts = async () => {
      try {
        await refreshPosts();
        await refreshTemplates();
      } catch (error) {
        console.error('Error loading schedule data:', error);
      }
    };

    loadPendingPosts();
  }, [refreshPosts, refreshTemplates]);

  // FIXED: Add missing handleEditPost function
  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  // FIXED: Sync with workflow - handle schedule confirmation
  const handleSchedulePost = (post) => {
    setSelectedPost(post);
    setIsScheduleModalOpen(true);
  };

  // FIXED: Proper integration with scheduleAPI
  const handleConfirmSchedule = async (scheduleData) => {
    if (!selectedPost) return;

    try {
      // Create scheduled post using the API
      await createPost({
        ...selectedPost,
        scheduled_date: new Date(scheduleData.scheduledDate),
        status: 'scheduled',
        user_id: user?.id,
        created_by: user?.id
      });
      
      setIsScheduleModalOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  };

  // FIXED: Add missing handlers for workflow sync
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
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleEditComplete = async (updatedPost) => {
    try {
      await updatePost(editingPost.id, updatedPost);
      setIsEditModalOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  // FIXED: Use inline styles like other components instead of className
  const containerStyle = {
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
    minHeight: '100vh',
    padding: '24px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const tabsContainerStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderRadius: '12px',
    padding: '8px',
    marginBottom: '24px',
    boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
    display: 'flex',
    gap: '4px'
  };

  const getTabStyle = (tabId, isActive) => ({
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
    backgroundColor: isActive 
      ? (isDarkMode ? '#3b82f6' : '#2563eb')
      : 'transparent',
    color: isActive 
      ? 'white' 
      : (isDarkMode ? '#94a3b8' : '#6b7280'),
    fontFamily: 'inherit'
  });

  const contentStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderRadius: '12px',
    boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
    overflow: 'hidden'
  };

  // FIXED: Define tabs with proper data
  const tabs = [
    { id: 'pending', label: 'Pending Scheduling', icon: Clock, count: scheduledPosts.filter(p => p.status === 'pending_schedule').length },
    { id: 'calendar', label: 'Calendar View', icon: Calendar, count: scheduledPosts.filter(p => p.status === 'scheduled').length },
    { id: 'status', label: 'Status Management', icon: CheckCircle, count: scheduledPosts.length },
    { id: 'saved', label: 'Saved Templates', icon: Save, count: savedTemplates.length }
  ];

  return (
    <div style={containerStyle}>
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
      <div style={tabsContainerStyle}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={getTabStyle(tab.id, activeTab === tab.id)}
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
                  color: activeTab === tab.id 
                    ? 'white' 
                    : 'white',
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
      <div style={contentStyle}>
        {activeTab === 'pending' && (
          <PendingTab
            posts={scheduledPosts.filter(p => p.status === 'pending_schedule')}
            loading={postsLoading}
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

      {/* FIXED: Proper modal integration */}
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
