import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setLoadingTooLong(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTooLong(false);
    }
  }, [isLoading]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
          <p className="text-muted-foreground">Loading...</p>
          {loadingTooLong && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <p className="text-sm text-muted-foreground">Taking longer than expected...</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if profile is not complete (unless we're already on onboarding)
  if (requireOnboarding && profile && !profile.is_onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setLoadingTooLong(true), 3000);
      return () => clearTimeout(timer);
    }
    setLoadingTooLong(false);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
          <p className="text-muted-foreground">Checking admin access...</p>
          {loadingTooLong && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <p className="text-sm text-muted-foreground">Taking longer than expected...</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const { user, profile, isLoading } = useAuth();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setLoadingTooLong(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTooLong(false);
    }
  }, [isLoading]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
          <p className="text-muted-foreground">Loading...</p>
          {loadingTooLong && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <p className="text-sm text-muted-foreground">Taking longer than expected...</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Redirect authenticated users away from login/signup
  if (user) {
    if (profile && !profile.is_onboarded) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
