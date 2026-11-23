import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService, type User } from "@/services/auth.service";

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    email: string;
    name: string;
    companyname?: string;
    password: string;
    avatarUrl?: string;
  }) => Promise<void>;
  fetchMe: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => set({ user, token }),

      logout: () => set({ user: null, token: null }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authService.login({ email, password });
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (input) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authService.signup(input);
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.me();
          set({ user, isLoading: false });
        } catch (error) {
          set({ user: null, token: null, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
