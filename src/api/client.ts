import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const API_URL = (import.meta as any).env?.VITE_API_URL ?? 'https://api.petpooja.androappstech.in/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failQueue: Array<{ resolve: (v: string) => void; reject: (e: any) => void }> = [];

const processQueue = (err: any, token?: string) => {
  failQueue.forEach((p) => (token ? p.resolve(token) : p.reject(err)));
  failQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('pp_refresh_token');
      if (!refreshToken) { isRefreshing = false; window.location.href = '/login'; return Promise.reject(err); }
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('pp_access_token', data.accessToken);
        localStorage.setItem('pp_refresh_token', data.refreshToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (e) {
        processQueue(e);
        localStorage.removeItem('pp_access_token');
        localStorage.removeItem('pp_refresh_token');
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
