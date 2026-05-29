import { createContext, useContext, useMemo, useState } from 'react';
import type { Account, User } from '../api/types';
import * as api from '../api/client';

interface AuthValue {
  user: User | null;
  account: Account | null;
  isAuthenticated: boolean;
  login: (input: { accountId: string; email: string; password: string }) => Promise<void>;
  register: (input: { accountName: string; fullName: string; email: string; password: string }) => Promise<Account>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);

  const value = useMemo<AuthValue>(() => ({
    user,
    account,
    isAuthenticated: Boolean(user && account),
    async login(input) {
      const session = await api.login(input);
      setUser(session.user);
      setAccount(session.account);
    },
    async register(input) {
      const session = await api.register(input);
      setUser(session.user);
      setAccount(session.account);
      return session.account;
    },
    async logout() {
      await api.logout();
      setUser(null);
      setAccount(null);
    },
  }), [user, account]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
