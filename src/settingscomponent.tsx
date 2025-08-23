import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Edit3, Trash2, RefreshCw, Eye, AlertCircle, CheckCircle, Play, X, Plus, ChevronLeft, ChevronRight, Save } from 'lucide-react';

// Types (keeping existing types but adding better styling)
interface PendingPost {
  id: string;
  characterProfile: string;
  type: string;
  template: string;
  description: string;
  mediaFiles: MediaFile[];
  platforms: PlatformAssignment[];
  status: 'pending_schedule';
  createdDate: Date;
}

interface ScheduledPost {
  id: string;
  characterProfile: string;
  type: string;
  template: string;
  description: string;
  mediaFiles: MediaFile[];
  platforms: PlatformAssignment[];
  scheduledDate: Date;
  status: 'pending' | 'processing' | 'complete' | 'failed' | 'resending';
  failureReason?: string;
  createdDate: Date;
  lastAttempt?: Date;
  retryCount?: number;
}

interface SavedTemplate {
  id: string;
  name: string;
  characterProfile: string;
  type: string;
  description: string;
  platforms: PlatformAssignment[];
  createdDate: Date;
  usageCount: number;
}

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'gif' | 'interactive' | 'other';
  size: number;
  url: string;
}

interface PlatformAssignment {
  platformId: string;
  platformName: string;
  platformIcon: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  errorMessage?: string;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Main Component
export default function ScheduleComponent() {
  const [activeTab, setActiveTab] = useState('pending');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  
  // Selected items
  const [selectedPendingPost, setSelectedPendingPost] = useState<PendingPost | null>(null);
  const [selectedScheduledPost, setSelectedScheduledPost] = useState<ScheduledPost | null>(null);
  const [editingPost, setEditingPost] = useState<PendingPost | ScheduledPost | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  
  // Data states
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');

  // Platform configuration
  const platforms: Platform[] = [
    { id: '1', name: 'Telegram', icon: 'TG', color: '#3b82f6' },
    { id: '2', name: 'YouTube', icon: 'YT', color: '#ef4444' },
    { id: '3', name: 'Facebook', icon: 'FB', color: '#2563eb' },
    { id: '4', name: 'Twitter', icon: 'TW', color: '#0ea5e9' },
    { id: '5', name: 'Forum', icon: 'FR', color: '#4b5563' },
  ];

  // Styles
  const containerStyle = {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#f9fafb' : '#111827'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    color: isDarkMode ? '#f9fafb' : '#111827'
  };

  const subtitleStyle = {
    color: isDarkMode ? '#d1d5db' : '#6b7280',
    fontSize: '14px',
    margin: '0'
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: isDarkMode 
      ? '0 10px 25px -3px rgba(0, 0, 0, 0.3)' 
      : '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
  };

  const tabsContainerStyle = {
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '8px 8px 0 0',
    marginBottom: '24px',
    boxShadow: isDarkMode 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const getTabStyle = (tabId) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
    borderBottom: activeTab === tabId ? '2px solid #3b82f6' : '2px solid transparent',
    fontWeight: '500',
    fontSize: '14px',
    color: activeTab === tabId ? '#2563eb' : (isDarkMode ? '#d1d5db' : '#6b7280'),
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  const buttonStyle = {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
    color: isDarkMode ? '#f9fafb' : '#374151',
    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
    color: isDarkMode ? '#f9fafb' : '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    backdropFilter: 'blur(4px)'
  };

  const modalContentStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '600px',
    width: '90%',
    margin: '16px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    boxShadow: isDarkMode 
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
      : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  // Initialize with sample data
  useEffect(() => {
    if (pendingPosts.length === 0) {
      const samplePosts: PendingPost[] = [
        {
          id: 'pending-1',
          characterProfile: 'Business Professional',
          type: 'Announcement',
          template: 'Standard Post',
          description: 'Meet Jan our Admin Support and 3C Community Mentor',
          mediaFiles: [{ id: '1', name: 'team-photo.jpg', type: 'image', size: 1024000, url: '#' }],
          platforms: [
            { platformId: '1', platformName: 'Telegram', platformIcon: 'TG', status: 'pending' },
            { platformId: '5', platformName: 'Forum', platformIcon: 'FR', status: 'pending' }
          ],
          status: 'pending_schedule',
          createdDate: new Date()
        },
        {
          id: 'pending-2',
          characterProfile: 'Marketing Expert',
          type: 'Promotional',
          template: 'Product Launch',
          description: 'Exciting new features coming to our platform! Get ready for enhanced productivity tools.',
          mediaFiles: [{ id: '2', name: 'feature-preview.png', type: 'image', size: 2048000, url: '#' }],
          platforms: [
            { platformId: '2', platformName: 'YouTube', platformIcon: 'YT', status: 'pending' },
            { platformId: '3', platformName: 'Facebook', platformIcon: 'FB', status: 'pending' },
            { platformId: '4', platformName: 'Twitter', platformIcon: 'TW', status: 'pending' }
          ],
          status: 'pending_schedule',
          createdDate: new Date(Date.now() - 86400000)
        }
      ];
      setPendingPosts(samplePosts);
      
      const sampleScheduled: ScheduledPost[] = [
        {
          id: 'scheduled-1',
          characterProfile: 'Community Manager',
          type: 'Update',
          template: 'Weekly Update',
          description: 'Weekly community highlights and upcoming events',
          mediaFiles: [],
          platforms: [
            { platformId: '1', platformName: 'Telegram', platformIcon: 'TG', status: 'pending' },
            { platformId: '5', platformName: 'Forum', platformIcon: 'FR', status: 'pending' }
          ],
          scheduledDate: new Date(Date.now() + 172800000),
          status: 'pending',
          createdDate: new Date(Date.now() - 3600000)
        },
        {
          id: 'scheduled-2',
          characterProfile: 'Technical Writer',
          type: 'Tutorial',
          template: 'How-to Guide',
          description: 'Advanced tips for maximizing your workflow efficiency',
          mediaFiles: [{ id: '3', name: 'tutorial-video.mp4', type: 'video', size: 10240000, url: '#' }],
          platforms: [
            { platformId: '2', platformName: 'YouTube', platformIcon: 'YT', status: 'pending' }
          ],
          scheduledDate: new Date(Date.now() + 259200000),
          status: 'complete',
          createdDate: new Date(Date.now() - 7200000)
        }
      ];
      setScheduledPosts(sampleScheduled);

      const sampleTemplates: SavedTemplate[] = [
        {
          id: 'template-1',
          name: 'Team Introduction',
          characterProfile: 'Business Professional',
          type: 'Announcement',
          description: 'Template for introducing new team members',
          platforms: [
            { platformId: '1', platformName: 'Telegram', platformIcon: 'TG', status: 'pending' },
            { platformId: '5', platformName: 'Forum', platformIcon: 'FR', status: 'pending' }
          ],
          createdDate: new Date(Date.now() - 86400000 * 3),
          usageCount: 5
        }
      ];
      setSavedTemplates(sampleTemplates);
    }
  }, [pendingPosts.length]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: { bg: isDarkMode ? '#422006' : '#fef3c7', text: isDarkMode ? '#fbbf24' : '#92400e', border: '#f59e0b' },
      processing: { bg: isDarkMode ? '#1e3a8a' : '#dbeafe', text: isDarkMode ? '#60a5fa' : '#1e40af', border: '#3b82f6' },
      complete: { bg: isDarkMode ? '#064e3b' : '#d1fae5', text: isDarkMode ? '#34d399' : '#065f46', border: '#10b981' },
      failed: { bg: isDarkMode ? '#7f1d1d' : '#fee2e2', text: isDarkMode ? '#f87171' : '#991b1b', border: '#ef4444' },
      resending: { bg: isDarkMode ? '#9a3412' : '#fed7aa', text: isDarkMode ? '#fb923c' : '#9a3412', border: '#f97316' }
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const iconStyle = { height: '14px', width: '14px' };
    switch (status) {
      case 'pending': return <Clock style={{...iconStyle, color: '#f59e0b'}} />;
      case 'processing': return <Play style={{...iconStyle, color: '#3b82f6'}} />;
      case 'complete': return <CheckCircle style={{...iconStyle, color: '#10b981'}} />;
      case 'failed': return <AlertCircle style={{...iconStyle, color: '#ef4444'}} />;
      case 'resending': return <RefreshCw style={{...iconStyle, color: '#f97316'}} />;
      default: return null;
    }
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform || { icon: 'UN', color: isDarkMode ? '#6b7280' : '#9ca3af' };
  };

  // Event handlers
  const handleSchedulePost = (post: PendingPost) => {
    setSelectedPendingPost(post);
    setIsScheduleModalOpen(true);
  };

  const handleEditPost = (post: PendingPost | ScheduledPost) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (selectedPendingPost) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      
      const scheduledPost: ScheduledPost = {
        ...selectedPendingPost,
        scheduledDate: tomorrow,
        status: 'pending'
      };
      
      setScheduledPosts(prev => [...prev, scheduledPost]);
      setPendingPosts(prev => prev.filter(p => p.id !== selectedPendingPost.id));
      
      alert(`Post scheduled for ${tomorrow.toLocaleString()}!`);
      setIsScheduleModalOpen(false);
      setSelectedPendingPost(null);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending Scheduling', icon: Clock },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'status', label: 'Status Management', icon: CheckCircle },
    { id: 'saved', label: 'Saved Templates', icon: Save },
  ];

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>📅 Schedule Manager</h1>
          <p style={subtitleStyle}>Schedule posts and track their delivery status</p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '12px'
        }}>
          <div style={{
            backgroundColor: isDarkMode ? '#7c2d12' : '#fed7aa',
            color: isDarkMode ? '#fdba74' : '#9a3412',
            padding: '6px 12px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            {pendingPosts.length} pending scheduling
          </div>
          <div style={{
            backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
            color: isDarkMode ? '#60a5fa' : '#1e40af',
            padding: '6px 12px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            {scheduledPosts.filter(p => p.status === 'pending').length} scheduled
          </div>
          <div style={{
            backgroundColor: isDarkMode ? '#064e3b' : '#d1fae5',
            color: isDarkMode ? '#34d399' : '#065f46',
            padding: '6px 12px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            {savedTemplates.length} templates
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabsContainerStyle}>
        <div style={{
          display: 'flex',
          gap: '0',
          padding: '0 24px'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={getTabStyle(tab.id)}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = isDarkMode ? '#f3f4f6' : '#374151';
                    e.currentTarget.style.borderBottom = `2px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`;
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = isDarkMode ? '#d1d5db' : '#6b7280';
                    e.currentTarget.style.borderBottom = '2px solid transparent';
                  }
                }}
              >
                <Icon style={{ height: '16px', width: '16px' }} />
                <span>{tab.label}</span>
                {tab.id === 'pending' && pendingPosts.length > 0 && (
                  <span style={{
                    backgroundColor: isDarkMode ? '#7c2d12' : '#fed7aa',
                    color: isDarkMode ? '#fdba74' : '#9a3412',
                    padding: '2px 8px',
                    fontSize: '11px',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    {pendingPosts.length}
                  </span>
                )}
                {tab.id === 'saved' && savedTemplates.length > 0 && (
                  <span style={{
                    backgroundColor: isDarkMode ? '#064e3b' : '#d1fae5',
                    color: isDarkMode ? '#34d399' : '#065f46',
                    padding: '2px 8px',
                    fontSize: '11px',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    {savedTemplates.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ display: 'grid', gap: '24px' }}>
        {activeTab === 'pending' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            {pendingPosts.length === 0 ? (
              <div style={{
                ...cardStyle,
                background: isDarkMode 
                  ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
                  : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                textAlign: 'center',
                padding: '48px'
              }}>
                <Clock style={{
                  height: '48px',
                  width: '48px',
                  color: isDarkMode ? '#60a5fa' : '#3b82f6',
                  margin: '0 auto 16px auto'
                }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: isDarkMode ? '#dbeafe' : '#1e3a8a',
                  margin: '0 0 8px 0'
                }}>
                  Ready for Scheduling
                </h3>
                <p style={{
                  color: isDarkMode ? '#93c5fd' : '#1e40af',
                  fontSize: '14px',
                  margin: '0'
                }}>
                  Posts from Content Manager will appear here for scheduling
                </p>
              </div>
            ) : (
              <div style={cardStyle}>
                <div style={{
                  padding: '20px',
                  backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                  borderBottom: `1px solid ${isDarkMode ? '#3b82f6' : '#93c5fd'}`,
                  borderRadius: '12px 12px 0 0',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Clock style={{
                      height: '20px',
                      width: '20px',
                      color: isDarkMode ? '#dbeafe' : '#1e3a8a'
                    }} />
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: isDarkMode ? '#dbeafe' : '#1e3a8a',
                      margin: '0'
                    }}>
                      Pending Scheduling ({pendingPosts.length})
                    </h2>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: isDarkMode ? '#93c5fd' : '#1e40af',
                    marginTop: '4px',
                    margin: '4px 0 0 0'
                  }}>
                    Click "Schedule" to set date and time for these posts
                  </p>
                </div>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  {pendingPosts.map((post, index) => (
                    <div 
                      key={post.id} 
                      style={{
                        padding: '20px',
                        backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                        borderRadius: '12px',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : '#f3f4f6';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = isDarkMode 
                          ? '0 10px 25px -3px rgba(0, 0, 0, 0.4)' 
                          : '0 10px 25px -3px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#111827' : '#f9fafb';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
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
                            marginBottom: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              padding: '6px 12px',
                              fontSize: '11px',
                              backgroundColor: isDarkMode ? '#7c2d12' : '#fed7aa',
                              color: isDarkMode ? '#fdba74' : '#9a3412',
                              borderRadius: '12px',
                              fontWeight: '600'
                            }}>
                              Ready to Schedule
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: isDarkMode ? '#9ca3af' : '#6b7280'
                            }}>
                              Created {post.createdDate.toLocaleDateString()}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#3b82f6'
                            }}>
                              {post.characterProfile}
                            </span>
                          </div>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{
                              color: isDarkMode ? '#f9fafb' : '#111827',
                              fontSize: '14px',
                              lineHeight: '1.5',
                              margin: '0'
                            }}>
                              {post.description}
                            </p>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                            fontSize: '12px',
                            color: isDarkMode ? '#9ca3af' : '#6b7280'
                          }}>
                            {post.mediaFiles.length > 0 && (
                              <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <Eye style={{ height: '14px', width: '14px' }} />
                                <span>{post.mediaFiles.length} file(s)</span>
                              </span>
                            )}
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span>Platforms:</span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {post.platforms.map((platform, idx) => {
                                  const platformInfo = getPlatformIcon(platform.platformId);
                                  return (
                                    <span
                                      key={idx}
                                      style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: '500',
                                        backgroundColor: platformInfo.color
                                      }}
                                      title={platform.platformName}
                                    >
                                      {platformInfo.icon}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginLeft: '24px'
                        }}>
                          <button
                            onClick={() => handleEditPost(post)}
                            style={{
                              ...secondaryButtonStyle,
                              padding: '8px 16px',
                              fontSize: '12px'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSchedulePost(post)}
                            style={{
                              ...primaryButtonStyle,
                              padding: '10px 20px',
                              fontSize: '14px'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#2563eb';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#3b82f6';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            🚀 Schedule
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this post?')) {
                                setPendingPosts(prev => prev.filter(p => p.id !== post.id));
                              }
                            }}
                            style={{
                              padding: '8px',
                              color: isDarkMode ? '#f87171' : '#ef4444',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#7f1d1d' : '#fee2e2';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
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

        {/* Other tabs would go here with similar styling improvements */}
        {activeTab !== 'pending' && (
          <div style={cardStyle}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: isDarkMode ? '#f9fafb' : '#111827'
            }}>
              {activeTab === 'calendar' && '📅 Calendar View'}
              {activeTab === 'status' && '📊 Status Management'}
              {activeTab === 'saved' && '💾 Saved Templates'}
            </h3>
            <p style={{
              color: isDarkMode ? '#d1d5db' : '#6b7280',
              margin: '0'
            }}>
              Content for {activeTab} tab - styling will be applied consistently...
            </p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && selectedPendingPost && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0',
                color: isDarkMode ? '#f9fafb' : '#111827'
              }}>
                Schedule Post
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                style={{
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = isDarkMode ? '#f3f4f6' : '#374151';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = isDarkMode ? '#9ca3af' : '#6b7280';
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>
            
            <div style={{
              backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#3b82f6'
                }}>
                  {selectedPendingPost.characterProfile}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#9ca3af' : '#6b7280'
                }}>
                  •
                </span>
                <span style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#9ca3af' : '#6b7280'
                }}>
                  {selectedPendingPost.type}
                </span>
              </div>
              <p style={{
                color: isDarkMode ? '#f9fafb' : '#111827',
                marginBottom: '12px',
                fontSize: '14px',
                margin: '0 0 12px 0'
              }}>
                {selectedPendingPost.description}
              </p>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#9ca3af' : '#6b7280'
                }}>
                  Will post to:
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {selectedPendingPost.platforms.map((platform, idx) => {
                    const platformInfo = getPlatformIcon(platform.platformId);
                    return (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: '500',
                          backgroundColor: platformInfo.color
                        }}
                        title={platform.platformName}
                      >
                        {platformInfo.icon}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDarkMode ? '#f9fafb' : '#374151',
                  marginBottom: '8px'
                }}>
                  Date
                </label>
                <input
                  type="date"
                  style={inputStyle}
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDarkMode ? '#f9fafb' : '#374151',
                  marginBottom: '8px'
                }}>
                  Time
                </label>
                <input
                  type="time"
                  style={inputStyle}
                  defaultValue="09:00"
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                style={{
                  ...secondaryButtonStyle,
                  padding: '12px 20px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                style={{
                  ...primaryButtonStyle,
                  padding: '12px 24px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
