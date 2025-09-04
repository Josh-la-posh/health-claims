import * as React from "react";
import { cn } from "../../utils/cn";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textSize?: "sm" | "md" | "lg";
  weight?: "normal" | "medium" | "semibold";
  colorClass?: string;
  title?: string;
  type?: string;
  minLength?: number;
  maxLength?: number;
  helper?: string;
  hasError?: boolean;
  isValid?: boolean;
  id?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, title, type, rightIcon, textSize = "md", weight="normal", colorClass, minLength, maxLength, helper, hasError, isValid, id, ...props }, ref) => {
    const sizeClass = textSize === "sm" ? "text-sm h-9" : textSize === "lg" ? "text-lg h-12" : "text-base h-10";
    const weightClass = weight === "medium" ? "font-medium" : weight === "semibold" ? "font-semibold" : "";
  const uid = React.useId();
  const nativeId = id ?? `input-${uid}`;
  const helperId = `${nativeId}-helper`;
  const errorId = `${nativeId}-error`;
    const describedBy = [props["aria-describedby"], helper ? helperId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined;
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : (type || "text");
    return (
      <div className="">
        <FormLabel htmlFor={nativeId} title={title} isError={!!hasError} isValid={!!isValid} />
        <div className={cn("relative", className)}>
          {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{leftIcon}</span>}
          <input
            ref={ref}
            type={inputType}
            maxLength={maxLength}
            minLength={minLength}
            id={nativeId}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "w-full rounded-lg border text-card-foreground placeholder:text-muted",
              "focus:outline-none focus:ring-2",
              sizeClass, weightClass, colorClass,
              leftIcon && "pl-10", (rightIcon || isPassword) && "pr-10",
              hasError ? "border-red-500 focus:ring-red-100" : isValid ? "border-green-400 focus:ring-green-100" : "border-border focus:ring-ring"
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 p-1 rounded"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : (
            rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{rightIcon}</span>
          )}
        </div>
        {helper && (
          <p id={helperId} className={cn("text-xs mt-1", hasError ? "text-red-600" : "text-gray-500")}>
            {helper}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";


export const FormLabel = ({title, isValid, isError, htmlFor}: {title?: string; isValid?: boolean; isError?: boolean; htmlFor?: string}) => {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-2 mb-1">
      {isValid && <CheckCircle size={16} className="text-green-500" />}
      {isError && <XCircle size={16} className="text-red-500" />}
      <span className="text-sm font-semibold">{title}</span>
    </label>
  )
}