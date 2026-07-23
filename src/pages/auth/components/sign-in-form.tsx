import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconLoader2, IconCircleCheck } from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";
import { clearPendingAnonymousClaim, getPendingAnonymousClaim } from "@/lib/anonymous-claim";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/base/button";

interface SignInFormProps {
  onError: (message: string) => void;
  onClearError: () => void;
  defaultEmail?: string;
}

export function SignInForm({ onError, onClearError, defaultEmail }: SignInFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetSentTo, setResetSentTo] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (!validateEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    onClearError();

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          onError("Please confirm your email before signing in. Check your inbox.");
        } else if (error.status === 429) {
          onError("Too many attempts. Try again in a few minutes.");
        } else {
          onError("Incorrect email or password. Try again or reset it.");
        }
        setLoading(false);
        return;
      }

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

      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(from ?? "/links", { replace: true });
    } catch {
      onError("Something went wrong. Check your connection and try again.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(resetEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setEmailError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + "/auth",
      });

      if (error) {
        if (error.status === 429) {
          onError("Too many attempts. Try again in a few minutes.");
        } else {
          onError("Something went wrong. Check your connection and try again.");
        }
        setLoading(false);
        return;
      }

      setResetSent(true);
      setResetSentTo(resetEmail);
    } catch {
      onError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <IconCircleCheck className="size-8 text-primary" />
        <p className="font-medium">Reset link sent to {resetSentTo}.</p>
        <p className="text-sm text-muted-foreground">Check your inbox.</p>
      </div>
    );
  }

  if (forgotMode) {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We'll send you a reset link.
        </p>
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="alex@example.com"
            value={resetEmail}
            onChange={(e) => {
              setResetEmail(e.target.value);
              setEmailError(null);
              onClearError();
            }}
            required
          />
          {emailError && (
            <p className="text-sm text-destructive">{emailError}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <IconLoader2 className="size-4 animate-spin" />}
          Send reset link
        </Button>
        <button
          type="button"
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            setForgotMode(false);
            setEmailError(null);
            onClearError();
          }}
        >
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
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
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            onClearError();
          }}
          required
        />
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            setForgotMode(true);
            setResetEmail(email);
            setEmailError(null);
            onClearError();
          }}
        >
          Forgot password?
        </button>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <IconLoader2 className="size-4 animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}
