'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  const handleGenerateDraft = useCallback(
    async (
      typeToUse: EmailType = 'inquiry',
      toneToUse: EmailTone = 'professional',
      questionsToUse = ''
    ) => {
      if (!vendor) return;
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
    },
    [event.id, vendor]
  );

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
  }, [isOpen, vendor, onClose, handleGenerateDraft]);

  if (!isOpen || !vendor) return null;

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-none shadow-2xl border-2 border-[#2A0E1C] overflow-hidden my-auto sm:my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#FFF3C7] border-b border-[#FEC7B4] text-[#2A0E1C] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base sm:text-lg">✨</span>
              <h2 id="email-modal-title" className="text-base sm:text-lg font-bold tracking-tight text-[#2A0E1C] font-headline">
                AI Vendor Email Drafter
              </h2>
            </div>
            <p className="text-xs text-[#2A0E1C]/70 mt-0.5">
              Drafting message to <span className="font-bold text-[#2A0E1C]">{vendor.name}</span> ({vendor.category})
            </p>
          </div>
          <button
            type="button"
            ref={initialFocusRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-none text-[#2A0E1C]/60 hover:text-[#2A0E1C] hover:bg-[#FEC7B4]/40 transition-colors focus:outline-hidden cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 bg-[#FFF3C7]/10">
          {error && (
            <div
              role="alert"
              className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-none font-bold"
            >
              {error}
            </div>
          )}

          {/* Email Type Selection */}
          <div>
            <label className="block text-xs font-bold text-[#2A0E1C]/70 uppercase tracking-wider mb-2">
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
                  className={`p-2.5 rounded-none border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    emailType === t.id
                      ? 'bg-[#F7418F] text-white border-[#F7418F] shadow-xs'
                      : 'bg-white text-[#2A0E1C] border-[#FEC7B4] hover:bg-[#FEC7B4]/40'
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
              <label htmlFor="email-tone-select" className="block text-xs font-bold text-[#2A0E1C] mb-1">
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
                className="w-full px-3 py-2 text-xs rounded-none border border-[#FEC7B4] bg-white text-[#2A0E1C] focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F]"
              >
                <option value="professional">Professional & Courteous</option>
                <option value="warm">Warm & Enthusiastic</option>
                <option value="direct">Direct & Concise</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="specific-questions-input" className="block text-xs font-bold text-[#2A0E1C] mb-1">
                Specific Questions / Notes to include:
              </label>
              <div className="flex gap-2">
                <input
                  id="specific-questions-input"
                  type="text"
                  value={specificQuestions}
                  onChange={(e) => setSpecificQuestions(e.target.value)}
                  placeholder="e.g. Inquire about dietary menu, setup time..."
                  className="flex-1 px-3 py-2 text-xs rounded-none border border-[#FEC7B4] text-[#2A0E1C] bg-white focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F]"
                />
                <button
                  type="button"
                  onClick={() => handleGenerateDraft(emailType, tone, specificQuestions)}
                  disabled={isGenerating}
                  className="px-3 py-2 text-xs font-bold rounded-none bg-[#F7418F] text-white hover:bg-[#F7418F]/90 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? 'Drafting...' : 'Redraft'}
                </button>
              </div>
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label htmlFor="email-subject-input" className="block text-xs font-bold text-[#2A0E1C] mb-1">
              Subject Line:
            </label>
            <input
              id="email-subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm font-bold rounded-none border border-[#FEC7B4] text-[#2A0E1C] focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F] bg-white transition-colors"
            />
          </div>

          {/* Email Body */}
          <div>
            <label htmlFor="email-body-textarea" className="block text-xs font-bold text-[#2A0E1C] mb-1">
              Email Body:
            </label>
            <textarea
              id="email-body-textarea"
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Generating email body..."
              className="w-full p-3.5 text-xs sm:text-sm rounded-none border border-[#FEC7B4] text-[#2A0E1C] focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F] bg-white transition-colors resize-none font-mono"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FFF3C7] border-t border-[#FEC7B4] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#2A0E1C] bg-white hover:bg-[#FEC7B4]/40 border border-[#FEC7B4] rounded-none transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyClipboard}
              className={`px-4 py-2 text-xs font-bold rounded-none border transition-all flex items-center space-x-1.5 cursor-pointer ${
                isCopied
                  ? 'bg-[#FEC7B4] text-[#F7418F] border-[#FC819E]'
                  : 'bg-white text-[#2A0E1C] border-[#FEC7B4] hover:bg-[#FEC7B4]/40'
              }`}
            >
              <span>{isCopied ? '✓ Copied to Clipboard!' : '📋 Copy Draft'}</span>
            </button>

            <a
              href={mailtoUrl}
              className="px-4 py-2 text-xs font-bold rounded-none bg-[#F7418F] hover:bg-[#F7418F]/90 text-white shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>✉️ Open in Mail Client</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
