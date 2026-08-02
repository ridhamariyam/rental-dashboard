'use client';

import type { User } from '@/types/user';
import { API_BASE_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearAuthTokens, setAuthTokens } from '@/lib/api';
import { getBrowserStorage } from '@/lib/browser-storage';

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    shop_id?: string | null;
  };
}

type ApiErrorPayload = {
  detail?: string | { msg?: string }[];
  message?: string;
};

function getErrorMessage(payload: ApiErrorPayload | null, fallback: string): string {
  if (!payload) {
    return fallback;
  }

  if (typeof payload.detail === 'string') {
    return payload.detail;
  }

  if (Array.isArray(payload.detail)) {
    return payload.detail.map((item) => item.msg).filter(Boolean).join(', ') || fallback;
  }

  return payload.message ?? fallback;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    return { error: 'Sign up is handled from the customer dashboard for now' };
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const payload = (await response.json().catch(() => null)) as LoginResponse | ApiErrorPayload | null;

      if (!response.ok) {
        return {
          error: getErrorMessage(payload as ApiErrorPayload | null, `Login failed with status ${response.status}`),
        };
      }

      const data = payload as LoginResponse;
      if (!data?.access_token || !data?.refresh_token || !data?.user) {
        return { error: 'Login response is missing token or user data' };
      }

      setAuthTokens(data.access_token, data.refresh_token);
      getBrowserStorage()?.setItem('auth-user', JSON.stringify(data.user));

      return {};
    } catch (error_) {
      return { error: error_ instanceof Error ? error_.message : 'Unable to sign in' };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const storage = getBrowserStorage();
    const token = storage?.getItem(ACCESS_TOKEN_KEY);

    if (!token) {
      return { data: null };
    }

    const userJson = storage?.getItem('auth-user');
    if (!userJson) {
      return { data: null };
    }

    const backendUser = JSON.parse(userJson) as LoginResponse['user'];

    return {
      data: {
        id: backendUser.id,
        firstName: backendUser.first_name,
        lastName: backendUser.last_name,
        name: `${backendUser.first_name} ${backendUser.last_name}`,
        email: backendUser.email,
        role: backendUser.role,
        shopId: backendUser.shop_id,
      },
    };
  }

  async refreshToken(): Promise<{ error?: string }> {
    const refreshToken = getBrowserStorage()?.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      return { error: 'Refresh token is missing' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const payload = (await response.json().catch(() => null)) as { access_token?: string; detail?: string } | null;

      if (!response.ok || !payload?.access_token) {
        return {
          error: payload?.detail ?? `Token refresh failed with status ${response.status}`,
        };
      }

      setAuthTokens(payload.access_token);

      return {};
    } catch (error_) {
      return { error: error_ instanceof Error ? error_.message : 'Unable to refresh token' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    clearAuthTokens();
    getBrowserStorage()?.removeItem('auth-user');

    return {};
  }
}

export const authClient = new AuthClient();
