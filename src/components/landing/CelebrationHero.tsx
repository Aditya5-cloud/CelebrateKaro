'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, Heart, Calendar, Users, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CelebrationHeroProps {
  onStartFree: () => void;
  onSignIn: () => void;
  onExploreVibes: () => void;
  isLoggedIn: boolean;
  onOpenDashboard: () => void;
  eventsCount: number;
}

export function CelebrationHero({
  onStartFree,
  onSignIn,
  onExploreVibes,
  isLoggedIn,
  onOpenDashboard,
  eventsCount,
}: CelebrationHeroProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24">
      {/* Background Ambient Warm Celebration Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-amber-300/25 via-rose-300/15 to-transparent blur-3xl dark:from-amber-500/10 dark:via-rose-500/10" />
        <div className="absolute top-24 right-1/4 w-80 h-80 rounded-full bg-gradient-to-bl from-violet-300/20 via-pink-300/15 to-transparent blur-3xl dark:from-violet-500/10 dark:via-pink-500/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Shimmering Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-50/90 via-rose-50/80 to-amber-50/90 px-4 py-1.5 text-xs font-bold text-amber-950 shadow-2xs dark:border-amber-800/80 dark:from-amber-950/40 dark:via-rose-950/30 dark:to-amber-950/40 dark:text-amber-200">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>The World&apos;s Most Thoughtful Celebration Studio</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>

            {/* Magnetic Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.08]">
              Where extraordinary moments{' '}
              <span className="bg-gradient-to-r from-amber-600 via-rose-600 to-violet-600 bg-clip-text text-transparent">
                are born.
              </span>
            </h1>

            {/* Poetic & Emotionally Grounded Subtitle */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xl font-normal">
              From cliffside weddings and moonlit galas to rooftop milestone birthdays. Effortlessly curate your budgets, custom checklists, vendor rolodex, and countdowns — all with serene elegance.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {!isLoggedIn ? (
                <>
                  <Button
                    size="lg"
                    onClick={onStartFree}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 font-bold px-6 py-6 rounded-2xl gap-2 text-sm"
                  >
                    <span>Start Planning Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onExploreVibes}
                    className="border-zinc-300 hover:bg-amber-50/60 dark:border-zinc-700 dark:hover:bg-zinc-800 font-bold px-5 py-6 rounded-2xl gap-2 text-sm"
                  >
                    <Play className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
                    <span>Try Interactive Simulator</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={onSignIn}
                    className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 font-bold px-4 py-6 rounded-2xl text-sm"
                  >
                    <span>Sign In</span>
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={onOpenDashboard}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 font-bold px-6 py-6 rounded-2xl gap-2 text-sm"
                >
                  <span>Open My Celebrations Hub ({eventsCount})</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Host Social Proof Ribbon */}
            <div className="pt-4 flex flex-wrap items-center gap-6 border-t border-zinc-200/70 dark:border-zinc-800/70">
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center">E</span>
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-rose-400 text-white font-bold text-xs flex items-center justify-center">M</span>
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-violet-400 text-white font-bold text-xs flex items-center justify-center">L</span>
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center">S</span>
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-zinc-800 text-amber-300 font-bold text-[10px] flex items-center justify-center">+2k</span>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span className="text-amber-500">★★★★★</span> 4.95 / 5 Host Delight
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Trusted across 2,500+ weddings, birthdays & private galas
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Artwork & Floating Live Glassmorphic Cards */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Real High-Resolution Generated Hero Image Container */}
            <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-amber-200/80 dark:border-zinc-800 group aspect-4/5 sm:aspect-1/1">
              <Image
                src="/images/hero-celebration.jpg"
                alt="Luxury evening celebration with champagne and fairy lights"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                priority
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Inset Main Planning Card */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-xl border border-white/60 dark:bg-zinc-900/90 dark:border-zinc-700">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500 text-white">
                      <Heart className="h-3.5 w-3.5 fill-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Amalfi Sunset Wedding
                      </p>
                      <p className="text-[10px] text-zinc-400">August 14 • 140 Guests</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    On Budget
                  </span>
                </div>

                <div className="mt-2.5 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-zinc-500">Allocated Envelopes</span>
                    <span className="text-zinc-900 dark:text-zinc-100">$24,500.00 / $25,000.00</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 w-[78%]" />
                  </div>
                </div>
              </div>

              {/* Floating Pill Top-Right: RSVP Status */}
              <div className="absolute top-4 right-4 flex items-center gap-2 rounded-2xl border border-rose-200/80 bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95 animate-float">
                <Users className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                  128 / 140 Confirmed
                </span>
              </div>

              {/* Floating Pill Top-Left: Countdown */}
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-2xl border border-amber-200/80 bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95">
                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                  🥂 45 Days Countdown
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
