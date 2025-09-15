import * as React from "react";
import { useState } from "react";
import { Dropdown } from "./dropdown";
import { ChevronDown } from "lucide-react";
import { FormLabel } from "./input";
import { cn } from "../../utils/cn";

type Option = { value: string | number; label: string };

export interface DropdownSelectProps {
  options: Option[];
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;
  title?: string;
  helper?: string;
  id?: string;
  hasError?: boolean;
  isValid?: boolean;
}

export function DropdownSelect({
  options,
  placeholder = "Select an option",
  value,
  onChange,
  className,
  title,
  helper,
  id,
  hasError,
  isValid,
}: DropdownSelectProps) {
  const [internalValue, setInternalValue] = useState<string | number | undefined>(value);
  const uid = React.useId();
  const nativeId = id ?? `dropdown-${uid}`;
  const helperId = `${nativeId}-helper`;
  const errorId = `${nativeId}-error`;
  const describedBy = [helper ? helperId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined;

  const selectedLabel = options.find((o) => o.value === internalValue)?.label;

  return (
    <div>
      <FormLabel title={title} htmlFor={nativeId} isError={!!hasError} isValid={!!isValid} />

      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button
            id={nativeId}
            type="button"
            aria-invalid={hasError ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm",
              "bg-card text-card-foreground placeholder:text-muted",
              "focus:outline-none focus:ring-4 focus:ring-ring",
              hasError
                ? "border-red-500 focus:ring-red-300"
                : isValid
                ? "border-emerald-500 focus:ring-emerald-200"
                : "border-input",
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

      {helper && (
        <p id={helperId} className={cn("mt-1 text-xs", hasError ? "text-red-600" : "text-muted")}>
          {helper}
        </p>
      )}
    </div>
  );
}
