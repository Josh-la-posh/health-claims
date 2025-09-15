import * as RHC from "@radix-ui/react-hover-card";
import { cn } from "../../utils/cn";

export const HoverCard = {
  Root: RHC.Root,
  Trigger: RHC.Trigger,
  Portal: RHC.Portal,
  Content: ({ className, sideOffset = 8, ...p }: RHC.HoverCardContentProps) => (
    <RHC.Portal>
      <RHC.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-80 rounded-lg border border-border bg-card p-3 text-sm text-card-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        {...p}
      />
    </RHC.Portal>
  ),
  Arrow: (props: RHC.HoverCardArrowProps) => (
    <RHC.Arrow className="fill-card stroke-border" {...props} />
  ),
};
