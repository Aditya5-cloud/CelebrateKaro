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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        className="w-full max-w-md rounded-none bg-white p-4 sm:p-6 shadow-2xl border-2 border-[#2A0E1C] max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#FEC7B4]">
          <div>
            <h2 id="category-modal-title" className="text-xl font-bold text-[#2A0E1C] font-headline">
              {isEdit ? 'Edit Budget Category' : 'Add Budget Category'}
            </h2>
            <p className="text-xs text-[#2A0E1C]/70 mt-0.5">
              Set target allocation and track actual invoices or receipts.
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
            <label htmlFor="cat-name" className="block text-sm font-bold text-[#2A0E1C]">
              Category Name <span className="text-[#F7418F]">*</span>
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
              className={`mt-1 block w-full rounded-none border px-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F] bg-white text-[#2A0E1C] ${
                errors.name ? 'border-rose-500' : 'border-[#FEC7B4]'
              }`}
            />
            {errors.name && (
              <p id="cat-name-error" className="mt-1 text-xs text-rose-600 font-bold">
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
                    className="rounded-none border border-[#FEC7B4] bg-[#FFF3C7]/50 px-2 py-0.5 text-[11px] font-bold text-[#2A0E1C] hover:bg-[#FEC7B4]/50 cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cat-planned" className="block text-sm font-bold text-[#2A0E1C]">
                Planned Amount (₹) <span className="text-[#F7418F]">*</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#2A0E1C]/60 text-sm font-bold">
                  ₹
                </span>
                <input
                  id="cat-planned"
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="25000"
                  value={plannedAmount}
                  onChange={(e) => {
                    setPlannedAmount(e.target.value === '' ? '' : parseFloat(e.target.value));
                    if (errors.plannedAmount) setErrors((prev) => ({ ...prev, plannedAmount: '' }));
                  }}
                  aria-invalid={!!errors.plannedAmount}
                  aria-describedby={errors.plannedAmount ? 'cat-planned-error' : undefined}
                  className={`block w-full rounded-none border pl-8 pr-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F] bg-white text-[#2A0E1C] ${
                    errors.plannedAmount ? 'border-rose-500' : 'border-[#FEC7B4]'
                  }`}
                />
              </div>
              {errors.plannedAmount && (
                <p id="cat-planned-error" className="mt-1 text-xs text-rose-600 font-bold">
                  {errors.plannedAmount}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cat-actual" className="block text-sm font-bold text-[#2A0E1C]">
                Actual Spent (₹)
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#2A0E1C]/60 text-sm font-bold">
                  ₹
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
                  className={`block w-full rounded-none border pl-8 pr-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F] bg-white text-[#2A0E1C] ${
                    errors.actualAmount ? 'border-rose-500' : 'border-[#FEC7B4]'
                  }`}
                />
              </div>
              {errors.actualAmount && (
                <p id="cat-actual-error" className="mt-1 text-xs text-rose-600 font-bold">
                  {errors.actualAmount}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="cat-notes" className="block text-sm font-bold text-[#2A0E1C]">
              Notes or Vendor References (Optional)
            </label>
            <textarea
              id="cat-notes"
              rows={2}
              maxLength={500}
              placeholder="e.g. 50% deposit paid on Jan 10; balance due 1 week before event"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-none border border-[#FEC7B4] px-3.5 py-2 text-sm shadow-xs focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F] bg-white text-[#2A0E1C]"
            />
          </div>

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
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
