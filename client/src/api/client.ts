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

// Render's free plan used to spin the backend down after inactivity, which
// could turn a cold start into a gateway error (502/503/504) or a raw
// network failure. Retrying helps for that case, but only makes sense for
// safe, idempotent GET requests — retrying a POST like login several times
// in a burst is bad practice regardless (it can look like brute-forcing to
// any WAF/rate-limiter in front of the API) and doesn't help a request that
// keeps failing for a real reason (e.g. something in the client's own
// network path stripping the response). Non-GET requests get a single try.
const RETRY_STATUSES = new Set([502, 503, 504]);
const MAX_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [2000, 4000, 6000]; // ~12s total across GET retries

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const maxAttempts = method === "GET" ? MAX_ATTEMPTS : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      if (attempt < maxAttempts) {
        await sleep(RETRY_DELAYS_MS[attempt - 1]);
        continue;
      }
      throw new ApiError(0, "NETWORK_ERROR", "Не вдалося з'єднатися із сервером. Спробуйте ще раз.");
    }

    if (RETRY_STATUSES.has(res.status) && attempt < maxAttempts) {
      await sleep(RETRY_DELAYS_MS[attempt - 1]);
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
