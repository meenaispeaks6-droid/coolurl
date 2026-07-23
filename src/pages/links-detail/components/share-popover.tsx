import { IconShare2, IconCopy, IconMail, IconBrandX } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/base/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SharePopoverProps {
  slug: string;
  isDemo?: boolean;
}

export function SharePopover({ slug }: SharePopoverProps) {
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${slug}`
      : `/s/${slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: fullUrl });
      } catch {
        // user cancelled
      }
      return;
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    toast.success("Copied to clipboard");
  };

  if (typeof navigator !== "undefined" && navigator.share) {
    return (
      <Button variant="ghost" onClick={handleShare}>
        <IconShare2 className="size-4" />
        Share
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <IconShare2 className="size-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        <button
          onClick={handleCopy}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
        >
          <IconCopy className="size-4" />
          Copy link
        </button>
        <a
          href={`mailto:?body=${encodeURIComponent(fullUrl)}`}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
        >
          <IconMail className="size-4" />
          Email
        </a>
        <a
          href={`https://x.com/intent/tweet?url=${encodeURIComponent(fullUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
        >
          <IconBrandX className="size-4" />
          X / Twitter
        </a>
      </PopoverContent>
    </Popover>
  );
}
