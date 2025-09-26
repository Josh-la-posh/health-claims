import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../lib/queryClient";
import { Toaster } from "sonner";
import React from "react";
import { setupQueryPersistence } from "../../lib/queryPersistor";

// Lazy devtools placeholder component (only loads in development in browser)
type DevtoolsCmp = React.ComponentType<{ initialIsOpen?: boolean }>;
const ReactQueryDevtoolsLazy: React.FC = () => {
  const [Devtools, setDevtools] = React.useState<DevtoolsCmp | null>(null);
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      import("@tanstack/react-query-devtools").then(mod => {
        setDevtools(() => mod.ReactQueryDevtools);
      }).catch(() => {/* ignore */});
    }
  }, []);
  return Devtools ? <Devtools initialIsOpen={false} /> : null;
};

// Ensure persistence is set up once on module load (client-side only)
if (typeof window !== 'undefined') {
  setupQueryPersistence(queryClient);
}

export const QueryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
  <ReactQueryDevtoolsLazy />
      <Toaster richColors />
    </QueryClientProvider>
  );
};
