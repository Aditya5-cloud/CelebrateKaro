'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
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
    <section className="py-20 sm:py-28 bg-[#FAF6EF] px-4 sm:px-6 lg:px-8 border-b border-amber-900/10">
      <div className="relative mx-auto max-w-4xl">
        {/* Soft Royal Indian Celebration Card Container */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#2A246B] to-[#161233] p-8 sm:p-16 text-center text-white shadow-2xl border-2 border-amber-400/40 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#9E1B32]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>CelebrateKaro Studio</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl mx-auto text-white">
              Aapki Khushiyan, Hamari Tayaari.
            </h2>

            <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-xl mx-auto font-normal">
              Never stress over wedding spreadsheets, Halwai negotiations, or missing vendor contacts again. CelebrateKaro brings serene joy to every celebration.
            </p>

            <div className="mt-8 flex justify-center pt-2">
              {!isLoggedIn ? (
                <Button
                  variant="saffron"
                  size="lg"
                  onClick={onStartPlanning}
                  className="h-13 px-9 text-sm font-black tracking-wider rounded-full cursor-pointer hover:scale-105 transition-all text-[#1E1B4B] bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] shadow-xl shadow-amber-500/25 flex items-center gap-2.5"
                >
                  <span className="uppercase text-xs tracking-wider">Plan Celebration Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="saffron"
                  size="lg"
                  onClick={onOpenDashboard}
                  className="h-13 px-9 text-sm font-black tracking-wider rounded-full cursor-pointer hover:scale-105 transition-all text-[#1E1B4B] bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] shadow-xl shadow-amber-500/25 flex items-center gap-2.5"
                >
                  <span>Go to My Celebrations Hub</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
