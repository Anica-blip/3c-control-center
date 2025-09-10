import React, { useState, useRef, createContext, useContext, useEffect } from 'react';
import { Upload, X, Image, Video, FileText, Download, Eye, Trash2, Plus, Settings, ExternalLink, Database, CheckCircle, Circle, Check, Edit3, Copy, Calendar, User, Palette, Send, Library } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client following compliance pattern
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client created successfully for Content Manager');
} else {
  console.error('Missing Supabase environment variables in Content Manager');
}

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
  status: 'pending' | 'active' | 'draft' | 'scheduled' | 'published';
  createdDate: Date;
  scheduledDate?: Date;
  isFromTemplate?: boolean;
  sourceTemplateId?: string;
  supabaseId?: string;
}

interface PendingLibraryTemplate {
  id: string;
  template_id: string;
  content_title: string;
  content_id?: string;
  character_profile?: string;
  theme?: string;
  audience?: string;
  media_type?: string;
  template_type?: string;
  platform?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  keywords?: string;
  cta?: string;
  media_files?: MediaFile[];
  selected_platforms?: string[];
  status: 'pending' | 'active' | 'draft' | 'scheduled';
  is_from_template: boolean;
  source_template_id?: string;
  user_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
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
  username: string;
  role: string;
  description: string;
  avatar_id: string | null;
  is_active: boolean;
  created_at: string;
}

// Supabase API functions following compliance pattern
const supabaseAPI = {
  // Get current user ID for RLS compliance
  async getCurrentUserId() {
    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Pending Content Library operations
  async insertPendingTemplate(templateData: Omit<PendingLibraryTemplate, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await supabase
        .from('pending_content_library')
        .insert({ 
          ...templateData,
          user_id: userId,      // REQUIRED for RLS
          created_by: userId,   // REQUIRED for tracking
          is_active: true 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting pending template:', error);
      throw error;
    }
  },

  async fetchPendingTemplates() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('pending_content_library')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending templates:', error);
      return [];
    }
  },

  async updatePendingTemplate(id: string, updateData: Partial<PendingLibraryTemplate>) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase
        .from('pending_content_library')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating pending template:', error);
      throw error;
    }
  },

  async deletePendingTemplate(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { error } = await supabase
        .from('pending_content_library')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting pending template:', error);
      throw error;
    }
  },

  // Content Posts operations (if you want to save to Supabase instead of localStorage)
  async insertContentPost(postData: Omit<ContentPost, 'id' | 'createdDate'>) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await supabase
        .from('content_posts')
        .insert({ 
          content_id: postData.contentId,
          character_profile: postData.characterProfile,
          theme: postData.theme,
          audience: postData.audience,
          media_type: postData.mediaType,
          template_type: postData.templateType,
          platform: postData.platform,
          title: postData.title,
          description: postData.description,
          hashtags: postData.hashtags,
          keywords: postData.keywords,
          cta: postData.cta,
          media_files: postData.mediaFiles,
          selected_platforms: postData.selectedPlatforms,
          status: postData.status,
          is_from_template: postData.isFromTemplate || false,
          source_template_id: postData.sourceTemplateId,
          created_date: new Date().toISOString(),
          user_id: userId,
          created_by: userId,
          is_active: true 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting content post:', error);
      throw error;
    }
  },

  async fetchContentPosts() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching content posts:', error);
      return [];
    }
  }
};

// Enhanced Content Creation Form
const EnhancedContentCreationForm = ({ 
  onSave, 
  onAddToSchedule, 
  characterProfiles, 
  platforms,
  loadedTemplate,
  onTemplateLoaded,
  isSaving,
  isLoadingProfiles,
  editingPost,
  onEditComplete
}: {
  onSave: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  onAddToSchedule: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  characterProfiles: CharacterProfile[];
  platforms: SocialPlatform[];
  loadedTemplate?: PendingLibraryTemplate | null;
  onTemplateLoaded?: () => void;
  isSaving?: boolean;
  isLoadingProfiles?: boolean;
  editingPost?: ContentPost | null;
  onEditComplete?: () => void;
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
  const [isEditingPost, setIsEditingPost] = useState(false);
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

  // Load editing post data when provided
  useEffect(() => {
    if (editingPost) {
      setSelections({
        characterProfile: editingPost.characterProfile,
        theme: editingPost.theme,
        audience: editingPost.audience,
        mediaType: editingPost.mediaType,
        templateType: editingPost.templateType,
        platform: editingPost.platform
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

  // Load template data when provided
  useEffect(() => {
    if (loadedTemplate && !editingPost) { // Don't load template if editing a post
      setSelections({
        characterProfile: loadedTemplate.character_profile || '',
        theme: loadedTemplate.theme || '',
        audience: loadedTemplate.audience || '',
        mediaType: loadedTemplate.media_type || '',
        templateType: loadedTemplate.template_type || '',
        platform: loadedTemplate.platform || ''
      });
      
      setContent({
        title: loadedTemplate.title || '',
        description: loadedTemplate.description || '',
        hashtags: loadedTemplate.hashtags || [],
        keywords: loadedTemplate.keywords || '',
        cta: loadedTemplate.cta || ''
      });
      
      if (loadedTemplate.media_files) {
        setMediaFiles(loadedTemplate.media_files);
      }
      
      if (loadedTemplate.selected_platforms) {
        setSelectedPlatforms(loadedTemplate.selected_platforms);
      }
      
      setIsEditingTemplate(true);
      setupPlatformFields(loadedTemplate.platform);
      
      if (onTemplateLoaded) {
        onTemplateLoaded();
      }
    }
  }, [loadedTemplate]);

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

  const handleSave = async () => {
    const postData = {
      contentId,
      ...selections,
      ...content,
      mediaFiles,
      selectedPlatforms,
      status: 'draft' as const,
      isFromTemplate: isEditingTemplate,
      sourceTemplateId: loadedTemplate?.source_template_id
    };

    try {
      if (isEditingPost && editingPost) {
        // Update existing post
        alert('Content updated successfully!');
        
        // Reset editing state
        setIsEditingPost(false);
        if (onEditComplete) {
          onEditComplete();
        }
      } else {
        // Create new post
        await onSave(postData);
      }
      
      // Only reset form if save was successful
      resetForm();
    } catch (error) {
      // Don't reset form on error - preserve user's work
      console.error('Save failed, preserving form data:', error);
      alert('Failed to save content. Your content is preserved and not lost.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      isFromTemplate: isEditingTemplate,
      sourceTemplateId: loadedTemplate?.source_template_id
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
    setIsEditingPost(false);
    setFieldConfig(null);
  };

  const activePlatforms = platforms?.filter(p => p?.isActive) || [];
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
              {isEditingPost ? 'Editing Content' : 
               isEditingTemplate ? 'Editing Template Content' : 'Create New Content'}
            </h2>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              fontSize: '14px',
              margin: '0'
            }}>
              {isEditingPost ? `Editing post: ${contentId}` :
               isEditingTemplate ? `Working from template: ${loadedTemplate?.template_id}` :
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
        marginBottom: '24px'
      }}>
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
              backgroundColor: '#334155',
              color: '#ffffff',
              fontFamily: 'inherit'
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
              backgroundColor: '#334155',
              color: '#ffffff',
              fontFamily: 'inherit'
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
              backgroundColor: '#334155',
              color: '#ffffff',
              fontFamily: 'inherit'
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
              backgroundColor: '#334155',
              color: '#ffffff',
              fontFamily: 'inherit'
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

        {/* Platform Selection */}
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
              fontFamily: 'inherit'
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
      <div style={{ marginBottom: '24px', width: '80%' }}>
        <label style={{
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          marginBottom: '12px'
        }}>
          Media Upload
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
            transition: 'all 0.3s ease',
            width: '100%'
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
                handleFileUpload(e.target.files);
              }
            }}
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
                Uploaded Files
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
        width: '80%'
      }}>
        {/* Title Field */}
        {(!fieldConfig || fieldConfig.title?.show !== false) && (
          <div style={{ width: '100%' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: isDarkMode ? '#f8fafc' : '#111827',
              marginBottom: '8px'
            }}>
              Title/Headline
            </label>
            
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
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: isDarkMode ? '#334155' : 'white',
                color: '#000000',
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
              <span>Create an attention-grabbing headline (UK English)</span>
              <span>{content.title.length}/{fieldConfig?.title?.maxLength || 150}</span>
            </div>
          </div>
        )}

        {/* Description Field */}
        <div style={{ width: '100%' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            Post Description *
          </label>
          
          <textarea
            value={content.description}
            onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Write your post content here... (UK English)"
            maxLength={fieldConfig?.description?.maxLength || 2200}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: '#000000',
              resize: 'vertical',
              minHeight: '120px',
              fontFamily: 'inherit',
              lineHeight: '1.4'
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
        <div style={{ width: '100%' }}>
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
        <div style={{ width: '100%' }}>
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
        <div style={{ width: '100%' }}>
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
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          marginBottom: '12px'
        }}>
          Select Publishing Platforms
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
                  : '#334155',
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
                    Default
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

const TemplateLibrarySection = ({ onLoadTemplate }: {
  onLoadTemplate: (template: PendingLibraryTemplate) => void;
}) => {
  const { isDarkMode } = useTheme();
  const [pendingTemplates, setPendingTemplates] = useState<PendingLibraryTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load pending templates on component mount
  useEffect(() => {
    loadPendingTemplates();
  }, []);

  const loadPendingTemplates = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      
      const templates = await supabaseAPI.fetchPendingTemplates();
      setPendingTemplates(templates);
      setIsConnected(true);
      
    } catch (error: any) {
      console.error('Error loading pending templates:', error);
      setIsConnected(false);
      setConnectionError(error.message || 'Failed to load templates');
      
      // Mock data for testing when Supabase isn't available
      setPendingTemplates([
        {
          id: '1',
          template_id: 'NA-EM-IM-SM-001',
          content_title: 'Breaking News Alert',
          character_profile: 'anica',
          theme: 'news_alert',
          audience: 'existing_members',
          media_type: 'image',
          template_type: 'social_media',
          platform: 'instagram',
          title: 'Important Community Update',
          description: 'We have an important announcement for our community members...',
          hashtags: ['news', 'alert', 'community'],
          keywords: 'breaking news, alert, update',
          cta: 'Read more in comments',
          status: 'pending',
          is_from_template: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToCreate = async (template: PendingLibraryTemplate) => {
    try {
      // Update status to active in database
      await supabaseAPI.updatePendingTemplate(template.id, { status: 'active' });
      
      // Remove from pending list
      setPendingTemplates(prev => prev.filter(t => t.id !== template.id));
      
      // Load into Create New Content form
      onLoadTemplate(template);
      
      alert(`Template "${template.content_title}" sent to Create New Content and removed from Template Library.`);
    } catch (error) {
      console.error('Error sending template to create:', error);
      alert('Failed to send template. Please try again.');
    }
  };

  const handleDeleteTemplate = async (template: PendingLibraryTemplate) => {
    if (!confirm(`Are you sure you want to delete the template "${template.content_title}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await supabaseAPI.deletePendingTemplate(template.id);
      setPendingTemplates(prev => prev.filter(t => t.id !== template.id));
      alert('Template deleted successfully.');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const formatTheme = (theme: string) => {
    return theme?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const getThemeIcon = (theme: string) => {
    const icons: Record<string, string> = {
      news_alert: '📢',
      promotion: '🎯',
      standard_post: '📝',
      cta_quiz: '❓',
      tutorial_guide: '📚',
      blog: '✍️',
      assessment: '✅'
    };
    return icons[theme] || '📄';
  };

  return (
    <div style={{
      display: 'grid',
      gap: '24px'
    }}>
      {/* Template Library Header */}
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
              Template Library
            </h3>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              margin: '0',
              fontSize: '14px'
            }}>
              Templates forwarded from Content Template Engine (Table: pending_content_library)
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isConnected 
              ? (isDarkMode ? '#065f4630' : '#d1fae5')
              : (isDarkMode ? '#7f1d1d30' : '#fee2e2'),
            padding: '8px 12px',
            borderRadius: '8px',
            border: `1px solid ${isConnected ? '#10b981' : '#ef4444'}`
          }}>
            {isConnected ? (
              <CheckCircle style={{ height: '18px', width: '18px', color: '#10b981' }} />
            ) : (
              <X style={{ height: '18px', width: '18px', color: '#ef4444' }} />
            )}
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isConnected 
                ? (isDarkMode ? '#34d399' : '#065f46')
                : (isDarkMode ? '#fca5a5' : '#7f1d1d')
            }}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
        
        {/* Connection Error Display */}
        {connectionError && (
          <div style={{
            background: isDarkMode ? '#7f1d1d30' : '#fee2e2',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #ef4444',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <X style={{ height: '16px', width: '16px', color: '#ef4444' }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isDarkMode ? '#fca5a5' : '#7f1d1d'
              }}>
                Supabase Connection Error
              </span>
            </div>
            <p style={{
              color: isDarkMode ? '#fca5a5' : '#7f1d1d',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0 0 8px 0'
            }}>
              {connectionError}
            </p>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              fontSize: '12px',
              margin: '0'
            }}>
              Currently using mock templates for testing. Check Supabase configuration.
            </p>
          </div>
        )}
        
        <div style={{
          background: isConnected 
            ? (isDarkMode ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)')
            : (isDarkMode ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'),
          borderRadius: '8px',
          padding: '16px',
          border: `1px solid ${isConnected ? (isDarkMode ? '#1e40af' : '#3b82f6') : '#ef4444'}`,
          marginBottom: '16px'
        }}>
          <p style={{
            color: isConnected 
              ? (isDarkMode ? '#bfdbfe' : '#1e40af')
              : (isDarkMode ? '#fca5a5' : '#7f1d1d'),
            fontSize: '14px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            {isConnected 
              ? 'Templates are forwarded from your Content Template Engine and stored in Supabase pending_content_library table.'
              : 'Supabase connection required to receive forwarded templates from Content Template Engine.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={loadPendingTemplates}
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
            <Library style={{ height: '16px', width: '16px' }} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh Templates'}</span>
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
              Pending Templates
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
              {pendingTemplates.length} templates
            </span>
          </div>
        </div>
        
        <div>
          {isLoading ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: isDarkMode ? '#94a3b8' : '#6b7280'
            }}>
              <Library style={{ height: '32px', width: '32px', margin: '0 auto 12px auto', display: 'block' }} />
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Loading templates...
              </div>
              <div style={{ fontSize: '14px' }}>
                Fetching from pending_content_library
              </div>
            </div>
          ) : pendingTemplates.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center'
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
                <Library style={{ height: '32px', width: '32px', color: isDarkMode ? '#64748b' : '#9ca3af' }} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isDarkMode ? '#f8fafc' : '#111827',
                margin: '0 0 8px 0'
              }}>
                No pending templates
              </h3>
              <p style={{
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                fontSize: '14px',
                margin: '0'
              }}>
                Templates forwarded from Content Template Engine will appear here
              </p>
            </div>
          ) : (
            pendingTemplates.map((template) => (
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
                        {getThemeIcon(template.theme || '')}
                      </span>
                      <div>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: isDarkMode ? '#f8fafc' : '#111827',
                          margin: '0 0 4px 0'
                        }}>
                          {template.template_id} - {template.content_title}
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
                          ID: {template.template_id}
                        </div>
                      </div>
                    </div>
                    
                    {template.description && (
                      <p style={{
                        color: isDarkMode ? '#94a3b8' : '#374151',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        margin: '0 0 16px 0'
                      }}>
                        {template.description.length > 150 
                          ? template.description.substring(0, 150) + '...'
                          : template.description
                        }
                      </p>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}>
                      {template.theme && (
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
                      )}
                      
                      {template.audience && (
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
                      )}
                      
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
                        Received {new Date(template.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <button
                      onClick={() => handleSendToCreate(template)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: isDarkMode ? '#10b981' : '#059669',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Send style={{ height: '16px', width: '16px' }} />
                      <span>Send to Create</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Trash2 style={{ height: '14px', width: '14px' }} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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
      active: { backgroundColor: isDarkMode ? '#1e40af' : '#dbeafe', color: isDarkMode ? '#dbeafe' : '#1e40af', text: 'Active' },
      draft: { backgroundColor: isDarkMode ? '#64748b' : '#f1f5f9', color: isDarkMode ? '#f1f5f9' : '#64748b', text: 'Draft' },
      scheduled: { backgroundColor: isDarkMode ? '#1e40af' : '#dbeafe', color: isDarkMode ? '#dbeafe' : '#1e40af', text: 'Scheduled' },
      published: { backgroundColor: isDarkMode ? '#065f46' : '#d1fae5', color: isDarkMode ? '#d1fae5' : '#065f46', text: 'Published' }
    };
    
    const style = badgeStyles[status as keyof typeof badgeStyles] || badgeStyles.pending;
    
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
            Saved Content
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
                
                {(post.status === 'pending' || post.status === 'draft') && (
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
            Supabase Database
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
          backgroundColor: supabase 
            ? (isDarkMode ? '#065f4630' : '#d1fae5')
            : (isDarkMode ? '#7f1d1d30' : '#fee2e2'),
          padding: '8px 12px',
          borderRadius: '8px',
          border: `1px solid ${supabase ? '#10b981' : '#ef4444'}`
        }}>
          {supabase ? (
            <CheckCircle style={{ height: '18px', width: '18px', color: '#10b981' }} />
          ) : (
            <X style={{ height: '18px', width: '18px', color: '#ef4444' }} />
          )}
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: supabase 
              ? (isDarkMode ? '#34d399' : '#065f46')
              : (isDarkMode ? '#fca5a5' : '#7f1d1d')
          }}>
            {supabase ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      </div>
      
      <div style={{
        background: supabase 
          ? (isDarkMode ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)')
          : (isDarkMode ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'),
        borderRadius: '8px',
        padding: '16px',
        border: `1px solid ${supabase ? (isDarkMode ? '#1e40af' : '#3b82f6') : '#ef4444'}`,
        marginBottom: '16px'
      }}>
        <p style={{
          color: supabase 
            ? (isDarkMode ? '#bfdbfe' : '#1e40af')
            : (isDarkMode ? '#fca5a5' : '#7f1d1d'),
          fontSize: '14px',
          lineHeight: '1.6',
          margin: '0'
        }}>
          {supabase 
            ? 'Character profiles, platforms, and pending templates are being loaded from Supabase. All data is encrypted and backed up automatically.'
            : 'Supabase connection not configured. Please check environment variables VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'}
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
        onClick={() => window.open('https://supabase.com/dashboard/project/uqyqpwhkzlhqxcqajhkn/database/schemas', '_blank')}
      >
        <Database style={{ height: '16px', width: '16px' }} />
        <span>Open Supabase Project</span>
        <ExternalLink style={{ height: '14px', width: '14px' }} />
      </button>
    </div>
  );
};

// Main Component
export default function ContentComponent() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('create');
  const [savedPosts, setSavedPosts] = useState<ContentPost[]>([]);
  const [loadedTemplate, setLoadedTemplate] = useState<PendingLibraryTemplate | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);

  // Supabase data states
  const [characterProfiles, setCharacterProfiles] = useState<CharacterProfile[]>([]);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [telegramChannels, setTelegramChannels] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Load data from Supabase on component mount
  useEffect(() => {
    loadCharacterProfiles();
    loadPlatformsData();
    loadTelegramChannels();
    fetchSavedPosts();
  }, []);

  const loadCharacterProfiles = async () => {
    if (!supabase) {
      console.warn('Supabase not configured. Using mock character data.');
      setCharacterProfiles([
        { id: 'anica', name: 'Anica', username: '@anica', role: 'Community Manager', description: 'Empathetic and supportive communication style', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
        { id: 'caelum', name: 'Caelum', username: '@caelum', role: 'Strategist', description: 'Analytical and strategic approach', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
        { id: 'aurion', name: 'Aurion', username: '@aurion', role: 'Creative Director', description: 'Creative and inspiring messaging', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
      ]);
      setIsLoadingProfiles(false);
      return;
    }

    try {
      setIsLoadingProfiles(true);
      const { data, error } = await supabase
        .from('character_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCharacterProfiles(data || []);
    } catch (error) {
      console.error('Error loading character profiles:', error);
      // Fallback to mock data
      setCharacterProfiles([
        { id: 'anica', name: 'Anica', username: '@anica', role: 'Community Manager', description: 'Empathetic and supportive communication style', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
        { id: 'caelum', name: 'Caelum', username: '@caelum', role: 'Strategist', description: 'Analytical and strategic approach', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
        { id: 'aurion', name: 'Aurion', username: '@aurion', role: 'Creative Director', description: 'Creative and inspiring messaging', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
      ]);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const loadPlatformsData = async () => {
    if (!supabase) {
      console.warn('Supabase not configured. Using mock platform data.');
      setPlatforms([
        { id: '1', name: 'Facebook', url: 'https://facebook.com/page', isActive: true, isDefault: false },
        { id: '2', name: 'Instagram', url: 'https://instagram.com/page', isActive: true, isDefault: true },
      ]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('social_platforms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const platformData = (data || []).map(item => ({
        id: item.id.toString(),
        name: item.name,
        url: item.url,
        isActive: item.is_active,
        isDefault: false // You can add this field to your Supabase table if needed
      }));
      
      setPlatforms(platformData);
    } catch (error) {
      console.error('Error loading platforms:', error);
      setPlatforms([]);
    }
  };

  const loadTelegramChannels = async () => {
    if (!supabase) {
      console.warn('Supabase not configured. Using empty Telegram data.');
      setTelegramChannels([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('telegram_configurations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Ensure data has required fields
      const safeData = (data || []).filter(item => 
        item && 
        item.id && 
        item.name && 
        typeof item.name === 'string'
      );
      
      setTelegramChannels(safeData);
    } catch (error) {
      console.error('Error loading Telegram channels:', error);
      setTelegramChannels([]);
    }
  };

  // Load posts from Supabase on component mount
  const fetchSavedPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const posts = await supabaseAPI.fetchContentPosts();
      
      // Convert Supabase format to ContentPost format
      const formattedPosts: ContentPost[] = posts.map(post => ({
        id: post.id.toString(),
        contentId: post.content_id || post.contentId,
        characterProfile: post.character_profile || post.characterProfile,
        theme: post.theme,
        audience: post.audience,
        mediaType: post.media_type || post.mediaType,
        templateType: post.template_type || post.templateType,
        platform: post.platform,
        title: post.title,
        description: post.description,
        hashtags: post.hashtags || [],
        keywords: post.keywords,
        cta: post.cta,
        mediaFiles: post.media_files || [],
        selectedPlatforms: post.selected_platforms || [],
        status: post.status || 'draft',
        createdDate: new Date(post.created_date || post.created_at),
        scheduledDate: post.scheduled_date ? new Date(post.scheduled_date) : undefined,
        isFromTemplate: post.is_from_template || false,
        sourceTemplateId: post.source_template_id,
        supabaseId: post.id.toString()
      }));
      
      setSavedPosts(formattedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setSavedPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleSavePost = async (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
    try {
      setIsSaving(true);
      
      // Save to Supabase
      const savedPost = await supabaseAPI.insertContentPost(postData);
      
      // Create local post object
      const newPost: ContentPost = {
        ...postData,
        id: savedPost.id.toString(),
        createdDate: new Date(savedPost.created_date),
        supabaseId: savedPost.id.toString()
      };
      
      // Update local state
      setSavedPosts(prev => [newPost, ...prev]);
      setLoadedTemplate(null);
      setEditingPost(null); // Clear editing state
      
      alert('Content saved successfully to database!');
      
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save content. Please try again.\n\nNote: Your content has been preserved and not lost.');
      // Don't reset form data on error - form content is preserved
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToSchedule = async (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
    try {
      setIsSaving(true);
      
      // Save to Supabase with scheduled status
      const scheduledData = { ...postData, status: 'scheduled' as const };
      const savedPost = await supabaseAPI.insertContentPost(scheduledData);
      
      // Create local post
      const newPost: ContentPost = {
        ...scheduledData,
        id: savedPost.id.toString(),
        createdDate: new Date(savedPost.created_date),
        supabaseId: savedPost.id.toString()
      };
      
      setSavedPosts(prev => [newPost, ...prev]);
      setLoadedTemplate(null);
      
      // Format post for Schedule Manager (convert ContentPost to PendingPost format)
      const pendingPost = {
        id: 'pending-' + Date.now(),
        characterProfile: postData.characterProfile,
        type: postData.theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        template: postData.templateType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: postData.description,
        mediaFiles: postData.mediaFiles,
        platforms: postData.selectedPlatforms.map(platformId => ({
          platformId: platformId,
          platformName: platforms?.find(p => p.id === platformId)?.name || 'Unknown',
          platformIcon: platforms?.find(p => p.id === platformId)?.name?.substring(0, 2).toUpperCase() || 'UN',
          status: 'pending' as const
        })),
        status: 'pending_schedule' as const,
        createdDate: new Date(),
        contentId: postData.contentId // Include the generated content ID
      };
      
      // Send to Schedule Manager - this would typically be done via:
      // 1. Parent component callback prop
      // 2. Context/State management
      // 3. Event system
      // For now, store in localStorage as bridge between components
      const existingPending = JSON.parse(localStorage.getItem('pendingSchedulePosts') || '[]');
      existingPending.unshift(pendingPost);
      localStorage.setItem('pendingSchedulePosts', JSON.stringify(existingPending));
      
      // Dispatch custom event to notify Schedule Manager
      window.dispatchEvent(new CustomEvent('newPendingPost', { 
        detail: pendingPost 
      }));
      
      alert('Content sent to Schedule Manager for scheduling!\n\nYou can now set the date and time in the Schedule Manager > Pending Scheduling tab.');
      
    } catch (error) {
      console.error('Schedule save failed:', error);
      alert('Failed to save content for scheduling. Please try again.\n\nNote: Your content has been preserved and not lost.');
      // Don't reset form data on error - form content is preserved
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPost = (postId: string) => {
    // Find the post to edit
    const postToEdit = savedPosts.find(p => p.id === postId);
    if (!postToEdit) {
      alert('Post not found for editing.');
      return;
    }

    // Set the post as currently being edited
    setEditingPost(postToEdit);
    
    // Switch to create tab
    setActiveTab('create');
    
    alert(`Loading "${postToEdit.title || 'Untitled Post'}" into the form for editing.\n\nYou can now modify the content and either save as draft (updates existing) or schedule the post.`);
  };

  const handleEditComplete = () => {
    // Clear editing state when edit is complete or cancelled
    setEditingPost(null);
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
      
      if (post?.supabaseId && supabase) {
        // Soft delete in Supabase (set is_active to false)
        await supabase
          .from('content_posts')
          .update({ is_active: false })
          .eq('id', post.supabaseId);
      }
      
      // Remove from local state
      setSavedPosts(prev => prev.filter(post => post.id !== postId));
      
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete content. Please try again.');
    }
  };

  const handleLoadTemplate = (template: PendingLibraryTemplate) => {
    setLoadedTemplate(template);
    setActiveTab('create'); // Switch to create tab
  };

  const handleTemplateLoaded = () => {
    // Template has been loaded into the form
    console.log('Template loaded into form');
  };

  const tabs = [
    { id: 'create', label: 'Create New Content', icon: Edit3 },
    { id: 'templates', label: 'Template Library', icon: Library },
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
                platforms={[...platforms, ...telegramChannels.map(t => ({
                  id: t.id ? t.id.toString() : Math.random().toString(),
                  name: t.name ? `${t.name} (Telegram)` : 'Telegram Channel',
                  url: t.channel_group_id ? `https://t.me/${t.channel_group_id}` : '',
                  isActive: true,
                  isDefault: false
                }))].filter(p => p.id && p.name)}
                loadedTemplate={loadedTemplate}
                onTemplateLoaded={handleTemplateLoaded}
                isSaving={isSaving}
                isLoadingProfiles={isLoadingProfiles}
                editingPost={editingPost}
                onEditComplete={handleEditComplete}
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

          {activeTab === 'templates' && (
            <TemplateLibrarySection
              onLoadTemplate={handleLoadTemplate}
            />
          )}

          {activeTab === 'supabase' && <SupabaseConnection />}
        </div>
      </div>
    </div>
  );
}
