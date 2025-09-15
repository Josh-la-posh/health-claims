import * as RT from "@radix-ui/react-tooltip";
import { cn } from "../../utils/cn";

export const Tooltip = {
  Provider: RT.Provider,
  Root: RT.Root,
  Trigger: RT.Trigger,
  Portal: RT.Portal,
  Content: ({ className, sideOffset = 6, ...p }: RT.TooltipContentProps) => (
    <RT.Portal>
      <RT.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-md border border-border bg-card px-2 py-1 text-xs text-card-foreground shadow-md",
          "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        {...p}
      />
    </RT.Portal>
  ),
  Arrow: (props: RT.TooltipArrowProps) => (
    <RT.Arrow className="fill-card stroke-border" {...props} />
  ),
};
