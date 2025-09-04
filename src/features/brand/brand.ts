import { api } from "../../lib/axios";
import { useEffect } from "react";
import { useThemeStore } from "../../store/theme";

/** Example: detect subdomain (?merchant=code is also fine) */
function getTenantFromLocation() {
  const host = window.location.hostname; // e.g., foo.example.com
  const parts = host.split(".");
  const sub = parts.length > 2 ? parts[0] : null;
  const q = new URLSearchParams(window.location.search).get("merchant");
  return q || sub;
}

export function BrandBootstrapper() {
  const setPrimary = useThemeStore((s) => s.setPrimaryHsl);
  useEffect(() => {
    const tenant = getTenantFromLocation();
    if (!tenant) return;
    (async () => {
      try {
        // Replace with your real endpoint:
        // GET /public/brand?tenant=foo → { primaryHsl: "222 89% 56%" }
        const { data } = await api.get(`/public/brand`, { params: { tenant } });
        if (data?.primaryHsl) setPrimary(data.primaryHsl);
      } catch {
        /* non-blocking */
      }
    })();
  }, [setPrimary]);
  return null;
}
