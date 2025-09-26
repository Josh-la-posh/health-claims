import type { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "../../utils/cn";
import { SearchX } from "lucide-react";

export interface NoResultsStateProps {
  query?: string;
  onReset?: () => void; // e.g. clear filters / search
  className?: string;
  icon?: ReactNode;
  title?: string;
  description?: string;
  showReset?: boolean;
  resetLabel?: string;
}

/**
 * Displayed when a previously non-empty dataset has zero visible rows due to filters/search.
 * Distinct from EmptyState which represents an actually empty underlying dataset.
 */
export function NoResultsState({
  query,
  onReset,
  className,
  icon,
  title = "No matching results",
  description = query
    ? `We couldn't find anything for "${query}". Try adjusting your search or filters.`
    : "Try adjusting or clearing your filters to see results.",
  showReset = true,
  resetLabel = "Reset filters",
}: NoResultsStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start max-w-sm mx-auto text-left py-10",
        className
      )}
      data-testid="no-results-state"
    >
      <div className="mb-4 text-muted-foreground">
        {icon || <SearchX className="h-8 w-8" />}
      </div>
      <h3 className="text-base font-medium mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {showReset && onReset && (
        <Button variant="outline" onClick={onReset}>
          {resetLabel}
        </Button>
      )}
    </div>
  );
}
