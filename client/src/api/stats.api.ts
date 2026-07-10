import { apiFetch } from "./client";

export interface PublicStats {
  registeredUsers: number;
}

export function getPublicStats() {
  return apiFetch<PublicStats>("/api/stats", { auth: false });
}
