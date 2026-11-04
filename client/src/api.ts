export async function api<T = unknown>(path: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? {"Content-Type": "application/json"} : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? `요청 실패 (${res.status})`);
  }
  return data as T;
}

export async function uploadFile(postId: number, file: File): Promise<void> {
  const form = new FormData();
  form.append("postId", String(postId));
  form.append("file", file);
  const res = await fetch("/api/files/upload", {method: "POST", body: form});
  if (!res.ok) {
    throw new Error("파일 업로드 실패");
  }
}

export function downloadUrl(storedName: string): string {
  return `/api/files/download?name=${encodeURIComponent(storedName)}`;
}
