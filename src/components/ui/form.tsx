import type { FieldError } from "react-hook-form";

export const FieldErrorText = ({ error, id }: { error?: FieldError; id?: string }) =>
  error ? <p id={id} className="text-sm text-red-600 mt-1">{error.message}</p> : null;
