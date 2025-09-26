import type { AxiosError } from "axios";

export type AppErrorCode =
  | "NETWORK"
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "SERVER"
  | "BAD_REQUEST"
  | "UNKNOWN";

export type ServerEnvelope<T = unknown> = {
  requestSuccessful?: boolean;
  message?: string;
  data?: T;
  title?: string;
  instance?: string;
  isSuccess?: boolean;
};

export class AppError extends Error {
  code: AppErrorCode;
  status?: number;
  instance?: string;
  title?: string;
  details?: unknown;
  constructor(params: {
    code: AppErrorCode;
    message: string;
    status?: number;
    title?: string;
    instance?: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "AppError";
    this.code = params.code;
    this.status = params.status;
    this.instance = params.instance;
    this.details = params.details;
    this.title = params.title;
  }
}

/** Turn any thrown error into a typed AppError. */
export function toAppError(err: unknown): AppError {
  // Axios?
  const ax = err as AxiosError<ServerEnvelope>;
  if (ax?.isAxiosError) {
    // No response -> network or CORS or timeout
    if (!ax.response) {
      if ((ax.code || "").toLowerCase() === "ecanceled") {
        return new AppError({ code: "TIMEOUT", message: "The request was canceled or timed out.", details: ax });
      }
      return new AppError({ code: "NETWORK", message: "Network error. Please check your connection.", details: ax });
    }

    const { status, data } = ax.response;
    // Handle new error format with 'title' field, fallback to old 'message' format
    const backendMsg = data?.title || data?.message || ax.message;
    const instance = data?.instance;

    if (status === 400) {
      return new AppError({
        code: "BAD_REQUEST",
        message: friendlyMessage(status, backendMsg),
        status,
        instance,
        details: data || ax.toJSON?.() || ax,
      });
    }
    if (status === 401) {
      return new AppError({
        code: "UNAUTHORIZED",
        message: friendlyMessage(status, backendMsg),
        status,
        instance,
        details: data || ax,
      });
    }
    if (status === 403) {
      return new AppError({
        code: "FORBIDDEN",
        message: friendlyMessage(status, backendMsg),
        status,
        instance,
        details: data || ax,
      });
    }
    if (status === 404) {
      return new AppError({
        code: "NOT_FOUND",
        message: friendlyMessage(status, backendMsg),
        status,
        instance,
        details: data || ax,
      });
    }
    if (status === 429) {
      return new AppError({
        code: "RATE_LIMITED",
        message: friendlyMessage(status, backendMsg),
        status,
        instance,
        details: data || ax,
      });
    }
    if (status >= 500) {
      return new AppError({
        code: "SERVER",
        message: friendlyMessage(status, backendMsg),
        status,
        instance,
        details: data || ax,
      });
    }

    // Unknown status
    return new AppError({
      code: "UNKNOWN",
      message: backendMsg || "An unexpected error occurred.",
      status,
      instance,
      details: data || ax,
    });
  }

  // Non-Axios unknown error
  const e = err as Error;
  return new AppError({
    code: "UNKNOWN",
    message: e?.message || "An unexpected error occurred.",
    details: err,
  });
}

/** Optional: map backend responseCode/status to a nicer user message. */
function friendlyMessage(status?: number, backendMsg?: string) {
  // Handle specific backend messages from the new error format
  console.log('Found; ', backendMsg);
  if (backendMsg === "Invalid credentials.") {
    return "Email or password is incorrect. Please try again.";
  }
  
  if (backendMsg === "User not found") {
    return "We couldn't find an account with that email address.";
  }

  if (status === 400) return backendMsg ?? "Invalid request. Please check your input.";
  if (status === 401) return backendMsg ?? "Your session has expired. Please sign in again.";
  if (status === 403) return backendMsg ?? "You don't have permission to perform this action.";
  if (status === 404) return backendMsg ?? "We couldn't find what you're looking for.";
  if (status === 429) return backendMsg ?? "Too many requests. Please try again shortly.";
  if (status && status >= 500) return backendMsg ?? "Something went wrong on our side. Please try again.";
  return backendMsg || "Something went wrong.";
}

/** Safe user message for UI (never expose internals). */
export function getUserMessage(error: AppError): string {
  // Use the friendly message mapping
  const errMsg = error.title || error.message;
  const canon = friendlyMessage(error.status, errMsg);
  if (canon) return canon;
  
  return error.message || "An unexpected error occurred.";
}