'use client';

import React from 'react';
import { ArrowRight, Sparkles, Star, CheckCircle } from 'lucide-react';
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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1E1B4B] via-[#161233] to-[#0F0C24] text-white pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-amber-500/15">
      {/* Decorative ambient background glows with festive saffron, crimson, and golden marigold */}
      <div className="absolute -top-20 right-1/4 w-[550px] h-[550px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#9E1B32]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle traditional festive geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Indian Celebration Headline in Cormorant Garamond */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small celebration tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-400/25 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md shadow-xs font-body">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>India&apos;s #1 AI Celebration &amp; Event Studio</span>
            </div>

            {/* Editorial Headline with Cormorant Garamond */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[66px] font-semibold text-white tracking-tight leading-[1.12]">
              Grand Shaadis se lekar <br className="hidden sm:inline" />
              <span className="font-serif italic font-medium bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                Community Bhandaras tak.
              </span>
            </h1>

            {/* Crisp, Relatable Hinglish Subtitle in Lato */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal font-body">
              Shubh Muhurat timelines se lekar Halwai catering envelopes aur vendor checklists tak —{' '}
              <strong className="font-semibold text-white">CelebrateKaro</strong> coordinates every celebration with effortless grace. Bina kisi stress ke, serene celebrations.
            </p>

            {/* Saffron Gold Pill CTA Button & Social Proof */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {!isLoggedIn ? (
                <Button
                  variant="saffron"
                  size="lg"
                  onClick={onStartPlanning}
                  className="h-12 px-8 text-sm font-bold tracking-wide rounded-full cursor-pointer hover:scale-105 active:scale-98 transition-all text-[#1E1B4B] bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] shadow-lg shadow-amber-500/25 flex items-center gap-2 font-body"
                >
                  <span>Start Planning Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="saffron"
                  size="lg"
                  onClick={onOpenDashboard}
                  className="h-12 px-8 text-sm font-bold tracking-wide rounded-full cursor-pointer hover:scale-105 active:scale-98 transition-all text-[#1E1B4B] bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] shadow-lg shadow-amber-500/25 flex items-center gap-2 font-body"
                >
                  <span>Open My Celebrations Hub ({eventsCount})</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {/* Host Trust Pill */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-slate-300 font-body">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
                <span className="font-medium">5,000+ Happy Hosts</span>
              </div>
            </div>

            {/* Feature Pills with delicate color indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-slate-300 font-body">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                Shubh Muhurat Timelines
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                Halwai Catering Envelopes
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                Mandap &amp; Vendor Checklists
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual — Clean without any overlay text */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Soft decorative glow behind the showcase frame */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-amber-500/20 via-rose-500/10 to-indigo-500/20 rounded-3xl blur-xl pointer-events-none" />

              {/* Luxury Frame Container */}
              <div className="relative rounded-3xl p-1.5 bg-gradient-to-b from-amber-400/30 via-white/10 to-amber-500/20 shadow-2xl backdrop-blur-xs">
                <div className="relative rounded-[20px] overflow-hidden bg-slate-900 border border-amber-400/20 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/hero image.jpg"
                    alt="CelebrateKaro Indian Celebration Ground with Mandap, Mela, and Birthday Party"
                    className="w-full h-auto aspect-16/11 object-cover group-hover:scale-102 transition-transform duration-700 block"
                  />
                </div>
              </div>

              {/* Floating Status Pill OUTSIDE the image (Top-Right) */}
              <div className="hidden sm:flex absolute -top-4 -right-3 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#161233]/95 backdrop-blur-md border border-amber-400/30 shadow-xl font-body">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">100% On-Track</p>
                  <p className="text-[10px] text-amber-300 leading-tight">Muhurat &amp; Catering Locked</p>
                </div>
              </div>

              {/* Floating Status Pill OUTSIDE the image (Bottom-Left) */}
              <div className="hidden sm:flex absolute -bottom-4 -left-3 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#161233]/95 backdrop-blur-md border border-amber-400/30 shadow-xl font-body">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">AI Coordination</p>
                  <p className="text-[10px] text-slate-300 leading-tight">Zero Spreadsheet Chaos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AS FEATURED IN Strip (Authentic Indian celebration media) */}
        <div className="mt-16 sm:mt-24 pt-10 border-t border-white/10 text-center space-y-4 font-body">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent w-16 sm:w-36" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/75">
              Trusted By Indian Hosts &amp; Wedding Planners Across India &amp; Worldwide
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent w-16 sm:w-36" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-200/80">
            <span className="font-serif font-black text-base sm:text-lg tracking-wider hover:text-white transition-colors">
              WEDMEGOOD
            </span>
            <span className="font-serif font-black text-base sm:text-lg tracking-tight hover:text-white transition-colors">
              WEDDINGSUTRA
            </span>
            <span className="font-serif font-black text-base sm:text-lg tracking-wider hover:text-white transition-colors">
              VOGUE INDIA
            </span>
            <span className="font-sans font-extrabold text-xs sm:text-sm tracking-widest hover:text-white transition-colors">
              BRIDES TODAY
            </span>
            <span className="font-serif italic font-bold text-base sm:text-lg hover:text-white transition-colors">
              Architectural Digest India
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
