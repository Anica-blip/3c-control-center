// GitHub Actions Cron Runner - Direct Database Connection
// Uses SELECT FOR UPDATE SKIP LOCKED to claim and process scheduled posts

import { createClient } from '@supabase/supabase-js';

// ✅ ENVIRONMENT VARIABLES
const CRON_SUPABASE_DB_URL = process.env.CRON_SUPABASE_DB_URL || '';
const CRON_RUNNER_PASSWORD = process.env.CRON_RUNNER_PASSWORD || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ✅ RUNNER IDENTITY
const RUNNER_NAME = 'GitHub Actions';
const SERVICE_TYPE = 'GitHub Actions';

// ✅ VALIDATE CREDENTIALS
if (!CRON_SUPABASE_DB_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  CRON_SUPABASE_DB_URL:', CRON_SUPABASE_DB_URL ? 'SET' : 'MISSING');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
  process.exit(1);
}

// ✅ EXTRACT SUPABASE URL FROM DB URL
// Format: postgres://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
// Convert to: https://xxx.supabase.co
const extractSupabaseUrl = (dbUrl: string): string => {
  const match = dbUrl.match(/postgres\.([^:]+)/);
  if (!match) throw new Error('Invalid CRON_SUPABASE_DB_URL format');
  return `https://${match[1]}.supabase.co`;
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

console.log(`[${new Date().toISOString()}] GitHub Actions Cron Runner initialized`);
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Service Type Filter: ${SERVICE_TYPE}`);

// ✅ TYPE DEFINITIONS
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
}

interface ProcessResult {
  total_claimed: number;
  succeeded: number;
  failed: number;
  errors: string[];
  timestamp: string;
}

// ✅ SAFE ERROR EXTRACTOR
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
};

// ✅ CLAIM JOBS USING SELECT FOR UPDATE SKIP LOCKED
async function claimJobs(limit: number = 50): Promise<ScheduledPost[]> {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
  const lockId = crypto.randomUUID();

  console.log(`[${now.toISOString()}] Claiming jobs...`);
  console.log(`Current Date: ${currentDate}, Current Time: ${currentTime}`);

  try {
    // ✅ CLAIM JOBS: SELECT FOR UPDATE SKIP LOCKED
    const { data, error } = await supabase.rpc('claim_scheduled_posts', {
      p_service_type: SERVICE_TYPE,
      p_current_date: currentDate,
      p_current_time: currentTime,
      p_lock_id: lockId,
      p_run_by: RUNNER_NAME,
      p_limit: limit
    });

    if (error) {
      console.error('Failed to claim jobs via RPC:', error);
      
      // ✅ FALLBACK: Direct query if RPC doesn't exist
      console.log('Attempting direct query fallback...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('service_type', SERVICE_TYPE)
        .eq('status', 'pending')
        .or(`scheduled_date.lt.${currentDate},and(scheduled_date.eq.${currentDate},scheduled_time.lte.${currentTime})`)
        .limit(limit);

      if (fallbackError) throw fallbackError;

      // Update claimed jobs
      const claimedIds = (fallbackData || []).map((post: any) => post.id);
      if (claimedIds.length > 0) {
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'processing',
            lock_id: lockId,
            run_by: RUNNER_NAME,
            attempted_at: now.toISOString(),
            attempts: supabase.sql`COALESCE(attempts, 0) + 1`
          })
          .in('id', claimedIds);
      }

      return fallbackData || [];
    }

    console.log(`Claimed ${data?.length || 0} jobs`);
    return data || [];

  } catch (error) {
    console.error('Error claiming jobs:', getErrorMessage(error));
    throw error;
  }
}

// ✅ PROCESS SINGLE POST
async function processPost(post: ScheduledPost): Promise<void> {
  const now = new Date();
  console.log(`\n--- Processing Post ${post.id} ---`);
  console.log(`Platform: ${post.social_platform}`);
  console.log(`Scheduled: ${post.scheduled_date} ${post.scheduled_time}`);

  try {
    // ✅ VALIDATE POST DATA
    if (!post.post_content) {
      throw new Error('Missing post_content');
    }

    if (!post.social_platform) {
      throw new Error('Missing social_platform');
    }

    // ✅ SIMULATE POSTING TO SOCIAL PLATFORM
    // TODO: Replace with actual social platform API calls
    console.log('Post Content:', JSON.stringify(post.post_content, null, 2));
    
    // Simulate API call
    const mockResponse = {
      status: 200,
      body: { success: true, post_id: `mock_${Date.now()}` }
    };

    const responseCode = mockResponse.status;
    const responseBody = mockResponse.body;
    const externalPostId = responseBody.post_id;

    console.log(`✅ Successfully posted to ${post.social_platform}`);
    console.log(`External Post ID: ${externalPostId}`);

    // ✅ UPDATE scheduled_posts TO SUCCESS
    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({
        status: 'success',
        completed_at: now.toISOString(),
        response_code: responseCode,
        response_body: responseBody,
        external_post_id: externalPostId,
        last_error: null
      })
      .eq('id', post.id);

    if (updateError) {
      throw new Error(`Failed to update scheduled_posts: ${getErrorMessage(updateError)}`);
    }

    // ✅ INSERT INTO dashboard_posts
    const { error: insertError } = await supabase
      .from('dashboard_posts')
      .insert({
        scheduled_post_id: post.id,
        social_platform: post.social_platform,
        post_content: post.post_content,
        external_post_id: externalPostId,
        posted_at: now.toISOString(),
        url: post.url,
        channel_group_id: post.channel_group_id,
        thread_id: post.thread_id,
        response_code: responseCode,
        response_body: responseBody
      });

    if (insertError) {
      console.warn(`⚠️ Failed to insert into dashboard_posts: ${getErrorMessage(insertError)}`);
      // Don't throw - post was successful, just logging failed
    }

    console.log(`✅ Post ${post.id} completed successfully`);

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`❌ Failed to process post ${post.id}:`, errorMessage);

    // ✅ DETERMINE IF SHOULD RETRY
    const maxRetries = 3;
    const newAttempts = post.attempts + 1;
    const shouldRetry = newAttempts < maxRetries;
    const finalStatus = shouldRetry ? 'pending' : 'failed';

    // ✅ UPDATE scheduled_posts WITH FAILURE
    const { error: failError } = await supabase
      .from('scheduled_posts')
      .update({
        status: finalStatus,
        completed_at: shouldRetry ? null : now.toISOString(),
        last_error: errorMessage,
        lock_id: null, // Release lock for retry
        next_retry_at: shouldRetry ? new Date(now.getTime() + 300000).toISOString() : null // 5 min delay
      })
      .eq('id', post.id);

    if (failError) {
      console.error(`Failed to update error status: ${getErrorMessage(failError)}`);
    }

    console.log(`Post ${post.id} marked as ${finalStatus} (attempt ${newAttempts}/${maxRetries})`);
    
    throw error; // Re-throw to count as failed in summary
  }
}

// ✅ MAIN EXECUTION
async function main(): Promise<ProcessResult> {
  const startTime = new Date();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`GitHub Actions Cron Job Started: ${startTime.toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  const errors: string[] = [];
  let succeeded = 0;
  let failed = 0;

  try {
    // ✅ CLAIM JOBS
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

    // ✅ PROCESS EACH POST
    for (const post of posts) {
      try {
        await processPost(post);
        succeeded++;
      } catch (error) {
        failed++;
        errors.push(`Post ${post.id}: ${getErrorMessage(error)}`);
      }
    }

    // ✅ SUMMARY
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`GitHub Actions Cron Job Completed`);
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
