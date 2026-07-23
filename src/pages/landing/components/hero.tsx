import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IconCircleCheck, IconAlertCircle } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/base/button";
import { Input } from "@/components/ui/input";
import { useCreateAnonymousLink } from "@/lib/data-provider";
import { savePendingAnonymousClaim } from "@/lib/anonymous-claim";
import { PartnerLogoGrid } from "./partner-logo-grid";
import { partnerLogos } from "@/data/landing";
import { cn } from "@/lib/utils";

import { shortLinkDisplay, shortLinkUrl } from "@/lib/utils";

function normalizeInputUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(normalizeInputUrl(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function Hero() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: string; slug: string; claim_token: string } | null>(
    null
  );
  const { mutate, isPending } = useCreateAnonymousLink();

  function handleShorten() {
    if (!isValidUrl(url)) {
      setError("Enter a valid URL (e.g. https://example.com)");
      return;
    }

    setError("");
    mutate(normalizeInputUrl(url), {
      onSuccess: (data) => {
        setResult(data);
        setUrl("");
      },
      onError: () => {
        setError("Something went wrong. Please try again.");
      },
    });
  }

  function handleShortenAnother() {
    setResult(null);
    setUrl("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleCopy(slug: string) {
    navigator.clipboard.writeText(shortLinkUrl(slug));
    toast("Copied to clipboard");
  }

  function handleSaveToDashboard(link: { id: string; claim_token: string }) {
    savePendingAnonymousClaim({ linkId: link.id, claimToken: link.claim_token });
  }

  return (
    <section className="landing relative isolate overflow-hidden py-24">
      {/* Background — grid texture + soft blurred color blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent_80%)] bg-[linear-gradient(to_right,theme(colors.foreground/0.02)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.foreground/0.02)_1px,transparent_1px)] bg-[size:40px_40px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 right-1/4 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <hgroup>
            <h1 className="display mb-6 text-balance">
              URL shortener
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Shorten, customize, and track links
            </p>
          </hgroup>

          <div className="mt-8 flex gap-2">
            <Input
              ref={inputRef}
              type="url"
              placeholder="Paste your long URL here…"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleShorten();
              }}
              className={cn(
                "h-14 text-base",
                error ? "border-destructive" : ""
              )}
              style={{
                boxShadow:
                  "0 0 0 4px color-mix(in oklch, var(--color-primary) 20%, transparent), 0 12px 40px -8px color-mix(in oklch, var(--color-primary) 35%, transparent)",
              }}
            />
            <Button className="h-14 px-6" onClick={handleShorten} disabled={isPending}>
              Shorten
            </Button>
          </div>

          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive text-left">
              <IconAlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          )}

          {result && (
            <div className="mt-4 rounded-lg border border-border bg-card p-6 text-left">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconCircleCheck className="size-4 text-primary" />
                Your short link is ready
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={shortLinkUrl(result.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-lg font-semibold text-primary hover:underline"
                >
                  {shortLinkDisplay(result.slug)}
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(result.slug)}
                >
                  Copy
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to={`/auth?intent=signup&claim=${result.id}`}
                     onClick={() => handleSaveToDashboard(result)}
                  >
                    Save to dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShortenAnother}
                >
                  Shorten another
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="mx-auto mt-20 max-w-5xl" aria-label="Trusted by">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Loved by teams shipping fast
          </p>
          <PartnerLogoGrid logos={partnerLogos} />
        </aside>
      </div>
    </section>
  );
}

