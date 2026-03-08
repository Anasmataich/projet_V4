// frontend/src/services/authService.ts
import axios, { AxiosError } from 'axios';
import api, { type ApiResponse } from './api';
import { API_URL } from '@/utils/constants';

import type {
  LoginInput,
  LoginResult,
  RegisterInput,
  ChangePasswordInput,
} from '@/types/auth.types';
import type { User } from '@/types/user.types';

class ApiServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiServiceError';
  }
}

function unwrap<T>(res: { data: ApiResponse<T> }): T {
  const body = res.data;

  // بعض الـ backends يرجعون success=false مع 200
  if (body && body.success === false) {
    throw new ApiServiceError(body.message || 'Request failed', 200, body);
  }

  // إذا data غير موجودة
  if (body?.data === undefined) {
    throw new ApiServiceError(body?.message || 'Empty response data', 200, body);
  }

  return body.data;
}

function toServiceError(err: unknown): ApiServiceError {
  const e = err as AxiosError<any>;
  const status = e.response?.status;

  // رسالة backend لو متاحة
  const backendMsg =
    e.response?.data?.message ||
    e.response?.data?.error ||
    e.message ||
    'Request error';

  return new ApiServiceError(backendMsg, status, e.response?.data);
}

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    try {
      const res = await api.post<ApiResponse<LoginResult>>('/auth/login', input);
      return unwrap(res);
    } catch (err) {
      throw toServiceError(err);
    }
  },

  async register(
    input: RegisterInput
  ): Promise<{ userId: string; email: string }> {
    try {
      const res = await api.post<ApiResponse<{ userId: string; email: string }>>(
        '/auth/register',
        input
      );
      return unwrap(res);
    } catch (err) {
      throw toServiceError(err);
    }
  },

  async verifyMFA(
    userId: string,
    totpToken: string,
    pendingToken: string
  ): Promise<{ verified: boolean }> {
    try {
      const res = await api.post<ApiResponse<{ verified: boolean }>>(
        '/auth/mfa/verify',
        { userId, totpToken, pendingToken }
      );
      return unwrap(res);
    } catch (err) {
      throw toServiceError(err);
    }
  },

  /**
   * IMPORTANT:
   * Use raw axios to avoid any interceptor recursion.
   */
  async refresh(): Promise<{ refreshed: boolean }> {
    try {
      const res = await axios.post<ApiResponse<{ refreshed: boolean }>>(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true, timeout: 30_000 }
      );
      return unwrap(res);
    } catch (err) {
      throw toServiceError(err);
    }
  },

  /**
   * getMe should NOT crash the app on 401.
   * If not authenticated, simply return null.
   */
  async getMe(): Promise<User | null> {
    try {
      const res = await api.get<ApiResponse<User>>('/auth/me');
      return unwrap(res);
    } catch (err) {
      const se = toServiceError(err);
      if (se.status === 401) return null; // normal when user not logged in
      throw se;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // logout failure shouldn't brick UI, but expose if needed
      throw toServiceError(err);
    }
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    try {
      await api.patch('/auth/password', input);
    } catch (err) {
      throw toServiceError(err);
    }
  },

  async setupMFA(): Promise<{ secret: string; otpauthUrl: string; qrData: string }> {
    try {
      const res = await api.post<
        ApiResponse<{ secret: string; otpauthUrl: string; qrData: string }>
      >('/auth/mfa/setup');
      return unwrap(res);
    } catch (err) {
      throw toServiceError(err);
    }
  },

  async enableMFA(totpToken: string): Promise<void> {
    try {
      await api.post('/auth/mfa/enable', { totpToken });
    } catch (err) {
      throw toServiceError(err);
    }
  },

  async disableMFA(totpToken: string): Promise<void> {
    try {
      await api.delete('/auth/mfa', { data: { totpToken } });
    } catch (err) {
      throw toServiceError(err);
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (err) {
      throw toServiceError(err);
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (err) {
      throw toServiceError(err);
    }
  },
};