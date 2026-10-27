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
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-500/20 border border-amber-400/30 px-3.5 py-1 rounded-full backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Simple & Serene
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            How CelebrateKaro Works
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            From auspicious Muhurat to the last Mithai box — three effortless steps to a world-class Indian celebration.
          </p>
        </div>

        {/* 3 Warm Ivory Indian Cards with Visual Headers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 1: Muhurat & Archetype */}
          <div className="bg-[#FAF6EF] rounded-3xl p-8 text-center text-[#1E1B4B] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-amber-300/40">
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-sm border border-amber-200">
                <Calendar className="w-9 h-9 text-amber-700" />
              </div>

              <h3 className="text-xl font-black tracking-tight text-[#1E1B4B]">
                1. Muhurat & Vibe
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Choose your archetype — whether a royal Jaipur palace Shaadi, rooftop Janamdin, or sacred community Bhandara. Get auspicious milestones in seconds.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-3.5 py-1 rounded-full">
                Step 01
              </span>
            </div>
          </div>

          {/* Step 2: Kifayati Envelopes */}
          <div className="bg-[#FAF6EF] rounded-3xl p-8 text-center text-[#1E1B4B] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-amber-300/40">
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-800 shadow-sm border border-rose-200">
                <DollarSign className="w-9 h-9 text-[#9E1B32]" />
              </div>

              <h3 className="text-xl font-black tracking-tight text-[#1E1B4B]">
                2. Kifayati Envelopes
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Allocate Halwai catering, Mandap decor, Sangeet & Photography in exact envelopes with real-time variance so family budgets never get strained.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-3.5 py-1 rounded-full">
                Step 02
              </span>
            </div>
          </div>

          {/* Step 3: AI Tayaari & Vendors */}
          <div className="bg-[#FAF6EF] rounded-3xl p-8 text-center text-[#1E1B4B] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-amber-300/40">
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-sm border border-emerald-200">
                <CheckCircle2 className="w-9 h-9 text-emerald-700" />
              </div>

              <h3 className="text-xl font-black tracking-tight text-[#1E1B4B]">
                3. AI Tayaari Checklist
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Coordinate Pandits, Dholwalas, and Mehendi artists with synthesized RFQs and task countdowns. Arrive on celebration day calm and joyous.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-3.5 py-1 rounded-full">
                Step 03
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
