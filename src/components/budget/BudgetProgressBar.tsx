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
  label = 'Budget Spending Progress',
  size = 'md',
}: BudgetProgressBarProps) {
  const percent = targetCents > 0 ? Math.min(Math.round((spentCents / targetCents) * 100), 200) : 0;
  const isOver = spentCents > targetCents && targetCents > 0;
  const isClose = percent >= 85 && !isOver;

  let barColor = 'bg-[#F7418F]';
  let badgeColor = 'text-[#F7418F] bg-[#FEC7B4] border-[#FC819E]';
  let statusText = 'Within Budget';

  if (isOver) {
    barColor = 'bg-rose-600';
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
    statusText = 'Over Budget';
  } else if (isClose) {
    barColor = 'bg-[#FC819E]';
    badgeColor = 'text-[#2A0E1C] bg-[#FFF3C7] border-[#FEC7B4]';
    statusText = 'Near Limit';
  }

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-bold text-[#2A0E1C]">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-none border text-[11px] font-bold ${badgeColor}`}>
            {statusText} ({percent}%)
          </span>
          <span className="text-[#2A0E1C]/70 font-medium">
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
        className={`w-full overflow-hidden rounded-none bg-[#FFF3C7] border border-[#FEC7B4] ${heightClass}`}
      >
        <div
          className={`h-full transition-all duration-300 rounded-none ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
