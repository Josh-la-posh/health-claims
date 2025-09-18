import * as React from "react";
import { useState } from "react";
import { Dropdown } from "./dropdown";
import { ChevronDown } from "lucide-react";
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
}

export function DropdownSelect({
  options,
  placeholder = "Select an option",
  value,
  onChange,
  className,
  label,
  helper,
  variant = "md",
  state = "default",
  id,
}: DropdownSelectProps) {
  const [internalValue, setInternalValue] = useState<string | number | undefined>(value);
  const uid = React.useId();
  const nativeId = id ?? `dropdown-${uid}`;
  const helperId = `${nativeId}-helper`;

  const selectedLabel = options.find((o) => o.value === internalValue)?.label;

  const sizeClass =
    variant === "sm"
      ? "h-9 text-sm"
      : variant === "lg"
      ? "h-11 text-base"
      : "h-10 text-sm";

  const stateClass = cn(
    state === "error" && "border-red-500 focus:ring-red-300",
    state === "valid" && "border-emerald-500 focus:ring-emerald-200",
    state === "disabled" && "border-input bg-muted cursor-not-allowed opacity-70",
    state === "default" && "border-input"
  );

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  return (
    <div>
      <FormLabel label={label} htmlFor={nativeId} isError={state === "error"} isValid={state === "valid"} />
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button
            id={nativeId}
            type="button"
            aria-invalid={state === "error" ? true : undefined}
            aria-describedby={helper ? helperId : undefined}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm",
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

        <Dropdown.Content className="bg-card text-card-foreground">
          {options.map((opt) => (
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
          ))}
        </Dropdown.Content>
      </Dropdown.Root>

      {/* 🔧 Hidden input for form support */}
      <input type="hidden" name={id} value={internalValue ?? ""} />

      {helper && (
        <p id={helperId} className={cn("mt-1 text-xs", state === "error" ? "text-red-600" : "text-muted")}>
          {helper}
        </p>
      )}
    </div>
  );
}

