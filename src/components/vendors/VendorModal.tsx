'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Vendor, VendorCategory, VendorStatus } from '@/types';
import { fromCents } from '@/lib/currency';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventId: number;
  initialVendor?: Vendor | null;
}

const CATEGORIES: { value: VendorCategory; label: string }[] = [
  { value: 'venue', label: 'Venue & Facilities' },
  { value: 'catering', label: 'Catering & Beverages' },
  { value: 'photography', label: 'Photography & Video' },
  { value: 'music', label: 'Music & Entertainment' },
  { value: 'florist', label: 'Florals & Botanicals' },
  { value: 'bakery', label: 'Cake & Bakery' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'decoration', label: 'Decor & Rentals' },
  { value: 'officiant', label: 'Officiant / Host' },
  { value: 'other', label: 'Other Services' },
];

const STATUSES: { value: VendorStatus; label: string }[] = [
  { value: 'considering', label: 'Considering / Researching' },
  { value: 'contacted', label: 'Contacted / Inquiry Sent' },
  { value: 'booked', label: 'Booked / Contract Signed' },
  { value: 'paid', label: 'Paid / Deposit Made' },
  { value: 'cancelled', label: 'Cancelled / Declined' },
];

export function VendorModal({
  isOpen,
  onClose,
  onSuccess,
  eventId,
  initialVendor,
}: VendorModalProps) {
  const isEdit = !!initialVendor;
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [status, setStatus] = useState<VendorStatus>('considering');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [priceQuote, setPriceQuote] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (initialVendor) {
      setName(initialVendor.name);
      setCategory(initialVendor.category || 'other');
      setStatus(initialVendor.status);
      setContactName(initialVendor.contact_name || '');
      setContactEmail(initialVendor.contact_email || '');
      setContactPhone(initialVendor.contact_phone || '');
      setPriceQuote(initialVendor.price_quote > 0 ? fromCents(initialVendor.price_quote).toString() : '');
      setNotes(initialVendor.notes || '');
    } else {
      setName('');
      setCategory('venue');
      setStatus('considering');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setPriceQuote('');
      setNotes('');
    }
    setErrors({});
    setServerError(null);
  }, [initialVendor, isOpen]);

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
      errs.name = 'Vendor name is required.';
    } else if (name.trim().length > 100) {
      errs.name = 'Vendor name must be 100 characters or fewer.';
    }

    if (contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail.trim())) {
        errs.contactEmail = 'Please provide a valid email address.';
      }
    }

    if (priceQuote.trim()) {
      const parsed = parseFloat(priceQuote);
      if (isNaN(parsed) || parsed < 0) {
        errs.priceQuote = 'Price quote must be a positive number.';
      } else if (parsed > 1000000) {
        errs.priceQuote = 'Price quote cannot exceed $1,000,000.';
      }
    }

    if (notes.length > 1000) {
      errs.notes = 'Notes must be 1,000 characters or fewer.';
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
        category: category.trim(),
        status,
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        price_quote: priceQuote.trim() ? parseFloat(priceQuote) : 0,
        notes: notes.trim(),
      };

      const url = isEdit
        ? `/api/events/${eventId}/vendors/${initialVendor.id}`
        : `/api/events/${eventId}/vendors`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save vendor.');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while saving the vendor.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vendor-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <h2 id="vendor-modal-title" className="text-xl font-bold tracking-tight">
              {isEdit ? 'Edit Vendor Details' : 'Add Event Vendor'}
            </h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Track vendor proposals, bookings, contact information, and prices.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden focus:ring-2 focus:ring-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {serverError && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2"
            >
              <svg className="w-4 h-4 shrink-0 text-rose-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {/* Vendor Name */}
          <div>
            <label htmlFor="vendor-name-input" className="block text-sm font-semibold text-slate-800 mb-1">
              Vendor / Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="vendor-name-input"
              ref={firstInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grand Ballroom Plaza, DJ Spark, Sunset Florals"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'vendor-name-error' : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 hover:border-slate-400'
              }`}
            />
            {errors.name && (
              <p id="vendor-name-error" className="mt-1 text-xs text-rose-600 font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vendor-category-select" className="block text-sm font-semibold text-slate-800 mb-1">
                Category
              </label>
              <select
                id="vendor-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="vendor-status-select" className="block text-sm font-semibold text-slate-800 mb-1">
                Booking Status
              </label>
              <select
                id="vendor-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Quote */}
          <div>
            <label htmlFor="vendor-price-input" className="block text-sm font-semibold text-slate-800 mb-1">
              Price Quote / Estimate ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                $
              </span>
              <input
                id="vendor-price-input"
                type="number"
                step="0.01"
                min="0"
                max="1000000"
                value={priceQuote}
                onChange={(e) => setPriceQuote(e.target.value)}
                placeholder="0.00"
                aria-invalid={!!errors.priceQuote}
                aria-describedby={errors.priceQuote ? 'vendor-price-error' : undefined}
                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.priceQuote ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 hover:border-slate-400'
                }`}
              />
            </div>
            {errors.priceQuote && (
              <p id="vendor-price-error" className="mt-1 text-xs text-rose-600 font-medium">
                {errors.priceQuote}
              </p>
            )}
          </div>

          {/* Contact Person & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vendor-contact-name-input" className="block text-sm font-semibold text-slate-800 mb-1">
                Contact Person
              </label>
              <input
                id="vendor-contact-name-input"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g., Jennifer Lawrence"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="vendor-contact-email-input" className="block text-sm font-semibold text-slate-800 mb-1">
                Contact Email
              </label>
              <input
                id="vendor-contact-email-input"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="vendor@company.com"
                aria-invalid={!!errors.contactEmail}
                aria-describedby={errors.contactEmail ? 'vendor-email-error' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.contactEmail ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 hover:border-slate-400'
                }`}
              />
              {errors.contactEmail && (
                <p id="vendor-email-error" className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.contactEmail}
                </p>
              )}
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label htmlFor="vendor-contact-phone-input" className="block text-sm font-semibold text-slate-800 mb-1">
              Contact Phone
            </label>
            <input
              id="vendor-contact-phone-input"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="vendor-notes-input" className="block text-sm font-semibold text-slate-800 mb-1">
              Notes & Requirements
            </label>
            <textarea
              id="vendor-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Package deliverables, payment schedule, contract terms, or special requests..."
              aria-invalid={!!errors.notes}
              aria-describedby={errors.notes ? 'vendor-notes-error' : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors resize-none ${
                errors.notes ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 hover:border-slate-400'
              }`}
            />
            {errors.notes && (
              <p id="vendor-notes-error" className="mt-1 text-xs text-rose-600 font-medium">
                {errors.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              <span>{isEdit ? 'Save Changes' : 'Add Vendor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
