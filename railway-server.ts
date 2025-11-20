// Railway Gateway for GitHub - Workflow - HTTP Server with Telegram Posting
// Receives HTTP requests from GitHub Actions and posts to Telegram
// TIMEZONE: WEST (UTC+1)

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// ✅ ENVIRONMENT VARIABLES - WITH TRIMMING
const CRON_SUPABASE_DB_URL = (process.env.CRON_SUPABASE_DB_URL || '').trim();
const CRON_RUNNER_PASSWORD = (process.env.CRON_RUNNER_PASSWORD || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const TELEGRAM_PUBLISHER_BOT_TOKEN = (process.env.TELEGRAM_PUBLISHER_BOT_TOKEN || '').trim();
const AUTHORIZATION = (process.env.AUTHORIZATION || '').trim();

// ✅ RUNNER IDENTITY
const RUNNER_NAME = 'GitHub - Workflow';
const SERVICE_TYPE = 'GitHub - Workflow';

// ✅ TIMEZONE CONFIGURATION - WEST = UTC+1
const TIMEZONE_OFFSET_HOURS = 1;

// ✅ VALIDATE CREDENTIALS
console.log('\n--- ENVIRONMENT VARIABLE CHECK ---');
if (!CRON_SUPABASE_DB_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_PUBLISHER_BOT_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('  CRON_SUPABASE_DB_URL:', CRON_SUPABASE_DB_URL ? 'SET' : 'MISSING');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
  console.error('  TELEGRAM_PUBLISHER_BOT_TOKEN:', TELEGRAM_PUBLISHER_BOT_TOKEN ? 'SET' : 'MISSING');
  console.error('  CRON_RUNNER_PASSWORD:', CRON_RUNNER_PASSWORD ? 'SET' : 'MISSING');
  
  if (!CRON_SUPABASE_DB_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_PUBLISHER_BOT_TOKEN || !CRON_RUNNER_PASSWORD) {
    process.exit(1);
  }
}

console.log('✅ All required environment variables are set\n');

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

// ✅ DIAGNOSTIC: Log connection details (mask sensitive parts)
console.log('\n--- SUPABASE CONNECTION DIAGNOSTIC ---');
console.log(`Extracted Supabase URL: ${supabaseUrl}`);
console.log(`Database URL (masked): ${CRON_SUPABASE_DB_URL.substring(0, 30)}...`);
console.log(`Service Role Key (masked): ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...${SUPABASE_SERVICE_ROLE_KEY.slice(-10)}`);
console.log(`Key length: ${SUPABASE_SERVICE_ROLE_KEY.length} characters`);
console.log(`Key starts with 'eyJ': ${SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')}`);
console.log('--- End Diagnostic ---\n');

// ✅ CREATE SUPABASE CLIENT - ONLY USE SERVICE_ROLE_KEY FOR SUPABASE AUTH
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

console.log(`[${new Date().toISOString()}] Railway Gateway for GitHub - Workflow initialized`);
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Service Type Filter: ${SERVICE_TYPE}`);
console.log(`Timezone: WEST (UTC+${TIMEZONE_OFFSET_HOURS})`);

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
 * Parse Telegram API response with proper error handling
 */
async function parseTelegramResponse(response: Response): Promise<TelegramResponse> {
  // Read response body as text first (only consume stream once)
  const responseText = await response.text();
  
  // Check if response is ok
  if (!response.ok) {
    console.error(`❌ Telegram API error response (${response.status}):`);
    console.error('Raw response:', responseText);
    
    // Try to parse as JSON to extract error details
    try {
      const errorJson = JSON.parse(responseText);
      
      // Extract the error description from Telegram's JSON response
      const description = errorJson.description || errorJson.error || 'Unknown error';
      const errorCode = errorJson.error_code || response.status;
      
      return {
        ok: false,
        description: `HTTP ${errorCode}: ${description}`
      };
    } catch (jsonError) {
      // Not JSON, return raw text
      return {
        ok: false,
        description: `HTTP ${response.status}: ${responseText || 'Empty response body'}`
      };
    }
  }

  // Parse successful response as JSON
  try {
    const json = JSON.parse(responseText);
    return json;
  } catch (error) {
    console.error('❌ Failed to parse Telegram response as JSON:');
    console.error(responseText.substring(0, 1000));
    return {
      ok: false,
      description: `Invalid JSON response: ${responseText.substring(0, 200)}`
    };
  }
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
  
  const name = postContent.name || post.name;
  const username = postContent.username || post.username;
  const role = postContent.role || post.role;
  
  // Add character profile header
  if (name) {
    caption += `<b>${name}</b>\n`;
    if (username) {
      const formattedUsername = username.startsWith('@') ? username : `@${username}`;
      caption += `${formattedUsername}\n`;
    }
    if (role) {
      caption += `${role}\n`;
    }
    caption += `\n`;
  }
  
  // Helper function to convert markdown to Telegram HTML
  function formatText(text: string): string {
    if (!text) return '';
    
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
    text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    text = text.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<i>$1</i>');
    text = text.replace(/(?<!\w)_([^_]+?)_(?!\w)/g, '<i>$1</i>');
    text = text.replace(/__(.+?)__/g, '<u>$1</u>');
    text = text.replace(/~~(.+?)~~/g, '<s>$1</s>');
    text = text.replace(/`(.+?)`/g, '<code>$1</code>');
    
    return text;
  }
  
  if (postContent.title) {
    caption += `${formatText(postContent.title)}\n\n`;
  }
  
  if (postContent.description) {
    caption += `${formatText(postContent.description)}\n`;
  }
  
  if (postContent.hashtags && Array.isArray(postContent.hashtags) && postContent.hashtags.length > 0) {
    caption += `\n${postContent.hashtags.map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;
  }
  
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

  return await parseTelegramResponse(response);
}

/**
 * ✅ FIX #1: Send animation/GIF to Telegram with caption
 */
async function sendTelegramAnimation(
  botToken: string,
  chatId: string,
  animationUrlOrBuffer: string | Buffer,
  caption: string,
  threadId?: string,
  filename?: string
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendAnimation`;
  
  if (typeof animationUrlOrBuffer === 'string') {
    const body: any = {
      chat_id: chatId,
      animation: animationUrlOrBuffer,
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

    return await parseTelegramResponse(response);
  }
  
  const blob = new Blob([animationUrlOrBuffer], { type: 'image/gif' });
  const file = new File([blob], filename || 'animation.gif', { type: 'image/gif' });
  
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('animation', file);
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
    body: formData
  });

  return await parseTelegramResponse(response);
}

/**
 * Send photo to Telegram with caption
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

    return await parseTelegramResponse(response);
  }
  
  const blob = new Blob([photoUrlOrBuffer], { type: 'image/jpeg' });
  const file = new File([blob], filename || 'photo.jpg', { type: 'image/jpeg' });
  
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('photo', file);
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
    body: formData
  });

  return await parseTelegramResponse(response);
}

/**
 * Send video to Telegram with caption
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

    return await parseTelegramResponse(response);
  }
  
  const blob = new Blob([videoUrlOrBuffer], { type: 'video/mp4' });
  const file = new File([blob], filename || 'video.mp4', { type: 'video/mp4' });
  
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('video', file);
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
    body: formData
  });

  return await parseTelegramResponse(response);
}

/**
 * Send document to Telegram with caption
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

    return await parseTelegramResponse(response);
  }
  
  const blob = new Blob([documentUrlOrBuffer], { type: 'application/pdf' });
  const file = new File([blob], filename || 'document.pdf', { type: 'application/pdf' });
  
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('document', file);
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
    body: formData
  });

  return await parseTelegramResponse(response);
}

/**
 * Post content to Telegram based on media type
 */
async function postToTelegram(post: ScheduledPost): Promise<{ success: boolean; post_id?: string; error?: string }> {
  try {
    const chatId = post.channel_group_id!;
    const threadId = post.thread_id || undefined;
    const caption = buildCaption(post);
    
    // ✅ FIX #2: TELEGRAM CAPTION LIMIT - Max 1024 characters
    if (caption.length > 1024) {
      throw new Error(`Caption too long (${caption.length} chars). Please shorten content to under 1024 characters.`);
    }
    
    let mediaFiles: any[] = [];
    let mediaSource = 'none';
    
    if (post.media_files && Array.isArray(post.media_files) && post.media_files.length > 0) {
      mediaFiles = post.media_files;
      mediaSource = 'media_files column';
    } else {
      const postContent = post.post_content as any;
      if (postContent?.media_files && Array.isArray(postContent.media_files) && postContent.media_files.length > 0) {
        mediaFiles = postContent.media_files;
        mediaSource = 'post_content.media_files';
      }
    }
    
    let telegramResult: TelegramResponse;
    
    if (mediaFiles.length > 0) {
      const firstMedia = mediaFiles[0];
      const mediaUrl = firstMedia.url || firstMedia.src || firstMedia.supabaseUrl || firstMedia;
      
      if (typeof mediaUrl !== 'string') {
        throw new Error('Invalid media URL format');
      }
      
      // ✅ FIX #1: Determine media type - CHECK FILE EXTENSION FIRST
      const mediaType = firstMedia.type?.toLowerCase() || '';
      const isGif = mediaType === 'animation' || mediaType === 'gif' || /\.(gif)$/i.test(mediaUrl);
      const isVideo = mediaType === 'video' || /\.(mp4|mov|avi|mkv)$/i.test(mediaUrl);
      const isDocument = mediaType === 'document' || /\.(pdf|doc|docx|xls|xlsx|txt)$/i.test(mediaUrl);
      
      const { buffer, filename } = await downloadFile(mediaUrl);
      
      // ✅ FIX #1: GIF/ANIMATION CHECK FIRST
      if (isGif) {
        console.log(`🎞️ Uploading GIF/animation to Telegram: ${filename}`);
        telegramResult = await sendTelegramAnimation(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      } else if (isVideo) {
        console.log(`📹 Uploading video to Telegram: ${filename}`);
        telegramResult = await sendTelegramVideo(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      } else if (isDocument) {
        console.log(`📄 Uploading document to Telegram: ${filename}`);
        telegramResult = await sendTelegramDocument(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      } else {
        console.log(`🖼️ Uploading photo to Telegram: ${filename}`);
        telegramResult = await sendTelegramPhoto(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      }
    } else {
      console.log('💬 Sending text-only message');
      telegramResult = await sendTelegramMessage(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, caption, threadId);
    }
    
    if (!telegramResult.ok) {
      throw new Error(`Telegram API error: ${telegramResult.description || 'Unknown error'}`);
    }
    
    const messageId = telegramResult.result?.message_id?.toString();
    console.log(`✅ Telegram upload successful! Message ID: ${messageId}`);
    
    return {
      success: true,
      post_id: messageId
    };
    
  } catch (error) {
    console.error('❌ postToTelegram failed:', getErrorMessage(error));
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

function toWEST(date: Date): Date {
  const utcTime = date.getTime();
  const westTime = new Date(utcTime + (TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
  return westTime;
}

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
 * ✅ UPDATED: Now uses scheduled_date as timestamptz (includes both date and time)
 */
async function claimJobs(limit: number = 50): Promise<ScheduledPost[]> {
  const nowUTC = new Date();
  const nowWEST = toWEST(nowUTC);
  
  try {
    console.log(`\nQuerying pending jobs...`);
    console.log(`UTC Time: ${nowUTC.toISOString()}`);
    console.log(`WEST Time: ${nowWEST.toISOString()}`);
    
    // ✅ ACTUAL QUERY: Now find posts ready to process
    // NOTE: scheduled_date is now timestamptz (includes both date and time)
    // We compare directly against the current WEST time
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('service_type', SERVICE_TYPE)
      .eq('posting_status', 'pending')
      .lte('scheduled_date', nowWEST.toISOString())
      .limit(limit);

    if (error) {
      console.error('Failed to query scheduled_posts:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No pending posts found');
      return [];
    }

    console.log(`✅ Found ${data.length} pending posts ready to process`);
    data.forEach((post: any) => {
      console.log(`  - ID: ${post.id}, Scheduled: ${post.scheduled_date}`);
    });

    const claimedIds = data.map((post: any) => post.id);
    
    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({
        post_status: 'pending'
      })
      .in('id', claimedIds)
      .eq('service_type', SERVICE_TYPE);

    if (updateError) {
      console.error('Failed to update posts to pending:', updateError);
      throw updateError;
    }

    return data as ScheduledPost[];

  } catch (error) {
    console.error('Error in claimJobs:', getErrorMessage(error));
    throw error;
  }
}

async function processPost(post: ScheduledPost): Promise<void> {
  const now = new Date();
  console.log(`\n--- Processing Post ${post.id} ---`);

  try {
    if (!post.channel_group_id) {
      throw new Error('Missing channel_group_id');
    }

    if (!post.post_content && !post.description && !post.title) {
      throw new Error('Missing post content');
    }

    const postResult = await postToTelegram(post);

    if (!postResult.success) {
      throw new Error(postResult.error || 'Failed to post to Telegram');
    }

    const externalPostId = postResult.post_id || 'unknown';

    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({
        posting_status: 'sent',  // ⭐ Prevent duplicate posts
        post_status: 'sent',
        updated_at: now.toISOString()
      })
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE);

    if (updateError) {
      throw new Error(`Failed to update scheduled_posts: ${getErrorMessage(updateError)}`);
    }

    // ✅ FIX #3: INSERT INTO dashboard_posts with ALL 27 fields
    const postContent = post.post_content as any;
    
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
      thread_id: post.thread_id,
      character_profile: post.character_profile || postContent?.character_profile || null,
      name: post.name || postContent?.name || null,
      username: post.username || postContent?.username || null,
      role: post.role || postContent?.role || null,
      character_avatar: post.character_avatar || postContent?.character_avatar || null,
      title: post.title || postContent?.title || null,
      description: post.description || postContent?.description || null,
      hashtags: post.hashtags || postContent?.hashtags || null,
      keywords: post.keywords || postContent?.keywords || null,
      cta: post.cta || postContent?.cta || null,
      theme: post.theme || postContent?.theme || null,
      audience: post.audience || postContent?.audience || null,
      voice_style: post.voice_style || postContent?.voice_style || null,
      media_type: post.media_type || postContent?.media_type || null,
      template_type: post.template_type || postContent?.template_type || null,
      scheduled_date: post.scheduled_date,
      scheduled_time: post.scheduled_time,
      user_id: post.user_id || null,
      created_by: post.created_by || null,
      content_id: post.content_id || null,
      platform_id: post.platform_id || null,
      media_files: post.media_files || postContent?.media_files || null,
      selected_platforms: post.selected_platforms || postContent?.selected_platforms || null
    };

    const { error: insertError } = await supabase
      .from('dashboard_posts')
      .insert(dashboardPost);

    if (insertError) {
      console.warn(`⚠️ Failed to insert into dashboard_posts: ${getErrorMessage(insertError)}`);
    } else {
      console.log(`✅ Inserted into dashboard_posts`);
    }

    // ✅ FIX #4: SOFT-DELETE
    const { error: deleteError } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE);

    if (deleteError) {
      console.warn(`⚠️ Failed to delete from scheduled_posts: ${getErrorMessage(deleteError)}`);
    } else {
      console.log(`✅ Deleted post ${post.id} from scheduled_posts`);
    }

    console.log(`✅ Post ${post.id} completed successfully`);

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`❌ Failed to process post ${post.id}:`, errorMessage);

    const maxRetries = 3;
    const newAttempts = (post.attempts || 0) + 1;
    const shouldRetry = newAttempts < maxRetries;

    const updateData: any = {
      post_status: 'failed',
      attempts: newAttempts
    };
    
    if (!shouldRetry) {
      updateData.posting_status = 'failed';
    }

    const { error: failError } = await supabase
      .from('scheduled_posts')
      .update(updateData)
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE);

    if (failError) {
      console.error(`Failed to update error status: ${getErrorMessage(failError)}`);
    }
    
    throw error;
  }
}

async function processJobs(): Promise<ProcessResult> {
  const startTime = new Date();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing Started: ${startTime.toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  const errors: string[] = [];
  let succeeded = 0;
  let failed = 0;

  try {
    const posts = await claimJobs(50);

    if (posts.length === 0) {
      return {
        total_claimed: 0,
        succeeded: 0,
        failed: 0,
        errors: [],
        timestamp: startTime.toISOString()
      };
    }

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
    console.log(`Processing Completed`);
    console.log(`Duration: ${duration}ms`);
    console.log(`✅ Succeeded: ${succeeded}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      total_claimed: posts.length,
      succeeded,
      failed,
      errors,
      timestamp: startTime.toISOString()
    };

  } catch (error) {
    console.error('❌ Fatal error in processJobs:', getErrorMessage(error));
    
    return {
      total_claimed: 0,
      succeeded,
      failed,
      errors: [getErrorMessage(error), ...errors],
      timestamp: startTime.toISOString()
    };
  }
}

// ============================================
// HTTP ENDPOINT
// ============================================

app.post('/run', async (req, res) => {
  const startTime = Date.now();
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${new Date().toISOString()}] Received request from GitHub Actions`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    const authHeader = req.headers['x-cron-password'] || req.headers['authorization'];
    
    if (!authHeader) {
      console.error('❌ Missing authorization header');
      return res.status(401).json({
        success: false,
        error: 'Missing X-Cron-Password or Authorization header'
      });
    }
    
    const providedPassword = typeof authHeader === 'string' 
      ? authHeader.replace(/^Bearer\s+/i, '').trim()
      : authHeader;
    
    if (providedPassword !== CRON_RUNNER_PASSWORD) {
      console.error('❌ Invalid authorization password');
      return res.status(403).json({
        success: false,
        error: 'Invalid authorization password'
      });
    }
    
    console.log('✅ Authorization validated');
    
    const result = await processJobs();
    
    const duration = Date.now() - startTime;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Request completed in ${duration}ms`);
    console.log(`${'='.repeat(80)}\n`);
    
    return res.status(200).json({
      success: true,
      runner: RUNNER_NAME,
      service_type: SERVICE_TYPE,
      result: result
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Request failed after ${duration}ms:`, error);
    
    return res.status(500).json({
      success: false,
      error: getErrorMessage(error)
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'Railway Gateway for GitHub - Workflow is running',
    service_type: SERVICE_TYPE,
    runner_name: RUNNER_NAME,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 Railway Gateway for GitHub - Workflow`);
  console.log(`${'='.repeat(80)}`);
  console.log(`✅ Server started successfully`);
  console.log(`📡 Listening on port: ${PORT}`);
  console.log(`🔐 Authorization: ${CRON_RUNNER_PASSWORD ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🎯 Service Type: ${SERVICE_TYPE}`);
  console.log(`⏰ Timezone: WEST (UTC+${TIMEZONE_OFFSET_HOURS})`);
  console.log(`${'='.repeat(80)}\n`);
});
