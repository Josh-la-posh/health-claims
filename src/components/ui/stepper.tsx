import * as React from "react";
import { cn } from "../../utils/cn";

export type Step = {
  id: string;
  title: string;
  description?: string;
  disabled?: boolean;
};

export interface StepperProps {
  steps: Step[];
  active?: number;               // controlled
  defaultActive?: number;        // uncontrolled
  onChange?: (index: number) => void;
  clickable?: boolean;
  className?: string;
}

export function Stepper({
  steps,
  active,
  defaultActive = 0,
  onChange,
  clickable = true,
  className,
}: StepperProps) {
  const [internal, setInternal] = React.useState(defaultActive);
  const current = active ?? internal;

  const go = (i: number) => {
    if (i < 0 || i >= steps.length) return;
    if (steps[i]?.disabled) return;
    if (active === undefined) setInternal(i);
    onChange?.(i);
  };

  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress line */}
      <div className="relative mb-4">
        <div className="h-1 w-full rounded bg-border" />
        <div
          className="absolute left-0 top-0 h-1 rounded bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      <ol className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {steps.map((s, i) => {
          const state = i < current ? "complete" : i === current ? "current" : "upcoming";
          const col = Math.floor(12 / steps.length);
          const badge =
            state === "complete"
              ? "bg-emerald-600 text-white"
              : state === "current"
              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
              : "bg-card text-muted border border-border";

        return (
          <li
            key={s.id}
            className={cn("md:col-span-" + col, "rounded-lg border border-border p-3")}
          >
            <button
              type="button"
              className={cn(
                "flex items-center gap-3 w-full text-left outline-none",
                clickable && !s.disabled ? "hover:bg-border/40 rounded-md p-1 -m-1" : ""
              )}
              onClick={() => clickable && go(i)}
              disabled={s.disabled}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                  badge
                )}
              >
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-medium">{s.title}</div>
                {s.description && <div className="text-xs text-muted">{s.description}</div>}
              </div>
            </button>
          </li>
        );})}
      </ol>

      {/* Controls (optional; use externally if you prefer) */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-border/40 disabled:opacity-50"
          onClick={() => go(current - 1)}
          disabled={current <= 0}
        >
          Back
        </button>
        <button
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-border/40 disabled:opacity-50"
          onClick={() => go(current + 1)}
          disabled={current >= steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
