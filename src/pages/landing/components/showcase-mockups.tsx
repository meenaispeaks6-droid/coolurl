/**
 * Pixel-faithful mockups of the real app screens, rendered inside the
 * feature-showcase browser chrome. Static markup only — no hooks, no data
 * providers — but every class matches the live components (top bar,
 * StatRow, LinksTable, NewLinkModal, StatCards, ClicksChart).
 */

import {
  IconCopy,
  IconPlus,
  IconSearch,
  IconDotsVertical,
  IconArrowLeft,
  IconArrowUp,
  IconChevronDown,
  IconExternalLink,
  IconShare,
} from "@tabler/icons-react";

const DEMO_DOMAIN = "link-shortner-template.lovable.app";

/* ── Shared top bar (mirrors LinksTopBar) ─────────────────────── */

function TopBar({ activeTab = "Links" }: { activeTab?: "Links" | "Settings" }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
      <div className="flex items-center gap-6">
        <span className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground">
          LinkShort
        </span>
        <nav className="flex items-center gap-1">
          {(["Links", "Settings"] as const).map((label) => (
            <span
              key={label}
              className={
                label === activeTab
                  ? "rounded-md px-3 py-1.5 text-sm font-medium text-foreground"
                  : "rounded-md px-3 py-1.5 text-sm text-muted-foreground"
              }
            >
              {label}
            </span>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          AJ
        </div>
        <div className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
          <IconPlus className="size-4" />
          New link
        </div>
      </div>
    </header>
  );
}

/* ── Shared StatRow (mirrors links/StatRow) ───────────────────── */

function StatRow({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Tab 1: Shorten — full /links page ────────────────────────── */

const SEED_ROWS = [
  { title: "Q1 Planning Doc",  slug: "q1plan", dest: "notion.so/my-team/q1-planning", clicks: "4,821", date: "Mar 15" },
  { title: "Launch Checklist", slug: "launch", dest: "docs.google.com/document/d/…",  clicks: "3,204", date: "Mar 12" },
  { title: "Signup Page",      slug: "signup", dest: "acme.com/signup",                clicks: "2,917", date: "Mar 10" },
  { title: "Hiring Deck",      slug: "hiring", dest: "figma.com/file/hiring-deck",     clicks: "2,441", date: "Mar 8"  },
  { title: "Product Roadmap",  slug: "roadmp", dest: "notion.so/my-team/roadmap",      clicks: "1,876", date: "Mar 5"  },
];

export function ShortenMockup() {
  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <TopBar activeTab="Links" />
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-6">
        <StatRow
          items={[
            { label: "Total links",  value: "12" },
            { label: "Total clicks", value: "18,432" },
            { label: "Clicks today", value: "247" },
          ]}
        />
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <div className="h-10 rounded-md border bg-background pl-9 pr-3 text-sm leading-10 text-muted-foreground">
            Search links…
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium">Title</th>
                <th className="px-4 py-2.5 text-left font-medium">Short URL</th>
                <th className="px-4 py-2.5 text-left font-medium">Destination</th>
                <th className="px-4 py-2.5 text-right font-medium">
                  <span className="inline-flex items-center gap-1">
                    Clicks <IconChevronDown className="size-3.5" />
                  </span>
                </th>
                <th className="px-4 py-2.5 text-left font-medium">Created</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {SEED_ROWS.map((row) => (
                <tr key={row.slug} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-mono text-primary">
                        {DEMO_DOMAIN}/s/{row.slug}
                      </span>
                      <IconCopy className="size-3.5 text-muted-foreground" />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.dest}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {row.clicks}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.date}
                  </td>
                  <td className="px-2 py-3">
                    <IconDotsVertical className="size-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Tab 2: Customize — /links with New link dialog open ──────── */

export function CustomizeMockup() {
  return (
    <div className="relative flex h-full flex-col bg-background text-foreground">
      {/* Backdrop page (dimmed like a real dialog overlay) */}
      <div className="pointer-events-none opacity-40">
        <TopBar activeTab="Links" />
        <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
          <StatRow
            items={[
              { label: "Total links",  value: "12" },
              { label: "Total clicks", value: "18,432" },
              { label: "Clicks today", value: "247" },
            ]}
          />
          <div className="h-10 rounded-md border" />
          <div className="h-40 rounded-lg border" />
        </div>
      </div>

      {/* Radix-style overlay + dialog */}
      <div className="absolute inset-0 bg-foreground/40" />
      <div className="absolute left-1/2 top-1/2 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            New short link
          </h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Destination URL *
            </label>
            <div className="flex h-10 items-center rounded-md border bg-background px-3 text-sm text-foreground">
              https://www.notion.so/my-team/q1-planning
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Custom slug (optional)
            </label>
            <div className="flex">
              <span className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                {DEMO_DOMAIN}/s/
              </span>
              <div className="flex h-10 flex-1 items-center rounded-r-md border bg-background px-3 text-sm font-medium text-foreground">
                q1plan
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Case-sensitive. Leave blank to auto-generate.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Title (optional)
            </label>
            <div className="flex h-10 items-center rounded-md border bg-background px-3 text-sm text-foreground">
              Q1 Planning Doc
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <div className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-muted-foreground">
              Cancel
            </div>
            <div className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
              Create link
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tab 3: Analyze — /links/:id detail page ─────────────────── */

const CHART_POINTS = [22, 34, 28, 41, 52, 38, 47, 63, 55, 71, 66, 82, 74, 88];

export function AnalyzeMockup() {
  const max = Math.max(...CHART_POINTS);
  const points = CHART_POINTS.map((v, i) => {
    const x = (i / (CHART_POINTS.length - 1)) * 100;
    const y = 100 - (v / max) * 90;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,100 ${points} 100,100`;

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <TopBar activeTab="Links" />
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-6">
        {/* Detail heading (mirrors detail-top-bar / link-info-card) */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconArrowLeft className="size-4" />
          All links
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Q1 Planning Doc
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-primary">{DEMO_DOMAIN}/s/q1plan</span>
              <IconCopy className="size-3.5 text-muted-foreground" />
              <IconExternalLink className="size-3.5 text-muted-foreground" />
            </div>
          </div>
          <div className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-4 text-sm font-medium text-foreground">
            <IconShare className="size-4" />
            Share
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total clicks</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              4,821
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Last 7 days</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              612
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">vs. prev week</p>
            <p className="mt-1 flex items-center gap-0.5 text-2xl font-semibold tabular-nums text-primary">
              <IconArrowUp className="size-5" />
              +18%
            </p>
          </div>
        </div>

        {/* Clicks-over-time chart */}
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Clicks over time
            </h3>
            <div className="inline-flex overflow-hidden rounded-md border text-sm">
              <span className="bg-muted px-3 py-1 font-medium text-foreground">
                Last 7 days
              </span>
              <span className="px-3 py-1 text-muted-foreground">
                Last 30 days
              </span>
            </div>
          </div>
          <div className="h-32 w-full text-primary">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <polygon
                points={area}
                fill="currentColor"
                fillOpacity="0.15"
              />
              <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
}
