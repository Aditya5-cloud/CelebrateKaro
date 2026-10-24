'use client';

import React from 'react';
import { Sparkles, Calendar, CheckCircle2, Users, Heart } from 'lucide-react';

export function AestheticIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-4/3 flex items-center justify-center select-none">
      {/* Background Ambient Warm Celebration Glows */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-500/10" />
        <div className="w-64 h-64 rounded-full bg-rose-400/15 blur-2xl dark:bg-rose-500/10 -translate-x-8 translate-y-8" />
        <div className="w-56 h-56 rounded-full bg-violet-400/10 blur-2xl dark:bg-violet-600/10 translate-x-10 -translate-y-6" />
      </div>

      {/* SVG Celebratory Geometric Artwork Layer */}
      <svg
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          <linearGradient id="warmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#f472b6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Delicate Concentric Garland & Rings */}
        <circle cx="250" cy="200" r="145" stroke="url(#goldStroke)" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.6" />
        <circle cx="250" cy="200" r="105" stroke="url(#goldStroke)" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
        <circle cx="250" cy="200" r="65" fill="url(#warmGrad)" opacity="0.3" />

        {/* Orbiting Celebratory Milestone Nodes */}
        <circle cx="250" cy="55" r="4.5" fill="#f59e0b" />
        <circle cx="395" cy="200" r="4" fill="#ec4899" />
        <circle cx="105" cy="200" r="3.5" fill="#8b5cf6" />
        <circle cx="250" cy="345" r="4.5" fill="#10b981" />

        {/* Golden Sparkles & Confetti Motifs */}
        <path d="M 365 75 Q 365 90 380 90 Q 365 90 365 105 Q 365 90 350 90 Q 365 90 365 75 Z" fill="#fbbf24" opacity="0.7" />
        <path d="M 125 105 Q 125 116 136 116 Q 125 116 125 127 Q 125 116 114 116 Q 125 116 125 105 Z" fill="#f472b6" opacity="0.6" />
        <path d="M 385 295 Q 385 306 396 306 Q 385 306 385 317 Q 385 306 374 306 Q 385 306 385 295 Z" fill="#fbbf24" opacity="0.6" />
        <circle cx="160" cy="290" r="2.5" fill="#ec4899" opacity="0.5" />
        <circle cx="330" cy="320" r="2" fill="#8b5cf6" opacity="0.5" />
      </svg>

      {/* Floating Glassmorphic UI Cards */}
      {/* 1. Main Celebration Card (Center) */}
      <div className="absolute z-10 w-72 sm:w-80 rounded-3xl border border-amber-100/80 bg-white/95 p-5 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-xs">
              <Heart className="h-3.5 w-3.5 fill-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                The Glasshouse Wedding
              </span>
              <span className="text-[10px] text-zinc-400">
                Saturday, August 14 • 140 Guests
              </span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            On Track
          </span>
        </div>

        <div className="mt-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400">Budget ($25,000 Target)</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">$24,500.00 Allocated</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 w-[78%]" />
          </div>

          <div className="pt-1.5 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Catering Tasting Booked</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Floral Proposal Paid</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Floating Pill Top-Right: RSVP Confirmation */}
      <div className="absolute top-4 right-1 sm:right-4 z-20 flex items-center gap-2 rounded-2xl border border-rose-200/80 bg-white/95 px-3.5 py-1.5 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
        <Users className="h-3.5 w-3.5 text-rose-500" />
        <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
          128 / 140 RSVPs Confirmed
        </span>
      </div>

      {/* 3. Floating Pill Bottom-Left: Celebration Countdown */}
      <div className="absolute bottom-5 left-1 sm:left-4 z-20 flex items-center gap-2 rounded-2xl border border-amber-200/80 bg-white/95 px-3.5 py-1.5 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
        <Calendar className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
          🥂 45 Days to the Big Day
        </span>
      </div>

      {/* 4. Floating Small Pill Bottom-Right: Concierge Status */}
      <div className="hidden sm:flex absolute -bottom-1 right-8 z-20 items-center gap-1.5 rounded-full border border-violet-200/80 bg-white/90 px-3 py-1 shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 text-[10px] font-medium text-violet-700 dark:text-violet-300">
        <Sparkles className="h-3 w-3 text-violet-500" />
        <span>Curated by AI Concierge</span>
      </div>
    </div>
  );
}
