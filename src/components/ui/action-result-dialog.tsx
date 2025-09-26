import { useEffect, useRef, useState } from 'react';
import { Dialog } from './dialog';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ActionResultDialogProps {
  open: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onOpenChange: (open: boolean) => void;
  autoCloseMs?: number; // if provided, dialog auto closes and shows progress bar
}

export function ActionResultDialog({ open, type, title, message, onOpenChange, autoCloseMs = 3500 }: ActionResultDialogProps){
  const timerRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(()=> {
    if(open && autoCloseMs > 0){
      setProgress(0);
      const started = performance.now();
      function tick(now: number){
        const pct = Math.min(100, ((now - started) / autoCloseMs) * 100);
        setProgress(pct);
        if(pct < 100 && open){
          timerRef.current = requestAnimationFrame(tick) as unknown as number;
        } else if(pct >= 100){
          onOpenChange(false);
        }
      }
      timerRef.current = requestAnimationFrame(tick) as unknown as number;
      return () => { if(timerRef.current) cancelAnimationFrame(timerRef.current); };
    } else {
      if(timerRef.current) cancelAnimationFrame(timerRef.current);
    }
  }, [open, autoCloseMs, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-sm lg:max-w-2xl">
        <div className="px-5 pt-5 pb-6 space-y-4">
          <div className="flex items-start gap-3">
            {type === 'success' ? (
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold leading-none">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
            </div>
          </div>
          {autoCloseMs > 0 && (
            <div className="h-1 w-full rounded-full bg-border overflow-hidden">
              <div
                className={cn('h-full transition-all', type === 'success' ? 'bg-emerald-500' : 'bg-destructive')}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
