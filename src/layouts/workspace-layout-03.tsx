import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconFolder,
  IconSettings,
  IconChartBar,
  IconLayoutSidebar,
  IconChevronRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", href: "/workspace-03", icon: IconHome },
  { label: "Projects", href: "/workspace-03/projects", icon: IconFolder },
  { label: "Analytics", href: "/workspace-03/analytics", icon: IconChartBar },
  { label: "Settings", href: "/workspace-03/settings", icon: IconSettings },
];

export default function WorkspaceLayout03() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeItem = navItems.find((item) => pathname === item.href) ?? navItems[0];

  return (
    <div className="flex h-screen bg-muted">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col p-4 transition-[width] duration-300 lg:flex",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden p-0",
        )}
      >
        <Link
          to="/workspace-03"
          className="mb-8 px-2 font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
        >
          Acme
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content — inset card */}
      <div className="flex flex-1 flex-col overflow-hidden p-0 lg:py-2 lg:pr-2">
        <div className="flex flex-1 flex-col overflow-hidden border border-border bg-background shadow-sm lg:rounded-xl">
          {/* Header with toggle + breadcrumbs */}
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <IconLayoutSidebar className="size-4" />
            </Button>
            <nav className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Workspace</span>
              <IconChevronRight className="size-3 text-muted-foreground" />
              <span className="font-medium text-foreground">{activeItem.label}</span>
            </nav>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
