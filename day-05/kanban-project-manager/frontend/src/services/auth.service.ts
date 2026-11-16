import { api } from "./api";

export type User = {
  id: string;
  email: string;
  name: string;
  companyname?: string;
  avatarUrl?: string;
  createdAt: string;
};

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
  signup: (input: SignupInput) => api.post<AuthResponse>("/api/auth/signup", input),
  login: (input: LoginInput) => api.post<AuthResponse>("/api/auth/login", input),
  me: () => api.get<User>("/api/auth/me"),
  logout: () => api.post<{ ok: boolean }>("/api/auth/logout"),
};
