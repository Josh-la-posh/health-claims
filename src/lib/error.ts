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
  responseCode?: string;
  message?: string;
  responseData?: T;
};

export class AppError extends Error {
  code: AppErrorCode;
  status?: number;
  responseCode?: string;
  details?: unknown;
  constructor(params: {
    code: AppErrorCode;
    message: string;
    status?: number;
    responseCode?: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "AppError";
    this.code = params.code;
    this.status = params.status;
    this.responseCode = params.responseCode;
    this.details = params.details;
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
    const backendMsg = data?.message || ax.message;
    const responseCode = data?.responseCode;

    if (status === 400) {
      return new AppError({
        code: "BAD_REQUEST",
        message: friendlyMessage(status, backendMsg, responseCode),
        status,
        responseCode,
        details: data || ax.toJSON?.() || ax,
      });
    }
    if (status === 401) {
      return new AppError({
        code: "UNAUTHORIZED",
        message: "Your session has expired. Please sign in again.",
        status,
        responseCode,
        details: data || ax,
      });
    }
    if (status === 403) {
      return new AppError({
        code: "FORBIDDEN",
        message: "You don’t have permission to perform this action.",
        status,
        responseCode,
        details: data || ax,
      });
    }
    if (status === 404) {
      return new AppError({
        code: "NOT_FOUND",
        message: "We couldn’t find what you’re looking for.",
        status,
        responseCode,
        details: data || ax,
      });
    }
    if (status === 429) {
      return new AppError({
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again shortly.",
        status,
        responseCode,
        details: data || ax,
      });
    }
    if (status >= 500) {
      return new AppError({
        code: "SERVER",
        message: "Something went wrong on our side. Please try again.",
        status,
        responseCode,
        details: data || ax,
      });
    }

    // Unknown status
    return new AppError({
      code: "UNKNOWN",
      message: backendMsg || "An unexpected error occurred.",
      status,
      responseCode,
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
function friendlyMessage(status?: number, backendMsg?: string, responseCode?: string) {
  // Add specific mappings if your backend uses responseCode with meaning
  const map: Record<string, string> = {
    VAL_001: "Some fields are invalid. Please review and try again.",
    EMAIL_EXISTS: "This email is already registered.",
    USER_NOT_FOUND: "We couldn't find an account with that email.",
    INVALID_TOKEN: "The link appears to be invalid or expired.",
  };

  if (responseCode && map[responseCode]) return map[responseCode];
  if (status === 400) return backendMsg || "Invalid request. Please check your input.";
  return backendMsg || "Something went wrong.";
}

/** Safe user message for UI (never expose internals). */
export function getUserMessage(error: AppError): string {
  // Prefer canonical messages for known responseCodes
  if (error.responseCode) {
    const canon = friendlyMessage(error.status, undefined, error.responseCode);
    if (canon) return canon;
  }
  return error.message || "An unexpected error occurred.";
}
