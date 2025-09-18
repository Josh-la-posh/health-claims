import { cn } from "../../utils/cn";

export function H1({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("text-2xl font-semibold tracking-tight md:text-4xl", className)} {...p} />;
}
export function H2({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-xl font-semibold tracking-tight md:text-3xl", className)} {...p} />;
}
export function H3({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold tracking-tight md:text-2xl", className)} {...p} />;
}
export function H4({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("text-md font-medium tracking-tight md:text-xl", className)} {...p} />;
}

export function Lead({ className, ...p }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-base md:text-lg text-muted", className)} {...p} />;
}
export function P({ className, ...p }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm md:text-base", className)} {...p} />;
}
export function Muted({ className, ...p }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted", className)} {...p} />;
}
export function Small({ className, ...p }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("text-xs text-muted", className)} {...p} />;
}
export function Kbd({ className, ...p }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px] font-medium",
        className
      )}
      {...p}
    />
  );
}
export function Code({ className, ...p }: React.HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      className={cn(
        "rounded-lg border border-border bg-card p-3 text-xs overflow-x-auto",
        className
      )}
      {...p}
    />
  );
}
