import { useEffect } from "react";
import { useThemeStore } from "../../store/theme";
import { fetchBrand, getTenantFromLocation, readBrandCache, writeBrandCache } from "./brand";

export default function BrandBootstrapper() {
  const setPrimaryHsl = useThemeStore(s => s.setPrimaryHsl);

  useEffect(() => {
    const tenant = getTenantFromLocation();
    if (!tenant) return;

    const cached = readBrandCache(tenant);
    if (cached?.primaryHsl) {
      setPrimaryHsl(cached.primaryHsl);
    }

    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetchBrand(tenant, ac.signal);
        if (res.primaryHsl) {
          writeBrandCache(tenant, res);
          setPrimaryHsl(res.primaryHsl);
        }
        // if you want to also store logo/name globally, you can add a brand store later
      } catch {/* silent */ }
    })();

    return () => ac.abort();
  }, [setPrimaryHsl]);

  return null;
}
