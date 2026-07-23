import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { generateClaimToken, generateShortCode, normalizeHttpUrl } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: "Service unavailable" }, 503);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request" }, 400);
  }

  const destinationUrl = normalizeHttpUrl(body.destination_url);
  if (!destinationUrl) return jsonResponse({ error: "Enter a valid HTTP(S) URL." }, 400);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const claimToken = generateClaimToken();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateShortCode();
    const { data, error } = await admin
      .from("links")
      .insert({
        user_id: null,
        slug: code,
        short_code: code,
        title: "",
        destination_url: destinationUrl,
        original_url: destinationUrl,
        claim_token: claimToken,
      })
      .select("id, slug")
      .single();

    if (!error && data) {
      return jsonResponse({ id: data.id, slug: data.slug, claim_token: claimToken });
    }

    if (error?.code !== "23505") {
      return jsonResponse({ error: "Could not create link" }, 400);
    }
  }

  return jsonResponse({ error: "Could not generate a unique short code" }, 409);
});