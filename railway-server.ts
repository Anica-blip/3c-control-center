// Railway HTTP Server for GitHub - Workflow
// Express.js wrapper that provides HTTP endpoint for GitHub Actions
// Port 8080 with /run endpoint
// TIMEZONE: WEST (UTC+1)

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// ✅ ENVIRONMENT VARIABLES - WITH TRIMMING
const PORT = process.env.PORT || 8080;
const CRON_SUPABASE_DB_URL = (process.env.CRON_SUPABASE_DB_URL || '').trim();
const CRON_RUNNER_PASSWORD = (process.env.CRON_RUNNER_PASSWORD || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const TELEGRAM_PUBLISHER_BOT_TOKEN = (process.env.TELEGRAM_PUBLISHER_BOT_TOKEN || '').trim();

// ✅ RUNNER IDENTITY
const RUNNER_NAME = 'Railway HTTP Server';
const SERVICE_TYPE = 'GitHub - Workflow';

// ✅ TIMEZONE CONFIGURATION - WEST = UTC+1
const TIMEZONE_OFFSET_HOURS = 1;

console.log('\n--- RAILWAY HTTP SERVER STARTING ---');
console.log(`Service Type: ${SERVICE_TYPE}`);
console.log(`Port: ${PORT}`);
console.log(`Timezone: WEST (UTC+${TIMEZONE_OFFSET_HOURS})`);

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

let supabase: any = null;
let supabaseUrl: string = '';

// Initialize Supabase client
if (CRON_SUPABASE_DB_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseUrl = extractSupabaseUrl(CRON_SUPABASE_DB_URL);
    
    console.log('\n--- SUPABASE CONNECTION DIAGNOSTIC ---');
    console.log(`Extracted Supabase URL: ${supabaseUrl}`);
    console.log(`Database URL (masked): ${CRON_SUPABASE_DB_URL.substring(0, 30)}...`);
    console.log(`Service Role Key (masked): ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...${SUPABASE_SERVICE_ROLE_KEY.slice(-10)}`);
    console.log(`Key length: ${SUPABASE_SERVICE_ROLE_KEY.length} characters`);
    console.log(`Key starts with 'eyJ': ${SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')}`);
    console.log('--- End Diagnostic ---\n');
    
    supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
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
    
    console.log(`✅ Supabase client initialized`);
    console.log(`Supabase URL: ${supabaseUrl}`);
    console.log(`Service Type Filter: ${SERVICE_TYPE}`);
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
  }
}

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
  success: boolean;
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
  const responseText = await response.text();
  
  if (!response.ok) {
    console.error(`❌ Telegram API error response (${response.status}):`);
    console.error('Raw response:', responseText);
    
    try {
      const errorJson = JSON.parse(responseText);
      const description = errorJson.description || errorJson.error || 'Unknown error';
      const errorCode = errorJson.error_code || response.status;
      
      return {
        ok: false,
        description: `HTTP ${errorCode}: ${description}`
      };
    } catch (jsonError) {
      return {
        ok: false,
        description: `HTTP ${response.status}: ${responseText || 'Empty response body'}`
      };
    }
  }

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
 * FIXES: 
 * - Single asterisk italic (*text*)
 * - Character profile from postContent or top-level fields
 * - Proper link formatting
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
  
  // ✅ FIX: Check for character profile in BOTH postContent AND top-level post fields
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
    
    // ✅ FIX: Convert markdown links FIRST (before other replacements)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
    
    // Convert bold **text** to <b>text</b>
    text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    
    // ✅ FIX: Convert italic *text* to <i>text</i> (single asterisk - AFTER bold)
    text = text.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<i>$1</i>');
    
    // Convert italic _text_ to <i>text</i> (underscore alternative)
    text = text.replace(/(?<!\w)_([^_]+?)_(?!\w)/g, '<i>$1</i>');
    
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

  return await parseTelegramResponse(response);
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

    return await parseTelegramResponse(response);
  }
  
  // If sending as Buffer (direct upload)
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

    return await parseTelegramResponse(response);
  }
  
  // If sending as Buffer (direct upload)
  console.log(`📤 Preparing video upload:`);
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Filename: ${filename || 'video.mp4'}`);
  console.log(`   Buffer size: ${videoUrlOrBuffer.length} bytes`);
  console.log(`   Caption length: ${caption.length} chars`);
  if (threadId) console.log(`   Thread ID: ${threadId}`);
  
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
      console.log(`   Message thread ID: ${threadIdMatch[1]}`);
    }
  }
  
  console.log(`🚀 Sending video to Telegram API...`);
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  return await parseTelegramResponse(response);
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

    return await parseTelegramResponse(response);
  }
  
  // If sending as Buffer (direct upload)
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
    
    // ✅ TELEGRAM CAPTION LIMIT: Max 1024 characters
    if (caption.length > 1024) {
      throw new Error(`Caption too long (${caption.length} chars). Please shorten content to under 1024 characters.`);
    }
    
    // ✅ Check media files with priority order
    let mediaFiles: any[] = [];
    let mediaSource = 'none';
    
    if (post.media_files && Array.isArray(post.media_files) && post.media_files.length > 0) {
      mediaFiles = post.media_files;
      mediaSource = 'media_files column';
      console.log(`✅ Using media from: ${mediaSource}`);
    } else {
      const postContent = post.post_content as any;
      if (postContent?.media_files && Array.isArray(postContent.media_files) && postContent.media_files.length > 0) {
        mediaFiles = postContent.media_files;
        mediaSource = 'post_content.media_files';
        console.log(`✅ Using media from: ${mediaSource}`);
      }
    }
    
    let telegramResult: TelegramResponse;
    
    // CASE 1: Has media files
    if (mediaFiles.length > 0) {
      const firstMedia = mediaFiles[0];
      const mediaUrl = firstMedia.url || firstMedia.src || firstMedia.supabaseUrl || firstMedia;
      
      console.log(`📦 Media file detected:`);
      console.log(`   Source: ${mediaSource}`);
      console.log(`   Type: ${firstMedia.type || 'unknown'}`);
      console.log(`   Name: ${firstMedia.name || 'unknown'}`);
      console.log(`   Size: ${firstMedia.size ? `${(firstMedia.size / 1024 / 1024).toFixed(2)} MB` : 'unknown'}`);
      console.log(`   URL: ${mediaUrl}`);
      
      if (typeof mediaUrl !== 'string') {
        throw new Error('Invalid media URL format');
      }
      
      // Determine media type
      const mediaType = firstMedia.type?.toLowerCase() || '';
      const isVideo = mediaType === 'video' || /\.(mp4|mov|avi|mkv)$/i.test(mediaUrl);
      const isDocument = mediaType === 'document' || /\.(pdf|doc|docx|xls|xlsx|txt)$/i.test(mediaUrl);
      
      // Download file as Buffer and upload to Telegram
      console.log(`⬇️ Downloading media file as Buffer...`);
      const { buffer, filename } = await downloadFile(mediaUrl);
      console.log(`✅ Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB as ${filename}`);
      
      if (isVideo) {
        console.log(`📹 Uploading video to Telegram: ${filename}`);
        telegramResult = await sendTelegramVideo(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      } else if (isDocument) {
        console.log(`📄 Uploading document to Telegram: ${filename}`);
        telegramResult = await sendTelegramDocument(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      } else {
        console.log(`🖼️ Uploading photo to Telegram: ${filename}`);
        telegramResult = await sendTelegramPhoto(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      }
    } 
    // CASE 2: Text-only post
    else {
      console.log('💬 Sending text-only message (no media detected)');
      telegramResult = await sendTelegramMessage(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, caption, threadId);
    }
    
    // Check Telegram API response
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
  const nowUTC = new Date();
  const nowWEST = toWEST(nowUTC);
  
  const { date: currentDate, time: currentTime } = getCurrentWESTDateTime();
  
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log('Querying pending jobs...');
    console.log(`UTC Time: ${nowUTC.toISOString()}`);
    console.log(`WEST Time: ${nowWEST.toISOString()}`);
    console.log(`Query Date: ${currentDate}, Query Time: ${currentTime}`);
    
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
      console.log('⚠️ No pending posts found');
      return [];
    }

    console.log(`✅ Found ${data.length} pending posts`);
    const claimedIds = data.map((post: any) => post.id);
    
    // Update post_status to pending (don't touch posting_status)
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
    // Validate post data
    if (!post.channel_group_id) {
      throw new Error('Missing channel_group_id (Telegram Chat ID)');
    }

    if (!post.post_content && !post.description && !post.title) {
      throw new Error('Missing post content (title or description required)');
    }

    // Post to Telegram
    const postResult = await postToTelegram(post);

    if (!postResult.success) {
      throw new Error(postResult.error || 'Failed to post to Telegram');
    }

    const externalPostId = postResult.post_id || 'unknown';
    console.log(`✅ Successfully posted to Telegram`);
    console.log(`External Post ID: ${externalPostId}`);

    // Update post_status to 'sent' (don't touch posting_status)
    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({
        post_status: 'sent'
      })
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE);

    if (updateError) {
      throw new Error(`Failed to update scheduled_posts: ${getErrorMessage(updateError)}`);
    }

    // Insert into dashboard_posts
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

    // Determine if should retry
    const maxRetries = 3;
    const newAttempts = (post.attempts || 0) + 1;
    const shouldRetry = newAttempts < maxRetries;

    const updateData: any = {
      post_status: 'failed',
      attempts: newAttempts
    };
    
    // If max retries reached, mark posting_status as failed
    if (!shouldRetry) {
      updateData.posting_status = 'failed';
      console.log(`⚠️ Max retries reached (${maxRetries}). Marking as permanently failed.`);
    }

    const { error: failError } = await supabase
      .from('scheduled_posts')
      .update(updateData)
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE);

    if (failError) {
      console.error(`Failed to update error status: ${getErrorMessage(failError)}`);
    }

    console.log(`Post ${post.id} marked as failed (attempt ${newAttempts}/${maxRetries})`);
    
    throw error;
  }
}

/**
 * Main cron job execution
 */
async function runCronJob(): Promise<ProcessResult> {
  const startTime = new Date();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Railway HTTP Server Job Started: ${startTime.toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  const errors: string[] = [];
  let succeeded = 0;
  let failed = 0;

  try {
    const posts = await claimJobs(50);

    if (posts.length === 0) {
      console.log('✅ No pending posts to process');
      return {
        success: true,
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
    console.log(`Railway HTTP Server Job Completed`);
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
      success: failed === 0,
      total_claimed: posts.length,
      succeeded,
      failed,
      errors,
      timestamp: startTime.toISOString()
    };

  } catch (error) {
    console.error('❌ Fatal error in runCronJob:', getErrorMessage(error));
    
    return {
      success: false,
      total_claimed: 0,
      succeeded,
      failed,
      errors: [getErrorMessage(error), ...errors],
      timestamp: startTime.toISOString()
    };
  }
}

// ============================================
// EXPRESS ENDPOINTS
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'Railway HTTP Server is running',
    service: SERVICE_TYPE,
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: SERVICE_TYPE,
    timestamp: new Date().toISOString()
  });
});

// Main cron endpoint - POST /run
app.post('/run', async (req, res) => {
  try {
    // Validate authorization
    const authHeader = req.headers['x-cron-password'] || req.headers['authorization'];
    
    if (!authHeader || authHeader !== CRON_RUNNER_PASSWORD) {
      console.warn('❌ Unauthorized request attempt');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid or missing X-Cron-Password header'
      });
    }

    // Validate required env vars
    if (!supabase || !TELEGRAM_PUBLISHER_BOT_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Server not properly configured - missing credentials'
      });
    }

    console.log('\n🚀 Received cron trigger request');
    
    // Run the cron job
    const result = await runCronJob();
    
    // Return result
    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(result);
    
  } catch (error) {
    console.error('❌ Error in /run endpoint:', getErrorMessage(error));
    res.status(500).json({
      success: false,
      error: getErrorMessage(error),
      total_claimed: 0,
      succeeded: 0,
      failed: 0,
      errors: [getErrorMessage(error)],
      timestamp: new Date().toISOString()
    });
  }
});

// Alternative endpoint - POST /api/run
app.post('/api/run', async (req, res) => {
  return app._router.handle(
    Object.assign(req, { url: '/run', originalUrl: '/api/run' }), 
    res
  );
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n✅ Railway HTTP Server listening on port ${PORT}`);
  console.log(`Service: ${SERVICE_TYPE}`);
  console.log(`Endpoints:`);
  console.log(`  GET  / - Status check`);
  console.log(`  GET  /health - Health check`);
  console.log(`  POST /run - Trigger cron job (requires X-Cron-Password header)`);
  console.log(`  POST /api/run - Alternative trigger endpoint`);
  console.log(`\nServer ready to receive requests from GitHub Actions!\n`);
});
