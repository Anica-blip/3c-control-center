import React from 'react';
import { Clock, Edit3, Trash2, Eye } from 'lucide-react';
import { PendingPost } from '../types';
import { getPlatformIcon } from '../utils/platformUtils';
import { truncateDescription } from '../utils/statusUtils';

interface PendingTabProps {
  posts: PendingPost[];
  loading: boolean;
  error: string | null;
  onSchedule: (post: PendingPost) => void;
  onEdit: (post: PendingPost) => void;
  onDelete: (id: string) => void;
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

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px',
        color: isDarkMode ? '#94a3b8' : '#6b7280'
      }}>
        Loading pending posts...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
        border: `1px solid ${isDarkMode ? '#dc2626' : '#f87171'}`,
        borderRadius: '8px',
        color: isDarkMode ? '#fca5a5' : '#dc2626'
      }}>
        Error: {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
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
    );
  }

  return (
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
            Pending Scheduling ({posts.length})
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
        {posts.map((post, index) => (
          <div 
            key={post.id} 
            style={{
              padding: '20px',
              borderBottom: index < posts.length - 1 ? `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}` : 'none',
              cursor: 'pointer'
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
                    backgroundColor: isDarkMode ? '#f59e0b' : '#fed7aa',
                    color: isDarkMode ? '#000000' : '#9a3412',
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
                    Created {post.created_date.toLocaleDateString()}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#2563eb'
                  }}>
                    {post.character_profile}
                  </span>
                  {post.content_id && (
                    <span style={{
                      fontSize: '11px',
                      color: isDarkMode ? '#60a5fa' : '#3b82f6',
                      fontFamily: 'monospace',
                      backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      ID: {post.content_id}
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
                  {post.media_files.length > 0 && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 'bold'
                    }}>
                      <Eye style={{ height: '14px', width: '14px' }} />
                      <span>{post.media_files.length} file(s)</span>
                    </span>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>Platforms:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {post.selected_platforms.map((platformId, idx) => {
                        const platformInfo = getPlatformIcon(platformId);
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
                            title={platformInfo.name}
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
                  onClick={() => onEdit(post)}
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
                  onClick={() => onSchedule(post)}
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
                      onDelete(post.id);
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
}
