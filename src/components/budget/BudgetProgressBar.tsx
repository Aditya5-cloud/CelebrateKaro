'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatters';

interface BudgetProgressBarProps {
  spentCents: number;
  targetCents: number;
  plannedCents?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BudgetProgressBar({
  spentCents,
  targetCents,
  plannedCents,
  label = 'Budget Spending Progress',
  size = 'md',
}: BudgetProgressBarProps) {
  const percent = targetCents > 0 ? Math.min(Math.round((spentCents / targetCents) * 100), 200) : 0;
  const isOver = spentCents > targetCents && targetCents > 0;
  const isClose = percent >= 85 && !isOver;

  let barColor = 'bg-emerald-600 dark:bg-emerald-500';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800';
  let statusText = 'Within Budget';

  if (isOver) {
    barColor = 'bg-red-600 dark:bg-red-500';
    badgeColor = 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-800';
    statusText = 'Over Budget';
  } else if (isClose) {
    barColor = 'bg-amber-500 dark:bg-amber-400';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800';
    statusText = 'Near Limit';
  }

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${badgeColor}`}>
            {statusText} ({percent}%)
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">
            {formatCurrency(spentCents)} of {formatCurrency(targetCents)}
          </span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={Math.min(percent, 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        aria-valuetext={`${percent}% of budget spent (${formatCurrency(spentCents)} of ${formatCurrency(targetCents)}) - ${statusText}`}
        className={`w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ${heightClass}`}
      >
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
