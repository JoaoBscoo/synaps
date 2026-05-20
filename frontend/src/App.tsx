import { useState, useEffect, useCallback, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AuthContext, AuthContextValue } from './hooks/useAuth';
import { authApi } from './services/api';
import { User } from './types';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import WorkspaceCreate from './pages/WorkspaceCreate';
import Invite from './pages/Invite';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectNew from './pages/ProjectNew';
import ProjectDetail from './pages/ProjectDetail';
import ProjectEdit from './pages/ProjectEdit';
import Settings from './pages/Settings';

const API_URL = import.meta.env.VITE_API_URL || '';

function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('synaps_token'));

  const { data: user, isLoading, refetch } = useQuery<User>({
    queryKey: ['auth-me'],
    queryFn: authApi.me,
    enabled: !!token,
    retry: false,
  });

  const login = useCallback((provider: 'google' | 'microsoft') => {
    window.location.href = `${API_URL}/auth/${provider}`;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    localStorage.removeItem('synaps_token');
    setToken(null);
    window.location.href = '/login';
  }, []);

  // Escutar mudanças de token (ex: AuthCallback page seta o token)
  useEffect(() => {
    const handleStorage = () => {
      const t = localStorage.getItem('synaps_token');
      setToken(t);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading: !!token && isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('synaps_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/workspace/new" element={<RequireAuth><WorkspaceCreate /></RequireAuth>} />
          <Route path="/invite/:token" element={<Invite />} />

          {/* Autenticadas */}
          <Route
            path="/w/:slug/dashboard"
            element={<RequireAuth><Dashboard /></RequireAuth>}
          />
          <Route
            path="/w/:slug/projects"
            element={<RequireAuth><Projects /></RequireAuth>}
          />
          <Route
            path="/w/:slug/projects/new"
            element={<RequireAuth><ProjectNew /></RequireAuth>}
          />
          <Route
            path="/w/:slug/projects/:id"
            element={<RequireAuth><ProjectDetail /></RequireAuth>}
          />
          <Route
            path="/w/:slug/projects/:id/edit"
            element={<RequireAuth><ProjectEdit /></RequireAuth>}
          />
          <Route
            path="/w/:slug/settings"
            element={<RequireAuth><Settings /></RequireAuth>}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
