import * as React from "react";
import { cn } from "../../utils/cn";

type Variant = "default" | "success" | "warning" | "destructive" | "outline" | "secondary";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  rounded?: "md" | "full";
}

const styles: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground",
  success: "bg-emerald-600 text-white",
  warning: "bg-amber-500 text-black",
  destructive: "bg-red-600 text-white",
  outline: "border border-border text-card-foreground",
  secondary: "bg-card text-card-foreground border border-border",
};

export function Badge({ className, variant = "secondary", rounded = "md", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium",
        rounded === "full" ? "rounded-full" : "rounded-md",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
