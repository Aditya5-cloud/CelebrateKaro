'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { BudgetCategory } from '@/types';
import { fromCents } from '@/lib/currency';
import { standardBudgetCategories } from '@/lib/validations/budget';

interface BudgetCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventId: number;
  initialCategory?: BudgetCategory | null;
}

export function BudgetCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  eventId,
  initialCategory,
}: BudgetCategoryModalProps) {
  const isEdit = !!initialCategory;
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [plannedAmount, setPlannedAmount] = useState<number | ''>(1000);
  const [actualAmount, setActualAmount] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setPlannedAmount(fromCents(initialCategory.planned_amount));
      setActualAmount(fromCents(initialCategory.actual_amount));
      setNotes(initialCategory.notes || '');
    } else {
      setName('');
      setPlannedAmount(1000);
      setActualAmount(0);
      setNotes('');
    }
    setErrors({});
    setServerError(null);
  }, [initialCategory, isOpen]);

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
    if (!name.trim()) {
      errs.name = 'Please provide a category name.';
    } else if (name.trim().length > 80) {
      errs.name = 'Category name must be 80 characters or fewer.';
    }

    if (plannedAmount === '' || Number(plannedAmount) < 0) {
      errs.plannedAmount = 'Planned amount must be 0 or greater.';
    }

    if (actualAmount === '' || Number(actualAmount) < 0) {
      errs.actualAmount = 'Actual amount must be 0 or greater.';
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
        planned_amount: Number(plannedAmount),
        actual_amount: Number(actualAmount),
        notes: notes.trim(),
      };

      const url = isEdit
        ? `/api/events/${eventId}/budget/${initialCategory.id}`
        : `/api/events/${eventId}/budget`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error || 'Failed to save budget category.');
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
        aria-labelledby="category-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 id="category-modal-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {isEdit ? 'Edit Budget Category' : 'Add Budget Category'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Set target allocation and track actual invoices or receipts.
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
            <label htmlFor="cat-name" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="cat-name"
              type="text"
              required
              maxLength={80}
              placeholder="e.g. Venue & Rentals, Catering, Photography"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'cat-name-error' : undefined}
              className={`mt-1 block w-full rounded-lg border px-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                errors.name ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
              }`}
            />
            {errors.name && (
              <p id="cat-name-error" className="mt-1 text-xs text-red-600">
                {errors.name}
              </p>
            )}

            {/* Quick suggestion pills */}
            {!isEdit && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {standardBudgetCategories.slice(0, 6).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setName(preset);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cat-planned" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                Planned Amount ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 text-sm font-medium">
                  $
                </span>
                <input
                  id="cat-planned"
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="2500"
                  value={plannedAmount}
                  onChange={(e) => {
                    setPlannedAmount(e.target.value === '' ? '' : parseFloat(e.target.value));
                    if (errors.plannedAmount) setErrors((prev) => ({ ...prev, plannedAmount: '' }));
                  }}
                  aria-invalid={!!errors.plannedAmount}
                  aria-describedby={errors.plannedAmount ? 'cat-planned-error' : undefined}
                  className={`block w-full rounded-lg border pl-8 pr-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                    errors.plannedAmount ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                />
              </div>
              {errors.plannedAmount && (
                <p id="cat-planned-error" className="mt-1 text-xs text-red-600">
                  {errors.plannedAmount}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cat-actual" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                Actual Spent ($)
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 text-sm font-medium">
                  $
                </span>
                <input
                  id="cat-actual"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={actualAmount}
                  onChange={(e) => {
                    setActualAmount(e.target.value === '' ? '' : parseFloat(e.target.value));
                    if (errors.actualAmount) setErrors((prev) => ({ ...prev, actualAmount: '' }));
                  }}
                  aria-invalid={!!errors.actualAmount}
                  aria-describedby={errors.actualAmount ? 'cat-actual-error' : undefined}
                  className={`block w-full rounded-lg border pl-8 pr-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                    errors.actualAmount ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                />
              </div>
              {errors.actualAmount && (
                <p id="cat-actual-error" className="mt-1 text-xs text-red-600">
                  {errors.actualAmount}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="cat-notes" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200">
              Notes or Vendor Vendor References (Optional)
            </label>
            <textarea
              id="cat-notes"
              rows={2}
              maxLength={500}
              placeholder="e.g. 50% deposit paid on Jan 10; balance due 1 week before event"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

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
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
