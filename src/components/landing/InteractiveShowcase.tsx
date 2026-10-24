'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/formatters';

interface ShowcaseEvent {
  id: string;
  name: string;
  type: 'wedding' | 'birthday' | 'community';
  icon: string;
  dateStr: string;
  countdown: string;
  budgetTotal: number;
  budgetSpent: number;
  guests: number;
  vibe: string;
  tasks: Array<{ id: number; text: string; category: string; done: boolean; ai: boolean }>;
  vendors: Array<{ name: string; category: string; status: 'booked' | 'contacted' | 'considering'; quote: number }>;
}

const SHOWCASE_EVENTS: ShowcaseEvent[] = [
  {
    id: 'showcase-wedding',
    name: 'Sophia & Lucas Coastal Wedding',
    type: 'wedding',
    icon: '💍',
    dateStr: 'August 21, 2027',
    countdown: 'In 302 days',
    budgetTotal: 3500000,
    budgetSpent: 1650000,
    guests: 150,
    vibe: 'Modern coastal elegance with sunset dinner',
    tasks: [
      { id: 1, text: 'Finalize beachside ceremony permit & sound ordinances', category: 'venue', done: true, ai: true },
      { id: 2, text: 'Confirm floral color palette (eucalyptus & champagne blush)', category: 'decor', done: true, ai: true },
      { id: 3, text: 'Schedule farm-to-table tasting with Coastal Catering', category: 'catering', done: false, ai: true },
      { id: 4, text: 'Book live acoustic duo for cocktail hour & transition DJ', category: 'music', done: false, ai: false },
      { id: 5, text: 'Send digital save-the-dates with dietary preference poll', category: 'invitations', done: true, ai: true },
    ],
    vendors: [
      { name: 'Pacific Bluff Pavilion', category: 'Venue', status: 'booked', quote: 1250000 },
      { name: 'Driftwood Catering Co.', category: 'Catering', status: 'contacted', quote: 820000 },
      { name: 'Lumina Wedding Photography', category: 'Photography', status: 'booked', quote: 380000 },
      { name: 'Oceanside String Quartet', category: 'Music', status: 'considering', quote: 160000 },
    ],
  },
  {
    id: 'showcase-birthday',
    name: "Marcus's 50th Golden Rooftop Gala",
    type: 'birthday',
    icon: '🎂',
    dateStr: 'November 14, 2026',
    countdown: 'In 22 days',
    budgetTotal: 850000,
    budgetSpent: 520000,
    guests: 60,
    vibe: 'Sophisticated speakeasy rooftop with craft cocktails',
    tasks: [
      { id: 1, text: 'Reserve private penthouse rooftop terrace and lounge', category: 'venue', done: true, ai: true },
      { id: 2, text: 'Hire mixologist team for signature cocktail menu', category: 'catering', done: true, ai: true },
      { id: 3, text: 'Order customized gold-foil tiered chocolate hazelnut cake', category: 'catering', done: false, ai: true },
      { id: 4, text: 'Collect tribute video clips from friends & family', category: 'entertainment', done: true, ai: false },
      { id: 5, text: 'Arrange guest valet parking & ride-share discount codes', category: 'logistics', done: false, ai: true },
    ],
    vendors: [
      { name: 'Skyline Terrace Lounge', category: 'Venue', status: 'booked', quote: 320000 },
      { name: 'Velvet Shaker Mixology', category: 'Catering', status: 'booked', quote: 140000 },
      { name: 'Sweet Art Patisserie', category: 'Cake', status: 'considering', quote: 60000 },
    ],
  },
  {
    id: 'showcase-community',
    name: 'Oakridge Summer Arts & Food Festival',
    type: 'community',
    icon: '🏘️',
    dateStr: 'July 18, 2027',
    countdown: 'In 268 days',
    budgetTotal: 4800000,
    budgetSpent: 2100000,
    guests: 750,
    vibe: 'Family-friendly vibrant community celebration',
    tasks: [
      { id: 1, text: 'Secure municipal park staging and public assembly permits', category: 'permits', done: true, ai: true },
      { id: 2, text: 'Curate 24 local artisan vendor booths & food trucks', category: 'vendors', done: true, ai: false },
      { id: 3, text: 'Deploy portable restroom & commercial recycling stations', category: 'logistics', done: false, ai: true },
      { id: 4, text: 'Schedule mainstage community choir and indie bands', category: 'entertainment', done: false, ai: true },
      { id: 5, text: 'Organize volunteer orientation & safety radio check', category: 'security', done: false, ai: true },
    ],
    vendors: [
      { name: 'Oakridge Municipal Park', category: 'Venue', status: 'booked', quote: 1000000 },
      { name: 'Apex Sound & Concert Rigging', category: 'AV & Staging', status: 'booked', quote: 1100000 },
      { name: 'EcoWaste Clean Solutions', category: 'Logistics', status: 'contacted', quote: 450000 },
    ],
  },
];

export function InteractiveShowcase() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'checklist' | 'budget' | 'vendors'>('checklist');
  const [taskStates, setTaskStates] = useState<Record<string, Record<number, boolean>>>({
    'showcase-wedding': { 1: true, 2: true, 3: false, 4: false, 5: true },
    'showcase-birthday': { 1: true, 2: true, 3: false, 4: true, 5: false },
    'showcase-community': { 1: true, 2: true, 3: false, 4: false, 5: false },
  });

  const evt = SHOWCASE_EVENTS[selectedIdx];
  const currentTasks = evt.tasks;
  const currentStates = taskStates[evt.id] || {};

  const toggleTask = (id: number) => {
    setTaskStates((prev) => ({
      ...prev,
      [evt.id]: {
        ...prev[evt.id],
        [id]: !prev[evt.id]?.[id],
      },
    }));
  };

  const completedCount = currentTasks.filter((t) => currentStates[t.id]).length;
  const progressPct = Math.round((completedCount / currentTasks.length) * 100);

  const budgetPct = Math.min(100, Math.round((evt.budgetSpent / evt.budgetTotal) * 100));

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-7 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      {/* Top bar: Persona / Template selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Interactive Live Sandbox Preview
          </span>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mt-0.5">
            <span>{evt.icon}</span>
            <span>{evt.name}</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {evt.vibe} • <span className="font-medium text-zinc-700 dark:text-zinc-300">{evt.guests} guests</span> •{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{evt.countdown}</span>
          </p>
        </div>

        {/* Template Buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {SHOWCASE_EVENTS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                selectedIdx === idx
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <span>{item.icon}</span> <span className="hidden md:inline">{item.type.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature sub-tabs */}
      <div className="mt-4 flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              activeTab === 'checklist'
                ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            ✨ AI Checklist ({completedCount}/{currentTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              activeTab === 'budget'
                ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            💰 Budget Engine ({budgetPct}% Spent)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vendors')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              activeTab === 'vendors'
                ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            📋 Vendor Pipeline ({evt.vendors.length})
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          Interactive Demo Live
        </span>
      </div>

      {/* Content for sub-tab 1: Checklist */}
      {activeTab === 'checklist' && (
        <div className="mt-4 space-y-3">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Milestone Readiness
              </span>
              <span className="font-bold text-violet-600 dark:text-violet-400">
                {progressPct}% Completed
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Tasks list */}
          <div className="space-y-1.5 pt-1">
            {currentTasks.map((t) => {
              const done = currentStates[t.id];
              return (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`flex items-center justify-between rounded-xl border p-2.5 cursor-pointer select-none transition-all ${
                    done
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                      : 'border-zinc-200/80 bg-zinc-50/60 hover:border-violet-300 dark:border-zinc-800 dark:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                        done
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800'
                      }`}
                    >
                      {done && (
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        done
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'font-medium text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {t.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {t.ai && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
                        ✨ Gemini AI
                      </span>
                    )}
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-200/60 text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300">
                      {t.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic text-center">
            💡 Click any checklist task above to test live interactive completion!
          </p>
        </div>
      )}

      {/* Content for sub-tab 2: Budget */}
      {activeTab === 'budget' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-[10px] font-semibold uppercase text-zinc-400">Total Budget</span>
              <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatCurrency(evt.budgetTotal)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-[10px] font-semibold uppercase text-zinc-400">Committed / Spent</span>
              <p className="text-base sm:text-lg font-bold text-violet-600 dark:text-violet-400 mt-0.5">
                {formatCurrency(evt.budgetSpent)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-[10px] font-semibold uppercase text-zinc-400">Remaining</span>
              <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCurrency(evt.budgetTotal - evt.budgetSpent)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-zinc-600 dark:text-zinc-400">Overall Budget Allocation</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{budgetPct}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-600"
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Zero-cent precision SQLite integer math</span>
              <span>Variance strictly contained</span>
            </div>
          </div>
        </div>
      )}

      {/* Content for sub-tab 3: Vendors */}
      {activeTab === 'vendors' && (
        <div className="mt-4 space-y-2">
          {evt.vendors.map((v, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{v.name}</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{v.category}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {formatCurrency(v.quote)}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    v.status === 'booked'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : v.status === 'contacted'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                  }`}
                >
                  {v.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
