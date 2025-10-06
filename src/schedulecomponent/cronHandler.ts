// Cron job handler for scheduled posts
import { supabase } from '../config';

export async function processScheduledPosts() {
  const now = new Date();
  
  const { data: posts, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_date', now.toISOString())
    .limit(50);

  if (error || !posts) return { processed: 0, errors: [error?.message] };

  let succeeded = 0;
  for (const post of posts) {
    try {
      // Get service
      const { data: service } = await supabase
        .from('external_services')
        .select('*')
        .eq('service_type', post.service_type)
        .single();

      if (!service) throw new Error('Service not found');

      // Forward to external service
      await fetch(service.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post.post_content)
      });

      // Update platform assignments
      await supabase
        .from('dashboard_platform_assignments')
        .update({ delivery_status: 'sent', sent_at: new Date().toISOString() })
        .eq('scheduled_post_id', post.id);

      // Mark as published
      await supabase
        .from('scheduled_posts')
        .update({ status: 'published' })
        .eq('id', post.id);

      succeeded++;
    } catch (err) {
      await supabase
        .from('scheduled_posts')
        .update({ 
          status: 'failed', 
          failure_reason: err.message,
          retry_count: post.retry_count + 1 
        })
        .eq('id', post.id);
    }
  }

  return { processed: posts.length, succeeded };
}
