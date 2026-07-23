import { useState } from "react";
import { IconLoader2, IconCircleCheck } from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";
import { clearPendingAnonymousClaim, getPendingAnonymousClaim } from "@/lib/anonymous-claim";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/base/button";

interface SignUpFormProps {
  onError: (message: string) => void;
  onClearError: () => void;
}

export function SignUpForm({ onError, onClearError }: SignUpFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);

    if (!validateEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    onClearError();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already been registered")) {
          onError("An account with this email already exists. Sign in instead →");
        } else if (error.status === 429) {
          onError("Too many attempts. Try again in a few minutes.");
        } else if (error.message.includes("password")) {
          setPasswordError("Password must be at least 8 characters.");
        } else {
          onError("Something went wrong. Check your connection and try again.");
        }
        setLoading(false);
        return;
      }

      // If email confirmations are disabled, a session is returned — the
      // AuthProvider listener will pick it up and ProtectedRoute will let /links load.
      if (data.session) {
        const pendingClaim = getPendingAnonymousClaim();
        if (pendingClaim) {
          await supabase.functions.invoke("claim-anonymous-link", {
            body: {
              link_id: pendingClaim.linkId,
              claim_token: pendingClaim.claimToken,
            },
          });
          clearPendingAnonymousClaim();
        }
        return;
      }

      setSubmittedEmail(email);
      setCheckEmail(true);
    } catch {
      onError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <IconCircleCheck className="size-8 text-primary" />
        <p className="font-medium">Check your email</p>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to
        </p>
        <p className="text-sm font-medium">{submittedEmail}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Alex Johnson"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            onClearError();
          }}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="alex@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(null);
            onClearError();
          }}
          required
        />
        {emailError && (
          <p className="text-sm text-destructive">{emailError}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(null);
            onClearError();
          }}
          required
        />
        {passwordError && (
          <p className="text-sm text-destructive">{passwordError}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <IconLoader2 className="size-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
