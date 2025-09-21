// /src/schedulecomponent/ScheduleComponent.tsx
import React, { useState } from 'react';
import { useScheduledPosts, useTemplates } from './hooks/useScheduleData';
import PendingTab from './components/PendingTab';
import CalendarView from './components/CalendarView';
import StatusManagement from './components/StatusManagement';
import TemplateManager from './components/TemplateManager';
import ScheduleModal from './components/ScheduleModal';
import EditModal from './components/EditModal';
import { getTabStyle, getTheme } from './utils/styleUtils';

export default function ScheduleComponent() {
  // Use hooks instead of local state
  const {
    posts: scheduledPosts,
    loading: postsLoading,
    error: postsError,
    createPost,
    updatePost,
    deletePost
  } = useScheduledPosts();

  const {
    templates: savedTemplates,
    loading: templatesLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage
  } = useTemplates();

  // UI state only
  const [activeTab, setActiveTab] = useState('pending');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Get theme
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // Event handlers
  const handleSchedulePost = (post) => {
    setSelectedPost(post);
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async (scheduleData) => {
    try {
      await createPost({
        ...selectedPost,
        scheduled_date: scheduleData.scheduledDate,
        status: 'scheduled'
      });
      setIsScheduleModalOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  };

  // Render tabs and content
  const tabs = [
    { id: 'pending', label: 'Pending Scheduling', icon: 'Clock' },
    { id: 'calendar', label: 'Calendar View', icon: 'Calendar' },
    { id: 'status', label: 'Status Management', icon: 'CheckCircle' },
    { id: 'saved', label: 'Saved Templates', icon: 'Save' }
  ];

  return (
    <div className="schedule-container">
      {/* Status Summary */}
      <div className="status-summary">
        {/* Summary stats */}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={getTabStyle(tab.id, activeTab, isDarkMode)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'pending' && (
          <PendingTab
            posts={scheduledPosts.filter(p => p.status === 'pending_schedule')}
            loading={postsLoading}
            error={postsError}
            onSchedule={handleSchedulePost}
            onEdit={handleEditPost}
            onDelete={deletePost}
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
            loading={postsLoading}
            onUpdateStatus={updatePost}
            onDelete={deletePost}
          />
        )}
        
        {activeTab === 'saved' && (
          <TemplateManager
            templates={savedTemplates}
            loading={templatesLoading}
            onCreate={createTemplate}
            onUpdate={updateTemplate}
            onDelete={deleteTemplate}
            onUse={incrementUsage}
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
    </div>
  );
}
