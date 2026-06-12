-- Supabase Advisor checks every table in the public schema, including Prisma's
-- migration history table. The app never needs to expose this table through the
-- Supabase Data API, so RLS should be enabled with no public policies.

ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
