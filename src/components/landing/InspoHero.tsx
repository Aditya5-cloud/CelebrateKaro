'use client';

import React from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
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
          {/* Left Column: Bold Indian Celebration Headline & Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small celebration tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/30 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Aapki Khushiyan, Hamari Tayaari</span>
            </div>

            {/* Two-Tone Punchy Indian Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              Grand Shaadis to <br />
              <span className="bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#FFA280] bg-clip-text text-transparent">
                Community Bhandaras.
              </span>
            </h1>

            {/* Crisp, Warm Subtitle */}
            <p className="text-base sm:text-xl text-slate-200 leading-relaxed max-w-xl font-normal">
              Meet <strong>CelebrateKaro</strong> — the intelligent event studio that coordinates your muhurat milestones, Halwai catering budgets, and vendor checklists in one serene space.
            </p>

            {/* Saffron Gold Pill CTA Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {!isLoggedIn ? (
                <Button
                  variant="saffron"
                  size="lg"
                  onClick={onStartPlanning}
                  className="h-13 px-8 text-sm font-black tracking-wide rounded-full cursor-pointer hover:scale-105 transition-all text-[#1E1B4B] bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] shadow-xl shadow-amber-500/25 flex items-center gap-2.5"
                >
                  <span className="uppercase text-xs tracking-wider">Plan Celebration Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="saffron"
                  size="lg"
                  onClick={onOpenDashboard}
                  className="h-13 px-8 text-sm font-black tracking-wide rounded-full cursor-pointer hover:scale-105 transition-all text-[#1E1B4B] bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] shadow-xl shadow-amber-500/25 flex items-center gap-2.5"
                >
                  <span>Open My Celebrations Hub ({eventsCount})</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Feature Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                <span className="text-amber-400">✨</span> Auspicious Muhurats
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                <span className="text-amber-400">🍲</span> Halwai & Catering Envelopes
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                <span className="text-amber-400">🥁</span> Mandap & Vendor Checklists
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual with user's attached artwork */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Main Illustration Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/30 bg-slate-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero image.jpg"
                  alt="CelebrateKaro Grand Indian Celebration Ground with Mandap, Mela, and Birthday Party"
                  className="w-full h-auto aspect-16/11 object-cover group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161233] via-transparent to-transparent opacity-60" />

                {/* Floating Festive Tag 1: Top Right */}
                <div className="absolute top-3 right-3 bg-[#1E1B4B]/90 backdrop-blur-md text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-400/40 shadow-lg">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span>Shaadi • Janamdin • Bhandara</span>
                </div>

                {/* Floating Festive Tag 2: Bottom Overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-[#161233]/90 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex items-center justify-between text-white shadow-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#1E1B4B] font-black text-xs shadow-sm">
                      CK
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight text-amber-200">
                        CelebrateKaro AI Studio
                      </p>
                      <p className="text-[10px] text-slate-300 leading-tight">
                        Authentic Indian Celebration Planning
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                    100% Synced
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AS FEATURED IN Strip (Authentic Indian celebration media) */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-white/10 text-center space-y-4">
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
