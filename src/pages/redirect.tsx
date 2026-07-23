import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

function detectReferrer(): string {
  try {
    if (!document.referrer) return "Direct";
    return new URL(document.referrer).hostname || "Direct";
  } catch {
    return "Direct";
  }
}

export default function RedirectPage() {
  const { slug } = useParams<{ slug: string }>();
  const code = slug;
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) {
      setNotFound(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.functions.invoke("resolve-link", {
        body: {
          short_code: code,
          device: detectDevice(),
          browser: detectBrowser(),
          referrer: detectReferrer(),
        },
      });

      if (cancelled) return;
      if (error || !data?.original_url) {
        setNotFound(true);
        return;
      }

      window.location.href = data.original_url;
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (notFound) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <h1 className="text-2xl font-semibold">Link not found</h1>
        <p className="text-muted-foreground">
          The short link <code className="font-mono">/s/{code}</code> doesn't exist.
        </p>
        <Link to="/" className="text-primary underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirecting…</p>
    </div>
  );
}
