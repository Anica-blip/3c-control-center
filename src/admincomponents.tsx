import React, { useState, useEffect } from 'react';

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

  // Check for dark mode from parent (this would normally come from props or context)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  // Theme classes
  const themeClasses = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBackground: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    inputBackground: isDarkMode ? 'bg-gray-700' : 'bg-white',
    inputBorder: isDarkMode ? 'border-gray-600' : 'border-gray-300',
    buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
    buttonDanger: isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700',
    buttonSuccess: isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'
  };

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
      case 'pending': return { borderLeft: '4px solid #f59e0b', backgroundColor: isDarkMode ? '#fef3c7/10' : '#fefce8' };
      case 'processing': return { borderLeft: '4px solid #3b82f6', backgroundColor: isDarkMode ? '#dbeafe/10' : '#dbeafe' };
      case 'complete': return { borderLeft: '4px solid #10b981', backgroundColor: isDarkMode ? '#d1fae5/10' : '#d1fae5' };
      case 'failed': return { borderLeft: '4px solid #ef4444', backgroundColor: isDarkMode ? '#fee2e2/10' : '#fee2e2' };
      case 'resending': return { borderLeft: '4px solid #f97316', backgroundColor: isDarkMode ? '#fed7aa/10' : '#fed7aa' };
      default: return { borderLeft: '4px solid #9ca3af', backgroundColor: isDarkMode ? '#f9fafb/10' : '#f9fafb' };
    }
  };

  const getStatusIcon = (status: string) => {
    const iconStyle = { height: '12px', width: '12px' };
    switch (status) {
      case 'pending': return <span style={{...iconStyle, color: '#d97706'}} className="inline-block">⏳</span>;
      case 'processing': return <span style={{...iconStyle, color: '#2563eb'}} className="inline-block">▶️</span>;
      case 'complete': return <span style={{...iconStyle, color: '#059669'}} className="inline-block">✅</span>;
      case 'failed': return <span style={{...iconStyle, color: '#dc2626'}} className="inline-block">⚠️</span>;
      case 'resending': return <span style={{...iconStyle, color: '#ea580c'}} className="inline-block">🔄</span>;
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

  // Calendar rendering methods
  const renderDayView = () => {
    const hourlyPosts = getHourlyPostsForDay(currentDate);
    
    return (
      <div className={`grid grid-cols-[80px_1fr] gap-px ${themeClasses.border} border rounded-lg overflow-hidden`}>
        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div className={`p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} text-xs ${themeClasses.textMuted} text-right font-medium`}>
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            <div className={`min-h-[60px] ${themeClasses.cardBackground} p-2 relative`}>
              {hourlyPosts[hour]?.map((post, idx) => (
                <div
                  key={post.id}
                  className={`p-2 mb-1 rounded cursor-pointer text-xs font-medium`}
                  style={{
                    maxWidth: '75%',
                    ...getStatusColor(post.status)
                  }}
                  title={`${post.description} - ${post.characterProfile}`}
                  onClick={() => handleEditPost(post)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(post.status)}
                    <span className={`text-xs ${themeClasses.textMuted}`}>
                      {new Date(post.scheduledDate).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="truncate">
                    {post.description}
                  </div>
                  <div className={`text-xs ${themeClasses.textMuted} mt-1`}>
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
      <div className={`grid grid-cols-7 gap-px ${themeClasses.border} border rounded-lg overflow-hidden`}>
        {weekDates.map((date, idx) => {
          const dayPosts = getPostsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          
          return (
            <div
              key={date.toISOString()}
              className={`${themeClasses.cardBackground} min-h-[200px] p-2`}
            >
              <div className="text-center mb-2 p-1">
                <div className={`text-xs ${themeClasses.textMuted} font-medium`}>
                  {dayNames[idx]}
                </div>
                <div className={`text-lg font-bold rounded-full w-6 h-6 flex items-center justify-center mx-auto ${
                  isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? themeClasses.textPrimary : themeClasses.textMuted
                }`}>
                  {date.getDate()}
                </div>
              </div>
              
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="p-1 rounded text-xs font-medium cursor-pointer"
                    style={getStatusColor(post.status)}
                    title={`${post.description} - ${new Date(post.scheduledDate).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}`}
                    onClick={() => handleEditPost(post)}
                  >
                    <div className="truncate">
                      {post.description.length > 20 ? 
                        post.description.substring(0, 20) + '...' : 
                        post.description
                      }
                    </div>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <div className={`p-1 text-xs ${themeClasses.textMuted} text-center font-medium`}>
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
        <div className={`grid grid-cols-7 gap-px ${themeClasses.border} border rounded-t-lg overflow-hidden`}>
          {dayNames.map((day) => (
            <div
              key={day}
              className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 text-center text-xs font-bold ${themeClasses.textSecondary}`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className={`grid grid-cols-7 gap-px ${themeClasses.border} border border-t-0 rounded-b-lg overflow-hidden`}>
          {monthDates.map((date) => {
            const dayPosts = getPostsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={date.toISOString()}
                className={`${themeClasses.cardBackground} min-h-[120px] p-2 cursor-pointer hover:bg-gray-500/10 transition-colors`}
                onClick={() => setCurrentDate(new Date(date))}
              >
                <div className={`text-sm font-medium mb-1 text-right ${
                  isToday ? 'text-blue-600' : isCurrentMonth ? themeClasses.textPrimary : themeClasses.textMuted
                }`}>
                  {isToday && (
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-1" />
                  )}
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayPosts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className="p-1 rounded text-xs font-medium cursor-pointer"
                      style={getStatusColor(post.status)}
                      title={`${post.description} - ${new Date(post.scheduledDate).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPost(post);
                      }}
                    >
                      <div className="truncate">
                        {post.description.length > 15 ? 
                          post.description.substring(0, 15) + '...' : 
                          post.description
                        }
                      </div>
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className={`p-1 text-xs ${themeClasses.textMuted} font-medium`}>
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
        <div className="text-center p-12">
          <div className={`text-6xl ${themeClasses.textMuted} mb-4`}>📅</div>
          <h3 className={`text-xl font-bold ${themeClasses.textPrimary} mb-3`}>
            No scheduled posts yet
          </h3>
          <p className={`${themeClasses.textSecondary} max-w-md mx-auto text-sm`}>
            Posts will appear here once you schedule them from the Pending Scheduling tab. 
            Start by scheduling your first post!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className={`border-b ${themeClasses.border}`}>
          <div className="flex gap-8 overflow-x-auto -mb-px">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`whitespace-nowrap p-2 pb-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  statusFilter === tab.id 
                    ? `border-blue-500 text-blue-600` 
                    : `border-transparent ${themeClasses.textMuted} hover:${themeClasses.textSecondary} hover:border-gray-300`
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    statusFilter === tab.id ? 'bg-blue-100 text-blue-600' : `${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${themeClasses.textMuted}`
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className={`${themeClasses.cardBackground} border ${themeClasses.border} rounded-lg p-6`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      post.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      post.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      post.status === 'complete' ? 'bg-green-100 text-green-800' :
                      post.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                    <span className={`text-xs ${themeClasses.textMuted}`}>
                      {new Date(post.scheduledDate).toLocaleString()}
                    </span>
                    <span className={`text-xs font-medium text-blue-600`}>
                      {post.characterProfile}
                    </span>
                  </div>
                  
                  <p className={`${themeClasses.textPrimary} mb-3 text-sm leading-relaxed`}>
                    {post.description}
                  </p>
                  
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={themeClasses.textMuted}>Platforms:</span>
                      <div className="flex gap-1">
                        {post.platforms.map((platform, idx) => {
                          const platformInfo = getPlatformIcon(platform.platformId);
                          return (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded text-white text-xs font-medium"
                              style={{ backgroundColor: platformInfo.color }}
                            >
                              {platform.platformIcon}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    
                    {post.mediaFiles.length > 0 && (
                      <span className={`flex items-center gap-1 ${themeClasses.textMuted}`}>
                        <span>👁️</span>
                        <span>{post.mediaFiles.length} file(s)</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-6">
                  <button
                    onClick={() => handleEditPost(post)}
                    className={`p-2 ${themeClasses.buttonSecondary} ${themeClasses.textPrimary} rounded transition-colors`}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  
                  <button
                    onClick={() => handleSaveTemplate(post)}
                    className={`p-2 ${themeClasses.buttonSuccess} text-white rounded transition-colors`}
                    title="Save as Template"
                  >
                    💾
                  </button>

                  <button
                    onClick={() => handleCopyToPending(post)}
                    className={`px-3 py-2 text-xs ${themeClasses.buttonPrimary} text-white rounded font-medium transition-colors`}
                    title="Copy to Pending Scheduling"
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
                    className={`p-2 ${themeClasses.buttonDanger} text-white rounded transition-colors`}
                    title="Delete"
                  >
                    🗑️
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
      <div className="space-y-6">
        {savedTemplates.length === 0 ? (
          <div className={`${themeClasses.cardBackground} p-8 rounded-lg border ${themeClasses.border} text-center`}>
            <div className={`text-5xl ${themeClasses.textMuted} mb-4`}>💾</div>
            <h3 className={`text-lg font-bold ${themeClasses.textPrimary} mb-2`}>
              No Saved Templates
            </h3>
            <p className={`${themeClasses.textSecondary} text-sm`}>
              Save templates from Status Management to reuse them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTemplates.map((template) => (
              <div key={template.id} className={`${themeClasses.cardBackground} border ${themeClasses.border} rounded-lg p-4 transition-shadow hover:shadow-lg`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`font-bold ${themeClasses.textPrimary} text-lg`}>
                    {template.name}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className={`p-1 ${themeClasses.textMuted} hover:text-blue-600 transition-colors`}
                      title="Edit Template"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          setSavedTemplates(prev => prev.filter(t => t.id !== template.id));
                          alert('Template deleted successfully!');
                        }
                      }}
                      className={`p-1 ${themeClasses.textMuted} hover:text-red-600 transition-colors`}
                      title="Delete Template"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={themeClasses.textMuted}>Profile:</span>
                    <span className="font-medium text-blue-600">
                      {template.characterProfile}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className={themeClasses.textMuted}>Type:</span>
                    <span className={themeClasses.textPrimary}>{template.type}</span>
                  </div>
                  
                  <div className="text-xs">
                    <span className={themeClasses.textMuted}>Description:</span>
                    <p className={`${themeClasses.textPrimary} mt-1 text-xs leading-relaxed`}>
                      {template.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className={themeClasses.textMuted}>Platforms:</span>
                    <div className="flex gap-1">
                      {template.platforms.map((platform, idx) => {
                        const platformInfo = getPlatformIcon(platform.platformId);
                        return (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded text-white text-xs font-medium"
                            style={{ backgroundColor: platformInfo.color }}
                            title={platform.platformName}
                          >
                            {platformInfo.icon}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className={`text-xs ${themeClasses.textMuted} mb-3`}>
                  Used {template.usageCount} times
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyTemplate(template)}
                    className={`flex-1 py-2 px-3 ${themeClasses.buttonSecondary} ${themeClasses.textPrimary} text-xs rounded font-medium transition-colors`}
                  >
                    Copy & Edit
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className={`flex-1 py-2 px-3 ${themeClasses.buttonPrimary} text-white text-xs rounded font-medium transition-colors`}
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
    { id: 'pending', label: 'Pending Scheduling', icon: '⏳' },
    { id: 'calendar', label: 'Calendar View', icon: '📅' },
    { id: 'status', label: 'Status Management', icon: '✅' },
    { id: 'saved', label: 'Saved Templates', icon: '💾' },
  ];

  return (
    <div className={`min-h-screen ${themeClasses.background} transition-colors duration-200`}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-black ${themeClasses.textPrimary} mb-2`}>
              📅 Schedule Manager
            </h1>
            <p className={`${themeClasses.textSecondary} text-lg font-medium`}>
              Schedule posts and track their delivery status
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="px-3 py-2 bg-orange-100 text-orange-800 rounded-full font-medium">
              {pendingPosts.length} pending scheduling
            </div>
            <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
              {scheduledPosts.filter(p => p.status === 'pending').length} scheduled
            </div>
            <div className="px-3 py-2 bg-green-100 text-green-800 rounded-full font-medium">
              {savedTemplates.length} templates
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${themeClasses.cardBackground} rounded-lg shadow-lg border ${themeClasses.border} mb-8`}>
          <div className="flex border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 text-sm font-bold transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? `${themeClasses.textPrimary} border-blue-500 bg-blue-500/10`
                    : `${themeClasses.textSecondary} border-transparent hover:${themeClasses.textPrimary} hover:bg-gray-500/10`
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'pending' && pendingPosts.length > 0 && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                    {pendingPosts.length}
                  </span>
                )}
                {tab.id === 'saved' && savedTemplates.length > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    {savedTemplates.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'pending' && (
              <div className="space-y-6">
                {pendingPosts.length === 0 ? (
                  <div className={`p-8 text-center border-2 border-dashed border-blue-300 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                    <div className="text-5xl text-blue-600 mb-4">⏳</div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-2`}>
                      Ready for Scheduling
                    </h3>
                    <p className={`${isDarkMode ? 'text-blue-300' : 'text-blue-800'} text-sm`}>
                      Posts from Content Manager will appear here for scheduling
                    </p>
                  </div>
                ) : (
                  <div className={`${themeClasses.cardBackground} border ${themeClasses.border} rounded-lg`}>
                    <div className={`p-4 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border-b ${themeClasses.border} rounded-t-lg`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⏳</span>
                        <div>
                          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                            Pending Scheduling ({pendingPosts.length})
                          </h2>
                          <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mt-1`}>
                            Click "Schedule" to set date and time for these posts
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {pendingPosts.map((post, index) => (
                        <div key={post.id} className={`p-6 ${index < pendingPosts.length - 1 ? `border-b ${themeClasses.border}` : ''} hover:bg-gray-500/5 transition-colors`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full font-medium">
                                  Ready to Schedule
                                </span>
                                <span className={`text-xs ${themeClasses.textMuted}`}>
                                  Created {post.createdDate.toLocaleDateString()}
                                </span>
                                <span className="text-xs font-medium text-blue-600">
                                  {post.characterProfile}
                                </span>
                              </div>
                              
                              <div className="mb-4">
                                <p className={`${themeClasses.textPrimary} text-sm leading-relaxed`}>
                                  {post.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-6 text-xs">
                                {post.mediaFiles.length > 0 && (
                                  <span className={`flex items-center gap-2 ${themeClasses.textMuted}`}>
                                    <span>👁️</span>
                                    <span>{post.mediaFiles.length} file(s)</span>
                                  </span>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <span className={themeClasses.textMuted}>Platforms:</span>
                                  <div className="flex gap-1">
                                    {post.platforms.map((platform, idx) => {
                                      const platformInfo = getPlatformIcon(platform.platformId);
                                      return (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 rounded text-white text-xs font-medium"
                                          style={{ backgroundColor: platformInfo.color }}
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
                            
                            <div className="flex items-center gap-3 ml-6">
                              <button
                                onClick={() => handleEditPost(post)}
                                className={`px-4 py-2 text-xs ${themeClasses.buttonSecondary} ${themeClasses.textPrimary} rounded font-medium transition-colors`}
                                title="Edit Post Content"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleSchedulePost(post)}
                                className={`px-4 py-2 text-sm ${themeClasses.buttonPrimary} text-white rounded font-bold transition-colors`}
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
                                className={`p-2 ${themeClasses.buttonDanger} text-white rounded transition-colors`}
                                title="Delete"
                              >
                                🗑️
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
              <div className={`${themeClasses.cardBackground} rounded-lg p-6`}>
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigateCalendar('prev')}
                      className={`p-2 ${themeClasses.buttonSecondary} ${themeClasses.textPrimary} border ${themeClasses.border} rounded transition-colors`}
                    >
                      ←
                    </button>
                    
                    <h2 className={`text-xl font-bold ${themeClasses.textPrimary} min-w-[300px]`}>
                      {formatCalendarTitle()}
                    </h2>
                    
                    <button
                      onClick={() => navigateCalendar('next')}
                      className={`p-2 ${themeClasses.buttonSecondary} ${themeClasses.textPrimary} border ${themeClasses.border} rounded transition-colors`}
                    >
                      →
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className={`px-3 py-2 text-xs ${themeClasses.buttonSecondary} ${themeClasses.textPrimary} border ${themeClasses.border} rounded font-medium transition-colors`}
                    >
                      Today
                    </button>
                    
                    <div className={`flex ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}>
                      {(['day', 'week', 'month'] as const).map((view) => (
                        <button
                          key={view}
                          onClick={() => setCalendarView(view)}
                          className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
                            calendarView === view 
                              ? `${themeClasses.cardBackground} ${themeClasses.textPrimary} shadow-sm` 
                              : `${themeClasses.textMuted} hover:${themeClasses.textSecondary}`
                          }`}
                        >
                          {view.charAt(0).toUpperCase() + view.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Calendar Content */}
                <div className="mb-4">
                  {calendarView === 'day' && renderDayView()}
                  {calendarView === 'week' && renderWeekView()}
                  {calendarView === 'month' && renderMonthView()}
                </div>
                
                {/* Legend */}
                <div className={`flex items-center gap-4 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg text-xs`}>
                  <span className={`${themeClasses.textMuted} font-medium`}>Status:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-orange-500 rounded" />
                    <span className={themeClasses.textMuted}>Pending</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-blue-500 rounded" />
                    <span className={themeClasses.textMuted}>Processing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-green-500 rounded" />
                    <span className={themeClasses.textMuted}>Complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-red-500 rounded" />
                    <span className={themeClasses.textMuted}>Failed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-orange-600 rounded" />
                    <span className={themeClasses.textMuted}>Resending</span>
                  </div>
                </div>
                
                {scheduledPosts.length === 0 && (
                  <div className="text-center p-8">
                    <div className={`text-5xl ${themeClasses.textMuted} mb-4`}>📅</div>
                    <p className={`${themeClasses.textSecondary} text-sm`}>
                      No scheduled posts to display. Schedule some posts to see them on the calendar.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'status' && (
              <div className={`${themeClasses.cardBackground} rounded-lg p-6`}>
                {renderStatusManagement()}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className={`${themeClasses.cardBackground} rounded-lg p-6`}>
                {renderSavedTemplates()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
