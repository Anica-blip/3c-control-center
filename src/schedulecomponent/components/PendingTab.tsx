// /src/schedulecomponent/components/PendingTab.tsx - FIXED to work with corrected types
import React from 'react';
import { Clock, Calendar, Edit, Trash2, Play } from 'lucide-react';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { getPlatformIcon, formatPlatformList } from '../utils/platformUtils';
import { getStatusColor, getStatusIcon } from '../utils/statusUtils';
import { getTheme, getCardStyle, getButtonStyle } from '../utils/styles';
import { DashboardPost } from '../types';

interface PendingTabProps {
  posts: DashboardPost[];
  loading: boolean;
  error?: string | null;
  onSchedule: (post: DashboardPost) => void;
  onEdit: (post: DashboardPost) => void;
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
  const { isDarkMode, colors } = getTheme();

  const containerStyle = {
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
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
    borderBottom: `1px solid ${colors.border.primary}`
  };

  // Filter posts to show only pending_schedule status
  const pendingPosts = posts.filter(post => post.status === 'pending_schedule');

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: `3px solid ${colors.border.secondary}`,
            borderTop: `3px solid ${colors.text.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: colors.text.tertiary }}>Loading pending posts...</p>
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
          color: colors.status.error
        }}>
          <p>Error loading posts: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={getButtonStyle('primary', isDarkMode)}
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
            color: colors.text.accent
          }}>
            Pending Scheduling
          </h2>
          <p style={{
            fontSize: '14px',
            color: colors.text.tertiary,
            margin: '0'
          }}>
            {pendingPosts.length} posts awaiting schedule assignment
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: colors.background.accent,
          color: colors.text.accent,
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <Clock size={16} />
          {pendingPosts.length} Pending
        </div>
      </div>

      {/* Posts List */}
      {pendingPosts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: colors.text.tertiary
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
          {pendingPosts.map((post) => (
            <div key={post.id} style={getCardStyle(isDarkMode)}>
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
                    color: colors.text.primary,
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
                    color: colors.text.tertiary
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
                  color: colors.text.secondary,
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
                        color: colors.text.accent,
                        backgroundColor: colors.background.accent,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        #{tag}
                      </span>
                    ))}
                    {post.hashtags.length > 5 && (
                      <span style={{
                        fontSize: '12px',
                        color: colors.text.tertiary
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
                  color: colors.text.tertiary
                }}>
                  <span>Platforms:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {post.selected_platforms.slice(0, 3).map((platform, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: colors.background.tertiary,
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

              {/* Media Files Indicator */}
              {post.media_files && post.media_files.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: colors.background.accent,
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: colors.text.accent
                }}>
                  <span>📎</span>
                  <span>{post.media_files.length} media file{post.media_files.length !== 1 ? 's' : ''} attached</span>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: `1px solid ${colors.border.secondary}`
              }}>
                <div style={{
                  fontSize: '12px',
                  color: colors.text.tertiary
                }}>
                  Character: {post.character_profile || 'Not set'}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onEdit(post)}
                    style={getButtonStyle('secondary', isDarkMode)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = colors.background.tertiary;
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
                    style={getButtonStyle('danger', isDarkMode)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                      e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = colors.border.secondary;
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                  
                  <button
                    onClick={() => onSchedule(post)}
                    style={getButtonStyle('primary', isDarkMode)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#2563eb' : '#1d4ed8';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = colors.status.info;
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
