import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export interface LinksFilters {
  search: string;
  sortColumn: "title" | "clicks_count" | "created_at";
  sortDirection: "asc" | "desc";
}

export interface TimeSeriesFilters {
  range: "7d" | "30d";
}

interface FilterState {
  links: LinksFilters;
  timeSeries: TimeSeriesFilters;
}

interface FilterContextValue {
  filters: FilterState;
  setLinksFilters: (updates: Partial<LinksFilters>) => void;
  setTimeSeriesFilters: (updates: Partial<TimeSeriesFilters>) => void;
}

const defaultState: FilterState = {
  links: {
    search: "",
    sortColumn: "created_at",
    sortDirection: "desc",
  },
  timeSeries: {
    range: "7d",
  },
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultState);

  const setLinksFilters = useCallback((updates: Partial<LinksFilters>) => {
    setFilters((prev) => ({
      ...prev,
      links: { ...prev.links, ...updates },
    }));
  }, []);

  const setTimeSeriesFilters = useCallback(
    (updates: Partial<TimeSeriesFilters>) => {
      setFilters((prev) => ({
        ...prev,
        timeSeries: { ...prev.timeSeries, ...updates },
      }));
    },
    []
  );

  return (
    <FilterContext.Provider
      value={{ filters, setLinksFilters, setTimeSeriesFilters }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be inside FilterProvider");
  return ctx;
}
