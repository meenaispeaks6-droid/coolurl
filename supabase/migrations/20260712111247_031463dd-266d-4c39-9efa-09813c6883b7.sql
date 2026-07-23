REVOKE SELECT ON public.links FROM anon;
GRANT SELECT (id, slug, short_code, original_url, destination_url, title, clicks_count, click_count, created_at, updated_at, user_id) ON public.links TO anon;