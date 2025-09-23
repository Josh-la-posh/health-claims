import * as React from "react";
import * as RD from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../..//utils/cn";

type Side = "left" | "right" | "top" | "bottom";
type Size = "sm" | "md" | "lg" | "full";
// NEW: allow optional mobile overrides
type ResponsiveSide = Side;
type ResponsiveSize = Size;

function sideClasses(side: Side) {
  switch (side) {
    case "left": return "left-0 top-0 h-full translate-x-[-100%] data-[state=open]:translate-x-0";
    case "right": return "right-0 top-0 h-full translate-x-[100%] data-[state=open]:translate-x-0";
    case "top": return "left-0 top-0 w-full -translate-y-full data-[state=open]:translate-y-0";
    case "bottom": return "left-0 bottom-0 w-full translate-y-full data-[state=open]:translate-y-0";
  }
}

function sizeClasses(side: Side, size: Size) {
  const map = {
    sm: "max-w-[360px]",
    md: "max-w-[480px]",
    lg: "max-w-[720px]",
    full: "max-w-none",
  } as const;

  if (side === "left" || side === "right") {
    return cn("w-[90vw]", size === "full" ? "w-screen" : map[size]);
  }
  const hmap = {
    sm: "max-h-[40vh]",
    md: "max-h-[65vh]",
    lg: "max-h-[85vh]",
    full: "max-h-none h-screen",
  } as const;
  return cn("h-[90vh]", size === "full" ? "h-screen" : hmap[size]);
}

export const Drawer = {
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
  Content: ({
    side = "right",
    size = "md",
    sideMobile,
    sizeMobile,
    fullBleed = false,
    className,
    children,
    ...p
  }: RD.DialogContentProps & {
    side?: Side;
    size?: Size;
    sideMobile?: ResponsiveSide;
    sizeMobile?: ResponsiveSize;
    fullBleed?: boolean;
  }) => {
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
      const mq = window.matchMedia("(max-width: 767px)");
      const handler = () => setIsMobile(mq.matches);
      handler();
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }, []);

    const resolvedSide = isMobile && sideMobile ? sideMobile : side;
    const resolvedSize = isMobile && sizeMobile ? sizeMobile : size;

    return (
      <RD.Portal>
        <Drawer.Overlay />
        <RD.Content
          className={cn(
            "fixed z-50 bg-card text-card-foreground shadow-xl outline-none border border-border",
            "data-[state=open]:transition-transform data-[state=closed]:transition-transform",
            "will-change-transform",
            sideClasses(resolvedSide),
            sizeClasses(resolvedSide, resolvedSize),
            fullBleed && "w-screen max-w-none h-auto !max-h-none",
            resolvedSide === "bottom" && fullBleed && "rounded-t-xl",
            resolvedSide === "top" && fullBleed && "rounded-b-xl",
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
    );
  },
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
    <div className={cn("flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3", className)} {...p} />
  ),
};
