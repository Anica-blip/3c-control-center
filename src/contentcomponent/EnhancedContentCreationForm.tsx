import React, { useState, useRef, useEffect, useContext } from 'react';
import { Upload, X, Image, Video, FileText, Settings, ExternalLink, Plus, User, Eye, Edit3, Calendar, Trash2 } from 'lucide-react';
import { ContentPost, MediaFile, SocialPlatform, CharacterProfile } from './types';
import { supabaseAPI } from './supabaseAPI';
import { 
  fetchUrlPreview, 
  getThemeCode, 
  getAudienceCode, 
  getMediaCode, 
  getTemplateTypeCode, 
  getCharacterCode, 
  getVoiceStyleCode 
} from './utils';

// Theme Context (assuming this comes from your App.tsx)
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

// Types
interface ContentPost {
  id: string;
  contentId: string; // CP-YYYY-### format
  characterProfile: string;
  theme: string;
  audience: string;
  mediaType: string;
  templateType: string;
  platform: string;
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  mediaFiles: MediaFile[];
  selectedPlatforms: string[];
  status: 'pending' | 'scheduled' | 'published';
  createdDate: Date;
  scheduledDate?: Date;
  isFromTemplate?: boolean;
  sourceTemplateId?: string;
  supabaseId?: string; // Supabase record ID
  voiceStyle?: string;
}

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'gif' | 'interactive' | 'other';
  size: number;
  url: string;
  supabaseUrl?: string; // URL after upload to Supabase
  urlPreview?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

interface SocialPlatform {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  isDefault: boolean;
  displayName?: string;
  display_name?: string;
}

interface CharacterProfile {
  id: string;
  name: string;
  username: string;
  role: string;
  description: string;
  avatar_id: string | null;
  is_active: boolean;
  created_at: string;
}

// Enhanced Content Creation Form
const EnhancedContentCreationForm = ({ 
  onSave, 
  onAddToSchedule, 
  characterProfiles, 
  platforms,
  isSaving,
  isLoadingProfiles,
  editingPost,
  onEditComplete
}: {
  onSave: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  onAddToSchedule: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  characterProfiles: CharacterProfile[];
  platforms: SocialPlatform[];
  isSaving?: boolean;
  isLoadingProfiles?: boolean;
  editingPost?: ContentPost | null;
  onEditComplete?: () => void;
}) => {
  const { isDarkMode } = useTheme();

  // Load platforms on mount
  useEffect(() => {
    const loadPlatformsFromSupabase = async () => {
      try {
        setIsLoadingPlatformsState(true);
        const loadedPlatforms = await supabaseAPI.loadPlatforms();
        setPlatforms(loadedPlatforms);
      } catch (error) {
        console.error('Error loading platforms:', error);
        // Fallback to props platforms if Supabase fails
        setPlatforms(propsPlatforms || []);
      } finally {
        setIsLoadingPlatformsState(false);
      }
    };

    loadPlatformsFromSupabase();
  }, [propsPlatforms]);
  
  // Form state matching template builder structure
  const [selections, setSelections] = useState({
    characterProfile: '',
    theme: '',
    audience: '',
    mediaType: '',
    templateType: '',
    platform: '',
    voiceStyle: ''
  });

  const [content, setContent] = useState({
    title: '',
    description: '',
    hashtags: [] as string[],
    keywords: '',
    cta: ''
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [contentId, setContentId] = useState('');
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [fieldConfig, setFieldConfig] = useState<any>(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Code mapping functions for content ID generation
  const getThemeCodeLocal = (value: string) => {
    const codes: Record<string, string> = {
      'news_alert': 'NA', 'promotion': 'PR', 'standard_post': 'SP',
      'cta_quiz': 'QZ', 'cta_game': 'GA', 'cta_puzzle': 'PZ',
      'cta_challenge': 'CH', 'news': 'NS', 'blog': 'BP',
      'tutorial_guide': 'TG', 'course_tool': 'CT', 'assessment': 'AS'
    };
    return codes[value] || 'XX';
  };

  const getAudienceCodeLocal = (value: string) => {
    const codes: Record<string, string> = {
      'existing_members': 'EM', 'new_members': 'NM', 'persona_falcon': 'FL',
      'persona_panther': 'PA', 'persona_wolf': 'WF', 'persona_lion': 'LI',
      'general_public': 'GP'
    };
    return codes[value] || 'XX';
  };

  const getMediaCodeLocal = (value: string) => {
    const codes: Record<string, string> = {
      'image': 'IM', 'video': 'VD', 'gifs': 'GF', 'pdf': 'PF',
      'interactive_media': 'IM', 'url_link': 'UL'
    };
    return codes[value] || 'XX';
  };

  const getTemplateTypeCodeLocal = (value: string) => {
    const codes: Record<string, string> = {
      'social_media': 'SM', 'presentation': 'PR', 'video_message': 'VM',
      'anica_chat': 'AC', 'blog_posts': 'BP', 'news_article': 'NA',
      'newsletter': 'NL', 'email_templates': 'ET', 'custom_templates': 'CT'
    };
    return codes[value] || 'XX';
  };

  const getCharacterCodeLocal = (name: string) => {
    const codes: Record<string, string> = {
      'anica': 'AN',
      'caelum': 'CA', 
      'aurion': 'AU'
    };
    return codes[name.toLowerCase()] || 'XX';
  };

  const getVoiceStyleCodeLocal = (value: string) => {
    const codes: Record<string, string> = {
      'casual': 'CS',
      'friendly': 'FR',
      'professional': 'PR',
      'creative': 'CR'
    };
    return codes[value] || 'XX';
  };

  // Platform configuration functions (inline implementation)
  const getPlatformConfig = (platform: string) => {
    const configs: Record<string, any> = {
      instagram: {
        title: { show: true, maxLength: 125 },
        description: { maxLength: 2200 },
        hashtags: { maxCount: 30, recommended: 11 }
      },
      twitter: {
        title: { show: false },
        description: { maxLength: 280 },
        hashtags: { maxCount: 2, recommended: 1 }
      },
      linkedin: {
        title: { show: true, maxLength: 150 },
        description: { maxLength: 3000 },
        hashtags: { maxCount: 5, recommended: 3 }
      },
      youtube: {
        title: { show: true, maxLength: 100 },
        description: { maxLength: 5000 },
        hashtags: { maxCount: 15, recommended: 5 }
      },
      facebook: {
        title: { show: true, maxLength: 120 },
        description: { maxLength: 2000 },
        hashtags: { maxCount: 5, recommended: 2 }
      }
    };
    
    return configs[platform] || {
      title: { show: true, maxLength: 150 },
      description: { maxLength: 2200 },
      hashtags: { maxCount: 30, recommended: 10 }
    };
  };

  // Platform-specific preview sizing with TELEGRAM as GENERIC
  const getPlatformPreviewStyle = (platform: string) => {
    const styles = {
      instagram: {
        aspectRatio: '1 / 1', // Square posts
        maxWidth: '400px',
        label: 'Instagram Square Post (1:1)'
      },
      facebook: {
        aspectRatio: '1.91 / 1', // Facebook recommended
        maxWidth: '500px',
        label: 'Facebook Post (1.91:1)'
      },
      twitter: {
        aspectRatio: '16 / 9', // Twitter recommended
        maxWidth: '500px',
        label: 'Twitter/X Post (16:9)'
      },
      linkedin: {
        aspectRatio: '1.91 / 1', // LinkedIn recommended
        maxWidth: '500px',
        label: 'LinkedIn Post (1.91:1)'
      },
      youtube: {
        aspectRatio: '16 / 9', // YouTube thumbnail
        maxWidth: '480px',
        label: 'YouTube Thumbnail (16:9)'
      },
      tiktok: {
        aspectRatio: '9 / 16', // TikTok vertical
        maxWidth: '300px',
        label: 'TikTok Video (9:16)'
      },
      telegram: {
        aspectRatio: 'auto', // GENERIC SIZE as requested
        maxWidth: '100%', // GENERIC SIZE as requested
        label: 'Telegram (Original Size)' // Updated label
      },
      pinterest: {
        aspectRatio: '2 / 3', // Pinterest vertical
        maxWidth: '400px',
        label: 'Pinterest Pin (2:3)'
      },
      whatsapp: {
        aspectRatio: '16 / 9', // WhatsApp recommended
        maxWidth: '500px',
        label: 'WhatsApp Post (16:9)'
      }
    };
    
    return styles[platform as keyof typeof styles] || {
      aspectRatio: 'auto',
      maxWidth: '100%',
      label: 'Original Size (No Platform Selected)'
    };
  };

  // Generate content ID (Pattern-###CC format)
  const generateContentId = () => {
    const theme = selections.theme ? getThemeCodeLocal(selections.theme) : 'XX';
    const audience = selections.audience ? getAudienceCodeLocal(selections.audience) : 'XX';
    const media = selections.mediaType ? getMediaCodeLocal(selections.mediaType) : 'XX';
    const template = selections.templateType ? getTemplateTypeCodeLocal(selections.templateType) : 'XX';
    
    // FIX: Get character code from actual profile name, not ID
    let character = 'XX';
    if (selections.characterProfile) {
      const selectedProfile = characterProfiles.find(p => p.id === selections.characterProfile);
      if (selectedProfile) {
        character = getCharacterCodeLocal(selectedProfile.name);
      }
    }
    
    const voiceStyle = selections.voiceStyle ? getVoiceStyleCodeLocal(selections.voiceStyle) : 'XX';
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `${theme}-${audience}-${media}-${template}-${character}-${voiceStyle}-${String(randomNum).padStart(3, '0')}`;
  };

  // Initialize and update content ID based on selections
  useEffect(() => {
    const newId = generateContentId();
    setContentId(newId);
  }, [selections.theme, selections.audience, selections.mediaType, selections.templateType, selections.characterProfile, selections.voiceStyle, characterProfiles]);

  // Load editing post data when provided
  useEffect(() => {
    if (editingPost) {
      setSelections({
        characterProfile: editingPost.characterProfile,
        theme: editingPost.theme,
        audience: editingPost.audience,
        mediaType: editingPost.mediaType,
        templateType: editingPost.templateType,
        platform: editingPost.platform,
        voiceStyle: editingPost.voiceStyle || ''
      });
      
      setContent({
        title: editingPost.title,
        description: editingPost.description,
        hashtags: [...editingPost.hashtags],
        keywords: editingPost.keywords,
        cta: editingPost.cta
      });
      
      setMediaFiles([...editingPost.mediaFiles]);
      setSelectedPlatforms([...editingPost.selectedPlatforms]);
      setContentId(editingPost.contentId);
      setIsEditingPost(true);
      setupPlatformFields(editingPost.platform);
      
      console.log('Post loaded into form for editing:', editingPost.contentId);
    }
  }, [editingPost]);

  const setupPlatformFields = (platform: string) => {
    if (platform) {
      const config = getPlatformConfig(platform);
      setFieldConfig(config);
    }
  };

  const handleSelectionChange = (field: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'platform') {
      setupPlatformFields(value);
    }
  };

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !content.hashtags.includes(tag)) {
      const maxHashtags = fieldConfig?.hashtags?.maxCount || 30;
      if (content.hashtags.length < maxHashtags) {
        setContent(prev => ({
          ...prev,
          hashtags: [...prev.hashtags, tag]
        }));
        setHashtagInput('');
      }
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setContent(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(tag => tag !== tagToRemove)
    }));
  };

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
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    
    // Fetch URL preview
    const urlPreview = await fetchUrlPreview(urlInput.trim());
    
    const newUrlFile: MediaFile = {
      id: Date.now().toString() + Math.random(),
      name: urlTitle || 'URL Link',
      type: 'interactive',
      size: 0, // URLs don't have file size
      url: urlInput.trim(),
      urlPreview: urlPreview
    };
    
    setMediaFiles(prev => [...prev, newUrlFile]);
    setUrlInput('');
    setUrlTitle('');
  };

  const handleSave = async () => {
    const postData = {
      contentId,
      ...selections,
      ...content,
      mediaFiles,
      selectedPlatforms,
      status: 'pending' as const,
      isFromTemplate: false
    };

    try {
      await onSave(postData);
      if (isEditingPost && onEditComplete) {
        onEditComplete();
      } else {
        resetForm();
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save post. Please try again.');
    }
  };

  const handleAddToSchedule = async () => {
    const postData = {
      contentId,
      ...selections,
      ...content,
      mediaFiles,
      selectedPlatforms,
      status: 'scheduled' as const,
      isFromTemplate: false
    };

    try {
      await onAddToSchedule(postData);
      resetForm();
    } catch (error) {
      console.error('Schedule failed:', error);
      alert('Failed to schedule post. Your content is preserved.');
    }
  };

  const resetForm = () => {
    setSelections({
      characterProfile: '',
      theme: '',
      audience: '',
      mediaType: '',
      templateType: '',
      platform: '',
      voiceStyle: ''
    });
    setContent({
      title: '',
      description: '',
      hashtags: [],
      keywords: '',
      cta: ''
    });
    setMediaFiles([]);
    setSelectedPlatforms([]);
    setContentId(generateContentId());
    setIsEditingPost(false);
    setFieldConfig(null);
  };

  const activePlatforms = platforms?.filter(p => p?.isActive) || [];
  const canSave = selections.characterProfile && selections.theme && selections.audience && selections.mediaType && selections.templateType && selections.voiceStyle && content.description;

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

  // Truncate URL for display
  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div style={{
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`,
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        paddingBottom: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: isDarkMode ? '#60a5fa' : '#3b82f6',
              margin: '0 0 8px 0'
            }}>
              {isEditingPost ? 'Editing Content' : 'Create New Content'}
            </h2>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              fontSize: '14px',
              margin: '0'
            }}>
              {isEditingPost ? `Editing post: ${contentId}` :
               'Design and prepare your social media content for publishing (UK English)'
              }
            </p>
          </div>
          <div style={{
            backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
            color: isDarkMode ? '#60a5fa' : '#1e40af',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'monospace'
          }}>
            ID: {contentId}
          </div>
        </div>
      </div>

      {/* Character Profile Section */}
      <div style={{
        backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <User style={{ height: '20px', width: '20px', color: isDarkMode ? '#60a5fa' : '#3b82f6' }} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            margin: '0'
          }}>
            Character Profile
          </h3>
        </div>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          <select
            value={selections.characterProfile}
            onChange={(e) => handleSelectionChange('characterProfile', e.target.value)}
            disabled={isLoadingProfiles}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#334155',
              color: '#ffffff',
              fontFamily: 'inherit',
              opacity: isLoadingProfiles ? 0.7 : 1
            }}
          >
            <option value="">
              {isLoadingProfiles ? 'Loading character profiles...' : 'Select character profile...'}
            </option>
            {!isLoadingProfiles && characterProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.name} ({profile.username}) - {profile.role}
              </option>
            ))}
          </select>
          
          {/* Character Profile Preview */}
          {selections.characterProfile && (
            <div style={{
              padding: '12px',
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
              borderRadius: '6px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`
            }}>
              {(() => {
                const selectedProfile = characterProfiles.find(p => p.id === selections.characterProfile);
                if (!selectedProfile) return null;
                
                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      color: isDarkMode ? '#60a5fa' : '#3b82f6',
                      fontWeight: 'bold',
                      border: `2px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`,
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {selectedProfile.avatar_id ? (
                        <img
                          src={selectedProfile.avatar_id}
                          alt={selectedProfile.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        selectedProfile.name.charAt(0)
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isDarkMode ? '#f8fafc' : '#111827',
                        marginBottom: '2px'
                      }}>
                        {selectedProfile.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
                        marginBottom: '2px'
                      }}>
                        {selectedProfile.username}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: isDarkMode ? '#60a5fa' : '#3b82f6',
                        fontWeight: '500'
                      }}>
                        {selectedProfile.role}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
              color: isDarkMode ? '#f8fafc' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'inherit',
              alignSelf: 'flex-start'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#60a5fa' : '#3b82f6';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#475569' : '#e5e7eb';
              e.currentTarget.style.color = isDarkMode ? '#f8fafc' : '#374151';
            }}
            onClick={() => {
              alert('Character Profile management available in Settings tab.\n\nTo add new profiles, go to Settings > Character Profiles');
            }}
          >
            <Plus style={{ height: '16px', width: '16px' }} />
            Manage Profiles
          </button>
        </div>
      </div>

      {/* Template Builder Style Selections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        padding: '20px',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' 
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#475569' : '#3b82f6'}`,
        marginBottom: '24px',
        width: '85%'
      }}>
        {/* Selection dropdowns with consistent styling */}
        {[
          { field: 'theme', label: 'Theme/Label *', options: [
            'news_alert', 'promotion', 'standard_post', 'cta_quiz', 'cta_game', 
            'cta_puzzle', 'cta_challenge', 'news', 'blog', 'tutorial_guide', 'course_tool', 'assessment'
          ]},
          { field: 'audience', label: 'Target Audience *', options: [
            'existing_members', 'new_members', 'persona_falcon', 'persona_panther', 
            'persona_wolf', 'persona_lion', 'general_public'
          ]},
          { field: 'mediaType', label: 'Media Type *', options: [
            'image', 'video', 'gifs', 'pdf', 'interactive_media', 'url_link'
          ]},
          { field: 'templateType', label: 'Template Type *', options: [
            'social_media', 'presentation', 'video_message', 'anica_chat', 'blog_posts', 
            'news_article', 'newsletter', 'email_templates', 'custom_templates'
          ]},
          { field: 'voiceStyle', label: 'Voice Style *', options: [
            'casual', 'friendly', 'professional', 'creative'
          ]}
        ].map(({ field, label, options }) => (
          <div key={field}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: isDarkMode ? '#bfdbfe' : '#1e40af',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {label}
            </label>
            <select
              value={selections[field as keyof typeof selections]}
              onChange={(e) => handleSelectionChange(field, e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#334155',
                color: '#ffffff',
                fontFamily: 'inherit',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
                paddingRight: '40px'
              }}
            >
              <option value="">{field === 'platform' ? 'Generic (no optimization)...' : `Select ${label.toLowerCase().replace(' *', '')}...`}</option>
              {options.map(option => (
                <option key={option} value={option}>
                  {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        ))}
        
        {/* Platform Optimization Selector */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: isDarkMode ? '#bfdbfe' : '#1e40af',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Optimize For Platform
          </label>
          <select
            value={selections.platform}
            onChange={(e) => handleSelectionChange('platform', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#334155',
              color: '#ffffff',
              fontFamily: 'inherit',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
              paddingRight: '40px'
            }}
          >
            <option value="">Generic (no optimization)...</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter/X</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="telegram">Telegram</option>
            <option value="pinterest">Pinterest</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* Platform-Specific Field Information */}
      {fieldConfig && (
        <div style={{
          backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
          border: `1px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          width: '85%'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#60a5fa' : '#1e40af',
            margin: '0 0 8px 0'
          }}>
            Platform Optimization: {selections.platform?.toUpperCase()}
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            {fieldConfig.title?.show && (
              <div style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#1e40af' }}>
                Title: {fieldConfig.title.maxLength} chars
              </div>
            )}
            <div style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#1e40af' }}>
              Description: {fieldConfig.description.maxLength} chars
            </div>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#1e40af' }}>
              Hashtags: {fieldConfig.hashtags.maxCount} max ({fieldConfig.hashtags.recommended} recommended)
            </div>
          </div>
        </div>
      )}

      {/* Media Upload */}
      <div style={{ marginBottom: '24px', width: '85%' }}>
        <label style={{
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          marginBottom: '12px'
        }}>
          Media Upload
        </label>
        
        {/* File Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDarkMode ? '#60a5fa' : '#3b82f6'}`,
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDarkMode ? '#1e3a8a20' : '#f8fafc',
            transition: 'all 0.3s ease',
            width: '100%',
            marginBottom: '16px'
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
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            margin: '0 0 6px 0'
          }}>
            Upload your media files
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
            Support for Images, Videos, GIFs, PDFs, and Interactive Media (up to 100MB per file)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.gif,.html"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) {
                const maxSize = 100 * 1024 * 1024; // 100MB limit
                const oversizedFiles: string[] = [];
                
                Array.from(e.target.files).forEach(file => {
                  if (file.size > maxSize) {
                    oversizedFiles.push(`${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`);
                  }
                });
                
                if (oversizedFiles.length > 0) {
                  alert(`The following files are too large (>100MB):\n${oversizedFiles.join('\n')}\n\nPlease compress or choose smaller files.`);
                  return;
                }
                
                handleFileUpload(e.target.files);
              }
            }}
          />
        </div>

        {/* URL Input Section */}
        <div style={{
          backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
          border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ExternalLink style={{ height: '16px', width: '16px' }} />
            Add URL Links
          </h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <input
              type="text"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
              placeholder="Link title"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: isDarkMode ? '#1e293b' : 'white',
                color: isDarkMode ? '#f8fafc' : '#111827',
                fontFamily: 'inherit'
              }}
            />
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: isDarkMode ? '#1e293b' : 'white',
                  color: isDarkMode ? '#f8fafc' : '#111827',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: urlInput.trim() ? (isDarkMode ? '#60a5fa' : '#3b82f6') : (isDarkMode ? '#475569' : '#d1d5db'),
                  color: urlInput.trim() ? 'white' : (isDarkMode ? '#64748b' : '#9ca3af'),
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
          
          <div style={{
            fontSize: '12px',
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            marginTop: '8px'
          }}>
            Add interactive links, external tools, or web resources to your post
          </div>
        </div>

        {/* Uploaded Files and URLs */}
        {mediaFiles.length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isDarkMode ? '#f8fafc' : '#111827',
                margin: '0'
              }}>
                Added Media & Links
              </h4>
              <span style={{
                padding: '4px 8px',
                backgroundColor: isDarkMode ? '#60a5fa' : '#3b82f6',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '12px'
              }}>
                {mediaFiles.length} items
              </span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {mediaFiles.map((file) => (
                <div key={file.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                  borderRadius: '6px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      padding: '8px',
                      backgroundColor: isDarkMode ? '#1e293b' : 'white',
                      borderRadius: '6px',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                      {file.type === 'interactive' && file.size === 0 ? (
                        <ExternalLink style={{ height: '16px', width: '16px', color: '#8b5cf6' }} />
                      ) : (
                        getFileIcon(file.type)
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: isDarkMode ? '#f8fafc' : '#111827',
                        marginBottom: '2px'
                      }}>
                        {file.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: isDarkMode ? '#94a3b8' : '#6b7280'
                      }}>
                        {file.size === 0 ? (
                          <span 
                            style={{ 
                              color: isDarkMode ? '#8b5cf6' : '#7c3aed',
                              wordBreak: 'break-all',
                              display: 'block'
                            }}
                            title={file.url}
                          >
                            {truncateUrl(file.url)}
                          </span>
                        ) : (
                          formatFileSize(file.size)
                        )}
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
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      marginLeft: '8px',
                      flexShrink: 0
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

      {/* Content Fields - Title, Description, Hashtags, Keywords, CTA */}
      <div style={{ 
        display: 'grid', 
        gap: '16px', 
        marginBottom: '24px',
        width: '85%'
      }}>
        {/* Title Field */}
        {(!fieldConfig || fieldConfig.title?.show !== false) && (
          <div>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: isDarkMode ? '#f8fafc' : '#111827',
              marginBottom: '8px'
            }}>
              Title/Headline
            </label>
            
            {/* Title Formatting Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
              borderRadius: '6px 6px 0 0',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderBottom: 'none'
            }}>
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="Enter compelling title"]') as HTMLInputElement;
                  if (input) {
                    const start = input.selectionStart || 0;
                    const end = input.selectionEnd || 0;
                    const selectedText = input.value.substring(start, end);
                    const newText = input.value.substring(0, start) + `**${selectedText}**` + input.value.substring(end);
                    setContent(prev => ({ ...prev, title: newText }));
                    // Set cursor position after the formatting
                    setTimeout(() => {
                      input.setSelectionRange(start + 2 + selectedText.length + 2, start + 2 + selectedText.length + 2);
                    }, 0);
                  }
                }}
                style={{
                  padding: '6px 10px',
                  backgroundColor: isDarkMode ? '#334155' : 'white',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#f8fafc' : '#111827'
                }}
                title="Bold (wrap selected text with **)"
              >
                B
              </button>
              
              <div style={{
                fontSize: '12px',
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                marginLeft: 'auto'
              }}>
                UK English | Formatting: **bold**
              </div>
            </div>
            
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter compelling title... (UK English)"
              maxLength={fieldConfig?.title?.maxLength || 150}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '0 0 8px 8px',
                fontSize: '14px',
                backgroundColor: isDarkMode ? '#334155' : 'white',
                color: '#000000',
                fontFamily: 'inherit',
                borderTop: 'none'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '4px',
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#6b7280'
            }}>
              <span>Create an attention-grabbing headline (UK English)</span>
              <span>{content.title.length}/{fieldConfig?.title?.maxLength || 150}</span>
            </div>
          </div>
        )}

        {/* Description Field */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            Post Description *
          </label>
          
          {/* Formatting Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
            borderRadius: '6px 6px 0 0',
            border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
            borderBottom: 'none'
          }}>
            <button
              type="button"
              onClick={() => {
                const textarea = document.querySelector('textarea[placeholder*="Write your post content"]') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = textarea.value.substring(start, end);
                  const newText = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end);
                  setContent(prev => ({ ...prev, description: newText }));
                }
              }}
              style={{
                padding: '6px 10px',
                backgroundColor: isDarkMode ? '#334155' : 'white',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                color: isDarkMode ? '#f8fafc' : '#111827'
              }}
              title="Bold (wrap selected text with **)"
            >
              B
            </button>
            
            <button
              type="button"
              onClick={() => {
                const textarea = document.querySelector('textarea[placeholder*="Write your post content"]') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = textarea.value.substring(start, end);
                  const newText = textarea.value.substring(0, start) + `*${selectedText}*` + textarea.value.substring(end);
                  setContent(prev => ({ ...prev, description: newText }));
                }
              }}
              style={{
                padding: '6px 10px',
                backgroundColor: isDarkMode ? '#334155' : 'white',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontStyle: 'italic',
                color: isDarkMode ? '#f8fafc' : '#111827'
              }}
              title="Italic (wrap selected text with *)"
            >
              I
            </button>
            
            <button
              type="button"
              onClick={() => {
                const textarea = document.querySelector('textarea[placeholder*="Write your post content"]') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = textarea.value.substring(start, end);
                  const newText = textarea.value.substring(0, start) + `__${selectedText}__` + textarea.value.substring(end);
                  setContent(prev => ({ ...prev, description: newText }));
                }
              }}
              style={{
                padding: '6px 10px',
                backgroundColor: isDarkMode ? '#334155' : 'white',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline',
                color: isDarkMode ? '#f8fafc' : '#111827'
              }}
              title="Underline (wrap selected text with __)"
            >
              U
            </button>
            
            <button
              type="button"
              onClick={() => {
                const url = prompt('Enter URL:');
                const linkText = prompt('Enter link text (or leave empty to use URL):');
                if (url) {
                  const displayText = linkText || url;
                  const linkMarkdown = `[${displayText}](${url})`;
                  setContent(prev => ({ ...prev, description: prev.description + linkMarkdown }));
                }
              }}
              style={{
                padding: '6px 10px',
                backgroundColor: isDarkMode ? '#334155' : 'white',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                color: isDarkMode ? '#f8fafc' : '#111827'
              }}
              title="Add Link"
            >
              🔗
            </button>
            
            <div style={{
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              marginLeft: 'auto'
            }}>
              UK English | Formatting: **bold** *italic* __underline__ [link](url)
            </div>
          </div>

            <button
              type="button"
              onClick={() => {
                const url = prompt('Enter URL:');
                const linkText = prompt('Enter link text (or leave empty to use URL):');
                if (url) {
                  const displayText = linkText || url;
                  const linkMarkdown = `[${displayText}](${url})`;
                  setContent(prev => ({ ...prev, description: prev.description + linkMarkdown }));
                }
              }}
              style={{
                padding: '6px 10px',
                backgroundColor: isDarkMode ? '#334155' : 'white',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                color: isDarkMode ? '#f8fafc' : '#111827'
              }}
              title="Add Link"
            >
              🔗
            </button>
            
            <button
              type="button"
              onClick={() => {
                const commonEmojis = ['😀', '😊', '😎', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '📢', '✨', '💪', '🚀', '⭐', '👏', '🙌', '💡', '📈', '📊'];
                const emoji = prompt(`Choose an emoji:\n${commonEmojis.join(' ')}\n\nOr enter any emoji:`);
                if (emoji) {
                  setContent(prev => ({ ...prev, description: prev.description + emoji }));
                }
              }}
              style={{
                padding: '6px 10px',
                backgroundColor: isDarkMode ? '#334155' : 'white',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                color: isDarkMode ? '#f8fafc' : '#111827'
              }}
              title="Add Emoji"
            >
              😊
            </button>
            
            <div style={{
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              marginLeft: 'auto'
            }}>
              UK English | Formatting: **bold** *italic* __underline__ [link](url)
            </div>
          </div>
          
          <textarea
            value={content.description}
            onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Write your post content here... (UK English)"
            maxLength={fieldConfig?.description?.maxLength || 2200}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '0 0 8px 8px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: '#000000',
              resize: 'vertical',
              minHeight: '120px',
              fontFamily: 'inherit',
              lineHeight: '1.4',
              borderTop: 'none'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
            fontSize: '12px',
            color: content.description.length > (fieldConfig?.description?.maxLength || 2200) * 0.9 
              ? '#ef4444' 
              : (isDarkMode ? '#94a3b8' : '#6b7280')
          }}>
            <span>Provide engaging content that matches your theme and brand voice (UK English)</span>
            <span>{content.description.length}/{fieldConfig?.description?.maxLength || 2200}</span>
          </div>
        </div>

        {/* Hashtags Field */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            Hashtags
          </label>
          <div style={{
            backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
            border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
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
                placeholder="Add hashtags (press Enter)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: isDarkMode ? '#1e293b' : 'white',
                  color: isDarkMode ? '#f8fafc' : '#111827',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleAddHashtag}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isDarkMode ? '#60a5fa' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                Add
              </button>
            </div>
            
            {/* Hashtag Display */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              minHeight: '40px',
              padding: '8px',
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
              borderRadius: '6px',
              border: `1px dashed ${isDarkMode ? '#475569' : '#d1d5db'}`
            }}>
              {content.hashtags.map((tag) => (
                <div key={tag} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
                  color: isDarkMode ? '#60a5fa' : '#1e40af',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  #{tag}
                  <button
                    onClick={() => handleRemoveHashtag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '8px',
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#6b7280'
            }}>
              <span>Use relevant hashtags to increase discoverability</span>
              <span style={{
                color: content.hashtags.length > (fieldConfig?.hashtags?.maxCount || 30) * 0.9 
                  ? '#ef4444' 
                  : (isDarkMode ? '#94a3b8' : '#6b7280')
              }}>
                {content.hashtags.length}/{fieldConfig?.hashtags?.maxCount || 30}
              </span>
            </div>
          </div>
        </div>

        {/* Keywords Field */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            SEO Keywords
          </label>
          <input
            type="text"
            value={content.keywords}
            onChange={(e) => setContent(prev => ({ ...prev, keywords: e.target.value }))}
            placeholder="Enter relevant keywords..."
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontFamily: 'inherit'
            }}
          />
          <div style={{
            fontSize: '12px',
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            marginTop: '4px'
          }}>
            Add SEO keywords for better reach (optional)
          </div>
        </div>

        {/* Call to Action Field */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            Call to Action
          </label>
          <input
            type="text"
            value={content.cta}
            onChange={(e) => setContent(prev => ({ ...prev, cta: e.target.value }))}
            placeholder="What action should users take?"
            maxLength={100}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontFamily: 'inherit'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
            fontSize: '12px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            <span>Clear action you want your audience to take</span>
            <span>{content.cta.length}/100</span>
          </div>
        </div>
      </div>

      {/* Platform Selection for Publishing */}
      <div style={{ marginBottom: '24px', width: '85%' }}>
        <label style={{
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          marginBottom: '12px'
        }}>
          Platform Selection
        </label>
      </div>
          Select Publishing Platforms
          {isLoadingProfiles && (
            <span style={{ 
              fontSize: '12px', 
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              marginLeft: '8px',
              fontStyle: 'italic'
            }}>
              (Loading platforms...)
            </span>
          )}
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                border: selectedPlatforms.includes(platform.id) 
                  ? `1px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}` 
                  : `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedPlatforms.includes(platform.id) 
                  ? (isDarkMode ? '#1e3a8a30' : '#dbeafe') 
                  : (isDarkMode ? '#334155' : 'white'),
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(platform.id)}
                onChange={() => handlePlatformToggle(platform.id)}
                style={{
                  height: '16px',
                  width: '16px',
                  accentColor: isDarkMode ? '#60a5fa' : '#3b82f6'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDarkMode ? '#f8fafc' : '#111827',
                  marginBottom: '2px'
                }}>
                  {platform.displayName || platform.display_name || platform.name}
                </div>
                {platform.isDefault && (
                  <span style={{
                    display: 'inline-block',
                    padding: '1px 6px',
                    fontSize: '10px',
                    fontWeight: '600',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '8px'
                  }}>
                    Default
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
        
        {activePlatforms.length === 0 && !isLoadingProfiles && (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
            border: `2px dashed ${isDarkMode ? '#60a5fa' : '#3b82f6'}`,
            borderRadius: '8px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              No active platforms found
            </p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              Go to Settings &gt; Social Platforms to add your publishing destinations
            </p>
          </div>
        )}
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
          onClick={resetForm}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontFamily: 'inherit'
          }}
        >
          Reset Form
        </button>
        
        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '8px',
            border: 'none',
            cursor: (canSave && !isSaving) ? 'pointer' : 'not-allowed',
            backgroundColor: (canSave && !isSaving) ? (isDarkMode ? '#64748b' : '#6b7280') : (isDarkMode ? '#475569' : '#d1d5db'),
            color: (canSave && !isSaving) ? 'white' : (isDarkMode ? '#64748b' : '#9ca3af'),
            fontFamily: 'inherit',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? 'Saving...' : (isEditingPost ? 'Update Draft' : 'Save as Draft')}
        </button>
        
        <button
          onClick={handleAddToSchedule}
          disabled={!canSave || isSaving}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '8px',
            border: 'none',
            cursor: (canSave && !isSaving) ? 'pointer' : 'not-allowed',
            backgroundColor: (canSave && !isSaving) ? (isDarkMode ? '#60a5fa' : '#3b82f6') : (isDarkMode ? '#475569' : '#d1d5db'),
            color: (canSave && !isSaving) ? 'white' : (isDarkMode ? '#64748b' : '#9ca3af'),
            fontFamily: 'inherit',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? 'Saving...' : 'Schedule Post'}
        </button>
      </div>
    </div>
  );
};

const SavedPostsList = ({ posts, onEditPost, onSchedulePost, onDeletePost, isLoading }: {
  posts: ContentPost[];
  onEditPost: (postId: string) => void;
  onSchedulePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  isLoading?: boolean;
}) => {
  const { isDarkMode } = useTheme();
  
  if (isLoading) {
    return (
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        borderRadius: '8px',
        padding: '48px',
        textAlign: 'center',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          fontSize: '18px',
          color: isDarkMode ? '#60a5fa' : '#3b82f6',
          marginBottom: '12px'
        }}>
          Loading your saved content...
        </div>
        <div style={{
          fontSize: '14px',
          color: isDarkMode ? '#94a3b8' : '#6b7280'
        }}>
          Fetching posts from Supabase database
        </div>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    const badgeStyles = {
      pending: { backgroundColor: isDarkMode ? '#92400e' : '#fef3c7', color: isDarkMode ? '#fef3c7' : '#92400e', text: 'Pending' },
      scheduled: { backgroundColor: isDarkMode ? '#1e40af' : '#dbeafe', color: isDarkMode ? '#dbeafe' : '#1e40af', text: 'Scheduled' },
      published: { backgroundColor: isDarkMode ? '#065f46' : '#d1fae5', color: isDarkMode ? '#d1fae5' : '#065f46', text: 'Published' }
    };
    
    const style = badgeStyles[status as keyof typeof badgeStyles];
    
    return (
      <span style={{
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '600',
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
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        borderRadius: '8px',
        padding: '48px',
        textAlign: 'center',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
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
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          margin: '0 0 8px 0'
        }}>
          No content created yet
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
      boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
      borderRadius: '8px',
      overflow: 'hidden',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        padding: '16px',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' 
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
            fontWeight: '600',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0'
          }}>
            Pending Content
          </h3>
          <span style={{
            padding: '6px 12px',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' 
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
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
          }}>
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
                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    ID: {post.contentId}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    fontWeight: '600'
                  }}>
                    Created {post.createdDate.toLocaleDateString()}
                  </span>
                  {post.isFromTemplate && (
                    <span style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#34d399' : '#059669',
                      fontWeight: '600',
                      backgroundColor: isDarkMode ? '#065f4630' : '#d1fae5',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      From Template
                    </span>
                  )}
                </div>
                
                {post.title && (
                  <h4 style={{
                    color: isDarkMode ? '#f8fafc' : '#111827',
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 8px 0'
                  }}>
                    {post.title}
                  </h4>
                )}
                
                <p style={{
                  color: isDarkMode ? '#94a3b8' : '#374151',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: '0 0 12px 0'
                }}>
                  {post.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  {post.mediaFiles.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                      padding: '6px 8px',
                      borderRadius: '6px'
                    }}>
                      <Image style={{ height: '14px', width: '14px' }} />
                      <span style={{ fontWeight: '600' }}>
                        {post.mediaFiles.length} file{post.mediaFiles.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  {post.hashtags.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                      padding: '6px 8px',
                      borderRadius: '6px'
                    }}>
                      <span style={{ fontWeight: '600' }}>
                        #{post.hashtags.length} hashtags
                      </span>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                    padding: '6px 8px',
                    borderRadius: '6px'
                  }}>
                    <Settings style={{ height: '14px', width: '14px' }} />
                    <span style={{ fontWeight: '600' }}>
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
                  title="Edit Content"
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Edit3 style={{ height: '16px', width: '16px' }} />
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
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Calendar style={{ height: '16px', width: '16px' }} />
                  </button>
                )}
                
                <button
                  onClick={() => onDeletePost(post.id)}
                  title="Delete Content"
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    transition: 'all 0.2s ease'
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

export { EnhancedContentCreationForm, SavedPostsList };
