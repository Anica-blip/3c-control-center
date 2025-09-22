// /src/schedulecomponent/components/StatusManagement.tsx
import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertCircle, Clock, Calendar, Edit, Trash2, RefreshCw, Filter, Search, Eye, Play, Pause, X } from 'lucide-react';
import { formatDate, formatTime, getRelativeTime } from '../utils/dateUtils';
import { getPlatformIcon, formatPlatformList } from '../utils/platformUtils';
import { 
  getStatusColor, 
  getStatusIcon, 
  getStatusDisplayInfo,
  groupPostsByStatus,
  getStatusCounts,
  filterPostsByStatus,
  isStatusActionable,
  getSuggestedActions,
  PostStatus
} from '../utils/statusUtils';

interface ScheduledPost {
  id: string;
  content_id: string;
  title: string;
  description: string;
  character_profile: string;
  selected_platforms: string[];
  scheduled_date: Date;
  status: PostStatus;
  failure_reason?: string;
  last_attempt?: Date;
  retry_count?: number;
  hashtags: string[];
  media_files?: any[];
  created_date: Date;
}

interface StatusManagementProps {
  posts: ScheduledPost[];
  loading: boolean;
  error?: string | null;
  onUpdateStatus: (postId: string, updates: Partial<ScheduledPost>) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onEdit?: (post: ScheduledPost) => void;
  onRetry?: (post: ScheduledPost) => void;
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
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

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
    hoverBg: '#475569',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  } : {
    bg: 'white',
    cardBg: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    hoverBg: '#f3f4f6',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626'
  };

  // Filter and search posts
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

    return filtered;
  }, [posts, selectedStatus, searchTerm]);

  // Get status counts
  const statusCounts = getStatusCounts(posts);

  // Handle status update
  const handleStatusUpdate = async (postId: string, newStatus: PostStatus) => {
    try {
      setIsUpdating(postId);
      await onUpdateStatus(postId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Handle retry
  const handleRetry = async (post: ScheduledPost) => {
    try {
      setIsUpdating(post.id);
      if (onRetry) {
        await onRetry(post);
      } else {
        await onUpdateStatus(post.id, { 
          status: 'scheduled',
          retry_count: (post.retry_count || 0) + 1 
        });
      }
    } catch (error) {
      console.error('Failed to retry post:', error);
    } finally {
      setIsUpdating(null);
    }
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
          <p style={{ color: theme.textSecondary }}>Loading status management...</p>
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
          <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>Error loading posts: {error}</p>
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
            Monitor and manage post publishing status
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
          <CheckCircle size={16} />
          {posts.length} Total Posts
        </div>
      </div>

      {/* Status Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {Object.entries(statusCounts).map(([status, count]) => {
          if (count === 0) return null;
          
          const statusInfo = getStatusDisplayInfo(status as PostStatus);
          const statusColors = getStatusColor(status as PostStatus, isDarkMode);
          
          return (
            <div 
              key={status}
              onClick={() => setSelectedStatus(selectedStatus === status ? 'all' : status as PostStatus)}
              style={{
                padding: '16px',
                backgroundColor: selectedStatus === status ? statusColors.bg : theme.cardBg,
                border: `1px solid ${selectedStatus === status ? statusColors.text : theme.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                {getStatusIcon(status as PostStatus)}
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: statusColors.text,
                  textTransform: 'uppercase'
                }}>
                  {statusInfo.label}
                </span>
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: statusColors.text,
                marginBottom: '4px'
              }}>
                {count}
              </div>
              <div style={{
                fontSize: '11px',
                color: theme.textSecondary,
                lineHeight: '1.2'
              }}>
                {statusInfo.description}
              </div>
            </div>
          );
        })}
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
              backgroundColor: theme.bg,
              color: theme.text,
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Clear Filters */}
        {(selectedStatus !== 'all' || searchTerm) && (
          <button
            onClick={() => {
              setSelectedStatus('all');
              setSearchTerm('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: theme.textSecondary
            }}
          >
            <X size={14} />
            Clear
          </button>
        )}
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
              : 'Posts will appear here once they are scheduled.'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredPosts.map((post) => {
            const statusColors = getStatusColor(post.status, isDarkMode);
            const statusInfo = getStatusDisplayInfo(post.status);
            const suggestedActions = getSuggestedActions(post.status);
            const isActionable = isStatusActionable(post.status);
            const isCurrentlyUpdating = isUpdating === post.id;

            return (
              <div key={post.id} style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '20px',
                transition: 'all 0.2s ease'
              }}>
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
                      color: theme.textSecondary,
                      marginBottom: '8px'
                    }}>
                      <span>ID: {post.content_id}</span>
                      <span>Created: {getRelativeTime(post.created_date)}</span>
                      {post.scheduled_date && (
                        <span>Scheduled: {formatDate(post.scheduled_date)} {formatTime(post.scheduled_date)}</span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    {getStatusIcon(post.status)}
                    {statusInfo.label}
                  </div>
                </div>

                {/* Post Content Preview */}
                <div style={{ marginBottom: '16px' }}>
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

                  {/* Error Message */}
                  {post.failure_reason && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#dc2626'
                    }}>
                      <AlertCircle size={14} />
                      {post.failure_reason}
                      {post.retry_count && post.retry_count > 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '11px' }}>
                          (Retry {post.retry_count})
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
                    color: theme.textSecondary
                  }}>
                    <span>Platforms:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {post.selected_platforms.slice(0, 3).map((platform, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: theme.hoverBg,
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {getPlatformIcon(platform, 12)}
                          <span>{platform}</span>
                        </div>
                      ))}
                      {post.selected_platforms.length > 3 && (
                        <span>+{post.selected_platforms.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggested Actions */}
                {suggestedActions.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    {suggestedActions.slice(0, 3).map((action, index) => (
                      <span key={index} style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        backgroundColor: isDarkMode ? '#1e3a8a20' : '#dbeafe',
                        color: theme.primary,
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}>
                        {action}
                      </span>
                    ))}
                  </div>
                )}

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
                    Character: {post.character_profile || 'Not set'}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedPost(post)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: theme.textSecondary
                      }}
                    >
                      <Eye size={14} />
                      View
                    </button>

                    {onEdit && isActionable && (
                      <button
                        onClick={() => onEdit(post)}
                        disabled={isCurrentlyUpdating}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          cursor: isCurrentlyUpdating ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: theme.textSecondary,
                          opacity: isCurrentlyUpdating ? 0.7 : 1
                        }}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                    )}

                    {post.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(post)}
                        disabled={isCurrentlyUpdating}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: theme.warning,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: isCurrentlyUpdating ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          opacity: isCurrentlyUpdating ? 0.7 : 1
                        }}
                      >
                        {isCurrentlyUpdating ? (
                          <div style={{
                            width: '14px',
                            height: '14px',
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        Retry
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(post.id)}
                      disabled={isCurrentlyUpdating}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme.danger}`,
                        borderRadius: '6px',
                        cursor: isCurrentlyUpdating ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: theme.danger,
                        opacity: isCurrentlyUpdating ? 0.7 : 1
                      }}
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
            backgroundColor: theme.bg,
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
                color: theme.primary
              }}>
                Post Status Details
              </h3>
              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: theme.textSecondary,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {/* Detailed Post Info */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: theme.text,
                margin: '0 0 12px 0'
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
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Content ID
                  </span>
                  <div style={{
                    fontSize: '14px',
                    color: theme.text,
                    fontFamily: 'monospace',
                    marginTop: '2px'
                  }}>
                    {selectedPost.content_id}
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Status
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '4px'
                  }}>
                    {getStatusIcon(selectedPost.status)}
                    <span style={{
                      fontSize: '14px',
                      color: getStatusColor(selectedPost.status, isDarkMode).text,
                      fontWeight: '600'
                    }}>
                      {getStatusDisplayInfo(selectedPost.status).label}
                    </span>
                  </div>
                </div>

                {selectedPost.scheduled_date && (
                  <div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: theme.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Scheduled
                    </span>
                    <div style={{
                      fontSize: '14px',
                      color: theme.text,
                      marginTop: '2px'
                    }}>
                      {formatDate(selectedPost.scheduled_date)} {formatTime(selectedPost.scheduled_date)}
                    </div>
                  </div>
                )}

                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Platforms
                  </span>
                  <div style={{
                    fontSize: '14px',
                    color: theme.text,
                    marginTop: '2px'
                  }}>
                    {formatPlatformList(selectedPost.selected_platforms)}
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '14px',
                color: theme.text,
                lineHeight: '1.5',
                margin: '0 0 16px 0',
                padding: '12px',
                backgroundColor: theme.cardBg,
                borderRadius: '6px'
              }}>
                {selectedPost.description}
              </p>

              {/* Status Timeline or Error Details */}
              {selectedPost.failure_reason && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#dc2626'
                  }}>
                    <AlertCircle size={16} />
                    Publishing Failed
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#dc2626',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    {selectedPost.failure_reason}
                  </p>
                  {selectedPost.last_attempt && (
                    <p style={{
                      fontSize: '11px',
                      color: '#7f1d1d',
                      margin: '4px 0 0 0'
                    }}>
                      Last attempt: {getRelativeTime(selectedPost.last_attempt)}
                      {selectedPost.retry_count && selectedPost.retry_count > 0 && (
                        ` (${selectedPost.retry_count} retries)`
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: `1px solid ${theme.border}`
            }}>
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
