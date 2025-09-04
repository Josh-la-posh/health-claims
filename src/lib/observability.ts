// src/lib/observability.ts
import * as Sentry from "@sentry/react";

export function initObservability() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: 1.0, // lower in prod
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    replaysSessionSampleRate: 0.1, // lower in prod
    replaysOnErrorSampleRate: 1.0,
  });
}
