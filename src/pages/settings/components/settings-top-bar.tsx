import { Link, useLocation, useNavigate } from "react-router-dom";
import { IconPlus, IconLogout } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/base/button";
import { useDataProvider } from "@/lib/data-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/auth-provider";
import { useQueryClient } from "@tanstack/react-query";

interface SettingsTopBarProps {
  isDemo?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const NAV_LINKS = [
  { label: "Links", href: "/links", demoHref: "/demo/links" },
  { label: "Settings", href: "/settings", demoHref: "/demo/settings" },
];

export function SettingsTopBar({ isDemo }: SettingsTopBarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { useProfile } = useDataProvider();
  const { data: profile } = useProfile();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const initials = profile?.full_name ? getInitials(profile.full_name) : "?";

  const handleLogout = async () => {
    await signOut();
    queryClient.clear();
    navigate("/");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-6">
        <Link
          to={isDemo ? "/demo/links" : "/links"}
          className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
        >
          LinkShort
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const href = isDemo ? link.demoHref : link.href;
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={link.label}
                to={href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Avatar className="h-8 w-8">
                {profile?.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                )}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild>
          <Link to={isDemo ? "/demo/links" : "/links"}>
            <IconPlus className="size-4" />
            New link
          </Link>
        </Button>
      </div>
    </header>
  );
}
