-- Add the public short-link fields requested by the demo flow while preserving the existing dashboard fields.
ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS short_code text,
  ADD COLUMN IF NOT EXISTS original_url text;

-- Backfill the new fields from the existing schema so existing links continue to work.
UPDATE public.links
SET short_code = COALESCE(short_code, slug),
    original_url = COALESCE(original_url, destination_url)
WHERE short_code IS NULL OR original_url IS NULL;

ALTER TABLE public.links
  ALTER COLUMN short_code SET NOT NULL,
  ALTER COLUMN original_url SET NOT NULL;

ALTER TABLE public.links
  ADD CONSTRAINT links_short_code_key UNIQUE (short_code);

CREATE INDEX IF NOT EXISTS links_short_code_idx ON public.links(short_code);

-- Keep legacy/dashboard columns and public demo columns synchronized.
CREATE OR REPLACE FUNCTION public.sync_links_public_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
    NEW.short_code := NEW.slug;
  END IF;

  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := NEW.short_code;
  END IF;

  IF NEW.original_url IS NULL OR NEW.original_url = '' THEN
    NEW.original_url := NEW.destination_url;
  END IF;

  IF NEW.destination_url IS NULL OR NEW.destination_url = '' THEN
    NEW.destination_url := NEW.original_url;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_links_public_columns_before_write ON public.links;
CREATE TRIGGER sync_links_public_columns_before_write
BEFORE INSERT OR UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.sync_links_public_columns();

REVOKE ALL ON FUNCTION public.sync_links_public_columns() FROM PUBLIC, anon, authenticated;

-- Generate a random 6-character alphanumeric code.
CREATE OR REPLACE FUNCTION public.generate_short_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_short_code() FROM PUBLIC, anon, authenticated;

-- Public helper for the landing-page shortener. It inserts the row and returns only the values needed by the UI.
CREATE OR REPLACE FUNCTION public.create_short_link(_original_url text)
RETURNS TABLE (id text, short_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_code text;
  created_id text;
  attempts integer := 0;
BEGIN
  IF _original_url IS NULL OR btrim(_original_url) = '' THEN
    RAISE EXCEPTION 'original_url is required';
  END IF;

  LOOP
    attempts := attempts + 1;
    generated_code := public.generate_short_code();

    BEGIN
      INSERT INTO public.links (user_id, slug, short_code, title, destination_url, original_url)
      VALUES (NULL, generated_code, generated_code, '', _original_url, _original_url)
      RETURNING public.links.id INTO created_id;

      RETURN QUERY SELECT created_id, generated_code;
      RETURN;
    EXCEPTION WHEN unique_violation THEN
      IF attempts >= 8 THEN
        RAISE EXCEPTION 'Could not generate a unique short code';
      END IF;
    END;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.create_short_link(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_short_link(text) TO anon, authenticated;

-- Redirect helper: looks up only the matching code and returns only the destination needed for navigation.
CREATE OR REPLACE FUNCTION public.resolve_link_by_code(_short_code text)
RETURNS TABLE (id text, original_url text)
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

REVOKE ALL ON FUNCTION public.resolve_link_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_link_by_code(text) TO anon, authenticated;

-- Keep the existing redirect helper working by delegating to the new code column.
CREATE OR REPLACE FUNCTION public.resolve_link_by_slug(_slug text)
RETURNS TABLE (id text, destination_url text)
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

REVOKE ALL ON FUNCTION public.resolve_link_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_link_by_slug(text) TO anon, authenticated;

-- Ensure the table grants match the existing RLS policies and public demo creation flow.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.links TO authenticated;
GRANT INSERT ON public.links TO anon;
GRANT ALL ON public.links TO service_role;

-- Keep anonymous table reads restricted; redirect lookups happen through resolve_link_by_code.
DROP POLICY IF EXISTS "links anon select by slug" ON public.links;
DROP POLICY IF EXISTS "links anon select all" ON public.links;

DROP POLICY IF EXISTS "links anon insert" ON public.links;
CREATE POLICY "links anon insert"
ON public.links
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);
