import { cn } from "../../utils/cn";

export function H1({ children, className }: any) {
  return <h1 className={cn("text-2xl font-semibold tracking-tight", className)}>{children}</h1>;
}
export function H2({ children, className }: any) {
  return <h2 className={cn("text-xl font-semibold tracking-tight", className)}>{children}</h2>;
}
