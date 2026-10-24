'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Send, CheckCircle2, User } from 'lucide-react';

interface PromptPreset {
  id: string;
  pill: string;
  question: string;
  answer: string;
  bullets: string[];
}

const PRESETS: PromptPreset[] = [
  {
    id: 'cocktails',
    pill: '🍸 Signature Cocktails',
    question: 'Suggest 2 signature cocktails for a warm outdoor summer wedding with 140 guests.',
    answer:
      'For a warm outdoor wedding, you want refreshing, photogenic drinks with batched prep for quick bar service:',
    bullets: [
      'The Golden Hour Spritz: Aperol, Prosecco, blood orange slice, and a rosemary sprig. Fresh, crisp, and vibrant in photos.',
      'Smoked Rosemary Paloma: Blanco tequila, pink grapefruit soda, lime, and smoked sea salt rim.',
      'Pro Tip: Batching these two cocktails in 5-gallon glass beverage dispensers saves 45 seconds per guest at the bar, keeping the line moving!',
    ],
  },
  {
    id: 'budget',
    pill: '💰 $30k Budget Allocation',
    question: 'How should I allocate a $30,000 budget for 120 attendees without overspending?',
    answer:
      'Here is the battle-tested luxury-yet-mindful allocation for 120 guests ($250/attendee):',
    bullets: [
      'Venue & Space (40% - $12,000): Private estate or terrace with tables and chairs included.',
      'Catering & Open Bar (32% - $9,600): $80/person food + bar with passed appetizers and seasonal buffet.',
      'Photography (13% - $3,900): 8-hour coverage including second shooter and raw file rights.',
      'Florals & Decor (8% - $2,400): Repurpose ceremony ground florals to the sweetheart table to save $1,200.',
      'DJ & Sound (4% - $1,200): Sound package with wireless ceremony lapel mics.',
      'Contingency Buffer (3% - $900): Essential safety net for unexpected overtime or tips.',
    ],
  },
  {
    id: 'timeline',
    pill: '⏰ 4-Month Countdown',
    question: 'What are the most critical milestones 4 months before our celebration date?',
    answer:
      'At 4 months out, you are shifting from high-level bookings to fine details. Complete these 4 items:',
    bullets: [
      'Send formal invitation suites (paper or digital) with RSVP deadline set for 5 weeks before the date.',
      'Schedule bridal attire / bespoke suit first fitting with shoes in hand.',
      'Schedule catering menu tasting and finalize vegetarian / allergy options with the chef.',
      'Lock in day-of coordinator or assign timeline lead for vendor arrivals and photo schedules.',
    ],
  },
  {
    id: 'email',
    pill: '✉️ Venue Inquiry Draft',
    question: 'Draft a polite inquiry email to a boutique coastal venue checking dates and packages.',
    answer:
      'Here is a ready-to-send draft tailored for high response rates:',
    bullets: [
      'Subject: Private Celebration Inquiry - August 2027 [140 Guests]',
      '"Dear [Venue Events Team], My partner and I adore your property and are planning our celebration for Summer 2027 with approximately 140 guests. Could you share your current weekend availability and wedding brochure with catering policies? We would love to arrange a walk-through. Warmly, [Your Names]"',
    ],
  },
];

export function InteractiveConciergeDemo() {
  const [activePreset, setActivePreset] = useState<PromptPreset>(PRESETS[0]);
  const [customInput, setCustomInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; bullets?: string[] }>>([
    { role: 'user', text: PRESETS[0].question },
    { role: 'assistant', text: PRESETS[0].answer, bullets: PRESETS[0].bullets },
  ]);

  const handleSelectPreset = (preset: PromptPreset) => {
    setActivePreset(preset);
    setMessages([
      { role: 'user', text: preset.question },
      { role: 'assistant', text: preset.answer, bullets: preset.bullets },
    ]);
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const userText = customInput.trim();
    setCustomInput('');

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userText },
      {
        role: 'assistant',
        text: `Here is custom guidance tailored to "${userText}":`,
        bullets: [
          'Review your category budget envelopes first to ensure changes don\'t impact venue or catering minimums.',
          'Coordinate timeline milestones with your booked vendors at least 3 weeks prior.',
          'Save this recommendation directly into your celebration roadmap inside your live dashboard!',
        ],
      },
    ]);
  };

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/80 px-3 py-1 text-xs font-semibold text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300">
            <Bot className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Interactive AI Concierge Preview</span>
          </div>
          <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Test the AI Planning Concierge live
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
            Click any prompt below to see how our grounded assistant answers budgeting questions, menu curation, and timeline dilemmas.
          </p>
        </div>

        {/* 4 Interactive Prompts */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                activePreset.id === preset.id
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {preset.pill}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Chat Interface */}
      <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950/50 space-y-4 max-h-[380px] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-600 text-white shrink-0 mt-0.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium rounded-tr-xs'
                  : 'bg-white text-zinc-900 border border-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 rounded-tl-xs shadow-2xs'
              }`}
            >
              <p className="font-semibold">{msg.text}</p>
              {msg.bullets && (
                <ul className="mt-2.5 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800 pt-2 text-xs">
                  {msg.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-800 text-white shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Input Form */}
      <form onSubmit={handleSendCustom} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Ask anything (e.g. 'How much champagne for 80 guests?')..."
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="rounded-xl bg-violet-600 px-4 py-2.5 text-white disabled:opacity-40 hover:bg-violet-700 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
