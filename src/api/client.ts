import { useAuthStore } from "../stores";
import { API_ENDPOINTS, API_URL } from "./config";

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

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, updateAccessToken, logout } = useAuthStore.getState();

  if (!refreshToken) {
    logout();
    return null;
  }

  const response = await fetch(`${API_URL}${API_ENDPOINTS.refresh}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    logout();
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!data?.accessToken) {
    logout();
    return null;
  }

  updateAccessToken(data.accessToken);
  return data.accessToken;
}

/**
 * Helper for JSON requests
 */
export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response = await apiFetch(url, options);

  if (response.status === 401 || response.status === 403) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      response = await apiFetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}
