DROP FUNCTION IF EXISTS public.resolve_link_by_code(text);
DROP FUNCTION IF EXISTS public.resolve_link_by_slug(text);

DROP POLICY IF EXISTS "clicks select own link" ON public.clicks;
DROP POLICY IF EXISTS "clicks anon insert" ON public.clicks;

ALTER TABLE public.clicks DROP CONSTRAINT IF EXISTS clicks_link_id_fkey;

ALTER TABLE public.links
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.clicks
  ALTER COLUMN link_id TYPE uuid USING link_id::uuid;

ALTER TABLE public.clicks
  ADD CONSTRAINT clicks_link_id_fkey
  FOREIGN KEY (link_id) REFERENCES public.links(id) ON DELETE CASCADE;

CREATE POLICY "clicks select own link"
ON public.clicks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.links
    WHERE links.id = clicks.link_id
      AND links.user_id = auth.uid()
  )
);

CREATE POLICY "clicks anon insert"
ON public.clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.links l WHERE l.id = link_id));

CREATE FUNCTION public.resolve_link_by_code(_short_code text)
RETURNS TABLE (id uuid, original_url text)
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

CREATE FUNCTION public.resolve_link_by_slug(_slug text)
RETURNS TABLE (id uuid, destination_url text)
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
