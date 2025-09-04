import * as Sentry from "@sentry/react";
import ErrorPage from "./ErrorPage";

export function RouteResetBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={<ErrorPage />}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
