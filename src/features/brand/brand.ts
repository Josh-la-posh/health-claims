import { api } from "../../lib/axios";

export type BrandEnvelope = {
  requestSuccessful: boolean;
  responseData?: {
    primaryHsl?: string;   // "222 89% 56%"
    logoUrl?: string;
    name?: string;
  };
  message?: string;
  responseCode?: string;
};

const CACHE_KEY = "brand:cache";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getTenantFromLocation(): string | null {
  const host = window.location.hostname; // e.g. naira.example.com
  const parts = host.split(".");
  const sub = parts.length > 2 ? parts[0] : null;
  const q = new URLSearchParams(window.location.search).get("merchant");
  return q || sub || null;
}

type Cached = Record<string, { ts: number; primaryHsl?: string; logoUrl?: string; name?: string }>;

export function readBrandCache(tenant: string) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Cached;
    const hit = all[tenant];
    if (!hit) return null;
    if (Date.now() - hit.ts > CACHE_TTL_MS) return null;
    return hit;
  } catch {
    return null;
  }
}

export function writeBrandCache(tenant: string, data: { primaryHsl?: string; logoUrl?: string; name?: string }) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const all = raw ? (JSON.parse(raw) as Cached) : {};
    all[tenant] = { ts: Date.now(), ...data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch {
    // Not ready
  }
}

/** GET /public/brand?tenant=xxx  (adjust path to your API) */
export async function fetchBrand(tenant: string, signal?: AbortSignal) {
  const { data } = await api.get<BrandEnvelope>("/public/brand", { params: { tenant }, signal });
  return {
    primaryHsl: data.responseData?.primaryHsl,
    logoUrl: data.responseData?.logoUrl,
    name: data.responseData?.name,
  };
}
