import create from 'zustand';
import { api } from '../services/api';
import { setItem, removeItem } from '../services/db';

export type User = { id: string; name: string; role: 'client' | 'admin'; email?: string } | null;

type State = {
  user: User;
  setUser: (u: User) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: 'client' | 'admin') => Promise<User>;
  sendOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
};

// Simple mock auth implementation for local testing. Replace with real backend later.
export const useAuthStore = create<State>((set, get) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  logout: () => set({ user: null }),
  login: async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (res && res.user) {
        set({ user: res.user });
        // token persisted by api
        return res.user as User;
      }
      throw new Error(res.error || 'Login failed');
    } catch (e) {
      throw e;
    }
  },
  register: async (name: string, email: string, password: string, role: 'client' | 'admin') => {
    try {
      // only allow client registrations
      const res = await api.register(name, email, password);
      if (res && res.user) {
        set({ user: res.user });
        return res.user as User;
      }
      throw new Error(res.error || 'Registration failed');
    } catch (e) {
      throw e;
    }
  },
  sendOtp: async (email: string) => {
    // mock: pretend to send OTP, store a code in memory? For simplicity always succeed
    return true;
  },
  verifyOtp: async (email: string, code: string) => {
    // mock: accept any code "123456"
    return code === '123456';
  },
}));
