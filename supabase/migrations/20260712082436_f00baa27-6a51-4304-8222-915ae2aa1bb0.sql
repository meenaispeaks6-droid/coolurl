
-- 1. Replace overly-broad anon SELECT policy on links
DROP POLICY IF EXISTS "links anon select public short links" ON public.links;

CREATE POLICY "links anon select unowned only"
ON public.links
FOR SELECT
TO anon
USING (user_id IS NULL AND short_code IS NOT NULL AND original_url IS NOT NULL);

-- 2. Make redirect resolvers SECURITY DEFINER so /s/:slug works for links owned by any user
CREATE OR REPLACE FUNCTION public.resolve_link_by_code(_short_code text)
RETURNS TABLE(id uuid, original_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, original_url
  FROM public.links
  WHERE short_code = _short_code
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.resolve_link_by_slug(_slug text)
RETURNS TABLE(id uuid, destination_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, original_url AS destination_url
  FROM public.links
  WHERE short_code = _slug
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_link_by_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_link_by_slug(text) TO anon, authenticated;
