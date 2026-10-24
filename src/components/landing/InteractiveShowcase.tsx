'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  Clock,
  ClipboardList,
  Bot,
  Mail,
  CheckCircle2,
  Calendar,
  Heart,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

type ModuleId = 'checklist' | 'budget' | 'timeline' | 'vendors' | 'assistant' | 'email';

interface CapabilityModule {
  id: ModuleId;
  label: string;
  icon: React.ReactNode;
  title: string;
  badge: string;
  description: string;
  highlights: string[];
  preview: {
    tag: string;
    headline: string;
    statLabel: string;
    statValue: string;
    detail: string;
  };
}

const CAPABILITY_MODULES: CapabilityModule[] = [
  {
    id: 'checklist',
    label: 'Curated Checklists',
    icon: <Sparkles className="h-3.5 w-3.5 text-amber-500" />,
    title: 'Personalized Planning Roadmaps',
    badge: 'Tailored by Event Type',
    description:
      'Dynamically creates actionable celebration milestones customized specifically to your event scale, guest count, and design vision — from 12 months out to day-of coordination.',
    highlights: [
      'Tailored for Weddings, Birthdays, Anniversaries, Galas & Community Celebrations',
      'One-click planning presets (Classic Elegance, Budget-Conscious, Eco-Friendly, Grand Gala)',
      'Categorized by Venue, Catering, Florals, Attire, Music, and Photography',
      'Interactive progress tracker to keep you on schedule without overwhelm',
    ],
    preview: {
      tag: 'Checklist Progress',
      headline: 'The Grand Ballroom Wedding',
      statLabel: 'Milestones Completed',
      statValue: '18 of 24 Tasks',
      detail: 'Next: Confirm floral centerpiece mockups with Petal & Stem Co.',
    },
  },
  {
    id: 'budget',
    label: 'Smart Budgeting',
    icon: <DollarSign className="h-3.5 w-3.5 text-emerald-500" />,
    title: 'Precision Budget Envelopes & Expense Tracking',
    badge: 'Complete Financial Peace of Mind',
    description:
      'Eliminates surprises with clear category spending envelopes, committed vendor quote totals, and real-time variance alerts as you plan.',
    highlights: [
      'Standard percentage allocation templates for venue, catering, photo, and decor',
      'Track target budget vs. committed vendor contracts with zero guesswork',
      'Real-time spending variance indicators so you never overspend an envelope',
      'Direct line-item management with paid deposit notes and due dates',
    ],
    preview: {
      tag: 'Budget Envelope Status',
      headline: 'Target Budget: $25,000.00',
      statLabel: 'Committed Quotes',
      statValue: '$21,400.00',
      detail: 'Remaining buffer: $3,600.00 across 6 planned categories.',
    },
  },
  {
    id: 'timeline',
    label: 'Milestones',
    icon: <Clock className="h-3.5 w-3.5 text-rose-500" />,
    title: 'Chronological Countdowns & Deadlines',
    badge: 'Stress-Free Scheduling',
    description:
      'Organizes your celebration journey into intuitive chronological milestones with dynamic countdowns and friendly reminders for time-sensitive tasks.',
    highlights: [
      'Live countdown badges: "In 45 days", "Tomorrow", "Today!" to prioritize effortlessly',
      'Deadline protection alerting you to pending critical path bookings',
      'Pre-populated roadmap templates tailored to celebration type and calendar',
      'One-click milestone completion with instant status updates',
    ],
    preview: {
      tag: 'Timeline Countdown',
      headline: 'August 14 • 140 Guests',
      statLabel: 'Days Remaining',
      statValue: '45 Days',
      detail: 'Upcoming deadline: Final head-count submission to venue chef.',
    },
  },
  {
    id: 'vendors',
    label: 'Vendor Directory',
    icon: <ClipboardList className="h-3.5 w-3.5 text-indigo-500" />,
    title: 'Curated Vendor Rolodex & CRM',
    badge: '5-Stage Booking Pipeline',
    description:
      'Keep every caterer, florist, photographer, and DJ organized in one place with quotes, contacts, and booking progression.',
    highlights: [
      'Structured stages: Considering → Contacted → Booked → Paid → Completed',
      'Automated aggregate total calculation for committed contracts',
      '10 specialized vendor categories with direct contacts, emails, and links',
      'One-click connection to the automated Vendor Email Drafter',
    ],
    preview: {
      tag: 'Vendor Pipeline',
      headline: '7 Preferred Vendors',
      statLabel: 'Booked & Confirmed',
      statValue: '5 Booked • 2 In Review',
      detail: 'Confirmed: Seaside Manor (Venue), Lumina Photography, Chef Julien Catering.',
    },
  },
  {
    id: 'assistant',
    label: 'AI Concierge',
    icon: <Bot className="h-3.5 w-3.5 text-violet-500" />,
    title: 'Personalized Event Planning Concierge',
    badge: 'Always Here to Help',
    description:
      'An intelligent planning concierge grounded in your live event details. Ask questions about etiquette, budget optimization, vendor gaps, or creative theme ideas.',
    highlights: [
      'Directly understands your guest count, budget, and booked vendor list',
      'Multi-turn conversation history preserved for every celebration',
      'Provides creative, actionable, and budget-conscious recommendations',
      'Helpful advice on seating charts, rain contingency plans, and dietary notes',
    ],
    preview: {
      tag: 'Concierge Suggestion',
      headline: 'Menu & Decor Consultation',
      statLabel: 'Recommendation',
      statValue: 'Family-Style Dinner',
      detail: 'Saves ~$18/guest compared to plated service while fostering warmth among tables.',
    },
  },
  {
    id: 'email',
    label: 'Email Drafter',
    icon: <Mail className="h-3.5 w-3.5 text-pink-500" />,
    title: 'One-Click Vendor Communications Drafter',
    badge: 'Polite & Professional',
    description:
      'Drafts warm, polished inquiry emails tailored to your exact celebration parameters with direct mailto client launching and one-click copying.',
    highlights: [
      'Availability Inquiries, Detailed RFQ spec sheets, Tasting requests & Quote inquiries',
      'Selectable communication tone: Warm & Personal, Elegant & Formal, or Direct',
      'Pre-filled with your event date, venue city, guest count, and estimated budget',
      'Direct launch into your email app with formatted subject and body',
    ],
    preview: {
      tag: 'Instant Draft',
      headline: 'Subject: Wedding Photography Inquiry - Aug 14',
      statLabel: 'Draft Status',
      statValue: 'Ready to Send',
      detail: 'Includes date, venue location, guest count, and aesthetic shot list requirements.',
    },
  },
];

export function InteractiveShowcase() {
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>('checklist');

  const activeModule = CAPABILITY_MODULES.find((m) => m.id === activeModuleId) || CAPABILITY_MODULES[0];

  return (
    <div className="rounded-3xl border border-amber-100/90 bg-white p-5 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
      {/* Capability Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        {CAPABILITY_MODULES.map((mod) => (
          <button
            key={mod.id}
            type="button"
            onClick={() => setActiveModuleId(mod.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              activeModuleId === mod.id
                ? 'bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-amber-50/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {mod.icon}
            <span>{mod.label}</span>
          </button>
        ))}
      </div>

      {/* Module Feature Preview Card */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Description & Highlights */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-50 dark:bg-zinc-800">
              {activeModule.icon}
            </span>
            <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase">
              {activeModule.badge}
            </Badge>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {activeModule.title}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {activeModule.description}
          </p>

          <div className="space-y-2.5 pt-2">
            {activeModule.highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Celebration Snapshot */}
        <div className="lg:col-span-5 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/40 via-white to-rose-50/30 p-5 sm:p-6 dark:border-zinc-800 dark:from-zinc-950/80 dark:via-zinc-900/60 dark:to-zinc-950/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-200/50 pb-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Live Celebration Snapshot
              </span>
            </div>
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
              {activeModule.preview.tag}
            </span>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-rose-500" />
                  {activeModule.preview.headline}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activeModule.preview.statLabel}
                </span>
                <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                  {activeModule.preview.statValue}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed bg-amber-50/50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-amber-100/60 dark:border-zinc-700/60">
                {activeModule.preview.detail}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-xl border border-zinc-200/60 bg-white/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <Users className="h-3 w-3 text-indigo-500" />
                  <span>Guests</span>
                </div>
                <p className="mt-0.5 font-bold text-zinc-900 dark:text-zinc-100">140 Attending</p>
              </div>
              <div className="rounded-xl border border-zinc-200/60 bg-white/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <Calendar className="h-3 w-3 text-amber-500" />
                  <span>Timeline</span>
                </div>
                <p className="mt-0.5 font-bold text-zinc-900 dark:text-zinc-100">In 45 Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
