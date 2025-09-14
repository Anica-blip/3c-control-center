import { MediaFile } from './types';

// Generate a simple text-based preview image using canvas
export const generateTextPreviewImage = (title: string, description: string): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    canvas.width = 400;
    canvas.height = 200;
    
    // Background
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const maxWidth = canvas.width - 40;
    const words = title.split(' ');
    let line = '';
    let y = canvas.height * 0.4;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[n] + ' ';
        y += 25;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);
    
    // Description
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = '#94a3b8';
    
    const descWords = description.split(' ').slice(0, 8).join(' ');
    ctx.fillText(descWords, canvas.width / 2, canvas.height * 0.75);
    
    return canvas.toDataURL('image/png');
    
  } catch (error) {
    console.error('Error generating preview image:', error);
    return '';
  }
};

// Internal URL Preview System with AllOrigins (CORS-free)
export const fetchUrlPreview = async (url: string): Promise<MediaFile['urlPreview']> => {
  try {
    // Validate URL first
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Default preview object
    const preview: MediaFile['urlPreview'] = {
      title: 'External Link',
      description: 'Click to visit',
      image: null,
      siteName: hostname
    };

    // Domain-specific previews FIRST (keep existing logic)
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      preview.title = 'YouTube Video';
      preview.description = 'Video content from YouTube';
      preview.siteName = 'YouTube';
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (videoIdMatch) {
        preview.image = `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
      }
      return preview;
    }
    
    if (hostname.includes('github.com')) {
      preview.title = 'GitHub Repository';
      preview.description = 'Source code repository';
      preview.siteName = 'GitHub';
      preview.image = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
      return preview;
    }
    
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      preview.title = 'Twitter/X Post';
      preview.description = 'Social media post';
      preview.siteName = 'Twitter/X';
      return preview;
    }
    
    if (hostname.includes('linkedin.com')) {
      preview.title = 'LinkedIn Post';
      preview.description = 'Professional social media content';
      preview.siteName = 'LinkedIn';
      return preview;
    }

    // Your custom SM generator URLs
    if (url.includes('anica-blip.github.io/3c-smpost-generator') && url.includes('?')) {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      preview.title = decodeURIComponent(urlParams.get('title') || 'Interactive Content');
      preview.description = decodeURIComponent(urlParams.get('desc') || 'Engage with this interactive content');
      preview.siteName = '3C Thread To Success';
      preview.image = generateTextPreviewImage(preview.title, preview.description);
      return preview;
    }

    // For all other websites - use AllOrigins to bypass CORS
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.contents) {
        const doc = new DOMParser().parseFromString(data.contents, 'text/html');
        
        // Extract Open Graph and meta tags
        const title = doc.querySelector("meta[property='og:title']")?.getAttribute('content')
          || doc.querySelector("title")?.textContent
          || 'External Link';
          
        const description = doc.querySelector("meta[property='og:description']")?.getAttribute('content')
          || doc.querySelector("meta[name='description']")?.getAttribute('content')
          || 'Click to visit';
          
        const image = doc.querySelector("meta[property='og:image']")?.getAttribute('content')
          || null;
          
        const siteName = doc.querySelector("meta[property='og:site_name']")?.getAttribute('content')
          || hostname;

        preview.title = title.trim();
        preview.description = description.trim();
        preview.siteName = siteName;
        
        if (image && !image.startsWith('http')) {
          preview.image = new URL(image, url).href;
        } else {
          preview.image = image;
        }
      }
    } catch (fetchError) {
      console.log('AllOrigins fetch failed for:', hostname, fetchError);
      // Keep default preview values
    }

    return preview;
    
  } catch (error) {
    console.error('Error creating URL preview:', error);
    return {
      title: 'External Link',
      description: 'Click to visit',
      image: null,
      siteName: 'External Site'
    };
  }
};

// Content ID generation functions
export const getThemeCode = (value: string) => {
  const codes: Record<string, string> = {
    'news_alert': 'NA', 'promotion': 'PR', 'standard_post': 'SP',
    'cta_quiz': 'QZ', 'cta_game': 'GA', 'cta_puzzle': 'PZ',
    'cta_challenge': 'CH', 'news': 'NS', 'blog': 'BP',
    'tutorial_guide': 'TG', 'course_tool': 'CT', 'assessment': 'AS'
  };
  return codes[value] || 'XX';
};

export const getAudienceCode = (value: string) => {
  const codes: Record<string, string> = {
    'existing_members': 'EM', 'new_members': 'NM', 'persona_falcon': 'FL',
    'persona_panther': 'PA', 'persona_wolf': 'WF', 'persona_lion': 'LI',
    'general_public': 'GP'
  };
  return codes[value] || 'XX';
};

export const getMediaCode = (value: string) => {
  const codes: Record<string, string> = {
    'image': 'IM', 'video': 'VD', 'gifs': 'GF', 'pdf': 'PF',
    'interactive_media': 'IM', 'url_link': 'UL'
  };
  return codes[value] || 'XX';
};

export const getTemplateTypeCode = (value: string) => {
  const codes: Record<string, string> = {
    'social_media': 'SM', 'presentation': 'PR', 'video_message': 'VM',
    'anica_chat': 'AC', 'blog_posts': 'BP', 'news_article': 'NA',
    'newsletter': 'NL', 'email_templates': 'ET', 'custom_templates': 'CT'
  };
  return codes[value] || 'XX';
};

export const getCharacterCode = (name: string) => {
  const codes: Record<string, string> = {
    'anica': 'AN',
    'caelum': 'CA', 
    'aurion': 'AU'
  };
  return codes[name.toLowerCase()] || 'XX';
};

export const getVoiceStyleCode = (value: string) => {
  const codes: Record<string, string> = {
    'casual': 'CS',
    'friendly': 'FR',
    'professional': 'PR',
    'creative': 'CR'
  };
  return codes[value] || 'XX';
};
