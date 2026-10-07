import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "NETWORK_ERROR"
  | "SESSION_EXPIRED"
  | "UNEXPECTED_ERROR";

export interface AuthErrorDisplay {
  code: AuthErrorCode;
  message: string;
}

/**
 * Maps raw Supabase error messages into safe, sanitized user-facing messages.
 * Prevents leaking raw internal stack traces, DB details, or JWT contents.
 */
export function sanitizeAuthError(error: unknown): AuthErrorDisplay {
  if (!error || typeof error !== "object") {
    return {
      code: "UNEXPECTED_ERROR",
      message: "Something went wrong. Please try again.",
    };
  }

  const err = error as { message?: string; status?: number; name?: string };
  const rawMsg = (err.message || "").toLowerCase();

  if (
    rawMsg.includes("invalid login credentials") ||
    rawMsg.includes("invalid_grant") ||
    rawMsg.includes("invalid email or password") ||
    err.status === 400
  ) {
    return {
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

  if (
    rawMsg.includes("failed to fetch") ||
    rawMsg.includes("network") ||
    rawMsg.includes("fetch failed") ||
    rawMsg.includes("abort") ||
    err.name === "AuthRetryableFetchError"
  ) {
    return {
      code: "NETWORK_ERROR",
      message: "Unable to reach the authentication service. Try again.",
    };
  }

  if (rawMsg.includes("expired") || rawMsg.includes("token")) {
    return {
      code: "SESSION_EXPIRED",
      message: "Your session has expired. Please sign in again.",
    };
  }

  return {
    code: "UNEXPECTED_ERROR",
    message: "Something went wrong. Please try again.",
  };
}
