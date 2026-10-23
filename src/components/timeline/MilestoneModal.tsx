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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 id="milestone-modal-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {isEdit ? 'Edit Milestone' : 'Add Timeline Milestone'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Set deadlines to keep your event planning on schedule.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus:outline-hidden"
          >
            ✕
          </button>
        </div>

        {serverError && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <label htmlFor="milestone-title" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200">
              Milestone Title <span className="text-red-500">*</span>
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
              className={`mt-1 block w-full rounded-lg border px-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                errors.title ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
              }`}
            />
            {errors.title && (
              <p id="milestone-title-error" className="mt-1 text-xs text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="milestone-date" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200">
              Target Due Date <span className="text-red-500">*</span>
            </label>
            <input
              id="milestone-date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
              }}
              aria-invalid={!!errors.dueDate}
              aria-describedby={errors.dueDate ? 'milestone-date-error' : undefined}
              className={`mt-1 block w-full rounded-lg border px-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                errors.dueDate ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
              }`}
            />
            {errors.dueDate && (
              <p id="milestone-date-error" className="mt-1 text-xs text-red-600">
                {errors.dueDate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="milestone-desc" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200">
              Action Notes or Checklist Items (Optional)
            </label>
            <textarea
              id="milestone-desc"
              rows={2}
              maxLength={1000}
              placeholder="e.g. Inquire about capacity limits, noise ordinance, and deposit terms."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-2 pt-1">
              <input
                id="milestone-completed"
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="milestone-completed" className="text-sm text-zinc-800 dark:text-zinc-200">
                Mark this milestone as completed
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Milestone' : 'Save Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
