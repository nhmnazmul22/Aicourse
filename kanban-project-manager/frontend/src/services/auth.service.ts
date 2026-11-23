import { api } from "./api";

export type User = {
  id: string;
  email: string;
  name: string;
  companyname?: string;
  avatarUrl?: string;
  createdAt: string;
  _id?: string;
};

export function normalizeUser(raw: unknown): User {
  if (!raw || typeof raw !== "object") {
    return raw as User;
  }
  const u = raw as Record<string, unknown>;
  const id =
    typeof u.id === "string" && u.id
      ? u.id
      : typeof u._id === "string" && u._id
      ? u._id
      : String(u._id || u.id || "");
  return {
    ...u,
    id,
  } as User;
}

export type SignupInput = {
  email: string;
  name: string;
  companyname?: string;
  password: string;
  avatarUrl?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export const authService = {
  signup: async (input: SignupInput) => {
    const data = await api.post<AuthResponse>("/api/auth/signup", input);
    return { ...data, user: normalizeUser(data.user) };
  },
  login: async (input: LoginInput) => {
    const data = await api.post<AuthResponse>("/api/auth/login", input);
    return { ...data, user: normalizeUser(data.user) };
  },
  me: async () => {
    const data = await api.get<{ user: User }>("/api/auth/me");
    return normalizeUser(data.user);
  },
  logout: () => api.post<{ ok: boolean }>("/api/auth/logout"),
};
