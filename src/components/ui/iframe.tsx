import * as React from "react";
import { cn } from "../../utils/cn";

export interface IFrameProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  aspect?: "16/9" | "4/3" | "1/1" | "auto";
  height?: number; // px; ignored if aspect !== "auto"
}

export function IFrame({
  className,
  aspect = "16/9",
  height,
  title = "Embedded content",
  sandbox = "allow-scripts allow-same-origin allow-forms",
  allow = "clipboard-read; clipboard-write; fullscreen; geolocation",
  ...props
}: IFrameProps) {
  if (aspect === "auto") {
    return (
      <iframe
        title={title}
        sandbox={sandbox}
        allow={allow}
        height={height || 400}
        className={cn("w-full rounded-lg border border-border bg-card", className)}
        {...props}
      />
    );
  }

  // aspect-ratio container
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-border bg-card",
        aspect === "16/9" && "aspect-[16/9]",
        aspect === "4/3" && "aspect-[4/3]",
        aspect === "1/1" && "aspect-square",
        className
      )}
    >
      <iframe
        title={title}
        sandbox={sandbox}
        allow={allow}
        className="absolute inset-0 h-full w-full"
        {...props}
      />
    </div>
  );
}
