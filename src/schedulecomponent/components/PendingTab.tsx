// /src/schedulecomponent/components/PendingTab.tsx - FIXED
import React from 'react';
import { Clock, Calendar, Edit, Trash2, Play, AlertCircle } from 'lucide-react';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { getPlatformIcon, formatPlatformList } from '../utils/platformUtils';
import { getStatusColor, getStatusIcon } from '../utils/statusUtils';
import { ScheduledPost } from '../types';

interface PendingTabProps {
  posts: ScheduledPost[];  // Already correct, but ensure ScheduledPost is imported from '../types'
  loading: boolean;
  error?: string | null;
  onSchedule: (post: ScheduledPost) => void;
  onEdit: (post: ScheduledPost) => void;
  onDelete: (postId: string) => void;
}

export default function PendingTab({ 
  posts, 
  loading, 
  error, 
  onSchedule, 
  onEdit, 
  onDelete 
}: PendingTabProps) {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  const containerStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    color: isDarkMode ? '#f8fafc' : '#111827',
    borderRadius: '8px',
    padding: '24px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
    border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    transition: 'all 0.2s ease'
  };

  const buttonStyle = (variant: 'primary' | 'secondary' | 'danger') => {
    const styles = {
      primary: {
        backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
        color: 'white',
        border: 'none'
      },
      secondary: {
        backgroundColor: 'transparent',
        color: isDarkMode ? '#94a3b8' : '#6b7280',
        border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`
      },
      danger: {
        backgroundColor: 'transparent',
        color: '#ef4444',
        border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`
      }
    };

    return {
      ...styles[variant],
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease'
    };
  };

  // Loading state
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: `3px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
            borderTop: `3px solid ${isDarkMode ? '#3b82f6' : '#2563eb'}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Loading pending posts...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{ 
          textAlign: 'center', 
          padding: '40px'
        }}>
          <AlertCircle size={48} style={{ 
            color: '#ef4444', 
            margin: '0 auto 16px',
            display: 'block'
          }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ef4444',
            margin: '0 0 8px 0'
          }}>
            Error Loading Posts
          </h3>
          <p style={{ 
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            margin: '0 0 16px 0'
          }}>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={buttonStyle('primary')}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            color: isDarkMode ? '#60a5fa' : '#2563eb'
          }}>
            Pending Scheduling
          </h2>
          <p style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            margin: '0'
          }}>
            {posts.length} posts awaiting schedule assignment
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
          color: isDarkMode ? '#60a5fa' : '#1e40af',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <Clock size={16} />
          {posts.length} Pending
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: isDarkMode ? '#94a3b8' : '#6b7280'
        }}>
          <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
            No Pending Posts
          </h3>
          <p style={{ fontSize: '14px', margin: '0' }}>
            All your posts have been scheduled or published.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {posts.map((post) => (
            <div key={post.id} style={cardStyle}>
              {/* Post Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isDarkMode ? '#f8fafc' : '#111827',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4'
                  }}>
                    {post.title || 'Untitled Post'}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '12px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280'
                  }}>
                    <span>ID: {post.content_id}</span>
                    <span>Created: {getRelativeTime(post.created_date)}</span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 6px',
                      backgroundColor: getStatusColor(post.status, isDarkMode).bg,
                      color: getStatusColor(post.status, isDarkMode).text,
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {getStatusIcon(post.status)}
                      {post.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content Preview */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  fontSize: '14px',
                  color: isDarkMode ? '#e2e8f0' : '#4b5563',
                  lineHeight: '1.5',
                  margin: '0 0 12px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {post.description}
                </p>

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '12px'
                  }}>
                    {post.hashtags.slice(0, 5).map((tag, index) => (
                      <span key={index} style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#60a5fa' : '#2563eb',
                        backgroundColor: isDarkMode ? '#1e3a8a20' : '#dbeafe',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        #{tag}
                      </span>
                    ))}
                    {post.hashtags.length > 5 && (
                      <span style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#94a3b8' : '#6b7280'
                      }}>
                        +{post.hashtags.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Platforms */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280'
                }}>
                  <span>Platforms:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {post.selected_platforms.slice(0, 3).map((platform, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {getPlatformIcon(platform)}
                        <span>{platform}</span>
                      </div>
                    ))}
                    {post.selected_platforms.length > 3 && (
                      <span>+{post.selected_platforms.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Media Files Preview */}
              {post.media_files && post.media_files.length > 0 && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                  borderRadius: '6px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280'
                  }}>
                    <Calendar size={14} />
                    <span>{post.media_files.length} media file{post.media_files.length !== 1 ? 's' : ''} attached</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
              }}>
                <div style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280'
                }}>
                  Character: {post.character_profile || 'Not set'}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onEdit(post)}
                    style={buttonStyle('secondary')}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#475569' : '#f3f4f6';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => onDelete(post.id)}
                    style={buttonStyle('danger')}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                      e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = isDarkMode ? '#475569' : '#d1d5db';
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                  
                  <button
                    onClick={() => onSchedule(post)}
                    style={buttonStyle('primary')}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#2563eb' : '#1d4ed8';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#3b82f6' : '#2563eb';
                    }}
                  >
                    <Play size={14} />
                    Schedule Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
