import { useState } from 'react';

export interface DateRange {
  start?: string; // ISO string (yyyy-MM-dd)
  end?: string;   // ISO string (yyyy-MM-dd)
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

// NOTE: Simple two native date inputs; can be enhanced later with a popover calendar
export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [local, setLocal] = useState<DateRange>(value);

  function update(partial: Partial<DateRange>) {
    const next = { ...local, ...partial };
    setLocal(next);
    onChange(next);
  }

  return (
    <div className={"flex items-center gap-2 " + (className ?? '')}>
      <input
        type="date"
        value={local.start ?? ''}
        onChange={e => update({ start: e.target.value || undefined })}
        className="rounded-md border border-border bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <span className="text-muted-foreground text-xs">to</span>
      <input
        type="date"
        value={local.end ?? ''}
        onChange={e => update({ end: e.target.value || undefined })}
        className="rounded-md border border-border bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {(value.start || value.end) && (
        <button
          type="button"
          onClick={() => { setLocal({}); onChange({}); }}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >Reset</button>
      )}
    </div>
  );
}
