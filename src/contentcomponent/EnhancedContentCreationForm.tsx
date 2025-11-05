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

// MARKDOWN PARSER FUNCTION - Converts markdown to JSX elements
const parseMarkdownToJSX = (text: string): React.ReactNode => {
  if (!text) return null;
  
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;
    
    const patterns = [
      { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
      { regex: /\*\*([^*]+)\*\*/g, type: 'bold' },
      { regex: /__([^_]+)__/g, type: 'underline' },
      { regex: /(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, type: 'italic' }
    ];
    
    const matches: Array<{ index: number; length: number; type: string; content: string; url?: string }> = [];
    
    patterns.forEach(({ regex, type }) => {
      let match;
      const localRegex = new RegExp(regex.source, regex.flags);
      
      while ((match = localRegex.exec(line)) !== null) {
        if (type === 'link') {
          matches.push({
            index: match.index,
            length: match[0].length,
            type: 'link',
            content: match[1],
            url: match[2]
          });
        } else {
          matches.push({
            index: match.index,
            length: match[0].length,
            type,
            content: match[1]
          });
        }
      }
    });
    
    matches.sort((a, b) => a.index - b.index);
    
    const filteredMatches: typeof matches = [];
    let lastEndIndex = -1;
    
    matches.forEach(match => {
      if (match.index >= lastEndIndex) {
        filteredMatches.push(match);
        lastEndIndex = match.index + match.length;
      }
    });
    
    filteredMatches.forEach((match, matchIndex) => {
      if (match.index > currentIndex) {
        elements.push(
          <span key={`text-${lineIndex}-${matchIndex}`}>
            {line.substring(currentIndex, match.index)}
          </span>
        );
      }
      
      switch (match.type) {
        case 'link':
          elements.push(
            <a
              key={`link-${lineIndex}-${matchIndex}`}
              href={match.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#3b82f6',
                textDecoration: 'underline',
                fontWeight: '500'
              }}
            >
              {match.content}
            </a>
          );
          break;
        case 'bold':
          elements.push(
            <strong key={`bold-${lineIndex}-${matchIndex}`}>
              {match.content}
            </strong>
          );
          break;
        case 'italic':
          elements.push(
            <em key={`italic-${lineIndex}-${matchIndex}`}>
              {match.content}
            </em>
          );
          break;
        case 'underline':
          elements.push(
            <span
              key={`underline-${lineIndex}-${matchIndex}`}
              style={{ textDecoration: 'underline' }}
            >
              {match.content}
            </span>
          );
          break;
      }
      
      currentIndex = match.index + match.length;
    });
    
    if (currentIndex < line.length) {
      elements.push(
        <span key={`text-${lineIndex}-end`}>
          {line.substring(currentIndex)}
        </span>
      );
    }
    
    if (elements.length === 0) {
      elements.push(<span key={`line-${lineIndex}`}>{line}</span>);
    }
    
    return (
      <React.Fragment key={`line-${lineIndex}`}>
        {elements}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

// Parse markdown links into structured format for saving
const parseLinksForSaving = (text: string) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: Array<{ text: string; url: string; position: number }> = [];
  let match;
  
  while ((match = linkRegex.exec(text)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      position: match.index
    });
  }
  
  return {
    textWithoutMarkdown: text.replace(linkRegex, '$1'),
    links: links
  };
};

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
  loadedTemplate?: PendingLibraryTemplate | null;
  onTemplateLoaded?: () => void;
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useI18n();

  const [loadedPlatforms, setLoadedPlatforms] = useState<SocialPlatform[]>([]);
  const [isLoadingPlatformsState, setIsLoadingPlatformsState] = useState(false);

  useEffect(() => {
    const loadPlatformsFromSupabase = async () => {
      try {
        setIsLoadingPlatformsState(true);
    
    const [supabasePlatforms, telegramChannels] = await Promise.all([
      supabaseAPI.loadPlatforms(),
      supabaseAPI.loadTelegramChannels()
    ]);
    
    console.log('Loaded platforms from Supabase:', supabasePlatforms);
    console.log('Loaded Telegram channels from Supabase:', telegramChannels);
    
    const telegramPlatforms = telegramChannels
      .filter(t => t && t.id && t.name)
      .map(t => ({
        id: t.id.toString(),
        name: `${t.name} (Telegram)`,
        url: t.channel_group_id ? `https://t.me/${t.channel_group_id}` : '',
        platform_icon: 'TG',
        type: t.thread_id ? 'telegram_group' : 'telegram_channel',
        isActive: true,
        isDefault: false
      }));
    
    const allPlatforms = [...supabasePlatforms, ...telegramPlatforms];
    
    console.log('Combined platforms and Telegram channels:', allPlatforms);
    setLoadedPlatforms(allPlatforms);
  } catch (error) {
    console.error('Error loading platforms and Telegram channels from Supabase:', error);
    setLoadedPlatforms(platforms || []);
  } finally {
    setIsLoadingPlatformsState(false);
      }
    };

    loadPlatformsFromSupabase();
  }, []);

  const activePlatforms = loadedPlatforms.length > 0 
    ? loadedPlatforms.filter(p => p?.isActive) 
    : (platforms?.filter(p => p?.isActive) || []);
  
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

  const isTelegramSelected = () => {
    return selectedPlatforms
      .map(platformId => activePlatforms.find(p => p.id === platformId))
      .some(p => p && p.name && p.name.toLowerCase().includes('telegram'));
  };

  const getPrimaryTelegramUrl = () => {
    const telegramPlatform = selectedPlatforms
      .map(platformId => activePlatforms.find(p => p.id === platformId))
      .find(p => p && p.name && p.name.toLowerCase().includes('telegram'));
    return telegramPlatform?.url || null;
  };
  
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
      'no_media': 'NM',
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

  const createDetailedPlatforms = (selectedPlatformIds: string[]) => {
    return selectedPlatformIds.map(platformId => {
      const platform = activePlatforms.find(p => p.id === platformId);
      if (!platform) return null;
      
      return {
        id: platform.id,
        name: platform.name,
        url: platform.url || '',
        platform_icon: platform.platform_icon || getPlatformSymbol(platform),
        type: platform.type || getPlatformType(platform),
        symbol: getPlatformSymbol(platform),
        color: getPlatformColor(platform),
        isActive: platform.isActive,
        isDefault: platform.isDefault
      };
    }).filter(Boolean);
  };

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

  const getPlatformPreviewStyle = (platform: string) => {
    const styles = {
      instagram: {
        aspectRatio: '1 / 1',
        maxWidth: '400px',
        label: 'Instagram Square Post (1:1)'
      },
      facebook: {
        aspectRatio: '1.91 / 1',
        maxWidth: '500px', 
        label: 'Facebook Post (1.91:1)'
      },
      twitter: {
        aspectRatio: '16 / 9',
        maxWidth: '500px',
        label: 'Twitter/X Post (16:9)'
      },
      linkedin: {
        aspectRatio: '1.91 / 1',
        maxWidth: '500px',
        label: 'LinkedIn Post (1.91:1)'
      },
      youtube: {
        aspectRatio: '16 / 9',
        maxWidth: '480px',
        label: 'YouTube Thumbnail (16:9)'
      },
      tiktok: {
        aspectRatio: '9 / 16',
        maxWidth: '300px',
        label: 'TikTok Video (9:16)'
      },
      telegram: {
        aspectRatio: 'auto',
        maxWidth: '100%',
        label: 'Telegram Post (Original Size)'
      },
      pinterest: {
        aspectRatio: '2 / 3',
        maxWidth: '400px',
        label: 'Pinterest Pin (2:3)'
      },
      whatsapp: {
        aspectRatio: '16 / 9',
        maxWidth: '500px',
        label: 'WhatsApp Post (16:9)'
      }
    };
    
    return styles[platform as keyof typeof styles] || {
      aspectRatio: '16 / 9',
      maxWidth: '600px',
      label: 'Standard Format (16:9)'
    };
  };

  const generateContentId = () => {
    const theme = selections.theme ? getThemeCodeLocal(selections.theme) : 'XX';
    const audience = selections.audience ? getAudienceCodeLocal(selections.audience) : 'XX';
    const media = selections.mediaType ? getMediaCodeLocal(selections.mediaType) : 'XX';
    const template = selections.templateType ? getTemplateTypeCodeLocal(selections.templateType) : 'XX';
    
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

  useEffect(() => {
    const newId = generateContentId();
    setContentId(newId);
  }, [selections.theme, selections.audience, selections.mediaType, selections.templateType, selections.characterProfile, selections.voiceStyle, characterProfiles]);

  useEffect(() => {
    const unsubscribe = templateEventEmitter.listen((template) => {
      console.log('=== TEMPLATE RECEIVED FROM TEMPLATE LIBRARY ===');
      console.log('Template data:', template);
      
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

    return unsubscribe;
  }, []);

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

  useEffect(() => {
    if (loadedTemplate && !editingPost) {
      console.log('=== LOADING TEMPLATE INTO FORM ===');
      console.log('Template data:', loadedTemplate);
      console.log('Available character profiles:', characterProfiles);
      
      let matchedCharacterProfileId = '';
      if (loadedTemplate.character_profile) {
        console.log('Looking for character profile:', loadedTemplate.character_profile);
        
        let matchedProfile = characterProfiles.find(p => p.id === loadedTemplate.character_profile);
        
        if (!matchedProfile) {
          matchedProfile = characterProfiles.find(p => 
            p.name.toLowerCase() === loadedTemplate.character_profile?.toLowerCase()
          );
        }
        
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
      
      setSelections({
        characterProfile: matchedCharacterProfileId,
        theme: loadedTemplate.theme || '',
        audience: loadedTemplate.audience || '',
        mediaType: loadedTemplate.media_type || '',
        templateType: loadedTemplate.template_type || '',
        platform: loadedTemplate.platform || '',
        voiceStyle: loadedTemplate.voiceStyle || ''
      });
      
      setContent({
        title: loadedTemplate.title || '',
        description: loadedTemplate.description || '',
        hashtags: Array.isArray(loadedTemplate.hashtags) ? loadedTemplate.hashtags : [],
        keywords: loadedTemplate.keywords || '',
        cta: loadedTemplate.cta || ''
      });
      
      setIsEditingTemplate(true);
      setupPlatformFields(loadedTemplate.platform);
      
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

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    
    console.log('Adding URL:', urlInput.trim());
    
    try {
      let url = urlInput.trim();
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      let urlObj;
      try {
        urlObj = new URL(url);
      } catch (urlError) {
        console.error('Invalid URL format:', url);
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
      
      const hostname = urlObj.hostname;
      let urlType = 'url_link';
      let displayName = urlTitle || 'URL Link';
      
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
        urlType = 'url_link';
        displayName = urlTitle || 'Website Link';
      }
      
      console.log('Detected URL type:', urlType, 'for', hostname);
      
      let urlPreview = null;
      try {
        console.log('Fetching URL preview...');
        urlPreview = await fetchUrlPreview(url);
        console.log('URL preview result:', urlPreview);
        
        if (urlPreview?.title && !urlTitle) {
          displayName = urlPreview.title;
        }
        
      } catch (error) {
        console.error('URL preview failed:', error);
      }
      
      const newUrlFile: MediaFile = {
        id: Date.now().toString() + Math.random(),
        name: displayName,
        type: urlType,
        size: 0,
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

  const resetForm = () => {
    console.log('Resetting form...');
    
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
    
    mediaFiles.forEach(file => {
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
    setMediaFiles([]);
    
    setSelectedPlatforms([]);
    
    setIsEditingPost(false);
    setIsEditingTemplate(false);
    setFieldConfig(null);
    
    setUrlInput('');
    setUrlTitle('');
    setHashtagInput('');
    
    setContentId(generateContentId());
    
    console.log('Form reset complete');
  };

  const handleSave = async () => {
    if (isTelegramSelected()) {
      const telegramUrl = getPrimaryTelegramUrl();
      if (!telegramUrl) {
        alert('A Telegram URL is required for Telegram posts. Please select a Telegram channel/group that has a valid URL.');
        return;
      }
    }
    
    const detailedPlatforms = createDetailedPlatforms(selectedPlatforms);
    
    const parsedDescription = parseLinksForSaving(content.description);
    const parsedTitle = parseLinksForSaving(content.title);
    
    const postData = {
      contentId,
      ...selections,
      ...content,
      description: parsedDescription.textWithoutMarkdown,
      title: parsedTitle.textWithoutMarkdown,
      links: [...parsedDescription.links, ...parsedTitle.links],
      mediaFiles,
      selectedPlatforms,
      detailedPlatforms,
      status: 'pending' as const,
      isFromTemplate: isEditingTemplate,
      sourceTemplateId: loadedTemplate?.source_template_id || loadedTemplate?.template_id,
      ...(isEditingPost && editingPost?.id && { id: editingPost.id })
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
  if (isTelegramSelected()) {
    const telegramUrl = getPrimaryTelegramUrl();
    if (!telegramUrl) {
      alert('A Telegram URL is required for Telegram posts. Please select a Telegram channel/group that has a valid URL.');
      return;
    }
  }
  
  const detailedPlatforms = createDetailedPlatforms(selectedPlatforms);
  
  const parsedDescription = parseLinksForSaving(content.description);
  const parsedTitle = parseLinksForSaving(content.title);
  
  const postData = {
    contentId,
    ...selections,
    ...content,
    description: parsedDescription.textWithoutMarkdown,
    title: parsedTitle.textWithoutMarkdown,
    links: [...parsedDescription.links, ...parsedTitle.links],
    mediaFiles,
    selectedPlatforms,
    detailedPlatforms,
    status: 'scheduled' as const,
    isFromTemplate: isEditingTemplate,
    sourceTemplateId: loadedTemplate?.source_template_id || loadedTemplate?.template_id,
    ...(isEditingPost && editingPost?.id && { id: editingPost.id })
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
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827'
          }}>
            {t('content.selectCharacter')}
          </span>
        </div>

        {isLoadingProfiles ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            {t('common.loading')}...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {characterProfiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => handleSelectionChange('characterProfile', profile.id)}
                style={{
                  padding: '16px',
                  backgroundColor: selections.characterProfile === profile.id 
                    ? (isDarkMode ? '#1e3a8a30' : '#dbeafe') 
                    : (isDarkMode ? '#1e293b' : 'white'),
                  border: `2px solid ${selections.characterProfile === profile.id 
                    ? (isDarkMode ? '#60a5fa' : '#3b82f6') 
                    : (isDarkMode ? '#475569' : '#e5e7eb')}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                    fontWeight: 'bold',
                    border: `2px solid ${selections.characterProfile === profile.id 
                      ? (isDarkMode ? '#60a5fa' : '#3b82f6') 
                      : (isDarkMode ? '#475569' : '#e5e7eb')}`,
                    overflow: 'hidden'
                  }}>
                    {profile.avatar_id ? (
                      <img
                        src={profile.avatar_id}
                        alt={profile.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      profile.name.charAt(0)
                    )}
                  </div>
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isDarkMode ? '#f8fafc' : '#111827',
                      marginBottom: '2px'
                    }}>
                      {profile.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#94a3b8' : '#6b7280'
                    }}>
                      {profile.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            {t('content.theme')}
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
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <option value="">{t('content.selectTheme')}</option>
            <option value="news_alert">{t('content.newsAlert')}</option>
            <option value="promotion">{t('content.promotion')}</option>
            <option value="standard_post">{t('content.standardPost')}</option>
            <option value="cta_quiz">{t('content.ctaQuiz')}</option>
            <option value="cta_game">{t('content.ctaGame')}</option>
            <option value="cta_puzzle">{t('content.ctaPuzzle')}</option>
            <option value="cta_challenge">{t('content.ctaChallenge')}</option>
            <option value="news">{t('content.news')}</option>
            <option value="blog">{t('content.blog')}</option>
            <option value="tutorial_guide">{t('content.tutorialGuide')}</option>
            <option value="course_tool">{t('content.courseTool')}</option>
            <option value="assessment">{t('content.assessment')}</option>
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            {t('content.audience')}
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
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <option value="">{t('content.selectAudience')}</option>
            <option value="existing_members">{t('content.existingMembers')}</option>
            <option value="new_members">{t('content.newMembers')}</option>
            <option value="persona_falcon">{t('content.personaFalcon')}</option>
            <option value="persona_panther">{t('content.personaPanther')}</option>
            <option value="persona_wolf">{t('content.personaWolf')}</option>
            <option value="persona_lion">{t('content.personaLion')}</option>
            <option value="general_public">{t('content.generalPublic')}</option>
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            {t('content.mediaType')}
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
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <option value="">{t('content.selectMediaType')}</option>
            <option value="no_media">{t('content.noMedia')}</option>
            <option value="image">{t('content.image')}</option>
            <option value="video">{t('content.video')}</option>
            <option value="gifs">{t('content.gifs')}</option>
            <option value="pdf">{t('content.pdf')}</option>
            <option value="interactive_media">{t('content.interactiveMedia')}</option>
            <option value="url_link">{t('content.urlLink')}</option>
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            {t('content.templateType')}
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
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <option value="">{t('content.selectTemplateType')}</option>
            <option value="social_media">{t('content.socialMedia')}</option>
            <option value="presentation">{t('content.presentation')}</option>
            <option value="video_message">{t('content.videoMessage')}</option>
            <option value="anica_chat">{t('content.anicaChat')}</option>
            <option value="blog_posts">{t('content.blogPosts')}</option>
            <option value="news_article">{t('content.newsArticle')}</option>
            <option value="newsletter">{t('content.newsletter')}</option>
            <option value="email_templates">{t('content.emailTemplates')}</option>
            <option value="custom_templates">{t('content.customTemplates')}</option>
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            {t('content.voiceStyle')}
          </label>
          <select
            value={selections.voiceStyle}
            onChange={(e) => handleSelectionChange('voiceStyle', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isDarkMode ? '#334155' : 'white',
              color: isDarkMode ? '#f8fafc' : '#111827',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <option value="">{t('content.selectVoiceStyle')}</option>
            <option value="casual">{t('content.casual')}</option>
            <option value="friendly">{t('content.friendly')}</option>
            <option value="professional">{t('content.professional')}</option>
            <option value="creative">{t('content.creative')}</option>
          </select>
        </div>
      </div>

      <div style={{
        backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Upload style={{ height: '18px', width: '18px', color: isDarkMode ? '#60a5fa' : '#3b82f6' }} />
          {t('content.mediaFiles')}
        </h3>

        <div style={{
          border: `2px dashed ${isDarkMode ? '#475569' : '#d1d5db'}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          marginBottom: '16px',
          cursor: 'pointer'
        }}
        onClick={() => fileInputRef.current?.click()}
        >
          <Upload style={{
            height: '32px',
            width: '32px',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0 auto 12px'
          }} />
          <p style={{
            fontSize: '14px',
            color: isDarkMode ? '#f8fafc' : '#111827',
            fontWeight: '500',
            margin: '0 0 4px 0'
          }}>
            {t('content.clickToUpload')}
          </p>
          <p style={{
            fontSize: '12px',
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            margin: '0'
          }}>
            {t('content.supportedFormats')}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.gif,.html"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            style={{ display: 'none' }}
          />
        </div>

        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          borderRadius: '8px',
          padding: '16px',
          border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
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

<div style={{ 
  display: 'grid', 
  gap: '16px', 
  marginBottom: '24px',
  width: '85%'
}}>
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
        color: '#000000',
        fontFamily: 'inherit'
      }}
    />
    <div style={{
      fontSize: '12px',
      color: isDarkMode ? '#94a3b8' : '#6b7280',
      marginTop: '4px'
    }}>
      {t('content.keywordsHelp')}
    </div>
  </div>

  <div>
    <label style={{
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: isDarkMode ? '#f8fafc' : '#111827',
      marginBottom: '8px'
    }}>
      {t('content.callToAction')}
    </label>
    <input
      type="text"
      value={content.cta}
      onChange={(e) => setContent(prev => ({ ...prev, cta: e.target.value }))}
      placeholder={t('content.ctaPlaceholder')}
      maxLength={100}
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
      <span>{t('content.ctaHelp')}</span>
      <span>{content.cta.length}/100</span>
    </div>
  </div>
</div>

      <div style={{
        backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Settings style={{ height: '18px', width: '18px', color: isDarkMode ? '#60a5fa' : '#3b82f6' }} />
          {t('content.selectPlatforms')}
        </h3>

        {isLoadingPlatformsState ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            {t('common.loading')}...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px'
          }}>
            {activePlatforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              const platformSymbol = getPlatformSymbol(platform);
              const platformColor = getPlatformColor(platform);
              
              return (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  style={{
                    padding: '12px',
                    backgroundColor: isSelected 
                      ? platformColor 
                      : (isDarkMode ? '#1e293b' : 'white'),
                    border: `2px solid ${isSelected ? platformColor : (isDarkMode ? '#475569' : '#e5e7eb')}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: isSelected 
                      ? 'rgba(255,255,255,0.2)' 
                      : platformColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isSelected ? 'white' : 'white'
                  }}>
                    {platformSymbol}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isSelected ? 'white' : (isDarkMode ? '#f8fafc' : '#111827'),
                    textAlign: 'center',
                    wordBreak: 'break-word'
                  }}>
                    {platform.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedPlatforms.length > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: isDarkMode ? '#60a5fa' : '#1e40af',
              marginBottom: '8px'
            }}>
              {t('content.selectedPlatforms')}: {selectedPlatforms.length}
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {selectedPlatforms.map(platformId => {
                const platform = activePlatforms.find(p => p.id === platformId);
                if (!platform) return null;
                
                const platformSymbol = getPlatformSymbol(platform);
                const platformColor = getPlatformColor(platform);
                
                return (
                  <div key={platformId} style={{
                    padding: '4px 10px',
                    backgroundColor: platformColor,
                    border: `1px solid ${platformColor}`,
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      padding: '1px 4px',
                      borderRadius: '3px'
                    }}>
                      {platformSymbol}
                    </span>
                    {platform.name}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        paddingTop: '16px',
        borderTop: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
      }}>
        <button
          onClick={resetForm}
          disabled={isSaving}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
            borderRadius: '8px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'inherit'
          }}
        >
          {t('common.reset')}
        </button>

        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          style={{
            padding: '12px 24px',
            backgroundColor: canSave && !isSaving 
              ? (isDarkMode ? '#60a5fa' : '#3b82f6') 
              : (isDarkMode ? '#475569' : '#d1d5db'),
            color: canSave && !isSaving ? 'white' : (isDarkMode ? '#64748b' : '#9ca3af'),
            border: 'none',
            borderRadius: '8px',
            cursor: canSave && !isSaving ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isSaving ? t('common.saving') : (isEditingPost ? t('common.update') : t('common.save'))}
        </button>

        <button
          onClick={handleAddToSchedule}
          disabled={!canSave || isSaving}
          style={{
            padding: '12px 24px',
            backgroundColor: canSave && !isSaving 
              ? (isDarkMode ? '#10b981' : '#059669') 
              : (isDarkMode ? '#475569' : '#d1d5db'),
            color: canSave && !isSaving ? 'white' : (isDarkMode ? '#64748b' : '#9ca3af'),
            border: 'none',
            borderRadius: '8px',
            cursor: canSave && !isSaving ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar style={{ height: '16px', width: '16px' }} />
          {t('common.schedule')}
        </button>
      </div>

      {selectedPlatforms.length > 0 && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          borderRadius: '8px',
          border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDarkMode ? '#60a5fa' : '#3b82f6',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Eye style={{ height: '20px', width: '20px' }} />
              {t('content.previewPost')}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '13px',
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                fontWeight: '500'
              }}>
                {t('content.previewFor')}:
              </span>
              <select
                value={selections.platform}
                onChange={(e) => handleSelectionChange('platform', e.target.value)}
                style={{
                  padding: '6px 10px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: isDarkMode ? '#334155' : 'white',
                  color: isDarkMode ? '#f8fafc' : '#111827',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">{t('content.genericPreview')}</option>
                <option value="instagram">{t('content.instagram')}</option>
                <option value="facebook">{t('content.facebook')}</option>
                <option value="twitter">{t('content.twitter')}</option>
                <option value="linkedin">{t('content.linkedin')}</option>
                <option value="youtube">{t('content.youtube')}</option>
                <option value="tiktok">{t('content.tiktok')}</option>
                <option value="telegram">{t('content.telegram')}</option>
                <option value="pinterest">{t('content.pinterest')}</option>
                <option value="whatsapp">{t('content.whatsapp')}</option>
              </select>
            </div>
          </div>

          <div style={{
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
          }}>
            {(() => {
              const previewStyle = getPlatformPreviewStyle(selections.platform || 'generic');
              
              return (
                <div style={{
                  maxWidth: previewStyle.maxWidth,
                  margin: '0 auto'
                }}>
                  {mediaFiles.length > 0 && (
                    <div style={{
                      aspectRatio: previewStyle.aspectRatio !== 'auto' ? previewStyle.aspectRatio : undefined,
                      width: '100%',
                      backgroundColor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {(() => {
                        const firstMedia = mediaFiles[0];
                        if (firstMedia.type === 'image' || firstMedia.type === 'gif') {
                          return (
                            <img
                              src={firstMedia.url}
                              alt={firstMedia.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          );
                        } else if (firstMedia.type === 'video') {
                          return (
                            <video
                              src={firstMedia.url}
                              controls
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          );
                        } else {
                          return (
                            <div style={{
                              padding: '40px',
                              textAlign: 'center'
                            }}>
                              <div style={{
                                fontSize: '48px',
                                marginBottom: '12px'
                              }}>
                                {getFileIcon(firstMedia.type)}
                              </div>
                              <div style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                fontWeight: '500'
                              }}>
                                {firstMedia.name}
                              </div>
                            </div>
                          );
                        }
                      })()}
                      
                      {mediaFiles.length > 1 && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          +{mediaFiles.length - 1} {t('content.more')}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selections.platform && (
                    <div style={{
                      padding: '12px 16px',
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
                {parseMarkdownToJSX(content.title)}
              </h4>
            )}

            {content.description && (
              <div style={{
                fontSize: '15px',
                color: '#374151',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                {parseMarkdownToJSX(content.description)}
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
