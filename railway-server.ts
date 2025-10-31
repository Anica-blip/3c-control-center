// Railway HTTP Server for GitHub - Workflow
// Express.js wrapper that provides HTTP endpoint for GitHub Actions
// Port 8080 with /run endpoint

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// Environment Variables
const PORT = process.env.PORT || 8080;
const CRON_SUPABASE_DB_URL = (process.env.CRON_SUPABASE_DB_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const TELEGRAM_PUBLISHER_BOT_TOKEN = (process.env.TELEGRAM_PUBLISHER_BOT_TOKEN || '').trim();
const CRON_RUNNER_PASSWORD = (process.env.CRON_RUNNER_PASSWORD || '').trim();

// Runner Identity
const RUNNER_NAME = 'Railway HTTP Server';
const SERVICE_TYPE = 'GitHub - Workflow';
const TIMEZONE_OFFSET_HOURS = 1;

console.log('\n--- RAILWAY SERVER STARTING ---');
console.log(`Service Type: ${SERVICE_TYPE}`);
console.log(`Port: ${PORT}`);

// Extract Supabase URL
const extractSupabaseUrl = (dbUrl: string): string => {
  const match = dbUrl.match(/db\.([^.]+)\.supabase\.co/);
  if (match) return `https://${match[1]}.supabase.co`;
  
  const poolerMatch = dbUrl.match(/postgres\.([^:]+)/);
  if (poolerMatch) return `https://${poolerMatch[1]}.supabase.co`;
  
  throw new Error(`Cannot extract Supabase URL from: ${dbUrl}`);
};

const supabaseUrl = extractSupabaseUrl(CRON_SUPABASE_DB_URL);
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

// Type Definitions
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

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

// Telegram Functions
async function downloadFile(url: string): Promise<{ buffer: Buffer; filename: string }> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download file from ${url}: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  return { buffer, filename };
}

async function parseTelegramResponse(response: Response): Promise<TelegramResponse> {
  const responseText = await response.text();
  if (!response.ok) {
    try {
      const errorJson = JSON.parse(responseText);
      return {
        ok: false,
        description: `HTTP ${errorJson.error_code || response.status}: ${errorJson.description || 'Unknown error'}`
      };
    } catch {
      return { ok: false, description: `HTTP ${response.status}: ${responseText || 'Empty response'}` };
    }
  }
  return JSON.parse(responseText);
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
    if (username) caption += `${username.startsWith('@') ? username : `@${username}`}\n`;
    if (role) caption += `${role}\n`;
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
  
  if (postContent.title) caption += `${formatText(postContent.title)}\n\n`;
  if (postContent.description) caption += `${formatText(postContent.description)}\n`;
  if (postContent.hashtags?.length) caption += `\n${postContent.hashtags.map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;
  if (postContent.cta) caption += `\n\n👉 ${formatText(postContent.cta)}`;
  
  return caption.trim();
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string, threadId?: string): Promise<TelegramResponse> {
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (threadId) {
    const match = threadId.match(/(\d+)$/);
    if (match) body.message_thread_id = parseInt(match[1]);
  }
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await parseTelegramResponse(response);
}

async function sendTelegramPhoto(botToken: string, chatId: string, photoBuffer: Buffer, caption: string, threadId?: string, filename?: string): Promise<TelegramResponse> {
  const blob = new Blob([photoBuffer], { type: 'image/jpeg' });
  const file = new File([blob], filename || 'photo.jpg', { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('photo', file);
  formData.append('caption', caption);
  formData.append('parse_mode', 'HTML');
  if (threadId) {
    const match = threadId.match(/(\d+)$/);
    if (match) formData.append('message_thread_id', match[1]);
  }
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, { method: 'POST', body: formData });
  return await parseTelegramResponse(response);
}

async function sendTelegramAnimation(botToken: string, chatId: string, animationBuffer: Buffer, caption: string, threadId?: string, filename?: string): Promise<TelegramResponse> {
  const blob = new Blob([animationBuffer], { type: 'image/gif' });
  const file = new File([blob], filename || 'animation.gif', { type: 'image/gif' });
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('animation', file);
  formData.append('caption', caption);
  formData.append('parse_mode', 'HTML');
  if (threadId) {
    const match = threadId.match(/(\d+)$/);
    if (match) formData.append('message_thread_id', match[1]);
  }
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendAnimation`, { method: 'POST', body: formData });
  return await parseTelegramResponse(response);
}

async function sendTelegramVideo(botToken: string, chatId: string, videoBuffer: Buffer, caption: string, threadId?: string, filename?: string): Promise<TelegramResponse> {
  const blob = new Blob([videoBuffer], { type: 'video/mp4' });
  const file = new File([blob], filename || 'video.mp4', { type: 'video/mp4' });
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('video', file);
  formData.append('caption', caption);
  formData.append('parse_mode', 'HTML');
  if (threadId) {
    const match = threadId.match(/(\d+)$/);
    if (match) formData.append('message_thread_id', match[1]);
  }
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, { method: 'POST', body: formData });
  return await parseTelegramResponse(response);
}

async function postToTelegram(post: ScheduledPost): Promise<{ success: boolean; post_id?: string; error?: string }> {
  try {
    const chatId = post.channel_group_id!;
    const threadId = post.thread_id || undefined;
    let caption = buildCaption(post);
    
    // FIX #1: Caption truncation
    if (caption.length > 1024) {
      console.warn(`⚠️ Caption too long (${caption.length} chars), truncating to 1024 chars`);
      caption = caption.substring(0, 1021) + '...';
    }
    
    let mediaFiles: any[] = [];
    if (post.media_files?.length) {
      mediaFiles = post.media_files;
    } else {
      const postContent = post.post_content as any;
      if (postContent?.media_files?.length) mediaFiles = postContent.media_files;
    }
    
    let telegramResult: TelegramResponse;
    
    if (mediaFiles.length > 0) {
      const firstMedia = mediaFiles[0];
      const mediaUrl = firstMedia.url || firstMedia.src || firstMedia.supabaseUrl || firstMedia;
      
      if (typeof mediaUrl !== 'string') throw new Error('Invalid media URL format');
      
      // FIX #2: GIF detection by file extension first
      const isGif = /\.gif$/i.test(mediaUrl);
      const mediaType = firstMedia.type?.toLowerCase() || '';
      const isVideo = mediaType === 'video' || /\.(mp4|mov|avi|mkv)$/i.test(mediaUrl);
      
      const { buffer, filename } = await downloadFile(mediaUrl);
      console.log(`✅ Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB as ${filename}`);
      
      if (isGif) {
        console.log(`🎞️ Uploading GIF: ${filename}`);
        telegramResult = await sendTelegramAnimation(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      } else if (isVideo) {
        console.log(`📹 Uploading video: ${filename}`);
        telegramResult = await sendTelegramVideo(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      } else {
        console.log(`🖼️ Uploading photo: ${filename}`);
        telegramResult = await sendTelegramPhoto(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, buffer, caption, threadId, filename);
      }
    } else {
      telegramResult = await sendTelegramMessage(TELEGRAM_PUBLISHER_BOT_TOKEN, chatId, caption, threadId);
    }
    
    if (!telegramResult.ok) throw new Error(`Telegram API error: ${telegramResult.description || 'Unknown error'}`);
    
    return { success: true, post_id: telegramResult.result?.message_id?.toString() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

function toWEST(date: Date): Date {
  return new Date(date.getTime() + (TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
}

function getCurrentWESTDateTime(): { date: string; time: string } {
  const nowWEST = toWEST(new Date());
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

async function claimJobs(limit: number = 50): Promise<ScheduledPost[]> {
  const { date: currentDate, time: currentTime } = getCurrentWESTDateTime();
  
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('service_type', SERVICE_TYPE)
    .eq('posting_status', 'pending')
    .or(`scheduled_date.lt.${currentDate},and(scheduled_date.eq.${currentDate},scheduled_time.lte.${currentTime})`)
    .limit(limit);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const claimedIds = data.map((post: any) => post.id);
  
  await supabase
    .from('scheduled_posts')
    .update({ post_status: 'pending' })
    .in('id', claimedIds)
    .eq('service_type', SERVICE_TYPE);

  console.log(`Claimed ${claimedIds.length} jobs`);
  return data as ScheduledPost[];
}

async function processPost(post: ScheduledPost): Promise<void> {
  const now = new Date();
  console.log(`\n--- Processing Post ${post.id} ---`);

  try {
    if (!post.channel_group_id) throw new Error('Missing channel_group_id');
    if (!post.post_content && !post.description && !post.title) throw new Error('Missing post content');

    const postResult = await postToTelegram(post);
    if (!postResult.success) throw new Error(postResult.error || 'Failed to post');

    const externalPostId = postResult.post_id || 'unknown';
    console.log(`✅ Posted to Telegram. Message ID: ${externalPostId}`);

    await supabase
      .from('scheduled_posts')
      .update({ post_status: 'sent' })
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE);

    // FIX #3: Dashboard posts schema with all fields
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
      created_by: post.created_by || null
    };

    const { error: insertError } = await supabase.from('dashboard_posts').insert(dashboardPost);
    if (insertError) {
      console.warn(`⚠️ Failed to insert into dashboard_posts: ${getErrorMessage(insertError)}`);
    } else {
      console.log(`✅ Inserted into dashboard_posts`);
    }

    // FIX #4: Soft-delete from scheduled_posts
    const { error: deleteError } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE);

    if (deleteError) {
      console.warn(`⚠️ Failed to delete from scheduled_posts`);
    } else {
      console.log(`✅ Deleted post ${post.id} from scheduled_posts`);
    }

    console.log(`✅ Post ${post.id} completed successfully`);
  } catch (error) {
    console.error(`❌ Failed to process post ${post.id}:`, getErrorMessage(error));
    await supabase
      .from('scheduled_posts')
      .update({ post_status: 'failed', attempts: (post.attempts || 0) + 1 })
      .eq('id', post.id)
      .eq('service_type', SERVICE_TYPE);
    throw error;
  }
}

async function runCronJob() {
  const startTime = new Date();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`GitHub - Workflow Started: ${startTime.toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  const errors: string[] = [];
  let succeeded = 0;
  let failed = 0;

  try {
    const posts = await claimJobs(50);
    if (posts.length === 0) {
      console.log('✅ No pending posts');
      return { success: true, total_claimed: 0, succeeded: 0, failed: 0, errors: [] };
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

    console.log(`\nTotal: ${posts.length}, ✅ ${succeeded}, ❌ ${failed}\n`);
    return { success: failed === 0, total_claimed: posts.length, succeeded, failed, errors };
  } catch (error) {
    return { success: false, total_claimed: 0, succeeded, failed, errors: [getErrorMessage(error)] };
  }
}

// Express Endpoints
app.get('/', (req, res) => {
  res.json({ status: 'Railway HTTP Server running', service: SERVICE_TYPE, timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: SERVICE_TYPE });
});

app.post('/run', async (req, res) => {
  try {
    const authHeader = req.headers['x-cron-password'] || req.headers['authorization'];
    if (!authHeader || authHeader !== CRON_RUNNER_PASSWORD) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log('\n🚀 Received cron trigger');
    const result = await runCronJob();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ Railway HTTP Server listening on port ${PORT}`);
  console.log(`Service: ${SERVICE_TYPE}`);
  console.log(`Endpoints: GET /, GET /health, POST /run\n`);
});
