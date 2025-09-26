import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { FormLabel, FieldErrorText } from './input';

export interface DialCodeCountry {
  name: string;
  alpha2: string;
  dailingCodes: string[]; // Note: "dailing" matches backend spelling
}

export interface PhoneInputWithDialCodeProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string; // full value including dial code
  onChange?: (fullValue: string) => void;
  countries: DialCodeCountry[];
  label?: string;
  helper?: string;
  state?: 'default' | 'error' | 'valid' | 'disabled';
  required?: boolean;
  preferredCountryCodes?: string[]; // e.g. ['NG','US'] to reorder at top
  searchable?: boolean;
  maxLocalLength?: number;
}

/*
  Controlled component that stores dial code + local number separately internally but emits combined string to parent.
  Expected combined format: "+<dial><digits>" (no spaces). Sanitizes local number to digits only.
*/
export const PhoneInputWithDialCode: React.FC<PhoneInputWithDialCodeProps> = ({
  value,
  onChange,
  countries,
  label = 'Phone Number',
  helper,
  state = 'default',
  required,
  disabled,
  preferredCountryCodes = ['NG'],
  searchable = true,
  maxLocalLength = 20,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dialCode, setDialCode] = useState<string>('');
  const [localNumber, setLocalNumber] = useState<string>('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isError = state === 'error';
  const isValid = state === 'valid';

  // Derive initial dial + local from external value once
  useEffect(() => {
    if (!value) return;
    // Only hydrate if we haven't already set a dial code locally
    if (dialCode) return;
    const match = value.match(/^(\+\d+)(\d*)$/);
    if (match) {
      const [, dc, restNum] = match;
      setDialCode(dc);
      setLocalNumber(restNum);
    }
  }, [value, dialCode]);

  // If still no dialCode, set a preferred one or fallback to +234 (Nigeria) when list empty/not fetched
  useEffect(() => {
    if (dialCode) return;
    if (!countries.length) {
      setDialCode('+234');
      return;
    }
    const preferred = countries.find(c => preferredCountryCodes.includes(c.alpha2)) || countries[0];
    const dc = preferred?.dailingCodes?.[0] || '234';
    setDialCode('+' + dc);
  }, [countries, dialCode, preferredCountryCodes]);

  // Keep latest onChange in a ref to avoid effect loops when parent passes new function identity
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const prevCombinedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!dialCode && !localNumber) return;
    const combined = dialCode + localNumber;
    if (prevCombinedRef.current === combined) return; // no change
    prevCombinedRef.current = combined;
    // Only call if external value differs to prevent RHF setValue loops
    if (value !== combined) {
      onChangeRef.current?.(combined);
    }
  }, [dialCode, localNumber, value]);

  // Outside click close
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!open) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Build code options
  const codeOptions: { code: string; name: string; alpha2: string }[] = [];
  countries.forEach(c => {
    c.dailingCodes?.forEach(dc => {
      if (dc) codeOptions.push({ code: '+' + dc, name: c.name, alpha2: c.alpha2 });
    });
  });

  // Reorder preferred on top
  const ordered = [...codeOptions].sort((a,b) => {
    const aPref = preferredCountryCodes.includes(a.alpha2) ? 0 : 1;
    const bPref = preferredCountryCodes.includes(b.alpha2) ? 0 : 1;
    if (aPref !== bPref) return aPref - bPref;
    return a.name.localeCompare(b.name);
  });

  const filtered = search.trim() ? ordered.filter(o =>
    o.code.toLowerCase().includes(search.toLowerCase()) ||
    o.name.toLowerCase().includes(search.toLowerCase())
  ) : ordered;

  return (
    <div className="space-y-1" ref={containerRef}>
      <FormLabel label={label} required={required} isError={isError} isValid={isValid} />
      <div className={cn(
        'flex w-full rounded-md border border-border bg-bg text-sm overflow-hidden',
        'focus-within:ring-2 focus-within:ring-primary/30',
        disabled && 'opacity-50 cursor-not-allowed',
        isError && 'border-red-500 focus-within:ring-red-300',
        isValid && 'border-emerald-500 focus-within:ring-emerald-200'
      )}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          className={cn('px-3 py-2 border-r border-border bg-muted/30 flex items-center gap-1 text-sm', disabled && 'cursor-not-allowed')}
        >
          {dialCode || 'Code'}
          <svg className="h-3 w-3 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
        </button>
        <input
          type="text"
          disabled={disabled || !dialCode}
          value={localNumber}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, maxLocalLength);
            setLocalNumber(raw);
          }}
          placeholder="Enter phone number"
          className="flex-1 bg-transparent px-3 py-2 outline-none"
          {...rest}
        />
      </div>
      {open && !disabled && (
        <div className="relative z-50">
          <div className="absolute mt-1 max-h-64 w-72 overflow-y-auto rounded-md border border-border bg-bg shadow-md animate-in fade-in slide-in-from-top-1">
            {searchable && (
              <div className="sticky top-0 bg-bg p-2 border-b border-border">
                <input
                  autoFocus
                  placeholder="Search code or country..."
                  value={search}
                  onChange={(e)=> setSearch(e.target.value)}
                  className="w-full rounded-md border border-border bg-muted/20 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
            {filtered.map(opt => (
              <div
                key={opt.code + opt.name}
                onClick={() => { setDialCode(opt.code); setOpen(false); setSearch(''); }}
                className={cn('px-3 py-1.5 text-sm cursor-pointer hover:bg-primary/10 flex items-center justify-between', opt.code === dialCode && 'bg-primary/10 font-medium')}
              >
                <span>{opt.code}</span>
                <span className="text-muted ml-2 truncate">{opt.name}</span>
              </div>
            ))}
            {filtered.length === 0 && <div className="px-3 py-2 text-sm text-muted">No matches</div>}
          </div>
        </div>
      )}
      <FieldErrorText error={isError ? helper : undefined} className="mt-1" />
      {!isError && helper && <p className="text-xs text-muted">{helper}</p>}
    </div>
  );
};

PhoneInputWithDialCode.displayName = 'PhoneInputWithDialCode';
