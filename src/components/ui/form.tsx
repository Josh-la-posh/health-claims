import type { FieldError } from "react-hook-form";

export const FieldErrorText = ({ error }: { error?: FieldError }) =>
  error ? <p className="text-sm text-red-600 mt-1">{error.message}</p> : null;
