# Integration Guide

## File Structure in Your Project

```
/src/schedulecomponent/
├── components/
│   ├── ScheduleComponent.tsx  ✅ Main component
│   ├── ScheduleModal.tsx      ✅ Schedule modal with service selection
│   └── EditModal.tsx          (your existing file)
├── hooks/
│   └── useScheduleData.ts     ✅ Data hooks
├── api/
│   ├── scheduleAPI.ts         ✅ All API functions
│   └── cronHandler.ts         ✅ NEW - Cron processor
├── utils/
│   └── styleUtils.ts          (your existing file)
├── types.ts                   ✅ Updated with new types
└── config.ts                  ✅ Supabase config

/pages/api/cron/              (Vercel only)
└── process-scheduled-posts.ts ✅ Copy from api-cron-example.ts

/                              (Root directory)
├── vercel.json               ✅ Vercel cron config
└── render.yaml               ✅ Render cron config
```

## Lint Errors Explanation

The lint errors you see are **expected** because:
1. These files reference `../config` and `../types` which exist in your main project
2. `api-cron-example.ts` is a template - copy it to your Next.js project
3. `cronHandler.ts` needs to be in your project structure with proper imports

## Integration Steps

### Step 1: Copy Files to Your Project
```bash
# Copy these files to your actual project structure
cp ScheduleComponent.tsx /src/schedulecomponent/components/
cp ScheduleModal.tsx /src/schedulecomponent/components/
cp scheduleAPI.ts /src/schedulecomponent/api/
cp types.ts /src/schedulecomponent/
cp cronHandler.ts /src/schedulecomponent/api/
```

### Step 2: Set Up Cron Jobs

#### For Vercel:
1. Copy `api-cron-example.ts` to `/pages/api/cron/process-scheduled-posts.ts`
2. Update import path to match your project structure
3. Copy `vercel.json` to project root
4. Add environment variable: `CRON_SECRET=your-secret-key`

#### For Render:
1. Copy `render.yaml` to project root
2. Update paths if needed
3. Add environment variables in Render dashboard

### Step 3: Database Setup

Ensure these tables exist in Supabase:

```sql
-- scheduled_posts table
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT,
  original_post_id UUID,
  scheduled_date TIMESTAMPTZ,
  timezone TEXT,
  service_type TEXT,
  post_content JSONB,
  selected_platforms TEXT[],
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  failure_reason TEXT,
  user_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- dashboard_platform_assignments table
CREATE TABLE dashboard_platform_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id),
  platform_id TEXT,
  platform_name TEXT,
  delivery_status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- external_services table
CREATE TABLE external_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type TEXT UNIQUE,
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 4: Add External Services

Insert your service endpoints:

```sql
INSERT INTO external_services (service_type, url, is_active)
VALUES 
  ('Telegram Bot Service', 'https://your-bot-api.com/post', true),
  ('Instagram Service', 'https://your-ig-api.com/post', true);
```

## Testing the Workflow

1. **Create a post** in content_posts with status='scheduled'
2. **Open Schedule Modal** - select date, time, timezone, and service
3. **Confirm** - creates entry in scheduled_posts + platform assignments
4. **Cron runs** - processes pending posts at scheduled time
5. **External service** receives complete post JSON
6. **Status updates** - marks as published or failed

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Cron security (optional)
CRON_SECRET=your-secret-key
```

## Troubleshooting

**Lint errors persist?**
- Ensure `config.ts` and `types.ts` are in correct locations
- Check import paths match your project structure

**Cron not running?**
- Verify vercel.json or render.yaml in root directory
- Check environment variables are set
- View logs in Vercel/Render dashboard

**Posts not forwarding?**
- Check external_services table has active services
- Verify service URLs are accessible
- Check scheduled_posts.status and failure_reason
