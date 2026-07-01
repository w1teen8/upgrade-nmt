import { apiFetch } from "./client";

export interface AuthUser {
  id: number;
  email: string;
  role: "student" | "admin";
  is_verified?: boolean;
}

export function register(email: string, password: string) {
  return apiFetch<{ message: string }>("/api/auth/register", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function login(email: string, password: string) {
  return apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function verifyEmail(token: string) {
  return apiFetch<{ message: string }>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
    auth: false,
  });
}

export function resendVerification(email: string) {
  return apiFetch<{ message: string }>("/api/auth/resend-verification", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export function me() {
  return apiFetch<AuthUser>("/api/auth/me");
}
