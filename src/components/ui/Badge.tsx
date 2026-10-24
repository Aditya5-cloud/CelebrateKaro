import React from 'react';
import type { EventType } from '@/types';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type?: EventType | 'default' | 'booked' | 'considering' | 'contacted' | 'paid' | 'cancelled';
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
}

const typeStyles: Record<string, string> = {
  wedding: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60',
  birthday: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/60',
  community: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/60',
  other: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200/80 dark:border-violet-900/60',
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  booked: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  considering: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  contacted: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  paid: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  cancelled: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 line-through',
};

const variantStyles: Record<string, string> = {
  default: 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 border-transparent',
  secondary: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-transparent',
  outline: 'text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800',
  destructive: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-900',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
};

export function Badge({ type, variant, children, className = '', ...props }: BadgeProps) {
  let style = '';
  if (type) {
    style = typeStyles[type] || typeStyles.default;
  } else if (variant) {
    style = variantStyles[variant] || variantStyles.default;
  } else {
    style = typeStyles.default;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-tight transition-colors',
        style,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function EventTypeBadge({ type }: { type: EventType }) {
  const labels: Record<EventType, string> = {
    wedding: 'Wedding',
    birthday: 'Birthday',
    community: 'Community',
    other: 'Celebration',
  };

  return <Badge type={type}>{labels[type] || type}</Badge>;
}
