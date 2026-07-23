DROP POLICY IF EXISTS "links anon select unowned only" ON public.links;
DROP POLICY IF EXISTS "links anon select public short links" ON public.links;
DROP POLICY IF EXISTS "links anon insert" ON public.links;
DROP POLICY IF EXISTS "links claim anonymous" ON public.links;
DROP POLICY IF EXISTS "links claim anonymous with token" ON public.links;
DROP POLICY IF EXISTS "clicks anon insert" ON public.clicks;
DROP POLICY IF EXISTS "clicks anon insert matching short code" ON public.clicks;
DROP POLICY IF EXISTS "clicks insert matching short code" ON public.clicks;

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.links FROM anon;
REVOKE INSERT ON public.clicks FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_link_by_code(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_link_by_slug(text) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.claim_anonymous_link(uuid, text);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.links TO authenticated;
GRANT SELECT ON public.clicks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.links TO service_role;
GRANT ALL ON public.clicks TO service_role;
GRANT ALL ON public.profiles TO service_role;