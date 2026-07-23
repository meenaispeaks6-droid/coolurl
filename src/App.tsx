import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { FilterProvider } from "@/lib/filter-context";
import { ProtectedRoute } from "@/components/protected-route";
import { SeedDataProvider, SupabaseDataProvider } from "@/lib/data-provider";
import ApplicationLayout from "./layouts/application-layout";
import Landing from "./pages/landing";
import AuthPage from "./pages/auth";
import LinksPage from "./pages/links";
import LinkDetailPage from "./pages/links-detail";
import SettingsPage from "./pages/settings";
import NotFound from "./pages/not-found";
import RedirectPage from "./pages/redirect";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FilterProvider>
        <BrowserRouter>
          <Toaster />
          <Routes>
            {/* Public routes */}
            <Route element={<ApplicationLayout />}>
              <Route path="/" element={<Landing />} />
            </Route>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/s/:slug" element={<RedirectPage />} />

            {/* Demo routes — seed data, no auth */}
            <Route element={<ApplicationLayout />}>
              <Route
                path="/demo/links"
                element={
                  <SeedDataProvider>
                    <LinksPage />
                  </SeedDataProvider>
                }
              />
              <Route
                path="/demo/links/:id"
                element={
                  <SeedDataProvider>
                    <LinkDetailPage />
                  </SeedDataProvider>
                }
              />
              <Route
                path="/demo/settings"
                element={
                  <SeedDataProvider>
                    <SettingsPage />
                  </SeedDataProvider>
                }
              />
            </Route>

            {/* Protected routes — Supabase data, auth required */}
            <Route element={<ApplicationLayout />}>
              <Route
                path="/links"
                element={
                  <ProtectedRoute>
                    <SupabaseDataProvider>
                      <LinksPage />
                    </SupabaseDataProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/links/:id"
                element={
                  <ProtectedRoute>
                    <SupabaseDataProvider>
                      <LinkDetailPage />
                    </SupabaseDataProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SupabaseDataProvider>
                      <SettingsPage />
                    </SupabaseDataProvider>
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FilterProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
