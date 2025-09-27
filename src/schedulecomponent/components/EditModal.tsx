// /src/schedulecomponent/components/EditModal.tsx - CORRECTED: Character Profile Header & Platform Connections
import React, { useState, useEffect } from 'react';
import { Edit3, X, Save, Calendar, Clock, User, Hash, FileText, ExternalLink, Image, Video, Trash2, Plus, MessageCircle, Users } from 'lucide-react';
import { formatDate, formatTime, isValidDate } from '../utils/dateUtils';
import { getPlatformIcon, formatPlatformList } from '../utils/platformUtils';
import { getTheme } from '../utils/styleUtils';
import { MediaFile, ScheduledPost } from '../types';
import { supabase } from '../config';

interface EditablePost {
  id: string;
  content_id: string;
  title: string;
  description: string;
  character_profile: string | string[];
  theme: string;
  audience: string;
  media_type: string;
  template_type: string;
  platform: string;
  voice_style?: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  media_files: MediaFile[];
  selected_platforms: string[];
  scheduled_date?: Date;
  status: string;
  social_platforms?: string[];
  telegram_configurations?: string[];
}

interface EditModalProps {
  post: ScheduledPost | null;
  onSave: (postId: string, updates: Partial<EditablePost>) => Promise<void>;
  onCancel: () => void;
  availablePlatforms?: Array<{ id: string; name: string; isActive: boolean }>;
  characterProfiles?: Array<{ id: string; name: string; username: string; role: string }>;
}

export default function EditModal({ 
  post, 
  onSave, 
  onCancel, 
  availablePlatforms = [],
  characterProfiles = []
}: EditModalProps) {
  const [formData, setFormData] = useState<Partial<EditablePost>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  
  // Platform configuration state
  const [socialPlatforms, setSocialPlatforms] = useState<any[]>([]);
  const [telegramConfigs, setTelegramConfigs] = useState<any[]>([]);
  const [selectedSocialPlatforms, setSelectedSocialPlatforms] = useState<string[]>([]);
  const [selectedTelegramConfigs, setSelectedTelegramConfigs] = useState<string[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);
  
  // ADDED: Character profile state
  const [characterProfileData, setCharacterProfileData] = useState<any>(null);
  const [characterProfileLoading, setCharacterProfileLoading] = useState(false);

  const { isDarkMode, theme } = getTheme();

  // ADDED: Helper to check if string is UUID
  const isUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // CORRECTED: Fetch character profile data by UUID
  const fetchCharacterProfile = async (profileId: string) => {
    try {
      setCharacterProfileLoading(true);
      
      console.log('Fetching from character_profiles table with ID:', profileId);
      
      const { data, error } = await supabase
        .from('character_profiles')
        .select('avatar_id, name, username, role') // FIXED: Use avatar_id not character_avatar
        .eq('id', profileId)
        .single();
      
      if (error) {
        console.error('Error fetching character profile:', error);
        setCharacterProfileData(null);
      } else {
        console.log('Successfully fetched character profile:', data);
        setCharacterProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching character profile:', error);
      setCharacterProfileData(null);
    } finally {
      setCharacterProfileLoading(false);
    }
  };

  // UPDATED: Get character profile image from avatar_id
  const getCharacterProfileImage = () => {
    if (characterProfileData?.avatar_id) {
      return characterProfileData.avatar_id;
    }
    return null;
  };

  // FIXED: Helper function to detect image URLs
  const isImageUrl = (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    
    // Check for common image hosting patterns or file extensions
    return (
      lowerUrl.includes('http') && (
        imageExtensions.some(ext => lowerUrl.includes(ext)) ||
        lowerUrl.includes('supabase') ||
        lowerUrl.includes('cloudinary') ||
        lowerUrl.includes('imgur') ||
        lowerUrl.includes('amazonaws')
      )
    );
  };

  // CORRECTED: Fetch platform configurations with proper error handling
  const fetchPlatformConfigurations = async () => {
    try {
      setPlatformsLoading(true);
      
      // Fetch social platforms with name + url
      const { data: socialData, error: socialError } = await supabase
        .from('social_platforms')
        .select('id, name, url, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (socialError) {
        console.error('Error fetching social platforms:', socialError);
        setSocialPlatforms([]);
      } else {
        console.log('Fetched social platforms:', socialData);
        setSocialPlatforms(socialData || []);
      }

      // Fetch telegram configurations with name + channel_group_id + thread_id
      const { data: telegramData, error: telegramError } = await supabase
        .from('telegram_configurations')
        .select('id, name, channel_group_id, thread_id, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (telegramError) {
        console.error('Error fetching telegram configs:', telegramError);
        setTelegramConfigs([]);
      } else {
        console.log('Fetched telegram configs:', telegramData);
        setTelegramConfigs(telegramData || []);
      }
    } catch (error) {
      console.error('Error fetching platform configurations:', error);
      setSocialPlatforms([]);
      setTelegramConfigs([]);
    } finally {
      setPlatformsLoading(false);
    }
  };

  // FIXED: Initialize form data and platform selections
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        description: post.description || '',
        hashtags: Array.isArray(post.hashtags) ? [...post.hashtags] : [],
        keywords: post.keywords || '',
        cta: post.cta || '',
        media_files: Array.isArray(post.media_files) ? [...post.media_files] : [],
        selected_platforms: Array.isArray(post.selected_platforms) ? [...post.selected_platforms] : [],
        character_profile: post.character_profile || '',
        theme: post.theme || '',
        audience: post.audience || '',
        media_type: post.media_type || '',
        template_type: post.template_type || '',
        platform: post.platform || ''
      });
      
      // CORRECTED: Initialize platform selections from post data
      const postData = post as any; // Type assertion for additional fields
      setSelectedSocialPlatforms(
        Array.isArray(postData.social_platforms) ? postData.social_platforms : []
      );
      setSelectedTelegramConfigs(
        Array.isArray(postData.telegram_configurations) ? postData.telegram_configurations : []
      );
    }
  }, [post]);

  // Fetch platform configurations when modal opens
  useEffect(() => {
    if (post) {
      fetchPlatformConfigurations();
    }
  }, [post]);

  // ADDED: Fetch character profile data when modal opens
  useEffect(() => {
    if (post?.character_profile) {
      // Check if character_profile is a UUID and fetch the data
      if (typeof post.character_profile === 'string' && isUUID(post.character_profile)) {
        console.log('Fetching character profile for UUID:', post.character_profile);
        fetchCharacterProfile(post.character_profile);
      }
      // If it's an array, check for UUIDs
      else if (Array.isArray(post.character_profile)) {
        const uuid = post.character_profile.find(item => 
          typeof item === 'string' && isUUID(item)
        );
        if (uuid) {
          console.log('Fetching character profile for UUID from array:', uuid);
          fetchCharacterProfile(uuid);
        }
      }
    }
  }, [post?.character_profile]);

  if (!post) return null;

  // Helper to get character profile display value
  const getCharacterProfileDisplay = () => {
    if (Array.isArray(post.character_profile)) {
      return post.character_profile[0] || '';
    }
    return post.character_profile || '';
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
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
  };

  const modalStyle = {
    backgroundColor: theme.background,
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: theme.cardBg,
    color: theme.text,
    fontFamily: 'inherit'
  };

  const buttonStyle = (variant: 'primary' | 'secondary' | 'danger') => {
    const variants = {
      primary: {
        backgroundColor: theme.primary,
        color: 'white',
        border: 'none'
      },
      secondary: {
        backgroundColor: 'transparent',
        color: theme.textSecondary,
        border: `1px solid ${theme.border}`
      },
      danger: {
        backgroundColor: theme.danger,
        color: 'white',
        border: 'none'
      }
    };

    return {
      ...variants[variant],
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    };
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle hashtag management
  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !formData.hashtags?.includes(tag)) {
      handleFieldChange('hashtags', [...(formData.hashtags || []), tag]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    handleFieldChange('hashtags', formData.hashtags?.filter(tag => tag !== tagToRemove) || []);
  };

  // Handle URL addition
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    
    let url = urlInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newUrlFile: MediaFile = {
      id: Date.now().toString() + Math.random(),
      name: urlTitle || 'URL Link',
      type: 'url_link',
      size: 0,
      url: url
    };

    handleFieldChange('media_files', [...(formData.media_files || []), newUrlFile]);
    setUrlInput('');
    setUrlTitle('');
  };

  // Handle file removal
  const handleRemoveFile = (fileId: string) => {
    handleFieldChange('media_files', formData.media_files?.filter(f => f.id !== fileId) || []);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Validation
      if (!formData.description?.trim()) {
        setError('Description is required');
        return;
      }

      // FIXED: Ensure platform arrays are properly formatted as strings
      const cleanSocialPlatforms = selectedSocialPlatforms.filter(id => 
        id && typeof id === 'string' && id.trim() !== ''
      );
      
      const cleanTelegramConfigs = selectedTelegramConfigs.filter(id => 
        id && typeof id === 'string' && id.trim() !== ''
      );

      // ADDED: Populate character profile data if we have it
      let updatedFormData = {
        ...formData,
        social_platforms: cleanSocialPlatforms,
        telegram_configurations: cleanTelegramConfigs
      };

      // If we have character profile data, include it in the save
      if (characterProfileData) {
        updatedFormData = {
          ...updatedFormData,
          character_avatar: characterProfileData.avatar_id || '',
          name: characterProfileData.name || '',
          username: characterProfileData.username || '',
          role: characterProfileData.role || ''
        };
        console.log('Including character profile data in save:', {
          character_avatar: characterProfileData.avatar_id,
          name: characterProfileData.name,
          username: characterProfileData.username,
          role: characterProfileData.role
        });
      }

      console.log('Final form data being saved:', updatedFormData);
      await onSave(post.id, updatedFormData);
    } catch (err) {
      setError('Failed to update post. Please try again.');
      console.error('Update failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image size={16} style={{ color: theme.primary }} />;
      case 'video': return <Video size={16} style={{ color: theme.success }} />;
      case 'pdf': return <FileText size={16} style={{ color: theme.danger }} />;
      case 'url_link': return <ExternalLink size={16} style={{ color: '#8b5cf6' }} />;
      default: return <FileText size={16} style={{ color: theme.textSecondary }} />;
    }
  };

  const characterProfileImage = getCharacterProfileImage();

  return (
    <div style={modalOverlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: theme.primary,
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Edit3 size={24} />
            Edit Post
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.textSecondary,
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* CORRECTED: Enhanced Character Profile Header with better debugging */}
        {post?.character_profile && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.textSecondary,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <User size={16} />
              Character Profile Header
              {characterProfileLoading && (
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: `2px solid ${theme.border}`,
                  borderTop: `2px solid ${theme.primary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </div>

            {/* Debug Info */}
            <div style={{
              fontSize: '10px',
              color: theme.textSecondary,
              marginBottom: '8px',
              fontFamily: 'monospace'
            }}>
              Profile ID: {typeof post.character_profile === 'string' ? post.character_profile : JSON.stringify(post.character_profile)}
            </div>

            {characterProfileLoading && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: theme.textSecondary
              }}>
                Loading character profile data...
              </div>
            )}

            {!characterProfileLoading && characterProfileData && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.primary,
                  marginBottom: '8px'
                }}>
                  {characterProfileData.name || 'Character Profile'}
                </div>
                
                {/* Debug: Show all character profile fields */}
                <details style={{ marginBottom: '8px' }}>
                  <summary style={{ 
                    fontSize: '10px', 
                    color: theme.textSecondary, 
                    cursor: 'pointer',
                    marginBottom: '4px'
                  }}>
                    Debug: View Profile Data
                  </summary>
                  <pre style={{
                    fontSize: '9px',
                    color: theme.textSecondary,
                    backgroundColor: theme.background,
                    padding: '8px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '100px'
                  }}>
                    {JSON.stringify(characterProfileData, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {!characterProfileLoading && !characterProfileData && post.character_profile && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                color: '#856404',
                fontSize: '12px'
              }}>
                Failed to load character profile data. Check console for errors.
              </div>
            )}

            {characterProfileImage && (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={characterProfileImage}
                  alt="Character Profile Header"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    console.error('Failed to load character profile image:', characterProfileImage);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Successfully loaded character profile image:', characterProfileImage);
                  }}
                />
              </div>
            )}

            {!characterProfileImage && characterProfileData && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '6px',
                color: '#721c24',
                fontSize: '12px'
              }}>
                Character profile loaded but no image found. Check image field names.
              </div>
            )}
          </div>
        )}

        {/* Post Info */}
        <div style={{
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '12px',
            color: theme.textSecondary,
            flexWrap: 'wrap'
          }}>
            <span>ID: {post.content_id}</span>
            <span>Status: {post.status}</span>
            <span>Profile: {getCharacterProfileDisplay()}</span>
            {post.theme && <span>Theme: {post.theme}</span>}
            {post.audience && <span>Audience: {post.audience}</span>}
            {post.media_type && <span>Media Type: {post.media_type}</span>}
            {post.template_type && <span>Template: {post.template_type}</span>}
            {post.scheduled_date && (
              <span>Scheduled: {formatDate(post.scheduled_date)} {formatTime(post.scheduled_date)}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {/* 1. MEDIA FILES - MOVED TO TOP */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '8px'
            }}>
              Media Files
            </label>
            <div style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '16px'
            }}>
              {/* Existing Media Files */}
              {formData.media_files && formData.media_files.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    marginBottom: '8px'
                  }}>
                    Attached Files ({formData.media_files.length})
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {formData.media_files.map((file) => (
                      <div key={file.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: theme.background,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px'
                      }}>
                        {getFileIcon(file.type)}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: theme.text,
                            marginBottom: '2px'
                          }}>
                            {file.name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: theme.textSecondary
                          }}>
                            {file.type} • {file.size ? `${Math.round(file.size / 1024)} KB` : 'Link'}
                          </div>
                          {file.url && (
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '12px',
                                color: theme.primary,
                                textDecoration: 'none'
                              }}
                            >
                              View File →
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          style={{
                            padding: '4px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: theme.danger,
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                          title="Remove file"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add URL Section */}
              <div style={{
                padding: '12px',
                backgroundColor: theme.background,
                borderRadius: '6px',
                border: `1px dashed ${theme.border}`
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.textSecondary,
                  marginBottom: '8px'
                }}>
                  Add URL Link
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '8px'
                }}>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    style={{
                      padding: '8px 12px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: theme.cardBg,
                      color: theme.text,
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    onClick={handleAddUrl}
                    disabled={!urlInput.trim()}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: urlInput.trim() ? theme.primary : theme.border,
                      color: urlInput.trim() ? 'white' : theme.textSecondary,
                      border: 'none',
                      borderRadius: '6px',
                      cursor: urlInput.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'inherit'
                    }}
                  >
                    Add URL
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* CORRECTED: Character Profile Header with avatar_id + username + role - MOVED AFTER MEDIA */}
        {post?.character_profile && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.textSecondary,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <User size={16} />
              Character Profile Header
              {characterProfileLoading && (
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: `2px solid ${theme.border}`,
                  borderTop: `2px solid ${theme.primary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </div>

            {characterProfileLoading && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: theme.textSecondary
              }}>
                Loading character profile...
              </div>
            )}

            {!characterProfileLoading && characterProfileData && (
              <div>
                {/* Character Profile Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  {characterProfileImage && (
                    <img 
                      src={characterProfileImage}
                      alt="Character Avatar"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: `2px solid ${theme.primary}`,
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        console.error('Failed to load avatar:', characterProfileImage);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  
                  <div style={{ flex: 1 }}>
                    {/* FIXED: Display name */}
                    {characterProfileData.name && (
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: theme.text,
                        marginBottom: '2px'
                      }}>
                        {characterProfileData.name}
                      </div>
                    )}
                    
                    {/* FIXED: Display username */}
                    {characterProfileData.username && (
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: theme.primary,
                        marginBottom: '4px'
                      }}>
                        @{characterProfileData.username}
                      </div>
                    )}
                    
                    {/* FIXED: Display role */}
                    {characterProfileData.role && (
                      <div style={{
                        fontSize: '12px',
                        color: theme.textSecondary,
                        backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        display: 'inline-block'
                      }}>
                        {characterProfileData.role}
                      </div>
                    )}
                  </div>
                </div>

                {/* Header Image (if different from avatar) - EXCLUDED FROM SOCIAL SHARING */}
                {characterProfileImage && (
                  <div 
                    style={{ textAlign: 'center' }}
                    data-exclude-from-sharing="true"
                    className="character-profile-ui-only"
                  >
                    <img 
                      src={characterProfileImage}
                      alt="Character Profile Header"
                      data-exclude-from-sharing="true"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        console.error('Failed to load header image:', characterProfileImage);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {!characterProfileLoading && !characterProfileData && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                color: '#856404',
                fontSize: '12px'
              }}>
                Failed to load character profile data. Check console for errors.
              </div>
            )}
          </div>
        )}

          {/* 2. CHARACTER PROFILE HEADER - STAYS IN CURRENT POSITION */}
          {/* This section is already positioned correctly - no changes needed */}

          {/* 3. TITLE */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '8px'
            }}>
              Title/Headline
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter post title..."
              style={inputStyle}
            />
          </div>

          {/* 4. DESCRIPTION */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '8px'
            }}>
              Description *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Write your post content..."
              rows={6}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '120px'
              }}
            />
          </div>

          {/* 5. HASHTAGS - MOVED UP */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '8px'
            }}>
              Hashtags
            </label>
            <div style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  placeholder="Add hashtag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={handleAddHashtag}
                  disabled={!hashtagInput.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: hashtagInput.trim() ? theme.primary : theme.border,
                    color: hashtagInput.trim() ? 'white' : theme.textSecondary,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: hashtagInput.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'inherit'
                  }}
                >
                  Add
                </button>
              </div>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                minHeight: '40px',
                padding: '8px',
                backgroundColor: theme.background,
                borderRadius: '6px',
                border: `1px dashed ${theme.border}`
              }}>
                {formData.hashtags?.map((tag) => (
                  <div key={tag} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
                    color: theme.primary,
                    padding: '4px 8px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    <Hash size={10} />
                    {tag}
                    <button
                      onClick={() => handleRemoveHashtag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '14px',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. KEYWORDS and 7. CTA - MOVED UP */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '8px'
              }}>
                Keywords
              </label>
              <input
                type="text"
                value={formData.keywords || ''}
                onChange={(e) => handleFieldChange('keywords', e.target.value)}
                placeholder="SEO keywords..."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '8px'
              }}>
                Call to Action
              </label>
              <input
                type="text"
                value={formData.cta || ''}
                onChange={(e) => handleFieldChange('cta', e.target.value)}
                placeholder="What action should users take?"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Additional Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '8px'
              }}>
                Theme
              </label>
              <input
                type="text"
                value={formData.theme || ''}
                onChange={(e) => handleFieldChange('theme', e.target.value)}
                placeholder="Content theme..."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '8px'
              }}>
                Audience
              </label>
              <input
                type="text"
                value={formData.audience || ''}
                onChange={(e) => handleFieldChange('audience', e.target.value)}
                placeholder="Target audience..."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '8px'
              }}>
                Media Type
              </label>
              <input
                type="text"
                value={formData.media_type || ''}
                onChange={(e) => handleFieldChange('media_type', e.target.value)}
                placeholder="Media type..."
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '8px'
              }}>
                Template Type
              </label>
              <input
                type="text"
                value={formData.template_type || ''}
                onChange={(e) => handleFieldChange('template_type', e.target.value)}
                placeholder="Template type..."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '8px'
              }}>
                Primary Platform
              </label>
              <input
                type="text"
                value={formData.platform || ''}
                onChange={(e) => handleFieldChange('platform', e.target.value)}
                placeholder="Primary platform..."
                style={inputStyle}
              />
            </div>
          </div>

          {/* CORRECTED: Social Platforms with proper name + url display */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Users size={16} />
              Social Platforms
              {platformsLoading && (
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: `2px solid ${theme.border}`,
                  borderTop: `2px solid ${theme.primary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </label>
            <div style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '16px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {socialPlatforms.length === 0 && !platformsLoading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: theme.textSecondary,
                  fontSize: '14px'
                }}>
                  No social platform configurations found
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '8px'
                }}>
                  {socialPlatforms.map((platform) => (
                    <label
                      key={platform.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        border: selectedSocialPlatforms.includes(platform.id)
                          ? `1px solid ${theme.primary}`
                          : `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: selectedSocialPlatforms.includes(platform.id)
                          ? (isDarkMode ? '#1e3a8a30' : '#dbeafe')
                          : theme.background,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSocialPlatforms.includes(platform.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSocialPlatforms(prev => [...prev, platform.id]);
                          } else {
                            setSelectedSocialPlatforms(prev => prev.filter(id => id !== platform.id));
                          }
                        }}
                        style={{
                          height: '16px',
                          width: '16px',
                          accentColor: theme.primary
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: theme.text,
                          marginBottom: '2px'
                        }}>
                          {platform.name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: theme.textSecondary
                        }}>
                          {platform.url ? (
                            <a 
                              href={platform.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{
                                color: theme.primary,
                                textDecoration: 'none'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {platform.url} →
                            </a>
                          ) : 'No URL configured'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CORRECTED: Telegram Configurations with proper name + channel_group_id + thread_id display */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MessageCircle size={16} />
              Telegram Channels & Groups
              {platformsLoading && (
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: `2px solid ${theme.border}`,
                  borderTop: `2px solid ${theme.primary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </label>
            <div style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '16px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {telegramConfigs.length === 0 && !platformsLoading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: theme.textSecondary,
                  fontSize: '14px'
                }}>
                  No Telegram configurations found
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '8px'
                }}>
                  {telegramConfigs.map((config) => (
                    <label
                      key={config.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        border: selectedTelegramConfigs.includes(config.id)
                          ? `1px solid ${theme.primary}`
                          : `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: selectedTelegramConfigs.includes(config.id)
                          ? (isDarkMode ? '#1e3a8a30' : '#dbeafe')
                          : theme.background,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTelegramConfigs.includes(config.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTelegramConfigs(prev => [...prev, config.id]);
                          } else {
                            setSelectedTelegramConfigs(prev => prev.filter(id => id !== config.id));
                          }
                        }}
                        style={{
                          height: '16px',
                          width: '16px',
                          accentColor: theme.primary
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: theme.text,
                          marginBottom: '2px'
                        }}>
                          {config.name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: theme.textSecondary
                        }}>
                          Channel: {config.channel_group_id || 'N/A'}
                          {config.thread_id && ` • Thread: ${config.thread_id}`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '20px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            style={buttonStyle('secondary')}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = theme.cardBg;
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.description?.trim()}
            style={{
              ...buttonStyle('primary'),
              opacity: (isSubmitting || !formData.description?.trim()) ? 0.7 : 1,
              cursor: (isSubmitting || !formData.description?.trim()) ? 'not-allowed' : 'pointer'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting && formData.description?.trim()) {
                e.currentTarget.style.backgroundColor = theme.primaryHover;
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting && formData.description?.trim()) {
                e.currentTarget.style.backgroundColor = theme.primary;
              }
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* CSS for loading animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
