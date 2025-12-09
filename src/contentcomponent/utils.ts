// =====================================================
// CONTENT COMPONENT UTILITIES
// =====================================================
// Code mapping functions for content creation form
// Screenshot functions are now in screenshot-api.ts

// =====================================================
// CODE MAPPING FUNCTIONS
// =====================================================

export const getThemeCode = (value: string): string => {
  const codes: Record<string, string> = {
    'news_alert': 'NA',
    'promotion': 'PR',
    'standard_post': 'SP',
    'cta_quiz': 'QZ',
    'cta_game': 'GA',
    'cta_puzzle': 'PZ',
    'cta_challenge': 'CH',
    'news': 'NS',
    'blog': 'BP',
    'tutorial_guide': 'TG',
    'course_tool': 'CT',
    'assessment': 'AS'
  };
  return codes[value] || 'XX';
};

export const getAudienceCode = (value: string): string => {
  const codes: Record<string, string> = {
    'existing_members': 'EM',
    'new_members': 'NM',
    'persona_falcon': 'FL',
    'persona_panther': 'PA',
    'persona_wolf': 'WF',
    'persona_lion': 'LI',
    'general_public': 'GP'
  };
  return codes[value] || 'XX';
};

export const getMediaCode = (value: string): string => {
  const codes: Record<string, string> = {
    'image': 'IM',
    'video': 'VD',
    'gifs': 'GF',
    'pdf': 'PF',
    'interactive_media': 'IM',
    'url_link': 'UL'
  };
  return codes[value] || 'XX';
};

export const getTemplateTypeCode = (value: string): string => {
  const codes: Record<string, string> = {
    'social_media': 'SM',
    'presentation': 'PR',
    'video_message': 'VM',
    'anica_chat': 'AC',
    'blog_posts': 'BP',
    'news_article': 'NA',
    'newsletter': 'NL',
    'email_templates': 'ET',
    'custom_templates': 'CT'
  };
  return codes[value] || 'XX';
};

export const getCharacterCode = (name: string): string => {
  const codes: Record<string, string> = {
    'anica': 'AN',
    'caelum': 'CA',
    'aurion': 'AU'
  };
  return codes[name.toLowerCase()] || 'XX';
};

export const getVoiceStyleCode = (value: string): string => {
  const codes: Record<string, string> = {
    'casual': 'CS',
    'friendly': 'FR',
    'professional': 'PR',
    'creative': 'CR'
  };
  return codes[value] || 'XX';
};

// =====================================================
// TEXT PREVIEW IMAGE GENERATION
// =====================================================

export const generateTextPreviewImage = (title: string, description: string): string | null => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
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
