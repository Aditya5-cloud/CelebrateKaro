import React from 'react';
import type { EventType } from '@/types';

interface BadgeProps {
  type: EventType | 'default' | 'booked' | 'considering' | 'contacted' | 'paid' | 'cancelled';
  children: React.ReactNode;
  className?: string;
}

const typeStyles: Record<string, string> = {
  wedding: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  birthday: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  community: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  other: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
  booked: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  considering: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  paid: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  cancelled: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
};

export function Badge({ type, children, className = '' }: BadgeProps) {
  const style = typeStyles[type] || typeStyles.default;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
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
