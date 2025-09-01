import axios from "axios";
import { useAuthStore } from "../store/auth";

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Attach token
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Simple refresh logic (assumes /auth/refresh sets new access token from cookie)
let refreshing: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  const { setAccessToken, logout } = useAuthStore.getState();
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
    const token = res.data?.accessToken || null;
    setAccessToken(token);
    return token;
  } catch {
    logout();
    return null;
  }
}

api.interceptors.response.use(
  res => res,
  async (error) => {
    const { config, response } = error || {};
    if (response?.status === 401 && !config.__isRetry) {
      config.__isRetry = true;
      refreshing = refreshing ?? refreshToken();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      }
    }
    return Promise.reject(error);
  }
);
