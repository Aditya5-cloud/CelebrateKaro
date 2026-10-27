'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, DollarSign, Sparkles } from 'lucide-react';

interface CelebrationCard {
  id: string;
  title: string;
  location: string;
  image: string;
  badge: string;
  scale: string;
  guests: number;
  category: string;
}

const CELEBRATIONS: CelebrationCard[] = [
  {
    id: '1',
    title: 'Royal Vivah & Shaadi',
    location: 'Palace Courtyard, Jaipur • Sunset Pheras',
    image: '/images/wedding.jpg',
    badge: '$38,000 Target',
    scale: '350 Guests • Mandap, Sangeet & Halwai Synced',
    guests: 350,
    category: '💍 Shaadi & Vivah',
  },
  {
    id: '2',
    title: 'Family Janamdin Milestone',
    location: 'Family Courtyard, South Mumbai • 80th Milestone',
    image: '/images/BIrthday.jpg',
    badge: '$6,500 Target',
    scale: '85 Guests • Multi-Generation Feast & Mithai',
    guests: 85,
    category: '🎂 Janamdin',
  },
  {
    id: '3',
    title: 'Mahaprasad Sewa Bhandara',
    location: 'Community Ghats, Varanasi • Annual Festivity',
    image: '/images/Bhandara.jpg',
    badge: '$12,500 Target',
    scale: '1,200 Guests • Traditional Pangat Service',
    guests: 1200,
    category: '🍲 Bhandara & Mela',
  },
  {
    id: '4',
    title: 'Sangeet & Tayaari Studio',
    location: 'Heritage Resort, Delhi NCR • Choreography & Band',
    image: '/images/image (1).jpg',
    badge: '$22,000 Target',
    scale: '220 Guests • Stage, Audio & Decor Envelopes',
    guests: 220,
    category: '🎉 Festive Social',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CelebrationsCarousel({ onSelectEvent }: { onSelectEvent?: (title: string) => void } = {}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((curr) => (curr > 0 ? curr - 1 : CELEBRATIONS.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((curr) => (curr < CELEBRATIONS.length - 1 ? curr + 1 : 0));
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF6EF] text-[#1E1B4B] overflow-hidden border-b border-amber-900/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading with Saffron Accent */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Real Indian Celebrations</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#1E1B4B]">
            From grand <span className="bg-amber-100 text-[#9E1B32] px-3 py-1 rounded-2xl shadow-xs">Shaadis</span> to sacred <span className="bg-amber-100 text-[#D97706] px-3 py-1 rounded-2xl shadow-xs">Bhandaras</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-normal">
            Every tradition, every auspicious date, and every caterer tracked with peace of mind.
          </p>
        </div>

        {/* Carousel Showcase */}
        <div className="relative">
          {/* Card Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {CELEBRATIONS.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={item.id}
                  className={`group relative rounded-3xl overflow-hidden cursor-default transition-all duration-300 select-none border border-amber-900/10 ${
                    isSelected
                      ? 'scale-103 shadow-2xl ring-3 ring-[#F59E0B] -translate-y-1.5 z-20'
                      : 'opacity-95 shadow-md hover:shadow-xl z-10'
                  }`}
                >
                  {/* Photo Frame */}
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161233] via-[#161233]/40 to-transparent" />

                    {/* Floating Badge: Top Left Category */}
                    <div className="absolute top-3.5 left-3.5 bg-[#1E1B4B]/90 backdrop-blur-md text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full shadow-md border border-amber-400/30">
                      {item.category}
                    </div>

                    {/* Floating Budget Badge: Top Right */}
                    <div className="absolute top-3.5 right-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{item.badge}</span>
                    </div>

                    {/* Card Content Overlay at Bottom */}
                    <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                      <span className="text-[11px] text-amber-300 font-bold block">
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

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous celebration"
              className="w-11 h-11 rounded-full bg-[#1E1B4B] text-amber-300 flex items-center justify-center hover:bg-[#2e2968] hover:scale-105 transition-all shadow-md cursor-pointer border border-amber-400/20"
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
                    i === activeIndex ? 'w-8 bg-[#D97706]' : 'w-2.5 bg-stone-300'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next celebration"
              className="w-11 h-11 rounded-full bg-[#1E1B4B] text-amber-300 flex items-center justify-center hover:bg-[#2e2968] hover:scale-105 transition-all shadow-md cursor-pointer border border-amber-400/20"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
