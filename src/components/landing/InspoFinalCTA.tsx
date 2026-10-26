'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InspoFinalCTAProps {
  onStartPlanning: () => void;
  isLoggedIn: boolean;
  onOpenDashboard: () => void;
}

export function InspoFinalCTA({
  onStartPlanning,
  isLoggedIn,
  onOpenDashboard,
}: InspoFinalCTAProps) {
  return (
    <section className="py-20 sm:py-28 bg-[#faf8f4] px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-4xl pt-16">
        {/* Whimsical Illustrated Character & Celebration Cat Peeking (Matching Screenshot 6) */}
        <div className="absolute top-0 left-8 sm:left-16 z-20 pointer-events-none">
          <svg width="220" height="90" viewBox="0 0 220 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ginger Celebration Cat sleeping on top border */}
            <path d="M120 70 C120 50 145 42 165 52 C175 42 195 48 198 68" stroke="#073330" strokeWidth="2.5" fill="#ff9e7d" />
            <polygon points="128,52 134,38 142,50" fill="#ff9e7d" stroke="#073330" strokeWidth="2" />
            <polygon points="182,50 190,38 196,52" fill="#ff9e7d" stroke="#073330" strokeWidth="2" />
            <path d="M140 60 Q 150 64 160 60" stroke="#073330" strokeWidth="2" strokeLinecap="round" />
            {/* Cat tail hanging over */}
            <path d="M196 68 Q 208 72 204 84" stroke="#ff9e7d" strokeWidth="6" strokeLinecap="round" />

            {/* Cheerful Host with glasses pointing */}
            <circle cx="48" cy="48" r="24" fill="#00e599" stroke="#073330" strokeWidth="2.5" />
            {/* Hair */}
            <path d="M26 40 C28 20 68 20 70 40 C70 32 40 28 26 40 Z" fill="#073330" />
            {/* Round Glasses */}
            <circle cx="40" cy="46" r="8" stroke="#ff9e7d" strokeWidth="3" fill="none" />
            <circle cx="56" cy="46" r="8" stroke="#ff9e7d" strokeWidth="3" fill="none" />
            <line x1="48" y1="46" x2="48" y2="46" stroke="#ff9e7d" strokeWidth="3" />
            {/* Smile */}
            <path d="M44 56 Q 48 60 52 56" stroke="#073330" strokeWidth="2" strokeLinecap="round" />
            {/* Pointing Hand with Green Sleeve */}
            <path d="M68 62 L94 58 C98 57 104 60 102 64 C100 68 94 68 94 68" stroke="#073330" strokeWidth="3" fill="#ff9e7d" strokeLinecap="round" />
          </svg>
        </div>

        {/* Soft Sky-Blue Card Container (Matching Inspo) */}
        <div className="relative rounded-3xl bg-[#bfe8ff] p-8 sm:p-16 text-center text-[#073330] shadow-xl border border-[#93c5fd]">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl mx-auto">
            Never stress over event planning again.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-xl mx-auto font-medium">
            Everything magical about celebrating with the people you love, without the chaos of spreadsheets and lost vendor emails.
          </p>

          <div className="mt-8 flex justify-center">
            {!isLoggedIn ? (
              <Button
                variant="royal"
                size="lg"
                onClick={onStartPlanning}
                className="h-13 px-9 text-sm font-black tracking-wider rounded-full cursor-pointer hover:scale-105 transition-all text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-xl flex items-center gap-2.5"
              >
                <span className="uppercase text-xs tracking-wider">Start Planning Now</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="royal"
                size="lg"
                onClick={onOpenDashboard}
                className="h-13 px-9 text-sm font-black tracking-wider rounded-full cursor-pointer hover:scale-105 transition-all text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-xl flex items-center gap-2.5"
              >
                <span>Go to My Celebrations Hub</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
