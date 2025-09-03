import * as React from "react";
import { cn } from "../../utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textSize?: "sm" | "md" | "lg";
  weight?: "normal" | "medium" | "semibold";
  colorClass?: string;
  title?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, title, rightIcon, textSize = "md", weight="normal", colorClass, ...props }, ref) => {
    const sizeClass = textSize === "sm" ? "text-sm h-9" : textSize === "lg" ? "text-lg h-12" : "text-base h-10";
    const weightClass = weight === "medium" ? "font-medium" : weight === "semibold" ? "font-semibold" : "";
    return (
      <div className="">
        <FormLabel title={title}/>
        <div className={cn("relative", className)}>
          {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{leftIcon}</span>}
          <input
            ref={ref}
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
      </div>
    );
  }
);
Input.displayName = "Input";


export const FormLabel = ({title}: {title?: string}) => {
  return (
    <p className="text-sm font-semibold mb-1">{title}</p>
  )
}