'use client';

import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
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
    <section className="relative bg-palette-cream text-palette-dark min-h-[calc(100vh-64px)] flex flex-col justify-center py-8 sm:py-10 lg:py-12 border-b-2 border-[#FEC7B4]">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Text Content Column: Placed below image on mobile (order-2), left column on desktop (lg:order-1) */}
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-4 sm:space-y-5 text-left">
            {/* Concise, impactful headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[68px] font-bold text-[#2A0E1C] tracking-tight leading-[1.1] sm:leading-[1.08]">
              Celebrations Planned <br className="hidden sm:inline" />
              <span className="text-palette-fuchsia">
                Effortlessly with AI.
              </span>
            </h1>

            {/* Concise Motto Text */}
            <p className="text-sm sm:text-lg lg:text-xl text-palette-dark/85 leading-relaxed max-w-2xl font-normal">
              From intimate birthdays to grand wedding galas — coordinate real-time budgets, verified vendors, and automated checklists without the stress.
            </p>

            {/* Action Buttons: Straight square corners */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5">
              {!isLoggedIn ? (
                <>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={onStartPlanning}
                    className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base font-bold tracking-wide rounded-none cursor-pointer bg-[#F7418F] hover:bg-[#e02b78] text-white border border-[#F7418F] shadow-[3px_3px_0px_0px_#2A0E1C] sm:shadow-[4px_4px_0px_0px_#2A0E1C] flex items-center justify-center gap-2.5"
                  >
                    <span>Start Planning Free</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onStartPlanning}
                    className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-none cursor-pointer border-2 border-[#2A0E1C] text-[#2A0E1C] hover:bg-[#FEC7B4] hover:text-[#2A0E1C] flex items-center justify-center"
                  >
                    <span>Sign In</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="lg"
                  onClick={onOpenDashboard}
                  className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base font-bold tracking-wide rounded-none cursor-pointer bg-[#F7418F] hover:bg-[#e02b78] text-white border border-[#F7418F] shadow-[3px_3px_0px_0px_#2A0E1C] sm:shadow-[4px_4px_0px_0px_#2A0E1C] flex items-center justify-center gap-2.5"
                >
                  <span>Go to My Dashboard ({eventsCount})</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* 3 Straight square confidence pills */}
            <div className="pt-1.5 flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-[#2A0E1C] font-semibold">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 rounded-none bg-white border border-[#FEC7B4] shadow-xs">
                <Check className="h-4 w-4 text-[#F7418F] stroke-[3]" />
                Intelligent Budgeting
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 rounded-none bg-white border border-[#FEC7B4] shadow-xs">
                <Check className="h-4 w-4 text-[#F7418F] stroke-[3]" />
                Vendor Coordination
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 rounded-none bg-white border border-[#FEC7B4] shadow-xs">
                <Check className="h-4 w-4 text-[#F7418F] stroke-[3]" />
                Personalized Timelines
              </span>
            </div>
          </div>

          {/* Right Column: Hero Image placed upper on mobile (order-1), right column on desktop (lg:order-2) */}
          <div className="order-1 lg:order-2 lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Crisp Square Frame with shadow border */}
              <div className="relative rounded-none p-1.5 sm:p-2 bg-white border-2 border-[#F7418F] shadow-[4px_4px_0px_0px_#FC819E] sm:shadow-[8px_8px_0px_0px_#FC819E]">
                <div className="relative rounded-none overflow-hidden bg-[#FEC7B4]/20 border border-[#FEC7B4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/hero image.jpg"
                    alt="Celebration Planning Hub"
                    className="w-full h-auto aspect-16/10 object-cover block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
