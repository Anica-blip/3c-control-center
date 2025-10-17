// Supabase Edge Function for processing scheduled posts
// This can be called by cron-job.org, GitHub Actions, or any HTTP client

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authorization (optional but recommended)
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current time in UTC (database stores in UTC)
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0] // HH:MM:SS
    
    // Get pending scheduled posts that are due
    const { data: posts, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .or(`scheduled_date.lt.${currentDate},and(scheduled_date.eq.${currentDate},scheduled_time.lte.${currentTime})`)
      .limit(50)

    if (error) {
      throw error
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No posts to process',
          processed: 0,
          succeeded: 0,
          timestamp: now.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let succeeded = 0
    const errors: string[] = []

    for (const post of posts) {
      try {
        // Get service configuration
        const { data: service, error: serviceError } = await supabase
          .from('external_services')
          .select('*')
          .eq('service_type', post.service_type)
          .single()

        if (serviceError || !service) {
          throw new Error('Service not found')
        }

        // Prepare payload with post content and destination info
        const payload = {
          ...post.post_content,
          platform: post.platform,
          url: post.url,
          channel_group_id: post.channel_group_id,
          thread_id: post.thread_id
        }

        // Forward to external service
        const response = await fetch(service.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error(`External service responded with ${response.status}`)
        }

        // Update platform assignments
        await supabase
          .from('dashboard_platform_assignments')
          .update({ 
            delivery_status: 'sent', 
            sent_at: new Date().toISOString()
          })
          .eq('scheduled_post_id', post.id)

        // Mark as published
        await supabase
          .from('scheduled_posts')
          .update({ status: 'published' })
          .eq('id', post.id)

        succeeded++
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`Post ${post.id}: ${errorMessage}`)
        
        // Mark as failed
        await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'failed', 
            failure_reason: errorMessage,
            retry_count: (post.retry_count || 0) + 1 
          })
          .eq('id', post.id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        processed: posts.length,
        succeeded,
        failed: posts.length - succeeded,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Cron job error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
