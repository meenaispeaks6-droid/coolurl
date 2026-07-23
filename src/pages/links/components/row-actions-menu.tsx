import { shortLinkUrl } from "@/lib/utils";
import {
  IconDots,
  IconEdit,
  IconExternalLink,
  IconCopy,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Link } from "@/data/seed";

interface RowActionsMenuProps {
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
}

export function RowActionsMenu({ link, onEdit, onDelete }: RowActionsMenuProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(shortLinkUrl(link.slug));
    toast.success("Copied to clipboard");
  };

  const handleOpen = () => {
    window.open(link.destination_url, "_blank", "noopener,noreferrer");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <IconDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={onEdit}>
          <IconEdit className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpen}>
          <IconExternalLink className="size-4" />
          Open
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <IconCopy className="size-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <IconTrash className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
