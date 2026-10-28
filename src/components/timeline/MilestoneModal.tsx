'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Milestone } from '@/types';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventId: number;
  initialMilestone?: Milestone | null;
}

export function MilestoneModal({
  isOpen,
  onClose,
  onSuccess,
  eventId,
  initialMilestone,
}: MilestoneModalProps) {
  const isEdit = !!initialMilestone;
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMilestone) {
      setTitle(initialMilestone.title);
      setDueDate(initialMilestone.due_date);
      setDescription(initialMilestone.description || '');
      setCompleted(initialMilestone.completed);
    } else {
      setTitle('');
      setDueDate('');
      setDescription('');
      setCompleted(false);
    }
    setErrors({});
    setServerError(null);
  }, [initialMilestone, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => firstInputRef.current?.focus(), 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Please provide a milestone title.';
    } else if (title.trim().length > 120) {
      errs.title = 'Title must be 120 characters or fewer.';
    }

    if (!dueDate) {
      errs.dueDate = 'Please select a due date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        due_date: dueDate,
        description: description.trim(),
        completed,
      };

      const url = isEdit
        ? `/api/events/${eventId}/milestones/${initialMilestone.id}`
        : `/api/events/${eventId}/milestones`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error || 'Failed to save milestone.');
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setServerError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-modal-title"
        className="w-full max-w-md rounded-none bg-white p-4 sm:p-6 shadow-2xl border-2 border-[#2A0E1C] max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#FEC7B4]">
          <div>
            <h2 id="milestone-modal-title" className="text-xl font-bold text-[#2A0E1C] font-headline">
              {isEdit ? 'Edit Milestone' : 'Add Timeline Milestone'}
            </h2>
            <p className="text-xs text-[#2A0E1C]/70 mt-0.5">
              Set deadlines to keep your event planning on schedule.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-none p-2 text-[#2A0E1C]/60 hover:bg-[#FFF3C7] hover:text-[#2A0E1C] focus:outline-hidden cursor-pointer"
          >
            ✕
          </button>
        </div>

        {serverError && (
          <div
            role="alert"
            className="mt-4 rounded-none bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <label htmlFor="milestone-title" className="block text-sm font-bold text-[#2A0E1C]">
              Milestone Title <span className="text-[#F7418F]">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="milestone-title"
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Book Venue & Catering, Send Invitations"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'milestone-title-error' : undefined}
              className={`mt-1 block w-full rounded-none border px-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F] bg-white text-[#2A0E1C] ${
                errors.title ? 'border-rose-500' : 'border-[#FEC7B4]'
              }`}
            />
            {errors.title && (
              <p id="milestone-title-error" className="mt-1 text-xs text-rose-600 font-bold">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="milestone-date" className="block text-sm font-bold text-[#2A0E1C]">
              Target Due Date <span className="text-[#F7418F]">*</span>
            </label>
            <input
              id="milestone-date"
              type="date"
              required
              min={!isEdit ? new Date().toISOString().split('T')[0] : undefined}
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
              }}
              aria-invalid={!!errors.dueDate}
              aria-describedby={errors.dueDate ? 'milestone-date-error' : undefined}
              className={`mt-1 block w-full rounded-none border px-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F] bg-white text-[#2A0E1C] ${
                errors.dueDate ? 'border-rose-500' : 'border-[#FEC7B4]'
              }`}
            />
            {errors.dueDate && (
              <p id="milestone-date-error" className="mt-1 text-xs text-rose-600 font-bold">
                {errors.dueDate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="milestone-desc" className="block text-sm font-bold text-[#2A0E1C]">
              Action Notes or Checklist Items (Optional)
            </label>
            <textarea
              id="milestone-desc"
              rows={2}
              maxLength={1000}
              placeholder="e.g. Inquire about capacity limits, noise ordinance, and deposit terms."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-none border border-[#FEC7B4] px-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F] bg-white text-[#2A0E1C]"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-2 pt-1">
              <input
                id="milestone-completed"
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="h-4 w-4 rounded-none border-[#FEC7B4] text-[#F7418F] focus:ring-[#F7418F]"
              />
              <label htmlFor="milestone-completed" className="text-sm font-bold text-[#2A0E1C]">
                Mark this milestone as completed
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#FEC7B4]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-none border border-[#FEC7B4] px-4 py-2 text-sm font-bold text-[#2A0E1C] hover:bg-[#FFF3C7] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-none bg-[#F7418F] px-5 py-2 text-sm font-bold text-white shadow-xs hover:bg-[#F7418F]/90 focus:outline-hidden disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Milestone' : 'Save Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
