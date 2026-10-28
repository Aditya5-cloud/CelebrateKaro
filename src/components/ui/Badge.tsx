import React from 'react';
import type { EventType } from '@/types';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type?: EventType | 'default' | 'booked' | 'considering' | 'contacted' | 'paid' | 'cancelled';
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
}

const typeStyles: Record<string, string> = {
  wedding: 'bg-[#FEC7B4] text-[#F7418F] border-[#FC819E] font-bold',
  birthday: 'bg-[#FFF3C7] text-[#F7418F] border-[#FEC7B4] font-bold',
  community: 'bg-[#FC819E]/20 text-[#2A0E1C] border-[#FC819E] font-bold',
  other: 'bg-[#FFF3C7] text-[#2A0E1C] border-[#FEC7B4] font-medium',
  default: 'bg-[#FFF3C7] text-[#2A0E1C] border-[#FEC7B4] font-medium',
  booked: 'bg-[#F7418F] text-white border-[#F7418F] font-bold',
  considering: 'bg-[#FFF3C7] text-[#2A0E1C] border-[#FEC7B4] font-medium',
  contacted: 'bg-[#FEC7B4] text-[#2A0E1C] border-[#FC819E] font-medium',
  paid: 'bg-[#FC819E] text-white border-[#FC819E] font-bold',
  cancelled: 'bg-stone-100 text-stone-500 border-stone-200 line-through',
};

const variantStyles: Record<string, string> = {
  default: 'bg-[#F7418F] text-white border-transparent',
  secondary: 'bg-[#FEC7B4] text-[#2A0E1C] border-[#FC819E]',
  outline: 'text-[#F7418F] border-[#F7418F] bg-transparent',
  destructive: 'bg-red-50 text-red-700 border-red-300',
  success: 'bg-[#FC819E]/20 text-[#2A0E1C] border-[#FC819E]',
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
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-semibold border tracking-tight transition-colors',
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
    community: '🥂',
    other: '✨',
  };

  const labels: Record<EventType, string> = {
    wedding: 'Wedding',
    birthday: 'Birthday',
    community: 'Community',
    other: 'Other',
  };

  return (
    <Badge type={type} className="gap-1.5 font-bold">
      <span aria-hidden="true">{icons[type] || '✨'}</span>
      <span>{labels[type] || type}</span>
    </Badge>
  );
}

export function VendorStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    booked: 'Booked',
    considering: 'Considering',
    contacted: 'Contacted',
    paid: 'Paid',
    cancelled: 'Cancelled',
  };

  return (
    <Badge type={status as BadgeProps['type']}>
      {labels[status] ?? status}
    </Badge>
  );
}
