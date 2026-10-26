'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  Users,
  Bot,
  Send,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';

interface CleanInteractiveStudioProps {
  onStartPlanning?: (type: string, guests: number, budget: number) => void;
}

const EVENT_PRESETS = [
  { id: 'wedding', label: '💍 Wedding', name: 'Coastal Garden Wedding', defaultGuests: 120, defaultBudget: 28000, color: 'from-rose-500 to-pink-600' },
  { id: 'birthday', label: '🎂 30th Birthday', name: 'Skyline Rooftop Party', defaultGuests: 65, defaultBudget: 8500, color: 'from-amber-500 to-orange-600' },
  { id: 'gala', label: '🥂 Charity Gala', name: 'Conservatory Starlight Gala', defaultGuests: 200, defaultBudget: 48000, color: 'from-violet-500 to-purple-600' },
];

const CONCIERGE_PRESETS = [
  {
    chip: '🍸 Signature Cocktails',
    q: 'Suggest 2 signature cocktails for a warm outdoor celebration.',
    a: 'Here are two high-yield, crowd-pleasing cocktails easy for caterers to batch:',
    tips: [
      'The Golden Hour Spritz: Aperol, Prosecco, blood orange slice, and a fresh rosemary sprig.',
      'Smoked Rosemary Paloma: Blanco tequila, grapefruit soda, fresh lime juice, and smoked sea salt rim.',
      'Pro Tip: Pre-batching in 5-gallon dispensers cuts bar wait time in half!',
    ],
  },
  {
    chip: '💰 Budget Breakdown',
    q: 'How should I allocate a $25,000 budget for 100 guests?',
    a: 'Here is the ideal luxury-conscious allocation ($250/attendee):',
    tips: [
      'Venue & Space (40% - $10,000): Tables, chairs, and site coordinator included.',
      'Food & Bar (30% - $7,500): Passed hors d\'oeuvres and seasonal buffet with wine.',
      'Photography & Video (14% - $3,500): 8-hour documentary coverage.',
      'Florals & Ambiance (10% - $2,500): Repurpose ceremony florals to the reception.',
      'DJ & Sound (6% - $1,500): Wireless lapel mics and reception sound setup.',
    ],
  },
  {
    chip: '⏰ 4-Month Deadlines',
    q: 'What are the critical tasks 4 months before my event date?',
    a: 'At 4 months out, focus on locking in these time-sensitive items:',
    tips: [
      'Mail formal invitation suites with RSVP deadline set for 5 weeks before the date.',
      'Schedule catering tasting and confirm dietary restrictions with your chef.',
      'Book first formal attire fitting with ceremony footwear ready.',
    ],
  },
];

export function CleanInteractiveStudio({ onStartPlanning }: CleanInteractiveStudioProps) {
  const [activeTab, setActiveTab] = useState<'budget' | 'concierge'>('budget');

  // Budget Calculator state
  const [selectedType, setSelectedType] = useState('wedding');
  const [guests, setGuests] = useState(120);
  const [budget, setBudget] = useState(28000);

  const handleSelectPreset = (preset: typeof EVENT_PRESETS[0]) => {
    setSelectedType(preset.id);
    setGuests(preset.defaultGuests);
    setBudget(preset.defaultBudget);
  };

  const costPerGuest = guests > 0 ? Math.round(budget / guests) : 0;

  // Concierge state
  const [activeConcierge, setActiveConcierge] = useState(CONCIERGE_PRESETS[0]);
  const [customMsg, setCustomMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'user', text: CONCIERGE_PRESETS[0].q },
    { role: 'assistant', text: CONCIERGE_PRESETS[0].a, tips: CONCIERGE_PRESETS[0].tips },
  ]);

  const handleSelectConcierge = (item: typeof CONCIERGE_PRESETS[0]) => {
    setActiveConcierge(item);
    setChatHistory([
      { role: 'user', text: item.q },
      { role: 'assistant', text: item.a, tips: item.tips },
    ]);
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    const txt = customMsg.trim();
    setCustomMsg('');
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', text: txt },
      {
        role: 'assistant',
        text: `Here is tailored advice for "${txt}":`,
        tips: [
          'Review your category budget envelopes first so you stay within target.',
          'Confirm guest headcount 3 weeks prior with your venue catering team.',
          'Save this directly into your dashboard once you create your celebration!',
        ],
      },
    ]);
  };

  const envelopes = [
    { label: 'Venue & Reception', pct: 40, amount: Math.round(budget * 0.4), color: 'from-amber-500 to-orange-500' },
    { label: 'Food, Cake & Bar', pct: 30, amount: Math.round(budget * 0.3), color: 'from-rose-500 to-pink-500' },
    { label: 'Photography & Film', pct: 14, amount: Math.round(budget * 0.14), color: 'from-violet-500 to-purple-500' },
    { label: 'Florals & Styling', pct: 10, amount: Math.round(budget * 0.1), color: 'from-emerald-500 to-teal-500' },
    { label: 'DJ, Band & Sound', pct: 6, amount: Math.round(budget * 0.06), color: 'from-blue-500 to-cyan-500' },
  ];

  return (
    <section className="py-16 sm:py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-[#073330]/15 bg-[#fffdfa] p-6 sm:p-10 shadow-xl">
        {/* Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#bbf7d0] bg-[#dcfce7] px-3.5 py-1 text-xs font-bold text-[#073330]">
              <Sparkles className="w-3.5 h-3.5 text-[#073330]" />
              <span>Interactive Event Studio</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-[#073330]">
              Experience the planner in action
            </h2>
          </div>

          {/* Clean 2-Tab Switcher */}
          <div className="inline-flex rounded-full bg-slate-100 p-1.5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('budget')}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'budget'
                  ? 'bg-[#073330] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#073330]'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-[#00e599]" />
              <span>Budget Calculator</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('concierge')}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'concierge'
                  ? 'bg-[#073330] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#073330]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[#ff9e7d]" />
              <span>AI Event Concierge</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Budget Calculator */}
        {activeTab === 'budget' ? (
          <div className="mt-8 space-y-8 animate-in fade-in duration-200">
            {/* Quick Archetype Selector */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
                Quick Preset:
              </span>
              {EVENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedType === preset.id
                      ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900 ring-2 ring-violet-500/40'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guests */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-violet-500" />
                    Guest Count
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {guests} Attendees
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={300}
                  step={5}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600 dark:bg-slate-700"
                />
              </div>

              {/* Target Budget */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    Target Budget
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(budget * 100)}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={80000}
                  step={1000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:bg-slate-700"
                />
              </div>
            </div>

            {/* Calculated Breakdown Envelopes */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Calculated Category Envelopes
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Est. Cost: <strong className="text-violet-600 dark:text-violet-400">${costPerGuest}</strong> / attendee
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {envelopes.map((env, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                      {env.label} ({env.pct}%)
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(env.amount * 100)}
                    </p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${env.color} rounded-full w-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
              <p className="text-xs text-slate-600 font-medium">
                ✨ Ready to customize this celebration? Your plan will be imported into your workspace.
              </p>
              <Button
                variant="mint"
                size="lg"
                onClick={() => onStartPlanning?.(selectedType, guests, budget)}
                className="w-full sm:w-auto h-12 px-7 font-black tracking-wide gap-2 rounded-full cursor-pointer text-[#073330] shadow-md"
              >
                <span>Start Planning With This Blueprint</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* Tab 2: AI Event Concierge */
          <div className="mt-8 space-y-6 animate-in fade-in duration-200">
            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
                Click a Prompt:
              </span>
              {CONCIERGE_PRESETS.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectConcierge(item)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeConcierge.chip === item.chip
                      ? 'bg-[#073330] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.chip}
                </button>
              ))}
            </div>

            {/* Conversation Log */}
            <div className="p-5 rounded-2xl bg-[#faf8f4] border border-slate-200/80 space-y-4 max-h-[340px] overflow-y-auto">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-[#073330] text-[#00e599] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#073330] text-white font-medium rounded-tr-xs'
                        : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    <p className="font-semibold">{msg.text}</p>
                    {msg.tips && (
                      <ul className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2 text-xs">
                        {msg.tips.map((tip, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00e599] shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Input */}
            <form onSubmit={handleSendCustom} className="flex items-center gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Ask any celebration question (e.g. 'How much cake for 120 guests?')..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#073330]"
              />
              <button
                type="submit"
                disabled={!customMsg.trim()}
                className="rounded-xl bg-[#073330] px-5 py-2.5 text-[#00e599] disabled:opacity-40 hover:bg-[#0c4b47] transition-colors shrink-0 font-bold cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
