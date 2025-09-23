// /src/schedulecomponent/ScheduleComponent.tsx - COMPLETE WITH ALL TABS
import React, { useState, useEffect } from 'react';
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

// Types for backward compatibility
interface PendingPost {
  id: string;
  content_id: string;
  characterProfile: string;
  theme: string;
  audience: string;
  media_type: string;
  template_type: string;
  platform: string;
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  media_files: any[];
  selected_platforms: string[];
  status: 'pending_schedule';
  created_date: Date;
  user_id?: string;
  created_by?: string;
  is_from_template?: boolean;
  source_template_id?: string;
  scheduled_date: Date;
  failure_reason?: string;
  last_attempt?: Date;
  retry_count?: number;
  original_post_id?: string;
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  persona_target?: string;
  audience_segment?: string;
  campaign_id?: string;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Available platforms configuration
const availablePlatforms = [
  { id: 'telegram', name: 'Telegram', isActive: true },
  { id: 'youtube', name: 'YouTube', isActive: true },
  { id: 'facebook', name: 'Facebook', isActive: true },
  { id: 'twitter', name: 'Twitter', isActive: true },
  { id: 'instagram', name: 'Instagram', isActive: true },
  { id: 'linkedin', name: 'LinkedIn', isActive: true },
];

// Character profiles mock data
const characterProfiles = [
  { id: 'profile1', name: 'Alex Johnson', username: 'alexj', role: 'Tech Influencer' },
  { id: 'profile2', name: 'Sarah Davis', username: 'sarahd', role: 'Marketing Expert' },
  { id: 'profile3', name: 'Mike Chen', username: 'mikec', role: 'Business Analyst' },
];

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);

  // Get theme
  const { isDarkMode } = getTheme();

  // Load pending posts from localStorage and listen for new ones
  useEffect(() => {
    const handleNewPendingPost = (event: CustomEvent) => {
      const newPost = event.detail;
      setPendingPosts(prev => {
        const exists = prev.some(p => p.content_id === newPost.content_id);
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
            created_date: new Date(post.created_date || post.createdDate),
            scheduled_date: new Date() // Default for pending posts
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

  // Convert localStorage pending posts to ScheduledPost format
  const convertedPendingPosts: ScheduledPost[] = pendingPosts.map(post => ({
    id: post.id,
    content_id: post.content_id || post.id,
    character_profile: post.characterProfile || '',
    theme: post.theme || '',
    audience: post.audience || '',
    media_type: post.media_type || '',
    template_type: post.template_type || '',
    platform: post.platform || '',
    title: post.title || '',
    description: post.description || '',
    hashtags: post.hashtags || [],
    keywords: post.keywords || '',
    cta: post.cta || '',
    media_files: post.media_files || [],
    selected_platforms: post.selected_platforms || [],
    scheduled_date: new Date(), // Will be set when scheduled
    status: 'pending_schedule' as const,
    created_date: post.created_date,
    user_id: post.user_id || '',
    created_by: post.created_by || '',
    is_from_template: post.is_from_template || false,
    source_template_id: post.source_template_id,
    original_post_id: post.original_post_id,
    priority_level: post.priority_level,
    persona_target: post.persona_target,
    audience_segment: post.audience_segment,
    campaign_id: post.campaign_id
  }));

  // Use localStorage pending posts or hook pending posts
  const allPendingPosts = convertedPendingPosts.length > 0 ? convertedPendingPosts : pendingPostsFromHook;

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
      
      const scheduledPost: ScheduledPost = {
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
      
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  };

  const handleEditPost = (post: ScheduledPost) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedPost = async (postId: string, updates: Partial<ScheduledPost>) => {
    try {
      if (updatePost) {
        await updatePost(postId, updates);
      }
      
      setIsEditModalOpen(false);
      setSelectedPost(null);
      if (refreshPosts) await refreshPosts();
      
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
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
        
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleRetryPost = async (postId: string) => {
    try {
      if (updatePost) {
        await updatePost(postId, { 
          status: 'pending',
          retry_count: 0,
          failure_reason: undefined
        });
      }
      if (refreshPosts) await refreshPosts();
    } catch (error) {
      console.error('Failed to retry post:', error);
    }
  };

  const handleUpdateStatus = async (postId: string, newStatus: any) => {
    try {
      if (updatePost) {
        await updatePost(postId, { status: newStatus });
      }
      if (refreshPosts) await refreshPosts();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Template handlers
  const handleCreateTemplate = async (templateData: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (createTemplate) {
        await createTemplate(templateData);
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleUpdateTemplate = async (id: string, updates: Partial<SavedTemplate>) => {
    try {
      if (updateTemplate) {
        await updateTemplate(id, updates);
      }
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      if (deleteTemplate) {
        await deleteTemplate(id);
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      if (incrementUsage) {
        await incrementUsage(templateId);
      }
    } catch (error) {
      console.error('Failed to increment template usage:', error);
    }
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
    const newPendingPost = {
      id: 'pending-' + Date.now(),
      content_id: 'template-' + template.id + '-' + Date.now(),
      characterProfile: template.character_profile,
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
      created_date: new Date(),
      user_id: template.user_id,
      created_by: template.created_by,
      is_from_template: true,
      source_template_id: template.id
    };
    
    setPendingPosts(prev => [newPendingPost, ...prev]);
    
    // Also save to localStorage
    const storedPosts = JSON.parse(localStorage.getItem('pendingSchedulePosts') || '[]');
    storedPosts.unshift(newPendingPost);
    localStorage.setItem('pendingSchedulePosts', JSON.stringify(storedPosts));
    
    setActiveTab('pending');
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
          <PendingTab
            posts={allPendingPosts}
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
            onCreate={handleCreateTemplate}
            onUpdate={handleUpdateTemplate}
            onDelete={handleDeleteTemplate}
            onUse={handleUseTemplate}
            onLoadTemplate={handleLoadTemplate}
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

      {isEditModalOpen && selectedPost && (
        <EditModal
          post={selectedPost}
          onSave={handleSaveEditedPost}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedPost(null);
          }}
          availablePlatforms={availablePlatforms}
          characterProfiles={characterProfiles}
        />
      )}

      {/* CSS Animations */}
      <style>{getCSSAnimations()}</style>
    </div>
  );
}
