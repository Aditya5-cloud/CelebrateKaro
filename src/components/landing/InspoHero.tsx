'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1E1B4B] via-[#161233] to-[#0F0C24] text-white pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-amber-500/15">
      {/* Decorative ambient background glows with festive saffron, crimson, and golden marigold */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#9E1B32]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle traditional festive geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Indian Celebration Headline in Cormorant Garamond */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small celebration tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/30 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md shadow-xs font-body">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Aapki Celebrations, Hamari AI Tayaari</span>
            </div>

            {/* Headline with Cormorant Garamond */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.04] font-headline">
              Grand Shaadis se lekar <br />
              <span className="bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#FFA280] bg-clip-text text-transparent">
                Community Bhandaras tak.
              </span>
            </h1>

            {/* Crisp, Relatable Hinglish Subtitle in Lato */}
            <p className="text-base sm:text-xl text-slate-200 leading-relaxed max-w-xl font-normal font-body">
              Auspicious Muhurat timelines se lekar Halwai catering envelopes aur vendor checklists tak — <strong>CelebrateKaro</strong> keeps your whole celebration perfectly sorted. Zero stress, 100% serene celebrations.
            </p>

            {/* Saffron Gold Pill CTA Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {!isLoggedIn ? (
                <Button
                  variant="saffron"
                  size="lg"
                  onClick={onStartPlanning}
                  className="h-13 px-8 text-sm font-black tracking-wide rounded-full cursor-pointer hover:scale-105 transition-all text-[#1E1B4B] bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] shadow-xl shadow-amber-500/25 flex items-center gap-2.5 font-body"
                >
                  <span className="uppercase text-xs tracking-wider">Start Tayaari Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="saffron"
                  size="lg"
                  onClick={onOpenDashboard}
                  className="h-13 px-8 text-sm font-black tracking-wide rounded-full cursor-pointer hover:scale-105 transition-all text-[#1E1B4B] bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] shadow-xl shadow-amber-500/25 flex items-center gap-2.5 font-body"
                >
                  <span>Open My Celebrations Hub ({eventsCount})</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Feature Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300 font-body">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                <span className="text-amber-400">🌸</span> Shubh Muhurat Dates
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                <span className="text-amber-400">🍲</span> Halwai & Catering Envelopes
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                <span className="text-amber-400">🥁</span> Mandap, Sangeet & Decor Tasks
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual — Clean without any overlay text */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Clean Illustration Card without text over the image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/40 bg-slate-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero image.jpg"
                  alt="CelebrateKaro Indian Celebration Ground with Mandap, Mela, and Birthday Party"
                  className="w-full h-auto aspect-16/11 object-cover group-hover:scale-103 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AS FEATURED IN Strip (Authentic Indian celebration media) */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-white/10 text-center space-y-4 font-body">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300/80">
            Trusted By Indian Hosts & Wedding Planners Across India & Worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-80">
            <span className="font-serif font-black text-base sm:text-lg tracking-wider text-slate-200">
              WEDMEGOOD
            </span>
            <span className="font-serif font-black text-base sm:text-lg tracking-tight text-slate-200">
              WEDDINGSUTRA
            </span>
            <span className="font-serif font-black text-base sm:text-lg tracking-wider text-slate-200">
              VOGUE INDIA
            </span>
            <span className="font-sans font-extrabold text-sm sm:text-base tracking-widest text-slate-200">
              BRIDES TODAY
            </span>
            <span className="font-serif italic font-bold text-base sm:text-lg text-slate-200">
              Architectural Digest India
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
