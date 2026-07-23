CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS claim_token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex');

CREATE UNIQUE INDEX IF NOT EXISTS links_claim_token_key ON public.links (claim_token);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'links_claim_token_format') THEN
    ALTER TABLE public.links
      ADD CONSTRAINT links_claim_token_format
      CHECK (claim_token ~ '^[a-f0-9]{64}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'links_slug_length_and_no_spaces') THEN
    ALTER TABLE public.links
      ADD CONSTRAINT links_slug_length_and_no_spaces
      CHECK (char_length(slug) BETWEEN 1 AND 128 AND slug !~ '[[:space:]]');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'links_short_code_length_and_no_spaces') THEN
    ALTER TABLE public.links
      ADD CONSTRAINT links_short_code_length_and_no_spaces
      CHECK (char_length(short_code) BETWEEN 1 AND 128 AND short_code !~ '[[:space:]]');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'links_title_length') THEN
    ALTER TABLE public.links
      ADD CONSTRAINT links_title_length
      CHECK (char_length(title) <= 160);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'links_destination_url_http') THEN
    ALTER TABLE public.links
      ADD CONSTRAINT links_destination_url_http
      CHECK (char_length(destination_url) <= 2048 AND destination_url ~* '^https?://[^[:space:]]+$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'links_original_url_http') THEN
    ALTER TABLE public.links
      ADD CONSTRAINT links_original_url_http
      CHECK (char_length(original_url) <= 2048 AND original_url ~* '^https?://[^[:space:]]+$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_full_name_length') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_full_name_length
      CHECK (char_length(full_name) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_avatar_url_http') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_avatar_url_http
      CHECK (avatar_url IS NULL OR (char_length(avatar_url) <= 2048 AND avatar_url ~* '^https?://[^[:space:]]+$'));
  END IF;
END $$;

ALTER TABLE public.clicks
  ADD COLUMN IF NOT EXISTS short_code text;

UPDATE public.clicks c
SET short_code = l.short_code
FROM public.links l
WHERE c.link_id = l.id
  AND c.short_code IS NULL;

ALTER TABLE public.clicks
  ALTER COLUMN short_code SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clicks_short_code_length_and_no_spaces') THEN
    ALTER TABLE public.clicks
      ADD CONSTRAINT clicks_short_code_length_and_no_spaces
      CHECK (char_length(short_code) BETWEEN 1 AND 128 AND short_code !~ '[[:space:]]');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clicks_device_allowed') THEN
    ALTER TABLE public.clicks
      ADD CONSTRAINT clicks_device_allowed
      CHECK (device IN ('desktop', 'mobile', 'tablet'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clicks_browser_length') THEN
    ALTER TABLE public.clicks
      ADD CONSTRAINT clicks_browser_length
      CHECK (char_length(browser) <= 40);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clicks_referrer_length') THEN
    ALTER TABLE public.clicks
      ADD CONSTRAINT clicks_referrer_length
      CHECK (char_length(referrer) <= 255);
  END IF;
END $$;

DROP POLICY IF EXISTS "links claim anonymous" ON public.links;
DROP FUNCTION IF EXISTS public.claim_anonymous_link(text);

CREATE OR REPLACE FUNCTION public.claim_anonymous_link(_link_id uuid, _claim_token text)
RETURNS public.links
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.links;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF _claim_token IS NULL OR _claim_token !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'invalid claim token';
  END IF;

  UPDATE public.links
     SET user_id = auth.uid(),
         claim_token = encode(gen_random_bytes(32), 'hex'),
         updated_at = now()
   WHERE id = _link_id
     AND user_id IS NULL
     AND claim_token = _claim_token
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'invalid or expired claim token';
  END IF;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_anonymous_link(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_link(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_link(uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.resolve_link_by_code(_short_code text)
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
GRANT EXECUTE ON FUNCTION public.resolve_link_by_code(text) TO service_role;

CREATE OR REPLACE FUNCTION public.resolve_link_by_slug(_slug text)
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
GRANT EXECUTE ON FUNCTION public.resolve_link_by_slug(text) TO service_role;

DROP POLICY IF EXISTS "clicks anon insert" ON public.clicks;
CREATE POLICY "clicks anon insert matching short code"
ON public.clicks
FOR INSERT
TO anon
WITH CHECK (
  short_code IS NOT NULL
  AND device IN ('desktop', 'mobile', 'tablet')
  AND char_length(browser) <= 40
  AND char_length(referrer) <= 255
  AND EXISTS (
    SELECT 1
    FROM public.links l
    WHERE l.id = clicks.link_id
      AND l.short_code = clicks.short_code
  )
);

DROP TRIGGER IF EXISTS increment_clicks_count_after_insert ON public.clicks;
CREATE TRIGGER increment_clicks_count_after_insert
AFTER INSERT ON public.clicks
FOR EACH ROW
EXECUTE FUNCTION public.increment_clicks_count();