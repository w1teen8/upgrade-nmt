import { apiFetch } from "./client";

export function pingVisit(sessionId: string) {
  return apiFetch<void>("/api/visits", { method: "POST", body: { sessionId }, auth: false });
}
