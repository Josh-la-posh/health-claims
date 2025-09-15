import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../utils/cn";

export const Tabs = {
  Root: TabsPrimitive.Root,
  List: ({ className, ...p }: TabsPrimitive.TabsListProps) => (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-lg border border-border bg-card p-1",
        className
      )}
      {...p}
    />
  ),
  Trigger: ({ className, ...p }: TabsPrimitive.TabsTriggerProps) => (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 text-sm font-medium",
        "text-muted hover:text-card-foreground",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        "h-8 outline-none focus-visible:ring-4 focus-visible:ring-ring",
        className
      )}
      {...p}
    />
  ),
  Content: ({ className, ...p }: TabsPrimitive.TabsContentProps) => (
    <TabsPrimitive.Content className={cn("mt-3", className)} {...p} />
  ),
};
