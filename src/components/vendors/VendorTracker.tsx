'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Vendor, VendorStatus, Event } from '@/types';
import type { VendorStats } from '@/lib/vendors';
import { formatCurrency } from '@/lib/formatters';
import { VendorModal } from './VendorModal';
import { VendorEmailModal } from './VendorEmailModal';

interface VendorTrackerProps {
  event: Event;
  onVendorUpdated?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  venue: 'Venue & Hall',
  catering: 'Catering & Bar',
  photography: 'Photography & Video',
  music: 'Music & DJ',
  florist: 'Florals & Botanicals',
  bakery: 'Cake & Bakery',
  transportation: 'Transportation',
  decoration: 'Decor & Rentals',
  officiant: 'Officiant / Host',
  other: 'Other Services',
};

const STATUS_CONFIG: Record<
  VendorStatus,
  { label: string; badgeClass: string; nextStatus?: VendorStatus; nextLabel?: string }
> = {
  considering: {
    label: 'Considering',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    nextStatus: 'contacted',
    nextLabel: 'Mark Contacted',
  },
  contacted: {
    label: 'Contacted',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    nextStatus: 'booked',
    nextLabel: 'Mark Booked',
  },
  booked: {
    label: 'Booked',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    nextStatus: 'paid',
    nextLabel: 'Mark Paid',
  },
  paid: {
    label: 'Paid / Deposit',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
  },
};

export function VendorTracker({ event, onVendorUpdated }: VendorTrackerProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | VendorStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [vendorForEmail, setVendorForEmail] = useState<Vendor | null>(null);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/vendors`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load vendors.');
      }
      setVendors(json.data.vendors);
      setStats(json.data.stats);
    } catch (err: unknown) {
      console.error(err);
      setError('Could not load vendor directory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleStatusChange = async (vendor: Vendor, newStatus: VendorStatus) => {
    // Optimistic UI update
    setVendors((prev) =>
      prev.map((v) => (v.id === vendor.id ? { ...v, status: newStatus } : v))
    );

    try {
      const res = await fetch(`/api/events/${event.id}/vendors/${vendor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update vendor status.');
      }
      setStats(json.data.stats);
      onVendorUpdated?.();
      showNotification(`"${vendor.name}" marked as ${STATUS_CONFIG[newStatus].label}.`);
    } catch (err) {
      console.error(err);
      fetchVendors();
      alert('Failed to update status.');
    }
  };

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (!window.confirm(`Are you sure you want to remove "${vendor.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${event.id}/vendors/${vendor.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to remove vendor.');
      }
      setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
      setStats(json.data.stats);
      onVendorUpdated?.();
      showNotification(`"${vendor.name}" was removed.`);
    } catch (err) {
      console.error(err);
      alert('Could not delete vendor.');
    }
  };

  const handleGenerateTemplate = async () => {
    if (
      vendors.length > 0 &&
      !window.confirm(
        'Generating a recommended checklist will replace existing vendors with a tailored checklist. Proceed?'
      )
    ) {
      return;
    }

    setIsGeneratingTemplate(true);
    try {
      const res = await fetch(`/api/events/${event.id}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'template' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate vendor template.');
      }
      setVendors(json.data.vendors);
      setStats(json.data.stats);
      onVendorUpdated?.();
      showNotification('Recommended vendor checklist generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate vendor template.');
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  // Filtered list
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(query);
        const matchesContact = (v.contact_name || '').toLowerCase().includes(query);
        const matchesNotes = (v.notes || '').toLowerCase().includes(query);
        const matchesCategory = (v.category || '').toLowerCase().includes(query);
        if (!matchesName && !matchesContact && !matchesNotes && !matchesCategory) return false;
      }
      return true;
    });
  }, [vendors, statusFilter, categoryFilter, searchQuery]);

  return (
    <section aria-label="Vendor Directory & Checklist" className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-xl flex items-center justify-between shadow-xs animate-in fade-in"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vendors */}
        <div className="bg-white p-5 rounded-2xl border border-[#073330]/10 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Vendors</p>
          <p className="text-3xl font-black text-[#073330] mt-2">{stats ? stats.total : 0}</p>
          <p className="text-xs text-slate-400 mt-1">Directory entries</p>
        </div>

        {/* Confirmed / Booked */}
        <div className="bg-white p-5 rounded-2xl border border-[#073330]/10 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmed & Paid</p>
          <p className="text-3xl font-black text-emerald-700 mt-2">
            {stats ? stats.booked + stats.paid : 0}
          </p>
          <p className="text-xs text-emerald-700 mt-1 font-bold">
            {stats ? `${stats.percentBookedOrPaid}% secured` : '0%'}
          </p>
        </div>

        {/* Total Quoted Commitments */}
        <div className="bg-white p-5 rounded-2xl border border-[#073330]/10 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Quoted</p>
          <p className="text-3xl font-black text-[#073330] mt-2">
            {stats ? formatCurrency(stats.totalQuotes) : '$0'}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Active vendor estimates</p>
        </div>

        {/* In Negotiation */}
        <div className="bg-white p-5 rounded-2xl border border-[#073330]/10 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Negotiation</p>
          <p className="text-3xl font-black text-[#073330] mt-2">
            {stats ? stats.considering + stats.contacted : 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Considering or inquiry sent</p>
        </div>
      </div>

      {/* Action Bar & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-[#073330]/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor name, contact, notes..."
              aria-label="Search vendors"
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-[#073330]/20 focus:outline-hidden focus:ring-2 focus:ring-[#073330] bg-white text-[#073330] transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleGenerateTemplate}
              disabled={isGeneratingTemplate}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-[#073330] bg-[#073330]/5 hover:bg-[#073330]/10 rounded-xl transition-colors border border-[#073330]/20 focus:outline-hidden focus:ring-2 focus:ring-[#073330] flex items-center space-x-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#073330]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>{isGeneratingTemplate ? 'Generating...' : 'Load Checklist Template'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setVendorToEdit(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-[#073330] bg-[#00e599] hover:bg-[#1cf3a6] rounded-xl shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#073330] flex items-center space-x-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Vendor</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#073330]/10">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#073330] text-white shadow-xs'
                  : 'bg-white border border-[#073330]/15 text-slate-700 hover:bg-[#faf8f4]'
              }`}
            >
              All ({vendors.length})
            </button>
            {(['considering', 'contacted', 'booked', 'paid', 'cancelled'] as VendorStatus[]).map((st) => {
              const count = vendors.filter((v) => v.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {STATUS_CONFIG[st].label} ({count})
                </button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-2">
            <label htmlFor="vendor-category-filter" className="text-xs font-medium text-slate-500 shrink-0">
              Category:
            </label>
            <select
              id="vendor-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/80">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium">Loading vendor directory...</p>
        </div>
      ) : error ? (
        <div role="alert" className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-center">
          <p className="font-semibold text-sm">{error}</p>
          <button
            type="button"
            onClick={fetchVendors}
            className="mt-3 px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {vendors.length === 0 ? 'No Vendors Added Yet' : 'No Vendors Match Your Filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {vendors.length === 0
              ? 'Organize your venue, catering, photography, and entertainment vendors with quotes and contact tracking.'
              : 'Try clearing your search query or selecting a different status/category filter.'}
          </p>
          {vendors.length === 0 && (
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={handleGenerateTemplate}
                disabled={isGeneratingTemplate}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
              >
                Load Recommended Checklist
              </button>
              <button
                type="button"
                onClick={() => {
                  setVendorToEdit(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                + Add Vendor Manually
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => {
            const statusConfig = STATUS_CONFIG[vendor.status] || STATUS_CONFIG.considering;
            const categoryLabel = CATEGORY_LABELS[vendor.category] || vendor.category;

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top & Details */}
                <div className="p-5 space-y-3">
                  {/* Category & Status Tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {categoryLabel}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Title & Price Quote */}
                  <div>
                    <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                      {vendor.name}
                    </h4>
                    <p className="text-sm font-semibold text-indigo-600 mt-1">
                      {vendor.price_quote > 0 ? (
                        formatCurrency(vendor.price_quote)
                      ) : (
                        <span className="text-xs text-slate-400 font-normal">Quote pending</span>
                      )}
                    </p>
                  </div>

                  {/* Notes */}
                  {vendor.notes && (
                    <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {vendor.notes}
                    </p>
                  )}

                  {/* Contact Information */}
                  {(vendor.contact_name || vendor.contact_email || vendor.contact_phone) && (
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                      {vendor.contact_name && (
                        <p className="font-medium text-slate-800 flex items-center space-x-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{vendor.contact_name}</span>
                        </p>
                      )}
                      {vendor.contact_email && (
                        <p className="flex items-center space-x-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <a
                            href={`mailto:${vendor.contact_email}`}
                            className="text-indigo-600 hover:underline truncate"
                          >
                            {vendor.contact_email}
                          </a>
                        </p>
                      )}
                      {vendor.contact_phone && (
                        <p className="flex items-center space-x-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <a href={`tel:${vendor.contact_phone}`} className="text-slate-700 hover:underline">
                            {vendor.contact_phone}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Status Advance Action */}
                  {statusConfig.nextStatus ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(vendor, statusConfig.nextStatus!)}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center space-x-1"
                    >
                      <span>{statusConfig.nextLabel}</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <span className="text-slate-400 font-medium">Final Stage</span>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setVendorForEmail(vendor);
                        setIsEmailModalOpen(true);
                      }}
                      aria-label={`Draft email to ${vendor.name}`}
                      title="Draft Email with AI"
                      className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVendorToEdit(vendor);
                        setIsModalOpen(true);
                      }}
                      aria-label={`Edit ${vendor.name}`}
                      className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVendor(vendor)}
                      aria-label={`Delete ${vendor.name}`}
                      className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vendor Add / Edit Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setVendorToEdit(null);
        }}
        onSuccess={() => {
          fetchVendors();
          onVendorUpdated?.();
          showNotification(vendorToEdit ? 'Vendor updated successfully.' : 'New vendor added.');
        }}
        eventId={event.id}
        initialVendor={vendorToEdit}
      />

      {/* AI Vendor Email Drafter Modal */}
      <VendorEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setVendorForEmail(null);
        }}
        event={event}
        vendor={vendorForEmail}
      />
    </section>
  );
}
