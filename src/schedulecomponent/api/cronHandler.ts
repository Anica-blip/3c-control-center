// Cron job handler for scheduled posts - PRODUCTION READY
import { supabase } from '../config';

// ✅ TYPE DEFINITIONS
interface ProcessResult {
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
  timestamp: string;
}

interface ScheduledPost {
  id: string;
  service_type: string;
  post_content: any;
  retry_count: number;
  [key: string]: any;
}

interface ExternalService {
  id: string;
  service_type: string;
  url: string;
  api_key?: string;
  is_active: boolean;
}

// ✅ FETCH WITH TIMEOUT
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// ✅ SAFE ERROR MESSAGE EXTRACTOR
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  return 'Unknown error occurred';
};

// ✅ MAIN CRON HANDLER
export async function processScheduledPosts(): Promise<ProcessResult> {
  const startTime = new Date();
  const errors: string[] = [];
  let succeeded = 0;
  let failed = 0;

  console.log(`[${startTime.toISOString()}] Starting scheduled posts processing...`);

  try {
    // ✅ Validate Supabase connection
    if (!supabase) {
      const errorMsg = 'Supabase client not available';
      console.error(errorMsg);
      return {
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [errorMsg],
        timestamp: startTime.toISOString()
      };
    }

    // ✅ Fetch pending scheduled posts
    const { data: posts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_date', startTime.toISOString())
      .order('scheduled_date', { ascending: true })
      .limit(50);

    if (fetchError) {
      const errorMsg = `Failed to fetch scheduled posts: ${getErrorMessage(fetchError)}`;
      console.error(errorMsg);
      return {
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [errorMsg],
        timestamp: startTime.toISOString()
      };
    }

    if (!posts || posts.length === 0) {
      console.log('No pending posts to process');
      return {
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [],
        timestamp: startTime.toISOString()
      };
    }

    console.log(`Found ${posts.length} posts to process`);

    // ✅ Process each post
    for (const post of posts as ScheduledPost[]) {
      try {
        console.log(`Processing post ${post.id} with service type: ${post.service_type}`);

        // ✅ Validate post data
        if (!post.service_type) {
          throw new Error('Post missing service_type');
        }

        if (!post.post_content) {
          throw new Error('Post missing post_content');
        }

        // ✅ Get external service configuration
        const { data: service, error: serviceError } = await supabase
          .from('external_services')
          .select('*')
          .eq('service_type', post.service_type)
          .eq('is_active', true)
          .single();

        if (serviceError || !service) {
          throw new Error(`Service not found or inactive: ${post.service_type}`);
        }

        const serviceConfig = service as ExternalService;

        console.log(`Forwarding to service: ${serviceConfig.url}`);

        // ✅ Forward to external service with timeout
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        if (serviceConfig.api_key) {
          headers['Authorization'] = `Bearer ${serviceConfig.api_key}`;
        }

        const response = await fetchWithTimeout(
          serviceConfig.url,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(post.post_content)
          },
          30000 // 30 second timeout
        );

        if (!response.ok) {
          const responseText = await response.text().catch(() => 'Unable to read response');
          throw new Error(`Service returned status ${response.status}: ${responseText}`);
        }

        console.log(`Successfully forwarded post ${post.id}`);

        // ✅ Update platform assignments to 'sent'
        const { error: assignmentError } = await supabase
          .from('dashboard_platform_assignments')
          .update({
            delivery_status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('scheduled_post_id', post.id);

        if (assignmentError) {
          console.warn(`Failed to update platform assignments for post ${post.id}:`, assignmentError);
        }

        // ✅ Mark post as published
        const { error: updateError } = await supabase
          .from('scheduled_posts')
          .update({
            status: 'published',
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id);

        if (updateError) {
          console.error(`Failed to mark post ${post.id} as published:`, updateError);
          throw updateError;
        }

        succeeded++;
        console.log(`Post ${post.id} processed successfully`);

      } catch (postError) {
        failed++;
        const errorMessage = getErrorMessage(postError);
        errors.push(`Post ${post.id}: ${errorMessage}`);
        console.error(`Failed to process post ${post.id}:`, errorMessage);

        // ✅ Mark post as failed with retry logic
        try {
          const newRetryCount = (post.retry_count || 0) + 1;
          const maxRetries = 3;

          const { error: failError } = await supabase
            .from('scheduled_posts')
            .update({
              status: newRetryCount >= maxRetries ? 'failed' : 'pending',
              failure_reason: errorMessage,
              retry_count: newRetryCount,
              updated_at: new Date().toISOString()
            })
            .eq('id', post.id);

          if (failError) {
            console.error(`Failed to update error status for post ${post.id}:`, failError);
          } else {
            console.log(`Post ${post.id} marked as ${newRetryCount >= maxRetries ? 'failed' : 'pending'} (retry ${newRetryCount}/${maxRetries})`);
          }

          // ✅ Update platform assignments to 'failed'
          await supabase
            .from('dashboard_platform_assignments')
            .update({
              delivery_status: 'failed',
              error_message: errorMessage
            })
            .eq('scheduled_post_id', post.id);

        } catch (updateError) {
          console.error(`Failed to update post ${post.id} error status:`, getErrorMessage(updateError));
        }
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    console.log(`Processing complete: ${succeeded} succeeded, ${failed} failed in ${duration}ms`);

    return {
      processed: posts.length,
      succeeded,
      failed,
      errors,
      timestamp: startTime.toISOString()
    };

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Fatal error in processScheduledPosts:', errorMessage);
    
    return {
      processed: 0,
      succeeded,
      failed,
      errors: [errorMessage, ...errors],
      timestamp: startTime.toISOString()
    };
  }
}

// ✅ EXPORT FOR EDGE FUNCTIONS / API ROUTES
export default processScheduledPosts;
