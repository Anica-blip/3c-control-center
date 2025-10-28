// Render.com Cron Runner - Direct Database Connection with Telegram Posting
// Queries scheduled_posts table directly and posts to Telegram
// TIMEZONE: WEST (UTC+1)

import { createClient } from '@supabase/supabase-js';

// ✅ ENVIRONMENT VARIABLES
const CRON_SUPABASE_DB_URL = process.env.CRON_SUPABASE_DB_URL || '';
const CRON_RUNNER_PASSWORD = process.env.CRON_RUNNER_PASSWORD || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// ✅ RUNNER IDENTITY
const RUNNER_NAME = 'Render Cron Job';
const SERVICE_TYPE = 'Render Cron Job';

// ✅ TIMEZONE CONFIGURATION - WEST = UTC+1
const TIMEZONE_OFFSET_HOURS = 1;

// ✅ VALIDATE CREDENTIALS
if (!CRON_SUPABASE_DB_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN) {
  console.error('Missing required environment variables:');
  console.error('  CRON_SUPABASE_DB_URL:', CRON_SUPABASE_DB_URL ? 'SET' : 'MISSING');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
  console.error('  TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? 'SET' : 'MISSING');
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

// ✅ CREATE SUPABASE CLIENT
const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

console.log(`[${new Date().toISOString()}] Render Cron Runner initialized`);
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
  status: string;
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
  
  // Add title with formatting
  if (postContent.title) {
    let title = postContent.title;
    title = title.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    caption += `${title}\n\n`;
  }
  
  // Add description with formatting
  if (postContent.description) {
    let desc = postContent.description;
    desc = desc.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    desc = desc.replace(/_(.+?)_/g, '<i>$1</i>');
    desc = desc.replace(/__(.+?)__/g, '<u>$1</u>');
    desc = desc.replace(/\[([^\]]+)\]\s+(https?:\/\/[^\s]+)/g, '<a href="$2">$1</a>');
    caption += `${desc}\n`;
  }
  
  // Add hashtags
  if (postContent.hashtags && Array.isArray(postContent.hashtags) && postContent.hashtags.length > 0) {
    caption += `\n${postContent.hashtags.map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;
  }
  
  // Add CTA
  if (postContent.cta) {
    caption += `\n\n👉 ${postContent.cta}`;
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
  
  // If sending as direct file upload
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  
  form.append('chat_id', chatId);
  form.append('photo', photoUrlOrBuffer, { filename: filename || 'photo.jpg' });
  form.append('caption', caption);
  form.append('parse_mode', 'HTML');
  
  if (threadId) {
    const threadIdMatch = threadId.match(/(\d+)$/);
    if (threadIdMatch) {
      form.append('message_thread_id', threadIdMatch[1]);
    }
  }
  
  // Convert form stream to buffer for fetch compatibility
  const formBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    form.on('data', (chunk: Buffer) => chunks.push(chunk));
    form.on('end', () => resolve(Buffer.concat(chunks)));
    form.on('error', reject);
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: form.getHeaders(),
    body: formBuffer,
  });

  // Check if response is valid before parsing
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Telegram API Error (${response.status}):`, errorText);
    throw new Error(`Telegram API returned ${response.status}: ${errorText}`);
  }

  const responseText = await response.text();
  if (!responseText) {
    throw new Error('Telegram API returned empty response');
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Failed to parse Telegram response:', responseText);
    throw new Error(`Invalid JSON from Telegram: ${responseText.substring(0, 200)}`);
  }
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
  
  // If sending as direct file upload
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  
  form.append('chat_id', chatId);
  form.append('video', videoUrlOrBuffer, { filename: filename || 'video.mp4' });
  form.append('caption', caption);
  form.append('parse_mode', 'HTML');
  
  if (threadId) {
    const threadIdMatch = threadId.match(/(\d+)$/);
    if (threadIdMatch) {
      form.append('message_thread_id', threadIdMatch[1]);
    }
  }
  
  // Convert form stream to buffer for fetch compatibility
  const formBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    form.on('data', (chunk: Buffer) => chunks.push(chunk));
    form.on('end', () => resolve(Buffer.concat(chunks)));
    form.on('error', reject);
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: form.getHeaders(),
    body: formBuffer,
  });

  // Check if response is valid before parsing
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Telegram API Error (${response.status}):`, errorText);
    throw new Error(`Telegram API returned ${response.status}: ${errorText}`);
  }

  const responseText = await response.text();
  if (!responseText) {
    throw new Error('Telegram API returned empty response');
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Failed to parse Telegram response:', responseText);
    throw new Error(`Invalid JSON from Telegram: ${responseText.substring(0, 200)}`);
  }
}

/**
 * Send GIF/Animation to Telegram (supports URL or direct upload)
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
  
  // If sending as URL
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

    return await response.json();
  }
  
  // If sending as direct file upload
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  
  form.append('chat_id', chatId);
  form.append('animation', animationUrlOrBuffer, { filename: filename || 'animation.gif' });
  form.append('caption', caption);
  form.append('parse_mode', 'HTML');
  
  if (threadId) {
    const threadIdMatch = threadId.match(/(\d+)$/);
    if (threadIdMatch) {
      form.append('message_thread_id', threadIdMatch[1]);
    }
  }
  
  // Convert form stream to buffer for fetch compatibility
  const formBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    form.on('data', (chunk: Buffer) => chunks.push(chunk));
    form.on('end', () => resolve(Buffer.concat(chunks)));
    form.on('error', reject);
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: form.getHeaders(),
    body: formBuffer,
  });

  // Check if response is valid before parsing
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Telegram API Error (${response.status}):`, errorText);
    throw new Error(`Telegram API returned ${response.status}: ${errorText}`);
  }

  const responseText = await response.text();
  if (!responseText) {
    throw new Error('Telegram API returned empty response');
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Failed to parse Telegram response:', responseText);
    throw new Error(`Invalid JSON from Telegram: ${responseText.substring(0, 200)}`);
  }
}

/**
 * Main function to post to Telegram based on media type
 */
async function postToTelegram(post: ScheduledPost): Promise<{ success: boolean; post_id?: string; error?: string }> {
  try {
    console.log(`📱 Posting to Telegram - Chat ID: ${post.channel_group_id}`);
    if (post.thread_id) {
      console.log(`📌 Thread ID: ${post.thread_id}`);
    }
    
    const botToken = TELEGRAM_BOT_TOKEN;
    const chatId = post.channel_group_id;
    
    if (!chatId) {
      throw new Error('Missing channel_group_id (Chat ID)');
    }

    const caption = buildCaption(post);
    const threadId = post.thread_id || undefined;
    let result: TelegramResponse;

    // Check if there's media in post_content or direct fields
    const postContent = post.post_content as any;
    const mediaFiles = postContent?.media_files || post.media_files;
    const hasMedia = mediaFiles && Array.isArray(mediaFiles) && mediaFiles.length > 0;

    if (hasMedia) {
      const mediaUrl = typeof mediaFiles[0] === 'string' ? mediaFiles[0] : mediaFiles[0]?.url;
      const mediaType = (postContent?.media_type || post.media_type || '').toLowerCase();

      console.log(`📎 Media detected - Type: ${mediaType}, URL: ${mediaUrl}`);
      
      // ✅ DOWNLOAD FILE FROM SUPABASE FIRST
      console.log(`⬇️ Downloading file from Supabase...`);
      const { buffer, filename } = await downloadFile(mediaUrl);
      console.log(`✅ Downloaded ${filename} (${buffer.length} bytes)`);

      // ✅ UPLOAD FILE DIRECTLY TO TELEGRAM
      if (mediaType.includes('image') || mediaType.includes('photo')) {
        console.log(`📤 Uploading photo to Telegram...`);
        result = await sendTelegramPhoto(botToken, chatId, buffer, caption, threadId, filename);
      } else if (mediaType.includes('video')) {
        console.log(`📤 Uploading video to Telegram...`);
        result = await sendTelegramVideo(botToken, chatId, buffer, caption, threadId, filename);
      } else if (mediaType.includes('gif') || mediaType.includes('animation')) {
        console.log(`📤 Uploading animation to Telegram...`);
        result = await sendTelegramAnimation(botToken, chatId, buffer, caption, threadId, filename);
      } else {
        console.log(`📤 Uploading as photo (type unclear)...`);
        result = await sendTelegramPhoto(botToken, chatId, buffer, caption, threadId, filename);
      }
    } else {
      // Text-only message
      console.log('📝 Text-only message');
      result = await sendTelegramMessage(botToken, chatId, caption, threadId);
    }

    if (result.ok) {
      console.log('✅ Telegram post successful');
      return {
        success: true,
        post_id: result.result?.message_id?.toString() || 'unknown',
      };
    } else {
      console.error('❌ Telegram API error:', result.description);
      return {
        success: false,
        error: result.description || 'Unknown Telegram error',
      };
    }
  } catch (error: any) {
    console.error('❌ Error posting to Telegram:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// DATABASE & JOB PROCESSING
// ============================================

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
};

/**
 * Query and claim pending jobs - WITH TIMEZONE CONVERSION
 */
async function claimJobs(limit: number = 50): Promise<ScheduledPost[]> {
  const nowUTC = new Date();
  
  // ✅ CONVERT UTC TO WEST (UTC+1)
  const nowWEST = new Date(nowUTC.getTime() + (TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
  const currentDate = nowWEST.toISOString().split('T')[0];
  const currentTime = nowWEST.toTimeString().split(' ')[0];
  const lockId = crypto.randomUUID();

  console.log(`[${nowUTC.toISOString()}] Querying pending jobs...`);
  console.log(`UTC Time: ${nowUTC.toISOString()}`);
  console.log(`WEST Time: ${nowWEST.toISOString()}`);
  console.log(`Query Date: ${currentDate}, Query Time: ${currentTime}`);

  try {
    // ✅ DIAGNOSTIC: Test connection and see sample data
    console.log('\n--- DIAGNOSTIC: Testing Supabase Connection ---');
    const { data: sampleData, error: sampleError } = await supabase
      .from('scheduled_posts')
      .select('id, service_type, status, scheduled_date, scheduled_time')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Cannot connect to scheduled_posts table:', sampleError);
      throw sampleError;
    }
    
    console.log('✅ Connection successful! Sample posts:');
    console.log(JSON.stringify(sampleData, null, 2));
    
    // ✅ DIAGNOSTIC: Check posts matching our service_type
    const { data: serviceData, error: serviceError } = await supabase
      .from('scheduled_posts')
      .select('id, service_type, status, scheduled_date, scheduled_time')
      .eq('service_type', SERVICE_TYPE)
      .limit(10);
    
    console.log(`\n--- Posts with service_type = '${SERVICE_TYPE}' ---`);
    if (serviceData && serviceData.length > 0) {
      console.log(`Found ${serviceData.length} posts:`);
      console.log(JSON.stringify(serviceData, null, 2));
    } else {
      console.log('⚠️ No posts found with this service_type');
    }
    console.log('--- End Diagnostics ---\n');

    // ✅ ACTUAL QUERY: Now find posts ready to process
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('service_type', SERVICE_TYPE)
      .eq('status', 'pending')
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
      console.log(`  - status: 'pending'`);
      console.log(`  - scheduled_date <= '${currentDate}'`);
      console.log(`  - scheduled_time <= '${currentTime}'`);
      return [];
    }

    console.log(`✅ Found ${data.length} pending posts ready to process:`);
    data.forEach((post: any) => {
      console.log(`  - ID: ${post.id}`);
      console.log(`    Service: ${post.service_type}`);
      console.log(`    Status: ${post.status}`);
      console.log(`    Scheduled: ${post.scheduled_date} ${post.scheduled_time}`);
    });
    console.log('--- End Query Results ---\n');

    const claimedIds = data.map((post: any) => post.id);
    
    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({
        status: 'processing',
        lock_id: lockId,
        run_by: RUNNER_NAME,
        attempted_at: nowUTC.toISOString()
      })
      .in('id', claimedIds);

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
        status: 'success',
        completed_at: now.toISOString(),
        external_post_id: externalPostId,
        last_error: null
      })
      .eq('id', post.id);

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
        status: finalStatus,
        completed_at: shouldRetry ? null : now.toISOString(),
        last_error: errorMessage,
        lock_id: null,
        next_retry_at: shouldRetry ? new Date(now.getTime() + 300000).toISOString() : null
      })
      .eq('id', post.id);

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
