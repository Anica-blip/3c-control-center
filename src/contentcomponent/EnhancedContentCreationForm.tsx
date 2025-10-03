import React, { useState, useRef, useEffect, useContext } from 'react';
import { Upload, X, Image, Video, FileText, Settings, ExternalLink, Plus, User, Eye, Edit3, Calendar, Trash2 } from 'lucide-react';
import { ContentPost, MediaFile, SocialPlatform, CharacterProfile } from './types';
import { SavedPostsList } from './SavedPostsList';
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
// ADD NEW IMPORT FOR TEMPLATE LIBRARY INTEGRATION
import { PendingLibraryTemplate, templateEventEmitter } from './TemplateLibrary';
// ADD i18n IMPORT
import { useI18n } from '../i18n';

// Theme Context (assuming this comes from your App.tsx)
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

// Enhanced Content Creation Form - WITH i18n INTEGRATION
const EnhancedContentCreationForm = ({ 
  onSave, 
  onAddToSchedule, 
  characterProfiles, 
  platforms,
  isSaving,
  isLoadingProfiles,
  editingPost,
  onEditComplete,
  loadedTemplate,
  onTemplateLoaded
}: {
  onSave: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  onAddToSchedule: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  characterProfiles: CharacterProfile[];
  platforms: SocialPlatform[];
  isSaving?: boolean;
  isLoadingProfiles?: boolean;
  editingPost?: ContentPost | null;
  onEditComplete?: () => void;
  // ADD THESE NEW PROPS FOR TEMPLATE LIBRARY INTEGRATION:
  loadedTemplate?: PendingLibraryTemplate | null;
  onTemplateLoaded?: () => void;
}) => {
  const { isDarkMode } = useTheme();
  // ADD i18n HOOK
  const { t } = useI18n();

// Platform state management - separate from props
  const [loadedPlatforms, setLoadedPlatforms] = useState<SocialPlatform[]>([]);
  const [isLoadingPlatformsState, setIsLoadingPlatformsState] = useState(false);

  // Load platforms on mount
  useEffect(() => {
    const loadPlatformsFromSupabase = async () => {
      try {
        setIsLoadingPlatformsState(true);
    
    // Load both platforms and Telegram channels concurrently
    const [supabasePlatforms, telegramChannels] = await Promise.all([
      supabaseAPI.loadPlatforms(),
      supabaseAPI.loadTelegramChannels()
    ]);
    
    console.log('Loaded platforms from Supabase:', supabasePlatforms);
    console.log('Loaded Telegram channels from Supabase:', telegramChannels);
    
    // Transform Telegram channels to platform format
    const telegramPlatforms = telegramChannels
      .filter(t => t && t.id && t.name) // Ensure valid data
      .map(t => ({
        id: t.id.toString(),
        name: `${t.name} (Telegram)`,
        url: t.channel_group_id ? `https://t.me/${t.channel_group_id}` : '',
        platform_icon: 'TG', // FIXED: Add platform_icon
        type: t.thread_id ? 'telegram_group' : 'telegram_channel', // FIXED: Add type
        isActive: true,
        isDefault: false
      }));
    
    // Merge platforms and Telegram channels
    const allPlatforms = [...supabasePlatforms, ...telegramPlatforms];
    
    console.log('Combined platforms and Telegram channels:', allPlatforms);
    setLoadedPlatforms(allPlatforms);
  } catch (error) {
    console.error('Error loading platforms and Telegram channels from Supabase:', error);
    // Use prop platforms as fallback only if Supabase fails
    setLoadedPlatforms(platforms || []);
  } finally {
    setIsLoadingPlatformsState(false);
      }
    };

    loadPlatformsFromSupabase();
  }, []); // Remove dependency on platforms to avoid loops

  // Use loaded platforms, fallback to props if nothing loaded
  const activePlatforms = loadedPlatforms.length > 0 
    ? loadedPlatforms.filter(p => p?.isActive) 
    : (platforms?.filter(p => p?.isActive) || []);
  
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
  // ADD NEW STATE FOR TEMPLATE HANDLING:
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [fieldConfig, setFieldConfig] = useState<any>(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TELEGRAM VALIDATION HELPER FUNCTIONS - ADDED FROM CORRECTED CODE
  const isTelegramSelected = () => {
    return selectedPlatforms
      .map(platformId => activePlatforms.find(p => p.id === platformId))
      .some(p => p && p.name && p.name.toLowerCase().includes('telegram'));
  };

  const getPrimaryTelegramUrl = () => {
    // Checks detailedPlatforms for a Telegram URL, else checks mediaFiles for a url type
    const telegramPlatform = selectedPlatforms
      .map(platformId => activePlatforms.find(p => p.id === platformId))
      .find(p => p && p.name && p.name.toLowerCase().includes('telegram'));
    return telegramPlatform?.url || null;
  };
  
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

  // FIXED ISSUE #2: Added no_media option
  const getMediaCodeLocal = (value: string) => {
    const codes: Record<string, string> = {
      'no_media': 'NM', // NEW: No media option
      'image': 'IM', 
      'video': 'VD', 
      'gifs': 'GF', 
      'pdf': 'PF',
      'interactive_media': 'IM', 
      'url_link': 'UL'
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

  // FIXED ISSUE #3: Platform symbol - DATABASE COLUMN ONLY (no name parsing)
  const getPlatformSymbol = (platform: any) => {
    // Return platform_icon column value ONLY - no fallbacks
    return platform.platform_icon || '??';
  };

  // FIXED ISSUE #3: Colour detection - DATABASE COLUMNS ONLY (platform_icon + type)
  const getPlatformColor = (platform: any) => {
    // Use type column for Telegram colour distinction
    if (platform.type === 'telegram_group') {
      return '#f97316'; // Orange for groups
    }
    if (platform.type === 'telegram_channel') {
      return '#3b82f6'; // Blue for channels
    }
    
    // Use platform_icon for all other platform colours
    const icon = platform.platform_icon;
    if (icon === 'TG') return '#3b82f6'; // Telegram default
    if (icon === 'IG') return '#E4405F'; // Instagram
    if (icon === 'FB') return '#1877F2'; // Facebook
    if (icon === 'LI') return '#0A66C2'; // LinkedIn
    if (icon === 'TW') return '#000000'; // Twitter/X
    if (icon === 'YT') return '#FF0000'; // YouTube
    if (icon === 'TK') return '#000000'; // TikTok
    if (icon === 'PT') return '#BD081C'; // Pinterest
    if (icon === 'WA') return '#25D366'; // WhatsApp
    if (icon === 'FR') return '#4b5563'; // Forum
    if (icon === 'DS') return '#5865F2'; // Discord
    
    return '#6b7280'; // Default grey
  };

  // FIXED ISSUE #3: Type detection - DATABASE COLUMN ONLY (no name parsing)
  const getPlatformType = (platform: any) => {
    // Return type column value ONLY - no fallbacks
    return platform.type || 'other';
  };

  // Create detailed platforms array with full info including platform_icon and type
  const createDetailedPlatforms = (selectedPlatformIds: string[]) => {
    return selectedPlatformIds.map(platformId => {
      const platform = activePlatforms.find(p => p.id === platformId);
      if (!platform) return null;
      
      return {
        id: platform.id,
        name: platform.name,
        url: platform.url || '',
        platform_icon: platform.platform_icon || getPlatformSymbol(platform), // FIXED: Include platform_icon
        type: platform.type || getPlatformType(platform), // FIXED: Include type
        symbol: getPlatformSymbol(platform),
        color: getPlatformColor(platform),
        isActive: platform.isActive,
        isDefault: platform.isDefault
      };
    }).filter(Boolean); // Remove null entries
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

  // Platform-specific preview sizing - FIXED ALL PLATFORMS
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
        aspectRatio: 'auto', // Use original media dimensions
        maxWidth: '100%', // Allow full width flexibility
        label: 'Telegram Post (Original Size)'
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
      aspectRatio: '16 / 9', // Changed from 'auto' to 16:9 default
      maxWidth: '600px', // Changed from '100%' to larger default
      label: 'Standard Format (16:9)'
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

  // Initialise and update content ID based on selections
  useEffect(() => {
    const newId = generateContentId();
    setContentId(newId);
  }, [selections.theme, selections.audience, selections.mediaType, selections.templateType, selections.characterProfile, selections.voiceStyle, characterProfiles]);

  // FIXED: Listen for templates sent from Template Library (DIRECT EVENT COMMUNICATION)
  useEffect(() => {
    const unsubscribe = templateEventEmitter.listen((template) => {
      console.log('=== TEMPLATE RECEIVED FROM TEMPLATE LIBRARY ===');
      console.log('Template data:', template);
      
      // Set form data from template
      setSelections({
        characterProfile: template.character_profile || '',
        theme: template.theme || '',
        audience: template.audience || '',
        mediaType: template.media_type || '',
        templateType: template.template_type || '',
        platform: template.platform || '',
        voiceStyle: template.voiceStyle || ''
      });
      
      setContent({
        title: template.title || '',
        description: template.description || '',
        hashtags: template.hashtags || [],
        keywords: template.keywords || '',
        cta: template.cta || ''
      });
      
      if (template.selected_platforms) {
        setSelectedPlatforms(template.selected_platforms);
      }
      
      setIsEditingTemplate(true);
      setupPlatformFields(template.platform);
      
      console.log('Template loaded into form successfully!');
    });

    return unsubscribe; // Cleanup event listener
  }, []);

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

  // UPDATED USEEFFECT FOR TEMPLATE LOADING - TEXT ONLY, NO MEDIA FILES
  useEffect(() => {
    if (loadedTemplate && !editingPost) { // Don't load template if editing a post
      console.log('=== LOADING TEMPLATE INTO FORM ===');
      console.log('Template data:', loadedTemplate);
      console.log('Available character profiles:', characterProfiles);
      
      // FIND MATCHING CHARACTER PROFILE BY NAME OR ID
      let matchedCharacterProfileId = '';
      if (loadedTemplate.character_profile) {
        console.log('Looking for character profile:', loadedTemplate.character_profile);
        
        // Try to find by ID first
        let matchedProfile = characterProfiles.find(p => p.id === loadedTemplate.character_profile);
        
        // If not found by ID, try to find by name (case insensitive)
        if (!matchedProfile) {
          matchedProfile = characterProfiles.find(p => 
            p.name.toLowerCase() === loadedTemplate.character_profile?.toLowerCase()
          );
        }
        
        // If still not found, try to find by username
        if (!matchedProfile) {
          matchedProfile = characterProfiles.find(p => 
            p.username.toLowerCase() === loadedTemplate.character_profile?.toLowerCase()
          );
        }
        
        if (matchedProfile) {
          matchedCharacterProfileId = matchedProfile.id;
          console.log('✓ Found matching character profile:', matchedProfile.name, 'ID:', matchedProfile.id);
        } else {
          console.log('✗ Could not find matching character profile for:', loadedTemplate.character_profile);
          console.log('Available profiles:', characterProfiles.map(p => `${p.name} (${p.id})`));
        }
      }
      
      // POPULATE SELECTIONS (dropdown fields)
      setSelections({
        characterProfile: matchedCharacterProfileId, // Use the matched ID
        theme: loadedTemplate.theme || '',
        audience: loadedTemplate.audience || '',
        mediaType: loadedTemplate.media_type || '',
        templateType: loadedTemplate.template_type || '',
        platform: loadedTemplate.platform || '',
        voiceStyle: loadedTemplate.voiceStyle || ''
      });
      
      // POPULATE CONTENT (text fields only)
      setContent({
        title: loadedTemplate.title || '',
        description: loadedTemplate.description || '',
        hashtags: Array.isArray(loadedTemplate.hashtags) ? loadedTemplate.hashtags : [],
        keywords: loadedTemplate.keywords || '',
        cta: loadedTemplate.cta || ''
      });
      
      // DO NOT LOAD MEDIA FILES - USER SPECIFIED TEXT ONLY
      // setMediaFiles remains empty - user will add media manually if needed
      
      // SET TEMPLATE EDITING STATE
      setIsEditingTemplate(true);
      setupPlatformFields(loadedTemplate.platform);
      
      // CLEAR THE LOADED TEMPLATE STATE
      if (onTemplateLoaded) {
        onTemplateLoaded();
      }
      
      console.log('✓ Template loaded successfully into form (text only)');
      console.log('Selections populated:', {
        characterProfile: matchedCharacterProfileId,
        theme: loadedTemplate.theme,
        audience: loadedTemplate.audience,
        mediaType: loadedTemplate.media_type,
        templateType: loadedTemplate.template_type,
        platform: loadedTemplate.platform,
        voiceStyle: loadedTemplate.voiceStyle
      });
    }
  }, [loadedTemplate, editingPost, onTemplateLoaded, characterProfiles]);

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

  // FIXED: Smart URL type detection and proper preview handling
  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    
    console.log('Adding URL:', urlInput.trim());
    
    try {
      // Validate and clean URL
      let url = urlInput.trim();
      
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Validate URL format
      let urlObj;
      try {
        urlObj = new URL(url);
      } catch (urlError) {
        console.error('Invalid URL format:', url);
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
      
      const hostname = urlObj.hostname;
      let urlType = 'url_link'; // Default type
      let displayName = urlTitle || 'URL Link';
      
      // Classify URL type based on domain and content
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        urlType = 'video';
        displayName = urlTitle || 'YouTube Video';
      } else if (hostname.includes('github.com')) {
        urlType = 'url_link';
        displayName = urlTitle || 'GitHub Repository';
      } else if (url.includes('anica-blip.github.io/3c-smpost-generator')) {
        urlType = 'interactive';
        displayName = urlTitle || 'Interactive Content';
      } else if (hostname.includes('codepen.io') || hostname.includes('jsfiddle.net') || 
                 hostname.includes('repl.it') || hostname.includes('glitch.com')) {
        urlType = 'interactive';
        displayName = urlTitle || 'Interactive Demo';
      } else if (url.toLowerCase().includes('.pdf')) {
        urlType = 'pdf';
        displayName = urlTitle || 'PDF Document';
      } else {
        // Regular website
        urlType = 'url_link';
        displayName = urlTitle || 'Website Link';
      }
      
      console.log('Detected URL type:', urlType, 'for', hostname);
      
      // Fetch URL preview with error handling
      let urlPreview = null;
      try {
        console.log('Fetching URL preview...');
        urlPreview = await fetchUrlPreview(url);
        console.log('URL preview result:', urlPreview);
        
        // Update display name if we got a better title from preview
        if (urlPreview?.title && !urlTitle) {
          displayName = urlPreview.title;
        }
        
      } catch (error) {
        console.error('URL preview failed:', error);
        // Continue without preview - this is not a critical error
      }
      
      const newUrlFile: MediaFile = {
        id: Date.now().toString() + Math.random(),
        name: displayName,
        type: urlType,
        size: 0, // URLs don't have file size
        url: url,
        urlPreview: urlPreview
      };
      
      console.log('Adding URL file:', newUrlFile);
      
      setMediaFiles(prev => [...prev, newUrlFile]);
      setUrlInput('');
      setUrlTitle('');
      
    } catch (error) {
      console.error('Error adding URL:', error);
      alert('Failed to add URL. Please check the URL format and try again.');
    }
  };

  // FIXED: Proper reset function that clears ALL state
  const resetForm = () => {
    console.log('Resetting form...');
    
    // Clear all selections
    setSelections({
      characterProfile: '',
      theme: '',
      audience: '',
      mediaType: '',
      templateType: '',
      platform: '',
      voiceStyle: ''
    });
    
    // Clear all content
    setContent({
      title: '',
      description: '',
      hashtags: [],
      keywords: '',
      cta: ''
    });
    
    // FIXED: Clear media files and revoke object URLs to prevent memory leaks
    mediaFiles.forEach(file => {
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
    setMediaFiles([]);
    
    // Clear platform selections
    setSelectedPlatforms([]);
    
    // Reset states
    setIsEditingPost(false);
    setIsEditingTemplate(false);
    setFieldConfig(null);
    
    // Clear URL inputs
    setUrlInput('');
    setUrlTitle('');
    setHashtagInput('');
    
    // Generate new content ID
    setContentId(generateContentId());
    
    console.log('Form reset complete');
  };

  // UPDATED SAVE HANDLER WITH TELEGRAM VALIDATION AND TEMPLATE INTEGRATION
  const handleSave = async () => {
    // TELEGRAM URL VALIDATION - ADDED FROM CORRECTED CODE
    if (isTelegramSelected()) {
      const telegramUrl = getPrimaryTelegramUrl();
      if (!telegramUrl) {
        alert('A Telegram URL is required for Telegram posts. Please select a Telegram channel/group that has a valid URL.');
        return;
      }
    }
    
    // Create detailed platforms array with full info
    const detailedPlatforms = createDetailedPlatforms(selectedPlatforms);
    
    const postData = {
      contentId,
      ...selections,
      ...content,
      mediaFiles,
      selectedPlatforms,
      detailedPlatforms, // Add detailed platform info
      status: 'pending' as const,
      isFromTemplate: isEditingTemplate, // CHANGED: Use template status
      sourceTemplateId: loadedTemplate?.source_template_id || loadedTemplate?.template_id // ADDED
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

  // UPDATED ADD TO SCHEDULE HANDLER WITH TELEGRAM VALIDATION AND TEMPLATE INTEGRATION
  const handleAddToSchedule = async () => {
    // TELEGRAM URL VALIDATION - ADDED FROM CORRECTED CODE
    if (isTelegramSelected()) {
      const telegramUrl = getPrimaryTelegramUrl();
      if (!telegramUrl) {
        alert('A Telegram URL is required for Telegram posts. Please select a Telegram channel/group that has a valid URL.');
        return;
      }
    }
    
    // Create detailed platforms array with full info
    const detailedPlatforms = createDetailedPlatforms(selectedPlatforms);
    
    const postData = {
      contentId,
      ...selections,
      ...content,
      mediaFiles,
      selectedPlatforms,
      detailedPlatforms, // Add detailed platform info
      status: 'scheduled' as const,
      isFromTemplate: isEditingTemplate, // CHANGED: Use template status
      sourceTemplateId: loadedTemplate?.source_template_id || loadedTemplate?.template_id // ADDED
    };

    try {
      await onAddToSchedule(postData);
      resetForm();
    } catch (error) {
      console.error('Schedule failed:', error);
      alert('Failed to schedule post. Your content is preserved.');
    }
  };

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
      {/* UPDATED HEADER SECTION WITH TEMPLATE STATUS */}
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
              {/* FIXED ISSUE #1: UK English */}
              {isEditingPost ? `Editing post: ${contentId}` :
               isEditingTemplate ? `Working from template` :
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
          // FIXED ISSUE #2: Added no_media to options
          { field: 'mediaType', label: 'Media Type *', options: [
            'no_media', 'image', 'video', 'gifs', 'pdf', 'interactive_media', 'url_link'
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
              <option value="">{field === 'platform' ? 'Generic (no optimisation)...' : `Select ${label.toLowerCase().replace(' *', '')}...`}</option>
              {options.map(option => (
                <option key={option} value={option}>
                  {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        ))}
        
        {/* FIXED ISSUE #1: UK English - "Optimise" not "Optimize" */}
        {/* Platform Optimisation Selector */}
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
            Optimise For Platform
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
            <option value="">Generic (no optimisation)...</option>
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

      {/* FIXED ISSUE #1: UK English - "Optimisation" not "Optimization" */}
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
            Platform Optimisation: {selections.platform?.toUpperCase()}
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

{/* FIXED ISSUE #1: UK English throughout all content fields */}
{/* CONTENT FIELDS - WITH i18n */}
<div style={{ 
  display: 'grid', 
  gap: '16px', 
  marginBottom: '24px',
  width: '85%'
}}>
  {/* TITLE FIELD - WITH i18n */}
  {(!fieldConfig || fieldConfig.title?.show !== false) && (
    <div>
      <label style={{
        display: 'block',
        fontSize: '16px',
        fontWeight: '600',
        color: isDarkMode ? '#f8fafc' : '#111827',
        marginBottom: '8px'
      }}>
        {t('content.titleHeadline')}
      </label>
      
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
          {t('content.ukEnglish')} | {t('content.formatting')} {t('content.bold')}
        </div>
      </div>
      
      <input
        type="text"
        value={content.title}
        onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
        placeholder={t('content.titlePlaceholder')}
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
        <span>{t('content.createHeadline')}</span>
        <span>{content.title.length}/{fieldConfig?.title?.maxLength || 150}</span>
      </div>
    </div>
  )}

  {/* DESCRIPTION FIELD - WITH i18n */}
  <div>
    <label style={{
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: isDarkMode ? '#f8fafc' : '#111827',
      marginBottom: '8px'
    }}>
      {t('content.postDescription')}
    </label>
    
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
          const commonEmojis = ['😀', '😊', '😎', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '📢', '✨', '💪', '🚀', '⭐', '💡', '🙌', '💡', '📈', '📊'];
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
        {t('content.ukEnglish')} | {t('content.formatting')} {t('content.bold')} {t('content.italic')} {t('content.underline')} {t('content.link')}
      </div>
    </div>
    
    <textarea
      value={content.description}
      onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
      placeholder={t('content.descriptionPlaceholder')}
      maxLength={fieldConfig?.description?.maxLength || 2200}
      lang="en-GB"
      spellCheck={true}
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
      <span>{t('content.engagingContent')}</span>
      <span>{content.description.length}/{fieldConfig?.description?.maxLength || 2200}</span>
    </div>
  </div>

  {/* HASHTAGS FIELD - WITH i18n */}
  <div>
    <label style={{
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: isDarkMode ? '#f8fafc' : '#111827',
      marginBottom: '8px'
    }}>
      {t('content.hashtags')}
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
          placeholder={t('content.addHashtagsPrompt')}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
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
          disabled={!hashtagInput.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: hashtagInput.trim() ? (isDarkMode ? '#60a5fa' : '#3b82f6') : (isDarkMode ? '#475569' : '#d1d5db'),
            color: hashtagInput.trim() ? 'white' : (isDarkMode ? '#64748b' : '#9ca3af'),
            border: 'none',
            borderRadius: '6px',
            cursor: hashtagInput.trim() ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'inherit'
          }}
        >
          {t('common.add')}
        </button>
      </div>
      
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
              x
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
        <span>{t('content.useHashtags')}</span>
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

  {/* SEO KEYWORDS FIELD - WITH i18n */}
  <div>
    <label style={{
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: isDarkMode ? '#f8fafc' : '#111827',
      marginBottom: '8px'
    }}>
      {t('content.seoKeywords')}
    </label>
    <input
      type="text"
      value={content.keywords}
      onChange={(e) => setContent(prev => ({ ...prev, keywords: e.target.value }))}
      placeholder={t('content.keywordsPlaceholder')}
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
      {t('content.keywordsOptional')}
    </div>
  </div>

  {/* CALL TO ACTION FIELD - WITH i18n */}
  <div>
    <label style={{
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: isDarkMode ? '#f8fafc' : '#111827',
      marginBottom: '8px'
    }}>
      {t('content.cta')}
    </label>
    <input
      type="text"
      value={content.cta}
      onChange={(e) => setContent(prev => ({ ...prev, cta: e.target.value }))}
      placeholder={t('content.ctaPlaceholder')}
      maxLength={100}
      lang="en-GB"
      spellCheck={true}
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
      <span>{t('content.clearAction')}</span>
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

      {/* UPDATED ACTION BUTTONS WITH TEMPLATE INTEGRATION */}
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
          {isSaving ? 'Saving...' : 
           isEditingPost ? 'Update Draft' : 
           isEditingTemplate ? 'Save Template as Post' : 'Save as Draft'}
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
      
      {/* FIXED ISSUE #1 & #3: UK English + Platform icon/type usage in Live Preview */}
      {/* Live Preview Section - Shows Exact Final Post Format */}
      {(selections.characterProfile || content.title || content.description || mediaFiles.length > 0) && (
        <div style={{
          marginTop: '32px',
          padding: '24px',
          backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
          borderRadius: '12px',
          border: `2px solid ${isDarkMode ? '#3b82f6' : '#3b82f6'}`,
          boxShadow: isDarkMode ? '0 8px 32px rgba(59, 130, 246, 0.15)' : '0 8px 32px rgba(59, 130, 246, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <Eye style={{ height: '24px', width: '24px', color: '#3b82f6' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#3b82f6',
              margin: '0'
            }}>
              Live Preview - Final Post Format
            </h3>
            <div style={{
              fontSize: '12px',
              color: isDarkMode ? '#e2e8f0' : '#6b7280',
              fontStyle: 'italic',
              marginLeft: 'auto'
            }}>
              This is the exact format when the post is published
            </div>
          </div>
          
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#3b82f6' : '#e5e7eb'}`,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            {/* 1. Media Files Preview - Platform Responsive with URL Preview Support */}
            {mediaFiles.length > 0 && (
              <div style={{
                padding: '16px',
                backgroundColor: isDarkMode ? '#f8fafc' : '#f9fafb',
                borderBottom: `1px solid ${isDarkMode ? '#e5e7eb' : '#e5e7eb'}`
              }}>
                {/* FIXED ISSUE #1: UK English - "Optimised" */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  padding: '8px 12px',
                  backgroundColor: isDarkMode ? '#3b82f6' : '#e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? 'white' : '#374151'
                }}>
                  <Eye style={{ height: '14px', width: '14px' }} />
                  {selections.platform ? (
                    <span>Platform Preview: {selections.platform.toUpperCase()} - Optimised Size</span>
                  ) : (
                    <span>Generic preview (no platform optimisation selected)</span>
                  )}
                </div>

                {(() => {
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
                        color: '#3b82f6',
                        fontWeight: '600',
                        textAlign: 'center',
                        padding: '4px 12px',
                        backgroundColor: isDarkMode ? 'white' : '#dbeafe',
                        borderRadius: '12px'
                      }}>
                        {platformStyle.label}
                      </div>

                      {/* Media Grid with Platform-Specific Sizing */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: mediaFiles.length === 1 
                          ? '1fr' 
                          : selections.platform === 'tiktok' || selections.platform === 'pinterest'
                            ? 'repeat(auto-fit, minmax(150px, 200px))'
                            : 'repeat(auto-fit, minmax(200px, 300px))',
                        gap: '12px',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: selections.platform ? platformStyle.maxWidth : '100%'
                      }}>
                        {mediaFiles.slice(0, 4).map((file, index) => (
                          <div key={file.id} style={{
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            border: `2px solid #3b82f6`,
                            aspectRatio: selections.platform ? platformStyle.aspectRatio : 'auto',
                            width: selections.platform ? '100%' : 'auto',
                            maxWidth: selections.platform ? platformStyle.maxWidth : '300px',
                            margin: '0 auto',
                            minHeight: selections.platform ? '200px' : 'auto'
                          }}>
                            {file.type === 'image' || file.type === 'gif' ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: selections.platform ? 'cover' : 'contain',
                                  backgroundColor: 'white'
                                }}
                              />
                            ) : file.type === 'video' ? (
                              <video
                                src={file.url}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: selections.platform ? 'cover' : 'contain',
                                  backgroundColor: 'white'
                                }}
                                controls
                                muted
                              />
                            ) : file.size === 0 && file.url ? (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                {file.urlPreview?.image ? (
                                  <div style={{
                                    flex: 1,
                                    backgroundImage: `url(${file.urlPreview.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0
                                  }} />
                                ) : (
                                  <div style={{
                                    flex: 1,
                                    backgroundColor: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '48px',
                                    color: '#3b82f6'
                                  }}>
                                    🌐
                                  </div>
                                )}
                                
                                <div style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                  padding: '12px',
                                  color: 'white'
                                }}>
                                  <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    marginBottom: '4px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {file.urlPreview?.title || file.name}
                                  </div>
                                  <div style={{
                                    fontSize: '11px',
                                    opacity: 0.9,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {(() => {
                                      try {
                                        return file.urlPreview?.siteName || new URL(file.url).hostname;
                                      } catch {
                                        return file.url;
                                      }
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '16px',
                                backgroundColor: 'white'
                              }}>
                                {getFileIcon(file.type)}
                                <span style={{
                                  fontSize: '12px',
                                  color: '#374151',
                                  textAlign: 'center',
                                  fontWeight: '500'
                                }}>
                                  {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                                </span>
                                <span style={{
                                  fontSize: '10px',
                                  color: '#6b7280',
                                  textAlign: 'center'
                                }}>
                                  {file.type.toUpperCase()}
                                </span>
                              </div>
                            )}
                            
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

                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              backgroundColor: 'rgba(59, 130, 246, 0.9)',
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

                      {/* FIXED ISSUE #1: UK English - "optimises", "favours" */}
                      {selections.platform && (
                        <div style={{
                          fontSize: '11px',
                          color: '#6b7280',
                          textAlign: 'center',
                          fontStyle: 'italic',
                          maxWidth: '500px',
                          lineHeight: '1.4',
                          padding: '8px 16px',
                          backgroundColor: isDarkMode ? 'white' : '#f3f4f6',
                          borderRadius: '6px'
                        }}>
                          {selections.platform === 'instagram' && 'Instagram will crop images to square format for feed posts. Stories use 9:16 ratio.'}
                          {selections.platform === 'tiktok' && 'TikTok optimises for vertical 9:16 video format for maximum engagement.'}
                          {selections.platform === 'youtube' && 'YouTube thumbnails work best at 16:9 ratio with bold, readable visuals.'}
                          {selections.platform === 'facebook' && 'Facebook recommends 1.91:1 ratio for optimal feed display and engagement.'}
                          {selections.platform === 'twitter' && 'Twitter displays images best at 16:9 ratio in timeline feeds.'}
                          {selections.platform === 'linkedin' && 'LinkedIn professional posts perform well with 1.91:1 landscape format.'}
                          {selections.platform === 'telegram' && 'Telegram displays media in original dimensions and automatically adjusts for optimal viewing.'}
                          {selections.platform === 'pinterest' && 'Pinterest favours vertical 2:3 pins for discovery and engagement.'}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. Post Content */}
            <div style={{ padding: '20px', backgroundColor: 'white' }}>
              {selections.characterProfile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `1px solid #e5e7eb`
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
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          color: '#3b82f6',
                          fontWeight: 'bold',
                          border: `2px solid #3b82f6`,
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
                            color: '#111827',
                            marginBottom: '2px'
                          }}>
                            {selectedProfile.name}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            marginBottom: '2px'
                          }}>
                            {selectedProfile.username}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#3b82f6',
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

              {content.title && (
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 12px 0',
                  lineHeight: '1.3'
                }}>
                  {content.title}
                </h4>
              )}

              {content.description && (
                <div style={{
                  fontSize: '15px',
                  color: '#374151',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {content.description}
                </div>
              )}

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
                      color: '#3b82f6',
                      fontWeight: '500'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {content.cta && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#3b82f6',
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

          {/* FIXED ISSUE #3: Platform badges using platform_icon and type columns */}
          {selectedPlatforms.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              border: `1px dashed #3b82f6`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <Settings style={{ height: '16px', width: '16px', color: '#3b82f6' }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#3b82f6'
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
                  const platform = activePlatforms.find(p => p.id === platformId);
                  if (!platform) return null;
                  
                  // FIXED ISSUE #3: Use platform_icon and type columns for display
                  const platformSymbol = getPlatformSymbol(platform);
                  const platformColor = getPlatformColor(platform);
                  
                  return (
                    <div key={platformId} style={{
                      padding: '6px 12px',
                      backgroundColor: platformColor,
                      border: `1px solid ${platformColor}`,
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {platformSymbol}
                      </span>
                      {platform.name}
                    </div>
                  );
                })}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#9ca3af',
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

export { EnhancedContentCreationForm };

