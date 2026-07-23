-- Resolve the security warnings from the prior migration by removing public SECURITY DEFINER endpoints.
DROP FUNCTION IF EXISTS public.create_short_link(text);

CREATE OR REPLACE FUNCTION public.resolve_link_by_code(_short_code text)
RETURNS TABLE (id text, original_url text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT id, original_url
  FROM public.links
  WHERE short_code = _short_code
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.resolve_link_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_link_by_code(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.resolve_link_by_slug(_slug text)
RETURNS TABLE (id text, destination_url text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT id, original_url AS destination_url
  FROM public.links
  WHERE short_code = _slug
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.resolve_link_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_link_by_slug(text) TO anon, authenticated;

-- Match the requested public demo behavior: anonymous visitors can create links and resolve codes.
REVOKE UPDATE ON public.links FROM anon;
GRANT SELECT, INSERT ON public.links TO anon;

DROP POLICY IF EXISTS "links anon select by slug" ON public.links;
DROP POLICY IF EXISTS "links anon select all" ON public.links;
DROP POLICY IF EXISTS "links anon select public short links" ON public.links;
CREATE POLICY "links anon select public short links"
ON public.links
FOR SELECT
TO anon
USING (short_code IS NOT NULL AND original_url IS NOT NULL);

DROP POLICY IF EXISTS "links anon insert" ON public.links;
CREATE POLICY "links anon insert"
ON public.links
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL AND short_code IS NOT NULL AND original_url IS NOT NULL);
