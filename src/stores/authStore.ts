import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  userToken: string | null;
  userEmail: string | null;
  isAdmin: boolean;
  login: (token: string, email?: string) => void;
  loginAdmin: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userToken: null,
      userEmail: null,
      isAdmin: false,

      login: (token: string, email?: string) => {
        set({ isAuthenticated: true, userToken: token, userEmail: email || null, isAdmin: false });
      },

      loginAdmin: (token: string) => {
        set({ isAuthenticated: true, userToken: token, isAdmin: true });
      },

      logout: () => {
        set({ isAuthenticated: false, userToken: null, userEmail: null, isAdmin: false });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
