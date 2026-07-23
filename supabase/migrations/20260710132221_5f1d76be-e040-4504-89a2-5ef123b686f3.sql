ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0;

UPDATE public.links
SET click_count = clicks_count
WHERE click_count IS DISTINCT FROM clicks_count;

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

  IF NEW.click_count IS NULL THEN
    NEW.click_count := COALESCE(NEW.clicks_count, 0);
  END IF;

  IF NEW.clicks_count IS NULL THEN
    NEW.clicks_count := COALESCE(NEW.click_count, 0);
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_links_public_columns() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_clicks_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.links
  SET clicks_count = clicks_count + 1,
      click_count = click_count + 1,
      updated_at = now()
  WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_clicks_count() FROM PUBLIC, anon, authenticated;
