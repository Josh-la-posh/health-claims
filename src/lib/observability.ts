import * as Sentry from "@sentry/react";

export function initObservability() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: 1.0, // lower in prod
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export function logError(error: unknown, context?: Record<string, unknown>) {
  console.error(error);
  Sentry.captureException(error, { extra: context });
}

export function logEvent(name: string, props?: Record<string, unknown>) {
  console.log("Event:", name, props);
  Sentry.captureMessage(name, { level: "info", extra: props });
}