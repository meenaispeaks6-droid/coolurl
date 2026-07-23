
-- 1. Restrict anon SELECT on links: drop the permissive policy
DROP POLICY IF EXISTS "links anon select by slug" ON public.links;

-- 2. Safe lookup function for anonymous redirect flow
CREATE OR REPLACE FUNCTION public.resolve_link_by_slug(_slug text)
RETURNS TABLE (id text, destination_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, destination_url
  FROM public.links
  WHERE slug = _slug
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.resolve_link_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_link_by_slug(text) TO anon, authenticated;

-- 3. Tighten anon insert on clicks: require link to exist
DROP POLICY IF EXISTS "clicks anon insert" ON public.clicks;
CREATE POLICY "clicks anon insert"
ON public.clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.links l WHERE l.id = link_id));

-- 4. Lock down SECURITY DEFINER functions that shouldn't be publicly callable
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_clicks_count() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.claim_anonymous_link(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_link(text) TO authenticated;
