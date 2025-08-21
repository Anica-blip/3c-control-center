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
    { id: '1', name: 'Telegram', icon: 'TG', color: 'bg-blue-500' },
    { id: '2', name: 'YouTube', icon: 'YT', color: 'bg-red-500' },
    { id: '3', name: 'Facebook', icon: 'FB', color: 'bg-blue-600' },
    { id: '4', name: 'Twitter', icon: 'TW', color: 'bg-sky-500' },
    { id: '5', name: 'Forum', icon: 'FR', color: 'bg-gray-600' },
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
    return platform || { icon: 'UN', color: 'bg-gray-400' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-l-yellow-400 bg-yellow-50';
      case 'processing': return 'border-l-blue-400 bg-blue-50';
      case 'complete': return 'border-l-green-400 bg-green-50';
      case 'failed': return 'border-l-red-400 bg-red-50';
      case 'resending': return 'border-l-orange-400 bg-orange-50';
      default: return 'border-l-gray-400 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'processing': return <Play className="h-3 w-3 text-blue-600" />;
      case 'complete': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'failed': return <AlertCircle className="h-3 w-3 text-red-600" />;
      case 'resending': return <RefreshCw className="h-3 w-3 text-orange-600" />;
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

  const renderCalendarView = () => {
    if (calendarView === 'day') {
      const hourlyPosts = getHourlyPostsForDay(currentDate);
      
      return (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-16 p-3 text-sm text-gray-500 bg-gray-50 border-r">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {hourlyPosts[hour]?.map(post => (
                    <div key={post.id} className={`mb-1 p-2 text-xs rounded border-l-4 ${getStatusColor(post.status)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{new Date(post.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        {getStatusIcon(post.status)}
                      </div>
                      <p className="text-gray-900 mt-1 line-clamp-2">{post.description}</p>
                      <div className="flex mt-1 space-x-1">
                        {post.platforms.map((platform, idx) => {
                          const platformInfo = getPlatformIcon(platform.platformId);
                          return (
                            <span key={idx} className={`text-xs px-1 py-0.5 rounded text-white ${platformInfo.color}`}>
                              {platformInfo.icon}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (calendarView === 'week') {
      const weekDates = getWeekDates(currentDate);
      
      return (
        <div className="bg-white rounded-lg border">
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 border-r bg-gray-50"></div>
            {weekDates.map(date => (
              <div key={date.toISOString()} className="p-3 text-center border-r last:border-r-0">
                <div className="font-medium text-gray-700">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${
                  date.toDateString() === new Date().toDateString() ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-2 text-sm text-gray-500 bg-gray-50 border-r">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                {weekDates.map(date => {
                  const hourPosts = getPostsForDate(date).filter(post => 
                    new Date(post.scheduledDate).getHours() === hour
                  );
                  return (
                    <div key={date.toISOString()} className="p-1 border-r last:border-r-0 min-h-[50px]">
                      {hourPosts.map(post => (
                        <div key={post.id} className={`text-xs p-1 mb-1 rounded border-l-2 ${getStatusColor(post.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(post.status)}
                            <span className="font-medium">{new Date(post.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-gray-900 line-clamp-1">{post.description.substring(0, 20)}...</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Month view
    if (calendarView === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(firstDay.getDate() - firstDay.getDay());
      
      const weeks = [];
      const currentWeekDate = new Date(startDate);
      
      while (currentWeekDate <= lastDay || currentWeekDate.getDay() !== 0) {
        const week = [];
        for (let i = 0; i < 7; i++) {
          week.push(new Date(currentWeekDate));
          currentWeekDate.setDate(currentWeekDate.getDate() + 1);
        }
        weeks.push(week);
        if (currentWeekDate.getDay() === 0 && currentWeekDate > lastDay) break;
      }

      return (
        <div className="bg-white rounded-lg border">
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-medium text-gray-700 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
              {week.map(day => {
                const dayPosts = getPostsForDate(day);
                const isCurrentMonth = day.getMonth() === month;
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[120px] p-2 border-r last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                    } ${isToday ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      setCurrentDate(new Date(day));
                      setCalendarView('day');
                    }}
                  >
                    <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayPosts.slice(0, 2).map(post => (
                        <div
                          key={post.id}
                          className={`text-xs p-2 rounded border-l-4 cursor-pointer ${getStatusColor(post.status)} hover:shadow-sm transition-shadow`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(post.status)}
                              <span className="font-medium">{new Date(post.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <p className="text-gray-900 text-sm leading-tight line-clamp-2">{post.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-1">
                              {post.platforms.slice(0, 3).map((platform, idx) => {
                                const platformInfo = getPlatformIcon(platform.platformId);
                                return (
                                  <span
                                    key={idx}
                                    className={`text-xs px-1.5 py-0.5 rounded text-white font-medium ${platformInfo.color}`}
                                    title={platform.platformName}
                                  >
                                    {platformInfo.icon}
                                  </span>
                                );
                              })}
                            </div>
                            <span className="text-xs text-blue-600 font-medium">{post.characterProfile}</span>
                          </div>
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayPosts.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    }
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
        <div className="text-center py-12 text-gray-500">
          <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No scheduled posts yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Posts will appear here once you schedule them from the Pending Scheduling tab. 
            Start by scheduling your first post!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  statusFilter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    statusFilter === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      post.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      post.status === 'complete' ? 'bg-green-100 text-green-800' :
                      post.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(post.scheduledDate).toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {post.characterProfile}
                    </span>
                  </div>
                  
                  <p className="text-gray-900 mb-3 text-base leading-relaxed">{post.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Platforms:</span>
                      <div className="flex space-x-1">
                        {post.platforms.map((platform, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded text-white text-xs font-medium ${platforms.find(p => p.id === platform.platformId)?.color || 'bg-gray-400'}`}
                          >
                            {platform.platformIcon}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {post.mediaFiles.length > 0 && (
                      <span className="flex items-center space-x-1 text-gray-500">
                        <Eye className="h-4 w-4" />
                        <span>{post.mediaFiles.length} file(s)</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleSaveTemplate(post)}
                    className="p-2 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50"
                    title="Save as Template"
                  >
                    <Save className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleCopyToPending(post)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 font-medium"
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
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
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
          <div className="bg-white p-8 rounded-lg border text-center">
            <Save className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Templates</h3>
            <p className="text-gray-600">Save templates from Status Management to reuse them here.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedTemplates.map((template) => (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-1 text-gray-400 hover:text-blue-500 rounded"
                      title="Edit Template"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          setSavedTemplates(prev => prev.filter(t => t.id !== template.id));
                          alert('Template deleted successfully!');
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      title="Delete Template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">Profile:</span>
                    <span className="font-medium text-blue-600">{template.characterProfile}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="text-gray-900">{template.type}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-500">Description:</span>
                    <p className="text-gray-900 mt-1">{template.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">Platforms:</span>
                    <div className="flex space-x-1">
                      {template.platforms.map((platform, idx) => {
                        const platformInfo = getPlatformIcon(platform.platformId);
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded text-white text-xs font-medium ${platformInfo.color}`}
                            title={platform.platformName}
                          >
                            {platformInfo.icon}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-500">
                    Used {template.usageCount} times
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopyTemplate(template)}
                    className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Copy & Edit
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"
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

  const calendarViewOptions = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Manager</h1>
          <p className="text-gray-600">Schedule posts and track their delivery status</p>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
            {pendingPosts.length} pending scheduling
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            {scheduledPosts.filter(p => p.status === 'pending').length} scheduled
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
            {savedTemplates.length} templates
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.id === 'pending' && pendingPosts.length > 0 && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs rounded-full font-medium">
                    {pendingPosts.length}
                  </span>
                )}
                {tab.id === 'saved' && savedTemplates.length > 0 && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full font-medium">
                    {savedTemplates.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {pendingPosts.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">Ready for Scheduling</h3>
                <p className="text-blue-700">Posts from Content Manager will appear here for scheduling</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 bg-blue-50 border-b border-blue-200 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-blue-900">Pending Scheduling ({pendingPosts.length})</h2>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">Click "Schedule" to set date and time for these posts</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {pendingPosts.map((post) => (
                    <div key={post.id} className="p-5 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full font-medium">
                              Ready to Schedule
                            </span>
                            <span className="text-sm text-gray-500">
                              Created {post.createdDate.toLocaleDateString()}
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                              {post.characterProfile}
                            </span>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-gray-900 text-base leading-relaxed">
                              {post.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            {post.mediaFiles.length > 0 && (
                              <span className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{post.mediaFiles.length} file(s)</span>
                              </span>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              <span>Platforms:</span>
                              <div className="flex space-x-1">
                                {post.platforms.map((platform, idx) => {
                                  const platformInfo = getPlatformIcon(platform.platformId);
                                  return (
                                    <span
                                      key={idx}
                                      className={`px-2 py-1 rounded text-white text-xs font-medium ${platformInfo.color}`}
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
                        
                        <div className="flex items-center space-x-3 ml-6">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 font-medium"
                            title="Edit Post Content"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSchedulePost(post)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
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
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">View:</span>
                  {calendarViewOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setCalendarView(option.id as 'day' | 'week' | 'month')}
                      className={`px-3 py-1 text-sm rounded-lg font-medium ${
                        calendarView === option.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {scheduledPosts.length} scheduled posts
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        if (calendarView === 'month') {
                          newDate.setMonth(currentDate.getMonth() - 1);
                        } else if (calendarView === 'week') {
                          newDate.setDate(currentDate.getDate() - 7);
                        } else {
                          newDate.setDate(currentDate.getDate() - 1);
                        }
                        setCurrentDate(newDate);
                      }}
                      className="p-2 rounded-lg border hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h2 className="text-xl font-semibold min-w-[300px] text-center">
                      {calendarView === 'month' && currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      {calendarView === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      {calendarView === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h2>
                    <button
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        if (calendarView === 'month') {
                          newDate.setMonth(currentDate.getMonth() + 1);
                        } else if (calendarView === 'week') {
                          newDate.setDate(currentDate.getDate() + 7);
                        } else {
                          newDate.setDate(currentDate.getDate() + 1);
                        }
                        setCurrentDate(newDate);
                      }}
                      className="p-2 rounded-lg border hover:bg-gray-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Today
                  </button>
                </div>
              </div>

              {renderCalendarView()}
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="bg-white rounded-lg p-6">
            {renderStatusManagement()}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white rounded-lg p-6">
            {renderSavedTemplates()}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && selectedPendingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Schedule Post</h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-sm font-medium text-blue-600">{selectedPendingPost.characterProfile}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{selectedPendingPost.type}</span>
              </div>
              <p className="text-gray-900 mb-3">{selectedPendingPost.description}</p>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Will post to:</span>
                <div className="flex space-x-1">
                  {selectedPendingPost.platforms.map((platform, idx) => {
                    const platformInfo = getPlatformIcon(platform.platformId);
                    return (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-white text-xs font-medium ${platformInfo.color}`}
                        title={platform.platformName}
                      >
                        {platformInfo.icon}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="09:00"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Post</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Character Profile</label>
                <input
                  type="text"
                  value={editingPost.characterProfile}
                  onChange={(e) => setEditingPost({ ...editingPost, characterProfile: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <input
                  type="text"
                  value={editingPost.type}
                  onChange={(e) => setEditingPost({ ...editingPost, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingPost.description}
                  onChange={(e) => setEditingPost({ ...editingPost, description: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {isSaveTemplateModalOpen && selectedScheduledPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Save as Template</h2>
              <button
                onClick={() => setIsSaveTemplateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">This will save the following as a template:</p>
                <p className="text-sm font-medium">{selectedScheduledPost.description}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsSaveTemplateModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveTemplate}
                disabled={!templateName.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {isEditTemplateModalOpen && editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Template</h2>
              <button
                onClick={() => setIsEditTemplateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Character Profile</label>
                <input
                  type="text"
                  value={editingTemplate.characterProfile}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, characterProfile: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <input
                  type="text"
                  value={editingTemplate.type}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Platforms</label>
                <div className="flex space-x-2">
                  {editingTemplate.platforms.map((platform, idx) => {
                    const platformInfo = getPlatformIcon(platform.platformId);
                    return (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded text-white text-sm font-medium ${platformInfo.color}`}
                        title={platform.platformName}
                      >
                        {platformInfo.icon} {platform.platformName}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">Platform selection will be available when integrated with Content Manager</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditTemplateModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplateEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
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
