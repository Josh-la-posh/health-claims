import React from 'react';
import { cn } from '../../../utils/cn';

export interface DetailsLayoutProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  background?: boolean;
}

export const DetailsLayout: React.FC<DetailsLayoutProps> = ({ title, action, children, className, containerClassName, background = true }) => {
  return (
    <div className={cn(background && 'bg-authBg min-h-screen p-6', containerClassName)}>
      <div className={cn('border border-border rounded-xl p-6 space-y-10 max-w-5xl mx-auto', background ? 'bg-bg' : 'bg-card', className)}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl text-primary font-medium">{title}</h1>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
};

export interface DetailsSectionProps {
  title: string;
  children: React.ReactNode;
  columns?: number; // tailwind md:grid-cols-N value (1-6 typical)
  className?: string;
  gridClassName?: string;
  separator?: boolean;
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({ title, children, columns = 4, className, gridClassName, separator = true }) => {
  return (
    <section className={cn('space-y-6', className)}>
      <h2 className="text-sm md:text-base font-medium text-primary">{title}</h2>
      {separator && <hr className="border-border" />}
      <div className={cn('grid grid-cols-1 gap-6 text-sm', `md:grid-cols-${columns}`, gridClassName)}>
        {children}
      </div>
    </section>
  );
};

export interface DetailsFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  placeholder?: React.ReactNode;
}

export const DetailsField: React.FC<DetailsFieldProps> = ({ label, value, className, placeholder = '—' }) => {
  const display = value === undefined || value === null || value === '' ? placeholder : value;
  return (
    <div className={className}>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-medium tracking-tight min-h-[20px] break-words">{display}</div>
    </div>
  );
};
