import { cn } from "../../utils/cn";
export function Muted({ children, className }: any) {
  return <p className={cn("text-sm text-gray-500", className)}>{children}</p>;
}
