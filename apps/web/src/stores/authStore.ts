import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  nome: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  init: () => {
    const token = localStorage.getItem('woli_token');
    const userRaw = localStorage.getItem('woli_user');
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        set({ token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('woli_token');
        localStorage.removeItem('woli_user');
      }
    }
  },

  login: (token, user) => {
    localStorage.setItem('woli_token', token);
    localStorage.setItem('woli_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('woli_token');
    localStorage.removeItem('woli_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
