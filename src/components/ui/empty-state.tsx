import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  loading?: boolean;
  /** Optional secondary action (e.g. upload CSV) */
  secondaryAction?: ReactNode;
}

/**
 * Generic empty state component for when a list/data set fetches successfully but returns an empty array.
 * Provides a consistent centered baseline UX across pages.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  loading,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start max-w-sm mx-auto text-left py-16",
        className
      )}
      data-testid="empty-state"
    >
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-base font-medium mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && (
        <div className="flex items-center gap-3">
          <Button onClick={onAction} disabled={loading} size="sm">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionLabel}
          </Button>
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
