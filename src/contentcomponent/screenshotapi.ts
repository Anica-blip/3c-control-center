// =====================================================
// SCREENSHOT API - Frontend Integration
// =====================================================
// Calls Cloudflare Worker for screenshot generation
// Replaces old localhost-based screenshot service

const SCREENSHOT_SERVICE_URL = '3c-control-center.3c-innertherapy.workers.dev';
// TODO: Replace YOUR_SUBDOMAIN with your actual Cloudflare subdomain
// Find it in: Cloudflare Dashboard → Workers → 3c-control-center → Settings → Triggers

// =====================================================
// MAIN SCREENSHOT FUNCTION
// =====================================================

/**
 * Generate screenshot for a URL
 * @param url - URL to screenshot
 * @param options - Optional configuration
 * @returns Screenshot URL or null
 */
export async function generateScreenshot(
  url: string,
  options: {
    title?: string;
    description?: string;
    contentType?: 'quiz' | 'game' | 'puzzle' | 'challenge' | 'assessment' | 'webpage';
    platform?: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube' | 'telegram';
    width?: number;
    height?: number;
  } = {}
): Promise<string | null> {
  try {
    console.log('📸 Requesting screenshot for:', url);

    const response = await fetch(`${SCREENSHOT_SERVICE_URL}/api/screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        title: options.title,
        description: options.description,
        contentType: options.contentType,
        platform: options.platform,
        width: options.width || getPlatformWidth(options.platform),
        height: options.height || getPlatformHeight(options.platform),
      }),
    });

    if (!response.ok) {
      throw new Error(`Screenshot service error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.screenshot_url) {
      console.log('✅ Screenshot generated:', data.screenshot_url);
      return data.screenshot_url;
    }

    // If GitHub Actions is processing, poll for result
    if (data.message && data.message.includes('in progress')) {
      console.log('⏳ Screenshot processing, waiting...');
      return await pollForScreenshot(url);
    }

    throw new Error(data.error || 'Screenshot generation failed');

  } catch (error) {
    console.error('❌ Screenshot generation error:', error);
    return null;
  }
}

// =====================================================
// POLLING FOR EXTERNAL SCREENSHOTS
// =====================================================

async function pollForScreenshot(url: string, maxAttempts = 30, interval = 2000): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, interval));

    try {
      const response = await fetch(`${SCREENSHOT_SERVICE_URL}/api/screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.screenshot_url && data.cached) {
          console.log('✅ Screenshot ready:', data.screenshot_url);
          return data.screenshot_url;
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }

  console.error('❌ Screenshot polling timeout');
  return null;
}

// =====================================================
// PLATFORM-SPECIFIC DIMENSIONS
// =====================================================

function getPlatformWidth(platform?: string): number {
  const widths: Record<string, number> = {
    instagram: 1080,
    facebook: 1200,
    twitter: 1200,
    linkedin: 1200,
    youtube: 1280,
    telegram: 1200,
    tiktok: 540,
    pinterest: 735,
  };
  return widths[platform || ''] || 1200;
}

function getPlatformHeight(platform?: string): number {
  const heights: Record<string, number> = {
    instagram: 1080,
    facebook: 628,
    twitter: 675,
    linkedin: 627,
    youtube: 720,
    telegram: 630,
    tiktok: 960,
    pinterest: 1102,
  };
  return heights[platform || ''] || 630;
}

// =====================================================
// URL PREVIEW WITH SCREENSHOT
// =====================================================

/**
 * Get URL preview with screenshot
 * @param url - URL to preview
 * @param platform - Target platform
 * @returns Preview data with screenshot
 */
export async function fetchUrlPreview(url: string, platform?: string) {
  try {
    console.log('🔍 Fetching URL preview for:', url);

    // Detect content type from URL
    const contentType = detectContentType(url);

    // Generate screenshot
    const screenshot = await generateScreenshot(url, {
      contentType,
      platform: platform as any,
      title: extractTitleFromUrl(url),
      description: 'Interactive content',
    });

    // Extract basic metadata
    const metadata = {
      title: extractTitleFromUrl(url),
      description: 'Click to view this content',
      siteName: extractSiteNameFromUrl(url),
      image: screenshot,
      url: url,
    };

    console.log('✅ URL preview generated');
    return metadata;

  } catch (error) {
    console.error('❌ URL preview error:', error);

    // Return basic fallback
    return {
      title: extractTitleFromUrl(url),
      description: 'Click to visit this link',
      siteName: extractSiteNameFromUrl(url),
      image: null,
      url: url,
    };
  }
}

// =====================================================
// URL UTILITIES
// =====================================================

function detectContentType(url: string): 'quiz' | 'game' | 'puzzle' | 'challenge' | 'assessment' | 'webpage' {
  const lower = url.toLowerCase();
  
  if (lower.includes('quiz') || lower.includes('type=quiz')) return 'quiz';
  if (lower.includes('game') || lower.includes('type=game')) return 'game';
  if (lower.includes('puzzle') || lower.includes('type=puzzle')) return 'puzzle';
  if (lower.includes('challenge') || lower.includes('type=challenge')) return 'challenge';
  if (lower.includes('assessment') || lower.includes('type=assessment')) return 'assessment';
  
  return 'webpage';
}

function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    if (path && path !== '/') {
      const parts = path.split('/').filter(Boolean);
      return parts[parts.length - 1]?.replace(/[-_]/g, ' ') || urlObj.hostname;
    }
    
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'Website Link';
  }
}

function extractSiteNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'Website';
  }
}

// =====================================================
// HEALTH CHECK
// =====================================================

/**
 * Check if screenshot service is available
 * @returns true if service is healthy
 */
export async function checkScreenshotService(): Promise<boolean> {
  try {
    const response = await fetch(`${SCREENSHOT_SERVICE_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

// =====================================================
// EXPORT ALL UTILITIES
// =====================================================

export {
  getPlatformWidth,
  getPlatformHeight,
  detectContentType,
  extractTitleFromUrl,
  extractSiteNameFromUrl,
};
