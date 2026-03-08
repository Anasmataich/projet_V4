// frontend/src/services/api.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/utils/constants';

/**
 * Internal retry flag used by our refresh logic
 */
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // HttpOnly cookies are sent automatically
});

/**
 * Auth endpoints that must NOT trigger refresh logic.
 * Otherwise you may create infinite loops: /auth/me -> 401 -> refresh -> 400 -> redirect -> reload ...
 */
const AUTH_BYPASS_PATHS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/me',
  '/auth/logout',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/mfa',
] as const;

const isBypassUrl = (url?: string): boolean => {
  if (!url) return false;
  return AUTH_BYPASS_PATHS.some((p) => url.includes(p));
};

const redirectToLoginOnce = (() => {
  let redirected = false;
  return (): void => {
    if (redirected) return;
    const onLogin = window.location.pathname.startsWith('/login');
    if (!onLogin) {
      redirected = true;
      window.location.replace('/login');
    }
  };
})();

/**
 * Refresh concurrency control:
 * If multiple requests fail with 401 simultaneously, we do ONE refresh,
 * then replay queued requests after refresh succeeds.
 */
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

type QueueItem = {
  config: RetryableRequestConfig;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};
const queue: QueueItem[] = [];

const flushQueueSuccess = () => {
  while (queue.length) {
    const item = queue.shift()!;
    item.resolve(api(item.config));
  }
};

const flushQueueError = (err: unknown) => {
  while (queue.length) {
    const item = queue.shift()!;
    item.reject(err);
  }
};

const doRefresh = async (): Promise<void> => {
  // refresh_token is sent via cookie automatically
  await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true, timeout: 30_000 });
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = (error.config || {}) as RetryableRequestConfig;

    // Network error: backend down / CORS / DNS / etc.
    if (!error.response) {
      return Promise.reject(error);
    }

    // Only handle 401 globally
    if (status !== 401) {
      return Promise.reject(error);
    }

    // Skip refresh for auth endpoints
    if (isBypassUrl(original.url)) {
      return Promise.reject(error);
    }

    // Avoid infinite retry
    if (original._retry) {
      redirectToLoginOnce();
      return Promise.reject(error);
    }
    original._retry = true;

    // If refresh already running, queue the request
    if (isRefreshing && refreshPromise) {
      return new Promise((resolve, reject) => {
        queue.push({ config: original, resolve, reject });
      });
    }

    // Start refresh
    isRefreshing = true;
    refreshPromise = doRefresh();

    try {
      await refreshPromise;

      isRefreshing = false;
      refreshPromise = null;

      flushQueueSuccess();
      return api(original);
    } catch (refreshErr) {
      isRefreshing = false;
      refreshPromise = null;

      flushQueueError(refreshErr);
      redirectToLoginOnce();

      return Promise.reject(refreshErr);
    }
  }
);

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: ResponseMeta;
  timestamp: string;
}

export default api;