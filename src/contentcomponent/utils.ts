// Enhanced URL preview with screenshot service integration

// Try multiple ports for the screenshot service
const SCREENSHOT_PORTS = [3001, 3002, 3003, 3004, 3005];
let SCREENSHOT_SERVICE_URL = null;

// Test which port the screenshot service is running on
async function findScreenshotService() {
  if (SCREENSHOT_SERVICE_URL) return SCREENSHOT_SERVICE_URL;
  
  for (const port of SCREENSHOT_PORTS) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        method: 'GET',
        timeout: 2000
      });
      if (response.ok) {
        SCREENSHOT_SERVICE_URL = `http://localhost:${port}`;
        console.log(`Found screenshot service on port ${port}`);
        return SCREENSHOT_SERVICE_URL;
      }
    } catch (error) {
      // Port not available, try next one
      continue;
    }
  }
  
  console.log('Screenshot service not found on any port');
  return null;
}

// Generate screenshot using the service
async function generateUrlScreenshot(url, width = 1200, height = 630) {
  try {
    const serviceUrl = await findScreenshotService();
    if (!serviceUrl) {
      throw new Error('Screenshot service not available');
    }

    const screenshotUrl = `${serviceUrl}/api/capture?url=${encodeURIComponent(url)}&width=${width}&height=${height}`;
    console.log(`Requesting screenshot: ${screenshotUrl}`);
    
    const response = await fetch(screenshotUrl);
    
    if (!response.ok) {
      throw new Error(`Screenshot service error: ${response.status}`);
    }
    
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    
  } catch (error) {
    console.error('Screenshot generation failed:', error);
    return null;
  }
}

// Get platform-specific screenshot dimensions
function getPlatformScreenshotDimensions(platform) {
  const dimensions = {
    instagram: { width: 1080, height: 1080 },
    facebook: { width: 1200, height: 628 },
    twitter: { width: 1200, height: 675 },
    linkedin: { width: 1200, height: 628 },
    youtube: { width: 1280, height: 720 },
    tiktok: { width: 540, height: 960 },
    telegram: { width: 1200, height: 630 },
    pinterest: { width: 735, height: 1102 },
    whatsapp: { width: 1200, height: 628 }
  };
  
  return dimensions[platform] || { width: 1200, height: 630 };
}

// Enhanced fetchUrlPreview with screenshot integration
export async function fetchUrlPreview(url, platform = null) {
  try {
    console.log('Fetching URL preview for:', url);
    
    // Get platform-specific dimensions for screenshot
    const dimensions = getPlatformScreenshotDimensions(platform);
    
    // Try to generate screenshot first
    const screenshot = await generateUrlScreenshot(url, dimensions.width, dimensions.height);
    
    // Fetch metadata using AllOrigins API (fallback method)
    let metadata = null;
    try {
      const metadataResponse = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      if (metadataResponse.ok) {
        const html = await metadataResponse.text();
        metadata = extractMetadataFromHtml(html, url);
      }
    } catch (metadataError) {
      console.error('Metadata fetch failed:', metadataError);
    }
    
    // Combine screenshot with metadata
    const preview = {
      title: metadata?.title || extractTitleFromUrl(url),
      description: metadata?.description || 'Click to visit this link',
      siteName: metadata?.siteName || extractSiteNameFromUrl(url),
      image: screenshot || metadata?.image || null,
      url: url,
      favicon: metadata?.favicon || null
    };
    
    console.log('URL preview generated:', preview);
    return preview;
    
  } catch (error) {
    console.error('URL preview failed:', error);
    
    // Return basic fallback
    return {
      title: extractTitleFromUrl(url),
      description: 'Click to visit this link',
      siteName: extractSiteNameFromUrl(url),
      image: null,
      url: url,
      favicon: null
    };
  }
}

// Extract metadata from HTML
function extractMetadataFromHtml(html, url) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Helper function to get meta content
    const getMeta = (property) => {
      const meta = doc.querySelector(`meta[property="${property}"]`) || 
                   doc.querySelector(`meta[name="${property}"]`);
      return meta ? meta.getAttribute('content') : null;
    };
    
    const title = getMeta('og:title') || 
                  getMeta('twitter:title') || 
                  doc.querySelector('title')?.textContent || 
                  extractTitleFromUrl(url);
    
    const description = getMeta('og:description') || 
                       getMeta('twitter:description') || 
                       getMeta('description') || 
                       'Click to visit this link';
    
    const siteName = getMeta('og:site_name') || 
                     extractSiteNameFromUrl(url);
    
    const image = getMeta('og:image') || 
                  getMeta('twitter:image') || 
                  null;
    
    const favicon = doc.querySelector('link[rel="icon"]')?.href || 
                    doc.querySelector('link[rel="shortcut icon"]')?.href || 
                    null;
    
    return {
      title: title?.trim(),
      description: description?.trim(),
      siteName: siteName?.trim(),
      image,
      favicon
    };
    
  } catch (error) {
    console.error('HTML parsing failed:', error);
    return null;
  }
}

// Extract title from URL
function extractTitleFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname;
    
    if (path && path !== '/') {
      return path.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || hostname;
    }
    
    return hostname;
  } catch {
    return 'Website Link';
  }
}

// Extract site name from URL
function extractSiteNameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'Website';
  }
}

// Your existing utility functions (keep these unchanged)
export const generateTextPreviewImage = (title, description) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 1200;
    canvas.height = 630;
    
    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title || 'Preview', canvas.width / 2, 250);
    
    // Description
    ctx.fillStyle = '#94a3b8';
    ctx.font = '32px Arial';
    const words = (description || 'No description available').split(' ');
    let line = '';
    let y = 350;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > 1000 && n > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[n] + ' ';
        y += 40;
        if (y > 500) break; // Limit to 4 lines
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);
    
    return canvas.toDataURL();
  } catch (error) {
    console.error('Text preview generation failed:', error);
    return null;
  }
};

// Keep all your existing code mapping functions unchanged
export const getThemeCode = (value) => {
  const codes = {
    'news_alert': 'NA', 'promotion': 'PR', 'standard_post': 'SP',
    'cta_quiz': 'QZ', 'cta_game': 'GA', 'cta_puzzle': 'PZ',
    'cta_challenge': 'CH', 'news': 'NS', 'blog': 'BP',
    'tutorial_guide': 'TG', 'course_tool': 'CT', 'assessment': 'AS'
  };
  return codes[value] || 'XX';
};

export const getAudienceCode = (value) => {
  const codes = {
    'existing_members': 'EM', 'new_members': 'NM', 'persona_falcon': 'FL',
    'persona_panther': 'PA', 'persona_wolf': 'WF', 'persona_lion': 'LI',
    'general_public': 'GP'
  };
  return codes[value] || 'XX';
};

export const getMediaCode = (value) => {
  const codes = {
    'image': 'IM', 'video': 'VD', 'gifs': 'GF', 'pdf': 'PF',
    'interactive_media': 'IM', 'url_link': 'UL'
  };
  return codes[value] || 'XX';
};

export const getTemplateTypeCode = (value) => {
  const codes = {
    'social_media': 'SM', 'presentation': 'PR', 'video_message': 'VM',
    'anica_chat': 'AC', 'blog_posts': 'BP', 'news_article': 'NA',
    'newsletter': 'NL', 'email_templates': 'ET', 'custom_templates': 'CT'
  };
  return codes[value] || 'XX';
};

export const getCharacterCode = (name) => {
  const codes = {
    'anica': 'AN',
    'caelum': 'CA', 
    'aurion': 'AU'
  };
  return codes[name.toLowerCase()] || 'XX';
};

export const getVoiceStyleCode = (value) => {
  const codes = {
    'casual': 'CS',
    'friendly': 'FR',
    'professional': 'PR',
    'creative': 'CR'
  };
  return codes[value] || 'XX';
};
