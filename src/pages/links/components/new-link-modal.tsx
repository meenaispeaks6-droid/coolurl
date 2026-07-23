import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/base/button";
import { useDataProvider } from "@/lib/data-provider";
import { shortLinkOrigin } from "@/lib/utils";

function normalizeInputUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function validateSlug(value: string): string | null {
  const slug = value.trim();
  if (!slug) return null;
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(slug)) {
    return "Use 1–64 letters, numbers, dashes, or underscores. Start with a letter or number.";
  }
  return null;
}

interface NewLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewLinkModal({ open, onOpenChange }: NewLinkModalProps) {
  const [destinationUrl, setDestinationUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [urlError, setUrlError] = useState("");
  const [slugError, setSlugError] = useState("");

  const { useCreateLink } = useDataProvider();
  const { mutate: createLink, isPending } = useCreateLink();

  const resetForm = () => {
    setDestinationUrl("");
    setSlug("");
    setTitle("");
    setUrlError("");
    setSlugError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError("");
    setSlugError("");

    const normalizedUrl = normalizeInputUrl(destinationUrl);
    try {
      const parsed = new URL(normalizedUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setUrlError("Enter a valid URL (e.g. https://example.com)");
        return;
      }
      if (parsed.toString().length > 2048) {
        setUrlError("URL must be 2,048 characters or less.");
        return;
      }
    } catch {
      setUrlError("Enter a valid URL (e.g. https://example.com)");
      return;
    }

    const slugValidationError = validateSlug(slug);
    if (slugValidationError) {
      setSlugError(slugValidationError);
      return;
    }

    if (title.trim().length > 160) {
      setUrlError("Title must be 160 characters or less.");
      return;
    }

    createLink(
      {
        title: title.trim(),
        slug: slug.trim(),
        destination_url: normalizedUrl,
      },
      {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
        },
        onError: (err: Error) => {
          if (err.message.includes("slug")) {
            setSlugError(err.message);
          }
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New short link</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new short link
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination-url">Destination URL *</Label>
            <Input
              id="destination-url"
              type="url"
              placeholder="https://"
              value={destinationUrl}
              onChange={(e) => {
                setDestinationUrl(e.target.value);
                if (urlError) setUrlError("");
              }}
              className={urlError ? "border-destructive" : ""}
            />
            {urlError && (
              <p className="text-sm text-destructive">{urlError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Custom slug (optional)</Label>
            <div className="flex items-center gap-0">
              <span className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                {shortLinkOrigin().replace(/^https?:\/\//, "")}/s/
              </span>
              <Input
                id="slug"
                placeholder="my-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  if (slugError) setSlugError("");
                }}
                className={`rounded-l-none ${slugError ? "border-destructive" : ""}`}
              />
            </div>
            {slugError ? (
              <p className="text-sm text-destructive">{slugError}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Case-sensitive. Leave blank to auto-generate.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="e.g. Q1 Planning Doc"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              Create link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
