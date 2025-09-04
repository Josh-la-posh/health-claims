import * as React from "react";
import { cn } from "../../utils/cn";
import { CheckCircle, XCircle } from "lucide-react";

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
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, title, type, rightIcon, textSize = "md", weight="normal", colorClass, minLength, maxLength, helper, hasError, isValid, ...props }, ref) => {
    const sizeClass = textSize === "sm" ? "text-sm h-9" : textSize === "lg" ? "text-lg h-12" : "text-base h-10";
    const weightClass = weight === "medium" ? "font-medium" : weight === "semibold" ? "font-semibold" : "";
    return (
      <div className="">
        <FormLabel title={title} isError={!!hasError} isValid={!!isValid} />
        <div className={cn("relative", className)}>
          {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{leftIcon}</span>}
          <input
            ref={ref}
            type={type || "text"}
            maxLength={maxLength}
            minLength={minLength}
            className={cn(
              "w-full rounded-lg border border-border text-card-foreground placeholder:text-muted",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              sizeClass, weightClass, colorClass,
              leftIcon && "pl-10", rightIcon && "pr-10"
            )}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{rightIcon}</span>}
        </div>
        {helper && (
          <p className={cn("text-xs mt-1", hasError ? "text-red-600" : "text-gray-500")}>
            {helper}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";


export const FormLabel = ({title, isValid, isError}: {title?: string; isValid?: boolean; isError?: boolean}) => {
  return (
    <div className="flex items-center gap-2 mb-1">
      {isValid && <CheckCircle size={16} className="text-green-500" />}
      {isError && <XCircle size={16} className="text-red-500" />}
      <p className="text-sm font-semibold">{title}</p>
    </div>
  )
}