'use client';

import React from 'react';
import { Sparkles, Calendar, DollarSign, CheckCircle2, Users } from 'lucide-react';

export function AestheticIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-4/3 flex items-center justify-center select-none">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-600/10" />
        <div className="w-64 h-64 rounded-full bg-indigo-400/10 blur-2xl dark:bg-indigo-600/10 -translate-x-10 translate-y-10" />
      </div>

      {/* SVG Geometric Artwork Layer */}
      <svg
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <linearGradient id="gradViolet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="gradStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Delicate Concentric Geometry (Celebration Rings & Milestones) */}
        <circle cx="250" cy="200" r="140" stroke="url(#gradStroke)" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.6" />
        <circle cx="250" cy="200" r="100" stroke="url(#gradStroke)" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
        <circle cx="250" cy="200" r="60" fill="url(#gradViolet)" opacity="0.3" />

        {/* Orbiting Milestone Nodes */}
        <circle cx="250" cy="60" r="4" fill="#8b5cf6" />
        <circle cx="390" cy="200" r="3.5" fill="#6366f1" />
        <circle cx="110" cy="200" r="3" fill="#ec4899" />
        <circle cx="250" cy="340" r="4" fill="#10b981" />

        {/* Sparkle Motifs */}
        <path d="M 360 80 Q 360 95 375 95 Q 360 95 360 110 Q 360 95 345 95 Q 360 95 360 80 Z" fill="#c084fc" opacity="0.6" />
        <path d="M 130 110 Q 130 120 140 120 Q 130 120 130 130 Q 130 120 120 120 Q 130 120 130 110 Z" fill="#818cf8" opacity="0.5" />
        <path d="M 380 290 Q 380 300 390 300 Q 380 300 380 310 Q 380 300 370 300 Q 380 300 380 290 Z" fill="#f472b6" opacity="0.5" />
      </svg>

      {/* Floating Glassmorphic UI Cards */}
      {/* 1. Main Planner Card (Center) */}
      <div className="absolute z-10 w-64 sm:w-72 rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 transition-transform hover:scale-[1.02]">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Celebration Roadmap
            </span>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            Real-Time
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400">Budget Allocated</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">$24,500.00</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 w-[68%]" />
          </div>

          <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> 140 Guests
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> In 45 Days
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="h-3 w-3" /> 8/10 Tasks
            </span>
          </div>
        </div>
      </div>

      {/* 2. Floating Pill Top-Right: Gemini 3.5 AI */}
      <div className="absolute top-4 right-2 sm:right-6 z-20 flex items-center gap-2 rounded-xl border border-violet-200/80 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-md dark:border-violet-800/80 dark:bg-zinc-900/95 animate-float">
        <Sparkles className="h-3.5 w-3.5 text-violet-600" />
        <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
          Gemini 3.5 AI Synthesizer
        </span>
      </div>

      {/* 3. Floating Pill Bottom-Left: Integer Precision */}
      <div className="absolute bottom-6 left-2 sm:left-6 z-20 flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <DollarSign className="h-3 w-3 text-emerald-600" />
        <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
          100% Cents Math • Zero Drift
        </span>
      </div>
    </div>
  );
}
