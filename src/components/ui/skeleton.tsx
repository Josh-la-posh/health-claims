import { cn } from "../../utils/cn";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("animate-pulse rounded-md bg-border/60", className)} style={style} />;
}

export const SkeletonLine = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-4 w-full", className)} />
);

export const SkeletonAvatar = ({ size = 40 }: { size?: number }) => (
  <Skeleton className="rounded-full" style={{ width: size, height: size }} />
);

export const SkeletonCard = () => (
  <div className="rounded-xl border border-border p-4">
    <SkeletonLine className="mb-2 h-5 w-1/2" />
    <SkeletonLine className="mb-1 w-11/12" />
    <SkeletonLine className="w-10/12" />
  </div>
);
