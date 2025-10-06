# Deployment Checklist

## Pre-Deployment

### Database Setup
- [ ] `scheduled_posts` table created with all columns
- [ ] `dashboard_platform_assignments` table created
- [ ] `external_services` table created
- [ ] RLS policies configured for all tables
- [ ] Indexes added for performance (scheduled_date, status)

### External Services
- [ ] Telegram bot service URL added to external_services
- [ ] Other platform services added (if applicable)
- [ ] Service endpoints tested manually
- [ ] API keys stored securely

### Code Integration
- [ ] All component files copied to project structure
- [ ] Import paths updated to match project
- [ ] config.ts has correct Supabase credentials
- [ ] types.ts imported correctly in all files
- [ ] No TypeScript errors in main project

## Vercel Deployment

- [ ] `vercel.json` copied to project root
- [ ] API route created: `/pages/api/cron/process-scheduled-posts.ts`
- [ ] Import path updated in API route
- [ ] Environment variables set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `CRON_SECRET` (optional but recommended)
- [ ] Deployed to Vercel
- [ ] Cron job visible in Vercel dashboard
- [ ] Test cron endpoint manually

## Render Deployment

- [ ] `render.yaml` copied to project root
- [ ] Build command configured
- [ ] Start command configured
- [ ] Environment variables set:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_KEY`
- [ ] Deployed to Render
- [ ] Cron job service created automatically
- [ ] Check logs for successful runs

## Testing

### Component Testing
- [ ] Schedule modal opens correctly
- [ ] Service dropdown loads from database
- [ ] Character profile displays with avatar
- [ ] Media files show thumbnails
- [ ] Date/time picker works
- [ ] Timezone selector works
- [ ] Validation prevents submission without service

### Database Testing
- [ ] Post created in scheduled_posts with correct data
- [ ] Platform assignments created for each platform
- [ ] post_content JSON structure is correct
- [ ] Status updates correctly

### Cron Job Testing
- [ ] Create test post scheduled for 2 minutes from now
- [ ] Wait for cron to run
- [ ] Check scheduled_posts status changed to 'published'
- [ ] Check dashboard_platform_assignments updated to 'sent'
- [ ] Verify external service received POST request
- [ ] Check logs for any errors

### Error Handling
- [ ] Test with invalid service URL (should mark as failed)
- [ ] Test with missing required fields
- [ ] Test retry logic for failed posts
- [ ] Verify failure_reason is populated

## Post-Deployment

### Monitoring
- [ ] Set up alerts for failed posts
- [ ] Monitor cron job execution logs
- [ ] Track delivery success rate
- [ ] Monitor external service response times

### Documentation
- [ ] Team trained on new workflow
- [ ] External service API documented
- [ ] Troubleshooting guide shared
- [ ] Backup/recovery procedures documented

### Optimization
- [ ] Review cron frequency (every minute vs less frequent)
- [ ] Add database indexes if queries are slow
- [ ] Consider batch processing for high volume
- [ ] Implement rate limiting if needed

## Common Issues & Solutions

### Issue: Cron not running
**Solution:** 
- Check vercel.json/render.yaml syntax
- Verify environment variables
- Check service logs

### Issue: Posts not forwarding
**Solution:**
- Verify external_services.url is correct
- Test endpoint manually with curl
- Check scheduled_posts.failure_reason

### Issue: Timezone issues
**Solution:**
- Ensure scheduled_date stored as UTC
- Convert timezone on display only
- Test with different timezones

### Issue: Media files not loading
**Solution:**
- Check Supabase storage permissions
- Verify public URLs are accessible
- Check CORS settings

## Success Criteria

✅ Posts schedule successfully from UI
✅ Cron job runs every minute without errors
✅ Posts forward to external services at correct time
✅ All platforms receive posts correctly
✅ Failed posts marked with reason
✅ No data loss or corruption
✅ Performance is acceptable (< 5s per post)

---

**Ready for Production:** [ ]

**Signed off by:** _____________
**Date:** _____________
