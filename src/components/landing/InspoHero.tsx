'use client';

import React from 'react';
import { ArrowRight, Sparkles, Heart, Wine } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InspoHeroProps {
  onStartPlanning: () => void;
  isLoggedIn: boolean;
  onOpenDashboard: () => void;
  eventsCount: number;
}

export function InspoHero({
  onStartPlanning,
  isLoggedIn,
  onOpenDashboard,
  eventsCount,
}: InspoHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#073330] text-white pt-10 pb-16 sm:pt-16 sm:pb-24">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#00e599]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#ff9e7d]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Humanist Editorial Headline & Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small celebration tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold text-[#00e599] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#00e599]" />
              <span>Modern Celebration & Event Studio</span>
            </div>

            {/* Inspo-Style Two-Tone Punchy Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              Less chaos.<br />
              <span className="text-[#ff9e7d]">More celebrating.</span>
            </h1>

            {/* Crisp, Warm Subtitle */}
            <p className="text-base sm:text-xl text-slate-200 leading-relaxed max-w-xl font-normal">
              Meet the intuitive event studio that coordinates your roadmaps, precision budget envelopes, and vendors in one serene space.
            </p>

            {/* Electric Mint Pill CTA Button */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              {!isLoggedIn ? (
                <Button
                  variant="mint"
                  size="lg"
                  onClick={onStartPlanning}
                  className="h-13 px-8 text-sm font-black tracking-wide rounded-full cursor-pointer hover:scale-105 transition-all text-[#073330] shadow-xl shadow-[#00e599]/20 flex items-center gap-2.5"
                >
                  <span className="uppercase text-xs tracking-wider">Start Planning</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="mint"
                  size="lg"
                  onClick={onOpenDashboard}
                  className="h-13 px-8 text-sm font-black tracking-wide rounded-full cursor-pointer hover:scale-105 transition-all text-[#073330] shadow-xl shadow-[#00e599]/20 flex items-center gap-2.5"
                >
                  <span>Open My Celebrations Hub ({eventsCount})</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: Tilted Photographic Collage / Masonry (Matching Going Inspo) */}
          <div className="lg:col-span-5 relative flex justify-center items-center min-h-[420px]">
            {/* Background floating collage layout */}
            <div className="relative w-full max-w-md sm:max-w-lg h-[440px]">
              {/* Card 1: Coastal Terrace Wedding (Top Right, tilted -rotate-3) */}
              <div className="absolute top-0 right-4 w-52 sm:w-60 aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 -rotate-3 hover:rotate-0 transition-transform duration-300 group z-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/celebration-terrace.jpg"
                  alt="Coastal terrace celebration under sunset"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                  <Heart className="w-3 h-3 text-[#ff9e7d] fill-[#ff9e7d]" />
                  Amalfi Wedding
                </div>
              </div>

              {/* Card 2: Main Warm Celebration / Table Setting (Center Left, tilted rotate-2) */}
              <div className="absolute top-20 left-2 w-56 sm:w-64 aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 rotate-2 hover:rotate-0 transition-transform duration-300 group z-30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero-celebration.jpg"
                  alt="Table dinner celebration with glowing lights"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2.5 left-2.5 bg-[#073330]/85 backdrop-blur-md text-[#00e599] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#00e599]/30">
                  <Wine className="w-3 h-3" />
                  Rooftop Birthday • 65 Guests
                </div>
              </div>

              {/* Card 3: Grand Gala / Ballroom (Bottom Right, tilted -rotate-1) */}
              <div className="absolute bottom-2 right-8 w-52 sm:w-60 aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 -rotate-1 hover:rotate-0 transition-transform duration-300 group z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/celebration-gala.jpg"
                  alt="Elegant evening starlight ballroom gala"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Starlight Gala
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AS SEEN IN / FEATURED IN Strip (Matching Screenshot 2) */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-white/10 text-center space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            As Featured In & Loved By Modern Event Planners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75">
            <span className="font-serif font-black text-lg sm:text-xl tracking-wider text-slate-200">
              VOGUE
            </span>
            <span className="font-sans font-bold text-base sm:text-lg tracking-tight text-slate-200">
              the knot
            </span>
            <span className="font-serif font-bold text-base sm:text-lg tracking-wide text-slate-200">
              TOWN & COUNTRY
            </span>
            <span className="font-sans font-extrabold text-base sm:text-lg tracking-widest text-slate-200">
              BRIDES
            </span>
            <span className="font-serif italic font-bold text-base sm:text-lg text-slate-200">
              Modern Luxury
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
