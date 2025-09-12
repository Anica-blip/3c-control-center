import React, { useState, useRef, createContext, useContext, useEffect } from 'react';
import { Upload, X, Image, Video, FileText, Download, Eye, Trash2, Plus, Settings, ExternalLink, Database, CheckCircle, Circle, Check, Edit3, Copy, Calendar, User, Palette } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
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
  status: 'pending' | 'scheduled' | 'published';
  createdDate: Date;
  scheduledDate?: Date;
  isFromTemplate?: boolean;
  sourceTemplateId?: string;
  supabaseId?: string; // Supabase record ID
}

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'gif' | 'interactive' | 'other';
  size: number;
  url: string;
  supabaseUrl?: string; // URL after upload to Supabase
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

// Simple Supabase Integration - No Auth Checks
const supabaseAPI = {
  // Upload media file to content-media bucket
  async uploadMediaFile(file: File, contentId: string, userId: string): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${contentId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('content-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('content-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media file:', error);
      throw error;
    }
  }
};

  // Save content post to content_posts table
  async saveContentPost(postData: Omit<ContentPost, 'id' | 'createdDate'>): Promise<ContentPost> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      // Upload media files first
      const uploadedMediaFiles = await Promise.all(
        postData.mediaFiles.map(async (mediaFile) => {
          if (mediaFile.url.startsWith('blob:')) {
            // Convert blob URL to file and upload
            const response = await fetch(mediaFile.url);
            const blob = await response.blob();
            const file = new File([blob], mediaFile.name, { type: blob.type });
            
            const supabaseUrl = await this.uploadMediaFile(file, postData.contentId);
            
            return {
              ...mediaFile,
              supabaseUrl: supabaseUrl,
              url: supabaseUrl // Update URL to Supabase URL
            };
          }
          return mediaFile;
        })
      );

      // Prepare data for database insert
      const insertData = {
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
        media_files: uploadedMediaFiles,
        selected_platforms: postData.selectedPlatforms,
        status: postData.status,
        is_from_template: postData.isFromTemplate || false,
        source_template_id: postData.sourceTemplateId,
        user_id: userId, // REQUIRED for RLS
        created_by: userId, // REQUIRED for tracking
        is_active: true
      };

      const { data, error } = await supabase
        .from('content_posts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Convert back to ContentPost format
      const contentPost: ContentPost = {
        id: data.id.toString(),
        contentId: data.content_id,
        characterProfile: data.character_profile,
        theme: data.theme,
        audience: data.audience,
        mediaType: data.media_type,
        templateType: data.template_type,
        platform: data.platform,
        title: data.title,
        description: data.description,
        hashtags: data.hashtags || [],
        keywords: data.keywords || '',
        cta: data.cta || '',
        mediaFiles: uploadedMediaFiles,
        selectedPlatforms: data.selected_platforms || [],
        status: data.status,
        createdDate: new Date(data.created_at),
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      return contentPost;
    } catch (error) {
      console.error('Error saving content post:', error);
      throw error;
    }
  },

  // Load content posts from content_posts table
  async loadContentPosts(): Promise<ContentPost[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to ContentPost format
      const contentPosts: ContentPost[] = (data || []).map(record => ({
        id: record.id.toString(),
        contentId: record.content_id,
        characterProfile: record.character_profile,
        theme: record.theme,
        audience: record.audience,
        mediaType: record.media_type,
        templateType: record.template_type,
        platform: record.platform || '',
        title: record.title || '',
        description: record.description || '',
        hashtags: record.hashtags || [],
        keywords: record.keywords || '',
        cta: record.cta || '',
        mediaFiles: record.media_files || [],
        selectedPlatforms: record.selected_platforms || [],
        status: record.status || 'pending',
        createdDate: new Date(record.created_at),
        scheduledDate: record.scheduled_date ? new Date(record.scheduled_date) : undefined,
        isFromTemplate: record.is_from_template || false,
        sourceTemplateId: record.source_template_id,
        supabaseId: record.id.toString()
      }));

      return contentPosts;
    } catch (error) {
      console.error('Error loading content posts:', error);
      return [];
    }
  },

  // Update content post
  async updateContentPost(postId: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      // Handle media file updates if needed
      let updatedMediaFiles = updates.mediaFiles;
      if (updates.mediaFiles) {
        updatedMediaFiles = await Promise.all(
          updates.mediaFiles.map(async (mediaFile) => {
            if (mediaFile.url.startsWith('blob:')) {
              // Upload new media file
              const response = await fetch(mediaFile.url);
              const blob = await response.blob();
              const file = new File([blob], mediaFile.name, { type: blob.type });
              
              const supabaseUrl = await this.uploadMediaFile(file, updates.contentId || 'updated');
              
              return {
                ...mediaFile,
                supabaseUrl: supabaseUrl,
                url: supabaseUrl
              };
            }
            return mediaFile;
          })
        );
      }

      // Prepare update data
      const updateData: any = {};
      if (updates.characterProfile) updateData.character_profile = updates.characterProfile;
      if (updates.theme) updateData.theme = updates.theme;
      if (updates.audience) updateData.audience = updates.audience;
      if (updates.mediaType) updateData.media_type = updates.mediaType;
      if (updates.templateType) updateData.template_type = updates.templateType;
      if (updates.platform) updateData.platform = updates.platform;
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.hashtags) updateData.hashtags = updates.hashtags;
      if (updates.keywords) updateData.keywords = updates.keywords;
      if (updates.cta) updateData.cta = updates.cta;
      if (updatedMediaFiles) updateData.media_files = updatedMediaFiles;
      if (updates.selectedPlatforms) updateData.selected_platforms = updates.selectedPlatforms;
      if (updates.status) updateData.status = updates.status;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('content_posts')
        .update(updateData)
        .eq('id', parseInt(postId))
        .select()
        .single();

      if (error) throw error;

      // Convert back to ContentPost format
      const contentPost: ContentPost = {
        id: data.id.toString(),
        contentId: data.content_id,
        characterProfile: data.character_profile,
        theme: data.theme,
        audience: data.audience,
        mediaType: data.media_type,
        templateType: data.template_type,
        platform: data.platform,
        title: data.title,
        description: data.description,
        hashtags: data.hashtags || [],
        keywords: data.keywords || '',
        cta: data.cta || '',
        mediaFiles: data.media_files || [],
        selectedPlatforms: data.selected_platforms || [],
        status: data.status,
        createdDate: new Date(data.created_at),
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      return contentPost;
    } catch (error) {
      console.error('Error updating content post:', error);
      throw error;
    }
  },

  // Soft delete content post
  async deleteContentPost(postId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      const { error } = await supabase
        .from('content_posts')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', parseInt(postId));

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting content post:', error);
      throw error;
    }
  }
};

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
      status: 'pending' as const,
      isFromTemplate: false
    };

    try {
      if (isEditingPost && editingPost) {
        // Update existing post
        const updatedPost = await supabaseAPI.updateContentPost(editingPost.id, postData);
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

      {/* Character Profile Section - Enhanced with Supabase Integration */}
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

      {/* Template Builder Style Selections - All Dropdowns Gray Background */}
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
              fontFamily: 'inherit',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
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
              fontFamily: 'inherit',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
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
                // Handle large files - check size before processing
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

      {/* Content Fields - 80% Width to Match Media Upload */}
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
                color: '#000000', // Black font for posts as requested
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

        {/* Description Field with Enhanced Features */}
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
            
            <button
              type="button"
              onClick={() => {
                const commonEmojis = ['😀', '😊', '😎', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '📢', '✨', '💪', '🚀', '⭐', '👏', '🙏', '💡', '📈', '📊'];
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
              color: '#000000', // Black font for posts as requested
              resize: 'vertical',
              minHeight: '120px',
              fontFamily: 'inherit',
              lineHeight: '1.4', // Enhanced line spacing as requested
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

      {/* Live Preview Section - Shows Exact Final Post Format */}
      {(selections.characterProfile || content.title || content.description || mediaFiles.length > 0) && (
        <div style={{
          marginTop: '32px',
          padding: '24px',
          backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
          borderRadius: '12px',
          border: `2px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <Eye style={{ height: '24px', width: '24px', color: isDarkMode ? '#60a5fa' : '#3b82f6' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDarkMode ? '#60a5fa' : '#3b82f6',
              margin: '0'
            }}>
              Live Preview - Final Post Format
            </h3>
            <div style={{
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              fontStyle: 'italic',
              marginLeft: 'auto'
            }}>
              This is the exact format when the post is published
            </div>
          </div>
          
          <div style={{
            backgroundColor: isDarkMode ? '#334155' : 'white',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
            overflow: 'hidden'
          }}>
            {/* 1. Media Files Preview - Platform Responsive */}
            {mediaFiles.length > 0 && (
              <div style={{
                padding: '16px',
                backgroundColor: isDarkMode ? '#1e293b' : '#f9fafb',
                borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
              }}>
                {/* Platform Preview Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  padding: '8px 12px',
                  backgroundColor: isDarkMode ? '#334155' : '#e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#94a3b8' : '#6b7280'
                }}>
                  <Eye style={{ height: '14px', width: '14px' }} />
                  {selections.platform ? (
                    <span>Showing preview optimized for: {selections.platform.toUpperCase()}</span>
                  ) : (
                    <span>Generic preview (no platform optimization selected)</span>
                  )}
                </div>

                {(() => {
                  // Platform-specific dimensions and styling
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
                        aspectRatio: '1.91 / 1', // Similar to Facebook
                        maxWidth: '500px',
                        label: 'Telegram Post (1.91:1)'
                      },
                      pinterest: {
                        aspectRatio: '2 / 3', // Pinterest vertical
                        maxWidth: '400px',
                        label: 'Pinterest Pin (2:3)'
                      }
                    };
                    
                    return styles[platform as keyof typeof styles] || {
                      aspectRatio: 'auto',
                      maxWidth: '100%',
                      label: 'Original Size (No Platform Selected)'
                    };
                  };

                  const platformStyle = getPlatformPreviewStyle(selections.platform);
                  
                  return (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      {/* Platform Label */}
                      <div style={{
                        fontSize: '11px',
                        color: isDarkMode ? '#60a5fa' : '#3b82f6',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                        {platformStyle.label}
                      </div>

                      {/* Media Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: mediaFiles.length === 1 
                          ? '1fr' 
                          : selections.platform === 'tiktok' || selections.platform === 'pinterest'
                            ? 'repeat(auto-fit, minmax(150px, 200px))'  // Smaller for vertical formats
                            : 'repeat(auto-fit, minmax(200px, 300px))',
                        gap: '12px',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '800px'
                      }}>
                        {mediaFiles.slice(0, 4).map((file, index) => (
                          <div key={file.id} style={{
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
                            border: `2px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`,
                            aspectRatio: platformStyle.aspectRatio,
                            maxWidth: platformStyle.maxWidth,
                            margin: '0 auto'
                          }}>
                            {file.type === 'image' || file.type === 'gif' ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: selections.platform ? 'cover' : 'contain', // Cover for platforms, contain for generic
                                  backgroundColor: isDarkMode ? '#1e293b' : 'white'
                                }}
                              />
                            ) : file.type === 'video' ? (
                              <video
                                src={file.url}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: selections.platform ? 'cover' : 'contain',
                                  backgroundColor: isDarkMode ? '#1e293b' : 'white'
                                }}
                                controls
                                muted
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '16px'
                              }}>
                                {getFileIcon(file.type)}
                                <span style={{
                                  fontSize: '12px',
                                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                                  textAlign: 'center',
                                  fontWeight: '500'
                                }}>
                                  {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                                </span>
                                <span style={{
                                  fontSize: '10px',
                                  color: isDarkMode ? '#64748b' : '#9ca3af',
                                  textAlign: 'center'
                                }}>
                                  {file.type.toUpperCase()}
                                </span>
                              </div>
                            )}
                            
                            {/* Multiple files indicator */}
                            {mediaFiles.length > 4 && index === 3 && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '700'
                              }}>
                                +{mediaFiles.length - 3} more
                              </div>
                            )}

                            {/* File type badge */}
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {file.type}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Platform-specific notes */}
                      {selections.platform && (
                        <div style={{
                          fontSize: '11px',
                          color: isDarkMode ? '#64748b' : '#9ca3af',
                          textAlign: 'center',
                          fontStyle: 'italic',
                          maxWidth: '500px',
                          lineHeight: '1.4'
                        }}>
                          {selections.platform === 'instagram' && 'Instagram will crop images to square format for feed posts. Stories use 9:16 ratio.'}
                          {selections.platform === 'tiktok' && 'TikTok optimizes for vertical 9:16 video format for maximum engagement.'}
                          {selections.platform === 'youtube' && 'YouTube thumbnails work best at 16:9 ratio with bold, readable visuals.'}
                          {selections.platform === 'facebook' && 'Facebook recommends 1.91:1 ratio for optimal feed display and engagement.'}
                          {selections.platform === 'twitter' && 'Twitter displays images best at 16:9 ratio in timeline feeds.'}
                          {selections.platform === 'linkedin' && 'LinkedIn professional posts perform well with 1.91:1 landscape format.'}
                          {selections.platform === 'telegram' && 'Telegram supports various formats but 1.91:1 provides consistent display.'}
                          {selections.platform === 'pinterest' && 'Pinterest favors vertical 2:3 pins for discovery and engagement.'}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. Post Content */}
            <div style={{ padding: '20px' }}>
              {/* a) Character Profile Header */}
              {selections.characterProfile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
                }}>
                  {(() => {
                    const selectedProfile = characterProfiles.find(p => p.id === selections.characterProfile);
                    if (!selectedProfile) return null;
                    
                    return (
                      <>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
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
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: isDarkMode ? '#f8fafc' : '#111827',
                            marginBottom: '2px'
                          }}>
                            {selectedProfile.name}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: isDarkMode ? '#94a3b8' : '#6b7280',
                            marginBottom: '2px'
                          }}>
                            {selectedProfile.username}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: isDarkMode ? '#60a5fa' : '#3b82f6',
                            fontWeight: '500'
                          }}>
                            {selectedProfile.role}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* b) Title/Headline */}
              {content.title && (
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: isDarkMode ? '#f8fafc' : '#111827',
                  margin: '0 0 12px 0',
                  lineHeight: '1.3'
                }}>
                  {content.title}
                </h4>
              )}

              {/* c) Post Description */}
              {content.description && (
                <div style={{
                  fontSize: '15px',
                  color: isDarkMode ? '#e2e8f0' : '#374151',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {content.description}
                </div>
              )}

              {/* d) Hashtags */}
              {content.hashtags.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '16px'
                }}>
                  {content.hashtags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: '14px',
                      color: isDarkMode ? '#60a5fa' : '#3b82f6',
                      fontWeight: '500'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* e) Call to Action */}
              {content.cta && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: isDarkMode ? '#1e40af' : '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  marginTop: '16px'
                }}>
                  {content.cta}
                </div>
              )}
            </div>
          </div>

          {/* 3. Platform/Telegram Distribution (Internal Dashboard Use Only) */}
          {selectedPlatforms.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
              borderRadius: '8px',
              border: `1px dashed ${isDarkMode ? '#60a5fa' : '#3b82f6'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <Settings style={{ height: '16px', width: '16px', color: isDarkMode ? '#60a5fa' : '#3b82f6' }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDarkMode ? '#60a5fa' : '#3b82f6'
                }}>
                  Distribution Settings (Internal Dashboard Only)
                </span>
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {selectedPlatforms.map(platformId => {
                  const platform = platforms.find(p => p.id === platformId);
                  if (!platform) return null;
                  
                  return (
                    <div key={platformId} style={{
                      padding: '6px 12px',
                      backgroundColor: isDarkMode ? '#1e293b' : 'white',
                      border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: isDarkMode ? '#94a3b8' : '#6b7280'
                    }}>
                      {platform.name}
                    </div>
                  );
                })}
              </div>
              <div style={{
                fontSize: '11px',
                color: isDarkMode ? '#64748b' : '#9ca3af',
                fontStyle: 'italic',
                marginTop: '8px'
              }}>
                * Platform links are for internal dashboard tracking only and will not appear in the public post
              </div>
            </div>
          )}
        </div>
      )}
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
            Connected
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
          Content posts, media files, character profiles, and platform configurations are stored in Supabase. All data is encrypted and backed up automatically.
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
    fetchSupabasePosts();
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
  const fetchSupabasePosts = async () => {
    try {
      setIsLoadingPosts(true);
      const posts = await supabaseAPI.loadContentPosts();
      setSavedPosts(posts);
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
      const savedPost = await supabaseAPI.saveContentPost(postData);
      
      // Update local state
      setSavedPosts(prev => [savedPost, ...prev]);
      
      alert('Content saved successfully to Supabase database!');
      
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save content. Please try again.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      const savedPost = await supabaseAPI.saveContentPost(scheduledData);
      
      setSavedPosts(prev => [savedPost, ...prev]);
      
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
      alert('Failed to save content for scheduling. Please try again.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    
    // Refresh posts list to show updated content
    fetchSupabasePosts();
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
      await supabaseAPI.deleteContentPost(postId);
      
      // Remove from local state
      setSavedPosts(prev => prev.filter(post => post.id !== postId));
      
      alert('Content deleted successfully.');
      
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete content. Please try again.');
    }
  };

  const tabs = [
    { id: 'create', label: 'Create New Content', icon: Edit3 },
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

          {activeTab === 'supabase' && <SupabaseConnection />}
        </div>
      </div>
    </div>
  );
}
