'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, DollarSign } from 'lucide-react';

interface CelebrationCard {
  id: string;
  title: string;
  location: string;
  image: string;
  badge: string;
  scale: string;
  guests: number;
  budget: string;
}

const CELEBRATIONS: CelebrationCard[] = [
  {
    id: '1',
    title: 'Amalfi Terrace Wedding',
    location: 'Positano, Italy • Seaside Reception',
    image: '/images/celebration-terrace.jpg',
    badge: '$28,000 Target',
    scale: '120 Guests • 100% Milestones Met',
    guests: 120,
    budget: '$28,000',
  },
  {
    id: '2',
    title: 'Skyline Rooftop 30th',
    location: 'Tribeca Loft, New York • Sunset Cocktails',
    image: '/images/hero-celebration.jpg',
    badge: '$8,500 Target',
    scale: '65 Guests • Bespoke Mixology Bar',
    guests: 65,
    budget: '$8,500',
  },
  {
    id: '3',
    title: 'Conservatory Starlight Gala',
    location: 'Chicago Botanic Gardens • Annual Fundraiser',
    image: '/images/celebration-gala.jpg',
    badge: '$48,000 Target',
    scale: '200 Guests • Black-Tie & Live Auction',
    guests: 200,
    budget: '$48,000',
  },
  {
    id: '4',
    title: 'Vineyard Harvest Anniversary',
    location: 'St. Helena, Napa Valley • Long Table Dinner',
    image: '/images/ballroom-celebration.jpg',
    badge: '$12,000 Target',
    scale: '45 Guests • Farm-to-Table Feast',
    guests: 45,
    budget: '$12,000',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CelebrationsCarousel({ onSelectEvent }: { onSelectEvent?: (title: string) => void } = {}) {
  const [activeIndex, setActiveIndex] = useState(1);

  const handlePrev = () => {
    setActiveIndex((curr) => (curr > 0 ? curr - 1 : CELEBRATIONS.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((curr) => (curr < CELEBRATIONS.length - 1 ? curr + 1 : 0));
  };

  return (
    <section className="py-16 sm:py-24 bg-[#faf8f4] text-[#073330] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading with Inspo-Style Lime Highlight */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            <span className="bg-[#dcfce7] text-[#073330] px-4 py-1.5 rounded-2xl inline-block mr-2 shadow-xs">
              Real celebrations
            </span>{' '}
            our hosts brought to life
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Every scale, every milestone, effortlessly tracked and celebrated.
          </p>
        </div>

        {/* Carousel Showcase */}
        <div className="relative">
          {/* Card Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            {CELEBRATIONS.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={item.id}
                  className={`group relative rounded-3xl overflow-hidden cursor-default transition-all duration-300 select-none ${
                    isSelected
                      ? 'scale-105 shadow-2xl ring-4 ring-[#00e599] -translate-y-2 z-20'
                      : 'opacity-90 shadow-lg z-10'
                  }`}
                >
                  {/* Photo Frame */}
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#073330] via-black/30 to-transparent" />

                    {/* Floating Peach Badge (Matching Inspo) */}
                    <div className="absolute top-4 left-4 bg-[#ff9e7d] text-[#073330] text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-[#073330]" />
                      <span>{item.badge}</span>
                    </div>

                    {/* Card Content Overlay at Bottom */}
                    <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                      <span className="text-[11px] text-[#00e599] font-bold block">
                        {item.scale}
                      </span>
                      <h3 className="text-lg font-black tracking-tight leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-tight">
                        {item.location}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls (Matching Inspo dark teal circle arrow buttons) */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous celebration"
              className="w-12 h-12 rounded-full bg-[#073330] text-white flex items-center justify-center hover:bg-[#0c4b47] hover:scale-105 transition-all shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {CELEBRATIONS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    i === activeIndex ? 'w-8 bg-[#073330]' : 'w-2.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next celebration"
              className="w-12 h-12 rounded-full bg-[#073330] text-white flex items-center justify-center hover:bg-[#0c4b47] hover:scale-105 transition-all shadow-md cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
