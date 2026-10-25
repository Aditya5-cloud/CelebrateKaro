'use client';

import React from 'react';
import { Sparkles, DollarSign, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export function ThreeCorePillars({ onExplorePillar }: { onExplorePillar?: () => void }) {
  return (
    <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-50/80 px-3.5 py-1 text-xs font-bold text-fuchsia-900 dark:border-fuchsia-900/60 dark:bg-fuchsia-950/40 dark:text-fuchsia-300">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />
          <span>Serene Organization</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Three essentials. Zero stress.
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Everything you need to orchestrate a flawless celebration without drowning in spreadsheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Pillar 1: Checklists */}
        <div className="p-7 rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Curated Roadmaps
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Never wonder what to do next. Get step-by-step milestones tailored to your date — from reserving venues 10 months out to day-of run-of-show.
            </p>

            {/* Visual Micro-Preview */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Taste-test catering menu
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Done</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Approve floral moodboard
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Done</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 inline-block" />
                  Finalize DJ ceremony setlist
                </span>
                <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">Due in 5d</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onExplorePillar}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Personalized for your date</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pillar 2: Precision Budget */}
        <div className="p-7 rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>

            <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Precision Envelopes
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Say goodbye to spreadsheet math errors. Track venue, catering, floral, and entertainment envelopes in integer cents with live variance alerts.
            </p>

            {/* Visual Micro-Preview */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Catering & Bar Envelope</span>
                <span className="text-slate-900 dark:text-white">$7,500.00 / $8,000.00</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-[80%]" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>$500.00 under envelope</span>
                <span className="text-emerald-600 font-bold">✓ Safe</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onExplorePillar}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Zero floating penny drift</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pillar 3: Vendor CRM & Outreach */}
        <div className="p-7 rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-rose-600 text-white flex items-center justify-center shadow-md shadow-fuchsia-500/20">
              <Users className="w-6 h-6" />
            </div>

            <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Vendor Rolodex & CRM
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Keep your caterer, florist, photographer, and venue organized across 5 clear stages: Considering → Contacted → Booked → Paid → Done.
            </p>

            {/* Visual Micro-Preview */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold p-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
                <span className="truncate max-w-[120px] text-slate-800 dark:text-slate-200">Lumina Photo Co.</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Booked</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold p-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
                <span className="truncate max-w-[120px] text-slate-800 dark:text-slate-200">Chef Julien Catering</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Booked</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold p-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
                <span className="truncate max-w-[120px] text-slate-800 dark:text-slate-200">Petal & Stem Co.</span>
                <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">Contacted</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onExplorePillar}
              className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>One-click inquiry email drafter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
