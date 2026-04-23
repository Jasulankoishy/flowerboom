import { useAuthStore } from "../stores";

/**
 * Fetch wrapper that automatically adds Authorization header
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().accessToken;

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON requests (unless FormData)
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Helper for JSON requests
 */
export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}
