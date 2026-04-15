import React from "react";
import AppRoutes from "routes";
import useAppLoad from "common/hooks/useAppLoad";
import { AuthProvider, useAuth } from "context/AuthContext";

const SplashPage = React.lazy(() => import("pages/splash"));
const LoginPage = React.lazy(() => import("pages/login"));

const AppContent = () => {
  const { isLoaded, progress } = useAppLoad();
  const { user, signOut } = useAuth();

  if (!isLoaded) return <SplashPage progress={progress} />;
  
  if (!user) {
    return (
      <React.Suspense fallback={<SplashPage progress={100} />}>
        <LoginPage onLogin={() => {}} />
      </React.Suspense>
    );
  }

  return <AppRoutes onLogout={signOut} />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

