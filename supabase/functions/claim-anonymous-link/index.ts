import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { generateClaimToken, isValidClaimToken } from "../_shared/security.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: "Service unavailable" }, 503);

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return jsonResponse({ error: "Authentication required" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request" }, 400);
  }

  const linkId = typeof body.link_id === "string" ? body.link_id : "";
  const claimToken = body.claim_token;
  if (!UUID_RE.test(linkId) || !isValidClaimToken(claimToken)) {
    return jsonResponse({ error: "Invalid claim" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return jsonResponse({ error: "Authentication required" }, 401);

  const { data, error } = await admin
    .from("links")
    .update({
      user_id: authData.user.id,
      claim_token: generateClaimToken(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", linkId)
    .is("user_id", null)
    .eq("claim_token", claimToken)
    .select("id, slug, title, destination_url, clicks_count, created_at, updated_at")
    .maybeSingle();

  if (error) return jsonResponse({ error: "Could not claim link" }, 400);
  if (!data) return jsonResponse({ error: "Invalid or expired claim" }, 403);

  return jsonResponse({ link: data });
});