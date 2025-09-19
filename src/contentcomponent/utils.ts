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

// NEW: Screenshot Service Integration
const captureScreenshot = async (url: string): Promise<string | null> => {
  try {
    const screenshotServiceUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : window.location.origin; // Adjust for production
    
    const response = await fetch(
      `${screenshotServiceUrl}/api/capture?url=${encodeURIComponent(url)}&width=400&height=200`
    );
    
    if (!response.ok) {
      throw new Error(`Screenshot service failed: ${response.status}`);
    }
    
    // Convert response to blob and create object URL
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    
    console.log('Screenshot captured successfully for:', url);
    return imageUrl;
    
  } catch (error) {
    console.error('Screenshot service error:', error);
    return null;
  }
};

// Validate if image URL is accessible
const validateImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

// Enhanced URL Preview System with Screenshot Service Integration
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

    console.log('Fetching URL preview for:', url);

    // Domain-specific previews FIRST with enhanced image handling
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      preview.title = 'YouTube Video';
      preview.description = 'Video content from YouTube';
      preview.siteName = 'YouTube';
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        // Try multiple YouTube thumbnail qualities
        const thumbnailUrls = [
          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          `https://img.youtube.com/vi/${videoId}/default.jpg`
        ];
        
        // Test each thumbnail URL until we find one that works
        for (const thumbUrl of thumbnailUrls) {
          const isValid = await validateImageUrl(thumbUrl);
          if (isValid) {
            preview.image = thumbUrl;
            break;
          }
        }
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
      preview.image = 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png';
      return preview;
    }
    
    if (hostname.includes('linkedin.com')) {
      preview.title = 'LinkedIn Post';
      preview.description = 'Professional social media content';
      preview.siteName = 'LinkedIn';
      preview.image = 'https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca';
      return preview;
    }

    if (hostname.includes('instagram.com')) {
      preview.title = 'Instagram Post';
      preview.description = 'Photo and video sharing';
      preview.siteName = 'Instagram';
      preview.image = 'https://static.cdninstagram.com/rsrc.php/v3/yt/r/30PrGfR3xhI.png';
      return preview;
    }

    if (hostname.includes('facebook.com')) {
      preview.title = 'Facebook Post';
      preview.description = 'Social media content';
      preview.siteName = 'Facebook';
      preview.image = 'https://static.xx.fbcdn.net/rsrc.php/v3/yt/r/iRmz9lCMBD2.ico';
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

    // ENHANCED: For all other websites - try screenshot service FIRST, then AllOrigins
    try {
      console.log('Attempting screenshot capture for:', hostname);
      
      // Try screenshot service first for better visual preview
      const screenshotUrl = await captureScreenshot(url);
      
      if (screenshotUrl) {
        // Screenshot successful, now get meta data with AllOrigins
        try {
          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
          const data = await response.json();
          
          if (data.contents) {
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            
            // Extract Open Graph and meta tags with fallbacks
            const ogTitle = doc.querySelector("meta[property='og:title']")?.getAttribute('content');
            const pageTitle = doc.querySelector("title")?.textContent;
            const title = ogTitle || pageTitle || 'External Link';
            
            const ogDescription = doc.querySelector("meta[property='og:description']")?.getAttribute('content');
            const metaDescription = doc.querySelector("meta[name='description']")?.getAttribute('content');
            const description = ogDescription || metaDescription || 'Click to visit';
            
            const ogSiteName = doc.querySelector("meta[property='og:site_name']")?.getAttribute('content');
            const siteName = ogSiteName || hostname;

            // Use screenshot image with extracted metadata
            preview.title = title.trim().substring(0, 100);
            preview.description = description.trim().substring(0, 200);
            preview.siteName = siteName;
            preview.image = screenshotUrl; // USE SCREENSHOT IMAGE
            
            console.log('Screenshot + metadata successful for:', hostname);
            return preview;
          }
        } catch (metaError) {
          console.warn('Metadata extraction failed, using screenshot only:', metaError);
          // Use screenshot with basic info
          preview.title = `${hostname.charAt(0).toUpperCase() + hostname.slice(1)} Website`;
          preview.description = 'Website content preview';
          preview.image = screenshotUrl;
          return preview;
        }
      } else {
        // Screenshot failed, try AllOrigins for metadata and fallback image
        console.log('Screenshot failed, trying AllOrigins for:', hostname);
        
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
          throw new Error(`AllOrigins request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.contents) {
          const doc = new DOMParser().parseFromString(data.contents, 'text/html');
          
          // Extract Open Graph and meta tags with fallbacks
          const ogTitle = doc.querySelector("meta[property='og:title']")?.getAttribute('content');
          const pageTitle = doc.querySelector("title")?.textContent;
          const title = ogTitle || pageTitle || 'External Link';
          
          const ogDescription = doc.querySelector("meta[property='og:description']")?.getAttribute('content');
          const metaDescription = doc.querySelector("meta[name='description']")?.getAttribute('content');
          const description = ogDescription || metaDescription || 'Click to visit';
          
          const ogImage = doc.querySelector("meta[property='og:image']")?.getAttribute('content');
          const twitterImage = doc.querySelector("meta[name='twitter:image']")?.getAttribute('content');
          const linkImage = doc.querySelector("link[rel='image_src']")?.getAttribute('href');
          
          const ogSiteName = doc.querySelector("meta[property='og:site_name']")?.getAttribute('content');
          const siteName = ogSiteName || hostname;

          // Update preview with extracted data
          preview.title = title.trim().substring(0, 100);
          preview.description = description.trim().substring(0, 200);
          preview.siteName = siteName;
          
          // Handle image URL with validation
          let imageUrl = ogImage || twitterImage || linkImage;
          
          if (imageUrl) {
            // Convert relative URLs to absolute
            if (!imageUrl.startsWith('http')) {
              try {
                imageUrl = new URL(imageUrl, url).href;
              } catch (urlError) {
                console.warn('Failed to convert relative image URL:', imageUrl);
                imageUrl = null;
              }
            }
            
            // Validate that the image URL is accessible
            if (imageUrl) {
              const isImageValid = await validateImageUrl(imageUrl);
              if (isImageValid) {
                preview.image = imageUrl;
              } else {
                console.warn('Image URL validation failed, generating text preview:', imageUrl);
                // Generate fallback text-based image
                preview.image = generateTextPreviewImage(preview.title, preview.description);
              }
            }
          } else {
            // No image found, generate text-based preview
            console.log('No image found, generating text preview for:', hostname);
            preview.image = generateTextPreviewImage(preview.title, preview.description);
          }
          
          console.log('AllOrigins extraction successful for:', hostname);
        } else {
          console.warn('No content returned from AllOrigins for:', hostname);
          // Generate fallback preview
          preview.image = generateTextPreviewImage(preview.title, preview.description);
        }
      }
    } catch (fetchError) {
      console.warn('Both screenshot and AllOrigins failed for:', hostname, fetchError);
      // Generate fallback preview for failed fetches
      preview.title = `${hostname.charAt(0).toUpperCase() + hostname.slice(1)} Link`;
      preview.description = 'External website content';
      preview.image = generateTextPreviewImage(preview.title, preview.description);
    }

    return preview;
    
  } catch (error) {
    console.error('Error creating URL preview:', error);
    // Return safe fallback with generated image
    const fallbackTitle = 'External Link';
    const fallbackDescription = 'Click to visit';
    
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      image: generateTextPreviewImage(fallbackTitle, fallbackDescription),
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
