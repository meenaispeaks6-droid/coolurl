DROP POLICY IF EXISTS "clicks anon insert matching short code" ON public.clicks;
DROP POLICY IF EXISTS "clicks insert matching short code" ON public.clicks;

CREATE POLICY "clicks insert matching short code"
ON public.clicks
FOR INSERT
TO anon, authenticated
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