const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:4100";

function trimSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getBackendBaseUrl() {
  if (typeof window === "undefined") {
    return trimSlash(
      process.env.BACKEND_API_BASE_URL ??
        process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ??
        DEFAULT_BACKEND_BASE_URL,
    );
  }

  return trimSlash(process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? DEFAULT_BACKEND_BASE_URL);
}

export async function apiGet<T>(path: string): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // no-op
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // no-op
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

