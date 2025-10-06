# Cron Job Setup for Schedule Component

## Overview
Automated posting system for all platforms including Telegram via external services.

## Files Created
- `cronHandler.ts` - Main cron processor
- `vercel.json` - Vercel cron config (runs every minute)
- `render.yaml` - Render cron config (runs every minute)

## Setup Instructions

### Vercel
1. Deploy to Vercel
2. Create API route: `/api/cron/process-scheduled-posts.ts`
3. Import and call `processScheduledPosts()` from cronHandler
4. Vercel will auto-run based on vercel.json schedule

### Render
1. Deploy to Render
2. Add cron job service using render.yaml
3. Set environment variables (SUPABASE_URL, SUPABASE_KEY)
4. Render will auto-run every minute

## How It Works
1. Cron checks `scheduled_posts` table for pending posts
2. Finds posts where `scheduled_date <= now` and `status = 'pending'`
3. Forwards complete post JSON to external service URL
4. Updates `dashboard_platform_assignments` delivery status
5. Marks post as 'published' or 'failed'

## Database Tables Used
- `scheduled_posts` - Posts awaiting delivery
- `external_services` - Service endpoints (Telegram bot, etc.)
- `dashboard_platform_assignments` - Per-platform tracking
- `dashboard_posts` - Published posts archive
