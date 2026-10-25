'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfessionalCTAProps {
  onStartPlanning: () => void;
  isLoggedIn: boolean;
  onOpenDashboard: () => void;
}

export function ProfessionalCTA({
  onStartPlanning,
  isLoggedIn,
  onOpenDashboard,
}: ProfessionalCTAProps) {
  return (
    <section className="py-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-950 via-slate-900 to-fuchsia-950 p-8 sm:p-14 text-center text-white shadow-2xl border border-violet-800/50">
        {/* Radiant Ambient Spotlight */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-bold text-fuchsia-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Join 2,500+ Extraordinary Celebrations</span>
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
            Your next extraordinary celebration starts today.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
            Say goodbye to messy spreadsheets and forgotten vendor emails. Experience the calm of structured roadmaps, precision budget envelopes, and your personal event concierge.
          </p>

          {/* Primary CTA Button */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {!isLoggedIn ? (
              <Button
                variant="vibrant"
                size="lg"
                onClick={onStartPlanning}
                className="h-12 px-8 text-sm font-bold gap-2 rounded-2xl cursor-pointer"
              >
                <span>Create Your Celebration</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="vibrant"
                size="lg"
                onClick={onOpenDashboard}
                className="h-12 px-8 text-sm font-bold gap-2 rounded-2xl cursor-pointer"
              >
                <span>Go to My Celebrations Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
