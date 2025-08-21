import React, { useState } from 'react';
import { Calendar, Clock, Edit3, Trash2, RefreshCw, Eye, AlertCircle, CheckCircle, Play, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

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

// Sub-components
const PendingScheduleSection = ({ 
  pendingPosts, 
  onSchedulePost, 
  onEditPost,
  onDeletePost 
}: {
  pendingPosts: PendingPost[];
  onSchedulePost: (post: PendingPost) => void;
  onEditPost: (post: PendingPost) => void;
  onDeletePost: (postId: string) => void;
}) => {
  const platforms: Platform[] = [
    { id: '1', name: 'Telegram', icon: 'TG', color: 'bg-blue-500' },
    { id: '2', name: 'YouTube', icon: 'YT', color: 'bg-red-500' },
    { id: '3', name: 'Facebook', icon: 'FB', color: 'bg-blue-600' },
    { id: '4', name: 'Twitter', icon: 'TW', color: 'bg-sky-500' },
    { id: '5', name: 'Forum', icon: 'FR', color: 'bg-gray-600' },
  ];

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform || { icon: 'UN', color: 'bg-gray-400' };
  };

  if (pendingPosts.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Clock className="mx-auto h-8 w-8 text-blue-400 mb-2" />
        <h3 className="text-lg font-medium text-blue-900 mb-1">Ready for Scheduling</h3>
        <p className="text-blue-700 text-sm">Posts from Content Manager will appear here for scheduling</p>
      </div>
    );
  }

  return (
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
          <div key={post.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded font-medium">
                    Ready to Schedule
                  </span>
                  <span className="text-sm text-gray-500">
                    Created {post.createdDate.toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {post.characterProfile}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-gray-900 text-base leading-relaxed">
                    {post.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
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
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEditPost(post)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  title="Edit Post Content"
                >
                  Edit
                </button>
                <button
                  onClick={() => onSchedulePost(post)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Schedule
                </button>
                <button
                  onClick={() => onDeletePost(post.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
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

const CalendarView = ({ 
  view, 
  currentDate, 
  posts, 
  onDateChange, 
  onPostClick
}: {
  view: 'day' | 'week' | 'month';
  currentDate: Date;
  posts: ScheduledPost[];
  onDateChange: (date: Date) => void;
  onPostClick: (post: ScheduledPost) => void;
}) => {
  const platforms: Platform[] = [
    { id: '1', name: 'Telegram', icon: 'TG', color: 'bg-blue-500' },
    { id: '2', name: 'YouTube', icon: 'YT', color: 'bg-red-500' },
    { id: '3', name: 'Facebook', icon: 'FB', color: 'bg-blue-600' },
    { id: '4', name: 'Twitter', icon: 'TW', color: 'bg-sky-500' },
    { id: '5', name: 'Forum', icon: 'FR', color: 'bg-gray-600' },
  ];

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

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    onDateChange(newDate);
  };

  const getDateRangeText = () => {
    return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
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
                  className={`min-h-[120px] p-2 border-r last:border-r-0 ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.slice(0, 2).map(post => (
                      <div
                        key={post.id}
                        className={`text-xs p-2 rounded border-l-4 cursor-pointer ${getStatusColor(post.status)} hover:shadow-sm transition-shadow`}
                        onClick={() => onPostClick(post)}
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
                            {post.platforms.length > 3 && (
                              <span className="text-xs text-gray-500">+{post.platforms.length - 3}</span>
                            )}
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
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-lg border hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-xl font-semibold min-w-[300px] text-center">{getDateRangeText()}</h2>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-lg border hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <button
          onClick={() => onDateChange(new Date())}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Today
        </button>
      </div>

      {renderMonthView()}
    </div>
  );
};

// Main Component
export default function ScheduleComponent() {
  const [activeTab, setActiveTab] = useState('pending');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPendingPost, setSelectedPendingPost] = useState<PendingPost | null>(null);

  // Mock pending posts
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([
    {
      id: 'pending-1',
      characterProfile: 'Business Professional',
      type: 'Announcement',
      template: 'Standard Post',
      description: 'Excited to announce our new product launch! This innovative solution will revolutionize how you manage your daily tasks and boost productivity.',
      mediaFiles: [
        { id: '1', name: 'product-hero.jpg', type: 'image', size: 2048000, url: '#' }
      ],
      platforms: [
        { platformId: '1', platformName: 'Telegram', platformIcon: 'TG', status: 'pending' },
        { platformId: '3', platformName: 'Facebook', platformIcon: 'FB', status: 'pending' }
      ],
      status: 'pending_schedule',
      createdDate: new Date(2025, 7, 20)
    }
  ]);

  // Mock scheduled posts
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '2',
      characterProfile: 'Expert Educator',
      type: 'Tutorial',
      template: 'Tutorial Guide',
      description: 'Learn how to optimize your workflow with these 5 simple tips that will save you hours every week.',
      mediaFiles: [
        { id: '2', name: 'tutorial-video.mp4', type: 'video', size: 15048000, url: '#' }
      ],
      platforms: [
        { platformId: '2', platformName: 'YouTube', platformIcon: 'YT', status: 'sent', sentAt: new Date() }
      ],
      scheduledDate: new Date(2025, 7, 23, 14, 30),
      status: 'complete',
      createdDate: new Date(2025, 7, 18)
    }
  ]);

  const handleSchedulePost = (post: PendingPost) => {
    setSelectedPendingPost(post);
    setIsScheduleModalOpen(true);
  };

  const handleEditPendingPost = (post: PendingPost) => {
    alert('Full edit modal would open here - edit all content like Content Manager');
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

  const handleDeletePendingPost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPendingPosts(prev => prev.filter(p => p.id !== postId));
    }
  };

  const handlePostClick = (post: ScheduledPost) => {
    alert(`Post clicked: ${post.description.substring(0, 50)}...`);
  };

  const tabs = [
    { id: 'pending', label: 'Pending Scheduling', icon: Clock },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'status', label: 'Status Management', icon: CheckCircle },
    { id: 'saved', label: 'Saved Templates', icon: Plus },
  ];

  const calendarViewOptions = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Manager</h1>
          <p className="text-gray-600">Schedule posts and track their delivery status</p>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
            {pendingPosts.length} pending scheduling
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {scheduledPosts.filter(p => p.status === 'pending').length} scheduled
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.id === 'pending' && pendingPosts.length > 0 && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs rounded-full">
                    {pendingPosts.length}
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
          <PendingScheduleSection
            pendingPosts={pendingPosts}
            onSchedulePost={handleSchedulePost}
            onEditPost={handleEditPendingPost}
            onDeletePost={handleDeletePendingPost}
          />
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                {calendarViewOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setCalendarView(option.id as 'day' | 'week' | 'month')}
                    className={`px-3 py-1 text-sm rounded-lg ${
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

            <CalendarView
              view={calendarView}
              currentDate={currentDate}
              posts={scheduledPosts}
              onDateChange={setCurrentDate}
              onPostClick={handlePostClick}
            />
          </div>
        )}

        {activeTab === 'status' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Status Management</h3>
            <p className="text-gray-600">Status management interface will be implemented here with all post statuses and filtering.</p>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Saved Templates</h3>
            <p className="text-gray-600">Template management interface will be implemented here for reusing posts.</p>
          </div>
        )}
      </div>

      {/* Quick Schedule Modal */}
      {isScheduleModalOpen && selectedPendingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
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
              <p className="text-gray-900">{selectedPendingPost.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  defaultValue="09:00"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
