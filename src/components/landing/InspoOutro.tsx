'use client';

import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  HeartHandshake,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InspoOutroProps {
  onStartPlanning: () => void;
  isLoggedIn: boolean;
  onOpenDashboard: () => void;
}

export function InspoOutro({
  onStartPlanning,
  isLoggedIn,
  onOpenDashboard,
}: InspoOutroProps) {
  return (
    <section className="relative py-12 sm:py-24 lg:py-28 bg-[#FFF3C7] text-[#2A0E1C] overflow-hidden border-b-2 border-[#FEC7B4]">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Architectural Outro Feature Box (Straight square corners with crisp offset shadow) */}
        <div className="relative rounded-none border-2 border-[#F7418F] bg-white p-6 sm:p-12 lg:p-16 shadow-[4px_4px_0px_0px_#FC819E] sm:shadow-[8px_8px_0px_0px_#FC819E] text-center">
          {/* Top Tag Badge */}
          <div className="inline-flex items-center gap-2 rounded-none bg-[#FEC7B4] border border-[#F7418F] px-3.5 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-bold text-[#F7418F] shadow-xs mb-5 sm:mb-6">
            <Sparkles className="h-4 w-4 text-[#F7418F]" />
            <span>Begin Your Celebration Journey</span>
          </div>

          {/* Headline */}
          <h2 className="font-serif text-2xl sm:text-5xl lg:text-6xl font-bold text-[#2A0E1C] tracking-tight leading-[1.15] sm:leading-[1.12] max-w-4xl mx-auto">
            Ready to Plan a Celebration <br className="hidden sm:inline" />
            <span className="text-[#F7418F]">Everyone Will Remember?</span>
          </h2>

          {/* Narrative Motto Text */}
          <p className="mt-3.5 sm:mt-5 text-sm sm:text-lg lg:text-xl text-[#2A0E1C]/85 leading-relaxed max-w-2xl mx-auto font-normal">
            From intimate birthdays to grand wedding galas, let our AI coordinate real-time budgets, verified vendors, and automated checklists — while you enjoy every special moment.
          </p>

          {/* Primary Call to Action */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            {!isLoggedIn ? (
              <Button
                variant="default"
                size="lg"
                onClick={onStartPlanning}
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-base font-bold tracking-wide rounded-none cursor-pointer bg-[#F7418F] hover:bg-[#e02b78] text-white border border-[#F7418F] shadow-[3px_3px_0px_0px_#2A0E1C] sm:shadow-[4px_4px_0px_0px_#2A0E1C] flex items-center justify-center gap-2.5 transition-all"
              >
                <span>Start Planning Free</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                onClick={onOpenDashboard}
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-base font-bold tracking-wide rounded-none cursor-pointer bg-[#F7418F] hover:bg-[#e02b78] text-white border border-[#F7418F] shadow-[3px_3px_0px_0px_#2A0E1C] sm:shadow-[4px_4px_0px_0px_#2A0E1C] flex items-center justify-center gap-2.5 transition-all"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* 3 Reassurance Confidence Points */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#FEC7B4] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm text-[#2A0E1C] font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[#F7418F] stroke-[3]" />
              No Credit Card Required
            </span>
            <span className="hidden sm:inline text-[#FEC7B4]">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[#F7418F] stroke-[3]" />
              Instant 60s AI Timeline
            </span>
            <span className="hidden sm:inline text-[#FEC7B4]">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[#F7418F] stroke-[3]" />
              Free Forever for Hosts
            </span>
          </div>

          {/* 3 Value Guarantee Cards */}
          <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {/* Card 1 */}
            <div className="p-5 sm:p-6 rounded-none border border-[#FEC7B4] bg-[#FFF3C7]/40 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-none bg-[#FEC7B4] border border-[#FC819E] text-[#F7418F] mb-3.5">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#2A0E1C]">
                Instant AI Setup
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#2A0E1C]/75 leading-relaxed">
                Generate customized milestone timelines, ceremonial rituals, and budget envelopes tailored to your event type.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-5 sm:p-6 rounded-none border border-[#FEC7B4] bg-[#FFF3C7]/40 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-none bg-[#FEC7B4] border border-[#FC819E] text-[#F7418F] mb-3.5">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#2A0E1C]">
                100% Host Privacy
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#2A0E1C]/75 leading-relaxed">
                Your guest counts, budgets, and personal planning details are securely guarded and never shared without permission.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-5 sm:p-6 rounded-none border border-[#FEC7B4] bg-[#FFF3C7]/40 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-none bg-[#FEC7B4] border border-[#FC819E] text-[#F7418F] mb-3.5">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#2A0E1C]">
                Zero Spreadsheet Stress
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#2A0E1C]/75 leading-relaxed">
                Keep every quote, caterer deadline, and to-do item organized in one serene dashboard with zero spreadsheet chaos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
