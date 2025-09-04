import * as React from "react";
import { useState } from "react";
import { Dropdown } from "./dropdown";
import { ChevronDown } from "lucide-react";
import { FormLabel } from "./input";
import { cn } from "../../utils/cn";

type Option = { value: string | number; label: string };

interface DropdownSelectProps {
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
      {title && <FormLabel title={title} htmlFor={nativeId} isError={!!hasError} isValid={!!isValid} />}

      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button
            id={nativeId}
            type="button"
            aria-invalid={hasError ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              `flex w-full items-center justify-between h-10 rounded-lg px-3 text-sm focus:outline-none focus:ring-2`,
              className,
              hasError ? "border-red-500 focus:ring-red-100" : isValid ? "border-green-400 focus:ring-green-100" : "border-border focus:ring-ring",
              "border"
            )}
          >
            <span>{selectedLabel || placeholder}</span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </button>
        </Dropdown.Trigger>

        <Dropdown.Content sideOffset={6} className="bg-bg text-fg border border-border">
          {options.map((opt) => (
            <Dropdown.Item
              key={opt.value}
              onSelect={() => {
                setInternalValue(opt.value);
                onChange?.(opt.value);
              }}
              className="cursor-pointer"
            >
              {opt.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown.Root>

      {helper && (
        <p id={helperId} className={cn("text-xs mt-1", hasError ? "text-red-600" : "text-gray-500")}>
          {helper}
        </p>
      )}
    </div>
  );
}
