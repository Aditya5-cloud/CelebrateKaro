'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import type { Event, EventType } from '@/types';
import { fromCents } from '@/lib/currency';
import { Button } from '@/components/ui/button';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (event: Event) => void;
  initialEvent?: Event | null; // If provided, modal is in Edit mode
}

export function EventFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialEvent,
}: EventFormModalProps) {
  const isEdit = !!initialEvent;
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState<number | ''>(100);
  const [totalBudget, setTotalBudget] = useState<number | ''>(15000);
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync state when editing or opening
  useEffect(() => {
    if (initialEvent) {
      setName(initialEvent.name);
      setEventType(initialEvent.event_type);
      setEventDate(initialEvent.event_date);
      setGuestCount(initialEvent.guest_count);
      setTotalBudget(fromCents(initialEvent.total_budget));
      setDescription(initialEvent.description || '');
    } else {
      setName('');
      setEventType('wedding');
      setEventDate('');
      setGuestCount(100);
      setTotalBudget(15000);
      setDescription('');
    }
    setErrors({});
    setServerError(null);
  }, [initialEvent, isOpen]);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus first input on open
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
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
    if (!name.trim()) {
      errs.name = 'Please provide an event name.';
    } else if (name.trim().length > 120) {
      errs.name = 'Name must be 120 characters or fewer.';
    }

    if (!eventDate) {
      errs.eventDate = 'Please select a valid date.';
    }

    if (guestCount === '' || Number(guestCount) < 0) {
      errs.guestCount = 'Guest count must be 0 or greater.';
    }

    if (totalBudget === '' || Number(totalBudget) < 0) {
      errs.totalBudget = 'Total budget must be 0 or greater.';
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
        name: name.trim(),
        event_type: eventType,
        event_date: eventDate,
        guest_count: Number(guestCount),
        total_budget: Number(totalBudget),
        description: description.trim(),
      };

      const url = isEdit ? `/api/events/${initialEvent.id}` : '/api/events';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.error || 'Failed to save event details. Please check the inputs.');
        return;
      }

      onSuccess(json.data);
      onClose();
    } catch (err) {
      console.error('Error submitting event:', err);
      setServerError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {isEdit ? 'Edit Celebration Details' : 'Plan a New Celebration'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {isEdit
                ? 'Update your event details and budget targets.'
                : 'Enter your event basics to get customized AI planning, budgets, and timelines.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {serverError && (
          <div
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div>
            <label htmlFor="event-name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="event-name"
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Maya & Liam's Wedding or 40th Birthday Gala"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`mt-1.5 block w-full rounded-xl border px-3.5 py-2 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800/80 dark:text-zinc-100 ${
                errors.name
                  ? 'border-red-500 ring-1 ring-red-500 dark:border-red-500'
                  : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
              }`}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-type" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Celebration Type <span className="text-red-500">*</span>
              </label>
              <select
                id="event-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm transition-all hover:border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100"
              >
                <option value="wedding">💍 Wedding</option>
                <option value="birthday">🎂 Birthday</option>
                <option value="community">🏘️ Community Event</option>
                <option value="other">🎉 Other Celebration</option>
              </select>
            </div>

            <div>
              <label htmlFor="event-date" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                id="event-date"
                type="date"
                required
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  if (errors.eventDate) setErrors((prev) => ({ ...prev, eventDate: '' }));
                }}
                aria-invalid={!!errors.eventDate}
                aria-describedby={errors.eventDate ? 'date-error' : undefined}
                className={`mt-1.5 block w-full rounded-xl border px-3.5 py-2 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800/80 dark:text-zinc-100 ${
                  errors.eventDate
                    ? 'border-red-500 ring-1 ring-red-500 dark:border-red-500'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                }`}
              />
              {errors.eventDate && (
                <p id="date-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.eventDate}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="guest-count" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Expected Guests <span className="text-red-500">*</span>
              </label>
              <input
                id="guest-count"
                type="number"
                min="0"
                step="1"
                required
                value={guestCount}
                onChange={(e) => {
                  setGuestCount(e.target.value === '' ? '' : parseInt(e.target.value, 10));
                  if (errors.guestCount) setErrors((prev) => ({ ...prev, guestCount: '' }));
                }}
                aria-invalid={!!errors.guestCount}
                aria-describedby={errors.guestCount ? 'guest-error' : undefined}
                className={`mt-1.5 block w-full rounded-xl border px-3.5 py-2 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800/80 dark:text-zinc-100 ${
                  errors.guestCount
                    ? 'border-red-500 ring-1 ring-red-500 dark:border-red-500'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                }`}
              />
              {errors.guestCount && (
                <p id="guest-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.guestCount}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="total-budget" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Total Budget (USD $) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 text-sm font-medium">
                  $
                </span>
                <input
                  id="total-budget"
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="15000"
                  value={totalBudget}
                  onChange={(e) => {
                    setTotalBudget(e.target.value === '' ? '' : parseFloat(e.target.value));
                    if (errors.totalBudget) setErrors((prev) => ({ ...prev, totalBudget: '' }));
                  }}
                  aria-invalid={!!errors.totalBudget}
                  aria-describedby={errors.totalBudget ? 'budget-error' : undefined}
                  className={`block w-full rounded-xl border pl-8 pr-3.5 py-2 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800/80 dark:text-zinc-100 ${
                    errors.totalBudget
                      ? 'border-red-500 ring-1 ring-red-500 dark:border-red-500'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                  }`}
                />
              </div>
              {errors.totalBudget && (
                <p id="budget-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.totalBudget}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="event-description" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Notes & Desired Theme (Optional)
            </label>
            <textarea
              id="event-description"
              rows={3}
              maxLength={2000}
              placeholder="e.g. Garden party theme, live jazz band preferred, vegan catering options required"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm transition-all hover:border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Celebration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
