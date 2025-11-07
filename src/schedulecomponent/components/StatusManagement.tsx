// /src/schedulecomponent/components/StatusManagement.tsx - FIXED status tabs
import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertCircle, Clock, PlayCircle, XCircle, RefreshCw, Edit, Trash2, Eye, Filter, Search, TrendingUp } from 'lucide-react';
import { formatDate, formatTime, getRelativeTime } from '../utils/dateUtils';
import { getPlatformIcon, formatPlatformList } from '../utils/platformUtils';
import { getTheme } from '../utils/styleUtils';
import { ScheduledPost } from '../types';

// Simplified status type matching posting_status column
type StatusFilter = 'all' | 'scheduled' | 'processing' | 'published' | 'failed';

interface StatusManagementProps {
  posts: ScheduledPost[];
  loading: boolean;
  error?: string | null;
  onDelete: (postId: string) => Promise<void>;
  onEdit: (post: ScheduledPost) => void;
  onRetry?: (postId: string) => Promise<void>;
}

export default function StatusManagement({
  posts,
  loading,
  error,
  onDelete,
  onEdit,
  onRetry
}: StatusManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'status' | 'date' | 'retry'>('status');
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  const { isDarkMode, theme } = getTheme();

  // Calculate status counts from posts
  const statusCounts = useMemo(() => {
    const counts = {
      all: posts.length,
      scheduled: 0,
      processing: 0,
      published: 0,
      failed: 0
    };

    posts.forEach(post => {
      if (post.status === 'scheduled') counts.scheduled++;
      else if (post.status === 'processing') counts.processing++;
      else if (post.status === 'published') counts.published++;
      else if (post.status === 'failed') counts.failed++;
    });

    return counts;
  }, [posts]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(post => post.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.description.toLowerCase().includes(term) ||
        post.content_id.toLowerCase().includes(term) ||
        post.character_profile.toLowerCase().includes(term)
      );
    }

    // Sort posts
    switch (sortBy) {
      case 'status':
        // Priority: failed > processing > scheduled > published
        const statusPriority: Record<string, number> = {
          'failed': 1,
          'processing': 2,
          'scheduled': 3,
          'published': 4
        };
        return filtered.sort((a, b) => 
          (statusPriority[a.status] || 999) - (statusPriority[b.status] || 999)
        );
      case 'date':
        return filtered.sort((a, b) => {
          const dateA = a.scheduled_date || new Date(0);
          const dateB = b.scheduled_date || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      case 'retry':
        return filtered.sort((a, b) => (b.retry_count || 0) - (a.retry_count || 0));
      default:
        return filtered;
    }
  }, [posts, selectedStatus, searchTerm, sortBy]);

  // Status filter options - matching posting_status column
  const statusOptions: { key: StatusFilter, label: string, icon: any, color: string }[] = [
    { key: 'all', label: 'All', icon: Filter, color: theme.primary },
    { key: 'scheduled', label: 'Scheduled', icon: Clock, color: '#3b82f6' },
    { key: 'processing', label: 'Processing', icon: PlayCircle, color: '#f59e0b' },
    { key: 'published', label: 'Published', icon: CheckCircle, color: '#10b981' },
    { key: 'failed', label: 'Failed', icon: XCircle, color: '#ef4444' }
  ];

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'published': return '#10b981';
      case 'failed': return '#ef4444';
      default: return theme.textSecondary;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock size={16} />;
      case 'processing': return <PlayCircle size={16} />;
      case 'published': return <CheckCircle size={16} />;
      case 'failed': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const containerStyle = {
    backgroundColor: theme.background,
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
          <p style={{ color: theme.textSecondary }}>Loading status data...</p>
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
          color: theme.danger
        }}>
          <p>Error loading status data: {error}</p>
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
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            color: theme.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={24} />
            Status Management
          </h2>
          <p style={{
            fontSize: '14px',
            color: theme.textSecondary,
            margin: '0'
          }}>
            Monitor and manage post delivery status from cron runners
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: theme.cardBg,
          color: theme.primary,
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <TrendingUp size={16} />
          {posts.length} Total Posts
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {statusOptions.map(option => {
          const Icon = option.icon;
          const count = statusCounts[option.key];
          const isSelected = selectedStatus === option.key;

          return (
            <button
              key={option.key}
              onClick={() => setSelectedStatus(option.key)}
              style={{
                padding: '12px 20px',
                backgroundColor: isSelected ? option.color + '20' : theme.cardBg,
                border: `2px solid ${isSelected ? option.color : theme.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: isSelected ? option.color : theme.text
              }}
              onMouseOver={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = theme.cardBg;
                  e.currentTarget.style.borderColor = option.color;
                }
              }}
              onMouseOut={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = theme.cardBg;
                  e.currentTarget.style.borderColor = theme.border;
                }
              }}
            >
              <Icon size={18} />
              {option.label}
              <span style={{
                backgroundColor: isSelected ? option.color : theme.border,
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Sort Controls */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <Search 
            size={18} 
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.textSecondary
            }}
          />
          <input
            type="text"
            placeholder="Search posts by title, description, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              backgroundColor: theme.cardBg,
              color: theme.text,
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            padding: '12px 16px',
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            backgroundColor: theme.cardBg,
            color: theme.text,
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="status">Sort by Status</option>
          <option value="date">Sort by Date</option>
          <option value="retry">Sort by Retries</option>
        </select>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: theme.cardBg,
          borderRadius: '12px',
          border: `2px dashed ${theme.border}`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: theme.text,
            margin: '0 0 8px 0'
          }}>
            No Posts Found
          </h3>
          <p style={{
            fontSize: '14px',
            color: theme.textSecondary,
            margin: '0'
          }}>
            {searchTerm ? 'Try adjusting your search terms' : 'No posts match the selected status'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPosts.map(post => {
            const statusColor = getStatusColor(post.status);
            const statusIcon = getStatusIcon(post.status);

            return (
              <div key={post.id} style={{
                padding: '20px',
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderLeft: `4px solid ${statusColor}`,
                borderRadius: '8px',
                transition: 'all 0.2s ease'
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
                  gap: '16px'
                }}>
                  {/* Post Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: statusColor + '20',
                        color: statusColor,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {statusIcon}
                        {post.status}
                      </div>

                      {post.retry_count && post.retry_count > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          <RefreshCw size={12} />
                          {post.retry_count} retries
                        </div>
                      )}
                    </div>

                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.text,
                      margin: '0 0 8px 0'
                    }}>
                      {post.title || 'Untitled Post'}
                    </h3>

                    <p style={{
                      fontSize: '14px',
                      color: theme.textSecondary,
                      margin: '0 0 12px 0',
                      lineHeight: '1.5'
                    }}>
                      {post.description?.substring(0, 150)}
                      {post.description?.length > 150 ? '...' : ''}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                      color: theme.textSecondary
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {post.scheduled_date 
                          ? `${formatDate(post.scheduled_date)} at ${formatTime(post.scheduled_date)}`
                          : 'Not scheduled'
                        }
                      </div>

                      <div>
                        ID: {post.content_id?.substring(0, 12)}...
                      </div>

                      {post.selected_platforms && post.selected_platforms.length > 0 && (
                        <div>
                          {post.selected_platforms.length} platform{post.selected_platforms.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {post.failure_reason && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#991b1b'
                      }}>
                        <strong>Failure reason:</strong> {post.failure_reason}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minWidth: '100px'
                  }}>
                    <button
                      onClick={() => setSelectedPost(post)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'center'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Eye size={14} />
                      View
                    </button>

                    <button
                      onClick={() => onEdit(post)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'center'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Edit size={14} />
                      Edit
                    </button>

                    {post.status === 'failed' && onRetry && (
                      <button
                        onClick={() => onRetry(post.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fcd34d',
                          borderRadius: '6px',
                          color: '#92400e',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fde68a'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                      >
                        <RefreshCw size={14} />
                        Retry
                      </button>
                    )}

                    {post.status === 'published' && (
                      <button
                        onClick={() => onDelete(post.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Details Modal */}
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
            backgroundColor: theme.background,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
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
                Post Status Details
              </h3>
              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: theme.textSecondary,
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Post Details */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: theme.text,
                margin: '0 0 16px 0'
              }}>
                {selectedPost.title || 'Untitled Post'}
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: theme.cardBg,
                borderRadius: '8px'
              }}>
                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase'
                  }}>
                    Content ID
                  </span>
                  <div style={{ fontSize: '14px', color: theme.text, marginTop: '2px' }}>
                    {selectedPost.content_id}
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase'
                  }}>
                    Current Status
                  </span>
                  <div style={{
                    fontSize: '14px',
                    color: getStatusColor(selectedPost.status),
                    marginTop: '2px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {selectedPost.status}
                  </div>
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

              {selectedPost.scheduled_date && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: theme.textSecondary,
                  marginBottom: '16px'
                }}>
                  <Clock size={16} />
                  Scheduled: {formatDate(selectedPost.scheduled_date)} at {formatTime(selectedPost.scheduled_date)}
                </div>
              )}

              {selectedPost.selected_platforms && selectedPost.selected_platforms.length > 0 && (
                <div style={{
                  fontSize: '14px',
                  color: theme.textSecondary,
                  marginBottom: '16px'
                }}>
                  Platforms: {formatPlatformList(selectedPost.selected_platforms)}
                </div>
              )}

              {selectedPost.failure_reason && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#991b1b',
                  marginTop: '16px'
                }}>
                  <strong>Failure Reason:</strong><br />
                  {selectedPost.failure_reason}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: `1px solid ${theme.border}`
            }}>
              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  padding: '12px 24px',
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
