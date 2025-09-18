import * as React from "react";
import { Dropdown } from "./dropdown";
import { ChevronDown, Check } from "lucide-react";
import { FormLabel } from "./input";
import { cn } from "../../utils/cn";

type Option = { value: string | number; label: string };

export interface MultiSelectProps {
  options: Option[];
  placeholder?: string;
  value?: Array<string | number>;
  onChange?: (value: Array<string | number>) => void;
  className?: string;
  label?: string;
  helper?: string;
  id?: string;
  hasError?: boolean;
  isValid?: boolean;
}

export function MultiSelect({
  options,
  placeholder = "Select options",
  value = [],
  onChange,
  className,
  label,
  helper,
  id,
  hasError,
  isValid,
}: MultiSelectProps) {
  const [internalValue, setInternalValue] = React.useState<Array<string | number>>(value);

  const uid = React.useId();
  const nativeId = id ?? `multiselect-${uid}`;
  const helperId = `${nativeId}-helper`;
  const errorId = `${nativeId}-error`;
  const describedBy =
    [helper ? helperId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined;

  // 🔧 Sync external value → internal
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const toggleOption = (val: string | number) => {
    let newValues: Array<string | number>;
    if (internalValue.includes(val)) {
      newValues = internalValue.filter((v) => v !== val);
    } else {
      newValues = [...internalValue, val];
    }
    setInternalValue(newValues);
    onChange?.(newValues);
  };

  const selectAll = () => {
    const allValues = options.map((o) => o.value);
    setInternalValue(allValues);
    onChange?.(allValues);
  };

  const clearAll = () => {
    setInternalValue([]);
    onChange?.([]);
  };

  const selectedLabels = options
    .filter((o) => internalValue.includes(o.value))
    .map((o) => o.label);

  return (
    <div>
      <FormLabel label={label} htmlFor={nativeId} isError={!!hasError} isValid={!!isValid} />

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
            <span className={cn(!selectedLabels.length && "text-muted")}>
              {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
          </button>
        </Dropdown.Trigger>

        <Dropdown.Content className="bg-card text-card-foreground">
          {/* --- Bulk Actions --- */}
          <Dropdown.Item
            onSelect={(e) => {
              e.preventDefault();
              selectAll();
            }}
            className="cursor-pointer font-medium text-primary"
          >
            Select All
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={(e) => {
              e.preventDefault();
              clearAll();
            }}
            className="cursor-pointer text-red-500"
          >
            Clear All
          </Dropdown.Item>
          <Dropdown.Separator />

          {/* --- Options --- */}
          {options.map((opt) => {
            const selected = internalValue.includes(opt.value);
            return (
              <Dropdown.Item
                key={opt.value}
                onSelect={(e) => {
                  e.preventDefault(); // prevent auto-close
                  toggleOption(opt.value);
                }}
                aria-checked={selected}
                role="menuitemcheckbox"
                className="flex items-center gap-2 cursor-pointer"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border",
                    selected ? "bg-primary text-white border-primary" : "border-input"
                  )}
                >
                  {selected && <Check size={12} />}
                </span>
                {opt.label}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Content>
      </Dropdown.Root>

      {/* 🔧 Hidden input for form support (comma-separated values) */}
      <input type="hidden" name={id} value={internalValue.join(",")} />

      {helper && (
        <p id={helperId} className={cn("mt-1 text-xs", hasError ? "text-red-600" : "text-muted")}>
          {helper}
        </p>
      )}
    </div>
  );
}
