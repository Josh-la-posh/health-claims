// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "../../utils/cn";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

type Variant = "sm" | "md" | "lg";
type State = "default" | "error" | "valid" | "disabled";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helper?: string;
  variant?: Variant;
  state?: State;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      leftIcon,
      rightIcon,
      label,
      helper,
      type,
      variant = "md",
      state = "default",
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type || "text";

    const uid = React.useId();
    const nativeId = id ?? `input-${uid}`;
    const helperId = `${nativeId}-helper`;

    const sizeClass =
      variant === "sm"
        ? "h-9 text-sm"
        : variant === "lg"
        ? "h-11 text-base"
        : "h-10 text-sm";

    const stateClass = cn(
      state === "error" && "border-red-500 focus:ring-red-300",
      state === "valid" && "border-emerald-500 focus:ring-emerald-200",
      state === "disabled" && "border-input bg-muted cursor-not-allowed opacity-70",
      state === "default" && "border-input"
    );

    return (
      <div>
        <FormLabel label={label} htmlFor={nativeId} isError={state === "error"} isValid={state === "valid"} />

        <div className={cn("relative", className)}>
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-muted">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={nativeId}
            type={inputType}
            aria-invalid={state === "error" ? true : undefined}
            aria-describedby={helper ? helperId : undefined}
            disabled={state === "disabled"}
            className={cn(
              "w-full rounded-lg border bg-card text-card-foreground placeholder:text-muted",
              "px-3 focus:outline-none focus:ring-4 focus:ring-ring",
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              sizeClass,
              stateClass
            )}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(v => !v)}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : (
            rightIcon && (
              <span className="pointer-events-none absolute inset-y-0 right-0 grid w-10 place-items-center text-muted">
                {rightIcon}
              </span>
            )
          )}
        </div>

        {helper && (
          <p id={helperId} className={cn("mt-1 text-xs", state === "error" ? "text-red-600" : "text-muted")}>
            {helper}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

/* ------------ Restored export: FormLabel ------------- */
export function FormLabel({
  label,
  isValid,
  isError,
  htmlFor,
  required,
  className,
  rightSlot,
}: {
  label?: string;
  isValid?: boolean;
  isError?: boolean;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  rightSlot?: React.ReactNode; // e.g. badge, helper action
}) {
  if (!label) return null;
  return (
    <label htmlFor={htmlFor} className={cn("mb-1 flex items-center justify-between", className)}>
      <span className="flex items-center gap-2">
        {isValid && <CheckCircle size={16} className="text-emerald-600" />}
        {isError && <XCircle size={16} className="text-red-600" />}
        <span className="text-sm font-medium">
          {label} {required && <span className="text-red-600">*</span>}
        </span>
      </span>
      {rightSlot}
    </label>
  );
}

/* ------------ Optional helper for RHF/string errors ------------- */
export function FieldErrorText({
  error,
  className,
  id,
}: {
  error?: unknown;
  className?: string;
  id?: string;
}) {
  if (!error) return null;
  const msg =
    typeof error === "string"
      ? error
      : (error as { message?: unknown })?.message
      ? String((error as { message?: unknown }).message)
      : String(error);
  return (
    <p id={id} className={cn("mt-1 text-xs text-red-600", className)}>
      {msg}
    </p>
  );
}
