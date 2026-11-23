import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService, normalizeUser, type User } from "@/services/auth.service";

function setTokenCookie(token: string) {
  if (typeof document !== "undefined") {
    document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
  }
}

function clearTokenCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }
}

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

      setAuth: (user, token) => {
        setTokenCookie(token);
        set({ user: normalizeUser(user), token });
      },

      logout: () => {
        clearTokenCookie();
        set({ user: null, token: null });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authService.login({ email, password });
          setTokenCookie(token);
          set({ user: normalizeUser(user), token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (input) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authService.signup(input);
          setTokenCookie(token);
          set({ user: normalizeUser(user), token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.me();
          set({ user: normalizeUser(user), isLoading: false });
        } catch (error) {
          clearTokenCookie();
          set({ user: null, token: null, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setTokenCookie(state.token);
        }
        if (state?.user) {
          state.user = normalizeUser(state.user);
        }
      },
    }
  )
);
