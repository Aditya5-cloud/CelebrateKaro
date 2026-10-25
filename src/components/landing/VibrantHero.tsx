'use client';

import React from 'react';
import { Sparkles, ArrowRight, Play, Heart, Users, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VibrantHeroProps {
  onStartFree: () => void;
  onExploreDemo: () => void;
  isLoggedIn: boolean;
  onOpenDashboard: () => void;
  eventsCount: number;
}

export function VibrantHero({
  onStartFree,
  onExploreDemo,
  isLoggedIn,
  onOpenDashboard,
  eventsCount,
}: VibrantHeroProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24">
      {/* Radiant Vibrant Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent blur-3xl dark:from-violet-600/20 dark:via-fuchsia-600/15" />
        <div className="absolute top-20 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-rose-500/15 via-amber-400/10 to-transparent blur-3xl dark:from-rose-600/15 dark:via-amber-500/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Clear, Confident, Professional Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Vibrant Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/80 px-4 py-1.5 text-xs font-bold text-violet-900 shadow-xs dark:border-violet-800/80 dark:bg-violet-950/50 dark:text-violet-300">
              <span className="flex h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse" />
              <span>Modern Celebration & Event Studio</span>
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
            </div>

            {/* Clean, Bold, Punchy Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]">
              Plan unforgettable{' '}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
                celebrations.
              </span>{' '}
              Without the chaos.
            </h1>

            {/* Clean, Elegant Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              From dream weddings and milestone birthdays to grand charity galas. Curate personalized checklists, manage precision budget envelopes, coordinate vendors, and countdown to your big day.
            </p>

            {/* High-Converting Professional CTA Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {!isLoggedIn ? (
                <>
                  <Button
                    variant="vibrant"
                    size="lg"
                    onClick={onStartFree}
                    className="h-12 px-7 text-sm font-bold gap-2 rounded-2xl cursor-pointer"
                  >
                    <span>Start Planning — Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onExploreDemo}
                    className="h-12 px-6 text-sm font-semibold gap-2 rounded-2xl border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 text-violet-600 fill-violet-600" />
                    <span>Explore Live Demo</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="vibrant"
                  size="lg"
                  onClick={onOpenDashboard}
                  className="h-12 px-7 text-sm font-bold gap-2 rounded-2xl"
                >
                  <span>Open My Celebrations Hub ({eventsCount})</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Trust & Guarantee Line */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Free to start
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Zero credit card required
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Real-time multi-user sync
              </span>
            </div>
          </div>

          {/* Right Column: Clean, Polished, High-Impact Showcase Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Main Visual Frame */}
            <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 group">
              {/* High-Resolution Celebration Image */}
              <div className="relative aspect-4/3 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero-celebration.jpg"
                  alt="Evening celebration under warm glowing lights"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Top Floating Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-black/60 backdrop-blur-md border border-white/20">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    Amalfi Coastal Wedding
                  </span>
                </div>

                {/* Top Right Floating Countdown */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-300 bg-black/60 backdrop-blur-md border border-amber-400/30">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>In 45 Days</span>
                </div>
              </div>

              {/* Lower Card Info Strip */}
              <div className="p-5 space-y-4 bg-white dark:bg-slate-900">
                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      Budget Envelope
                    </span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      $24,500.00
                    </p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ $3,600 buffer remaining
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-violet-500" />
                      Guest RSVP
                    </span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      128 / 140
                    </p>
                    <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold">
                      ✓ 92% Confirmed
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Planning Progress</span>
                    <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold">85% Complete</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 w-[85%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
