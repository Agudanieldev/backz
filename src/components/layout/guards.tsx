import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  );
}

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function AdminRoute() {
  const { profile, loading, profileLoading } = useAuth();

  if (loading || profileLoading) return <FullScreenLoader />;
  if (profile?.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

/** Market tools are for clients only; admins are sent to their panel. */
export function UserRoute() {
  const { profile, loading, profileLoading } = useAuth();

  if (loading || profileLoading) return <FullScreenLoader />;
  if (profile?.role === "admin") return <Navigate to="/admin" replace />;

  return <Outlet />;
}

export function RootRedirect() {
  const { session, profile, loading, profileLoading } = useAuth();

  if (loading || (session && profileLoading)) return <FullScreenLoader />;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={profile?.role === "admin" ? "/admin" : "/dashboard"}
      replace
    />
  );
}
