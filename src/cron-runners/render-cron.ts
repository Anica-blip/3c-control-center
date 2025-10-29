// Render.com Cron Runner - Direct Database Connection with Telegram Posting
// Queries scheduled_posts table directly and posts to Telegram
// TIMEZONE: WEST (UTC+1)

import { createClient } from '@supabase/supabase-js';

// ============================================
// JWT VALIDATION HELPER
// ============================================

/**
 * Validates if a string is a properly formatted JWT token
 */
function validateJWT(token: string, varName: string): void {
  if (!token) {
    throw new Error(`${varName} is empty or missing`);
  }
  
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    console.error(`\n❌ INVALID JWT FORMAT for ${varName}:`);
    console.error(`   Expected: 3 parts (header.payload.signature)`);
    console.error(`   Got: ${parts.length} part(s)`);
    console.error(`   Token preview: ${token.substring(0, 50)}...`);
    console.error(`   Token length: ${token.length} characters`);
    throw new Error(`${varName} is not a valid JWT token (has ${parts.length} parts, expected 3)`);
  }
  
  console.log(`✅ ${varName} format is valid (3 parts, ${token.length} chars)`);
}

// ✅ ENVIRONMENT VARIABLES - WITH TRIMMING
const CRON_SUPABASE_DB_URL = (process.env.CRON_SUPABASE_DB_URL || '').trim();
const CRON_RUNNER_PASSWORD = (process.env.CRON_RUNNER_PASSWORD || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const AUTHORIZATION = (process.env.AUTHORIZATION || '').trim();

// ✅ RUNNER IDENTITY
const RUNNER_NAME = 'Render Cron Job';
const SERVICE_TYPE = 'Render Cron Job';

// ✅ TIMEZONE CONFIGURATION - WEST = UTC+1
const TIMEZONE_OFFSET_HOURS = 1;

// ✅ VALIDATE CREDENTIALS
console.log('\n--- ENVIRONMENT VARIABLE CHECK ---');
if (!CRON_SUPABASE_DB_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('  CRON_SUPABASE_DB_URL:', CRON_SUPABASE_DB_URL ? 'SET' : 'MISSING');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
  console.error('  TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? 'SET' : 'MISSING');
  console.error('  AUTHORIZATION:', AUTHORIZATION ? 'SET (optional)' : 'NOT SET (will use SERVICE_ROLE_KEY)');
  process.exit(1);
}

// ✅ VALIDATE JWT FORMAT (ONLY FOR SUPABASE_SERVICE_ROLE_KEY)
try {
  console.log('\n--- JWT TOKEN VALIDATION ---');
  validateJWT(SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');
  
  // AUTHORIZATION is a custom key, not a JWT - no validation needed
  if (AUTHORIZATION) {
    console.log(`✅ AUTHORIZATION key is set (${AUTHORIZATION.length} chars) - using as custom auth token`);
  }
  
  console.log('✅ Token validation completed\n');
} catch (error) {
  console.error('\n❌ JWT Validation Failed!');
  console.error('Please check your Render environment variables and ensure:');
  console.error('  1. No extra spaces or newlines before/after the key');
  console.error('  2. The complete key was copied (should be ~200+ characters)');
  console.error('  3. Using SERVICE_ROLE_KEY, not ANON_KEY\n');
  process.exit(1);
}

// ✅ EXTRACT SUPABASE URL FROM DB URL
const extractSupabaseUrl = (dbUrl: string): string => {
  const match = dbUrl.match(/db\.([^.]+)\.supabase\.co/);
  if (match) {
    return `https://${match[1]}.supabase.co`;
  }
  
  const poolerMatch = dbUrl.match(/postgres\.([^:]+)/);
  if (poolerMatch) {
    return `https://${poolerMatch[1]}.supabase.co`;
  }
  
  throw new Error(`Cannot extract Supabase URL from: ${dbUrl}`);
};

const supabaseUrl = extractSupabaseUrl(CRON_SUPABASE_DB_URL);

// ✅ CREATE SUPABASE CLIENT - ONLY USE SERVICE_ROLE_KEY FOR SUPABASE AUTH
// Note: AUTHORIZATION key is for HTTP endpoint authentication only, not for Supabase
const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY
    }
  }
});

console.log(`[${new Date().toISOString()}] Render Cron Runner initialized`);
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Service Type Filter: ${SERVICE_TYPE}`);
console.log(`Timezone: WEST (UTC+${TIMEZONE_OFFSET_HOURS})`);
console.log(`Supabase Auth: Using SERVICE_ROLE_KEY only`);

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ScheduledPost {
  id: string;
  service_type: string;
  post_content: any;
  scheduled_date: string;
  scheduled_time: string;
  social_platform: string;
  url: string | null;
  channel_group_id: string | null;
  thread_id: string | null;
  attempts: number;
  posting_status: string;
  post_status?: string;
  lock_id: string | null;
  character_profile?: string;
  theme?: string;
  audience?: string;
  media_type?: string;
  template_type?: string;
  platform?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  keywords?: string;
  cta?: string;
  media_files?: any[];
  selected_platforms?: string[];
  content_id?: string;
  user_id?: string;
  created_by?: string;
  voice_style?: string;
  character_avatar?: string;
  name?: string;
  username?: string;
  role?: string;
  platform_id?: string;
}

interface ProcessResult {
  total_claimed: number;
  succeeded: number;
  failed: number;
  errors: string[];
  timestamp: string;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

// ============================================
// TELEGRAM API FUNCTIONS
// ============================================

/**
 * Download file from URL as buffer for direct upload
 */
async function downloadFile(url: string): Promise<{ buffer: Buffer; filename: string }> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download file from ${url}: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Extract filename from URL
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  
  return { buffer, filename };
}

/**
 * Build caption from post_content with proper Telegram HTML formatting
 */
function buildCaption(post: ScheduledPost): string {
  const postContent = post.post_content as any;
  
  if (!postContent) {
    let caption = '';
    if (post.title) caption += `${post.title}\n\n`;
    if (post.description) caption += `${post.description}\n`;
    if (post.hashtags?.length) caption += `\n${post.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;
    if (post.cta) caption += `\n\n👉 ${post.cta}`;
    return caption.trim();
  }
  
  let caption = '';
  
  // Add character profile header
  if (post.name) {
    caption += `<b>${post.name}</b>\n`;
    if (post.username) {
      const username = post.username.startsWith('@') ? post.username : `@${post.username}`;
      caption += `${username}\n`;
    }
    if (post.role) {
      caption += `${post.role}\n`;
    }
    caption += `\n`;
  }
  
  // Helper function to convert markdown to Telegram HTML
  function formatText(text: string): string {
    if (!text) return '';
    
    // Convert markdown links [text](url) to HTML
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
    
    // Convert bold **text** to <b>text</b>
    text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    
    // Convert italic _text_ to <i>text</i>
    text = text.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<i>$1</i>');
    
    // Convert underline __text__ to <u>text</u>
    text = text.replace(/__(.+?)__/g, '<u>$1</u>');
    
    // Convert strikethrough ~~text~~ to <s>text</s>
    text = text.replace(/~~(.+?)~~/g, '<s>$1</s>');
    
    // Convert inline code `text` to <code>text</code>
    text = text.replace(/`(.+?)`/g, '<code>$1</code>');
    
    return text;
  }
  
  // Add title with formatting
  if (postContent.title) {
    caption += `${formatText(postContent.title)}\n\n`;
  }
  
  // Add description with formatting
  if (postContent.description) {
    caption += `${formatText(postContent.description)}\n`;
  }
  
  // Add hashtags
  if (postContent.hashtags && Array.isArray(postContent.hashtags) && postContent.hashtags.length > 0) {
    caption += `\n${postContent.hashtags.map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;
  }
  
  // Add CTA
  if (postContent.cta) {
    caption += `\n\n👉 ${formatText(postContent.cta)}`;
  }
  
  return caption.trim();
}

/**
 * Send text message to Telegram
 */
async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
  threadId?: string
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const body: any = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
  };
  
  if (threadId) {
    const threadIdMatch = threadId.match(/(\d+)$/);
    if (threadIdMatch) {
      body.message_thread_id = parseInt(threadIdMatch[1]);
    }
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return await response.json();
}

/**
 * Send photo to Telegram with caption (supports URL or direct upload)
 */
async function sendTelegramPhoto(
  botToken: string,
  chatId: string,
  photoUrlOrBuffer: string | Buffer,
  caption: string,
  threadId?: string,
  filename?: string
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  
  // If sending as URL
  if (typeof photoUrlOrBuffer === 'string') {
    const body: any = {
      chat_id: chatId,
      photo: photoUrlOrBuffer,
      caption: caption,
      parse_mode: 'HTML',
    };
    
    if (threadId) {
      const threadIdMatch = threadId.match(/(\d+)$/);
      if (threadIdMatch) {
        body.message_thread_id = parseInt(threadIdMatch[1]);
      }
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return await response.json();
  }
  
  // If sending as Buffer (direct upload)
  const FormData = (await import('form-data')).default;
  const formData = new FormData();
  
  formData.append('chat_id', chatId);
  formData.append('photo', photoUrlOrBuffer, { filename: filename || 'photo.jpg' });
  formData.append('caption', caption);
  formData.append('parse_mode', 'HTML');
  
  if (threadId) {
    const threadIdMatch = threadId.match(/(\d+)$/);
    if (threadIdMatch) {
      formData.append('message_thread_id', threadIdMatch[1]);
    }
  }
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData as any,
  });

  return await response.json();
}

/**
 * Send video to Telegram with caption (supports URL or direct upload)
 */
async function sendTelegramVideo(
  botToken: string,
  chatId: string,
  videoUrlOrBuffer: string | Buffer,
  caption: string,
  threadId?: string,
  filename?: string
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendVideo`;
  
  // If sending as URL
  if (typeof videoUrlOrBuffer === 'string') {
    const body: any = {
      chat_id: chatId,
      video: videoUrlOrBuffer,
      caption: caption,
      parse_mode: 'HTML',
    };
    
    if (threadId) {
      const threadIdMatch = threadId.match(/(\d+)$/);
      if (threadIdMatch) {
        body.message_thread_id = parseInt(threadIdMatch[1]);
      }
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return await response.json();
  }
  
  // If sending as Buffer (direct upload)
  const FormData = (await import('form-data')).default;
  const formData = new FormData();
  
  formData.append('chat_id', chatId);
  formData.append('video', videoUrlOrBuffer, { filename: filename || 'video.mp4' });
  formData.append('caption', caption);
  formData.append('parse_mode', 'HTML');
  
  if (threadId) {
    const threadIdMatch = threadId.match(/(\d+)$/);
    if (threadIdMatch) {
      formData.append('message_thread_id', threadIdMatch[1]);
    }
  }
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData as any,
  });

  return await response.json();
}

/**
 * Send document to Telegram with caption (supports URL or direct upload)
 */
async function sendTelegramDocument(
  botToken: string,
  chatId: string,
  documentUrlOrBuffer: string | Buffer,
  caption: string,
  threadId?: string,
  filename?: string
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendDocument`;
  
  // If sending as URL
  if (typeof documentUrlOrBuffer === 'string') {
    const body: any = {
      chat_id: chatId,
      document: documentUrlOrBuffer,
      caption: caption,
      parse_mode: 'HTML',
    };
    
    if (threadId) {
      const threadIdMatch = threadId.match(/(\d+)$/);
      if (threadIdMatch) {
        body.message_thread_id = parseInt(threadIdMatch[1]);
      }
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return await response.json();
  }
  
  // If sending as Buffer (direct upload)
  const FormData = (await import('form-data')).default;
  const formData = new FormData();
  
  formData.append('chat_id', chatId);
  formData.append('document', documentUrlOrBuffer, { filename: filename || 'document.pdf' });
  formData.append('caption', caption);
  formData.append('parse_mode', 'HTML');
  
  if (threadId) {
    const threadIdMatch = threadId.match(/(\d+)$/);
    if (threadIdMatch) {
      formData.append('message_thread_id', threadIdMatch[1]);
    }
  }
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData as any,
  });

  return await response.json();
}

/**
 * Post content to Telegram based on media type
 */
async function postToTelegram(post: ScheduledPost): Promise<{ success: boolean; post_id?: string; error?: string }> {
  try {
    const chatId = post.channel_group_id!;
    const threadId = post.thread_id || undefined;
    const caption = buildCaption(post);
    
    // Check for media files
    const postContent = post.post_content as any;
    const mediaFiles = postContent?.media_files || post.media_files || [];
    
    let telegramResult: TelegramResponse;
    
    // CASE 1: Has media files
    if (mediaFiles.length > 0) {
      const firstMedia = mediaFiles[0];
      const mediaUrl = firstMedia.url || firstMedia.src || firstMedia;
      
      if (typeof mediaUrl !== 'string') {
        throw new Error('Invalid media URL format');
      }
      
      // Determine media type
      const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(mediaUrl);
      const isDocument = /\.(pdf|doc|docx|xls|xlsx|txt)$/i.test(mediaUrl);
      
      if (isVideo) {
        console.log(`Sending video: ${mediaUrl}`);
        telegramResult = await sendTelegramVideo(TELEGRAM_BOT_TOKEN, chatId, mediaUrl, caption, threadId);
      } else if (isDocument) {
        console.log(`Sending document: ${mediaUrl}`);
        telegramResult = await sendTelegramDocument(TELEGRAM_BOT_TOKEN, chatId, mediaUrl, caption, threadId);
      } else {
        console.log(`Sending photo: ${mediaUrl}`);
        telegramResult = await sendTelegramPhoto(TELEGRAM_BOT_TOKEN, chatId, mediaUrl, caption, threadId);
      }
    } 
    // CASE 2: Text-only post
    else {
      console.log('Sending text-only message');
      telegramResult = await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, caption, threadId);
    }
    
    // Check Telegram API response
    if (!telegramResult.ok) {
      throw new Error(`Telegram API error: ${telegramResult.description || 'Unknown error'}`);
    }
    
    const messageId = telegramResult.result?.message_id?.toString();
    
    return {
      success: true,
      post_id: messageId
    };
    
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get error message from unknown error type
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

/**
 * Generate unique lock ID
 */
function generateLockId(): string {
  return `${RUNNER_NAME}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Convert UTC date to WEST (UTC+1) timezone
 */
function toWEST(date: Date): Date {
  const utcTime = date.getTime();
  const westTime = new Date(utcTime + (TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
  return westTime;
}

/**
 * Get current date and time in WEST timezone
 */
function getCurrentWESTDateTime(): { date: string; time: string } {
  const nowUTC = new Date();
  const nowWEST = toWEST(nowUTC);
  
  const year = nowWEST.getFullYear();
  const month = String(nowWEST.getMonth() + 1).padStart(2, '0');
  const day = String(nowWEST.getDate()).padStart(2, '0');
  const hours = String(nowWEST.getHours()).padStart(2, '0');
  const minutes = String(nowWEST.getMinutes()).padStart(2, '0');
  const seconds = String(nowWEST.getSeconds()).padStart(2, '0');
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}:${seconds}`
  };
}

// ============================================
// CORE PROCESSING FUNCTIONS
// ============================================

/**
 * Query and claim jobs from scheduled_posts table
 */
async function claimJobs(limit: number = 50): Promise<ScheduledPost[]> {
  const lockId = generateLockId();
  const nowUTC = new Date();
  const nowWEST = toWEST(nowUTC);
  
  const { date: currentDate, time: currentTime } = getCurrentWESTDateTime();
  
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log('Querying pending jobs...');
    console.log(`UTC Time: ${nowUTC.toISOString()}`);
    console.log(`WEST Time: ${nowWEST.toISOString()}`);
    console.log(`Query Date: ${currentDate}, Query Time: ${currentTime}`);
    
    console.log(`\n--- CONNECTION INFO ---`);
    console.log(`Supabase URL: ${supabaseUrl}`);
    console.log(`Table Name: scheduled_posts`);
    console.log(`Service Type Looking For: '${SERVICE_TYPE}'`);
    console.log('--- End Connection Info ---\n');

    // ✅ DIAGNOSTIC: Test basic connection with OUR service_type only
    console.log('--- DIAGNOSTIC: Testing Supabase Connection ---');
    const { data: sampleData, error: sampleError } = await supabase
      .from('scheduled_posts')
      .select('id, service_type, posting_status')
      .eq('service_type', SERVICE_TYPE)
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Cannot connect to scheduled_posts table:', sampleError);
      throw sampleError;
    }
    
    console.log(`✅ Connection successful! Sample of OUR posts (${SERVICE_TYPE}):`);
    console.log(JSON.stringify(sampleData, null, 2));
    
    // ✅ DIAGNOSTIC: Check posts matching our service_type
    const { data: serviceData, error: serviceError } = await supabase
      .from('scheduled_posts')
      .select('id, service_type, posting_status, scheduled_date, scheduled_time')
      .eq('service_type', SERVICE_TYPE)
      .limit(10);
    
    console.log(`\n--- Posts with service_type = '${SERVICE_TYPE}' ---`);
    if (serviceData && serviceData.length > 0) {
      console.log(`Found ${serviceData.length} posts:`);
      console.log(JSON.stringify(serviceData, null, 2));
    } else {
      console.log('⚠️ No posts found with this service_type');
    }
    
    // ✅ DIAGNOSTIC: Check pending posts with our service_type (ignore date/time)
    const { data: pendingData, error: pendingError } = await supabase
      .from('scheduled_posts')
      .select('id, service_type, posting_status, scheduled_date, scheduled_time')
      .eq('service_type', SERVICE_TYPE)
      .eq('posting_status', 'pending')
      .limit(10);
    
    console.log(`\n--- PENDING posts with service_type = '${SERVICE_TYPE}' (ALL DATES) ---`);
    if (pendingData && pendingData.length > 0) {
      console.log(`Found ${pendingData.length} pending posts (regardless of date/time):`);
      console.log(JSON.stringify(pendingData, null, 2));
      
      // Show which ones would match our date/time criteria
      console.log(`\nChecking which posts match date/time criteria:`);
      pendingData.forEach((post: any) => {
        const postDate = post.scheduled_date;
        const postTime = post.scheduled_time;
        const matchesDate = postDate < currentDate || (postDate === currentDate && postTime <= currentTime);
        console.log(`  Post ${post.id}:`);
        console.log(`    Date: ${postDate} (${postDate < currentDate ? 'BEFORE' : postDate === currentDate ? 'TODAY' : 'FUTURE'})`);
        console.log(`    Time: ${postTime} (${postTime <= currentTime ? 'PAST/NOW' : 'FUTURE'})`);
        console.log(`    Matches? ${matchesDate ? '✅ YES' : '❌ NO'}`);
      });
    } else {
      console.log('⚠️ No PENDING posts found with this service_type AT ALL');
      console.log('This means either:');
      console.log('  1. service_type does not match exactly (check for spaces/typos)');
      console.log('  2. All posts are in a different posting_status (not pending)');
      console.log('  3. No posts exist with this service_type');
    }
    
    console.log(`\n--- ACTUAL QUERY PARAMETERS ---`);
    console.log(`Looking for posts where:`);
    console.log(`  service_type = '${SERVICE_TYPE}'`);
    console.log(`  posting_status = 'pending'`);
    console.log(`  scheduled_date < '${currentDate}' OR (scheduled_date = '${currentDate}' AND scheduled_time <= '${currentTime}')`);
    console.log('--- End Diagnostics ---\n');

    // ✅ ACTUAL QUERY: Now find posts ready to process
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('service_type', SERVICE_TYPE)
      .eq('posting_status', 'pending')
      .or(`scheduled_date.lt.${currentDate},and(scheduled_date.eq.${currentDate},scheduled_time.lte.${currentTime})`)
      .limit(limit);

    if (error) {
      console.error('Failed to query scheduled_posts:', error);
      throw error;
    }

    console.log('\n--- QUERY RESULTS ---');
    if (!data || data.length === 0) {
      console.log('⚠️ No pending posts found matching criteria:');
      console.log(`  - service_type: '${SERVICE_TYPE}'`);
      console.log(`  - posting_status: 'pending'`);
      console.log(`  - scheduled_date <= '${currentDate}'`);
      console.log(`  - scheduled_time <= '${currentTime}'`);
      return [];
    }

    console.log(`✅ Found ${data.length} pending posts ready to process:`);
    data.forEach((post: any) => {
      console.log(`  - ID: ${post.id}`);
      console.log(`    Service: ${post.service_type}`);
      console.log(`    Status: ${post.posting_status}`);
      console.log(`    Scheduled: ${post.scheduled_date} ${post.scheduled_time}`);
    });
    console.log('--- End Query Results ---\n');

    const claimedIds = data.map((post: any) => post.id);
    
    // ✅ SAFETY: Update ONLY posts matching our service_type
    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({
        posting_status: 'processing',
        lock_id: lockId,
        run_by: RUNNER_NAME,
        attempted_at: nowUTC.toISOString()
      })
      .in('id', claimedIds)
      .eq('service_type', SERVICE_TYPE); // ← SAFETY CHECK: Only update OUR posts

    if (updateError) {
      console.error('Failed to update posts to processing:', updateError);
      throw updateError;
    }

    console.log(`Claimed ${claimedIds.length} jobs`);
    return data as ScheduledPost[];

  } catch (error) {
    console.error('Error in claimJobs:', getErrorMessage(error));
    throw error;
  }
}

/**
 * Process a single scheduled post
 */
async function processPost(post: ScheduledPost): Promise<void> {
  const now = new Date();
  console.log(`\n--- Processing Post ${post.id} ---`);
  console.log(`Platform: ${post.social_platform}`);
  console.log(`Scheduled: ${post.scheduled_date} ${post.scheduled_time}`);

  try {
    // ✅ VALIDATE POST DATA
    if (!post.channel_group_id) {
      throw new Error('Missing channel_group_id (Telegram Chat ID)');
    }

    if (!post.post_content && !post.description && !post.title) {
      throw new Error('Missing post content (title or description required)');
    }

    // ✅ POST TO TELEGRAM
    const postResult = await postToTelegram(post);

    if (!postResult.success) {
      throw new Error(postResult.error || 'Failed to post to Telegram');
    }

    const externalPostId = postResult.post_id || 'unknown';
    console.log(`✅ Successfully posted to Telegram`);
    console.log(`External Post ID: ${externalPostId}`);

    // ✅ UPDATE scheduled_posts TO SUCCESS
    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({
        posting_status: 'success',
        completed_at: now.toISOString(),
        external_post_id: externalPostId,
        last_error: null
      })
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE); // ← SAFETY CHECK: Only update OUR posts

    if (updateError) {
      throw new Error(`Failed to update scheduled_posts: ${getErrorMessage(updateError)}`);
    }

    // ✅ INSERT INTO dashboard_posts
    const dashboardPost = {
      scheduled_post_id: post.id,
      social_platform: post.social_platform,
      post_content: post.post_content,
      external_post_id: externalPostId,
      posted_at: now.toISOString(),
      url: externalPostId !== 'unknown' 
        ? `https://t.me/c/${post.channel_group_id?.replace('-100', '')}/${externalPostId}`
        : post.url,
      channel_group_id: post.channel_group_id,
      thread_id: post.thread_id
    };

    const { error: insertError } = await supabase
      .from('dashboard_posts')
      .insert(dashboardPost);

    if (insertError) {
      console.warn(`⚠️ Failed to insert into dashboard_posts: ${getErrorMessage(insertError)}`);
    } else {
      console.log(`✅ Inserted into dashboard_posts`);
    }

    console.log(`✅ Post ${post.id} completed successfully`);

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`❌ Failed to process post ${post.id}:`, errorMessage);

    // ✅ DETERMINE IF SHOULD RETRY
    const maxRetries = 3;
    const newAttempts = (post.attempts || 0) + 1;
    const shouldRetry = newAttempts < maxRetries;
    const finalStatus = shouldRetry ? 'pending' : 'failed';

    // ✅ UPDATE scheduled_posts WITH FAILURE
    const { error: failError } = await supabase
      .from('scheduled_posts')
      .update({
        posting_status: finalStatus,
        completed_at: shouldRetry ? null : now.toISOString(),
        last_error: errorMessage,
        lock_id: null,
        next_retry_at: shouldRetry ? new Date(now.getTime() + 300000).toISOString() : null
      })
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE); // ← SAFETY CHECK: Only update OUR posts

    if (failError) {
      console.error(`Failed to update error status: ${getErrorMessage(failError)}`);
    }

    console.log(`Post ${post.id} marked as ${finalStatus} (attempt ${newAttempts}/${maxRetries})`);
    
    throw error;
  }
}

/**
 * Main execution
 */
async function main(): Promise<ProcessResult> {
  const startTime = new Date();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Render Cron Job Started: ${startTime.toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  const errors: string[] = [];
  let succeeded = 0;
  let failed = 0;

  try {
    const posts = await claimJobs(50);

    if (posts.length === 0) {
      console.log('✅ No pending posts to process');
      return {
        total_claimed: 0,
        succeeded: 0,
        failed: 0,
        errors: [],
        timestamp: startTime.toISOString()
      };
    }

    console.log(`\n📋 Processing ${posts.length} posts...\n`);

    for (const post of posts) {
      try {
        await processPost(post);
        succeeded++;
      } catch (error) {
        failed++;
        errors.push(`Post ${post.id}: ${getErrorMessage(error)}`);
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Render Cron Job Completed`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Total Claimed: ${posts.length}`);
    console.log(`✅ Succeeded: ${succeeded}`);
    console.log(`❌ Failed: ${failed}`);
    if (errors.length > 0) {
      console.log(`\nErrors:`);
      errors.forEach(err => console.log(`  - ${err}`));
    }
    console.log(`${'='.repeat(60)}\n`);

    return {
      total_claimed: posts.length,
      succeeded,
      failed,
      errors,
      timestamp: startTime.toISOString()
    };

  } catch (error) {
    console.error('❌ Fatal error in main execution:', getErrorMessage(error));
    
    return {
      total_claimed: 0,
      succeeded,
      failed,
      errors: [getErrorMessage(error), ...errors],
      timestamp: startTime.toISOString()
    };
  }
}

// ✅ EXECUTE
main()
  .then(result => {
    const exitCode = result.failed > 0 ? 1 : 0;
    console.log(`Exiting with code: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
