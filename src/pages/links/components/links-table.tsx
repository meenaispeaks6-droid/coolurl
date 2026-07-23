import { shortLinkUrl, shortLinkDisplay } from "@/lib/utils";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconChevronUp, IconChevronDown, IconCopy, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataProvider } from "@/lib/data-provider";
import { useFilters, type LinksFilters } from "@/lib/filter-context";
import { RowActionsMenu } from "./row-actions-menu";
import { DeleteLinkDialog } from "./delete-link-dialog";

interface LinksTableProps {
  onNewLink: () => void;
}

type SortColumn = LinksFilters["sortColumn"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function truncateUrl(url: string, max = 30): string {
  try {
    const parsed = new URL(url);
    const display = parsed.hostname + parsed.pathname;
    return display.length > max ? display.slice(0, max) + "…" : display;
  } catch {
    return url.length > max ? url.slice(0, max) + "…" : url;
  }
}

export function LinksTable({ onNewLink }: LinksTableProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDemo = pathname.startsWith("/demo");

  const { filters, setLinksFilters } = useFilters();
  const { useLinks, useDeleteLink } = useDataProvider();
  const { data: links, isLoading } = useLinks(filters.links);
  const { mutate: deleteLink } = useDeleteLink();

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    slug: string;
  } | null>(null);

  const handleSort = (col: SortColumn) => {
    if (filters.links.sortColumn === col) {
      setLinksFilters({
        sortDirection: filters.links.sortDirection === "asc" ? "desc" : "asc",
      });
    } else {
      setLinksFilters({ sortColumn: col, sortDirection: "desc" });
    }
  };

  const handleCopy = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shortLinkUrl(slug));
    toast.success("Copied to clipboard");
  };

  const handleRowClick = (id: string) => {
    const base = isDemo ? "/demo/links" : "/links";
    navigate(`${base}/${id}`);
  };

  const handleEdit = (id: string) => {
    const base = isDemo ? "/demo/links" : "/links";
    navigate(`${base}/${id}?mode=edit`);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteLink(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const SortIcon = ({ col }: { col: SortColumn }) => {
    if (filters.links.sortColumn !== col) return null;
    return filters.links.sortDirection === "asc" ? (
      <IconChevronUp className="inline size-4" />
    ) : (
      <IconChevronDown className="inline size-4" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (links.length === 0 && !filters.links.search) {
    return (
      <>
        <div className="relative overflow-hidden rounded-lg border">
          <div className="space-y-2 p-6 opacity-20">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent">
            <Card className="shadow-lg">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <h3 className="text-lg font-semibold">
                  Create your first short link
                </h3>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Paste a destination URL, set a slug, and share a link that
                  tracks every click.
                </p>
                <Button variant="default" onClick={onNewLink}>
                  <IconPlus className="size-4" />
                  New link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort("title")}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Title <SortIcon col="title" />
                </button>
              </TableHead>
              <TableHead>Short URL</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort("clicks_count")}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Clicks <SortIcon col="clicks_count" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("created_at")}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Created <SortIcon col="created_at" />
                </button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow
                key={link.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(link.id)}
              >
                <TableCell className="font-medium">{link.title}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-mono text-primary">
                      {shortLinkDisplay(link.slug)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => handleCopy(link.slug, e)}
                    >
                      <IconCopy className="size-3.5" />
                    </Button>
                  </span>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground">
                        {truncateUrl(link.destination_url)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{link.destination_url}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {link.clicks_count.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(link.created_at)}
                </TableCell>
                <TableCell>
                  <RowActionsMenu
                    link={link}
                    onEdit={() => handleEdit(link.id)}
                    onDelete={() =>
                      setDeleteTarget({ id: link.id, slug: link.slug })
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {deleteTarget && (
        <DeleteLinkDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          slug={deleteTarget.slug}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </TooltipProvider>
  );
}
