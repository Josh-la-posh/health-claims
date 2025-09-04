import { useState } from "react";
import { Dropdown } from "./dropdown";
import { ChevronDown } from "lucide-react";

type Option = { value: string | number; label: string };

interface DropdownSelectProps {
  options: Option[];
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;
}

export function DropdownSelect({
  options,
  placeholder = "Select an option",
  value,
  onChange,
  className,
}: DropdownSelectProps) {
  const [internalValue, setInternalValue] = useState<string | number | undefined>(value);

  const selectedLabel = options.find((o) => o.value === internalValue)?.label;

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          type="button"
          className={`flex w-full items-center justify-between h-10 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${className} border border-border`}
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
  );
}
