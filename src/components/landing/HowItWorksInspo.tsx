'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Calendar, IndianRupee, CheckCircle2 } from 'lucide-react';

interface HowItWorksInspoProps {
  onStartPlanning?: () => void;
}

export function HowItWorksInspo({ onStartPlanning }: HowItWorksInspoProps = {}) {
  return (
    <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-24 overflow-hidden bg-[#161233] text-white border-b border-amber-900/20">
      {/* Background Indian Celebration Studio Image with subtle dark gradient overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/image (1).jpg"
          alt="CelebrateKaro Planning Studio with Mandap blueprints and timelines"
          fill
          sizes="100vw"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#161233] via-[#1E1B4B]/95 to-[#161233]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-500/15 border border-amber-400/30 px-3.5 py-1 rounded-full backdrop-blur-md font-body">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Simple &amp; Serene Planning
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight">
            How CelebrateKaro Works
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-body">
            Shubh Muhurat date se lekar last Mithai box tak — three simple steps to a world-class celebration.
          </p>
        </div>

        {/* 3 Warm Ivory Indian Cards with Visual Headers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 1: Muhurat & Archetype */}
          <div className="bg-[#FAF6EF] rounded-3xl p-7 sm:p-8 text-center text-[#1E1B4B] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-amber-300/40">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100/90 flex items-center justify-center text-amber-800 shadow-xs border border-amber-200">
                <Calendar className="w-7 h-7 text-amber-700" />
              </div>

              <h3 className="font-serif text-2xl font-bold tracking-tight text-[#1E1B4B]">
                1. Set Your Date &amp; Vibe
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal font-body">
                Apna celebration archetype choose karo — Royal Shaadi, rooftop Janamdin, ya sacred community Bhandara. Shubh muhurat dates aur guest count enter karte hi custom roadmap ready.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 border border-amber-300/60 px-3.5 py-1 rounded-full font-body">
                Step 01
              </span>
            </div>
          </div>

          {/* Step 2: Kifayati Envelopes */}
          <div className="bg-[#FAF6EF] rounded-3xl p-7 sm:p-8 text-center text-[#1E1B4B] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-amber-300/40">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-100/90 flex items-center justify-center text-rose-800 shadow-xs border border-rose-200">
                <IndianRupee className="w-7 h-7 text-[#9E1B32]" />
              </div>

              <h3 className="font-serif text-2xl font-bold tracking-tight text-[#1E1B4B]">
                2. Kifayati Budget Envelopes
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal font-body">
                Venue, Halwai catering, Mandap decor aur photography ke liye exact envelopes allocate karo. Real-time variance tracking ke saath family budget hamesha control mein rahega.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 bg-rose-200/70 border border-rose-300/60 px-3.5 py-1 rounded-full font-body">
                Step 02
              </span>
            </div>
          </div>

          {/* Step 3: AI Tayaari & Vendors */}
          <div className="bg-[#FAF6EF] rounded-3xl p-7 sm:p-8 text-center text-[#1E1B4B] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-amber-300/40">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100/90 flex items-center justify-center text-emerald-800 shadow-xs border border-emerald-200">
                <CheckCircle2 className="w-7 h-7 text-emerald-700" />
              </div>

              <h3 className="font-serif text-2xl font-bold tracking-tight text-[#1E1B4B]">
                3. AI Tayaari &amp; Vendors
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal font-body">
                Pandits, Dholwalas, Mehendi artists aur caterers ko effortlessly coordinate karo. Automated vendor checklists aur run-of-show milestones se celebration day 100% peaceful rahega.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-200/70 border border-emerald-300/60 px-3.5 py-1 rounded-full font-body">
                Step 03
              </span>
            </div>
          </div>
        </div>

        {onStartPlanning && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={onStartPlanning}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-[#1E1B4B] font-bold text-sm shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#1E1B4B]" />
              Start Planning Now
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
