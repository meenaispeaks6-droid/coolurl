import { createContext, useContext, type ReactNode } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-provider";
import { getPendingAnonymousClaim, clearPendingAnonymousClaim } from "@/lib/anonymous-claim";
import * as seed from "@/data/seed";
import type {
  Link,
  Click,
  Profile,
} from "@/data/seed";
import type { LinksFilters, TimeSeriesFilters } from "@/lib/filter-context";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
}

export interface LinkStats {
  totalClicks: number;
  last7Days: number;
  prevWeek: number;
  wowDelta: number | null;
}

export interface TimeSeriesPoint {
  date: string;
  clicks: number;
}

export interface ReferrerRow {
  referrer: string;
  count: number;
  pct: number;
}

export interface DeviceRow {
  device: string;
  count: number;
  pct: number;
}

export interface CreateLinkInput {
  title: string;
  slug: string;
  destination_url: string;
}

export interface UpdateLinkInput {
  title: string;
  slug: string;
  destination_url: string;
}

export interface UpdateProfileInput {
  full_name: string;
  avatar_url?: string | null;
  avatar_file?: File | null;
}

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------

export interface LinkShortenerDataProvider {
  useLinks(filters: LinksFilters): { data: Link[]; isLoading: boolean };
  useDashboardStats(): { data: DashboardStats; isLoading: boolean };
  useLinkById(id: string): { data: Link | null; isLoading: boolean };
  useLinkStats(id: string): { data: LinkStats; isLoading: boolean };
  useClicksTimeSeries(
    id: string,
    filters: TimeSeriesFilters
  ): { data: TimeSeriesPoint[]; isLoading: boolean };
  useReferrerBreakdown(id: string): { data: ReferrerRow[]; isLoading: boolean };
  useDeviceBreakdown(id: string): { data: DeviceRow[]; isLoading: boolean };
  useProfile(): { data: Profile | null; isLoading: boolean };
  useCreateLink(): {
    mutate: (
      input: CreateLinkInput,
      options?: { onSuccess?: (data: Link) => void; onError?: (error: Error) => void }
    ) => void;
    isPending: boolean;
  };
  useUpdateLink(): {
    mutate: (
      variables: { id: string; input: UpdateLinkInput },
      options?: { onSuccess?: () => void; onError?: (error: Error) => void }
    ) => void;
    isPending: boolean;
  };
  useDeleteLink(): {
    mutate: (
      id: string,
      options?: { onSuccess?: () => void; onError?: (error: Error) => void }
    ) => void;
    isPending: boolean;
  };
  useUpdateProfile(): {
    mutate: (
      input: UpdateProfileInput,
      options?: { onSuccess?: () => void; onError?: (error: Error) => void }
    ) => void;
    isPending: boolean;
  };
}

const DataProviderContext = createContext<LinkShortenerDataProvider | null>(
  null
);

export function useDataProvider(): LinkShortenerDataProvider {
  const ctx = useContext(DataProviderContext);
  if (!ctx) throw new Error("useDataProvider must be inside a DataProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function zeroFillDays(
  grouped: Record<string, number>,
  daysBack: number
): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  const now = new Date();
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, clicks: grouped[key] ?? 0 });
  }
  return result;
}

function groupByDate(clicks: Click[]): Record<string, number> {
  const acc: Record<string, number> = {};
  for (const c of clicks) {
    const key = c.clicked_at.slice(0, 10);
    acc[key] = (acc[key] ?? 0) + 1;
  }
  return acc;
}

function groupByField(
  clicks: Click[],
  field: "referrer" | "device"
): { name: string; count: number; pct: number }[] {
  const counts: Record<string, number> = {};
  for (const c of clicks) {
    const key = c[field] || "Direct";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const total = clicks.length || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
    }));
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Enter a valid URL (e.g. https://example.com)");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Enter a valid URL (e.g. https://example.com)");
  }

  const normalized = parsed.toString().replace(/\/$/, "");
  if (normalized.length > 2048) {
    throw new Error("URL must be 2,048 characters or less.");
  }

  return normalized;
}

function normalizeSlug(slug: string): string {
  const value = slug.trim();
  if (!value) return generateSlug();
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value)) {
    throw new Error("Slug must start with a letter or number and use only letters, numbers, dashes, or underscores.");
  }
  return value;
}

function normalizeTitle(title: string): string {
  const value = title.trim();
  if (value.length > 160) {
    throw new Error("Title must be 160 characters or less.");
  }
  return value;
}

function normalizeProfileName(name: string): string {
  const value = name.trim();
  if (value.length > 100) {
    throw new Error("Full name must be 100 characters or less.");
  }
  return value;
}

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";
  for (let i = 0; i < 6; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

// ---------------------------------------------------------------------------
// SeedDataProvider
// ---------------------------------------------------------------------------

export function SeedDataProvider({ children }: { children: ReactNode }) {
  const provider: LinkShortenerDataProvider = {
    useLinks: (filters) => {
      let result = [...seed.links];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.slug.toLowerCase().includes(q) ||
            l.destination_url.toLowerCase().includes(q)
        );
      }

      const col = filters.sortColumn ?? "created_at";
      const dir = filters.sortDirection === "asc" ? 1 : -1;
      result.sort((a, b) => {
        const av = a[col];
        const bv = b[col];
        if (typeof av === "number" && typeof bv === "number")
          return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });

      return { data: result, isLoading: false };
    },

    useDashboardStats: () => {
      const totalLinks = seed.links.length;
      const totalClicks = seed.links.reduce(
        (sum, l) => sum + l.clicks_count,
        0
      );
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayStr = todayStart.toISOString();
      const clicksToday = seed.clicks.filter(
        (c) => c.clicked_at >= todayStr
      ).length;
      return {
        data: { totalLinks, totalClicks, clicksToday },
        isLoading: false,
      };
    },

    useLinkById: (id) => {
      const link = seed.links.find((l) => l.id === id) ?? null;
      return { data: link, isLoading: false };
    },

    useLinkStats: (id) => {
      const linkClicks = seed.clicks.filter((c) => c.link_id === id);
      const now = Date.now();
      const sevenDaysAgo = new Date(now - 7 * 86_400_000).toISOString();
      const fourteenDaysAgo = new Date(now - 14 * 86_400_000).toISOString();

      const last7Days = linkClicks.filter(
        (c) => c.clicked_at >= sevenDaysAgo
      ).length;
      const prevWeek = linkClicks.filter(
        (c) => c.clicked_at >= fourteenDaysAgo && c.clicked_at < sevenDaysAgo
      ).length;

      const link = seed.links.find((l) => l.id === id);
      const totalClicks = link?.clicks_count ?? 0;
      const wowDelta =
        prevWeek > 0
          ? Math.round(((last7Days - prevWeek) / prevWeek) * 100)
          : null;

      return {
        data: { totalClicks, last7Days, prevWeek, wowDelta },
        isLoading: false,
      };
    },

    useClicksTimeSeries: (id, filters) => {
      const daysBack = filters.range === "30d" ? 30 : 7;
      const rangeStart = new Date(
        Date.now() - daysBack * 86_400_000
      ).toISOString();
      const filtered = seed.clicks.filter(
        (c) => c.link_id === id && c.clicked_at >= rangeStart
      );
      const grouped = groupByDate(filtered);
      return { data: zeroFillDays(grouped, daysBack), isLoading: false };
    },

    useReferrerBreakdown: (id) => {
      const linkClicks = seed.clicks.filter((c) => c.link_id === id);
      const rows = groupByField(linkClicks, "referrer");
      const top5 = rows.slice(0, 5);
      const otherCount = rows
        .slice(5)
        .reduce((sum, r) => sum + r.count, 0);
      const total = linkClicks.length || 1;
      const result: ReferrerRow[] = top5.map((r) => ({
        referrer: r.name,
        count: r.count,
        pct: r.pct,
      }));
      if (otherCount > 0) {
        result.push({
          referrer: "Other",
          count: otherCount,
          pct: Math.round((otherCount / total) * 100),
        });
      }
      return { data: result, isLoading: false };
    },

    useDeviceBreakdown: (id) => {
      const linkClicks = seed.clicks.filter((c) => c.link_id === id);
      const rows = groupByField(linkClicks, "device");
      return {
        data: rows.map((r) => ({ device: r.name, count: r.count, pct: r.pct })),
        isLoading: false,
      };
    },

    useProfile: () => {
      return { data: seed.profiles[0] ?? null, isLoading: false };
    },

    useCreateLink: () => ({
      mutate: () => toast("Sign in to save changes"),
      isPending: false,
    }),

    useUpdateLink: () => ({
      mutate: () => toast("Sign in to save changes"),
      isPending: false,
    }),

    useDeleteLink: () => ({
      mutate: () => toast("Sign in to save changes"),
      isPending: false,
    }),

    useUpdateProfile: () => ({
      mutate: () => toast("Sign in to save changes"),
      isPending: false,
    }),
  };

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// SupabaseDataProvider
// ---------------------------------------------------------------------------

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const provider: LinkShortenerDataProvider = {
    useLinks: (filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ["links", user?.id, filters],
        queryFn: async () => {
          const { data: rows } = await supabase
            .from("links")
            .select(
              "id, slug, title, destination_url, clicks_count, created_at, updated_at"
            )
            .eq("user_id", user!.id)
            .order(filters.sortColumn ?? "created_at", {
            ascending: filters.sortDirection === "asc",
          });

          let links = ((rows as Link[]) ?? []);
          const search = filters.search.trim().toLowerCase();
          if (search) {
            links = links.filter((link) =>
              [link.title, link.slug, link.destination_url]
                .some((value) => value.toLowerCase().includes(search))
            );
          }

          return links;
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    useDashboardStats: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["dashboard-stats", user?.id],
        queryFn: async () => {
          const { data: linksAgg } = await supabase
            .from("links")
            .select("id, clicks_count")
            .eq("user_id", user!.id);

          const totalLinks = linksAgg?.length ?? 0;
          const totalClicks =
            linksAgg?.reduce((sum, l) => sum + (l.clicks_count as number), 0) ??
            0;

          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const linkIds = linksAgg?.map((l) => l.id as string) ?? [];

          let clicksToday = 0;
          if (linkIds.length > 0) {
            const { count } = await supabase
              .from("clicks")
              .select("id", { count: "exact", head: true })
              .in("link_id", linkIds)
              .gte("clicked_at", todayStart.toISOString());
            clicksToday = count ?? 0;
          }

          return { totalLinks, totalClicks, clicksToday };
        },
        enabled: !!user,
      });
      return {
        data: data ?? { totalLinks: 0, totalClicks: 0, clicksToday: 0 },
        isLoading,
      };
    },

    useLinkById: (id) => {
      const { data, isLoading } = useQuery({
        queryKey: ["link", id],
        queryFn: async () => {
          const { data: row } = await supabase
            .from("links")
            .select(
              "id, slug, title, destination_url, clicks_count, created_at, updated_at"
            )
            .eq("id", id)
            .eq("user_id", user!.id)
            .single();
          return (row as Link) ?? null;
        },
        enabled: !!user && !!id,
      });
      return { data: data ?? null, isLoading };
    },

    useLinkStats: (id) => {
      const { data, isLoading } = useQuery({
        queryKey: ["link-stats", id],
        queryFn: async () => {
          const now = Date.now();
          const sevenDaysAgo = new Date(now - 7 * 86_400_000).toISOString();
          const fourteenDaysAgo = new Date(
            now - 14 * 86_400_000
          ).toISOString();

          const [{ count: last7Days }, { count: prevWeek }, { data: link }] =
            await Promise.all([
              supabase
                .from("clicks")
                .select("id", { count: "exact", head: true })
                .eq("link_id", id)
                .gte("clicked_at", sevenDaysAgo),
              supabase
                .from("clicks")
                .select("id", { count: "exact", head: true })
                .eq("link_id", id)
                .gte("clicked_at", fourteenDaysAgo)
                .lt("clicked_at", sevenDaysAgo),
              supabase
                .from("links")
                .select("clicks_count")
                .eq("id", id)
                .single(),
            ]);

          const totalClicks = (link?.clicks_count as number) ?? 0;
          const l7 = last7Days ?? 0;
          const pw = prevWeek ?? 0;
          const wowDelta =
            pw > 0 ? Math.round(((l7 - pw) / pw) * 100) : null;

          return { totalClicks, last7Days: l7, prevWeek: pw, wowDelta };
        },
        enabled: !!user && !!id,
      });
      return {
        data: data ?? {
          totalClicks: 0,
          last7Days: 0,
          prevWeek: 0,
          wowDelta: null,
        },
        isLoading,
      };
    },

    useClicksTimeSeries: (id, filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ["clicks-time-series", id, filters.range],
        queryFn: async () => {
          const daysBack = filters.range === "30d" ? 30 : 7;
          const rangeStart = new Date(
            Date.now() - daysBack * 86_400_000
          ).toISOString();

          const { data: rows } = await supabase
            .from("clicks")
            .select("clicked_at")
            .eq("link_id", id)
            .gte("clicked_at", rangeStart)
            .order("clicked_at", { ascending: true });

          const grouped: Record<string, number> = {};
          for (const row of rows ?? []) {
            const key = (row.clicked_at as string).slice(0, 10);
            grouped[key] = (grouped[key] ?? 0) + 1;
          }

          return zeroFillDays(grouped, daysBack);
        },
        enabled: !!user && !!id,
      });
      return { data: data ?? [], isLoading };
    },

    useReferrerBreakdown: (id) => {
      const { data, isLoading } = useQuery({
        queryKey: ["referrer-breakdown", id],
        queryFn: async () => {
          const { data: rows } = await supabase
            .from("clicks")
            .select("referrer")
            .eq("link_id", id);

          const counts: Record<string, number> = {};
          for (const row of rows ?? []) {
            const key = (row.referrer as string) || "Direct";
            counts[key] = (counts[key] ?? 0) + 1;
          }

          const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
          const top5 = sorted.slice(0, 5);
          const otherCount = sorted
            .slice(5)
            .reduce((sum, [, n]) => sum + n, 0);
          const total = (rows?.length ?? 1) || 1;

          const result: ReferrerRow[] = top5.map(([referrer, count]) => ({
            referrer,
            count,
            pct: Math.round((count / total) * 100),
          }));
          if (otherCount > 0) {
            result.push({
              referrer: "Other",
              count: otherCount,
              pct: Math.round((otherCount / total) * 100),
            });
          }
          return result;
        },
        enabled: !!user && !!id,
      });
      return { data: data ?? [], isLoading };
    },

    useDeviceBreakdown: (id) => {
      const { data, isLoading } = useQuery({
        queryKey: ["device-breakdown", id],
        queryFn: async () => {
          const { data: rows } = await supabase
            .from("clicks")
            .select("device")
            .eq("link_id", id);

          const counts: Record<string, number> = {};
          for (const row of rows ?? []) {
            counts[row.device as string] =
              (counts[row.device as string] ?? 0) + 1;
          }

          const total = (rows?.length ?? 1) || 1;
          return Object.entries(counts).map(([device, count]) => ({
            device,
            count,
            pct: Math.round((count / total) * 100),
          }));
        },
        enabled: !!user && !!id,
      });
      return { data: data ?? [], isLoading };
    },

    useProfile: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["profile", user?.id],
        queryFn: async () => {
          const { data: row } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, created_at")
            .eq("id", user!.id)
            .single();
          return (row as Profile) ?? null;
        },
        enabled: !!user,
      });
      return { data: data ?? null, isLoading };
    },

    useCreateLink: () => {
      const mutation = useMutation({
        mutationFn: async (input: CreateLinkInput) => {
          const code = normalizeSlug(input.slug);
          const normalizedUrl = normalizeUrl(input.destination_url);
          const normalizedTitle = normalizeTitle(input.title);
          const { data: row, error } = await supabase
            .from("links")
            .insert({
              user_id: user!.id,
              slug: code,
              short_code: code,
              title: normalizedTitle,
              destination_url: normalizedUrl,
              original_url: normalizedUrl,
            })
            .select()
            .single();
          if (error) {
            if (error.message.includes("unique") || error.code === "23505") {
              throw new Error(
                "This slug is already in use — try another."
              );
            }
            throw error;
          }
          return row;
        },
        onMutate: async (input) => {
          await queryClient.cancelQueries({
            queryKey: ["links", user?.id],
          });
          const previous = queryClient.getQueryData<Link[]>([
            "links",
            user?.id,
          ]);
          const optimistic: Link = {
            id: `temp_${Date.now()}`,
            user_id: user!.id,
            slug: input.slug || "...",
            title: input.title,
            destination_url: input.destination_url,
            clicks_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          queryClient.setQueryData<Link[]>(
            ["links", user?.id],
            (old) => [optimistic, ...(old ?? [])]
          );
          return { previous };
        },
        onError: (_err, _input, context) => {
          if (context?.previous) {
            queryClient.setQueryData(
              ["links", user?.id],
              context.previous
            );
          }
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: ["links", user?.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["dashboard-stats", user?.id],
          });
        },
        onSuccess: () => {
          toast.success("Link created");
        },
      });
      return {
        mutate: mutation.mutate,
        isPending: mutation.isPending,
      };
    },

    useUpdateLink: () => {
      const mutation = useMutation({
        mutationFn: async ({
          id,
          input,
        }: {
          id: string;
          input: UpdateLinkInput;
        }) => {
          const normalizedUrl = normalizeUrl(input.destination_url);
          const normalizedSlug = normalizeSlug(input.slug);
          const normalizedTitle = normalizeTitle(input.title);
          const { data: row, error } = await supabase
            .from("links")
            .update({
              title: normalizedTitle,
              slug: normalizedSlug,
              short_code: normalizedSlug,
              destination_url: normalizedUrl,
              original_url: normalizedUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", user!.id)
            .select()
            .single();
          if (error) throw error;
          return row;
        },
        onMutate: async ({ id, input }) => {
          await queryClient.cancelQueries({ queryKey: ["link", id] });
          const previousLink = queryClient.getQueryData<Link>(["link", id]);
          if (previousLink) {
            queryClient.setQueryData<Link>(["link", id], {
              ...previousLink,
              ...input,
              updated_at: new Date().toISOString(),
            });
          }
          return { previousLink };
        },
        onError: (_err, { id }, context) => {
          if (context?.previousLink) {
            queryClient.setQueryData(["link", id], context.previousLink);
          }
        },
        onSettled: (_data, _error, { id }) => {
          queryClient.invalidateQueries({ queryKey: ["link", id] });
          queryClient.invalidateQueries({
            queryKey: ["links", user?.id],
          });
        },
        onSuccess: () => {
          toast.success("Changes saved");
        },
      });
      return {
        mutate: mutation.mutate,
        isPending: mutation.isPending,
      };
    },

    useDeleteLink: () => {
      const mutation = useMutation({
        mutationFn: async (id: string) => {
          const { error } = await supabase
            .from("links")
            .delete()
            .eq("id", id)
            .eq("user_id", user!.id);
          if (error) throw error;
        },
        onMutate: async (id) => {
          await queryClient.cancelQueries({
            queryKey: ["links", user?.id],
          });
          const previous = queryClient.getQueryData<Link[]>([
            "links",
            user?.id,
          ]);
          queryClient.setQueryData<Link[]>(
            ["links", user?.id],
            (old) => (old ?? []).filter((l) => l.id !== id)
          );
          return { previous };
        },
        onError: (_err, _id, context) => {
          if (context?.previous) {
            queryClient.setQueryData(
              ["links", user?.id],
              context.previous
            );
          }
        },
        onSettled: (_data, _error, id) => {
          queryClient.invalidateQueries({
            queryKey: ["links", user?.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["dashboard-stats", user?.id],
          });
          queryClient.invalidateQueries({ queryKey: ["link", id] });
        },
        onSuccess: () => {
          toast.success("Link deleted");
        },
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useUpdateProfile: () => {
      const mutation = useMutation({
        mutationFn: async (input: UpdateProfileInput) => {
          let avatarUrl = input.avatar_url;

          if (input.avatar_file) {
            const { data: uploadData, error: uploadError } =
              await supabase.storage
                .from("avatars")
                .upload(`${user!.id}/avatar`, input.avatar_file, {
                  upsert: true,
                });
            if (uploadError) throw uploadError;
            avatarUrl = supabase.storage
              .from("avatars")
              .getPublicUrl(uploadData.path).data.publicUrl;
          }

          const { data: row, error } = await supabase
            .from("profiles")
            .update({
              full_name: normalizeProfileName(input.full_name),
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user!.id)
            .select()
            .single();
          if (error) throw error;
          return row;
        },
        onMutate: async (input) => {
          await queryClient.cancelQueries({
            queryKey: ["profile", user?.id],
          });
          const previous = queryClient.getQueryData<Profile>([
            "profile",
            user?.id,
          ]);
          if (previous) {
            queryClient.setQueryData<Profile>(["profile", user?.id], {
              ...previous,
              full_name: input.full_name,
            });
          }
          return { previous };
        },
        onError: (_err, _input, context) => {
          if (context?.previous) {
            queryClient.setQueryData(
              ["profile", user?.id],
              context.previous
            );
          }
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: ["profile", user?.id],
          });
        },
        onSuccess: () => {
          toast.success("Profile updated");
        },
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },
  };

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Standalone hooks — used outside the DataProvider (redirect, landing, auth)
// ---------------------------------------------------------------------------

export function useCreateAnonymousLink() {
  const mutation = useMutation({
    mutationFn: async (destinationUrl: string) => {
      const normalizedUrl = normalizeUrl(destinationUrl);

      const { data, error } = await supabase.functions.invoke("create-anonymous-link", {
        body: { destination_url: normalizedUrl },
      });

      if (error) throw error;
      if (!data?.id || !data?.slug || !data?.claim_token) {
        throw new Error("Could not create link");
      }

      return data as { id: string; slug: string; claim_token: string };
    },
  });
  return { mutate: mutation.mutate, isPending: mutation.isPending, data: mutation.data };
}

export function useClaimAnonymousLink() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (claimId: string) => {
      const pendingClaim = getPendingAnonymousClaim();
      if (!pendingClaim || pendingClaim.linkId !== claimId) {
        throw new Error("This anonymous link cannot be claimed from this browser.");
      }

      const { data, error } = await supabase.functions.invoke("claim-anonymous-link", {
        body: {
          link_id: pendingClaim.linkId,
          claim_token: pendingClaim.claimToken,
        },
      });
      if (error) throw error;
      clearPendingAnonymousClaim();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats", user?.id],
      });
    },
  });
  return { mutate: mutation.mutate, isPending: mutation.isPending };
}

export function useLinkBySlug(slug: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["link-by-slug", slug],
    queryFn: async () => {
      const { data: row } = await supabase
        .from("links")
        .select("id, destination_url")
        .eq("slug", slug)
        .maybeSingle();
      return row as { id: string; destination_url: string } | null;
    },
    enabled: !!slug,
  });
  return { data: data ?? null, isLoading };
}

export function useFeatureTabs() {
  return seed.featureTabs;
}

export function useBentoFeatures() {
  return seed.bentoFeatures;
}

export function useTestimonials() {
  return seed.testimonials;
}

export function useFooterLinks() {
  return seed.footerLinks;
}

export function useRecordClick() {
  const mutation = useMutation({
    mutationFn: async () => undefined,
  });
  return { mutate: mutation.mutate };
}
