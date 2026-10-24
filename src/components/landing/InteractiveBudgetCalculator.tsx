'use client';

import React, { useState } from 'react';
import { DollarSign, Users, Sparkles, ArrowRight, ShieldCheck, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';

interface InteractiveBudgetCalculatorProps {
  onStartWithBudget?: (guests: number, budget: number) => void;
}

export function InteractiveBudgetCalculator({ onStartWithBudget }: InteractiveBudgetCalculatorProps) {
  const [guests, setGuests] = useState<number>(120);
  const [budget, setBudget] = useState<number>(25000);

  const costPerGuest = guests > 0 ? Math.round(budget / guests) : 0;

  const categories = [
    { name: 'Venue & Reception Space', pct: 40, color: 'from-amber-500 to-amber-600', icon: '🏛️' },
    { name: 'Catering, Cake & Open Bar', pct: 30, color: 'from-rose-500 to-rose-600', icon: '🍽️' },
    { name: 'Photography & Highlight Film', pct: 12, color: 'from-violet-500 to-violet-600', icon: '📸' },
    { name: 'Floral, Styling & Lighting', pct: 10, color: 'from-pink-500 to-pink-600', icon: '🌸' },
    { name: 'Music, Sound & DJ / Band', pct: 5, color: 'from-blue-500 to-blue-600', icon: '🎵' },
    { name: 'Peace-of-Mind Buffer', pct: 3, color: 'from-emerald-500 to-emerald-600', icon: '🛡️' },
  ];

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <PieChart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Interactive Financial Blueprint</span>
          </div>
          <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Instant Budget & Envelope Calculator
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
            Slide guests and budget targets to see recommended category envelopes calculated in integer cents.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 dark:bg-zinc-800 dark:border-zinc-700 text-right shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Estimated Cost / Attendee
          </span>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-200">
            ${costPerGuest}
            <span className="text-xs font-normal text-zinc-400"> / guest</span>
          </p>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Slider 1: Expected Guests */}
        <div className="space-y-3 p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200/60 dark:bg-zinc-800/40 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <label htmlFor="guest-slider" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              Expected Guest Count
            </label>
            <span className="text-lg font-black text-zinc-950 dark:text-zinc-50">
              {guests} Attendees
            </span>
          </div>

          <input
            id="guest-slider"
            type="range"
            min={20}
            max={400}
            step={5}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-zinc-700"
          />

          <div className="flex justify-between text-[11px] text-zinc-400 font-semibold">
            <span>Intimate (20)</span>
            <span>Standard (120)</span>
            <span>Grand Gala (400)</span>
          </div>
        </div>

        {/* Slider 2: Target Budget */}
        <div className="space-y-3 p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200/60 dark:bg-zinc-800/40 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <label htmlFor="budget-slider" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Target Budget
            </label>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(budget * 100)}
            </span>
          </div>

          <input
            id="budget-slider"
            type="range"
            min={5000}
            max={100000}
            step={1000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:bg-zinc-700"
          />

          <div className="flex justify-between text-[11px] text-zinc-400 font-semibold">
            <span>$5,000</span>
            <span>$50,000</span>
            <span>$100,000+</span>
          </div>
        </div>
      </div>

      {/* Live Calculated Category Envelopes Grid */}
      <div className="mt-8">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
          Recommended Spending Distribution
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const allocationDollars = Math.round((budget * cat.pct) / 100);
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-zinc-200/70 bg-white dark:bg-zinc-800/60 dark:border-zinc-700/80 shadow-2xs hover:border-amber-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="text-[11px] font-bold text-zinc-400">
                    {cat.pct}%
                  </span>
                </div>

                <p className="mt-3 text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                  {formatCurrency(allocationDollars * 100)}
                </p>

                <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${cat.color} rounded-full`}
                    style={{ width: `${cat.pct * 2.5}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Strip */}
      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Zero IEEE-754 penny drift. Calculations persist directly into your event tracker.</span>
        </div>

        <Button
          size="lg"
          onClick={() => onStartWithBudget?.(guests, budget)}
          className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 font-bold gap-2 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Lock In This Budget & Plan Celebration</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
