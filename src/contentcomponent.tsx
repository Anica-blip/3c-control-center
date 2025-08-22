import React, { useState, useRef, useContext, createContext } from 'react';
import { Upload, X, Image, Video, FileText, Download, Eye, Trash2, Plus, Settings, ExternalLink, Database, CheckCircle, Circle, Check } from 'lucide-react';

// Dark Mode Context - This will be passed from App.tsx
const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

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

// Sub-components
const ContentCreationForm = ({ 
  onSave, 
  onAddToSchedule, 
  characterProfiles, 
  contentTypes, 
  templates, 
  platforms 
}: {
  onSave: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  onAddToSchedule: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  characterProfiles: CharacterProfile[];
  contentTypes: ContentType[];
  templates: ContentTemplate[];
  platforms: SocialPlatform[];
}) => {
  const { isDarkMode } = useTheme();
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
      case 'image': return <Image style={{height: '16px', width: '16px', color: '#3b82f6'}} />;
      case 'video': return <Video style={{height: '16px', width: '16px', color: '#10b981'}} />;
      case 'pdf': return <FileText style={{height: '16px', width: '16px', color: '#ef4444'}} />;
      case 'interactive': return <Settings style={{height: '16px', width: '16px', color: '#8b5cf6'}} />;
      default: return <FileText style={{height: '16px', width: '16px', color: '#6b7280'}} />;
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
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      boxShadow: isDarkMode 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`,
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: isDarkMode ? '#60a5fa' : '#3b82f6',
          margin: '0 0 8px 0'
        }}>
          🎨 Create New Content
        </h2>
        <p style={{
          color: isDarkMode ? '#94a3b8' : '#6b7280',
          fontSize: '14px',
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
        background: isDarkMode 
          ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#475569' : '#3b82f6'}`,
        marginBottom: '20px'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 'bold',
            color: isDarkMode ? '#e2e8f0' : '#1e40af',
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
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#374151' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
            color: isDarkMode ? '#e2e8f0' : '#1e40af',
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
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#374151' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
            color: isDarkMode ? '#e2e8f0' : '#1e40af',
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
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#374151' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
          fontSize: '16px',
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#111827',
          marginBottom: '12px'
        }}>
          📁 Media Upload
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDarkMode ? '#475569' : '#3b82f6'}`,
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = isDarkMode ? '#60a5fa' : '#1d4ed8';
            e.currentTarget.style.backgroundColor = isDarkMode ? '#475569' : '#dbeafe';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = isDarkMode ? '#475569' : '#3b82f6';
            e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f8fafc';
          }}
        >
          <Upload style={{
            height: '32px',
            width: '32px',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0 auto 12px auto',
            display: 'block'
          }} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#111827',
            margin: '0 0 6px 0'
          }}>
            📎 Upload your media files
          </h3>
          <p style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            margin: '0 0 4px 0'
          }}>
            Drop files here or click to browse
          </p>
          <p style={{
            fontSize: '12px',
            color: isDarkMode ? '#64748b' : '#9ca3af',
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
                fontSize: '14px',
                fontWeight: 'bold',
                color: isDarkMode ? '#f8fafc' : '#111827',
                margin: '0'
              }}>
                📋 Uploaded Files
              </h4>
              <span style={{
                padding: '4px 8px',
                backgroundColor: isDarkMode ? '#60a5fa' : '#3b82f6',
                color: 'white',
                fontSize: '12px',
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
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderRadius: '6px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      padding: '8px',
                      backgroundColor: isDarkMode ? '#1e293b' : 'white',
                      borderRadius: '6px',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#f8fafc' : '#111827',
                        marginBottom: '2px'
                      }}>
                        {file.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: isDarkMode ? '#94a3b8' : '#6b7280'
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
                      color: isDarkMode ? '#94a3b8' : '#6b7280'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#450a0a' : '#fee2e2';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
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
          fontSize: '16px',
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#111827',
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
            border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: isDarkMode ? '#374151' : 'white',
            color: isDarkMode ? '#f8fafc' : '#111827',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
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
          fontSize: '16px',
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#111827',
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
                  ? `1px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}` 
                  : `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: formData.selectedPlatforms.includes(platform.id) 
                  ? (isDarkMode ? '#1e3a8a' : '#dbeafe')
                  : (isDarkMode ? '#374151' : 'white'),
                boxShadow: formData.selectedPlatforms.includes(platform.id)
                  ? '0 2px 8px rgba(59, 130, 246, 0.15)'
                  : '0 1px 3px rgba(0, 0, 0, 0.05)',
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
                  accentColor: '#3b82f6'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#f8fafc' : '#111827',
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
                    backgroundColor: '#10b981',
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
        borderTop: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
      }}>
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            cursor: canSave ? 'pointer' : 'not-allowed',
            backgroundColor: canSave ? (isDarkMode ? '#4b5563' : '#6b7280') : '#d1d5db',
            color: canSave ? 'white' : '#9ca3af',
            boxShadow: canSave ? '0 2px 6px rgba(0, 0, 0, 0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (canSave) {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#4b5563';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (canSave) {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#6b7280';
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
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            cursor: canSave ? 'pointer' : 'not-allowed',
            backgroundColor: canSave ? (isDarkMode ? '#2563eb' : '#3b82f6') : '#d1d5db',
            color: canSave ? 'white' : '#9ca3af',
            boxShadow: canSave ? '0 2px 6px rgba(59, 130, 246, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (canSave) {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#1d4ed8' : '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (canSave) {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#2563eb' : '#3b82f6';
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

const SavedPostsList = ({ posts, onEditPost, onSchedulePost, onDeletePost }: {
  posts: ContentPost[];
  onEditPost: (postId: string) => void;
  onSchedulePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}) => {
  const { isDarkMode } = useTheme();

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
        fontSize: '12px',
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
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        boxShadow: isDarkMode 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <FileText style={{ height: '32px', width: '32px', color: isDarkMode ? '#64748b' : '#9ca3af' }} />
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#111827',
          margin: '0 0 8px 0'
        }}>
          📝 No content created yet
        </h3>
        <p style={{
          color: isDarkMode ? '#94a3b8' : '#6b7280',
          fontSize: '14px',
          margin: '0'
        }}>
          Start creating amazing content using the form above
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      boxShadow: isDarkMode 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '16px',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
          : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        borderBottom: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0'
          }}>
            📚 Saved Content
          </h3>
          <span style={{
            padding: '6px 12px',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            fontSize: '14px',
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
            borderBottom: `1px solid ${isDarkMode ? '#334155' : '#f3f4f6'}`,
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f9fafb';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : 'white';
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
                    fontSize: '12px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    fontWeight: 'bold'
                  }}>
                    📅 Created {post.createdDate.toLocaleDateString()}
                  </span>
                  {post.scheduledDate && (
                    <span style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#60a5fa' : '#3b82f6',
                      fontWeight: 'bold',
                      backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      ⏰ Scheduled for {post.scheduledDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <p style={{
                  color: isDarkMode ? '#f8fafc' : '#111827',
                  fontSize: '14px',
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
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                      padding: '6px 8px',
                      borderRadius: '6px'
                    }}>
                      <Image style={{ height: '14px', width: '14px' }} />
                      <span style={{ fontWeight: 'bold' }}>
                        {post.mediaFiles.length} file{post.mediaFiles.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                    padding: '6px 8px',
                    borderRadius: '6px'
                  }}>
                    <Settings style={{ height: '14px', width: '14px' }} />
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
                    color: isDarkMode ? '#94a3b8' : '#6b7280'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#1e3a8a' : '#dbeafe';
                    e.currentTarget.style.borderColor = isDarkMode ? '#60a5fa' : '#3b82f6';
                    e.currentTarget.style.color = isDarkMode ? '#60a5fa' : '#3b82f6';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
                  }}
                >
                  <Settings style={{ height: '16px', width: '16px' }} />
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
                      color: isDarkMode ? '#94a3b8' : '#6b7280'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#064e3b' : '#d1fae5';
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.color = '#10b981';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
                    }}
                  >
                    <Plus style={{ height: '16px', width: '16px' }} />
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
                    color: isDarkMode ? '#94a3b8' : '#6b7280'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#450a0a' : '#fee2e2';
                    e.currentTarget.style.borderColor = '#ef4444';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
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
};

const SupabaseConnection = () => {
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      boxShadow: isDarkMode 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
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
            fontSize: '18px',
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#111827',
            margin: '0 0 4px 0'
          }}>
            💾 Database Connection
          </h3>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            margin: '0',
            fontSize: '14px'
          }}>
            Manage your data storage and connectivity
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: isDarkMode ? '#064e3b' : '#d1fae5',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #10b981'
        }}>
          <CheckCircle style={{ height: '18px', width: '18px', color: '#10b981' }} />
          <span style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#065f46'
          }}>
            ✅ Connected
          </span>
        </div>
      </div>
      
      <div style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)'
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '8px',
        padding: '16px',
        border: `1px solid ${isDarkMode ? '#2563eb' : '#3b82f6'}`,
        marginBottom: '16px'
      }}>
        <p style={{
          color: isDarkMode ? '#e2e8f0' : '#1e40af',
          fontSize: '14px',
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
          background: isDarkMode 
            ? 'linear-gradient(135deg, #111827 0%, #374151 100%)'
            : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
        }}
      >
        <Database style={{ height: '16px', width: '16px' }} />
        <span>🚀 Open Supabase Project</span>
        <ExternalLink style={{ height: '14px', width: '14px' }} />
      </button>
    </div>
  );
};

// Main Component - Updated to accept and provide theme context
export default function ContentManager({ isDarkMode = false }: { isDarkMode?: boolean }) {
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
    // TODO: Navigate to scheduler tab or open scheduler modal
    alert('Post ready for scheduling! (Will integrate with scheduler tab next)');
  };

  const handleEditPost = (postId: string) => {
    // TODO: Load post data into form for editing
    alert('Edit functionality coming next');
  };

  const handleSchedulePost = (postId: string) => {
    // TODO: Move to scheduler
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
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode: () => {} }}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#0f172a' : '#f3f4f6',
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
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            boxShadow: isDarkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
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
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flex: 1,
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: activeTab === tab.id 
                        ? (isDarkMode ? '#2563eb' : '#3b82f6') 
                        : (isDarkMode ? '#1e293b' : 'white'),
                      color: activeTab === tab.id 
                        ? 'white' 
                        : (isDarkMode ? '#94a3b8' : '#6b7280'),
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f9fafb';
                        e.currentTarget.style.color = isDarkMode ? '#f8fafc' : '#111827';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : 'white';
                        e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
                      }
                    }}
                  >
                    <Icon style={{ height: '20px', width: '20px' }} />
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
                />
                
                <SavedPostsList
                  posts={savedPosts}
                  onEditPost={handleEditPost}
                  onSchedulePost={handleSchedulePost}
                  onDeletePost={handleDeletePost}
                />
              </div>
            )}

            {activeTab === 'database' && <SupabaseConnection />}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
