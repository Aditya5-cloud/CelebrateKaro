'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Milestone, Event } from '@/types';
import type { MilestoneStats } from '@/lib/milestones';
import { formatDate, getRelativeDays } from '@/lib/formatters';
import { MilestoneModal } from './MilestoneModal';

interface TimelineTrackerProps {
  event: Event;
  onTimelineUpdated?: () => void;
}

export function TimelineTracker({ event, onTimelineUpdated }: TimelineTrackerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState<MilestoneStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState<Milestone | null>(null);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/milestones`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load milestones.');
      }
      setMilestones(json.data.milestones);
      setStats(json.data.stats);
    } catch (err: unknown) {
      console.error(err);
      setError('Could not load timeline milestones. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleToggleComplete = async (milestone: Milestone) => {
    const newStatus = !milestone.completed;
    // Optimistic UI update
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestone.id ? { ...m, completed: newStatus } : m))
    );

    try {
      const res = await fetch(`/api/events/${event.id}/milestones/${milestone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update milestone status.');
      }
      setStats(json.data.stats);
      onTimelineUpdated?.();
      showNotification(newStatus ? `"${milestone.title}" completed!` : `"${milestone.title}" marked pending.`);
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      fetchMilestones();
      alert('Failed to update milestone status.');
    }
  };

  const handleGenerateTemplate = async () => {
    const confirm = window.confirm(
      `Would you like to auto-generate a recommended timeline roadmap for your ${event.event_type}? Any existing milestones will be replaced.`
    );
    if (!confirm) return;

    setIsGeneratingTemplate(true);
    try {
      const res = await fetch(`/api/events/${event.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'template' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate timeline template.');
      }
      showNotification('Chronological timeline roadmap generated successfully!');
      fetchMilestones();
      onTimelineUpdated?.();
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to generate timeline template.');
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  const handleDeleteMilestone = async (milestone: Milestone) => {
    const confirm = window.confirm(`Delete milestone "${milestone.title}"?`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/events/${event.id}/milestones/${milestone.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete milestone.');
      }
      showNotification(`"${milestone.title}" was removed.`);
      fetchMilestones();
      onTimelineUpdated?.();
    } catch (err) {
      console.error(err);
      alert('Failed to delete milestone.');
    }
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filteredMilestones = useMemo(() => {
    if (activeFilter === 'all') return milestones;
    if (activeFilter === 'completed') return milestones.filter((m) => m.completed);
    if (activeFilter === 'pending') return milestones.filter((m) => !m.completed);
    if (activeFilter === 'overdue') return milestones.filter((m) => !m.completed && m.due_date < todayStr);
    return milestones;
  }, [milestones, activeFilter, todayStr]);

  if (isLoading) {
    return (
      <div className="py-12 text-center" aria-busy="true">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-3 text-xs text-zinc-500">Loading timeline milestones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800 dark:border-red-900 dark:bg-red-950/30">
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchMilestones}
          className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalCount = stats?.total ?? milestones.length;
  const completedCount = stats?.completed ?? 0;
  const pendingCount = stats?.pending ?? 0;
  const overdueCount = stats?.overdue ?? 0;
  const percentCompleted = stats?.percentCompleted ?? 0;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 shadow-xs"
        >
          {notification}
        </div>
      )}

      {/* Overdue alert banner */}
      {overdueCount > 0 && (
        <div
          role="alert"
          className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300 flex items-start gap-3"
        >
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-sm">
              {overdueCount} Milestone{overdueCount > 1 ? 's' : ''} Past Due Date
            </h4>
            <p className="text-xs mt-0.5">
              Review and reschedule overdue deadlines to keep your event execution running smoothly.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#073330]/15 bg-[#fffdfa] p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Milestones</span>
          <p className="mt-1 text-2xl font-black text-[#073330]">{totalCount}</p>
          <span className="text-xs text-slate-400">Scheduled checkpoints</span>
        </div>

        <div className="rounded-2xl border border-[#073330]/15 bg-[#fffdfa] p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</span>
          <p className="mt-1 text-2xl font-black text-emerald-700">
            {completedCount}
          </p>
          <span className="text-xs text-slate-500">{percentCompleted}% complete</span>
        </div>

        <div className="rounded-2xl border border-[#073330]/15 bg-[#fffdfa] p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Actions</span>
          <p className="mt-1 text-2xl font-black text-[#073330]">{pendingCount}</p>
          <span className="text-xs text-slate-500">Awaiting completion</span>
        </div>

        <div className="rounded-2xl border border-[#073330]/15 bg-[#fffdfa] p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue</span>
          <p
            className={`mt-1 text-2xl font-black ${
              overdueCount > 0 ? 'text-red-600' : 'text-[#073330]'
            }`}
          >
            {overdueCount}
          </p>
          <span className="text-xs text-slate-500">
            {overdueCount > 0 ? 'Requires attention' : 'All deadlines on track'}
          </span>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="rounded-2xl border border-[#073330]/15 bg-[#fffdfa] p-6 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-[#073330]">Milestone Completion Progress</span>
          <span className="font-bold text-[#073330]">{percentCompleted}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={percentCompleted}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Milestone Completion Progress"
          aria-valuetext={`${percentCompleted}% completed (${completedCount} of ${totalCount} milestones)`}
          className="w-full h-3.5 overflow-hidden rounded-full bg-[#073330]/10"
        >
          <div
            className="h-full bg-[#00e599] transition-all duration-300 rounded-full"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Action and Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div
          role="toolbar"
          aria-label="Filter milestones by status"
          className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#073330]/15 bg-[#fffdfa] p-1.5"
        >
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
            { id: 'overdue', label: `Overdue (${overdueCount})` },
          ].map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                aria-pressed={active}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#073330] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#073330] hover:bg-[#faf8f4]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateTemplate}
            disabled={isGeneratingTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#073330]/20 bg-white px-3.5 py-2 text-xs font-bold text-[#073330] hover:bg-[#faf8f4] transition-colors cursor-pointer"
          >
            <span>📅</span>
            <span>{isGeneratingTemplate ? 'Generating...' : `Generate ${event.event_type} Roadmap`}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMilestoneToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00e599] hover:bg-[#1cf3a6] px-4 py-2 text-xs font-bold text-[#073330] shadow-xs transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Timeline Stream / Empty State */}
      {filteredMilestones.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-600 dark:bg-amber-950/60">
            📅
          </div>
          <h4 className="mt-3 text-base font-bold text-zinc-900 dark:text-zinc-100">
            {activeFilter === 'all'
              ? 'No timeline milestones scheduled yet'
              : `No ${activeFilter} milestones found`}
          </h4>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            Build a structured roadmap of deadlines from planning kickoff to your celebration date.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleGenerateTemplate}
              disabled={isGeneratingTemplate}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
            >
              📅 Auto-Generate {event.event_type.toUpperCase()} Roadmap
            </button>
            <button
              type="button"
              onClick={() => {
                setMilestoneToEdit(null);
                setIsModalOpen(true);
              }}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              + Add Custom Milestone
            </button>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800 space-y-4">
          {filteredMilestones.map((m) => {
            const rel = getRelativeDays(m.due_date);
            const isOverdue = !m.completed && m.due_date < todayStr;

            return (
              <div
                key={m.id}
                className={`relative rounded-2xl border p-5 transition-all shadow-xs ${
                  m.completed
                    ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/50 dark:bg-emerald-950/10'
                    : isOverdue
                    ? 'border-red-300 bg-red-50/30 dark:border-red-900/60 dark:bg-red-950/20'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                {/* Node icon on timeline spine */}
                <div
                  className={`absolute -left-[30px] sm:-left-[35px] top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white dark:bg-zinc-900 ${
                    m.completed
                      ? 'border-emerald-600 text-emerald-600'
                      : isOverdue
                      ? 'border-red-600 text-red-600'
                      : 'border-blue-600 text-blue-600'
                  }`}
                >
                  {m.completed ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-current" />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={m.completed}
                      aria-label={`Mark "${m.title}" as ${m.completed ? 'incomplete' : 'complete'}`}
                      onClick={() => handleToggleComplete(m)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        m.completed
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700'
                      }`}
                    >
                      {m.completed && (
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>

                    <div>
                      <h4
                        className={`text-sm sm:text-base font-bold tracking-tight ${
                          m.completed
                            ? 'line-through text-zinc-500 dark:text-zinc-400'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {m.title}
                      </h4>
                      {m.description && (
                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-right">
                      <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                        {formatDate(m.due_date)}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold mt-0.5 ${
                          m.completed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : isOverdue
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {m.completed ? 'Completed' : isOverdue ? `Overdue (${rel.label})` : rel.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMilestoneToEdit(m);
                          setIsModalOpen(true);
                        }}
                        aria-label={`Edit milestone ${m.title}`}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMilestone(m)}
                        aria-label={`Delete milestone ${m.title}`}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Milestone Modal */}
      <MilestoneModal
        isOpen={isModalOpen}
        eventId={event.id}
        initialMilestone={milestoneToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setMilestoneToEdit(null);
        }}
        onSuccess={() => {
          showNotification(milestoneToEdit ? 'Milestone updated!' : 'Milestone added to timeline!');
          fetchMilestones();
          onTimelineUpdated?.();
        }}
      />
    </div>
  );
}
