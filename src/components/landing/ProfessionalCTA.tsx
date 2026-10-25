'use client';

import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfessionalCTAProps {
  onStartFree: () => void;
  onExploreDemo: () => void;
  isLoggedIn: boolean;
  onOpenDashboard: () => void;
}

export function ProfessionalCTA({
  onStartFree,
  onExploreDemo,
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
            Say goodbye to 14 messy spreadsheets and forgotten vendor emails. Experience the calm of real-time checklists, precision envelopes, and your personal event concierge.
          </p>

          {/* Primary CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="vibrant"
                  size="lg"
                  onClick={onStartFree}
                  className="h-12 px-8 text-sm font-bold gap-2 rounded-2xl cursor-pointer"
                >
                  <span>Create Your Celebration — Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={onExploreDemo}
                  className="h-12 px-6 text-sm font-semibold gap-2 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md cursor-pointer"
                >
                  <span>Explore Live Demo</span>
                </Button>
              </>
            ) : (
              <Button
                variant="vibrant"
                size="lg"
                onClick={onOpenDashboard}
                className="h-12 px-8 text-sm font-bold gap-2 rounded-2xl"
              >
                <span>Go to My Celebrations Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Zero credit card required
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Instant 30-second setup
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              Free to start & plan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
