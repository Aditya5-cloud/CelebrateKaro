'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Event, Vendor } from '@/types';

interface VendorEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  vendor: Vendor | null;
}

type EmailType = 'inquiry' | 'quote' | 'tasting_tour' | 'negotiation';
type EmailTone = 'professional' | 'warm' | 'direct';

const EMAIL_TYPES: { id: EmailType; label: string; icon: string }[] = [
  { id: 'inquiry', label: 'Availability Check', icon: '✉️' },
  { id: 'quote', label: 'Price Quote (RFQ)', icon: '📋' },
  { id: 'tasting_tour', label: 'Tasting / Tour', icon: '🗓️' },
  { id: 'negotiation', label: 'Budget Negotiation', icon: '💡' },
];

export function VendorEmailModal({
  isOpen,
  onClose,
  event,
  vendor,
}: VendorEmailModalProps) {
  const [emailType, setEmailType] = useState<EmailType>('inquiry');
  const [tone, setTone] = useState<EmailTone>('professional');
  const [specificQuestions, setSpecificQuestions] = useState('');

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialFocusRef = useRef<HTMLButtonElement>(null);

  // Auto-generate initial draft when modal opens
  useEffect(() => {
    if (!isOpen || !vendor) return;

    setEmailType('inquiry');
    setTone('professional');
    setSpecificQuestions('');
    setSubject('');
    setBody('');
    setError(null);
    setIsCopied(false);

    const timer = setTimeout(() => initialFocusRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Trigger initial draft
    handleGenerateDraft('inquiry', 'professional', '');

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, vendor, onClose]);

  if (!isOpen || !vendor) return null;

  const handleGenerateDraft = async (
    typeToUse = emailType,
    toneToUse = tone,
    questionsToUse = specificQuestions
  ) => {
    setIsGenerating(true);
    setError(null);
    setIsCopied(false);

    try {
      const res = await fetch(`/api/events/${event.id}/vendors/${vendor.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType: typeToUse,
          tone: toneToUse,
          specificQuestions: questionsToUse.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate email draft.');
      }

      setSubject(json.data.subject);
      setBody(json.data.body);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error drafting email.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyClipboard = async () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      alert('Could not copy to clipboard.');
    }
  };

  const mailtoUrl = vendor.contact_email
    ? `mailto:${vendor.contact_email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    : `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">✨</span>
              <h2 id="email-modal-title" className="text-lg font-bold tracking-tight">
                AI Vendor Email Drafter
              </h2>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Drafting message to <span className="font-semibold text-white">{vendor.name}</span> ({vendor.category})
            </p>
          </div>
          <button
            type="button"
            ref={initialFocusRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden focus:ring-2 focus:ring-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl"
            >
              {error}
            </div>
          )}

          {/* Email Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Communication Goal:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EMAIL_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setEmailType(t.id);
                    handleGenerateDraft(t.id, tone, specificQuestions);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    emailType === t.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone & Custom Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="email-tone-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Tone:
              </label>
              <select
                id="email-tone-select"
                value={tone}
                onChange={(e) => {
                  const newTone = e.target.value as EmailTone;
                  setTone(newTone);
                  handleGenerateDraft(emailType, newTone, specificQuestions);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="professional">Professional & Courteous</option>
                <option value="warm">Warm & Enthusiastic</option>
                <option value="direct">Direct & Concise</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="specific-questions-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Questions / Notes to include:
              </label>
              <div className="flex gap-2">
                <input
                  id="specific-questions-input"
                  type="text"
                  value={specificQuestions}
                  onChange={(e) => setSpecificQuestions(e.target.value)}
                  placeholder="e.g. Inquire about dietary menu, setup time..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleGenerateDraft(emailType, tone, specificQuestions)}
                  disabled={isGenerating}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-50"
                >
                  {isGenerating ? 'Drafting...' : 'Redraft'}
                </button>
              </div>
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label htmlFor="email-subject-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Line:
            </label>
            <input
              id="email-subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 hover:bg-white focus:bg-white transition-colors"
            />
          </div>

          {/* Email Body */}
          <div>
            <label htmlFor="email-body-textarea" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Body:
            </label>
            <textarea
              id="email-body-textarea"
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Generating email body..."
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors resize-none font-mono"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyClipboard}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center space-x-1.5 ${
                isCopied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{isCopied ? '✓ Copied to Clipboard!' : '📋 Copy Draft'}</span>
            </button>

            <a
              href={mailtoUrl}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <span>✉️ Open in Mail Client</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
