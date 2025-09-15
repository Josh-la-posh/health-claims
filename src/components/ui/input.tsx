import * as React from "react";
import { cn } from "../../utils/cn";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

type TextSize = "sm" | "md" | "lg";
type Weight = "normal" | "medium" | "semibold";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textSize?: TextSize;
  weight?: Weight;
  colorClass?: string;
  title?: string;
  helper?: string;
  hasError?: boolean;
  isValid?: boolean;
  id?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      leftIcon,
      rightIcon,
      textSize = "md",
      weight = "normal",
      colorClass,
      title,
      type,
      minLength,
      maxLength,
      helper,
      hasError,
      isValid,
      id,
      ...props
    },
    ref
  ) => {
    const sizeClass =
      textSize === "sm" ? "text-sm h-9" : textSize === "lg" ? "text-base h-11" : "text-sm h-10";
    const weightClass = weight === "medium" ? "font-medium" : weight === "semibold" ? "font-semibold" : "";

    const uid = React.useId();
    const nativeId = id ?? `input-${uid}`;
    const helperId = `${nativeId}-helper`;
    const errorId = `${nativeId}-error`;
    const describedBy =
      [props["aria-describedby"], helper ? helperId : null, hasError ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type || "text";

    return (
      <div>
        <FormLabel htmlFor={nativeId} title={title} isError={!!hasError} isValid={!!isValid} />

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
            maxLength={maxLength}
            minLength={minLength}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              // base
              "w-full rounded-lg border bg-card text-card-foreground placeholder:text-muted",
              // spacing / icons
              "px-3 focus:outline-none focus:ring-4",
              leftIcon ? "pl-10" : undefined,
              (rightIcon || isPassword) ? "pr-10" : undefined,
              // focus ring color
              "focus:ring-ring",
              // state colors
              hasError
                ? "border-red-500 focus:ring-red-300"
                : isValid
                ? "border-emerald-500 focus:ring-emerald-200"
                : "border-input",
              // sizes & weights
              sizeClass,
              weightClass,
              colorClass
            )}
            {...props}
          />

          {/* Right adornment */}
          {isPassword ? (
            <button
              type="button"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
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
          <p
            id={helperId}
            className={cn("mt-1 text-xs", hasError ? "text-red-600" : "text-muted")}
          >
            {helper}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export function FormLabel({
  title,
  isValid,
  isError,
  htmlFor,
}: {
  title?: string;
  isValid?: boolean;
  isError?: boolean;
  htmlFor?: string;
}) {
  if (!title) return null;
  return (
    <label htmlFor={htmlFor} className="mb-1 flex items-center gap-2">
      {isValid && <CheckCircle size={16} className="text-emerald-600" />}
      {isError && <XCircle size={16} className="text-red-600" />}
      <span className="text-sm font-medium">{title}</span>
    </label>
  );
}
