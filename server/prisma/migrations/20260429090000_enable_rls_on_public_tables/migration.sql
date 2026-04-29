-- Supabase exposes tables in the public schema through its Data API.
-- The app uses Express + Prisma for all database access, so no anon/authenticated
-- Supabase policies are needed here. Enabling RLS without policies blocks direct
-- public API access while keeping backend Prisma access intact.

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ShowcaseSlide" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PromoCode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationCode" ENABLE ROW LEVEL SECURITY;
