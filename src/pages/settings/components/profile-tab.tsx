import { useRef, useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/base/button";
import { useDataProvider } from "@/lib/data-provider";
import { useAuth } from "@/lib/auth/auth-provider";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ProfileTabProps {
  isDemo?: boolean;
}

export function ProfileTab({ isDemo }: ProfileTabProps) {
  const { useProfile, useUpdateProfile } = useDataProvider();
  const { data: profile } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const displayName = fullName ?? profile?.full_name ?? "";
  const displayAvatarUrl = avatarPreview ?? profile?.avatar_url ?? null;
  const initials = displayName ? getInitials(displayName) : "?";
  const email = isDemo ? "alex@example.com" : (user?.email ?? "");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: displayName,
      avatar_url: profile?.avatar_url,
      avatar_file: avatarFile,
    });
    setAvatarFile(null);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {displayAvatarUrl && (
                  <AvatarImage src={displayAvatarUrl} alt={displayName} />
                )}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                Change avatar
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={displayName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              disabled
            />
            <p className="text-sm text-muted-foreground">
              Email is managed by your auth provider and cannot be changed.
            </p>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending && <IconLoader2 className="size-4 animate-spin" />}
            Save profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
