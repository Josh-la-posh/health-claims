import { QueryClient } from "@tanstack/react-query";
import { AppError, getUserMessage, toAppError } from "./error";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (err) => {
        const appErr = err instanceof AppError ? err : toAppError(err);
        toast.error(getUserMessage(appErr));
      },
    },
  },
});
