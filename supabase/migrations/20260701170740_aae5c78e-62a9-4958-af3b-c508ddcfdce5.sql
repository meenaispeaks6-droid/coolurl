CREATE OR REPLACE FUNCTION public.claim_anonymous_link(link_id text)
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

  UPDATE public.links
     SET user_id = auth.uid(),
         updated_at = now()
   WHERE id = link_id
     AND user_id IS NULL
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_anonymous_link(text) TO authenticated;