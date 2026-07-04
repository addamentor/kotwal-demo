/**
 * Demo AuthContext — no real login, no API calls.
 * Role is set by the demo landing page (stored in sessionStorage).
 */
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export type DemoRole = 'admin' | 'user';

interface AuthUser {
  email: string;
  role?: string;
  name?: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  hasRole: (...roles: string[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enterDemo: (role: DemoRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USERS: Record<DemoRole, AuthUser> = {
  admin: { email: 'sarah.chen@acme.com', name: 'Sarah Chen', role: 'admin' },
  user: { email: 'james.wilson@acme.com', name: 'James Wilson', role: 'user' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const savedRole = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('demo_role') : null) as DemoRole | null;
  const [user, setUser] = useState<AuthUser | null>(savedRole ? DEMO_USERS[savedRole] : null);

  const enterDemo = useCallback((role: DemoRole) => {
    sessionStorage.setItem('demo_role', role);
    setUser(DEMO_USERS[role]);
  }, []);

  const login = useCallback(async () => {
    enterDemo('user');
  }, [enterDemo]);

  const logout = useCallback(async () => {
    sessionStorage.removeItem('demo_role');
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: string[]) => {
      if (!user?.role) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!user,
      user,
      loading: false,
      token: user ? 'demo-token' : null,
      hasRole,
      login,
      logout,
      enterDemo,
    }),
    [user, hasRole, login, logout, enterDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
