'use client';

import React, { useState } from 'react';
import { XCircle, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChaosVsCalm({ onGetStarted }: { onGetStarted?: () => void }) {
  const [activeTab, setActiveTab] = useState<'calm' | 'chaos'>('calm');

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60">
          The Planning Transformation
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          The old spreadsheet chaos vs. CelebratePro calm
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Why over 2,500 hosts and couples leave disparate spreadsheets behind.
        </p>

        {/* Tab Toggle */}
        <div className="pt-4 flex justify-center">
          <div className="inline-flex items-center rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setActiveTab('calm')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'calm'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>CelebratePro Calm</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chaos')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'chaos'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Spreadsheet Chaos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Chaos Column */}
        <div
          className={`rounded-3xl p-6 sm:p-7 border transition-all ${
            activeTab === 'chaos'
              ? 'border-rose-300 bg-rose-50/50 dark:border-rose-900/60 dark:bg-rose-950/20 ring-2 ring-rose-400/30'
              : 'border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/20 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-rose-200/50 dark:border-rose-900/40">
            <h4 className="font-extrabold text-base text-rose-950 dark:text-rose-200 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              The Fragmented Spreadsheet Nightmare
            </h4>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400">High Stress</span>
          </div>

          <ul className="mt-5 space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="text-rose-500 font-bold mt-0.5">✕</span>
              <span><strong>14 disconnected spreadsheets</strong> with broken currency formulas and duplicate line-items.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-500 font-bold mt-0.5">✕</span>
              <span><strong>180 unread vendor emails</strong> scattered between personal inboxes, missed deposit deadlines, and lost PDF contracts.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-500 font-bold mt-0.5">✕</span>
              <span><strong>Surprise budget blowouts</strong> discovered 3 weeks before the event with no warning indicators.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-500 font-bold mt-0.5">✕</span>
              <span><strong>2 AM panic Google searches</strong> on etiquette, seating charts, and tipping protocols.</span>
            </li>
          </ul>
        </div>

        {/* The Calm Column */}
        <div
          className={`rounded-3xl p-6 sm:p-7 border transition-all ${
            activeTab === 'calm'
              ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20 ring-2 ring-emerald-400/30 shadow-md'
              : 'border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/20 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-emerald-200/50 dark:border-emerald-900/40">
            <h4 className="font-extrabold text-base text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              The CelebratePro Calm
            </h4>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Serene & Curated</span>
          </div>

          <ul className="mt-5 space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>One serene celebration hub</strong> with live synchronized budgets, guest numbers, and interactive checklists.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Organized 5-stage vendor pipeline</strong> with one-click inquiry emails and quote tracking.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Real-time envelope variance alerts</strong> so you know exactly what is committed down to the cent.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>24/7 AI Planning Concierge</strong> grounded in your exact guest count, menu preferences, and budget.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={onGetStarted}
          className="bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 font-bold gap-2"
        >
          <span>Choose Calm — Start Planning Your Celebration Free</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
