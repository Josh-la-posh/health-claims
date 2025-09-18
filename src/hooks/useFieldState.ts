// src/hooks/useFieldControl.ts
import type { FieldErrors, FieldValues } from "react-hook-form";

export type FieldState = "default" | "error" | "valid";

interface FieldControl {
  state: FieldState;
  errorMessage?: string;
}

export function useFieldControl<T extends FieldValues>(
  name: keyof T,
  errors: FieldErrors<T>,
  touched: Partial<Record<keyof T, boolean>>,
  value: unknown
): FieldControl {
  if (errors[name]) {
    const msg =
      typeof errors[name]?.message === "string"
        ? (errors[name]?.message as string)
        : "Invalid value";
    return { state: "error", errorMessage: msg };
  }

  if (touched[name] && value) {
    return { state: "valid" };
  }

  return { state: "default" };
}