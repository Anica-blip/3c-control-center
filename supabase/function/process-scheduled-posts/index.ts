// Supabase Edge Function for processing scheduled posts
// Called by: Render, GitHub Actions, CronJob.org

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
    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ✅ Get service_type from request body
    let requestedServiceType: string | undefined
    try {
      const body = await req.json()
      requestedServiceType = body.service_type
    } catch {
      // No body provided - process all (fallback)
    }

    if (!requestedServiceType) {
      return new Response(
        JSON.stringify({ error: 'Missing service_type in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing posts for service_type: ${requestedServiceType}`)

    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current time in UTC (database stores in UTC)
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0] // HH:MM:SS
    
    // ✅ Get pending scheduled posts that are due AND match service_type
    const { data: posts, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .eq('service_type', requestedServiceType)
      .or(`scheduled_date.lt.${currentDate},and(scheduled_date.eq.${currentDate},scheduled_time.lte.${currentTime})`)
      .limit(50)

    if (error) {
      throw error
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `No posts to process for service_type: ${requestedServiceType}`,
          processed: 0,
          succeeded: 0,
          timestamp: now.toISOString(),
          service_type: requestedServiceType
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${posts.length} posts for ${requestedServiceType}`)

    let succeeded = 0
    const errors: string[] = []

    for (const post of posts) {
      try {
        // ✅ Update attempt tracking
        const attemptCount = (post.attempt_count || 0) + 1
        await supabase
          .from('scheduled_posts')
          .update({
            attempt_count: attemptCount,
            last_attempt_at: now.toISOString()
          })
          .eq('id', post.id)

        // Get service configuration
        const { data: service, error: serviceError } = await supabase
          .from('external_services')
          .select('*')
          .eq('service_type', post.service_type)
          .eq('is_active', true)
          .single()

        if (serviceError || !service) {
          throw new Error(`Service not found for service_type: ${post.service_type}`)
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
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }

        if (service.api_key) {
          headers['Authorization'] = `Bearer ${service.api_key}`
        }

        const response = await fetch(service.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const responseText = await response.text().catch(() => 'Unable to read response')
          throw new Error(`External service responded with ${response.status}: ${responseText}`)
        }

        console.log(`Successfully forwarded post ${post.id} to ${post.service_type}`)

        // ✅ Update platform assignments
        await supabase
          .from('dashboard_platform_assignments')
          .update({ 
            delivery_status: 'sent', 
            sent_at: now.toISOString()
          })
          .eq('scheduled_post_id', post.id)

        // ✅ Mark as published with updated columns
        await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'published',
            post_status: 'published',
            updated_at: now.toISOString()
          })
          .eq('id', post.id)

        succeeded++
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`Post ${post.id}: ${errorMessage}`)
        
        console.error(`Failed to process post ${post.id}:`, errorMessage)

        // ✅ Update with all error tracking columns
        const retryCount = (post.retry_count || 0) + 1
        const maxRetries = 3
        const finalStatus = retryCount >= maxRetries ? 'failed' : 'pending'

        await supabase
          .from('scheduled_posts')
          .update({ 
            status: finalStatus,
            post_status: finalStatus,
            failure_reason: errorMessage,
            error_message: errorMessage,
            retry_count: retryCount,
            updated_at: now.toISOString()
          })
          .eq('id', post.id)

        // ✅ Update platform assignments to failed
        await supabase
          .from('dashboard_platform_assignments')
          .update({
            delivery_status: 'failed',
            error_message: errorMessage
          })
          .eq('scheduled_post_id', post.id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        service_type: requestedServiceType,
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
