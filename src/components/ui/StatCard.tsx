import { cn } from '../../utils/cn';
import type { ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value?: number | string;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'default';
  loading?: boolean;
  onClick?: () => void;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-400 text-blue-900',
  green: 'bg-green-50 border-green-400 text-green-900',
  red: 'bg-red-50 border-red-400 text-red-900',
  default: 'bg-border/30 border-border text-foreground',
};

export function StatCard({ label, value, icon, color = 'default', loading, onClick }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-xl border p-5 transition-colors',
        'min-h-[110px] cursor-default',
        colorMap[color]
      )}
      onClick={onClick}
    >
      <div>
        <div className="text-3xl font-semibold tracking-tight">
          {loading ? <span className="animate-pulse text-muted">…</span> : value ?? '—'}
        </div>
        <p className="mt-2 text-sm font-medium text-current opacity-90">{label}</p>
      </div>
      {icon && (
        <div className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white/60 backdrop-blur">
          {icon}
        </div>
      )}
    </div>
  );
}
