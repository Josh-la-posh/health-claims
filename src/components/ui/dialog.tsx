import * as React from "react";
import * as RD from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export const Dialog = {
  Root: RD.Root,
  Trigger: RD.Trigger,
  Close: RD.Close,
  Portal: RD.Portal,
  Overlay: ({ className, ...p }: RD.DialogOverlayProps) => (
    <RD.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        className
      )}
      {...p}
    />
  ),
  Content: ({ className, children, ...p }: RD.DialogContentProps) => (
    <RD.Portal>
      <Dialog.Overlay />
      <RD.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2",
          "rounded-xl border border-border bg-card text-card-foreground shadow-lg outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        {...p}
      >
        {children}
        <RD.Close
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-border/60 focus:outline-none focus:ring-4 focus:ring-ring"
          aria-label="Close"
        >
          <X className="size-4" />
        </RD.Close>
      </RD.Content>
    </RD.Portal>
  ),
  Header: ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("border-b border-border px-4 py-3", className)} {...p} />
  ),
  Title: ({ className, ...p }: RD.DialogTitleProps) => (
    <RD.Title className={cn("text-lg font-semibold", className)} {...p} />
  ),
  Description: ({ className, ...p }: RD.DialogDescriptionProps) => (
    <RD.Description className={cn("text-sm text-muted", className)} {...p} />
  ),
  Body: ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("px-4 py-3", className)} {...p} />
  ),
  Footer: ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex items-center justify-end gap-2 border-t border-border px-4 py-3", className)} {...p} />
  ),
};
