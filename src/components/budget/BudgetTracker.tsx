'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { BudgetCategory, Event } from '@/types';
import type { BudgetSummary } from '@/lib/budget';
import { formatCurrency } from '@/lib/formatters';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetCategoryModal } from './BudgetCategoryModal';

interface BudgetTrackerProps {
  event: Event;
  onBudgetUpdated?: () => void;
}

export function BudgetTracker({ event, onBudgetUpdated }: BudgetTrackerProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<BudgetCategory | null>(null);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/budget`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load budget.');
      }
      setCategories(json.data.categories);
      setSummary(json.data.summary);
    } catch (err: unknown) {
      console.error(err);
      setError('Could not load budget data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleApplyTemplate = async () => {
    const confirm = window.confirm(
      `Would you like to auto-generate standard recommended budget allocations for a ${event.event_type}? Any existing category entries will be replaced.`
    );
    if (!confirm) return;

    setIsApplyingTemplate(true);
    try {
      const res = await fetch(`/api/events/${event.id}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'template' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate template.');
      }
      showNotification('Standard budget allocations generated successfully!');
      fetchBudget();
      onBudgetUpdated?.();
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to generate budget template. Please try again.');
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  const handleDeleteCategory = async (cat: BudgetCategory) => {
    const confirmed = window.confirm(`Delete budget category "${cat.name}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/events/${event.id}/budget/${cat.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete category.');
      }
      showNotification(`Category "${cat.name}" was removed.`);
      fetchBudget();
      onBudgetUpdated?.();
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to delete category.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center" aria-busy="true">
        <div className="inline-block h-8 w-8 animate-spin rounded-none border-4 border-[#F7418F] border-t-transparent" />
        <p className="mt-3 text-xs text-[#2A0E1C]/60 font-medium">Loading budget allocations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-none border border-rose-300 bg-rose-50 p-6 text-center text-rose-800">
        <p className="font-bold">{error}</p>
        <button
          onClick={fetchBudget}
          className="mt-3 rounded-none bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const targetBudget = event.total_budget;
  const totalPlanned = summary?.totalPlanned ?? 0;
  const totalSpent = summary?.totalSpent ?? 0;
  const remaining = targetBudget - totalSpent;
  const unallocated = targetBudget - totalPlanned;
  const isOverBudget = summary?.isOverBudget ?? false;
  const isOverPlanned = summary?.isOverPlanned ?? false;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-none bg-[#FFF3C7] px-4 py-3 text-sm text-[#2A0E1C] border border-[#FC819E] shadow-xs font-bold"
        >
          {notification}
        </div>
      )}

      {/* Warnings */}
      {isOverBudget && (
        <div
          role="alert"
          className="rounded-none border border-rose-300 bg-rose-50 p-4 text-rose-800 flex items-start gap-3"
        >
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-sm">Budget Exceeded</h4>
            <p className="text-xs mt-0.5 font-medium">
              Actual expenditures ({formatCurrency(totalSpent)}) have exceeded your target budget ({formatCurrency(targetBudget)}) by {formatCurrency(Math.abs(remaining))}.
            </p>
          </div>
        </div>
      )}

      {isOverPlanned && !isOverBudget && (
        <div
          role="status"
          className="rounded-none border border-amber-300 bg-amber-50 p-4 text-amber-800 flex items-start gap-3"
        >
          <span className="text-xl">ℹ️</span>
          <div>
            <h4 className="font-bold text-sm">Allocations Exceed Target</h4>
            <p className="text-xs mt-0.5 font-medium">
              The sum of planned categories ({formatCurrency(totalPlanned)}) is higher than your overall target budget ({formatCurrency(targetBudget)}).
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-none border border-[#FEC7B4] bg-white p-3.5 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/70 uppercase tracking-wider">Target Budget</span>
          <p className="mt-1 text-xl sm:text-2xl font-bold text-[#2A0E1C] truncate" title={formatCurrency(targetBudget)}>
            {formatCurrency(targetBudget)}
          </p>
          <span className="text-[11px] sm:text-xs text-[#2A0E1C]/60 font-medium">Total limit</span>
        </div>

        <div className="rounded-none border border-[#FEC7B4] bg-white p-3.5 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/70 uppercase tracking-wider">Total Planned</span>
          <p className="mt-1 text-xl sm:text-2xl font-bold text-[#2A0E1C] truncate" title={formatCurrency(totalPlanned)}>
            {formatCurrency(totalPlanned)}
          </p>
          <span className={`text-[11px] sm:text-xs font-bold truncate block ${unallocated >= 0 ? 'text-[#2A0E1C]/60' : 'text-rose-600'}`}>
            {unallocated >= 0 ? `${formatCurrency(unallocated)} left` : `${formatCurrency(Math.abs(unallocated))} over`}
          </span>
        </div>

        <div className="rounded-none border border-[#FEC7B4] bg-white p-3.5 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/70 uppercase tracking-wider">Actual Spent</span>
          <p className="mt-1 text-xl sm:text-2xl font-bold text-[#2A0E1C] truncate" title={formatCurrency(totalSpent)}>
            {formatCurrency(totalSpent)}
          </p>
          <span className="text-[11px] sm:text-xs text-[#2A0E1C]/60 font-medium">
            {summary?.percentSpent ?? 0}% spent
          </span>
        </div>

        <div className="rounded-none border border-[#FEC7B4] bg-white p-3.5 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold text-[#2A0E1C]/70 uppercase tracking-wider">Remaining</span>
          <p className={`mt-1 text-xl sm:text-2xl font-bold truncate ${remaining >= 0 ? 'text-[#F7418F]' : 'text-rose-600'}`} title={formatCurrency(remaining)}>
            {formatCurrency(remaining)}
          </p>
          <span className="text-[11px] sm:text-xs text-[#2A0E1C]/60 font-medium">
            {remaining >= 0 ? 'Available' : 'Over limit'}
          </span>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="rounded-none border border-[#FEC7B4] bg-white p-4 sm:p-6 shadow-xs">
        <BudgetProgressBar
          spentCents={totalSpent}
          targetCents={targetBudget}
          plannedCents={totalPlanned}
          label="Overall Spending Tracker"
          size="lg"
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-[#2A0E1C]">
            Expense Categories ({categories.length})
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={handleApplyTemplate}
            disabled={isApplyingTemplate}
            className="inline-flex items-center justify-center gap-1.5 rounded-none border border-[#FC819E] bg-[#FEC7B4]/40 hover:bg-[#FEC7B4] px-3.5 py-2 text-xs font-bold text-[#F7418F] transition-colors cursor-pointer w-full sm:w-auto"
          >
            <span>✨</span>
            <span>{isApplyingTemplate ? 'Generating...' : `Auto-Allocate ${event.event_type} Template`}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-none bg-[#F7418F] hover:bg-[#F7418F]/90 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Table / Empty state */}
      {categories.length === 0 ? (
        <div className="rounded-none border-2 border-dashed border-[#FEC7B4] bg-white p-6 sm:p-10 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-[#FEC7B4] text-2xl text-[#F7418F] font-bold">
            💰
          </div>
          <h4 className="mt-3 text-base font-bold text-[#2A0E1C]">
            No budget categories created yet
          </h4>
          <p className="mt-1 text-xs text-[#2A0E1C]/70 max-w-sm mx-auto">
            Break down your {formatCurrency(targetBudget)} budget across venues, catering, photography, and entertainment.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleApplyTemplate}
              disabled={isApplyingTemplate}
              className="rounded-none bg-[#F7418F] hover:bg-[#F7418F]/90 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer w-full sm:w-auto"
            >
              ✨ Apply Recommended {event.event_type.toUpperCase()} Template
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              className="rounded-none border border-[#FEC7B4] bg-white px-4 py-2 text-xs font-bold text-[#2A0E1C] hover:bg-[#FFF3C7] cursor-pointer w-full sm:w-auto"
            >
              + Add Custom Category
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-none border border-[#FEC7B4] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm border-collapse" aria-label="Budget categories table">
              <thead className="border-b border-[#FEC7B4] bg-[#FFF3C7] text-xs font-bold text-[#2A0E1C]">
                <tr>
                  <th scope="col" className="py-3.5 pl-6 pr-3">Category & Notes</th>
                  <th scope="col" className="px-3 py-3.5 text-right">Planned</th>
                  <th scope="col" className="px-3 py-3.5 text-right">Actual Spent</th>
                  <th scope="col" className="px-3 py-3.5 text-right">Variance</th>
                  <th scope="col" className="px-3 py-3.5 text-center">Status</th>
                  <th scope="col" className="py-3.5 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FEC7B4]">
                {categories.map((cat) => {
                  const variance = cat.planned_amount - cat.actual_amount;
                  const catPercent = cat.planned_amount > 0
                    ? Math.round((cat.actual_amount / cat.planned_amount) * 100)
                    : 0;
                  const isCatOver = cat.actual_amount > cat.planned_amount;

                  return (
                    <tr key={cat.id} className="hover:bg-[#FFF3C7]/40 transition-colors">
                      <td className="py-4 pl-6 pr-3">
                        <span className="font-bold text-[#2A0E1C] block">
                          {cat.name}
                        </span>
                        {cat.notes && (
                          <span className="text-xs text-[#2A0E1C]/65 block mt-0.5 line-clamp-1">
                            {cat.notes}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-right font-medium text-[#2A0E1C]">
                        {formatCurrency(cat.planned_amount)}
                      </td>
                      <td className="px-3 py-4 text-right font-bold text-[#2A0E1C]">
                        {formatCurrency(cat.actual_amount)}
                      </td>
                      <td className={`px-3 py-4 text-right font-bold ${isCatOver ? 'text-rose-600' : 'text-[#F7418F]'}`}>
                        {variance >= 0 ? `${formatCurrency(variance)} left` : `${formatCurrency(Math.abs(variance))} over`}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-bold border ${
                            isCatOver
                              ? 'bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-[#FEC7B4] text-[#F7418F] border-[#FC819E]'
                          }`}
                        >
                          {catPercent}%
                        </span>
                      </td>
                      <td className="py-4 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryToEdit(cat);
                              setIsCategoryModalOpen(true);
                            }}
                            aria-label={`Edit ${cat.name}`}
                            className="rounded-none p-1.5 text-[#2A0E1C]/60 hover:bg-[#FFF3C7] hover:text-[#F7418F] cursor-pointer"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            aria-label={`Delete ${cat.name}`}
                            className="rounded-none p-1.5 text-[#2A0E1C]/50 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <BudgetCategoryModal
        isOpen={isCategoryModalOpen}
        eventId={event.id}
        initialCategory={categoryToEdit}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSuccess={() => {
          showNotification(categoryToEdit ? 'Budget category updated!' : 'Budget category added!');
          fetchBudget();
          onBudgetUpdated?.();
        }}
      />
    </div>
  );
}
