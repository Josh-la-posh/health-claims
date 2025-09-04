import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
export function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  errors?: Record<string, string>
) {
  if (!errors) return;
  Object.entries(errors).forEach(([name, message]) => {
    setError(name as Path<T>, { type: "server", message });
  });
}
