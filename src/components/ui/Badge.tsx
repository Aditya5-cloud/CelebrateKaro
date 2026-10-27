import React from 'react';
import type { EventType } from '@/types';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type?: EventType | 'default' | 'booked' | 'considering' | 'contacted' | 'paid' | 'cancelled';
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
}

const typeStyles: Record<string, string> = {
  wedding: 'bg-rose-50 text-rose-800 border-rose-200 font-bold',
  birthday: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
  community: 'bg-orange-50 text-orange-800 border-orange-200 font-bold',
  other: 'bg-purple-50 text-purple-800 border-purple-200 font-bold',
  default: 'bg-stone-100 text-stone-700 border-stone-200 font-medium',
  booked: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
  considering: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
  contacted: 'bg-blue-50 text-blue-800 border-blue-300 font-medium',
  paid: 'bg-teal-50 text-teal-800 border-teal-300 font-bold',
  cancelled: 'bg-stone-100 text-stone-500 border-stone-200 line-through',
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
  const icons: Record<EventType, string> = {
    wedding: '💍',
    birthday: '🎂',
    community: '🍲',
    other: '🎉',
  };

  const subLabels: Record<EventType, string> = {
    wedding: 'Shaadi',
    birthday: 'Janamdin',
    community: 'Bhandara',
    other: 'Utsav',
  };

  const labels: Record<EventType, string> = {
    wedding: 'Wedding',
    birthday: 'Birthday',
    community: 'Community',
    other: 'Social',
  };

  return (
    <Badge type={type} className="gap-1 font-bold">
      <span aria-hidden="true">{icons[type] || '✨'}</span>
      <span>{subLabels[type] || 'Parv'}</span>
      <span className="text-[10px] opacity-60">•</span>
      <span>{labels[type] || type}</span>
    </Badge>
  );
}
