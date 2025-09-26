// /src/schedulecomponent/components/StatusManagement.tsx - FIXED to use centralized getTheme()
import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertCircle, Clock, PlayCircle, XCircle, RefreshCw, Edit, Trash2, Eye, Filter, Search, TrendingUp } from 'lucide-react';
import { formatDate, formatTime, getRelativeTime } from '../utils/dateUtils';
import { getPlatformIcon, formatPlatformList } from '../utils/platformUtils';
import { getTheme } from '../utils/styleUtils';
import { ScheduledPost } from '../types';
import { 
  getStatusColor, 
  getStatusIcon, 
  getStatusDisplayInfo,
  getStatusCounts,
  filterPostsByStatus,
  sortByStatusPriority,
  getSuggestedActions,
  isStatusActionable,
  PostStatus
} from '../utils/statusUtils';

interface StatusManagementProps {
  posts: ScheduledPost[];
  loading: boolean;
  error?: string | null;
  onUpdateStatus: (postId: string, newStatus: PostStatus) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onEdit: (post: ScheduledPost) => void;
  onRetry?: (postId: string) => Promise<void>;
}

export default function StatusManagement({
  posts,
  loading,
  error,
  onUpdateStatus,
  onDelete,
  onEdit,
  onRetry
}: StatusManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<PostStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'status' | 'date' | 'retry'>('status');
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  const { isDarkMode, theme } = getTheme();

  // Calculate status counts
  const statusCounts = useMemo(() => getStatusCounts(posts), [posts]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filterPostsByStatus(filtered, selectedStatus);
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
        return sortByStatusPriority(filtered);
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

  // Status filter options
  const statusOptions: { key: PostStatus | 'all', label: string, count: number }[] = [
    { key: 'all', label: 'All Posts', count: posts.length },
    { key: 'pending', label: 'Pending', count: statusCounts.pending },
    { key: 'pending_schedule', label: 'Pending Schedule', count: statusCounts.pending_schedule },
    { key: 'scheduled', label: 'Scheduled', count: statusCounts.scheduled },
    { key: 'publishing', label: 'Publishing', count: statusCounts.publishing },
    { key: 'published', label: 'Published', count: statusCounts.published },
    { key: 'failed', label: 'Failed', count: statusCounts.failed },
    { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
  ];

  // Handle status change
  const handleStatusChange = async (postId: string, newStatus: PostStatus) => {
    try {
      await onUpdateStatus(postId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Handle retry
  const handleRetry = async (postId: string) => {
    if (onRetry) {
      try {
        await onRetry(postId);
      } catch (error) {
        console.error('Failed to retry post:', error);
      }
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
            Monitor and manage post statuses across all platforms
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

      {/* Status Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {statusOptions.filter(s => s.count > 0).map(option => (
          <div key={option.key} style={{
            padding: '16px',
            backgroundColor: selectedStatus === option.key ? theme.primary + '20' : theme.cardBg,
            border: `1px solid ${selectedStatus === option.key ? theme.primary : theme.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setSelectedStatus(option.key)}
          onMouseOver={(e) => {
            if (selectedStatus !== option.key) {
              e.currentTarget.style.backgroundColor = theme.cardBg;
            }
          }}
          onMouseOut={(e) => {
            if (selectedStatus !== option.key) {
              e.currentTarget.style.backgroundColor = theme.cardBg;
            }
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {option.key !== 'all' && getStatusIcon(option.key as PostStatus)}
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: selectedStatus === option.key ? theme.primary : theme.text
                }}>
                  {option.label}
                </span>
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: selectedStatus === option.key ? theme.primary : theme.text
              }}>
                {option.count}
              </div>
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: theme.border,
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${posts.length > 0 ? (option.count / posts.length) * 100 : 0}%`,
                backgroundColor: selectedStatus === option.key ? theme.primary : theme.textSecondary,
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: theme.cardBg,
        borderRadius: '8px',
        border: `1px solid ${theme.border}`
      }}>
        {/* Search */}
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.textSecondary
          }} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: theme.background,
              color: theme.text,
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'status' | 'date' | 'retry')}
          style={{
            padding: '10px 12px',
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: theme.background,
            color: theme.text,
            fontFamily: 'inherit',
            minWidth: '120px'
          }}
        >
          <option value="status">By Status Priority</option>
          <option value="date">By Schedule Date</option>
          <option value="retry">By Retry Count</option>
        </select>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: theme.textSecondary
        }}>
          <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
            {searchTerm || selectedStatus !== 'all' ? 'No Matching Posts' : 'No Posts Found'}
          </h3>
          <p style={{ fontSize: '14px', margin: '0' }}>
            {searchTerm || selectedStatus !== 'all' 
              ? 'Try adjusting your filters or search terms.'
              : 'Posts will appear here once they are created.'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredPosts.map((post) => {
            const statusInfo = getStatusDisplayInfo(post.status);
            const statusColors = getStatusColor(post.status, isDarkMode);
            const actions = getSuggestedActions(post.status);
            
            return (
              <div key={post.id} style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
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
                      color: theme.text,
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
                      color: theme.textSecondary
                    }}>
                      <span>ID: {post.content_id}</span>
                      {post.scheduled_date && (
                        <span>Scheduled: {formatDate(post.scheduled_date)} {formatTime(post.scheduled_date)}</span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {getStatusIcon(post.status)}
                    {statusInfo.label}
                  </div>
                </div>

                {/* Post Content Preview */}
                <p style={{
                  fontSize: '14px',
                  color: theme.text,
                  lineHeight: '1.5',
                  margin: '0 0 12px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {post.description}
                </p>

                {/* Failure Info */}
                {post.status === 'failed' && post.failure_reason && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#dc2626',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      <AlertCircle size={16} />
                      Failure Reason
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: '#7f1d1d',
                      margin: '0',
                      lineHeight: '1.4'
                    }}>
                      {post.failure_reason}
                    </p>
                    {post.retry_count && post.retry_count > 0 && (
                      <div style={{
                        fontSize: '12px',
                        color: '#7f1d1d',
                        marginTop: '4px'
                      }}>
                        Retry attempts: {post.retry_count}
                        {post.last_attempt && ` • Last: ${getRelativeTime(post.last_attempt)}`}
                      </div>
                    )}
                  </div>
                )}

                {/* Platforms and Character */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: theme.textSecondary
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>Platforms:</span>
                    {post.selected_platforms.slice(0, 3).map((platform, index) => (
                      <div key={index} style={{ marginLeft: '4px' }}>
                        {getPlatformIcon(platform, 14)}
                      </div>
                    ))}
                    {post.selected_platforms.length > 3 && (
                      <span>+{post.selected_platforms.length - 3}</span>
                    )}
                  </div>
                  {post.character_profile && (
                    <span>Character: {post.character_profile}</span>
                  )}
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: `1px solid ${theme.border}`
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: theme.textSecondary
                  }}>
                    {statusInfo.description}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* View Details */}
                    <button
                      onClick={() => setSelectedPost(post)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: theme.textSecondary,
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Eye size={14} />
                      Details
                    </button>

                    {/* Retry (for failed posts) */}
                    {post.status === 'failed' && onRetry && (
                      <button
                        onClick={() => handleRetry(post.id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: theme.warning,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <RefreshCw size={14} />
                        Retry
                      </button>
                    )}

                    {/* Edit (for actionable posts) */}
                    {isStatusActionable(post.status) && (
                      <button
                        onClick={() => onEdit(post)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: theme.textSecondary,
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this post?')) {
                          onDelete(post.id);
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme.danger}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: theme.danger,
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
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

            {/* Status Quick Actions */}
            {isStatusActionable(selectedPost.status) && (
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: theme.cardBg,
                borderRadius: '8px'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0',
                  color: theme.text,
                  flex: 1
                }}>
                  Quick Actions:
                </h4>
                {getSuggestedActions(selectedPost.status).slice(0, 3).map((action, index) => (
                  <button
                    key={index}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      color: theme.textSecondary,
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

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
                    color: getStatusColor(selectedPost.status, isDarkMode).text,
                    marginTop: '2px',
                    fontWeight: '600'
                  }}>
                    {getStatusDisplayInfo(selectedPost.status).label}
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

              <div style={{
                fontSize: '14px',
                color: theme.textSecondary,
                marginBottom: '16px'
              }}>
                Platforms: {formatPlatformList(selectedPost.selected_platforms)}
              </div>
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
