# Cron Job Setup Guide

This project uses **two external cron services** to process scheduled posts:
1. **GitHub Actions** (free, runs on GitHub's infrastructure)
2. **cron-job.org** (free tier available, external service)

Both services call the same Supabase Edge Function to process posts.

---

## Setup Instructions

### 1. Deploy Supabase Edge Function

First, deploy the Edge Function to Supabase:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (replace with your project ref)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy process-scheduled-posts
```

After deployment, you'll get a function URL like:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-posts
```

### 2. Set Supabase Secrets

Set the CRON_SECRET for authentication:

```bash
supabase secrets set CRON_SECRET=your-random-secret-key-here
```

Generate a strong secret:
```bash
openssl rand -base64 32
```

---

## GitHub Actions Setup

### 1. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:
- **SUPABASE_FUNCTION_URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-posts`
- **CRON_SECRET**: Same secret you set in Supabase

### 2. Configure Schedule

Edit `.github/workflows/process-scheduled-posts.yml` to set your desired times:

```yaml
schedule:
  # Cron syntax: minute hour day month weekday
  - cron: '0 11 * * *'   # 11:00 AM UTC daily
  - cron: '0 19 * * *'   # 7:00 PM UTC daily
  - cron: '30 14 * * *'  # 2:30 PM UTC daily
  - cron: '0 */4 * * *'  # Every 4 hours
```

**Cron Syntax Guide:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, Sunday=0)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Examples:**
- `0 9 * * *` - Every day at 9:00 AM UTC
- `30 14 * * 1-5` - Weekdays at 2:30 PM UTC
- `0 */6 * * *` - Every 6 hours
- `15,45 * * * *` - At 15 and 45 minutes past every hour
- `0 8-17 * * 1-5` - Every hour from 8 AM to 5 PM on weekdays

### 3. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. If prompted, enable workflows
4. The workflow will run automatically on schedule
5. You can also trigger it manually from the Actions tab

---

## cron-job.org Setup

### 1. Create Account

1. Go to [cron-job.org](https://cron-job.org)
2. Sign up for a free account
3. Verify your email

### 2. Create Cron Job

1. Click "Create cronjob"
2. Fill in the details:

**Basic Settings:**
- **Title**: Process Scheduled Posts (Service 1)
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-posts`
- **Request method**: POST

**Schedule:**
Choose one of these patterns (or create custom):
- Every hour: `0 * * * *`
- Every 2 hours: `0 */2 * * *`
- Every 4 hours: `0 */4 * * *`
- Specific times: `0 10,15,20 * * *` (10 AM, 3 PM, 8 PM UTC)
- Custom: Use the cron expression builder

**Advanced Settings:**
- Click "Headers" and add:
  - Header name: `Authorization`
  - Header value: `Bearer YOUR_CRON_SECRET`
- Click "Request body" and add:
  ```json
  {}
  ```
- Content-Type: `application/json`

**Notifications (optional):**
- Enable email notifications on failure
- Set failure threshold (e.g., notify after 2 consecutive failures)

### 3. Create Multiple Jobs (Alternating Services)

To avoid overloading one service, create multiple cron jobs with different schedules:

**Job 1 - Morning/Evening:**
- Schedule: `0 9,21 * * *` (9 AM and 9 PM UTC)
- Title: Process Posts - Morning/Evening

**Job 2 - Afternoon:**
- Schedule: `0 15 * * *` (3 PM UTC)
- Title: Process Posts - Afternoon

**Job 3 - Night:**
- Schedule: `0 3 * * *` (3 AM UTC)
- Title: Process Posts - Night

This spreads the load and provides redundancy.

---

## Recommended Schedule Strategy

To alternate between GitHub Actions and cron-job.org:

### GitHub Actions (Primary)
```yaml
schedule:
  - cron: '0 11 * * *'   # 11 AM UTC
  - cron: '0 19 * * *'   # 7 PM UTC
```

### cron-job.org (Backup/Additional)
- Job 1: `0 7 * * *` (7 AM UTC)
- Job 2: `0 15 * * *` (3 PM UTC)
- Job 3: `0 23 * * *` (11 PM UTC)

This gives you 5 processing times per day, alternating between services.

---

## Testing

### Test Supabase Function Directly

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-posts
```

### Test GitHub Action

1. Go to Actions tab in your GitHub repo
2. Select "Process Scheduled Posts" workflow
3. Click "Run workflow" → "Run workflow"
4. Check the logs to see results

### Test cron-job.org

1. Go to your cron-job.org dashboard
2. Find your job
3. Click the "Execute now" button
4. Check execution history for results

---

## Monitoring

### GitHub Actions
- View execution history in the Actions tab
- Check logs for each run
- Set up email notifications in your GitHub settings

### cron-job.org
- Dashboard shows execution history
- Configure email notifications for failures
- View response codes and execution times

### Supabase
- Check function logs in Supabase dashboard
- Monitor function invocations
- Set up log alerts for errors

---

## Troubleshooting

### Function Returns 401 Unauthorized
- Check that CRON_SECRET matches in both Supabase and the calling service
- Verify the Authorization header format: `Bearer YOUR_SECRET`

### Function Returns 500 Error
- Check Supabase function logs
- Verify environment variables are set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Test database queries manually

### GitHub Action Fails
- Check the workflow logs
- Verify secrets are set correctly in GitHub
- Ensure the function URL is correct

### cron-job.org Shows Timeout
- Supabase functions have a 60-second timeout
- If processing many posts, consider reducing the limit in the function
- Check Supabase function logs for the actual error

### Posts Not Being Processed
- Verify posts exist with status='pending' and scheduled_date <= now
- Check that external_services table has the correct service configurations
- Review function logs for specific errors

---

## Cost Considerations

### GitHub Actions
- **Free tier**: 2,000 minutes/month for private repos, unlimited for public repos
- Each workflow run takes ~1 minute
- Running 5 times/day = ~150 minutes/month (well within free tier)

### cron-job.org
- **Free tier**: Up to 50 cron jobs, 1-minute intervals
- No execution limits
- Premium: $4.99/month for more features

### Supabase Edge Functions
- **Free tier**: 500,000 invocations/month, 2 million execution seconds
- Running 5-10 times/day = ~300 invocations/month (well within free tier)

---

## Security Best Practices

1. **Never commit secrets** to your repository
2. **Use strong random secrets** for CRON_SECRET
3. **Rotate secrets periodically** (every 3-6 months)
4. **Monitor function logs** for unauthorized access attempts
5. **Use HTTPS only** for all endpoints
6. **Limit function execution time** to prevent abuse
7. **Implement rate limiting** if needed

---

## Customization

### Change Processing Limit

Edit `supabase/functions/process-scheduled-posts/index.ts`:

```typescript
.limit(50)  // Change this number
```

### Add Retry Logic

Modify the error handling to implement exponential backoff or custom retry logic.

### Add Notifications

Integrate with email/SMS services to notify on success or failure.

### Filter by Service Type

Add query parameters to process only specific service types.

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase function logs
3. Check GitHub Actions logs
4. Verify cron-job.org execution history
5. Test the function directly with curl
