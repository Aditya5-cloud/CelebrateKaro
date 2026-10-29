'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  DollarSign,
  CheckCircle2,
  Circle,
  ArrowRight,
  Heart,
  Wine,
  Palmtree,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';

interface VibeOption {
  id: string;
  name: string;
  tagline: string;
  eventType: 'wedding' | 'birthday' | 'other' | 'community';
  icon: React.ReactNode;
  imageUrl: string;
  gradient: string;
  badgeColor: string;
  guests: number;
  budget: number;
  countdown: string;
  venueName: string;
  categoryBreakdown: { name: string; amount: number; pct: number }[];
  curatedTasks: { id: number; title: string; category: string; done: boolean }[];
  highlight: string;
}

const VIBE_PRESETS: VibeOption[] = [
  {
    id: 'wedding',
    name: 'Amalfi Terrace Wedding',
    tagline: 'Sun-drenched lemon groves, cliffside vows & twilight dinner',
    eventType: 'wedding',
    icon: <Heart className="w-4 h-4 text-rose-500" />,
    imageUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    gradient: 'from-rose-500/20 via-amber-500/10 to-transparent',
    badgeColor: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900',
    guests: 140,
    budget: 38000,
    countdown: 'In 74 Days',
    venueName: 'Villa Cilento Cliffside Estate',
    categoryBreakdown: [
      { name: 'Terrace Venue & Rentals', amount: 15200, pct: 40 },
      { name: 'Catering & Aperitivo Bar', amount: 11400, pct: 30 },
      { name: 'Cinematography & Photo', amount: 5700, pct: 15 },
      { name: 'Florals & Fairy Lighting', amount: 3800, pct: 10 },
      { name: 'Live Acoustic Quartet', amount: 1900, pct: 5 },
    ],
    curatedTasks: [
      { id: 1, title: 'Confirm limoncello tasting with catering chef', category: 'Catering', done: true },
      { id: 2, title: 'Finalize floral pergola & white bougainvillea mockups', category: 'Decor', done: true },
      { id: 3, title: 'Lock in 4-piece Mediterranean string quartet', category: 'Music', done: false },
      { id: 4, title: 'Send digital golden-hour itinerary to 140 guests', category: 'Timeline', done: false },
    ],
    highlight: 'Champagne toast at 7:45 PM during sunset golden hour',
  },
  {
    id: 'birthday',
    name: 'Neon Rooftop 30th Gala',
    tagline: 'City skyline panorama, bespoke mixology & vinyl DJ sets',
    eventType: 'birthday',
    icon: <PartyPopper className="w-4 h-4 text-amber-500" />,
    imageUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    gradient: 'from-amber-500/20 via-violet-500/10 to-transparent',
    badgeColor: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900',
    guests: 65,
    budget: 9500,
    countdown: 'In 18 Days',
    venueName: 'The Penthouse Glass Terrace',
    categoryBreakdown: [
      { name: 'Private Rooftop Loft', amount: 3800, pct: 40 },
      { name: 'Craft Cocktail Open Bar', amount: 2850, pct: 30 },
      { name: 'Resident Vinyl DJ & Sound', amount: 1425, pct: 15 },
      { name: 'Neon Lighting & Photo Booth', amount: 950, pct: 10 },
      { name: 'Late-Night Gourmet Sliders', amount: 475, pct: 5 },
    ],
    curatedTasks: [
      { id: 1, title: 'Taste-test 3 signature smoked bourbon & mezcal cocktails', category: 'Bar', done: true },
      { id: 2, title: 'Book 360-degree rotating glam photo booth', category: 'Entertainment', done: true },
      { id: 3, title: 'Share curated 4-hour house & funk playlist with DJ', category: 'Music', done: false },
      { id: 4, title: 'Deliver custom neon "Forever Young" centerpiece', category: 'Decor', done: false },
    ],
    highlight: 'Midnight champagne spray & illuminated sparklers',
  },
  {
    id: 'gala',
    name: 'Midsummer Starlit Gala',
    tagline: 'Black-tie fundraising dinner, garden arches & silent auction',
    eventType: 'community',
    icon: <Wine className="w-4 h-4 text-violet-500" />,
    imageUrl:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
    gradient: 'from-violet-500/20 via-indigo-500/10 to-transparent',
    badgeColor: 'text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-900',
    guests: 220,
    budget: 52000,
    countdown: 'In 92 Days',
    venueName: 'Belvedere Botanical Conservatory',
    categoryBreakdown: [
      { name: 'Conservatory Grounds & Marquee', amount: 20800, pct: 40 },
      { name: 'Three-Course Plated Banquet', amount: 15600, pct: 30 },
      { name: 'Fine Wines & Sommelier Service', amount: 7800, pct: 15 },
      { name: 'Dramatic Uplighting & Florals', amount: 5200, pct: 10 },
      { name: 'Keynote Audio/Visual Production', amount: 2600, pct: 5 },
    ],
    curatedTasks: [
      { id: 1, title: 'Approve 3-course seasonal heirloom menu with head chef', category: 'Catering', done: true },
      { id: 2, title: 'Digitize silent auction QR codes for 220 tables', category: 'Auction', done: true },
      { id: 3, title: 'Confirm live 8-piece swing band and wireless mics', category: 'Production', done: false },
      { id: 4, title: 'Finalize botanical conservatory permit & security', category: 'Logistics', done: false },
    ],
    highlight: 'Live jazz intermezzo with candlelit banquet tables',
  },
  {
    id: 'beach',
    name: 'Boho Sunset Beach Soirée',
    tagline: 'Barefoot dining, driftwood lanterns & acoustic fire pit songs',
    eventType: 'other',
    icon: <Palmtree className="w-4 h-4 text-emerald-500" />,
    imageUrl:
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
    gradient: 'from-emerald-500/20 via-amber-500/10 to-transparent',
    badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900',
    guests: 80,
    budget: 14000,
    countdown: 'In 35 Days',
    venueName: 'Pacific Cove Sandbar & Dunes',
    categoryBreakdown: [
      { name: 'Private Beachfront Permit & Tents', amount: 5600, pct: 40 },
      { name: 'Wood-Fired Seafood & Poke Bar', amount: 4200, pct: 30 },
      { name: 'Acoustic Guitarist & Sound', amount: 2100, pct: 15 },
      { name: 'Boho Rugs, Pillows & Lanterns', amount: 1400, pct: 10 },
      { name: 'Bonfire Smores & Craft Ciders', amount: 700, pct: 5 },
    ],
    curatedTasks: [
      { id: 1, title: 'Acquire county beach fire & gathering permit', category: 'Permits', done: true },
      { id: 2, title: 'Reserve low wooden picnic tables & woven cushions', category: 'Rentals', done: true },
      { id: 3, title: 'Coordinate portable ocean-safe string lights', category: 'Lighting', done: false },
      { id: 4, title: 'Pre-order artisan marshmallows & hot cocoa bar', category: 'Catering', done: false },
    ],
    highlight: 'Acoustic guitar singalong around beach bonfire at dusk',
  },
];

interface VibePlaygroundProps {
  onSelectVibe?: (vibe: VibeOption) => void;
}

export function VibePlayground({ onSelectVibe }: VibePlaygroundProps) {
  const [activeVibeId, setActiveVibeId] = useState<string>('wedding');
  const [tasksState, setTasksState] = useState<Record<string, Record<number, boolean>>>({
    wedding: { 1: true, 2: true, 3: false, 4: false },
    birthday: { 1: true, 2: true, 3: false, 4: false },
    gala: { 1: true, 2: true, 3: false, 4: false },
    beach: { 1: true, 2: true, 3: false, 4: false },
  });

  const activeVibe = VIBE_PRESETS.find((v) => v.id === activeVibeId) || VIBE_PRESETS[0];

  const handleToggleTask = (taskId: number) => {
    setTasksState((prev) => ({
      ...prev,
      [activeVibe.id]: {
        ...prev[activeVibe.id],
        [taskId]: !prev[activeVibe.id]?.[taskId],
      },
    }));
  };

  const completedCount = Object.values(tasksState[activeVibe.id] || {}).filter(Boolean).length;
  const totalTasks = activeVibe.curatedTasks.length;
  const progressPct = Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="relative rounded-3xl border border-amber-200/60 bg-gradient-to-b from-white via-amber-50/20 to-white p-6 sm:p-10 shadow-xl dark:border-zinc-800 dark:from-zinc-900/90 dark:via-zinc-900/50 dark:to-zinc-900/90 overflow-hidden">
      {/* Decorative Aura Spotlights */}
      <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-amber-400/10 via-rose-400/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-16 w-72 h-72 rounded-full bg-gradient-to-tr from-violet-400/10 via-amber-300/10 to-transparent blur-2xl pointer-events-none" />

      {/* Header & Vibe Selector */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Interactive Celebration Simulator</span>
          </div>
          <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Choose your celebration vibe. Watch the plan adapt.
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
            Click through real celebration archetypes. See live budgets, interactive checklists, and milestone countdowns update instantly.
          </p>
        </div>

        {/* 4 Interactive Vibe Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {VIBE_PRESETS.map((vibe) => {
            const active = activeVibeId === vibe.id;
            return (
              <button
                key={vibe.id}
                type="button"
                onClick={() => setActiveVibeId(vibe.id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                  active
                    ? 'bg-zinc-950 text-white shadow-md scale-102 dark:bg-zinc-100 dark:text-zinc-950 ring-2 ring-amber-400/40'
                    : 'bg-white text-zinc-600 hover:bg-amber-50/60 hover:text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700'
                }`}
              >
                {vibe.icon}
                <span>{vibe.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Showcase Body */}
      <div className="relative z-10 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Atmospheric Event Mood Card & Imagery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-zinc-200/80 dark:border-zinc-800 group aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
            {/* Background Curated Image */}
            <Image
              src={activeVibe.imageUrl}
              alt={activeVibe.name}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md bg-white/90 shadow-sm ${activeVibe.badgeColor}`}>
                {activeVibe.eventType.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold text-white bg-black/50 backdrop-blur-md border border-white/20">
                {activeVibe.countdown}
              </span>
            </div>

            {/* Overlaid Bottom Details */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs font-medium text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {activeVibe.venueName}
              </p>
              <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                {activeVibe.name}
              </h4>
              <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
                {activeVibe.tagline}
              </p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/90 border border-zinc-200/80 dark:bg-zinc-800/80 dark:border-zinc-700 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Target Budget
              </span>
              <p className="text-base font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
                {formatCurrency(activeVibe.budget * 100)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/90 border border-zinc-200/80 dark:bg-zinc-800/80 dark:border-zinc-700 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Guests
              </span>
              <p className="text-base font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
                {activeVibe.guests} Attendees
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/90 border border-zinc-200/80 dark:bg-zinc-800/80 dark:border-zinc-700 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Per Guest
              </span>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                ${Math.round(activeVibe.budget / activeVibe.guests)}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Checklist & Category Envelopes */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Interactive Checklist (Users can actually click items to toggle!) */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                  Interactive Planning Checklist
                </h5>
                <span className="text-xs text-zinc-400">
                  (Click tasks to test completion)
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                {completedCount}/{totalTasks} Done ({progressPct}%)
              </span>
            </div>

            {/* Checklist Progress Bar */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Interactive Tasks List */}
            <div className="mt-4 space-y-2.5">
              {activeVibe.curatedTasks.map((task) => {
                const isDone = !!tasksState[activeVibe.id]?.[task.id];
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isDone
                        ? 'bg-zinc-50/80 border-zinc-200/60 dark:bg-zinc-800/40 dark:border-zinc-800 text-zinc-400'
                        : 'bg-white border-zinc-200 hover:border-amber-300 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-amber-500/50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 hover:text-amber-500 shrink-0" />
                      )}
                      <span className={`text-xs sm:text-sm font-medium ${isDone ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-700/60 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                      {task.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Precision Category Budget Envelopes */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                  Calculated Spending Envelopes
                </h5>
              </div>
              <span className="text-xs font-semibold text-zinc-500">
                100% Zero-Loss Math
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {activeVibe.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>{cat.name}</span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                      {formatCurrency(cat.amount * 100)} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${cat.pct * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Launch CTA Pill */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
                ✨ {activeVibe.highlight}
              </p>
              <Button
                size="sm"
                onClick={() => onSelectVibe?.(activeVibe)}
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 gap-1.5 text-xs font-bold"
              >
                <span>Plan Celebration Like This</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
