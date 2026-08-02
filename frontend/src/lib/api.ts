import { getBrowserStorage } from '@/lib/browser-storage';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

export const API_BASE_URL = apiBaseUrl.replace(/\/$/, '');
export const ACCESS_TOKEN_KEY = 'access-token';
export const REFRESH_TOKEN_KEY = 'refresh-token';

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getAccessToken(): string | null {
  return getBrowserStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

function getRefreshToken(): string | null {
  return getBrowserStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function setAuthTokens(accessToken: string, refreshToken?: string): void {
  const storage = getBrowserStorage();
  storage?.setItem(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    storage?.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAuthTokens(): void {
  const storage = getBrowserStorage();
  storage?.removeItem(ACCESS_TOKEN_KEY);
  storage?.removeItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const payload = (await response.json().catch(() => null)) as { access_token?: string } | null;

  if (!response.ok || !payload?.access_token) {
    clearAuthTokens();
    return null;
  }

  setAuthTokens(payload.access_token);
  return payload.access_token;
}

async function request<T>(path: string, options: RequestInit = {}, hasRetried = false): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | T | null;

  if (response.status === 401 && !hasRetried && path !== '/users/refresh-token') {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      return request<T>(path, options, true);
    }
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload && payload.message
        ? payload.message
        : payload && typeof payload === 'object' && 'detail' in payload && typeof payload.detail === 'string'
          ? payload.detail
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: Record<string, unknown>) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: Record<string, unknown>) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
