import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconSun, IconDeviceDesktop, IconMoon, IconCheck } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/base/button";
import { useAuth } from "@/lib/auth/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type Theme = "light" | "system" | "dark";

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof IconSun }[] = [
  { value: "light", label: "Light", icon: IconSun },
  { value: "system", label: "System", icon: IconDeviceDesktop },
  { value: "dark", label: "Dark", icon: IconMoon },
];

function getStoredTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
}

export function GeneralTab() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  const handleLogout = async () => {
    await signOut();
    queryClient.clear();
    navigate("/");
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-base font-semibold">Theme</Label>
            <p className="text-sm text-muted-foreground">
              Choose how LinkShort looks on this device.
            </p>
          </div>
          <div className="flex gap-4">
            {THEME_OPTIONS.map((option) => {
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "relative flex w-32 flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                    isActive
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  )}
                >
                  <option.icon className="size-5" />
                  <span className="font-medium">{option.label}</span>
                  {isActive && (
                    <IconCheck className="absolute right-2 top-2 size-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-base font-semibold">Account</Label>
          <div>
            <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:text-destructive">
              Log out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
