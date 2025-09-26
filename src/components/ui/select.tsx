import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronUp, Check, Search } from "lucide-react";
import { cn } from "../../utils/cn";
import { FormLabel, FieldErrorText } from "./input";

export interface Option {
  value: string | number;
  label: string;
}

interface BaseProps {
  options: Option[];
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  disabled?: boolean;
  label?: string;
  helper?: string;
  state?: "default" | "error" | "valid" | "disabled";
  required?: boolean;
}

interface SingleSelectProps extends BaseProps {
  multiple?: false;
  value?: string | number;
  onChange?: (val: string | number) => void;
}

interface MultiSelectProps extends BaseProps {
  multiple: true;
  value: (string | number)[];
  onChange?: (val: (string | number)[]) => void;
}

type SelectProps = SingleSelectProps | MultiSelectProps;

export function Select(props: SelectProps) {
  if (props.multiple) return <MultiSelect {...props} />;
  return <SingleSelect {...props} />;
}

/* ---------------- SINGLE ---------------- */
function SingleSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  searchable = false,
  disabled = false,
  label,
  helper,
  state = "default",
  required,
}: SingleSelectProps) {
  const [query, setQuery] = React.useState("");
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );
  const isError = state === 'error';
  const isValid = state === 'valid';
  const selectId = React.useId();

  return (
    <div>
      <FormLabel label={label} required={required} isError={isError} isValid={isValid} htmlFor={selectId} />
      <RadixSelect.Root
        value={value?.toString()}
        onValueChange={(val) => {
          if (disabled) return;
            const selected = options.find((o) => o.value.toString() === val)?.value;
            if (selected !== undefined && onChange) {
              onChange(selected);
            }
        }}
      >
        <RadixSelect.Trigger
          id={selectId}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-md border border-border px-3 py-2 text-sm",
            "bg-bg text-fg",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            disabled && "opacity-50 cursor-not-allowed select-none",
            isError && "border-red-500 focus:ring-red-300",
            isValid && "border-emerald-500 focus:ring-emerald-200",
            className
          )}
          disabled={disabled}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </RadixSelect.Trigger>

        <RadixSelect.Content className={cn("z-50 bg-bg border border-border rounded-md shadow-md", disabled && "pointer-events-none")}>        
          {searchable && (
            <div className="flex items-center px-2 py-1 border-b border-border">
              <Search className="h-4 w-4 opacity-50 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Prevent Radix select internal key handling while typing / navigating within search box
                  if(['ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key)) {
                    e.stopPropagation();
                  }
                }}
                className="w-full bg-transparent outline-none text-sm"
                disabled={disabled}
              />
            </div>
          )}

          <RadixSelect.ScrollUpButton className="flex justify-center py-1">
            <ChevronUp className="h-4 w-4 opacity-50" />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="p-1 max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value.toString()}
                  className={cn(
                    "relative flex items-center rounded px-2 py-1.5 text-sm cursor-pointer select-none",
                    "focus:bg-primary/10 focus:outline-none"
                  )}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))
            ) : (
              <RadixSelect.Item
                disabled
                value="__no_results__"
                className="relative flex items-center rounded px-2 py-1.5 text-sm select-none text-muted cursor-default opacity-70"
              >
                <RadixSelect.ItemText>No results</RadixSelect.ItemText>
              </RadixSelect.Item>
            )}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="flex justify-center py-1">
            <ChevronDown className="h-4 w-4 opacity-50" />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Root>
      <FieldErrorText error={isError ? helper : undefined} className="mt-1" />
      {!isError && helper && <p className="mt-1 text-xs text-muted">{helper}</p>}
    </div>
  );
}

/* ---------------- MULTI ---------------- */
function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className,
  searchable = false,
  disabled = false,
  label,
  helper,
  state = "default",
  required,
}: MultiSelectProps) {
  const [query, setQuery] = React.useState("");
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const toggleValue = (val: string | number) => {
    if (!value) return onChange?.([val]);
    if (value.includes(val)) {
      onChange?.(value.filter((v) => v !== val));
    } else {
      onChange?.([...value, val]);
    }
  };

  const triggerLabel =
    value && value.length > 0 ? `${value.length} selected` : placeholder;

  const isError = state === 'error';
  const isValid = state === 'valid';
  return (
    <div>
      <FormLabel label={label} required={required} isError={isError} isValid={isValid} />
      <DropdownMenu.Root open={disabled ? false : undefined}>
        <DropdownMenu.Trigger
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between rounded-md border border-border px-3 h-12 text-sm",
            "bg-bg text-fg",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            disabled && "opacity-50 cursor-not-allowed select-none",
            isError && "border-red-500 focus:ring-red-300",
            isValid && "border-emerald-500 focus:ring-emerald-200",
            className
          )}
        >
          {triggerLabel}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          side="bottom"
          align="start"
          className={cn("z-50 bg-bg border border-border rounded-md shadow-md p-1 w-[220px]", disabled && "pointer-events-none")}
        >
        {searchable && (
          <div className="flex items-center px-2 py-1 border-b border-border">
            <Search className="h-4 w-4 opacity-50 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              disabled={disabled}
            />
          </div>
        )}

        <div className="max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <DropdownMenu.CheckboxItem
                key={opt.value}
                checked={value.includes(opt.value)}
                onCheckedChange={() => toggleValue(opt.value)}
                className={cn(
                  "relative flex items-center rounded px-2 py-1.5 text-sm cursor-pointer select-none",
                  "focus:bg-primary/10 focus:outline-none"
                )}
              >
                <span>{opt.label}</span>
                <DropdownMenu.ItemIndicator className="absolute right-2">
                  <Check className="h-4 w-4 text-primary" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.CheckboxItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted">No results</div>
          )}
        </div>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <FieldErrorText error={isError ? helper : undefined} className="mt-1" />
      {!isError && helper && <p className="mt-1 text-xs text-muted">{helper}</p>}
    </div>
  );
}
