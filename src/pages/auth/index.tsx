import { Navigate, Link } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { AuthCard } from "./components/auth-card";

export default function AuthPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/links" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link
        to="/"
        className="mb-8 text-xl font-semibold font-heading tracking-tight"
      >
        LinkShort
      </Link>

      <AuthCard />

      <Link
        to="/"
        className="mt-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <IconArrowLeft className="size-4" />
        Back to home
      </Link>
    </div>
  );
}
