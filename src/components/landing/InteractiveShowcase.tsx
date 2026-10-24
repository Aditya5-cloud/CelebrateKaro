'use client';

import React, { useState } from 'react';

type ModuleId = 'checklist' | 'budget' | 'timeline' | 'vendors' | 'assistant' | 'email';

interface CapabilityModule {
  id: ModuleId;
  label: string;
  icon: string;
  title: string;
  badge: string;
  description: string;
  highlights: string[];
}

const CAPABILITY_MODULES: CapabilityModule[] = [
  {
    id: 'checklist',
    label: 'AI Checklists',
    icon: '✨',
    title: 'Gemini 3.5 Flash-Lite Personalized Roadmaps',
    badge: 'Real-Time AI Synthesis',
    description:
      'Dynamically generates 8 to 14 actionable celebration milestones customized specifically to your event scale, target budget, and unique aesthetic themes.',
    highlights: [
      'Tailored to Weddings, Birthdays, Community Festivals, and Custom Galas',
      'One-click planning focus presets (Budget-Conscious, Eco-Friendly, Luxury VIP)',
      'Deterministic domain fallback engine ensuring 100% offline uptime',
      'Persistent SQLite tracking with interactive completion status',
    ],
  },
  {
    id: 'budget',
    label: 'Precision Budget',
    icon: '💰',
    title: 'Integer-Cent Financial Accuracy & Variance',
    badge: 'Zero Float Rounding Discrepancy',
    description:
      'Eliminates IEEE-754 floating point penny rounding errors by storing and calculating all currency strictly in integer cents with category-level variance analytics.',
    highlights: [
      'Category breakdown: Venue, Catering, Music, Decor, Photography, Logistics',
      'Event-tailored standard distribution percentage templates',
      'Live visual progress indicator showing allocated vs. committed quotes',
      'Real-time spending variance warning system',
    ],
  },
  {
    id: 'timeline',
    label: 'Milestones',
    icon: '⏱️',
    title: 'Chronological Milestone Roadmaps with Overdue Flags',
    badge: 'Automated Deadline Alerts',
    description:
      'Organizes your celebration journey into chronological milestones with dynamic countdowns and automated flags for overdue targets.',
    highlights: [
      'Dynamic countdown badges: "In 45 days", "Tomorrow", "Today!", "12 days ago"',
      'Overdue deadline detection alerting you to pending critical path tasks',
      'Pre-populated roadmap templates tailored to celebration type',
      'Immediate milestone completion toggle with real-time stats update',
    ],
  },
  {
    id: 'vendors',
    label: 'Vendor CRM',
    icon: '📋',
    title: 'End-to-End Vendor Booking Pipeline',
    badge: '5-Stage Progression',
    description:
      'Track every caterer, florist, photographer, and venue through an organized pipeline with quote commitments and contact records.',
    highlights: [
      'Structured stages: Considering → Contacted → Booked → Paid → Cancelled',
      'Automated aggregate total calculation for committed quotes',
      '10 specialized vendor categories with direct contact details',
      'Instant connection to the GenAI Vendor Email Drafter',
    ],
  },
  {
    id: 'assistant',
    label: 'Grounded AI Chat',
    icon: '🤖',
    title: 'Real-Time Grounded Conversational Intelligence',
    badge: 'Multi-Turn Event Memory',
    description:
      'An intelligent planning assistant directly connected to your actual event data. Ask questions about budget optimization, vendor gaps, or immediate timeline priorities.',
    highlights: [
      'Directly grounded in your SQLite event numbers, budget, and vendors',
      'Multi-turn conversation history preserved per celebration',
      'Grounded fallback responses when offline or without API key',
      'Provides creative, actionable, budget-conscious suggestions',
    ],
  },
  {
    id: 'email',
    label: 'Email Drafter',
    icon: '✉️',
    title: 'One-Click Vendor Communications Drafter',
    badge: '4 Core Intent Templates',
    description:
      'Drafts polished, professional emails tailored to your exact celebration parameters with direct mailto client launching and clipboard copying.',
    highlights: [
      'Availability Inquiries, Detailed line-item RFQs, Tour/Tasting visits, and Budget Negotiations',
      'Selectable communication tone: Professional, Warm & Personal, or Direct',
      'Editable subject and body fields before sending',
      'One-click launch into your default desktop email client',
    ],
  },
];

export function InteractiveShowcase() {
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>('checklist');

  const activeModule = CAPABILITY_MODULES.find((m) => m.id === activeModuleId) || CAPABILITY_MODULES[0];

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-7 shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      {/* Capability Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        {CAPABILITY_MODULES.map((mod) => (
          <button
            key={mod.id}
            type="button"
            onClick={() => setActiveModuleId(mod.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              activeModuleId === mod.id
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <span>{mod.icon}</span>
            <span>{mod.label}</span>
          </button>
        ))}
      </div>

      {/* Module Feature Preview Card */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Description & Highlights */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeModule.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300">
              {activeModule.badge}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {activeModule.title}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {activeModule.description}
          </p>

          <div className="space-y-2 pt-2">
            {activeModule.highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Modern System Architecture Representation */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/50 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Live Production Engine
              </span>
            </div>
            <span className="text-[10px] font-semibold text-zinc-400">
              Next.js 16 + SQLite
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="rounded-xl border border-zinc-200/60 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Zero-Latency Local Database</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                All data resides securely in SQLite WAL mode with parameterized queries.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/60 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-semibold text-violet-700 dark:text-violet-300">Google Gemini 3.5 Flash-Lite</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Fast, token-optimized multimodal model delivering tailored checklists and grounded responses.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/60 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">Multi-User Ready</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Individual accounts with real-time cross-tab synchronization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
