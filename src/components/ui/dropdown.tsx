import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "../../utils/cn";

export const Dropdown = {
  Root: DropdownMenu.Root,
  Trigger: DropdownMenu.Trigger,
  Content: ({ className, ...props }: DropdownMenu.DropdownMenuContentProps) => (
    <DropdownMenu.Content
      className={cn("min-w-[180px] rounded-md border border-card p-1 shadow-md", className)}
      {...props}
    />
  ),
  Item: ({ className, ...props }: DropdownMenu.DropdownMenuItemProps) => (
    <DropdownMenu.Item className={cn("px-2 py-1.5 rounded hover:bg-primary/10", className)} {...props} />
  ),
  Separator: () => <DropdownMenu.Separator className="h-px bg-bg my-1" />,
};
