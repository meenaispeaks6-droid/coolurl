import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { useFilters } from "@/lib/filter-context";

export function SearchBar() {
  const { filters, setLinksFilters } = useFilters();

  return (
    <div className="relative">
      <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search links…"
        value={filters.links.search}
        onChange={(e) => setLinksFilters({ search: e.target.value })}
        className="pl-9"
      />
    </div>
  );
}
