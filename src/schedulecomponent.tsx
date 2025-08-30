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
  contentId?: string; // Added to track original content ID
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

  // Get dark mode state from localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // Platform configuration
  const platforms: Platform[] = [
    { id: '1', name: 'Telegram', icon: 'TG', color: '#3b82f6' },
    { id: '2', name: 'YouTube', icon: 'YT', color: '#ef4444' },
    { id: '3', name: 'Facebook', icon: 'FB', color: '#2563eb' },
    { id: '4', name: 'Twitter', icon: 'TW', color: '#0ea5e9' },
    { id: '5', name: 'Forum', icon: 'FR', color: '#4b5563' },
  ];

  // Helper function to truncate description to first two lines (approximately 120 characters)
  const truncateDescription = (description: string, maxLength: number = 120) => {
    if (description.length <= maxLength) return description;
    
    const truncated = description.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  };

  // Listen for posts from Content Manager
  useEffect(() => {
    const handleNewPendingPost = (event: CustomEvent) => {
      const newPost = event.detail;
      setPendingPosts(prev => {
        // Check if post already exists to avoid duplicates
        const exists = prev.some(p => p.contentId === newPost.contentId);
        if (exists) return prev;
        
        return [newPost, ...prev];
      });
    };

    // Load existing pending posts from localStorage
    const loadPendingPosts = () => {
      try {
        const stored = localStorage.getItem('pendingSchedulePosts');
        if (stored) {
          const posts = JSON.parse(stored).map((post: any) => ({
            ...post,
            createdDate: new Date(post.createdDate)
          }));
          setPendingPosts(posts);
        }
      } catch (error) {
        console.error('Error loading pending posts:', error);
      }
    };

    // Initial load
    loadPendingPosts();

    // Listen for new posts from Content Manager
    window.addEventListener('newPendingPost', handleNewPendingPost as EventListener);

    return () => {
      window.removeEventListener('newPendingPost', handleNewPendingPost as EventListener);
    };
  }, []);

  // Initialize with sample data only if no real data exists
  useEffect(() => {
    if (pendingPosts.length === 0 && scheduledPosts.length === 0) {
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
  }, [pendingPosts.length, scheduledPosts.length]);

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform || { icon: 'UN', color: '#9ca3af' };
  };

  const getStatusColor = (status: string) => {
    if (isDarkMode) {
      switch (status) {
        case 'pending': return { borderLeft: '4px solid #f59e0b', backgroundColor: '#451a03' };
        case 'processing': return { borderLeft: '4px solid #3b82f6', backgroundColor: '#1e3a8a' };
        case 'complete': return { borderLeft: '4px solid #10b981', backgroundColor: '#14532d' };
        case 'failed': return { borderLeft: '4px solid #ef4444', backgroundColor: '#451a1a' };
        case 'resending': return { borderLeft: '4px solid #f97316', backgroundColor: '#7c2d12' };
        default: return { borderLeft: '4px solid #9ca3af', backgroundColor: '#334155' };
      }
    } else {
      switch (status) {
        case 'pending': return { borderLeft: '4px solid #f59e0b', backgroundColor: '#fefce8' };
        case 'processing': return { borderLeft: '4px solid #3b82f6', backgroundColor: '#dbeafe' };
        case 'complete': return { borderLeft: '4px solid #10b981', backgroundColor: '#d1fae5' };
        case 'failed': return { borderLeft: '4px solid #ef4444', backgroundColor: '#fee2e2' };
        case 'resending': return { borderLeft: '4px solid #f97316', backgroundColor: '#fed7aa' };
        default: return { borderLeft: '4px solid #9ca3af', backgroundColor: '#f9fafb' };
      }
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

  const getHourlyPostsForDay = (date: Date) => {
    const dayPosts = getPostsForDate(date);
    const hourlyPosts: { [key: number]: ScheduledPost[] } = {};
    
    for (let hour = 0; hour < 24; hour++) {
      hourlyPosts[hour] = dayPosts.filter(post => new Date(post.scheduledDate).getHours() === hour);
    }
    
    return hourlyPosts;
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const formatCalendarTitle = () => {
    if (calendarView === 'day') {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (calendarView === 'week') {
      const weekDates = getWeekDates(currentDate);
      const start = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}, ${weekDates[0].getFullYear()}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
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
      
      // Update localStorage
      const remainingPending = JSON.parse(localStorage.getItem('pendingSchedulePosts') || '[]')
        .filter((p: any) => p.id !== selectedPendingPost.id);
      localStorage.setItem('pendingSchedulePosts', JSON.stringify(remainingPending));
      
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
        
        // Update localStorage
        const storedPosts = JSON.parse(localStorage.getItem('pendingSchedulePosts') || '[]');
        const updatedPosts = storedPosts.map((p: any) => p.id === editingPost.id ? editingPost : p);
        localStorage.setItem('pendingSchedulePosts', JSON.stringify(updatedPosts));
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

  const renderDayView = () => {
    const hourlyPosts = getHourlyPostsForDay(currentDate);
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr',
        gap: '1px',
        backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div style={{
              padding: '12px 8px',
              backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              textAlign: 'right',
              fontWeight: 'bold'
            }}>
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            <div style={{
              minHeight: '60px',
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
              padding: '8px',
              position: 'relative'
            }}>
              {hourlyPosts[hour]?.map((post, idx) => (
                <div
                  key={post.id}
                  style={{
                    padding: '6px 8px',
                    marginBottom: idx < hourlyPosts[hour].length - 1 ? '4px' : '0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: isDarkMode ? '#e2e8f0' : '#111827',
                    ...getStatusColor(post.status)
                  }}
                  title={`${post.description} - ${post.characterProfile}`}
                  onClick={() => handleEditPost(post)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '2px'
                  }}>
                    {getStatusIcon(post.status)}
                    <span style={{ fontSize: '10px', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>
                      {new Date(post.scheduledDate).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {post.description}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    marginTop: '2px'
                  }}>
                    {post.characterProfile}
                  </div>
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {weekDates.map((date, idx) => {
          const dayPosts = getPostsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          
          return (
            <div
              key={date.toISOString()}
              style={{
                backgroundColor: isDarkMode ? '#1e293b' : 'white',
                minHeight: '200px',
                padding: '8px'
              }}
            >
              <div style={{
                textAlign: 'center',
                marginBottom: '8px',
                padding: '4px'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  fontWeight: 'bold'
                }}>
                  {dayNames[idx]}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: isToday ? '#2563eb' : (isCurrentMonth ? (isDarkMode ? '#e2e8f0' : '#111827') : (isDarkMode ? '#64748b' : '#9ca3af')),
                  backgroundColor: isToday ? (isDarkMode ? '#1e3a8a' : '#dbeafe') : 'transparent',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  {date.getDate()}
                </div>
              </div>
              
              <div style={{ display: 'grid', gap: '4px' }}>
                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      color: isDarkMode ? '#e2e8f0' : '#111827',
                      ...getStatusColor(post.status)
                    }}
                    title={`${post.description} - ${new Date(post.scheduledDate).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}`}
                    onClick={() => handleEditPost(post)}
                  >
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {post.description.length > 20 ? 
                        post.description.substring(0, 20) + '...' : 
                        post.description
                      }
                    </div>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <div style={{
                    padding: '4px 6px',
                    fontSize: '10px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    +{dayPosts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div>
        {/* Day headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
          borderRadius: '8px 8px 0 0',
          overflow: 'hidden'
        }}>
          {dayNames.map((day) => (
            <div
              key={day}
              style={{
                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                padding: '12px 8px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: isDarkMode ? '#e2e8f0' : '#374151'
              }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: isDarkMode ? '#475569' : '#e5e7eb'
        }}>
          {monthDates.map((date) => {
            const dayPosts = getPostsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={date.toISOString()}
                style={{
                  backgroundColor: isDarkMode ? '#1e293b' : 'white',
                  minHeight: '120px',
                  padding: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentDate(new Date(date))}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f9fafb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : 'white';
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isToday ? '#2563eb' : (isCurrentMonth ? (isDarkMode ? '#e2e8f0' : '#111827') : (isDarkMode ? '#64748b' : '#9ca3af')),
                  marginBottom: '4px',
                  textAlign: 'right'
                }}>
                  {isToday && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#2563eb',
                      borderRadius: '50%',
                      display: 'inline-block',
                      marginRight: '4px'
                    }} />
                  )}
                  {date.getDate()}
                </div>
                
                <div style={{ display: 'grid', gap: '2px' }}>
                  {dayPosts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      style={{
                        padding: '2px 4px',
                        borderRadius: '2px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        color: isDarkMode ? '#e2e8f0' : '#111827',
                        ...getStatusColor(post.status)
                      }}
                      title={`${post.description} - ${new Date(post.scheduledDate).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPost(post);
                      }}
                    >
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {post.description.length > 15 ? 
                          post.description.substring(0, 15) + '...' : 
                          post.description
                        }
                      </div>
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div style={{
                      padding: '2px 4px',
                      fontSize: '8px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontWeight: 'bold'
                    }}>
                      +{dayPosts.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
          color: isDarkMode ? '#94a3b8' : '#6b7280'
        }}>
          <Calendar style={{
            height: '64px',
            width: '64px',
            color: isDarkMode ? '#475569' : '#d1d5db',
            margin: '0 auto 16px auto'
          }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: isDarkMode ? '#e2e8f0' : '#111827',
            margin: '0 0 8px 0'
          }}>
            No scheduled posts yet
          </h3>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            maxWidth: '400px',
            margin: '0 auto',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            Posts will appear here once you schedule them from the Pending Scheduling tab. 
            Start by scheduling your first post!
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gap: '24px' }}>
        <div style={{ borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}` }}>
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
                  fontWeight: 'bold',
                  fontSize: '12px',
                  color: statusFilter === tab.id ? '#2563eb' : (isDarkMode ? '#94a3b8' : '#6b7280'),
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (statusFilter !== tab.id) {
                    e.currentTarget.style.color = isDarkMode ? '#e2e8f0' : '#374151';
                    e.currentTarget.style.borderBottom = `2px solid ${isDarkMode ? '#475569' : '#d1d5db'}`;
                  }
                }}
                onMouseOut={(e) => {
                  if (statusFilter !== tab.id) {
                    e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
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
                    backgroundColor: statusFilter === tab.id ? (isDarkMode ? '#1e3a8a' : '#dbeafe') : (isDarkMode ? '#374151' : '#f3f4f6'),
                    color: statusFilter === tab.id ? '#2563eb' : (isDarkMode ? '#94a3b8' : '#6b7280')
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
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
              border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
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
                      fontWeight: 'bold',
                      backgroundColor: 
                        post.status === 'pending' ? (isDarkMode ? '#451a03' : '#fef3c7') :
                        post.status === 'processing' ? (isDarkMode ? '#1e3a8a' : '#dbeafe') :
                        post.status === 'complete' ? (isDarkMode ? '#14532d' : '#d1fae5') :
                        post.status === 'failed' ? (isDarkMode ? '#451a1a' : '#fee2e2') : (isDarkMode ? '#7c2d12' : '#fed7aa'),
                      color:
                        post.status === 'pending' ? (isDarkMode ? '#fbbf24' : '#92400e') :
                        post.status === 'processing' ? (isDarkMode ? '#60a5fa' : '#1e40af') :
                        post.status === 'complete' ? (isDarkMode ? '#4ade80' : '#065f46') :
                        post.status === 'failed' ? (isDarkMode ? '#f87171' : '#991b1b') : (isDarkMode ? '#fb923c' : '#9a3412')
                    }}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontWeight: 'bold'
                    }}>
                      {new Date(post.scheduledDate).toLocaleString()}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#2563eb'
                    }}>
                      {post.characterProfile}
                    </span>
                  </div>
                  
                  <p style={{
                    color: isDarkMode ? '#e2e8f0' : '#111827',
                    marginBottom: '12px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    fontWeight: 'bold',
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
                      <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Platforms:</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {post.platforms.map((platform, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: 'bold',
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
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
                        fontWeight: 'bold'
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
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Edit"
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#3b82f6';
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#1e3a8a' : '#dbeafe';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Edit3 style={{ height: '16px', width: '16px' }} />
                  </button>
                  
                  <button
                    onClick={() => handleSaveTemplate(post)}
                    style={{
                      padding: '8px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Save as Template"
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#10b981';
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#14532d' : '#d1fae5';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
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
                      backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="Copy to Pending Scheduling"
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#1d4ed8' : '#bfdbfe';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#1e3a8a' : '#dbeafe';
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
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Delete"
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#451a1a' : '#fee2e2';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
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
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            padding: '32px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
            textAlign: 'center'
          }}>
            <Save style={{
              height: '48px',
              width: '48px',
              color: isDarkMode ? '#64748b' : '#9ca3af',
              margin: '0 auto 16px auto'
            }} />
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: isDarkMode ? '#e2e8f0' : '#111827',
              margin: '0 0 8px 0'
            }}>
              No Saved Templates
            </h3>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              fontSize: '12px',
              fontWeight: 'bold',
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
                backgroundColor: isDarkMode ? '#1e293b' : 'white',
                border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                borderRadius: '8px',
                padding: '16px',
                transition: 'box-shadow 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
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
                    fontWeight: 'bold',
                    color: isDarkMode ? '#e2e8f0' : '#111827',
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
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
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
                        e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
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
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
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
                        e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
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
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Profile:</span>
                    <span style={{
                      fontWeight: 'bold',
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
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Type:</span>
                    <span style={{ color: isDarkMode ? '#e2e8f0' : '#111827', fontWeight: 'bold' }}>{template.type}</span>
                  </div>
                  
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Description:</span>
                    <p style={{
                      color: isDarkMode ? '#e2e8f0' : '#111827',
                      marginTop: '4px',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      fontWeight: 'bold',
                      margin: '4px 0 0 0'
                    }}>
                      {truncateDescription(template.description)}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Platforms:</span>
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
                              fontWeight: 'bold',
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
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    fontWeight: 'bold'
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
                      backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                      color: isDarkMode ? '#e2e8f0' : '#374151',
                      fontSize: '12px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#475569' : '#e5e7eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
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
                      fontWeight: 'bold',
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
      backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
      minHeight: '100vh',
      color: isDarkMode ? '#e2e8f0' : '#111827'
    }}>
      {/* Status Summary - No Header Needed */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '16px'
      }}>
        <div style={{
          backgroundColor: isDarkMode ? '#d97706' : '#fed7aa',
          color: isDarkMode ? '#000000' : '#9a3412', // Fixed contrast for dark mode
          padding: '6px 12px',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '12px'
        }}>
          {pendingPosts.length} pending scheduling
        </div>
        <div style={{
          backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
          color: isDarkMode ? '#93c5fd' : '#1e40af',
          padding: '6px 12px',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '12px'
        }}>
          {scheduledPosts.filter(p => p.status === 'pending').length} scheduled
        </div>
        <div style={{
          backgroundColor: isDarkMode ? '#14532d' : '#d1fae5',
          color: isDarkMode ? '#86efac' : '#065f46',
          padding: '6px 12px',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '12px'
        }}>
          {savedTemplates.length} templates
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '8px 8px 0 0',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
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
                  fontWeight: 'bold',
                  fontSize: '12px',
                  color: activeTab === tab.id ? '#2563eb' : (isDarkMode ? '#94a3b8' : '#6b7280'),
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = isDarkMode ? '#e2e8f0' : '#374151';
                    e.currentTarget.style.borderBottom = `2px solid ${isDarkMode ? '#475569' : '#d1d5db'}`;
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
                    e.currentTarget.style.borderBottom = '2px solid transparent';
                  }
                }}
              >
                <Icon style={{ height: '16px', width: '16px' }} />
                <span>{tab.label}</span>
                {tab.id === 'pending' && pendingPosts.length > 0 && (
                  <span style={{
                    backgroundColor: isDarkMode ? '#d97706' : '#fed7aa',
                    color: isDarkMode ? '#000000' : '#9a3412', // Fixed contrast for dark mode
                    padding: '2px 8px',
                    fontSize: '11px',
                    borderRadius: '12px',
                    fontWeight: 'bold'
                  }}>
                    {pendingPosts.length}
                  </span>
                )}
                {tab.id === 'saved' && savedTemplates.length > 0 && (
                  <span style={{
                    backgroundColor: isDarkMode ? '#14532d' : '#d1fae5',
                    color: isDarkMode ? '#86efac' : '#065f46',
                    padding: '2px 8px',
                    fontSize: '11px',
                    borderRadius: '12px',
                    fontWeight: 'bold'
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
                backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                border: `1px solid ${isDarkMode ? '#1d4ed8' : '#93c5fd'}`,
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
                  fontWeight: 'bold',
                  color: isDarkMode ? '#93c5fd' : '#1e3a8a',
                  margin: '0 0 8px 0'
                }}>
                  Ready for Scheduling
                </h3>
                <p style={{
                  color: isDarkMode ? '#93c5fd' : '#1e40af',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  margin: '0'
                }}>
                  Posts from Content Manager will appear here for scheduling
                </p>
              </div>
            ) : (
              <div style={{
                backgroundColor: isDarkMode ? '#1e293b' : 'white',
                border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                borderRadius: '8px'
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                  borderBottom: `1px solid ${isDarkMode ? '#1d4ed8' : '#93c5fd'}`,
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
                      fontWeight: 'bold',
                      color: isDarkMode ? '#93c5fd' : '#1e3a8a',
                      margin: '0'
                    }}>
                      Pending Scheduling ({pendingPosts.length})
                    </h2>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: isDarkMode ? '#93c5fd' : '#1e40af',
                    marginTop: '4px',
                    fontWeight: 'bold',
                    margin: '4px 0 0 0'
                  }}>
                    Click "Schedule" to set date and time for these posts
                  </p>
                </div>
                
                <div>
                  {pendingPosts.map((post, index) => (
                    <div key={post.id} style={{
                      padding: '20px',
                      borderBottom: index < pendingPosts.length - 1 ? `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}` : 'none'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f9fafb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
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
                              backgroundColor: isDarkMode ? '#d97706' : '#fed7aa',
                              color: isDarkMode ? '#000000' : '#9a3412', // Fixed contrast for dark mode
                              borderRadius: '12px',
                              fontWeight: 'bold'
                            }}>
                              Ready to Schedule
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: isDarkMode ? '#94a3b8' : '#6b7280',
                              fontWeight: 'bold'
                            }}>
                              Created {post.createdDate.toLocaleDateString()}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: '#2563eb'
                            }}>
                              {post.characterProfile}
                            </span>
                            {post.contentId && (
                              <span style={{
                                fontSize: '11px',
                                color: isDarkMode ? '#60a5fa' : '#3b82f6',
                                fontFamily: 'monospace',
                                backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                              }}>
                                ID: {post.contentId}
                              </span>
                            )}
                          </div>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{
                              color: isDarkMode ? '#e2e8f0' : '#111827',
                              fontSize: '14px',
                              lineHeight: '1.5',
                              fontWeight: 'bold',
                              margin: '0'
                            }}>
                              {truncateDescription(post.description)}
                            </p>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                            fontSize: '12px',
                            color: isDarkMode ? '#94a3b8' : '#6b7280'
                          }}>
                            {post.mediaFiles.length > 0 && (
                              <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 'bold'
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
                              <span style={{ fontWeight: 'bold' }}>Platforms:</span>
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
                                        fontWeight: 'bold',
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
                              backgroundColor: isDarkMode ? '#475569' : '#4b5563',
                              color: 'white',
                              fontSize: '12px',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            title="Edit Post Content"
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#374151';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#475569' : '#4b5563';
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
                              fontWeight: 'bold',
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
                                
                                // Update localStorage
                                const storedPosts = JSON.parse(localStorage.getItem('pendingSchedulePosts') || '[]');
                                const updatedPosts = storedPosts.filter((p: any) => p.id !== post.id);
                                localStorage.setItem('pendingSchedulePosts', JSON.stringify(updatedPosts));
                                
                                alert('Post deleted successfully!');
                              }
                            }}
                            style={{
                              padding: '8px',
                              color: isDarkMode ? '#94a3b8' : '#6b7280',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title="Delete"
                            onMouseOver={(e) => {
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#451a1a' : '#fee2e2';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
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
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '8px',
            padding: '24px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
          }}>
            {/* Calendar Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <button
                  onClick={() => navigateCalendar('prev')}
                  style={{
                    padding: '8px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    backgroundColor: 'transparent',
                    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f3f4f6';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ChevronLeft style={{ height: '16px', width: '16px' }} />
                </button>
                
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#e2e8f0' : '#111827',
                  margin: '0',
                  minWidth: '300px'
                }}>
                  {formatCalendarTitle()}
                </h2>
                
                <button
                  onClick={() => navigateCalendar('next')}
                  style={{
                    padding: '8px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    backgroundColor: 'transparent',
                    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f3f4f6';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ChevronRight style={{ height: '16px', width: '16px' }} />
                </button>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                    color: isDarkMode ? '#e2e8f0' : '#374151',
                    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#475569' : '#e5e7eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                  }}
                >
                  Today
                </button>
                
                <div style={{
                  display: 'flex',
                  backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                  borderRadius: '6px',
                  padding: '2px'
                }}>
                  {(['day', 'week', 'month'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setCalendarView(view)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: calendarView === view ? (isDarkMode ? '#1e293b' : 'white') : 'transparent',
                        color: calendarView === view ? (isDarkMode ? '#e2e8f0' : '#111827') : (isDarkMode ? '#94a3b8' : '#6b7280'),
                        boxShadow: calendarView === view ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                      }}
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Calendar Content */}
            <div style={{ marginBottom: '16px' }}>
              {calendarView === 'day' && renderDayView()}
              {calendarView === 'week' && renderWeekView()}
              {calendarView === 'month' && renderMonthView()}
            </div>
            
            {/* Legend */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px',
              backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Status:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '3px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
                <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Pending</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '3px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Processing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '3px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Complete</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '3px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
                <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Failed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '3px', backgroundColor: '#f97316', borderRadius: '2px' }} />
                <span style={{ color: isDarkMode ? '#94a3b8' : '#6b7280', fontWeight: 'bold' }}>Resending</span>
              </div>
            </div>
            
            {scheduledPosts.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: isDarkMode ? '#94a3b8' : '#6b7280'
              }}>
                <Calendar style={{
                  height: '48px',
                  width: '48px',
                  color: isDarkMode ? '#475569' : '#d1d5db',
                  margin: '0 auto 16px auto'
                }} />
                <p style={{
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  margin: '0'
                }}>
                  No scheduled posts to display. Schedule some posts to see them on the calendar.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'status' && (
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '8px',
            padding: '24px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
          }}>
            {renderStatusManagement()}
          </div>
        )}

        {activeTab === 'saved' && (
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '8px',
            padding: '24px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
          }}>
            {renderSavedTemplates()}
          </div>
        )}
      </div>

      {/* All the modals would need dark mode fixes too, but keeping response short - let me know if you want those fixed as well */}
      
    </div>
  );
}
