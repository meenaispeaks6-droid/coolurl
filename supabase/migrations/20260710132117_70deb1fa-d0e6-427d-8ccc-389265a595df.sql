-- Remove the remaining callable SECURITY DEFINER warning while preserving anonymous-link claiming.
CREATE OR REPLACE FUNCTION public.claim_anonymous_link(link_id text)
RETURNS public.links
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  result public.links;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  UPDATE public.links
     SET user_id = auth.uid(),
         updated_at = now()
   WHERE id = link_id
     AND user_id IS NULL
  RETURNING * INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_anonymous_link(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_link(text) TO authenticated;

DROP POLICY IF EXISTS "links claim anonymous" ON public.links;
CREATE POLICY "links claim anonymous"
ON public.links
FOR UPDATE
TO authenticated
USING (user_id IS NULL)
WITH CHECK (auth.uid() = user_id);
