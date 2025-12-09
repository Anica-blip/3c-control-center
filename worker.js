// =====================================================
// 3C CONTROL CENTER - SCREENSHOT SERVICE WORKER
// =====================================================
// Handles screenshot generation for dashboard content
// - 3C interactive content: Branded screenshots (instant)
// - External webpages: Triggers GitHub Actions (10-30s)

export default {
  async fetch(request, env) {
    // CORS headers for dashboard access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Routes
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: '3c-screenshot-service' }, { headers: corsHeaders });
    }

    if (url.pathname === '/api/screenshot' && request.method === 'POST') {
      return handleScreenshotRequest(request, env, corsHeaders);
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  },
};

// =====================================================
// MAIN SCREENSHOT HANDLER
// =====================================================
async function handleScreenshotRequest(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { url, title, description, contentType, platform, width, height } = body;

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });
    }

    console.log(`📸 Screenshot request: ${url}`);

    // Check if screenshot already exists
    const existing = await checkExistingScreenshot(url, env);
    if (existing && existing.screenshot_url) {
      console.log(`✅ Using cached screenshot: ${existing.screenshot_url}`);
      await incrementUsageCount(url, env);
      return Response.json({
        success: true,
        screenshot_url: existing.screenshot_url,
        cached: true,
      }, { headers: corsHeaders });
    }

    // Determine URL type and generate screenshot
    const urlType = determineUrlType(url);
    let result;

    if (urlType === '3c-interactive') {
      // Generate branded screenshot instantly
      result = await generateBrandedScreenshot(url, title, description, contentType, platform, width, height, env);
    } else {
      // Trigger GitHub Actions for external webpage
      result = await triggerExternalScreenshot(url, width, height, env);
    }

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
        generation_method: result.method,
      }, env);

      return Response.json({
        success: true,
        screenshot_url: result.screenshot_url,
        cached: false,
      }, { headers: corsHeaders });
    } else {
      throw new Error(result.error || 'Screenshot generation failed');
    }

  } catch (error) {
    console.error('❌ Screenshot error:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500, headers: corsHeaders });
  }
}

// =====================================================
// URL TYPE DETECTION
// =====================================================
function determineUrlType(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // 3C interactive content
    if (hostname.includes('anica-blip.github.io') || 
        hostname.includes('3c-') ||
        urlObj.searchParams.has('type')) {
      return '3c-interactive';
    }

    // 3C tools
    if (hostname.includes('3cthread') || hostname.includes('3c-tool')) {
      return '3c-tool';
    }

    // External webpage
    return 'external';
  } catch {
    return 'external';
  }
}

// =====================================================
// BRANDED SCREENSHOT GENERATION (3C CONTENT)
// =====================================================
async function generateBrandedScreenshot(url, title, description, contentType, platform, width, height, env) {
  try {
    console.log(`🎨 Generating branded screenshot for: ${contentType || 'content'}`);

    // Generate SVG screenshot (compatible with Cloudflare Workers)
    const svg = generateBrandedSVG(title, description, contentType, width || 1200, height || 630);
    const svgBuffer = new TextEncoder().encode(svg);

    // Upload to R2
    const filename = `screenshots/branded/${generateFilename(url, contentType)}.svg`;
    await env.SCREENSHOTS.put(filename, svgBuffer, {
      httpMetadata: { contentType: 'image/svg+xml' },
    });

    const publicUrl = `https://files.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${filename}`;

    console.log(`✅ Branded screenshot uploaded: ${publicUrl}`);

    return {
      success: true,
      screenshot_url: publicUrl,
      screenshot_key: filename,
      method: 'branded',
    };

  } catch (error) {
    console.error('❌ Branded screenshot error:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// GENERATE BRANDED SVG
// =====================================================
function generateBrandedSVG(title, description, contentType, width, height) {
  // Theme colors by content type
  const themes = {
    quiz: { gradient: ['#8B5CF6', '#3B82F6'], emoji: '🔥', accent: '#FFD700' },
    game: { gradient: ['#10B981', '#059669'], emoji: '🎮', accent: '#FFD700' },
    puzzle: { gradient: ['#F59E0B', '#D97706'], emoji: '🧩', accent: '#FFFFFF' },
    challenge: { gradient: ['#EF4444', '#DC2626'], emoji: '⚡', accent: '#FFD700' },
    assessment: { gradient: ['#6366F1', '#4F46E5'], emoji: '📊', accent: '#FFD700' },
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
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- Pattern overlay -->
      <g opacity="0.05">
        ${Array.from({ length: 10 }, (_, i) => 
          `<rect x="${i * 120}" y="0" width="60" height="${height}" fill="white"/>`
        ).join('')}
      </g>
      
      <!-- Content area -->
      <rect x="${width * 0.08}" y="${height * 0.08}" width="${width * 0.84}" height="${height * 0.84}" 
            fill="rgba(0,0,0,0.2)" rx="0"/>
      
      <!-- Badge -->
      <rect x="${width * 0.1}" y="${height * 0.1}" width="${width * 0.25}" height="${height * 0.08}" 
            fill="${theme.accent}" rx="4"/>
      <text x="${width * 0.225}" y="${height * 0.14}" 
            font-family="Arial, sans-serif" font-size="${height * 0.04}" font-weight="bold"
            fill="${theme.gradient[0]}" text-anchor="middle">
        ${(contentType || 'CONTENT').toUpperCase()}
      </text>
      
      <!-- Emoji -->
      <text x="${width * 0.5}" y="${height * 0.3}" 
            font-family="Arial, sans-serif" font-size="${height * 0.15}"
            text-anchor="middle">
        ${theme.emoji}
      </text>
      
      <!-- Title -->
      <text x="${width * 0.5}" y="${height * 0.5}" 
            font-family="Arial, sans-serif" font-size="${height * 0.06}" font-weight="bold"
            fill="white" text-anchor="middle">
        ${displayTitle.substring(0, 40)}
      </text>
      
      <!-- Description -->
      <text x="${width * 0.5}" y="${height * 0.6}" 
            font-family="Arial, sans-serif" font-size="${height * 0.035}"
            fill="rgba(255,255,255,0.9)" text-anchor="middle">
        ${displayDesc.substring(0, 60)}
      </text>
      
      <!-- Button -->
      <rect x="${width * 0.3}" y="${height * 0.7}" width="${width * 0.4}" height="${height * 0.08}" 
            fill="${theme.accent}" rx="8"/>
      <text x="${width * 0.5}" y="${height * 0.75}" 
            font-family="Arial, sans-serif" font-size="${height * 0.04}" font-weight="bold"
            fill="${theme.gradient[0]}" text-anchor="middle">
        GO IN
      </text>
      
      <!-- Branding -->
      <text x="${width * 0.5}" y="${height * 0.95}" 
            font-family="Arial, sans-serif" font-size="${height * 0.025}"
            fill="rgba(255,255,255,0.7)" text-anchor="middle">
        3C Thread To Success
      </text>
    </svg>
  `;
}

// =====================================================
// EXTERNAL SCREENSHOT (GITHUB ACTIONS - OPTIONAL)
// =====================================================
async function triggerExternalScreenshot(url, width, height, env) {
  try {
    console.log(`🔗 External URL requested: ${url}`);

    // Check if GitHub integration is configured
    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
      console.log('ℹ️ GitHub Actions not configured - external screenshots not available');
      
      // Return a fallback branded screenshot for now
      return {
        success: true,
        screenshot_url: null,
        screenshot_key: null,
        method: 'not-configured',
        message: 'External webpage screenshots require GitHub Actions setup',
      };
    }

    // Trigger GitHub Actions workflow
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/actions/workflows/screenshot-processor.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': '3C-Screenshot-Service',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            url: url,
            width: String(width || 1200),
            height: String(height || 630),
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    console.log(`✅ GitHub Actions triggered for: ${url}`);

    return {
      success: true,
      screenshot_url: null,
      screenshot_key: null,
      method: 'puppeteer-pending',
      message: 'Screenshot generation in progress (10-30 seconds)',
    };

  } catch (error) {
    console.error('❌ GitHub Actions trigger error:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// SUPABASE HELPERS
// =====================================================
async function checkExistingScreenshot(url, env) {
  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/screenshots?url=eq.${encodeURIComponent(url)}&select=*`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        },
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

async function saveScreenshotMetadata(data, env) {
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/screenshots`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        ...data,
        url_domain: new URL(data.url).hostname,
        generation_status: data.screenshot_url ? 'completed' : 'processing',
      }),
    });
  } catch (error) {
    console.error('Supabase save error:', error);
  }
}

async function incrementUsageCount(url, env) {
  try {
    await fetch(
      `${env.SUPABASE_URL}/rest/v1/rpc/increment_screenshot_usage`,
      {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ screenshot_url_param: url }),
      }
    );
  } catch (error) {
    console.error('Usage count error:', error);
  }
}

// =====================================================
// UTILITIES
// =====================================================
function generateFilename(url, contentType) {
  const hash = simpleHash(url);
  const type = contentType ? `-${contentType}` : '';
  const timestamp = Date.now();
  return `${hash}${type}-${timestamp}`;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
