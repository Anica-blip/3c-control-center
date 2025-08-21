import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Edit3, Trash2, RefreshCw, Eye, AlertCircle, CheckCircle, Play, X, Plus, ChevronLeft, ChevronRight, Save } from 'lucide-react';

// Types
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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  const [selectedPendingPost, setSelectedPendingPost] = useState<PendingPost | null>(null);
  const [selectedScheduledPost, setSelectedScheduledPost] = useState<ScheduledPost | null>(null);
  const [editingPost, setEditingPost] = useState<PendingPost | ScheduledPost | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
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

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform || { icon: 'UN', color: '#9ca3af' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { borderLeft: '4px solid #f59e0b', backgroundColor: '#fefce8' };
      case 'processing': return { borderLeft: '4px solid #3b82f6', backgroundColor: '#dbeafe' };
      case 'complete': return { borderLeft: '4px solid #10b981', backgroundColor: '#d1fae5' };
      case 'failed': return { borderLeft: '4px solid #ef4444', backgroundColor: '#fee2e2' };
      case 'resending': return { borderLeft: '4px solid #f97316', backgroundColor: '#fed7aa' };
      default: return { borderLeft: '4px solid #9ca3af', backgroundColor: '#f9fafb' };
    }
  };

  const getStatusIcon = (status: string) => {
    const iconStyle = { height: '12px', width: '12px' };
    switch (status) {
      case 'pending': return <Clock style={{...iconStyle, color: '#d97706'}} />;
      case 'processing': return <Play style={{...iconStyle, color: '#2563eb'}} />;
      case 'complete': return <CheckCircle style={{...iconStyle, color: '#059669'}} />;
      case 'failed': return <AlertCircle style={{...iconStyle, color: '#dc2626'}} />;
      case 'resending': return <RefreshCw style={{...iconStyle, color: '#ea580c'}} />;
      default: return null;
    }
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  // Modal handlers
  const handleSchedulePost = (post: PendingPost) => {
    setSelectedPendingPost(post);
    setIsScheduleModalOpen(true);
  };

  const handleEditPost = (post: PendingPost | ScheduledPost) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleSaveTemplate = (post: ScheduledPost) => {
    setSelectedScheduledPost(post);
    setTemplateName(`${post.type} Template`);
    setIsSaveTemplateModalOpen(true);
  };

  const handleEditTemplate = (template: SavedTemplate) => {
    setEditingTemplate(template);
    setIsEditTemplateModalOpen(true);
  };

  const handleCopyTemplate = (template: SavedTemplate) => {
    const newPendingPost: PendingPost = {
      id: 'pending-' + Date.now(),
      characterProfile: template.characterProfile,
      type: template.type,
      template: `Copy of ${template.name}`,
      description: template.description,
      mediaFiles: [],
      platforms: template.platforms,
      status: 'pending_schedule',
      createdDate: new Date()
    };
    
    setPendingPosts(prev => [newPendingPost, ...prev]);
    setActiveTab('pending');
    alert('Template copied to Pending Scheduling for editing!');
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

  const handleSaveEdit = () => {
    if (editingPost) {
      if ('scheduledDate' in editingPost) {
        setScheduledPosts(prev => prev.map(p => p.id === editingPost.id ? editingPost as ScheduledPost : p));
      } else {
        setPendingPosts(prev => prev.map(p => p.id === editingPost.id ? editingPost as PendingPost : p));
      }
      setIsEditModalOpen(false);
      setEditingPost(null);
      alert('Post updated successfully!');
    }
  };

  const handleSaveTemplateEdit = () => {
    if (editingTemplate) {
      setSavedTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      ));
      setIsEditTemplateModalOpen(false);
      setEditingTemplate(null);
      alert('Template updated successfully!');
    }
  };

  const handleConfirmSaveTemplate = () => {
    if (selectedScheduledPost && templateName.trim()) {
      const newTemplate: SavedTemplate = {
        id: 'template-' + Date.now(),
        name: templateName.trim(),
        characterProfile: selectedScheduledPost.characterProfile,
        type: selectedScheduledPost.type,
        description: selectedScheduledPost.description,
        platforms: selectedScheduledPost.platforms,
        createdDate: new Date(),
        usageCount: 0
      };
      
      setSavedTemplates(prev => [...prev, newTemplate]);
      setIsSaveTemplateModalOpen(false);
      setSelectedScheduledPost(null);
      setTemplateName('');
      alert('Template saved successfully!');
    }
  };

  const handleCopyToPending = (post: ScheduledPost) => {
    const newPendingPost: PendingPost = {
      id: 'pending-' + Date.now(),
      characterProfile: post.characterProfile,
      type: post.type,
      template: post.template,
      description: post.description,
      mediaFiles: post.mediaFiles,
      platforms: post.platforms,
      status: 'pending_schedule',
      createdDate: new Date()
    };
    
    setPendingPosts(prev => [newPendingPost, ...prev]);
    alert('Post copied to Pending Scheduling for modification!');
  };

  const handleUseTemplate = (template: SavedTemplate) => {
    const newPendingPost: PendingPost = {
      id: 'pending-' + Date.now(),
      characterProfile: template.characterProfile,
      type: template.type,
      template: template.name,
      description: template.description,
      mediaFiles: [],
      platforms: template.platforms,
      status: 'pending_schedule',
      createdDate: new Date()
    };
    
    setPendingPosts(prev => [newPendingPost, ...prev]);
    setSavedTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
    setActiveTab('pending');
    alert('Template added to Pending Scheduling!');
  };

  const renderStatusManagement = () => {
    const statusCounts = {
      all: scheduledPosts.length,
      pending: scheduledPosts.filter(p => p.status === 'pending').length,
      processing: scheduledPosts.filter(p => p.status === 'processing').length,
      complete: scheduledPosts.filter(p => p.status === 'complete').length,
      failed: scheduledPosts.filter(p => p.status === 'failed').length,
      resending: scheduledPosts.filter(p => p.status === 'resending').length,
    };

    const filteredPosts = statusFilter === 'all' 
      ? scheduledPosts 
      : scheduledPosts.filter(post => post.status === statusFilter);

    const statusTabs = [
      { id: 'all', label: 'All Posts', count: statusCounts.all },
      { id: 'pending', label: 'Pending', count: statusCounts.pending },
      { id: 'processing', label: 'Processing', count: statusCounts.processing },
      { id: 'complete', label: 'Complete', count: statusCounts.complete },
      { id: 'failed', label: 'Failed', count: statusCounts.failed },
      { id: 'resending', label: 'Resending', count: statusCounts.resending },
    ];

    if (scheduledPosts.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#6b7280'
        }}>
          <Calendar style={{
            height: '64px',
            width: '64px',
            color: '#d1d5db',
            margin: '0 auto 16px auto'
          }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            No scheduled posts yet
          </h3>
          <p style={{
            color: '#6b7280',
            maxWidth: '400px',
            margin: '0 auto',
            fontSize: '14px'
          }}>
            Posts will appear here once you schedule them from the Pending Scheduling tab. 
            Start by scheduling your first post!
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gap: '24px' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <div style={{
            display: 'flex',
            gap: '32px',
            overflowX: 'auto',
            marginBottom: '-1px'
          }}>
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '8px 4px',
                  borderBottom: statusFilter === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: statusFilter === tab.id ? '#2563eb' : '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (statusFilter !== tab.id) {
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.borderBottom = '2px solid #d1d5db';
                  }
                }}
                onMouseOut={(e) => {
                  if (statusFilter !== tab.id) {
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.borderBottom = '2px solid transparent';
                  }
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    padding: '2px 8px',
                    fontSize: '12px',
                    borderRadius: '12px',
                    backgroundColor: statusFilter === tab.id ? '#dbeafe' : '#f3f4f6',
                    color: statusFilter === tab.id ? '#2563eb' : '#6b7280'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredPosts.map((post) => (
            <div key={post.id} style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      borderRadius: '12px',
                      fontWeight: '500',
                      backgroundColor: 
                        post.status === 'pending' ? '#fef3c7' :
                        post.status === 'processing' ? '#dbeafe' :
                        post.status === 'complete' ? '#d1fae5' :
                        post.status === 'failed' ? '#fee2e2' : '#fed7aa',
                      color:
                        post.status === 'pending' ? '#92400e' :
                        post.status === 'processing' ? '#1e40af' :
                        post.status === 'complete' ? '#065f46' :
                        post.status === 'failed' ? '#991b1b' : '#9a3412'
                    }}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {new Date(post.scheduledDate).toLocaleString()}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#2563eb'
                    }}>
                      {post.characterProfile}
                    </span>
                  </div>
                  
                  <p style={{
                    color: '#111827',
                    marginBottom: '12px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    margin: '0 0 12px 0'
                  }}>
                    {post.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    fontSize: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ color: '#6b7280' }}>Platforms:</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {post.platforms.map((platform, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: '500',
                              backgroundColor: platforms.find(p => p.id === platform.platformId)?.color || '#9ca3af'
                            }}
                          >
                            {platform.platformIcon}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {post.mediaFiles.length > 0 && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#6b7280'
                      }}>
                        <Eye style={{ height: '14px', width: '14px' }} />
                        <span>{post.mediaFiles.length} file(s)</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginLeft: '24px'
                }}>
                  <button
                    onClick={() => handleEditPost(post)}
                    style={{
                      padding: '8px',
                      color: '#6b7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Edit"
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#3b82f6';
                      e.currentTarget.style.backgroundColor = '#dbeafe';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Edit3 style={{ height: '16px', width: '16px' }} />
                  </button>
                  
                  <button
                    onClick={() => handleSaveTemplate(post)}
                    style={{
                      padding: '8px',
                      color: '#6b7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Save as Template"
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#10b981';
                      e.currentTarget.style.backgroundColor = '#d1fae5';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Save style={{ height: '16px', width: '16px' }} />
                  </button>

                  <button
                    onClick={() => handleCopyToPending(post)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '6px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="Copy to Pending Scheduling"
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#bfdbfe';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#dbeafe';
                    }}
                  >
                    Copy
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this scheduled post?')) {
                        setScheduledPosts(prev => prev.filter(p => p.id !== post.id));
                        alert('Post deleted successfully!');
                      }
                    }}
                    style={{
                      padding: '8px',
                      color: '#6b7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Delete"
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#6b7280';
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
    );
  };

  const renderSavedTemplates = () => {
    return (
      <div style={{ display: 'grid', gap: '24px' }}>
        {savedTemplates.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <Save style={{
              height: '48px',
              width: '48px',
              color: '#9ca3af',
              margin: '0 auto 16px auto'
            }} />
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              No Saved Templates
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: '0'
            }}>
              Save templates from Status Management to reuse them here.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            {savedTemplates.map((template) => (
              <div key={template.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                transition: 'box-shadow 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0'
                  }}>
                    {template.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      style={{
                        padding: '4px',
                        color: '#6b7280',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Edit Template"
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = '#3b82f6';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      <Edit3 style={{ height: '14px', width: '14px' }} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          setSavedTemplates(prev => prev.filter(t => t.id !== template.id));
                          alert('Template deleted successfully!');
                        }
                      }}
                      style={{
                        padding: '4px',
                        color: '#6b7280',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Delete Template"
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      <Trash2 style={{ height: '14px', width: '14px' }} />
                    </button>
                  </div>
                </div>
                
                <div style={{
                  display: 'grid',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: '#6b7280' }}>Profile:</span>
                    <span style={{
                      fontWeight: '500',
                      color: '#2563eb'
                    }}>
                      {template.characterProfile}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: '#6b7280' }}>Type:</span>
                    <span style={{ color: '#111827' }}>{template.type}</span>
                  </div>
                  
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Description:</span>
                    <p style={{
                      color: '#111827',
                      marginTop: '4px',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      margin: '4px 0 0 0'
                    }}>
                      {template.description}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: '#6b7280' }}>Platforms:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {template.platforms.map((platform, idx) => {
                        const platformInfo = getPlatformIcon(platform.platformId);
                        return (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 6px',
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280'
                  }}>
                    Used {template.usageCount} times
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleCopyTemplate(template)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      fontSize: '12px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    Copy & Edit
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontSize: '12px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }}
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'pending', label: 'Pending Scheduling', icon: Clock },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'status', label: 'Status Management', icon: CheckCircle },
    { id: 'saved', label: 'Saved Templates', icon: Save },
  ];

  return (
    <div style={{
      display: 'grid',
      gap: '20px',
      padding: '20px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 4px 0'
          }}>
            📅 Schedule Manager
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0'
          }}>
            Schedule posts and track their delivery status
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '12px'
        }}>
          <div style={{
            backgroundColor: '#fed7aa',
            color: '#9a3412',
            padding: '6px 12px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            {pendingPosts.length} pending scheduling
          </div>
          <div style={{
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            padding: '6px 12px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            {scheduledPosts.filter(p => p.status === 'pending').length} scheduled
          </div>
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '6px 12px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            {savedTemplates.length} templates
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'white',
        borderRadius: '8px 8px 0 0'
      }}>
        <div style={{
          display: 'flex',
          gap: '32px',
          padding: '0 24px',
          marginBottom: '-1px'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 4px',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.borderBottom = '2px solid #d1d5db';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.borderBottom = '2px solid transparent';
                  }
                }}
              >
                <Icon style={{ height: '16px', width: '16px' }} />
                <span>{tab.label}</span>
                {tab.id === 'pending' && pendingPosts.length > 0 && (
                  <span style={{
                    backgroundColor: '#fed7aa',
                    color: '#9a3412',
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
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
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
                backgroundColor: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center'
              }}>
                <Clock style={{
                  height: '48px',
                  width: '48px',
                  color: '#3b82f6',
                  margin: '0 auto 16px auto'
                }} />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1e3a8a',
                  margin: '0 0 8px 0'
                }}>
                  Ready for Scheduling
                </h3>
                <p style={{
                  color: '#1e40af',
                  fontSize: '14px',
                  margin: '0'
                }}>
                  Posts from Content Manager will appear here for scheduling
                </p>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#dbeafe',
                  borderBottom: '1px solid #93c5fd',
                  borderRadius: '8px 8px 0 0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Clock style={{
                      height: '20px',
                      width: '20px',
                      color: '#2563eb'
                    }} />
                    <h2 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e3a8a',
                      margin: '0'
                    }}>
                      Pending Scheduling ({pendingPosts.length})
                    </h2>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#1e40af',
                    marginTop: '4px',
                    margin: '4px 0 0 0'
                  }}>
                    Click "Schedule" to set date and time for these posts
                  </p>
                </div>
                
                <div>
                  {pendingPosts.map((post, index) => (
                    <div key={post.id} style={{
                      padding: '20px',
                      borderBottom: index < pendingPosts.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{
                          flex: 1,
                          minWidth: 0
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '12px'
                          }}>
                            <span style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              backgroundColor: '#fed7aa',
                              color: '#9a3412',
                              borderRadius: '12px',
                              fontWeight: '500'
                            }}>
                              Ready to Schedule
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: '#6b7280'
                            }}>
                              Created {post.createdDate.toLocaleDateString()}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#2563eb'
                            }}>
                              {post.characterProfile}
                            </span>
                          </div>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{
                              color: '#111827',
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
                            color: '#6b7280'
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
                                        padding: '4px 6px',
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
                              padding: '8px 16px',
                              backgroundColor: '#4b5563',
                              color: 'white',
                              fontSize: '12px',
                              borderRadius: '6px',
                              fontWeight: '500',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            title="Edit Post Content"
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#374151';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#4b5563';
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSchedulePost(post)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              borderRadius: '6px',
                              fontWeight: '500',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#2563eb';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#3b82f6';
                            }}
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this post?')) {
                                setPendingPosts(prev => prev.filter(p => p.id !== post.id));
                                alert('Post deleted successfully!');
                              }
                            }}
                            style={{
                              padding: '8px',
                              color: '#6b7280',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title="Delete"
                            onMouseOver={(e) => {
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.color = '#6b7280';
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

        {activeTab === 'calendar' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <Calendar style={{
              height: '64px',
              width: '64px',
              color: '#d1d5db',
              margin: '0 auto 16px auto'
            }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              Calendar View Coming Soon
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: '0'
            }}>
              Advanced calendar functionality will be available in the next update
            </p>
          </div>
        )}

        {activeTab === 'status' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px'
          }}>
            {renderStatusManagement()}
          </div>
        )}

        {activeTab === 'saved' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px'
          }}>
            {renderSavedTemplates()}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && selectedPendingPost && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            margin: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0',
                color: '#111827'
              }}>
                Schedule Post
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                style={{
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>
            
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#2563eb'
                }}>
                  {selectedPendingPost.characterProfile}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  •
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {selectedPendingPost.type}
                </span>
              </div>
              <p style={{
                color: '#111827',
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
                  color: '#6b7280'
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
                          padding: '4px 6px',
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
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Date
                </label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Time
                </label>
                <input
                  type="time"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
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
                  padding: '10px 16px',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '6px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingPost && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            margin: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0',
                color: '#111827'
              }}>
                Edit Post
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Character Profile
                </label>
                <input
                  type="text"
                  value={editingPost.characterProfile}
                  onChange={(e) => setEditingPost({ ...editingPost, characterProfile: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Type
                </label>
                <input
                  type="text"
                  value={editingPost.type}
                  onChange={(e) => setEditingPost({ ...editingPost, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Description
                </label>
                <textarea
                  value={editingPost.description}
                  onChange={(e) => setEditingPost({ ...editingPost, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  padding: '10px 16px',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '6px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {isSaveTemplateModalOpen && selectedScheduledPost && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            margin: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0',
                color: '#111827'
              }}>
                Save as Template
              </h2>
              <button
                onClick={() => setIsSaveTemplateModalOpen(false)}
                style={{
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                padding: '12px'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  This will save the following as a template:
                </p>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  margin: '0'
                }}>
                  {selectedScheduledPost.description}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setIsSaveTemplateModalOpen(false)}
                style={{
                  padding: '10px 16px',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveTemplate}
                disabled={!templateName.trim()}
                style={{
                  padding: '10px 24px',
                  backgroundColor: !templateName.trim() ? '#d1d5db' : '#10b981',
                  color: !templateName.trim() ? '#9ca3af' : 'white',
                  borderRadius: '6px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: !templateName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  if (templateName.trim()) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseOut={(e) => {
                  if (templateName.trim()) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }
                }}
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {isEditTemplateModalOpen && editingTemplate && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            margin: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0',
                color: '#111827'
              }}>
                Edit Template
              </h2>
              <button
                onClick={() => setIsEditTemplateModalOpen(false)}
                style={{
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Template Name
                </label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Character Profile
                </label>
                <input
                  type="text"
                  value={editingTemplate.characterProfile}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, characterProfile: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Type
                </label>
                <input
                  type="text"
                  value={editingTemplate.type}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Description
                </label>
                <textarea
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Current Platforms
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {editingTemplate.platforms.map((platform, idx) => {
                    const platformInfo = getPlatformIcon(platform.platformId);
                    return (
                      <span
                        key={idx}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: platformInfo.color
                        }}
                        title={platform.platformName}
                      >
                        {platformInfo.icon} {platform.platformName}
                      </span>
                    );
                  })}
                </div>
                <p style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginTop: '4px',
                  margin: '4px 0 0 0'
                }}>
                  Platform selection will be available when integrated with Content Manager
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setIsEditTemplateModalOpen(false)}
                style={{
                  padding: '10px 16px',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplateEdit}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '6px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
