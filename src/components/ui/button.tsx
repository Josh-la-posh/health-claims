import * as React from "react";
import { cn } from "../../utils/cn";
import Loader from "./loader";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "outline" | "edit" | "add";
type Size = "sm" | "md" | "lg" | "icon" | "addCombo"; // addCombo: circular leading icon + text pill

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-4 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:brightness-110",
  secondary: "bg-card text-card-foreground border border-border hover:bg-border/40",
  ghost: "bg-transparent hover:bg-border/40",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-border bg-transparent hover:bg-border/40",
  edit: "bg-[#E4F7F0] text-primary hover:bg-[#d2f0e6]",
  add: "bg-primary text-primary-foreground hover:brightness-110 rounded-full",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11 p-0",
  addCombo: "h-11 pl-2 pr-5 text-sm", // will enhance with internal circle
};

const loaderSizes: Record<Exclude<Size, 'icon' | 'addCombo'>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
  { className, variant = "primary", size = "lg", leftIcon, rightIcon, isLoading, loadingText, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            {size !== 'icon' && size !== 'addCombo' && <Loader size={loaderSizes[(size as Exclude<Size,'icon' | 'addCombo'>)]} className="text-current" />}
            {loadingText ?? children ?? null}
          </span>
        ) : (
          <>
            {leftIcon && size !== 'addCombo' && <span className="shrink-0">{leftIcon}</span>}
            {size === 'addCombo' && (
              <span className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-white/15">
                {leftIcon}
              </span>
            )}
            <span className={cn(size === 'addCombo' && 'pl-1 font-medium')}>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
