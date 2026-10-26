'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HowItWorksInspoProps {
  onStartPlanning: () => void;
}

export function HowItWorksInspo({ onStartPlanning }: HowItWorksInspoProps) {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden bg-slate-900">
      {/* Scenic Background Image with cinematic overlay */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/celebration-terrace.jpg"
          alt="Scenic coastal celebration terrace"
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#073330] via-slate-950/80 to-[#faf8f4]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#00e599] bg-white/10 px-3.5 py-1 rounded-full backdrop-blur-md">
            Simple & Serene
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            How CelebratePro Works
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            From initial concept to your last dance — three effortless steps to a world-class celebration.
          </p>
        </div>

        {/* 3 Inspo-Style Warm Cream Cards with Illustrated Headers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 1: Start with your date */}
          <div className="bg-[#fffdfa] rounded-3xl p-8 text-center text-[#073330] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-slate-100">
            <div className="space-y-4">
              {/* Whimsical Champagne Toast Illustration */}
              <div className="mx-auto w-24 h-24 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Confetti Sparks */}
                  <circle cx="50" cy="18" r="4" fill="#ff9e7d" />
                  <path d="M28 25 L34 22" stroke="#00e599" strokeWidth="3" strokeLinecap="round" />
                  <path d="M72 25 L66 22" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
                  {/* Flute 1 */}
                  <path d="M38 32 C38 48 46 54 46 64 L46 76" stroke="#073330" strokeWidth="3" strokeLinecap="round" />
                  <path d="M38 76 L54 76" stroke="#073330" strokeWidth="3" strokeLinecap="round" />
                  <path d="M35 32 C35 44 43 50 43 50 L53 50 C53 44 51 32 51 32 Z" fill="#ff9e7d" opacity="0.3" stroke="#073330" strokeWidth="3" />
                  {/* Flute 2 (clinking) */}
                  <path d="M62 32 C62 48 54 54 54 64 L54 76" stroke="#073330" strokeWidth="3" strokeLinecap="round" />
                  <path d="M46 76 L62 76" stroke="#073330" strokeWidth="3" strokeLinecap="round" />
                  <path d="M65 32 C65 44 57 50 57 50 L47 50 C47 44 49 32 49 32 Z" fill="#00e599" opacity="0.3" stroke="#073330" strokeWidth="3" />
                  {/* Clink burst */}
                  <circle cx="50" cy="40" r="3" fill="#00e599" />
                </svg>
              </div>

              <h3 className="text-xl font-black tracking-tight text-[#073330]">
                Start with your date & vibe.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Choose your celebration archetype — whether an intimate coastal wedding, rooftop birthday, or charity gala. Get a tailored countdown roadmap in seconds.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00e599] bg-[#073330] px-3 py-1 rounded-full">
                Step 01
              </span>
            </div>
          </div>

          {/* Step 2: Balance Envelopes */}
          <div className="bg-[#fffdfa] rounded-3xl p-8 text-center text-[#073330] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-slate-100">
            <div className="space-y-4">
              {/* Whimsical Binoculars / Precision Envelope Illustration */}
              <div className="mx-auto w-24 h-24 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Binoculars Body */}
                  <rect x="24" y="32" width="22" height="36" rx="6" fill="#00e599" stroke="#073330" strokeWidth="3" />
                  <rect x="54" y="32" width="22" height="36" rx="6" fill="#00e599" stroke="#073330" strokeWidth="3" />
                  {/* Bridge */}
                  <rect x="42" y="44" width="16" height="8" rx="2" fill="#073330" />
                  {/* Lenses */}
                  <circle cx="35" cy="56" r="6" fill="#073330" />
                  <circle cx="65" cy="56" r="6" fill="#073330" />
                  <circle cx="33" cy="54" r="2" fill="white" />
                  <circle cx="63" cy="54" r="2" fill="white" />
                  {/* Eyepieces */}
                  <rect x="28" y="24" width="14" height="8" rx="2" fill="#ff9e7d" stroke="#073330" strokeWidth="2.5" />
                  <rect x="58" y="24" width="14" height="8" rx="2" fill="#ff9e7d" stroke="#073330" strokeWidth="2.5" />
                </svg>
              </div>

              <h3 className="text-xl font-black tracking-tight text-[#073330]">
                Balance your envelopes.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Allocate venue, catering, floral, and entertainment envelopes in exact integer cents with automated variance tracking so you never overspend.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00e599] bg-[#073330] px-3 py-1 rounded-full">
                Step 02
              </span>
            </div>
          </div>

          {/* Step 3: Celebrate Flawlessly */}
          <div className="bg-[#fffdfa] rounded-3xl p-8 text-center text-[#073330] shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-slate-100">
            <div className="space-y-4">
              {/* Whimsical Cheering Toast / Checkmark Illustration */}
              <div className="mx-auto w-24 h-24 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Cheerful Hand with Sleeve */}
                  <path d="M38 78 L38 52 C38 46 44 42 50 42 C56 42 62 46 62 52 L62 78 Z" fill="#00e599" stroke="#073330" strokeWidth="3" />
                  <path d="M32 78 L68 78" stroke="#073330" strokeWidth="3" strokeLinecap="round" />
                  {/* Checkmark card */}
                  <rect x="36" y="20" width="28" height="32" rx="4" fill="#fffdfa" stroke="#073330" strokeWidth="3" />
                  <path d="M42 34 L48 40 L58 28" stroke="#00e599" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="28" cy="24" r="3" fill="#ff9e7d" />
                  <circle cx="72" cy="30" r="3" fill="#4f46e5" />
                </svg>
              </div>

              <h3 className="text-xl font-black tracking-tight text-[#073330]">
                Celebrate with calm.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Coordinate vendors with built-in quote requests, check off run-of-show milestones, and arrive at your celebration completely stress-free.
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00e599] bg-[#073330] px-3 py-1 rounded-full">
                Step 03
              </span>
            </div>
          </div>
        </div>

        {/* Overlapping Lime Banner (Matching Screenshot 3) */}
        <div className="mt-14 max-w-4xl mx-auto rounded-3xl bg-[#dcfce7] p-8 sm:p-12 text-center text-[#073330] shadow-2xl border border-[#bbf7d0]">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
            Planned. Coordinated. <span className="text-[#073330] underline decoration-[#00e599] decoration-4">Celebrated.</span>
          </h3>
          <p className="mt-3 text-sm sm:text-base text-slate-700 max-w-xl mx-auto font-medium">
            Curated timelines, precision budget envelopes, and seamless vendor coordination — all in one place.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              variant="royal"
              size="lg"
              onClick={onStartPlanning}
              className="h-12 px-8 text-sm font-bold tracking-wide rounded-full cursor-pointer hover:scale-105 transition-all text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-xl flex items-center gap-2"
            >
              <span>START PLANNING NOW</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
