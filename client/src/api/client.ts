const API_URL = import.meta.env.VITE_API_URL as string;

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Render's free plan spins the backend down after inactivity: the first
// request after a while can hit a still-booting instance and come back as a
// gateway error (502/503/504) or a raw network failure within a second or
// two, rather than the request just being slow. Retry a couple of times
// with backoff before giving up, so a cold start doesn't look like a
// broken login/courses list to the user.
const RETRY_STATUSES = new Set([502, 503, 504]);
const MAX_ATTEMPTS = 3;

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${API_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      if (attempt < MAX_ATTEMPTS) {
        await sleep(attempt * 1500);
        continue;
      }
      throw new ApiError(0, "NETWORK_ERROR", "Не вдалося з'єднатися із сервером. Спробуйте ще раз.");
    }

    if (RETRY_STATUSES.has(res.status) && attempt < MAX_ATTEMPTS) {
      await sleep(attempt * 1500);
      continue;
    }

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
      throw new ApiError(res.status, payload?.error, payload?.error ?? "Сталася помилка");
    }

    return payload as T;
  }

  // Unreachable in practice (the loop always returns or throws on the last
  // attempt), but keeps TypeScript happy about the function's return type.
  throw new ApiError(0, "NETWORK_ERROR", "Не вдалося з'єднатися із сервером. Спробуйте ще раз.");
}
