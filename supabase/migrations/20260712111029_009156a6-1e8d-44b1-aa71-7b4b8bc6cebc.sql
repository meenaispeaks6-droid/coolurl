CREATE OR REPLACE FUNCTION public.claim_anonymous_link(_link_id uuid, _claim_token text)
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

  IF _claim_token IS NULL OR _claim_token !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'invalid claim token';
  END IF;

  PERFORM set_config('app.claim_token', _claim_token, true);

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

DROP POLICY IF EXISTS "links claim anonymous" ON public.links;
CREATE POLICY "links claim anonymous with token"
ON public.links
FOR UPDATE
TO authenticated
USING (
  user_id IS NULL
  AND claim_token = current_setting('app.claim_token', true)
)
WITH CHECK (auth.uid() = user_id);