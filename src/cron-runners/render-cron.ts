// Render Cron Job - Direct Supabase Connection
// Service Type: Render Cron Job
// Bot Token: TELEGRAM_BOT_TOKEN (Aurion bot)
// TIMEZONE: WEST (UTC+1)
// ✅ FIXED: Now supports GIF animation via sendAnimation API

import { createClient } from '@supabase/supabase-js';

// ✅ ENVIRONMENT VARIABLES - WITH TRIMMING
const CRON_SUPABASE_DB_URL = (process.env.CRON_SUPABASE_DB_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();

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
  process.exit(1);
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

// ✅ CREATE SUPABASE CLIENT
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

console.log(`[${new Date().toISOString()}] Render Cron Job initialized`);
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
  [key: string]: any;
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

// ============================================
// MEDIA TYPE DETECTION - NEW!
// ============================================

/**
 * ✅ NEW: Detect media type for proper Telegram API selection
 * Order matters: GIF MUST be checked BEFORE photo!
 */
function detectMediaType(firstMedia: any, mediaUrl: string): {
  isVideo: boolean;
  isAnimation: boolean;
  isDocument: boolean;
  isPhoto: boolean;
} {
  const mediaType = (firstMedia.type || '').toLowerCase();
  const fileName = (firstMedia.name || mediaUrl).toLowerCase();
  
  // ✅ CHECK 1: Animated GIF/Animation (MUST BE FIRST!)
  const isAnimation = 
    mediaType === 'animation' || 
    mediaType === 'gif' ||
    fileName.endsWith('.gif') ||
    /\.gif$/i.test(mediaUrl);
  
  // ✅ CHECK 2: Video
  const isVideo = 
    mediaType === 'video' || 
    /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl);
  
  // ✅ CHECK 3: Document
  const isDocument = 
    mediaType === 'document' || 
    /\.(pdf|doc|docx|txt|zip)$/i.test(mediaUrl);
  
  // ✅ CHECK 4: Photo (fallback)
  const isPhoto = 
    !isAnimation && !isVideo && !isDocument;
  
  console.log(`📎 Media type detection:`);
  console.log(`   Type field: "${mediaType}"`);
  console.log(`   Filename: "${fileName}"`);
  console.log(`   isAnimation: ${isAnimation}`);
  console.log(`   isVideo: ${isVideo}`);
  console.log(`   isDocument: ${isDocument}`);
  console.log(`   isPhoto: ${isPhoto}`);
  
  return { isVideo, isAnimation, isDocument, isPhoto };
}

// ============================================
// TELEGRAM API FUNCTIONS
// ============================================

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

async function downloadFile(url: string): Promise<{ buffer: Buffer; filename: string }> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download file from ${url}: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  
  return { buffer, filename };
}

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
 * ✅ NEW: Send ANIMATION/GIF to Telegram
 */
async function sendTelegramAnimation(
  botToken: string,
  chatId: string,
  animationBuffer: Buffer,
  caption: string,
  threadId?: string,
  filename?: string
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendAnimation`;
  
  const blob = new Blob([animationBuffer], { type: 'image/gif' });
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
 * ✅ NEW: Send VIDEO to Telegram
 */
async function sendTelegramVideo(
  botToken: string,
  chatId: string,
  videoBuffer: Buffer,
  caption: string,
  threadId?: string,
  filename?: string
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendVideo`;
  
  const blob = new Blob([videoBuffer], { type: 'video/mp4' });
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
 * ✅ UPDATED: Now detects media type and uses correct Telegram API
 */
async function postToTelegram(post: ScheduledPost): Promise<{ success: boolean; post_id?: string; error?: string }> {
  try {
    const chatId = post.channel_group_id!;
    const threadId = post.thread_id || undefined;
    const caption = buildCaption(post);
    
    if (caption.length > 1024) {
      throw new Error(`Caption too long (${caption.length} chars). Please shorten content to under 1024 characters.`);
    }
    
    let mediaFiles: any[] = [];
    
    if (post.media_files && Array.isArray(post.media_files) && post.media_files.length > 0) {
      mediaFiles = post.media_files;
    } else {
      const postContent = post.post_content as any;
      if (postContent?.media_files && Array.isArray(postContent.media_files) && postContent.media_files.length > 0) {
        mediaFiles = postContent.media_files;
      }
    }
    
    let telegramResult: TelegramResponse;
    
    if (mediaFiles.length > 0) {
      const firstMedia = mediaFiles[0];
      const mediaUrl = firstMedia.url || firstMedia.src || firstMedia.supabaseUrl || firstMedia;
      
      if (typeof mediaUrl !== 'string') {
        throw new Error('Invalid media URL format');
      }
      
      // ✅ DETECT MEDIA TYPE (GIF, VIDEO, PHOTO)
      const { isVideo, isAnimation, isDocument, isPhoto } = detectMediaType(firstMedia, mediaUrl);
      
      const { buffer, filename } = await downloadFile(mediaUrl);
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
      console.log(`⬇️ Downloaded ${sizeMB} MB as ${filename}`);
      
      // ✅ USE CORRECT TELEGRAM API METHOD
      if (isAnimation) {
        console.log(`🎬 Uploading GIF/Animation to Telegram: ${filename}`);
        telegramResult = await sendTelegramAnimation(TELEGRAM_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      } else if (isVideo) {
        console.log(`🎥 Uploading video to Telegram: ${filename}`);
        telegramResult = await sendTelegramVideo(TELEGRAM_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      } else {
        console.log(`🖼️ Uploading photo to Telegram: ${filename}`);
        telegramResult = await sendTelegramPhoto(TELEGRAM_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      }
    } else {
      console.log('💬 Sending text-only message');
      telegramResult = await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, caption, threadId);
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
// CORE PROCESSING FUNCTIONS
// ============================================

/**
 * ✅ FIXED: Proper scheduled_date + scheduled_time comparison
 */
async function claimJobs(limit: number = 50): Promise<ScheduledPost[]> {
  try {
    const nowUTC = new Date();
    const nowWEST = new Date(nowUTC.getTime() + (TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
    
    const currentDate = nowWEST.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = nowWEST.toTimeString().slice(0, 8); // HH:MM:SS
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('Querying pending jobs...');
    console.log(`UTC: ${nowUTC.toISOString()}`);
    console.log(`WEST: ${nowWEST.toISOString()}`);
    console.log(`Current Date: ${currentDate}`);
    console.log(`Current Time: ${currentTime}`);
    console.log(`Service Type: '${SERVICE_TYPE}'`);
    console.log(`${'='.repeat(60)}\n`);

    // ✅ STEP 1: Get all pending posts for this service_type
    const { data: allPosts, error: queryError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('service_type', SERVICE_TYPE)
      .eq('posting_status', 'pending');

    if (queryError) {
      console.error('Failed to query scheduled_posts:', queryError);
      throw queryError;
    }

    if (!allPosts || allPosts.length === 0) {
      console.log(`⚠️ No pending posts found for service_type: '${SERVICE_TYPE}'`);
      return [];
    }

    console.log(`Found ${allPosts.length} pending posts with service_type '${SERVICE_TYPE}'`);

    // ✅ STEP 2: Filter in JavaScript for posts that are due
    const duePosts = allPosts.filter((post: any) => {
      const postDateFull = post.scheduled_date;
      const postDate = postDateFull.split('T')[0]; // Extract YYYY-MM-DD
      const postTime = post.scheduled_time; // HH:MM:SS format
      
      const isDue = (postDate < currentDate) || (postDate === currentDate && postTime <= currentTime);
      
      if (isDue) {
        console.log(`✅ DUE: Post ${post.id} - Date: ${postDate}, Time: ${postTime}`);
      }
      
      return isDue;
    });

    if (duePosts.length === 0) {
      console.log(`⚠️ No posts are due yet (all scheduled for future)`);
      return [];
    }

    console.log(`\n📋 ${duePosts.length} posts are due for processing`);

    // ✅ STEP 3: Claim the due posts (limit to max)
    const postsToProcess = duePosts.slice(0, limit);
    const claimedIds = postsToProcess.map((post: any) => post.id);

    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({ post_status: 'pending' })
      .in('id', claimedIds)
      .eq('service_type', SERVICE_TYPE);

    if (updateError) {
      console.error('Failed to claim posts:', updateError);
      throw updateError;
    }

    console.log(`✅ Claimed ${claimedIds.length} jobs\n`);
    return postsToProcess as ScheduledPost[];

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
        posting_status: 'sent',
        post_status: 'sent',
        updated_at: now.toISOString()
      })
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE);

    if (updateError) {
      throw new Error(`Failed to update scheduled_posts: ${getErrorMessage(updateError)}`);
    }

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
      selected_platforms: post.selected_platforms || postContent?.selected_platforms || null,
      platform: post.platform || null,
      service_type: post.service_type || null,
      platform_icon: post.platform_icon || null,
      type: post.type || null,
      status: post.status || null
    };

    const { error: insertError } = await supabase
      .from('dashboard_posts')
      .insert(dashboardPost);

    if (insertError) {
      console.warn(`⚠️ Failed to insert into dashboard_posts: ${getErrorMessage(insertError)}`);
    } else {
      console.log(`✅ Inserted into dashboard_posts`);
    }

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
// MAIN EXECUTION
// ============================================

async function main(): Promise<void> {
  try {
    const result = await processJobs();
    
    console.log('\n=== FINAL RESULT ===');
    console.log(`Total Claimed: ${result.total_claimed}`);
    console.log(`Succeeded: ${result.succeeded}`);
    console.log(`Failed: ${result.failed}`);
    
    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach(err => console.log(`  - ${err}`));
    }
    
    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', getErrorMessage(error));
    process.exit(1);
  }
}

main();
