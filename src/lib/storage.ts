// Small helpers for safe storage
export const storage = {
  get<T>(key: string, fallback: T | null = null): T | null {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch { return fallback; }
  },
  set<T>(key: string, val: T) {
    try { sessionStorage.setItem(key, JSON.stringify(val)); } catch { /* empty */ }
  },
  del(key: string) { try { sessionStorage.removeItem(key); } catch { /* empty */ } }
};
