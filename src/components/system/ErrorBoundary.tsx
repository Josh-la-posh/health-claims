import * as Sentry from "@sentry/react";
import ErrorPage from "./ErrorPage";

type Props = {
  children: React.ReactNode;
};

export function RouteResetBoundary({ children }: Props) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, componentStack, resetError }) => (
        <ErrorPage
          error={error as Error}
          stack={componentStack}
          onReset={resetError}
        />
      )}
      showDialog // optional: show Sentry's error dialog in production
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
