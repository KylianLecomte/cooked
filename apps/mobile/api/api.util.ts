import { authClient } from "../lib/auth-client";
import { API_BASE_URL } from "./api.constant";
import { ApiError } from "./api.type";

// ── Wrapper fetch central ─────────────────────────────────────────────────────
//
// Récupère le cookie stocké par expoClient (expo-secure-store) et l'injecte
// dans chaque requête. React Native n'a pas de jar de cookies natif — on doit
// passer le cookie manuellement dans l'en-tête.

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const cookie = authClient.getCookie();

  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = (data as { message?: string })?.message ?? `HTTP ${response.status}`;
    throw new ApiError(response.status, message);
  }

  // 204 No Content — pas de body JSON
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
