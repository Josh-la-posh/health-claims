import { useNetworkStatus } from "../../hooks/useNetworkStatus";
export default function OfflineBanner() {
  const online = useNetworkStatus();
  if (online) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-amber-500 text-white text-sm py-2 text-center">
      You’re offline. Some features may be unavailable.
    </div>
  );
}
