import { authApi } from "./axios";
import { useAuthStore } from "../store/auth";

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function parseJwtExpiry(token: string | null): number | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload || !payload.exp) return null;
    return payload.exp * 1000; // exp is seconds -> ms
  } catch {
    return null;
  }
}

async function doRefresh(): Promise<string | null> {
  try {
    const res = await authApi.post('/auth/refresh', {}, { withCredentials: true });
    const token = res.data?.accessToken || null;
    return token;
  } catch {
    return null;
  }
}

export async function scheduleRefreshFromToken(token: string | null) {
  clearTimer();
  const expiry = parseJwtExpiry(token);
  if (!expiry) return;
  const now = Date.now();
  // plan to refresh 60 seconds before expiry, but at least in 30s
  const refreshAt = Math.max(now + 30000, expiry - 60000);
  const ms = refreshAt - now;
  refreshTimer = setTimeout(async () => {
    const newToken = await doRefresh();
    if (newToken) {
      useAuthStore.getState().setAccessToken(newToken);
      // schedule next refresh
      scheduleRefreshFromToken(newToken).catch(() => {});
    } else {
      useAuthStore.getState().logout();
    }
  }, ms);
}

export function clearScheduledRefresh() {
  clearTimer();
}
