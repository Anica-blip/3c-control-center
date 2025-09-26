// /src/schedulecomponent/components/CalendarView.tsx - FIXED
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Edit, Eye, User } from 'lucide-react';
import { formatDate, formatTime, addDays, startOfDay, isSameDay, isToday } from '../utils/dateUtils';
import { getPlatformIcon, formatPlatformList } from '../utils/platformUtils';
import { getStatusColor, getStatusIcon } from '../utils/statusUtils';
import { ScheduledPost } from '../types';

interface CalendarViewProps {
  posts: ScheduledPost[];
  onEditPost: (post: ScheduledPost) => void;
  loading?: boolean;
  error?: string | null;
}

export default function CalendarView({ posts, onEditPost, loading = false, error = null }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // Theme colors
  const theme = isDarkMode ? {
    bg: '#1e293b',
    cardBg: '#334155',
    border: '#475569',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    primary: '#60a5fa',
    primaryHover: '#3b82f6',
    hoverBg: '#475569'
  } : {
    bg: 'white',
    cardBg: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    hoverBg: '#f3f4f6'
  };

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks worth of days (42 days)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: { [key: string]: ScheduledPost[] } = {};
    
    posts.forEach(post => {
      const dateKey = formatDate(post.scheduled_date, { year: 'numeric', month: '2-digit', day: '2-digit' });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(post);
    });
    
    // Sort posts by time within each date
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => 
        new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
      );
    });
    
    return grouped;
  }, [posts]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get posts for a specific day
  const getPostsForDay = (date: Date) => {
    const dateKey = formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
    return postsByDate[dateKey] || [];
  };

  // Check if day is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const containerStyle = {
    backgroundColor: theme.bg,
    color: theme.text,
    borderRadius: '8px',
    padding: '24px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: `3px solid ${theme.border}`,
            borderTop: `3px solid ${theme.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: theme.textSecondary }}>Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#ef4444'
        }}>
          <p>Error loading calendar: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0',
            color: theme.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Calendar size={24} />
            Schedule Calendar
          </h2>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: theme.cardBg,
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: theme.primary
          }}>
            <Clock size={16} />
            {posts.length} Scheduled
          </div>
          
          <button
            onClick={goToToday}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              color: theme.textSecondary,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverBg}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        marginBottom: '24px'
      }}>
        <button
          onClick={goToPreviousMonth}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: theme.textSecondary
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverBg}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronLeft size={20} />
        </button>

        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: theme.text,
          margin: '0',
          minWidth: '200px',
          textAlign: 'center'
        }}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>

        <button
          onClick={goToNextMonth}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: theme.textSecondary
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverBg}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: theme.border,
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            padding: '12px 8px',
            backgroundColor: theme.cardBg,
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: theme.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          const dayPosts = getPostsForDay(day);
          const isCurrentMonthDay = isCurrentMonth(day);
          const isTodayDay = isToday(day);
          
          return (
            <div key={index} style={{
              minHeight: '120px',
              padding: '8px',
              backgroundColor: theme.bg,
              opacity: isCurrentMonthDay ? 1 : 0.4,
              position: 'relative',
              border: isTodayDay ? `2px solid ${theme.primary}` : 'none'
            }}>
              {/* Day Number */}
              <div style={{
                fontSize: '14px',
                fontWeight: isTodayDay ? '700' : '500',
                color: isTodayDay ? theme.primary : (isCurrentMonthDay ? theme.text : theme.textSecondary),
                marginBottom: '4px'
              }}>
                {day.getDate()}
              </div>

              {/* Posts for this day */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {dayPosts.slice(0, 3).map(post => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    style={{
                      padding: '4px 6px',
                      backgroundColor: getStatusColor(post.status, isDarkMode).bg,
                      color: getStatusColor(post.status, isDarkMode).text,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {getStatusIcon(post.status)}
                    <span>{formatTime(post.scheduled_date)}</span>
                    <span style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {post.title || 'Untitled'}
                    </span>
                  </div>
                ))}
                
                {dayPosts.length > 3 && (
                  <div style={{
                    padding: '2px 6px',
                    fontSize: '10px',
                    color: theme.textSecondary,
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    +{dayPosts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Post Details */}
      {selectedPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedPost(null)}>
          <div style={{
            backgroundColor: theme.bg,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${theme.border}`
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0',
                color: theme.primary,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Eye size={20} />
                Post Details
              </h3>
              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: theme.textSecondary,
                  cursor: 'pointer',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Post Content */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: theme.text,
                margin: '0 0 8px 0'
              }}>
                {selectedPost.title || 'Untitled Post'}
              </h4>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '12px',
                color: theme.textSecondary,
                marginBottom: '12px'
              }}>
                <span>ID: {selectedPost.content_id}</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  backgroundColor: getStatusColor(selectedPost.status, isDarkMode).bg,
                  color: getStatusColor(selectedPost.status, isDarkMode).text,
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {getStatusIcon(selectedPost.status)}
                  {selectedPost.status.toUpperCase()}
                </div>
              </div>

              <p style={{
                fontSize: '14px',
                color: theme.text,
                lineHeight: '1.5',
                margin: '0 0 16px 0'
              }}>
                {selectedPost.description}
              </p>

              {/* Hashtags */}
              {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '16px'
                }}>
                  {selectedPost.hashtags.map((tag, index) => (
                    <span key={index} style={{
                      fontSize: '12px',
                      color: theme.primary,
                      backgroundColor: isDarkMode ? '#1e3a8a20' : '#dbeafe',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Schedule Info */}
              <div style={{
                backgroundColor: theme.cardBg,
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.primary
                }}>
                  <Clock size={16} />
                  Scheduled for
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: '4px'
                }}>
                  {formatDate(selectedPost.scheduled_date)} at {formatTime(selectedPost.scheduled_date)}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary
                }}>
                  {formatPlatformList(selectedPost.selected_platforms)}
                </div>
              </div>

              {/* Character Profile */}
              {selectedPost.character_profile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: theme.textSecondary,
                  marginBottom: '16px'
                }}>
                  <User size={14} />
                  Character: {selectedPost.character_profile}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: `1px solid ${theme.border}`
            }}>
              <button
                onClick={() => {
                  onEditPost(selectedPost);
                  setSelectedPost(null);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.primaryHover}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.primary}
              >
                <Edit size={16} />
                Edit Post
              </button>

              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverBg}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for loading animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
