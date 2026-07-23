import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { GoogleOAuthButton } from "./google-oauth-button";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import { AuthErrorAlert } from "./auth-error-alert";
import { clearPendingAnonymousClaim, getPendingAnonymousClaim } from "@/lib/anonymous-claim";

export function AuthCard() {
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent");
  const claim = searchParams.get("claim");

  const defaultTab = intent === "signup" ? "signup" : "signin";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [error, setError] = useState<string | null>(null);
  const [prefillEmail, setPrefillEmail] = useState<string | undefined>();

  useEffect(() => {
    if (claim) {
      const pending = getPendingAnonymousClaim();
      if (!pending || pending.linkId !== claim) {
        clearPendingAnonymousClaim();
      }
    }
  }, [claim]);

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSwitchToSignIn = useCallback((email: string) => {
    setPrefillEmail(email);
    setActiveTab("signin");
    setError(null);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {activeTab === "signin" ? "Welcome back" : "Create your account"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <GoogleOAuthButton onError={handleError} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); clearError(); }}>
          <TabsList className="w-full">
            <TabsTrigger value="signin" className="flex-1">Sign in</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Sign up</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <AuthErrorAlert
              message={error}
              onSwitchToSignIn={handleSwitchToSignIn}
              existingEmail={prefillEmail}
            />
          </div>

          <TabsContent value="signin">
            <SignInForm
              onError={handleError}
              onClearError={clearError}
              defaultEmail={prefillEmail}
            />
          </TabsContent>

          <TabsContent value="signup">
            <SignUpForm
              onError={handleError}
              onClearError={clearError}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
