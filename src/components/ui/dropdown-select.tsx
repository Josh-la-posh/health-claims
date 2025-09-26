import * as React from "react";
import { useState } from "react";
import { Dropdown } from "./dropdown";
import { ChevronDown, Search } from "lucide-react";
import { FormLabel } from "./input";
import { cn } from "../../utils/cn";

type Option = { value: string | number; label: string };
type State = "default" | "error" | "valid" | "disabled";
type Variant = "sm" | "md" | "lg";

export interface DropdownSelectProps {
  options: Option[];
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;
  label?: string;
  helper?: string;
  id?: string;
  variant?: Variant;
  state?: State;
  searchable?: boolean;
}

export function DropdownSelect({
  options,
  placeholder = "Select an option",
  value,
  onChange,
  className,
  label,
  helper,
  variant = "lg",
  state = "default",
  id,
  searchable = false,
}: DropdownSelectProps) {
  const [internalValue, setInternalValue] = useState<string | number | undefined>(value);
  const [query, setQuery] = useState("");
  const uid = React.useId();
  const nativeId = id ?? `dropdown-${uid}`;
  const helperId = `${nativeId}-helper`;

  const selectedLabel = options.find((o) => o.value === internalValue)?.label;

  const sizeClass =
    variant === "sm"
      ? "h-10 text-sm"
      : variant === "lg"
      ? "h-12 text-base"
      : "h-11 text-sm";

  const stateClass = cn(
    state === "error" && "border-red-500 focus:ring-red-300",
    state === "valid" && "border-emerald-500 focus:ring-emerald-200",
    state === "disabled" && "border-input bg-muted cursor-not-allowed opacity-70",
    state === "default" && "border-input"
  );

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  const filtered = searchable
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  return (
    <div>
      <FormLabel
        label={label}
        htmlFor={nativeId}
        isError={state === "error"}
        isValid={state === "valid"}
      />

      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button
            id={nativeId}
            type="button"
            aria-invalid={state === "error" ? true : undefined}
            aria-describedby={helper ? helperId : undefined}
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-lg border px-3 text-sm",
              "bg-card text-card-foreground placeholder:text-muted",
              "focus:outline-none focus:ring-4 focus:ring-ring",
              sizeClass,
              stateClass,
              className
            )}
          >
            <span className={cn(!selectedLabel && "text-muted")}>
              {selectedLabel || placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
          </button>
        </Dropdown.Trigger>

        <Dropdown.Content
          className="bg-card text-card-foreground max-h-60 overflow-y-auto"
        >
          {searchable && (
            <div className="flex items-center gap-2 px-2 py-1 border-b border-border sticky top-0 bg-card">
              <Search className="h-4 w-4 opacity-60" />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          )}

          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <Dropdown.Item
                key={opt.value}
                onSelect={() => {
                  setInternalValue(opt.value);
                  onChange?.(opt.value);
                }}
                aria-selected={internalValue === opt.value}
                className={cn(
                  "cursor-pointer",
                  internalValue === opt.value && "bg-primary/10"
                )}
              >
                {opt.label}
              </Dropdown.Item>
            ))
          ) : (
            <div className="px-2 py-1 text-sm text-muted">No results</div>
          )}
        </Dropdown.Content>
      </Dropdown.Root>

      {/* 🔧 Hidden input for form support */}
      <input type="hidden" name={id} value={internalValue ?? ""} />

      {helper && (
        <p
          id={helperId}
          className={cn(
            "mt-1 text-xs",
            state === "error" ? "text-red-600" : "text-muted"
          )}
        >
          {helper}
        </p>
      )}
    </div>
  );
}