import React, { useState, useRef, createContext, useContext, useEffect } from 'react';
import { Upload, X, Image, Video, FileText, Download, Eye, Trash2, Plus, Settings, ExternalLink, Database, CheckCircle, Circle, Check, Edit3, Copy, Calendar, User, Palette } from 'lucide-react';

// Theme Context (assuming this comes from your App.tsx)
const ThemeContext = createContext({
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
  notionPageId?: string;
}

// Notion Integration Functions
const saveToNotionDatabase = async (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
  try {
    const response = await fetch('/api/notion-save-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving to Notion:', error);
    throw error;
  }
};

const loadFromNotionDatabase = async () => {
  try {
    const response = await fetch('/api/notion-load-content');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.posts || [];
  } catch (error) {
    console.error('Error loading from Notion:', error);
    return [];
  }
};

const updateNotionContent = async (postId: string, updates: Partial<ContentPost>) => {
  try {
    const response = await fetch('/api/notion-update-content', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, updates })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating Notion content:', error);
    throw error;
  }
};

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
  avatar?: string;
}

interface NotionTemplate {
  id: string;
  templateId: string;
  theme: string;
  audience: string;
  mediaType: string;
  templateType: string;
  platform?: string;
  content: {
    title: string;
    description: string;
    hashtags: string[];
    keywords: string;
    cta: string;
  };
  createdDate: string;
  status: string;
}

// Enhanced Content Creation Form
const EnhancedContentCreationForm = ({ 
  onSave, 
  onAddToSchedule, 
  characterProfiles, 
  platforms,
  loadedTemplate,
  onTemplateLoaded,
  isSaving
}: {
  onSave: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  onAddToSchedule: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  characterProfiles: CharacterProfile[];
  platforms: SocialPlatform[];
  loadedTemplate?: NotionTemplate | null;
  onTemplateLoaded?: () => void;
  isSaving?: boolean;
}) => {
  const { isDarkMode } = useTheme();
  
  // Form state matching template builder structure
  const [selections, setSelections] = useState({
    characterProfile: '',
    theme: '',
    audience: '',
    mediaType: '',
    templateType: '',
    platform: ''
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
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [fieldConfig, setFieldConfig] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate content ID (Pattern-###CC format)
  const generateContentId = () => {
    const theme = selections.theme ? getThemeCode(selections.theme) : 'XX';
    const audience = selections.audience ? getAudienceCode(selections.audience) : 'XX';
    const media = selections.mediaType ? getMediaCode(selections.mediaType) : 'XX';
    const template = selections.templateType ? getTemplateTypeCode(selections.templateType) : 'XX';
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `${theme}-${audience}-${media}-${template}-${String(randomNum).padStart(3, '0')}CC`;
  };

  // Code mapping functions for content ID generation
  const getThemeCode = (value: string) => {
    const codes: Record<string, string> = {
      'news_alert': 'NA', 'promotion': 'PR', 'standard_post': 'SP',
      'cta_quiz': 'QZ', 'cta_game': 'GA', 'cta_puzzle': 'PZ',
      'cta_challenge': 'CH', 'news': 'NS', 'blog': 'BP',
      'tutorial_guide': 'TG', 'course_tool': 'CT', 'assessment': 'AS'
    };
    return codes[value] || 'XX';
  };

  const getAudienceCode = (value: string) => {
    const codes: Record<string, string> = {
      'existing_members': 'EM', 'new_members': 'NM', 'persona_falcon': 'FL',
      'persona_panther': 'PA', 'persona_wolf': 'WF', 'persona_lion': 'LI',
      'general_public': 'GP'
    };
    return codes[value] || 'XX';
  };

  const getMediaCode = (value: string) => {
    const codes: Record<string, string> = {
      'image': 'IM', 'video': 'VD', 'gifs': 'GF', 'pdf': 'PF',
      'interactive_media': 'IM', 'url_link': 'UL'
    };
    return codes[value] || 'XX';
  };

  const getTemplateTypeCode = (value: string) => {
    const codes: Record<string, string> = {
      'social_media': 'SM', 'presentation': 'PR', 'video_message': 'VM',
      'anica_chat': 'AC', 'blog_posts': 'BP', 'news_article': 'NA',
      'newsletter': 'NL', 'email_templates': 'ET', 'custom_templates': 'CT'
    };
    return codes[value] || 'XX';
  };

  // Initialize and update content ID based on selections
  useEffect(() => {
    const newId = generateContentId();
    setContentId(newId);
  }, [selections.theme, selections.audience, selections.mediaType, selections.templateType]);

  // Load template data when provided
  useEffect(() => {
    if (loadedTemplate) {
      setSelections({
        characterProfile: selections.characterProfile, // Keep selected character
        theme: loadedTemplate.theme,
        audience: loadedTemplate.audience,
        mediaType: loadedTemplate.mediaType,
        templateType: loadedTemplate.templateType,
        platform: loadedTemplate.platform || ''
      });
      
      setContent({
        title: loadedTemplate.content.title,
        description: loadedTemplate.content.description,
        hashtags: [...loadedTemplate.content.hashtags],
        keywords: loadedTemplate.content.keywords,
        cta: loadedTemplate.content.cta
      });
      
      setIsEditingTemplate(true);
      setupPlatformFields(loadedTemplate.platform);
      
      if (onTemplateLoaded) {
        onTemplateLoaded();
      }
    }
  }, [loadedTemplate]);

  // Check URL parameters for forwarded templates
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const forwardId = urlParams.get('forward_id');
    const templateId = urlParams.get('template_id');
    const assigned = urlParams.get('assigned');
    
    if (forwardId && templateId) {
      console.log('Forwarded template detected:', { forwardId, templateId, assigned });
      // TODO: Fetch template data from Notion using the templateId
      fetchForwardedTemplate(templateId, assigned);
    }
  }, []);

  const fetchForwardedTemplate = async (templateId: string, assigned: string | null) => {
    try {
      // This would connect to your Notion integration
      console.log('Fetching template:', templateId, 'assigned to:', assigned);
      // For now, show a notification
      alert(`Received forwarded template: ${templateId}\nAssigned to: ${assigned}\n\nTemplate loading functionality ready for Notion integration.`);
    } catch (error) {
      console.error('Error fetching forwarded template:', error);
    }
  };

  // Platform configuration
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

  const handleSave = () => {
    const postData = {
      contentId,
      ...selections,
      ...content,
      mediaFiles,
      selectedPlatforms,
      status: 'pending' as const,
      isFromTemplate: isEditingTemplate,
      sourceTemplateId: loadedTemplate?.templateId
    };
    onSave(postData);
    resetForm();
  };

  const handleAddToSchedule = () => {
    const postData = {
      contentId,
      ...selections,
      ...content,
      mediaFiles,
      selectedPlatforms,
      status: 'pending' as const,
      isFromTemplate: isEditingTemplate,
      sourceTemplateId: loadedTemplate?.templateId
    };
    onAddToSchedule(postData);
    resetForm();
  };

  const resetForm = () => {
    setSelections({
      characterProfile: '',
      theme: '',
      audience: '',
      mediaType: '',
      templateType: '',
      platform: ''
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
    setIsEditingTemplate(false);
    setFieldConfig(null);
  };

  const activePlatforms = platforms.filter(p => p.isActive);
  const canSave = selections.characterProfile && selections.theme && selections.audience && selections.mediaType && selections.templateType && content.description;

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
              {isEditingTemplate ? '📝 Editing Template Content' : '🎨 Create New Content'}
            </h2>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              fontSize: '14px',
              margin: '0'
            }}>
              {isEditingTemplate 
                ? `Working from template: ${loadedTemplate?.templateId}`
                : 'Design and prepare your social media content for publishing'
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', alignItems: 'center' }}>
          <select
            value={selections.characterProfile}
            onChange={(e) => handleSelectionChange('characterProfile', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontFamily: 'inherit'
            }}
          >
            <option value="">Select character profile...</option>
            {characterProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
          
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
              backgroundColor: isDarkMode ? '#475569' : '#e5e7eb',
              color: isDarkMode ? '#f8fafc' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'inherit'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#60a5fa' : '#3b82f6';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#475569' : '#e5e7eb';
              e.currentTarget.style.color = isDarkMode ? '#f8fafc' : '#374151';
            }}
          >
            <Plus style={{ height: '16px', width: '16px' }} />
            Add New Profile
          </button>
        </div>
        
        {selections.characterProfile && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '6px',
            border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`
          }}>
            <p style={{
              fontSize: '13px',
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              margin: '0'
            }}>
              Profile: {characterProfiles.find(p => p.id === selections.characterProfile)?.description || 'Selected character profile'}
            </p>
          </div>
        )}
      </div>

      {/* Template Builder Style Selections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        padding: '20px',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' 
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#475569' : '#3b82f6'}`,
        marginBottom: '24px'
      }}>
        {/* Character Profile */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: isDarkMode ? '#94a3b8' : '#1e40af',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Character Profile
          </label>
          <select
            value={selections.characterProfile}
            onChange={(e) => handleSelectionChange('characterProfile', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontFamily: 'inherit'
            }}
          >
            <option value="">Select character profile...</option>
            {characterProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        </div>

        {/* Theme Selection */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: isDarkMode ? '#94a3b8' : '#1e40af',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Theme/Label *
          </label>
          <select
            value={selections.theme}
            onChange={(e) => handleSelectionChange('theme', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontFamily: 'inherit',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%23f8fafc' : '%23111827'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
              paddingRight: '40px'
            }}
          >
            <option value="">Select theme...</option>
            <option value="news_alert">News Alert</option>
            <option value="promotion">Promotion</option>
            <option value="standard_post">Standard Post</option>
            <option value="cta_quiz">CTA - Quiz</option>
            <option value="cta_game">CTA - Game</option>
            <option value="cta_puzzle">CTA - Puzzle</option>
            <option value="cta_challenge">CTA - Challenge</option>
            <option value="news">News</option>
            <option value="blog">Blog</option>
            <option value="tutorial_guide">Tutorial Guide</option>
            <option value="course_tool">Course Tool</option>
            <option value="assessment">Assessment</option>
          </select>
        </div>

        {/* Audience Selection */}
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
            Target Audience *
          </label>
          <select
            value={selections.audience}
            onChange={(e) => handleSelectionChange('audience', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontFamily: 'inherit',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%23f8fafc' : '%23111827'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
              paddingRight: '40px'
            }}
          >
            <option value="">Select audience...</option>
            <option value="existing_members">Existing Members</option>
            <option value="new_members">New Members</option>
            <option value="persona_falcon">Persona FALCON</option>
            <option value="persona_panther">Persona PANTHER</option>
            <option value="persona_wolf">Persona WOLF</option>
            <option value="persona_lion">Persona LION</option>
            <option value="general_public">General Public</option>
          </select>
        </div>

        {/* Media Type Selection */}
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
            Media Type *
          </label>
          <select
            value={selections.mediaType}
            onChange={(e) => handleSelectionChange('mediaType', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontFamily: 'inherit',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%23f8fafc' : '%23111827'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
              paddingRight: '40px'
            }}
          >
            <option value="">Select media type...</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="gifs">GIFs</option>
            <option value="pdf">PDF</option>
            <option value="interactive_media">Interactive Media</option>
            <option value="url_link">URL Link</option>
          </select>
        </div>

        {/* Template Type Selection */}
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
            Template Type *
          </label>
          <select
            value={selections.templateType}
            onChange={(e) => handleSelectionChange('templateType', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontFamily: 'inherit',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%23f8fafc' : '%23111827'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
              paddingRight: '40px'
            }}
          >
            <option value="">Select template type...</option>
            <option value="social_media">Social Media</option>
            <option value="presentation">Presentation</option>
            <option value="video_message">Video Message</option>
            <option value="anica_chat">Anica Chat</option>
            <option value="blog_posts">Blog Posts</option>
            <option value="news_article">News Article</option>
            <option value="newsletter">Newsletter</option>
            <option value="email_templates">Email Templates</option>
            <option value="custom_templates">Custom Templates</option>
          </select>
        </div>

        {/* Platform Selection (Optional - for content optimization) */}
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
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontFamily: 'inherit',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%23f8fafc' : '%23111827'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
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
          marginBottom: '24px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#60a5fa' : '#1e40af',
            margin: '0 0 8px 0'
          }}>
            📊 Platform Optimization: {selections.platform?.toUpperCase()}
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
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          marginBottom: '12px'
        }}>
          📁 Media Upload
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDarkMode ? '#60a5fa' : '#3b82f6'}`,
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDarkMode ? '#1e3a8a20' : '#f8fafc',
            transition: 'all 0.3s ease'
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
            🔎 Upload your media files
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
                fontWeight: '600',
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
                fontWeight: '600',
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
                  backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
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
                  >
                    <X style={{ height: '16px', width: '16px' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Fields */}
      <div style={{ 
        display: 'grid', 
        gap: '16px', 
        marginBottom: '24px', 
        maxWidth: '800px',
        margin: '0 auto 24px auto'
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
              📝 Title/Headline
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              placeholder={fieldConfig?.title?.placeholder || "Enter compelling title..."}
              maxLength={fieldConfig?.title?.maxLength || 150}
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
              <span>Create an attention-grabbing headline</span>
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
            ✏️ Post Description *
          </label>
          <textarea
            value={content.description}
            onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
            placeholder={fieldConfig?.description?.placeholder || "Write your post content here..."}
            maxLength={fieldConfig?.description?.maxLength || 2200}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              resize: 'vertical',
              minHeight: '120px',
              fontFamily: 'inherit'
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
            <span>Provide engaging content that matches your theme and brand voice</span>
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
            #️⃣ Hashtags
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
            🔍 SEO Keywords
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
            🎯 Call to Action
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
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          marginBottom: '12px'
        }}>
          🌐 Select Publishing Platforms
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
                  : (isDarkMode ? '#334155' : '#f9fafb'),
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
                  {platform.name}
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
          🔄 Reset Form
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
          {isSaving ? '⏳ Saving...' : '💾 Save as Draft'}
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
          {isSaving ? '⏳ Saving...' : '🚀 Schedule Post'}
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
          ⏳ Loading your saved content...
        </div>
        <div style={{
          fontSize: '14px',
          color: isDarkMode ? '#94a3b8' : '#6b7280'
        }}>
          Fetching posts from Notion database
        </div>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    const badgeStyles = {
      pending: { backgroundColor: isDarkMode ? '#92400e' : '#fef3c7', color: isDarkMode ? '#fef3c7' : '#92400e', text: '⏳ Pending' },
      scheduled: { backgroundColor: isDarkMode ? '#1e40af' : '#dbeafe', color: isDarkMode ? '#dbeafe' : '#1e40af', text: '📅 Scheduled' },
      published: { backgroundColor: isDarkMode ? '#065f46' : '#d1fae5', color: isDarkMode ? '#d1fae5' : '#065f46', text: '✅ Published' }
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
            📚 Pending Content
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
                    📅 Created {post.createdDate.toLocaleDateString()}
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
                      📄 From Template: {post.sourceTemplateId}
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

const NotionDatabaseSection = ({ onLoadTemplate }: {
  onLoadTemplate: (template: NotionTemplate) => void;
}) => {
  const { isDarkMode } = useTheme();
  const [templates, setTemplates] = useState<NotionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock templates for demonstration
  const mockTemplates: NotionTemplate[] = [
    {
      id: '1',
      templateId: 'NA-EM-IM-SM-001',
      theme: 'news_alert',
      audience: 'existing_members',
      mediaType: 'image',
      templateType: 'social_media',
      platform: 'instagram',
      content: {
        title: 'Breaking News Alert',
        description: 'Important update for our community members...',
        hashtags: ['news', 'alert', 'community'],
        keywords: 'breaking news, alert, update',
        cta: 'Read more in comments'
      },
      createdDate: '2025-01-15',
      status: 'Template'
    },
    {
      id: '2',
      templateId: 'PR-NM-VD-SM-001',
      theme: 'promotion',
      audience: 'new_members',
      mediaType: 'video',
      templateType: 'social_media',
      platform: 'youtube',
      content: {
        title: 'Special Promotion for New Members',
        description: 'Welcome to our community! Here is a special offer...',
        hashtags: ['promotion', 'welcome', 'newmembers'],
        keywords: 'promotion, special offer, new members',
        cta: 'Claim your offer now!'
      },
      createdDate: '2025-01-14',
      status: 'Template'
    },
    {
      id: '3',
      templateId: 'TG-FL-IM-BP-001',
      theme: 'tutorial_guide',
      audience: 'persona_falcon',
      mediaType: 'image',
      templateType: 'blog_posts',
      content: {
        title: 'Step-by-Step Tutorial Guide',
        description: 'Learn how to master this skill with our comprehensive guide...',
        hashtags: ['tutorial', 'guide', 'learning'],
        keywords: 'tutorial, guide, step by step, learning',
        cta: 'Start learning today'
      },
      createdDate: '2025-01-13',
      status: 'Template'
    }
  ];

  useEffect(() => {
    // Initialize with mock data
    setTemplates(mockTemplates);
  }, []);

  const handleLoadTemplate = (template: NotionTemplate) => {
    onLoadTemplate(template);
  };

  const formatTheme = (theme: string) => {
    return theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getThemeIcon = (theme: string) => {
    const icons: Record<string, string> = {
      news_alert: '📢',
      promotion: '🎉',
      standard_post: '📝',
      cta_quiz: '❓',
      tutorial_guide: '📚',
      blog: '📰',
      assessment: '📊'
    };
    return icons[theme] || '📄';
  };

  return (
    <div style={{
      display: 'grid',
      gap: '24px'
    }}>
      {/* Notion Connection Status */}
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        padding: '24px',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
              fontWeight: '600',
              color: isDarkMode ? '#f8fafc' : '#111827',
              margin: '0 0 4px 0'
            }}>
              📊 Notion Database Connection
            </h3>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              margin: '0',
              fontSize: '14px'
            }}>
              Access and manage your content templates from Notion
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isDarkMode ? '#065f4630' : '#d1fae5',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #10b981'
          }}>
            <CheckCircle style={{ height: '18px', width: '18px', color: '#10b981' }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isDarkMode ? '#34d399' : '#065f46'
            }}>
              ✅ Connected
            </span>
          </div>
        </div>
        
        <div style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
            : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: '8px',
          padding: '16px',
          border: `1px solid ${isDarkMode ? '#1e40af' : '#3b82f6'}`,
          marginBottom: '16px'
        }}>
          <p style={{
            color: isDarkMode ? '#bfdbfe' : '#1e40af',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            🔗 Your templates are stored in Notion and can be loaded directly into the Content Manager for editing and publishing.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              setIsLoading(true);
              // Simulate loading
              setTimeout(() => {
                setTemplates(mockTemplates);
                setIsLoading(false);
              }, 1000);
            }}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: isDarkMode ? '#60a5fa' : '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'inherit',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <Database style={{ height: '16px', width: '16px' }} />
            <span>{isLoading ? '🔄 Refreshing...' : '🔄 Refresh Templates'}</span>
          </button>
          
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: isDarkMode 
                ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' 
                : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'inherit'
            }}
            onClick={() => window.open('https://notion.so', '_blank')}
          >
            <ExternalLink style={{ height: '16px', width: '16px' }} />
            <span>🚀 Open Notion Workspace</span>
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
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
              📄 Available Templates
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
              {templates.length} templates
            </span>
          </div>
        </div>
        
        <div>
          {templates.map((template) => (
            <div key={template.id} style={{
              padding: '20px',
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#f3f4f6'}`,
              transition: 'background-color 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '24px' }}>
                      {getThemeIcon(template.theme)}
                    </span>
                    <div>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: isDarkMode ? '#f8fafc' : '#111827',
                        margin: '0 0 4px 0'
                      }}>
                        {template.content.title}
                      </h4>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: 'monospace',
                        color: isDarkMode ? '#60a5fa' : '#3b82f6',
                        backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {template.templateId}
                      </div>
                    </div>
                  </div>
                  
                  <p style={{
                    color: isDarkMode ? '#94a3b8' : '#374151',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: '0 0 16px 0'
                  }}>
                    {template.content.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                      padding: '6px 10px',
                      borderRadius: '6px'
                    }}>
                      <Palette style={{ height: '14px', width: '14px' }} />
                      <span style={{ fontWeight: '600' }}>
                        {formatTheme(template.theme)}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                      padding: '6px 10px',
                      borderRadius: '6px'
                    }}>
                      <User style={{ height: '14px', width: '14px' }} />
                      <span style={{ fontWeight: '600' }}>
                        {formatTheme(template.audience)}
                      </span>
                    </div>
                    
                    {template.platform && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
                        backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                        padding: '6px 10px',
                        borderRadius: '6px'
                      }}>
                        <Settings style={{ height: '14px', width: '14px' }} />
                        <span style={{ fontWeight: '600' }}>
                          {formatTheme(template.platform)}
                        </span>
                      </div>
                    )}
                    
                    <div style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#64748b' : '#9ca3af',
                      fontWeight: '600'
                    }}>
                      📅 Created {new Date(template.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleLoadTemplate(template)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: isDarkMode ? '#60a5fa' : '#3b82f6',
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#3b82f6' : '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#60a5fa' : '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Edit3 style={{ height: '16px', width: '16px' }} />
                    <span>Use Template</span>
                  </button>
                  
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      borderRadius: '6px',
                      border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f9fafb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Copy style={{ height: '14px', width: '14px' }} />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SupabaseConnection = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
      padding: '24px',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            margin: '0 0 4px 0'
          }}>
            💾 Supabase Database
          </h3>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            margin: '0',
            fontSize: '14px'
          }}>
            Manage your content data storage and connectivity
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: isDarkMode ? '#065f4630' : '#d1fae5',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #10b981'
        }}>
          <CheckCircle style={{ height: '18px', width: '18px', color: '#10b981' }} />
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: isDarkMode ? '#34d399' : '#065f46'
          }}>
            ✅ Connected
          </span>
        </div>
      </div>
      
      <div style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '8px',
        padding: '16px',
        border: `1px solid ${isDarkMode ? '#1e40af' : '#3b82f6'}`,
        marginBottom: '16px'
      }}>
        <p style={{
          color: isDarkMode ? '#bfdbfe' : '#1e40af',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: '0'
        }}>
          🔗 Your content and settings are being stored securely in Supabase. All data is encrypted and backed up automatically.
        </p>
      </div>
      
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' 
            : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'inherit'
        }}
      >
        <Database style={{ height: '16px', width: '16px' }} />
        <span>🚀 Open Supabase Project</span>
        <ExternalLink style={{ height: '14px', width: '14px' }} />
      </button>
    </div>
  );
};

// Main Component
export default function ContentManager() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('create');
  const [savedPosts, setSavedPosts] = useState<ContentPost[]>([]);
  const [loadedTemplate, setLoadedTemplate] = useState<NotionTemplate | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load posts from Notion on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const posts = await loadFromNotionDatabase();
        setSavedPosts(posts);
      } catch (error) {
        console.error('Failed to load posts:', error);
        // Fallback to empty array if Notion fails
        setSavedPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);
  
  // Mock character profiles
  const [characterProfiles] = useState<CharacterProfile[]>([
    { id: 'anica', name: 'Anica', description: 'Empathetic and supportive communication style' },
    { id: 'caelum', name: 'Caelum', description: 'Analytical and strategic approach' },
    { id: 'aurion', name: 'Aurion', description: 'Creative and inspiring messaging' },
  ]);

  // Mock platforms
  const [platforms] = useState<SocialPlatform[]>([
    { id: '1', name: 'Telegram Group 1', url: 'https://t.me/group1', isActive: true, isDefault: true },
    { id: '2', name: 'Telegram Group 2', url: 'https://t.me/group2', isActive: true, isDefault: false },
    { id: '3', name: 'Facebook Page', url: 'https://facebook.com/page', isActive: true, isDefault: false },
    { id: '4', name: 'Forum', url: 'https://yourforum.com', isActive: true, isDefault: true },
    { id: '5', name: 'Twitter', url: 'https://twitter.com/account', isActive: false, isDefault: false },
  ]);

  const handleSavePost = async (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
    try {
      setIsSaving(true);
      
      // Save to Notion first
      const notionResult = await saveToNotionDatabase(postData);
      
      // Create local post with Notion page ID
      const newPost: ContentPost = {
        ...postData,
        id: Date.now().toString(),
        createdDate: new Date(),
        notionPageId: notionResult.id
      };
      
      // Update local state
      setSavedPosts(prev => [newPost, ...prev]);
      setLoadedTemplate(null);
      
      alert('✅ Content saved successfully to database!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('❌ Failed to save content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToSchedule = async (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
    try {
      setIsSaving(true);
      
      // Save to Notion with scheduled status
      const scheduledData = { ...postData, status: 'scheduled' as const };
      const notionResult = await saveToNotionDatabase(scheduledData);
      
      // Create local post
      const newPost: ContentPost = {
        ...scheduledData,
        id: Date.now().toString(),
        createdDate: new Date(),
        notionPageId: notionResult.id
      };
      
      setSavedPosts(prev => [newPost, ...prev]);
      setLoadedTemplate(null);
      
      alert('🚀 Content saved and ready for scheduling!');
    } catch (error) {
      console.error('Schedule save failed:', error);
      alert('❌ Failed to save content for scheduling. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPost = (postId: string) => {
    // TODO: Load post data into form for editing
    alert('Edit functionality coming next');
  };

  const handleSchedulePost = (postId: string) => {
    // TODO: Move to scheduler
    alert('Schedule functionality coming next');
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      const post = savedPosts.find(p => p.id === postId);
      
      if (post?.notionPageId) {
        // Soft delete in Notion (update status to 'Deleted')
        await updateNotionContent(post.notionPageId, { status: 'deleted' as any });
      }
      
      // Remove from local state
      setSavedPosts(prev => prev.filter(post => post.id !== postId));
      
    } catch (error) {
      console.error('Delete failed:', error);
      alert('❌ Failed to delete content. Please try again.');
    }
  };

  const handleLoadTemplate = (template: NotionTemplate) => {
    setLoadedTemplate(template);
    setActiveTab('create'); // Switch to create tab
  };

  const handleTemplateLoaded = () => {
    // Template has been loaded into the form
    console.log('Template loaded into form');
  };

  const tabs = [
    { id: 'create', label: 'Create New Content', icon: Edit3 },
    { id: 'notion', label: 'Notion Templates', icon: Database },
    { id: 'supabase', label: 'Supabase Database', icon: Database },
  ];

  return (
    <div style={{
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gap: '24px'
      }}>
        {/* Tabs */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    flex: 1,
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === tab.id ? (isDarkMode ? '#60a5fa' : '#3b82f6') : 'transparent',
                    color: activeTab === tab.id ? 'white' : (isDarkMode ? '#94a3b8' : '#6b7280'),
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f9fafb';
                      e.currentTarget.style.color = isDarkMode ? '#f8fafc' : '#111827';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
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
          {activeTab === 'create' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <EnhancedContentCreationForm
                onSave={handleSavePost}
                onAddToSchedule={handleAddToSchedule}
                characterProfiles={characterProfiles}
                platforms={platforms}
                loadedTemplate={loadedTemplate}
                onTemplateLoaded={handleTemplateLoaded}
                isSaving={isSaving}
              />
              
              <SavedPostsList
                posts={savedPosts}
                onEditPost={handleEditPost}
                onSchedulePost={handleSchedulePost}
                onDeletePost={handleDeletePost}
                isLoading={isLoadingPosts}
              />
            </div>
          )}

          {activeTab === 'notion' && (
            <NotionDatabaseSection
              onLoadTemplate={handleLoadTemplate}
            />
          )}

          {activeTab === 'supabase' && <SupabaseConnection />}
        </div>
      </div>
    </div>
  );
}
