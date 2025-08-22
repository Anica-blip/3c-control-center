import React, { useState, useRef } from 'react';
import { Upload, X, Image, Video, FileText, Download, Eye, Trash2, Plus, Settings, ExternalLink, Database, CheckCircle, Circle, Check } from 'lucide-react';

// Types
interface ContentPost {
  id: string;
  characterProfile: string;
  type: string;
  template: string;
  mediaFiles: MediaFile[];
  description: string;
  selectedPlatforms: string[];
  status: 'pending' | 'scheduled' | 'published';
  createdDate: Date;
  scheduledDate?: Date;
}

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'gif' | 'interactive' | 'other';
  size: number;
  url: string;
}

interface SocialPlatform {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  isDefault: boolean;
}

interface CharacterProfile {
  id: string;
  name: string;
  description: string;
}

interface ContentType {
  id: string;
  name: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  content: string;
}

// Get theme-aware styles
const getThemeStyles = (isDark: boolean) => ({
  background: isDark ? '#1f2937' : '#ffffff',
  backgroundSecondary: isDark ? '#374151' : '#f9fafb',
  backgroundTertiary: isDark ? '#4b5563' : '#f3f4f6',
  text: isDark ? '#f9fafb' : '#111827',
  textSecondary: isDark ? '#d1d5db' : '#6b7280',
  textMuted: isDark ? '#9ca3af' : '#9ca3af',
  border: isDark ? '#4b5563' : '#e5e7eb',
  borderSecondary: isDark ? '#374151' : '#d1d5db',
  accent: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  gradient: isDark 
    ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
    : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  cardShadow: isDark 
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
});

// Sub-components
const ContentCreationForm = ({ 
  onSave, 
  onAddToSchedule, 
  characterProfiles, 
  contentTypes, 
  templates, 
  platforms,
  isDark = false
}: {
  onSave: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  onAddToSchedule: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  characterProfiles: CharacterProfile[];
  contentTypes: ContentType[];
  templates: ContentTemplate[];
  platforms: SocialPlatform[];
  isDark?: boolean;
}) => {
  const theme = getThemeStyles(isDark);
  const [formData, setFormData] = useState({
    characterProfile: '',
    type: '',
    template: '',
    description: '',
    selectedPlatforms: [] as string[]
  });
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePlatforms = platforms.filter(p => p.isActive);

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const newFile: MediaFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' :
              file.type === 'application/pdf' ? 'pdf' :
              file.name.toLowerCase().includes('.gif') ? 'gif' :
              file.name.toLowerCase().includes('.html') ? 'interactive' : 'other',
        size: file.size,
        url: URL.createObjectURL(file),
      };
      setMediaFiles(prev => [...prev, newFile]);
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setMediaFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter(id => id !== platformId)
        : [...prev.selectedPlatforms, platformId]
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      mediaFiles,
      status: 'pending'
    });
    resetForm();
  };

  const handleAddToSchedule = () => {
    onAddToSchedule({
      ...formData,
      mediaFiles,
      status: 'pending'
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      characterProfile: '',
      type: '',
      template: '',
      description: '',
      selectedPlatforms: []
    });
    setMediaFiles([]);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image style={{height: '16px', width: '16px', color: theme.accent}} />;
      case 'video': return <Video style={{height: '16px', width: '16px', color: theme.success}} />;
      case 'pdf': return <FileText style={{height: '16px', width: '16px', color: theme.error}} />;
      case 'interactive': return <Settings style={{height: '16px', width: '16px', color: '#8b5cf6'}} />;
      default: return <FileText style={{height: '16px', width: '16px', color: theme.textSecondary}} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canSave = formData.characterProfile && formData.type && formData.description;

  return (
    <div style={{
      backgroundColor: theme.background,
      boxShadow: theme.cardShadow,
      border: `1px solid ${theme.accent}`,
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: theme.accent,
          margin: '0 0 8px 0'
        }}>
          🎨 Create New Content
        </h2>
        <p style={{
          color: theme.textSecondary,
          fontSize: '12px',
          fontWeight: 'bold',
          margin: '0'
        }}>
          Design and prepare your social media content for publishing
        </p>
      </div>
      
      {/* Form Fields Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        padding: '16px',
        background: theme.gradient,
        borderRadius: '8px',
        border: `1px solid ${theme.accent}`,
        marginBottom: '20px'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 'bold',
            color: theme.accent,
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Character Profile
          </label>
          <select
            value={formData.characterProfile}
            onChange={(e) => setFormData(prev => ({ ...prev, characterProfile: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${theme.borderSecondary}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: theme.background,
              color: theme.text,
              boxShadow: theme.cardShadow
            }}
          >
            <option value="">Select profile...</option>
            {characterProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 'bold',
            color: theme.accent,
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Content Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${theme.borderSecondary}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: theme.background,
              color: theme.text,
              boxShadow: theme.cardShadow
            }}
          >
            <option value="">Select type...</option>
            {contentTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 'bold',
            color: theme.accent,
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Template
          </label>
          <select
            value={formData.template}
            onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${theme.borderSecondary}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: theme.background,
              color: theme.text,
              boxShadow: theme.cardShadow
            }}
          >
            <option value="">Select template...</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Media Upload */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 'bold',
          color: theme.text,
          marginBottom: '12px'
        }}>
          📁 Media Upload
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${theme.accent}`,
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: theme.backgroundSecondary,
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#1d4ed8';
            e.currentTarget.style.backgroundColor = theme.backgroundTertiary;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = theme.accent;
            e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
          }}
        >
          <Upload style={{
            height: '32px',
            width: '32px',
            color: theme.accent,
            margin: '0 auto 12px auto',
            display: 'block'
          }} />
          <h3 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: theme.text,
            margin: '0 0 6px 0'
          }}>
            📎 Upload your media files
          </h3>
          <p style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: theme.textSecondary,
            margin: '0 0 4px 0'
          }}>
            Drop files here or click to browse
          </p>
          <p style={{
            fontSize: '11px',
            color: theme.textMuted,
            margin: '0'
          }}>
            Support for Images, Videos, GIFs, PDFs, and Interactive Media
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.gif,.html"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>

        {/* Uploaded Files */}
        {mediaFiles.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h4 style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: theme.text,
                margin: '0'
              }}>
                📋 Uploaded Files
              </h4>
              <span style={{
                padding: '4px 8px',
                backgroundColor: theme.accent,
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                borderRadius: '12px'
              }}>
                {mediaFiles.length} files
              </span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {mediaFiles.map((file) => (
                <div key={file.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: theme.backgroundSecondary,
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      padding: '8px',
                      backgroundColor: theme.background,
                      borderRadius: '6px',
                      boxShadow: theme.cardShadow
                    }}>
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: theme.text,
                        marginBottom: '2px'
                      }}>
                        {file.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: theme.textSecondary
                      }}>
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    style={{
                      padding: '6px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: theme.textSecondary
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                      e.currentTarget.style.color = theme.error;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme.textSecondary;
                    }}
                  >
                    <X style={{ height: '16px', width: '16px' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 'bold',
          color: theme.text,
          marginBottom: '8px'
        }}>
          ✏️ Post Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Write your post content here... Share your thoughts, updates, or announcements."
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${theme.borderSecondary}`,
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: theme.background,
            color: theme.text,
            boxShadow: theme.cardShadow,
            resize: 'vertical',
            minHeight: '100px',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Platform Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 'bold',
          color: theme.text,
          marginBottom: '12px'
        }}>
          🌐 Select Publishing Platforms
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {activePlatforms.map((platform) => (
            <label
              key={platform.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                border: formData.selectedPlatforms.includes(platform.id) 
                  ? `1px solid ${theme.accent}` 
                  : `1px solid ${theme.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: formData.selectedPlatforms.includes(platform.id) 
                  ? theme.backgroundTertiary
                  : theme.background,
                boxShadow: formData.selectedPlatforms.includes(platform.id)
                  ? `0 2px 8px rgba(59, 130, 246, 0.15)`
                  : theme.cardShadow,
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={formData.selectedPlatforms.includes(platform.id)}
                onChange={() => handlePlatformToggle(platform.id)}
                style={{
                  height: '16px',
                  width: '16px',
                  accentColor: theme.accent
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: theme.text,
                  marginBottom: '2px'
                }}>
                  {platform.name}
                </div>
                {platform.isDefault && (
                  <span style={{
                    display: 'inline-block',
                    padding: '1px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    backgroundColor: theme.success,
                    color: 'white',
                    borderRadius: '8px'
                  }}>
                    ⭐ Default
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        paddingTop: '16px',
        borderTop: `1px solid ${theme.border}`
      }}>
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            padding: '10px 20px',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            cursor: canSave ? 'pointer' : 'not-allowed',
            backgroundColor: canSave ? '#6b7280' : theme.borderSecondary,
            color: canSave ? 'white' : theme.textMuted,
            boxShadow: canSave ? theme.cardShadow : 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (canSave) {
              e.currentTarget.style.backgroundColor = '#4b5563';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (canSave) {
              e.currentTarget.style.backgroundColor = '#6b7280';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          💾 Save as Draft
        </button>
        <button
          onClick={handleAddToSchedule}
          disabled={!canSave}
          style={{
            padding: '10px 20px',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            cursor: canSave ? 'pointer' : 'not-allowed',
            backgroundColor: canSave ? theme.accent : theme.borderSecondary,
            color: canSave ? 'white' : theme.textMuted,
            boxShadow: canSave ? theme.cardShadow : 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (canSave) {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (canSave) {
              e.currentTarget.style.backgroundColor = theme.accent;
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          🚀 Schedule Post
        </button>
      </div>
    </div>
  );
};

const SavedPostsList = ({ posts, onEditPost, onSchedulePost, onDeletePost, isDark = false }: {
  posts: ContentPost[];
  onEditPost: (postId: string) => void;
  onSchedulePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  isDark?: boolean;
}) => {
  const theme = getThemeStyles(isDark);
  
  const getStatusBadge = (status: string) => {
    const badgeStyles = {
      pending: { backgroundColor: '#fef3c7', color: '#92400e', text: '⏳ Pending' },
      scheduled: { backgroundColor: '#dbeafe', color: '#1e40af', text: '📅 Scheduled' },
      published: { backgroundColor: '#d1fae5', color: '#065f46', text: '✅ Published' }
    };
    
    const style = badgeStyles[status as keyof typeof badgeStyles];
    
    return (
      <span style={{
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: 'bold',
        borderRadius: '20px',
        ...style
      }}>
        {style.text}
      </span>
    );
  };

  if (posts.length === 0) {
    return (
      <div style={{
        backgroundColor: theme.background,
        boxShadow: theme.cardShadow,
        border: `1px solid ${theme.border}`,
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: theme.backgroundSecondary,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <FileText style={{ height: '32px', width: '32px', color: theme.textMuted }} />
        </div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: theme.text,
          margin: '0 0 8px 0'
        }}>
          📄 No content created yet
        </h3>
        <p style={{
          color: theme.textSecondary,
          fontSize: '12px',
          fontWeight: 'bold',
          margin: '0'
        }}>
          Start creating amazing content using the form above
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: theme.background,
      boxShadow: theme.cardShadow,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '16px',
        background: theme.gradient,
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: theme.accent,
            margin: '0'
          }}>
            📚 Saved Content
          </h3>
          <span style={{
            padding: '6px 12px',
            background: `linear-gradient(135deg, ${theme.accent} 0%, #1d4ed8 100%)`,
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '16px'
          }}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>
      </div>
      
      <div>
        {posts.map((post) => (
          <div key={post.id} style={{
            padding: '16px',
            borderBottom: `1px solid ${theme.border}`,
            transition: 'background-color 0.2s ease',
            backgroundColor: theme.background
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = theme.background;
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}>
              <div style={{ flex: 1, marginRight: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  {getStatusBadge(post.status)}
                  <span style={{
                    fontSize: '11px',
                    color: theme.textSecondary,
                    fontWeight: 'bold'
                  }}>
                    📅 Created {post.createdDate.toLocaleDateString()}
                  </span>
                  {post.scheduledDate && (
                    <span style={{
                      fontSize: '11px',
                      color: theme.accent,
                      fontWeight: 'bold',
                      backgroundColor: theme.backgroundTertiary,
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      ⏰ Scheduled for {post.scheduledDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <p style={{
                  color: theme.text,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  lineHeight: '1.6',
                  margin: '0 0 12px 0'
                }}>
                  {post.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  {post.mediaFiles.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      color: theme.textSecondary,
                      backgroundColor: theme.backgroundSecondary,
                      padding: '6px 8px',
                      borderRadius: '6px'
                    }}>
                      <Image style={{ height: '12px', width: '12px' }} />
                      <span style={{ fontWeight: 'bold' }}>
                        {post.mediaFiles.length} file{post.mediaFiles.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: theme.textSecondary,
                    backgroundColor: theme.backgroundSecondary,
                    padding: '6px 8px',
                    borderRadius: '6px'
                  }}>
                    <Settings style={{ height: '12px', width: '12px' }} />
                    <span style={{ fontWeight: 'bold' }}>
                      {post.selectedPlatforms.length} platform{post.selectedPlatforms.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <button
                  onClick={() => onEditPost(post.id)}
                  title="Edit"
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: theme.textSecondary
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = theme.backgroundTertiary;
                    e.currentTarget.style.borderColor = theme.accent;
                    e.currentTarget.style.color = theme.accent;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = theme.textSecondary;
                  }}
                >
                  <Settings style={{ height: '14px', width: '14px' }} />
                </button>
                
                {post.status === 'pending' && (
                  <button
                    onClick={() => onSchedulePost(post.id)}
                    title="Add to Schedule"
                    style={{
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: '1px solid transparent',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: theme.textSecondary
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = theme.backgroundTertiary;
                      e.currentTarget.style.borderColor = theme.success;
                      e.currentTarget.style.color = theme.success;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.color = theme.textSecondary;
                    }}
                  >
                    <Plus style={{ height: '14px', width: '14px' }} />
                  </button>
                )}
                
                <button
                  onClick={() => onDeletePost(post.id)}
                  title="Delete"
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: theme.textSecondary
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.style.borderColor = theme.error;
                    e.currentTarget.style.color = theme.error;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = theme.textSecondary;
                  }}
                >
                  <Trash2 style={{ height: '14px', width: '14px' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SupabaseConnection = ({ isDark = false }: { isDark?: boolean }) => {
  const theme = getThemeStyles(isDark);
  
  return (
    <div style={{
      backgroundColor: theme.background,
      boxShadow: theme.cardShadow,
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: theme.text,
            margin: '0 0 4px 0'
          }}>
            💾 Database Connection
          </h3>
          <p style={{
            color: theme.textSecondary,
            margin: '0',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            Manage your data storage and connectivity
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#d1fae5',
          padding: '8px 12px',
          borderRadius: '8px',
          border: `1px solid ${theme.success}`
        }}>
          <CheckCircle style={{ height: '16px', width: '16px', color: theme.success }} />
          <span style={{
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#065f46'
          }}>
            ✅ Connected
          </span>
        </div>
      </div>
      
      <div style={{
        background: theme.gradient,
        borderRadius: '8px',
        padding: '16px',
        border: `1px solid ${theme.accent}`,
        marginBottom: '16px'
      }}>
        <p style={{
          color: theme.accent,
          fontSize: '12px',
          fontWeight: 'bold',
          lineHeight: '1.6',
          margin: '0'
        }}>
          🔒 Your content and settings are being stored securely in Supabase. All data is encrypted and backed up automatically.
        </p>
      </div>
      
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: isDark 
            ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
            : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: theme.cardShadow,
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.cardShadow;
        }}
      >
        <Database style={{ height: '14px', width: '14px' }} />
        <span>🚀 Open Supabase Project</span>
        <ExternalLink style={{ height: '12px', width: '12px' }} />
      </button>
    </div>
  );
};

// Main Component
export default function ContentManager({ isDark = false }: { isDark?: boolean }) {
  const theme = getThemeStyles(isDark);
  const [activeTab, setActiveTab] = useState('media');
  const [savedPosts, setSavedPosts] = useState<ContentPost[]>([]);
  
  // Mock data from settings
  const [characterProfiles] = useState<CharacterProfile[]>([
    { id: '1', name: 'Business Professional', description: 'Corporate tone' },
    { id: '2', name: 'Casual Friend', description: 'Friendly and approachable' },
    { id: '3', name: 'Expert Educator', description: 'Informative and authoritative' },
  ]);

  const [contentTypes] = useState<ContentType[]>([
    { id: '1', name: 'Announcement' },
    { id: '2', name: 'Tutorial' },
    { id: '3', name: 'News Update' },
    { id: '4', name: 'Promotional' },
  ]);

  const [templates] = useState<ContentTemplate[]>([
    { id: '1', name: 'Standard Post', content: 'Standard format' },
    { id: '2', name: 'News Alert', content: 'Breaking news format' },
    { id: '3', name: 'Tutorial Guide', content: 'Step-by-step format' },
  ]);

  const [platforms] = useState<SocialPlatform[]>([
    { id: '1', name: 'Telegram Group 1', url: 'https://t.me/group1', isActive: true, isDefault: true },
    { id: '2', name: 'Telegram Group 2', url: 'https://t.me/group2', isActive: true, isDefault: false },
    { id: '3', name: 'Facebook Page', url: 'https://facebook.com/page', isActive: true, isDefault: false },
    { id: '4', name: 'Forum', url: 'https://yourforum.com', isActive: true, isDefault: true },
    { id: '5', name: 'Twitter', url: 'https://twitter.com/account', isActive: false, isDefault: false },
  ]);

  const handleSavePost = (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
    const newPost: ContentPost = {
      ...postData,
      id: Date.now().toString(),
      createdDate: new Date(),
    };
    setSavedPosts(prev => [newPost, ...prev]);
  };

  const handleAddToSchedule = (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
    const newPost: ContentPost = {
      ...postData,
      id: Date.now().toString(),
      createdDate: new Date(),
    };
    setSavedPosts(prev => [newPost, ...prev]);
    alert('Post ready for scheduling! (Will integrate with scheduler tab next)');
  };

  const handleEditPost = (postId: string) => {
    alert('Edit functionality coming next');
  };

  const handleSchedulePost = (postId: string) => {
    alert('Schedule functionality coming next');
  };

  const handleDeletePost = (postId: string) => {
    setSavedPosts(prev => prev.filter(post => post.id !== postId));
  };

  const tabs = [
    { id: 'media', label: 'Create Content', icon: Image },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.backgroundSecondary,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gap: '20px'
      }}>
        {/* Tabs */}
        <div style={{
          backgroundColor: theme.background,
          boxShadow: theme.cardShadow,
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flex: 1,
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === tab.id ? theme.accent : theme.background,
                    color: activeTab === tab.id ? 'white' : theme.textSecondary,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
                      e.currentTarget.style.color = theme.text;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = theme.background;
                      e.currentTarget.style.color = theme.textSecondary;
                    }
                  }}
                >
                  <Icon style={{ height: '18px', width: '18px' }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'media' && (
            <div style={{ display: 'grid', gap: '20px' }}>
              <ContentCreationForm
                onSave={handleSavePost}
                onAddToSchedule={handleAddToSchedule}
                characterProfiles={characterProfiles}
                contentTypes={contentTypes}
                templates={templates}
                platforms={platforms}
                isDark={isDark}
              />
              
              <SavedPostsList
                posts={savedPosts}
                onEditPost={handleEditPost}
                onSchedulePost={handleSchedulePost}
                onDeletePost={handleDeletePost}
                isDark={isDark}
              />
            </div>
          )}

          {activeTab === 'database' && <SupabaseConnection isDark={isDark} />}
        </div>
      </div>
    </div>
  );
}
