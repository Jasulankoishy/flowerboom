import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  googleId?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAdmin: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  loginAdmin: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setName: (name: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      isAdmin: false,

      login: (accessToken: string, refreshToken: string, user: User) => {
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          user,
          isAdmin: false,
        });
      },

      loginAdmin: (accessToken: string, refreshToken: string) => {
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          user: null,
          isAdmin: true,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
          isAdmin: false,
        });
      },

      setName: (name: string) => {
        set((state) => ({
          user: state.user ? { ...state.user, name } : null,
        }));
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
