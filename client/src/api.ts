let cachedCsrfToken: string | null = null;

async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (typeof cachedCsrfToken === "string" && !forceRefresh) {
    return cachedCsrfToken;
  }

  const res = await fetch("/api/auth/csrf", {
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.csrfToken !== "string") {
    throw new Error(data.message ?? "CSRF 토큰 발급 실패");
  }

  const token: string = data.csrfToken;
  cachedCsrfToken = token;
  return token;
}

export function clearCsrfTokenCache() {
  cachedCsrfToken = null;
}

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function api<T = unknown>(
  path: string,
  method = "GET",
  body?: unknown
): Promise<T> {
  const upperMethod = method.toUpperCase();
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (STATE_CHANGING_METHODS.has(upperMethod) && path !== "/api/auth/csrf") {
    const token = await getCsrfToken();
    headers["X-CSRF-Token"] = token;
  }

  const res = await fetch(path, {
    method: upperMethod,
    credentials: "include",
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? `요청 실패 (${res.status})`);
  }
  return data as T;
}

export async function uploadFile(postId: number, file: File): Promise<void> {
  const token = await getCsrfToken();
  const form = new FormData();
  form.append("postId", String(postId));
  form.append("file", file);

  const res = await fetch("/api/files/upload", {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRF-Token": token,
    },
    body: form,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "파일 업로드 실패");
  }
}

export function downloadUrl(storedName: string): string {
  return `/api/files/download?name=${encodeURIComponent(storedName)}`;
}