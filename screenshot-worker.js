/**
 * 3C Control Center - Screenshot Service Worker
 * Handles screenshot generation for dashboard content
 * CORS is configured manually in Cloudflare Dashboard
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        service: '3c-screenshot-service' 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Screenshot generation endpoint
    if (url.pathname === '/api/screenshot' && request.method === 'POST') {
      return handleScreenshot(request, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};

// Main screenshot handler
async function handleScreenshot(request, env) {
  try {
    const body = await request.json();
    const { url, title, description, contentType, platform, width, height } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Screenshot request:', url);

    // Check if screenshot already exists in Supabase
    const existing = await checkExistingScreenshot(url, env);
    if (existing && existing.screenshot_url) {
      console.log('Using cached screenshot:', existing.screenshot_url);
      await incrementUsageCount(url, env);
      return new Response(JSON.stringify({
        success: true,
        screenshot_url: existing.screenshot_url,
        cached: true
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Detect URL type
    const urlType = determineUrlType(url);

    // Generate branded screenshot for 3C content
    if (urlType === '3c-interactive' || urlType === '3c-tool') {
      const result = await generateBrandedScreenshot(
        url, 
        title, 
        description, 
        contentType, 
        width || 1200, 
        height || 630, 
        env
      );

      if (result.success) {
        // Save to Supabase
        await saveScreenshotMetadata({
          url,
          screenshot_url: result.screenshot_url,
          screenshot_key: result.screenshot_key,
          url_type: urlType,
          content_type: contentType,
          platform,
          width: width || 1200,
          height: height || 630,
          generation_method: 'branded'
        }, env);

        return new Response(JSON.stringify({
          success: true,
          screenshot_url: result.screenshot_url,
          cached: false
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // External URLs not supported in Phase 1
    return new Response(JSON.stringify({
      success: false,
      error: 'External webpage screenshots require Phase 2 setup'
    }), {
      status: 501,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Screenshot error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Determine URL type
function determineUrlType(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (hostname.includes('anica-blip.github.io') || 
        hostname.includes('3c-') ||
        urlObj.searchParams.has('type')) {
      return '3c-interactive';
    }

    if (hostname.includes('3cthread') || hostname.includes('3c-tool')) {
      return '3c-tool';
    }

    return 'external';
  } catch {
    return 'external';
  }
}

// Generate branded screenshot using SVG
async function generateBrandedScreenshot(url, title, description, contentType, width, height, env) {
  try {
    console.log('Generating branded screenshot for:', contentType || 'content');

    const svg = generateBrandedSVG(title, description, contentType, width, height);
    const svgBuffer = new TextEncoder().encode(svg);

    // Generate filename
    const hash = simpleHash(url);
    const type = contentType ? `-${contentType}` : '';
    const timestamp = Date.now();
    const filename = `screenshots/branded/${hash}${type}-${timestamp}.svg`;

    // Upload to R2
    await env.SCREENSHOTS.put(filename, svgBuffer, {
      httpMetadata: { contentType: 'image/svg+xml' }
    });

    // R2 public URL (update this with your actual R2 public domain)
    const publicUrl = `https://pub-${env.R2_ACCOUNT_ID}.r2.dev/${filename}`;

    console.log('Screenshot uploaded:', publicUrl);

    return {
      success: true,
      screenshot_url: publicUrl,
      screenshot_key: filename
    };

  } catch (error) {
    console.error('Branded screenshot error:', error);
    return { success: false, error: error.message };
  }
}

// Generate SVG with 3C branding
function generateBrandedSVG(title, description, contentType, width, height) {
  const themes = {
    quiz: { gradient: ['#8B5CF6', '#3B82F6'], emoji: '🔥', accent: '#FFD700' },
    game: { gradient: ['#10B981', '#059669'], emoji: '🎮', accent: '#FFD700' },
    puzzle: { gradient: ['#F59E0B', '#D97706'], emoji: '🧩', accent: '#FFFFFF' },
    challenge: { gradient: ['#EF4444', '#DC2626'], emoji: '⚡', accent: '#FFD700' },
    assessment: { gradient: ['#6366F1', '#4F46E5'], emoji: '📊', accent: '#FFD700' }
  };

  const theme = themes[contentType?.toLowerCase()] || themes.quiz;
  const displayTitle = title || 'Interactive Content';
  const displayDesc = description || 'Engage with content';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.gradient[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${theme.gradient[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <g opacity="0.05">
        ${Array.from({ length: 10 }, (_, i) => 
          `<rect x="${i * 120}" y="0" width="60" height="${height}" fill="white"/>`
        ).join('')}
      </g>
      
      <rect x="${width * 0.08}" y="${height * 0.08}" width="${width * 0.84}" height="${height * 0.84}" 
            fill="rgba(0,0,0,0.2)" rx="0"/>
      
      <rect x="${width * 0.1}" y="${height * 0.1}" width="${width * 0.25}" height="${height * 0.08}" 
            fill="${theme.accent}" rx="4"/>
      <text x="${width * 0.225}" y="${height * 0.14}" 
            font-family="Arial, sans-serif" font-size="${height * 0.04}" font-weight="bold"
            fill="${theme.gradient[0]}" text-anchor="middle">
        ${(contentType || 'CONTENT').toUpperCase()}
      </text>
      
      <text x="${width * 0.5}" y="${height * 0.3}" 
            font-family="Arial, sans-serif" font-size="${height * 0.15}"
            text-anchor="middle">
        ${theme.emoji}
      </text>
      
      <text x="${width * 0.5}" y="${height * 0.5}" 
            font-family="Arial, sans-serif" font-size="${height * 0.06}" font-weight="bold"
            fill="white" text-anchor="middle">
        ${escapeXml(displayTitle.substring(0, 40))}
      </text>
      
      <text x="${width * 0.5}" y="${height * 0.6}" 
            font-family="Arial, sans-serif" font-size="${height * 0.035}"
            fill="rgba(255,255,255,0.9)" text-anchor="middle">
        ${escapeXml(displayDesc.substring(0, 60))}
      </text>
      
      <rect x="${width * 0.3}" y="${height * 0.7}" width="${width * 0.4}" height="${height * 0.08}" 
            fill="${theme.accent}" rx="8"/>
      <text x="${width * 0.5}" y="${height * 0.75}" 
            font-family="Arial, sans-serif" font-size="${height * 0.04}" font-weight="bold"
            fill="${theme.gradient[0]}" text-anchor="middle">
        GO IN
      </text>
      
      <text x="${width * 0.5}" y="${height * 0.95}" 
            font-family="Arial, sans-serif" font-size="${height * 0.025}"
            fill="rgba(255,255,255,0.7)" text-anchor="middle">
        3C Thread To Success
      </text>
    </svg>
  `;
}

// Escape XML special characters
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Check if screenshot exists in Supabase
async function checkExistingScreenshot(url, env) {
  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/screenshots?url=eq.${encodeURIComponent(url)}&select=*`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data[0] || null;
    }
  } catch (error) {
    console.error('Supabase check error:', error);
  }
  return null;
}

// Save screenshot metadata to Supabase
async function saveScreenshotMetadata(data, env) {
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/screenshots`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        ...data,
        url_domain: new URL(data.url).hostname,
        generation_status: 'completed'
      })
    });
  } catch (error) {
    console.error('Supabase save error:', error);
  }
}

// Increment usage count
async function incrementUsageCount(url, env) {
  try {
    await fetch(
      `${env.SUPABASE_URL}/rest/v1/rpc/increment_screenshot_usage`,
      {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ screenshot_url_param: url })
      }
    );
  } catch (error) {
    console.error('Usage count error:', error);
  }
}

// Simple hash function
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
