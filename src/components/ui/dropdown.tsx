import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "../../utils/cn";

export const Dropdown = {
  Root: DropdownMenu.Root,
  Trigger: DropdownMenu.Trigger,
  Portal: DropdownMenu.Portal,

  Content: ({ className, sideOffset = 8, ...props }: DropdownMenu.DropdownMenuContentProps) => (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[180px] max-h-64 overflow-y-auto rounded-md border border-border bg-card p-1 text-sm shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        {...props}
      />
    </DropdownMenu.Portal>
  ),

  Label: ({ className, ...props }: DropdownMenu.DropdownMenuLabelProps) => (
    <DropdownMenu.Label className={cn("px-2 py-1.5 text-xs text-muted", className)} {...props} />
  ),

  Item: ({ className, ...props }: DropdownMenu.DropdownMenuItemProps) => (
    <DropdownMenu.Item
      className={cn(
        "flex select-none items-center gap-2 rounded px-2 py-1.5 outline-none",
        "cursor-pointer data-[disabled]:cursor-not-allowed",
        "hover:bg-primary/10 data-[highlighted]:bg-primary/10",
        "data-[disabled]:opacity-60",
        className
      )}
      {...props}
    />
  ),

  Separator: () => <DropdownMenu.Separator className="my-1 h-px bg-border" />,
};
