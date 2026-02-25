-- Enable the pg_cron extension to schedule jobs (if not already enabled)
-- Note: This usually requires Supabase Pro or specific permissions. 
-- If this fails, you can run the DELETE query manually or via an Edge Function/Webhook.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a daily job to delete creations older than 7 days
-- Runs every day at midnight (UTC)
SELECT cron.schedule(
  'delete_old_creations_daily', -- Job name
  '0 0 * * *',                  -- Schedule (Midnight daily)
  $$DELETE FROM creations WHERE created_at < NOW() - INTERVAL '7 days';$$
);

-- OPTIONAL: If you want to check if it's scheduled
-- SELECT * FROM cron.job;

-- OPTIONAL: Validating the retention query (Safe run to see count)
-- SELECT count(*) FROM creations WHERE created_at < NOW() - INTERVAL '7 days';
