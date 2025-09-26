import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "../../lib/queryClient";
import { Toaster } from "sonner";
import React from "react";
import { setupQueryPersistence } from "../../lib/queryPersistor";

// Ensure persistence is set up once on module load (client-side only)
if (typeof window !== 'undefined') {
  setupQueryPersistence(queryClient);
}

export const QueryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster richColors />
    </QueryClientProvider>
  );
};
