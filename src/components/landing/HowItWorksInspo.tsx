'use client';

import React from 'react';
import { Sparkles, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

interface HowItWorksInspoProps {
  onStartPlanning?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HowItWorksInspo({ onStartPlanning }: HowItWorksInspoProps = {}) {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden bg-[#161233] text-white border-b border-amber-900/20">
      {/* Background Indian Celebration Studio Image with subtle dark gradient overlay */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/image (1).jpg"
          alt="CelebrateKaro Planning Studio with Mandap blueprints and Gantt charts"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#161233] via-[#1E1B4B]/95 to-[#161233]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-500/20 border border-amber-400/30 px-3.5 py-1 rounded-full backdrop-blur-md font-body">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Simple & Serene Planning
          </span>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white font-headline">
            How CelebrateKaro Works
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-body">
            Shubh Muhurat date se lekar last Mithai box tak — three simple steps to a world-class celebration.
          </p>
        </div>

        {/* 3 Warm Ivory Indian Cards with Visual Headers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 1: Muhurat & Archetype */}
          <div className="bg-[#FAF6EF] rounded-3xl p-8 text-center text-[#1E1B4B] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-amber-300/40">
            <div className="space-y-4">
              <div className="mx-auto w-18 h-18 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-sm border border-amber-200">
                <Calendar className="w-8 h-8 text-amber-700" />
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-[#1E1B4B] font-headline">
                1. Set Your Date & Vibe
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal font-body">
                Apna celebration archetype choose karo — Royal Shaadi, rooftop Janamdin, ya sacred community Bhandara. Shubh muhurat dates aur guest count enter karte hi custom roadmap ready.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3.5 py-1 rounded-full font-body">
                Step 01
              </span>
            </div>
          </div>

          {/* Step 2: Kifayati Envelopes */}
          <div className="bg-[#FAF6EF] rounded-3xl p-8 text-center text-[#1E1B4B] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-amber-300/40">
            <div className="space-y-4">
              <div className="mx-auto w-18 h-18 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-800 shadow-sm border border-rose-200">
                <DollarSign className="w-8 h-8 text-[#9E1B32]" />
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-[#1E1B4B] font-headline">
                2. Kifayati Budget Envelopes
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal font-body">
                Venue, Halwai catering, Mandap decor aur photography ke liye exact envelopes allocate karo. Real-time variance tracking ke saath family budget hamesha control mein rahega.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3.5 py-1 rounded-full font-body">
                Step 02
              </span>
            </div>
          </div>

          {/* Step 3: AI Tayaari & Vendors */}
          <div className="bg-[#FAF6EF] rounded-3xl p-8 text-center text-[#1E1B4B] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-amber-300/40">
            <div className="space-y-4">
              <div className="mx-auto w-18 h-18 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-sm border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-[#1E1B4B] font-headline">
                3. AI Tayaari & Vendors
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal font-body">
                Pandits, Dholwalas, Mehendi artists aur caterers ko effortlessly coordinate karo. Automated RFQ inquiry drafts aur run-of-show milestones se celebration day 100% peaceful rahega.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3.5 py-1 rounded-full font-body">
                Step 03
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
