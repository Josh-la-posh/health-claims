import { cn } from '../../utils/cn';

interface StepHeaderProps {
  current: number;
  steps: { index: number; label: string }[];
}
export function StepHeader({ current, steps }: StepHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-4 text-xs md:text-sm">
      {steps.map((s, i) => {
        const active = current === s.index;
        const completed = current > s.index;
        return (
          <div key={s.index} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium transition-colors',
                completed ? 'bg-primary border-primary text-primary-foreground' : active ? 'border-primary text-primary' : 'border-border text-muted'
              )}
            >{completed ? '✓' : s.index}</span>
            <span className={cn('whitespace-nowrap transition-colors', active ? 'font-semibold text-foreground' : completed ? 'text-foreground/70' : 'text-muted')}>{s.label}</span>
            {i < steps.length - 1 && <span className="text-muted">›</span>}
          </div>
        );
      })}
    </div>
  );
}
