// Railway.app HTTP Server - Express.js wrapper for cron runner
// Provides HTTP endpoint that GitHub Actions and other services can call
// Runs on port 8080 and executes the same logic as Render cron runner

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const PORT = process.env.PORT || 8080;
const CRON_SUPABASE_DB_URL = (process.env.CRON_SUPABASE_DB_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const TELEGRAM_PUBLISHER_BOT_TOKEN = (process.env.TELEGRAM_PUBLISHER_BOT_TOKEN || '').trim();
const AUTHORIZATION = (process.env.AUTHORIZATION || '').trim();
const CRON_RUNNER_PASSWORD = (process.env.CRON_RUNNER_PASSWORD || '').trim();

// ✅ RUNNER IDENTITY
const RUNNER_NAME = 'Railway HTTP Server';
const SERVICE_TYPE = 'Railway HTTP Server';

// ✅ TIMEZONE CONFIGURATION - WEST = UTC+1
const TIMEZONE_OFFSET_HOURS = 1;

console.log('\n--- RAILWAY SERVER STARTING ---');
console.log(`Service Type: ${SERVICE_TYPE}`);
console.log(`Port: ${PORT}`);
console.log(`Timezone: WEST (UTC+${TIMEZONE_OFFSET_HOURS})`);

// ============================================
// SUPABASE CLIENT SETUP
// ============================================

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

if (CRON_SUPABASE_DB_URL && SUPABASE_SERVICE_ROLE_KEY) {
  const supabaseUrl = extractSupabaseUrl(CRON_SUPABASE_DB_URL);
  const authToken = AUTHORIZATION || SUPABASE_SERVICE_ROLE_KEY;
  
  supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    }
  });
  
  console.log(`✅ Supabase client initialized: ${supabaseUrl}`);
} else {
  console.error('❌ Missing Supabase credentials - server will start but endpoints will fail');
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
// UTILITY FUNCTIONS
// ============================================

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

function generateLockId(): string {
  return `${RUNNER_NAME}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
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
// TELEGRAM API FUNCTIONS
// ============================================

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

async function sendTelegramPhoto(
  botToken: string,
  chatId: string,
  photoUrl: string,
  caption: string,
  threadId?: string
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  
  const body: any = {
    chat_id: chatId,
    photo: photoUrl,
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

async function sendTelegramVideo(
  botToken: string,
  chatId: string,
  videoUrl: string,
  caption: string,
  threadId?: string
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendVideo`;
  
  const body: any = {
    chat_id: chatId,
    video: videoUrl,
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

async function sendTelegramDocument(
  botToken: string,
  chatId: string,
  documentUrl: string,
  caption: string,
  threadId?: string
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendDocument`;
  
  const body: any = {
    chat_id: chatId,
    document: documentUrl,
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

async function postToTelegram(post: ScheduledPost): Promise<{ success: boolean; post_id?: string; error?: string }> {
  try {
    const chatId = post.channel_group_id!;
    const threadId = post.thread_id || undefined;
    const caption = buildCaption(post);
    
    const postContent = post.post_content as any;
    const mediaFiles = postContent?.media_files || post.media_files || [];
    
    let telegramResult: TelegramResponse;
    
    if (mediaFiles.length > 0) {
      const firstMedia = mediaFiles[0];
      const mediaUrl = firstMedia.url || firstMedia.src || firstMedia;
      
      if (typeof mediaUrl !== 'string') {
        throw new Error('Invalid media URL format');
      }
      
      const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(mediaUrl);
      const isDocument = /\.(pdf|doc|docx|xls|xlsx|txt)$/i.test(mediaUrl);
      
      if (isVideo) {
        telegramResult = await sendTelegramVideo(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, mediaUrl, caption, threadId);
      } else if (isDocument) {
        telegramResult = await sendTelegramDocument(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, mediaUrl, caption, threadId);
      } else {
        telegramResult = await sendTelegramPhoto(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, mediaUrl, caption, threadId);
      }
    } else {
      telegramResult = await sendTelegramMessage(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, caption, threadId);
    }
    
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
// CORE PROCESSING FUNCTIONS
// ============================================

async function claimJobs(limit: number = 50): Promise<ScheduledPost[]> {
  const lockId = generateLockId();
  const nowUTC = new Date();
  const nowWEST = toWEST(nowUTC);
  
  const { date: currentDate, time: currentTime } = getCurrentWESTDateTime();
  
  try {
    console.log(`\nQuerying pending jobs...`);
    console.log(`UTC Time: ${nowUTC.toISOString()}`);
    console.log(`WEST Time: ${nowWEST.toISOString()}`);
    console.log(`Query Date: ${currentDate}, Query Time: ${currentTime}`);

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

    if (!data || data.length === 0) {
      console.log('No pending posts found');
      return [];
    }

    console.log(`Found ${data.length} pending posts`);

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

async function processPost(post: ScheduledPost): Promise<void> {
  const now = new Date();
  console.log(`\nProcessing Post ${post.id}`);

  try {
    if (!post.channel_group_id) {
      throw new Error('Missing channel_group_id (Telegram Chat ID)');
    }

    if (!post.post_content && !post.description && !post.title) {
      throw new Error('Missing post content (title or description required)');
    }

    const postResult = await postToTelegram(post);

    if (!postResult.success) {
      throw new Error(postResult.error || 'Failed to post to Telegram');
    }

    const externalPostId = postResult.post_id || 'unknown';
    console.log(`✅ Successfully posted to Telegram (ID: ${externalPostId})`);

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
    }

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`❌ Failed to process post ${post.id}:`, errorMessage);

    const maxRetries = 3;
    const newAttempts = (post.attempts || 0) + 1;
    const shouldRetry = newAttempts < maxRetries;
    const finalStatus = shouldRetry ? 'pending' : 'failed';

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
    
    throw error;
  }
}

async function runCronJob(): Promise<ProcessResult> {
  const startTime = new Date();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Railway Cron Job Started: ${startTime.toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  const errors: string[] = [];
  let succeeded = 0;
  let failed = 0;

  try {
    const posts = await claimJobs(50);

    if (posts.length === 0) {
      return {
        success: true,
        total_claimed: 0,
        succeeded: 0,
        failed: 0,
        errors: [],
        timestamp: startTime.toISOString()
      };
    }

    console.log(`\nProcessing ${posts.length} posts...\n`);

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
    console.log(`Railway Cron Job Completed`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Total Claimed: ${posts.length}`);
    console.log(`✅ Succeeded: ${succeeded}`);
    console.log(`❌ Failed: ${failed}`);
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
// EXPRESS ROUTES
// ============================================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Railway Cron Server is running',
    service: SERVICE_TYPE,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
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
    // ✅ VALIDATE AUTHORIZATION
    const authHeader = req.headers['x-cron-password'] || req.headers['authorization'];
    
    if (!authHeader || authHeader !== CRON_RUNNER_PASSWORD) {
      console.warn('❌ Unauthorized request attempt');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid or missing X-Cron-Password header'
      });
    }

    // ✅ VALIDATE REQUIRED ENV VARS
    if (!supabase || !TELEGRAM_PUBLISHER_BOT_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Server not properly configured - missing credentials'
      });
    }

    console.log('\n🚀 Received cron trigger request');
    
    // ✅ RUN THE CRON JOB
    const result = await runCronJob();
    
    // ✅ RETURN RESULT
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
  // Redirect to /run handler
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
  console.log(`  POST /run - Trigger cron job`);
  console.log(`  POST /api/run - Alternative trigger endpoint`);
  console.log(`\nServer ready to receive requests!\n`);
});
