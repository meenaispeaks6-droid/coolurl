import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { isValidShortCode, safeDevice, safeText } from "../_shared/security.ts";

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

  const shortCode = body.short_code;
  if (!isValidShortCode(shortCode)) return jsonResponse({ error: "Link not found" }, 404);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: link, error: linkError } = await admin
    .from("links")
    .select("id, original_url")
    .eq("short_code", shortCode)
    .maybeSingle();

  if (linkError) return jsonResponse({ error: "Could not resolve link" }, 400);
  if (!link) return jsonResponse({ error: "Link not found" }, 404);

  await admin.from("clicks").insert({
    link_id: link.id,
    short_code: shortCode,
    device: safeDevice(body.device),
    browser: safeText(body.browser, "Other", 40),
    referrer: safeText(body.referrer, "Direct", 255),
  });

  return jsonResponse({ original_url: link.original_url });
});