import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  IconCopy,
  IconExternalLink,
  IconShare2,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/base/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDataProvider } from "@/lib/data-provider";
import { shortLinkUrl, shortLinkDisplay, shortLinkOrigin } from "@/lib/utils";
import { DeleteLinkDialog } from "./delete-link-dialog";
import { SharePopover } from "./share-popover";
import type { Link } from "@/data/seed";

interface LinkInfoCardProps {
  link: Link;
  isDemo?: boolean;
  onDeleted: () => void;
}

export function LinkInfoCard({ link, isDemo, onDeleted }: LinkInfoCardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEdit = searchParams.get("mode") === "edit";
  const [isEditing, setIsEditing] = useState(initialEdit);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [title, setTitle] = useState(link.title);
  const [slug, setSlug] = useState(link.slug);
  const [destinationUrl, setDestinationUrl] = useState(link.destination_url);
  const [formError, setFormError] = useState("");

  const { useUpdateLink, useDeleteLink } = useDataProvider();
  const { mutate: updateLink, isPending: isUpdating } = useUpdateLink();
  const { mutate: deleteLink } = useDeleteLink();

  const shortUrl = shortLinkDisplay(link.slug);
  const createdDate = new Date(link.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortLinkUrl(link.slug));
    toast.success("Copied to clipboard");
  };

  const handleEdit = () => {
    setTitle(link.title);
    setSlug(link.slug);
    setDestinationUrl(link.destination_url);
    setFormError("");
    setIsEditing(true);
  };

  const handleDiscard = () => {
    setIsEditing(false);
    setSearchParams((prev) => {
      prev.delete("mode");
      return prev;
    });
  };

  const handleSave = () => {
    setFormError("");
    const trimmedSlug = slug.trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(trimmedSlug)) {
      setFormError("Slug must use 1–64 letters, numbers, dashes, or underscores and start with a letter or number.");
      return;
    }

    if (title.trim().length > 160) {
      setFormError("Title must be 160 characters or less.");
      return;
    }

    try {
      const parsed = new URL(/^https?:\/\//i.test(destinationUrl.trim()) ? destinationUrl.trim() : `https://${destinationUrl.trim()}`);
      if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || parsed.toString().length > 2048) {
        setFormError("Enter a valid HTTP(S) URL that is 2,048 characters or less.");
        return;
      }
    } catch {
      setFormError("Enter a valid URL (e.g. https://example.com).");
      return;
    }

    updateLink(
      { id: link.id, input: { title, slug: trimmedSlug, destination_url: destinationUrl } },
      {
        onSuccess: () => {
          setIsEditing(false);
          setSearchParams((prev) => {
            prev.delete("mode");
            return prev;
          });
        },
        onError: (error) => setFormError(error.message || "Could not save changes."),
      }
    );
  };

  const handleDelete = () => {
    deleteLink(link.id);
    onDeleted();
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Edit link</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleDiscard}>
              Discard
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              Save changes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Link title…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex items-center gap-0">
              <span className="flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                {shortLinkOrigin().replace(/^https?:\/\//, "")}/s/
              </span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-l-none"
                placeholder="slug…"
              />
            </div>
            <p className="flex items-center gap-1.5 text-sm text-amber-600">
              <IconAlertTriangle className="size-4" />
              Changing the slug will break existing shared links
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination URL</Label>
            <Input
              id="destination"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">{link.title}</CardTitle>
          <div className="flex items-center gap-2">
            <SharePopover slug={link.slug} isDemo={isDemo} />
            <Button variant="ghost" onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Short URL</dt>
              <dd className="mt-1 flex items-center gap-2">
                <code className="font-mono text-sm">{shortUrl}</code>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                  <IconCopy className="size-4" />
                </Button>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Destination</dt>
              <dd className="mt-1 flex items-center gap-2">
                <a
                  href={link.destination_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm text-foreground underline underline-offset-4"
                >
                  {link.destination_url}
                </a>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
                  <a href={link.destination_url} target="_blank" rel="noopener noreferrer">
                    <IconExternalLink className="size-4" />
                  </a>
                </Button>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Slug</dt>
              <dd className="mt-1">
                <code className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-sm">{link.slug}</code>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Created</dt>
              <dd className="mt-1 text-sm">{createdDate}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <DeleteLinkDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        slug={link.slug}
        onConfirm={handleDelete}
      />
    </>
  );
}
