import { useState } from "react";
import { IconBrandGoogle, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/base/button";

interface GoogleOAuthButtonProps {
  onError: (message: string) => void;
}

export function GoogleOAuthButton({ onError }: GoogleOAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        onError("Google sign-in was cancelled or failed. Try again or use email.");
        setLoading(false);
      }
    } catch {
      onError("Google sign-in was cancelled or failed. Try again or use email.");
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <IconLoader2 className="size-4 animate-spin" />
      ) : (
        <IconBrandGoogle className="size-4" />
      )}
      Continue with Google
    </Button>
  );
}
