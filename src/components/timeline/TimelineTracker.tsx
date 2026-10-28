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
        <div className="inline-block h-8 w-8 animate-spin rounded-none border-4 border-[#F7418F] border-t-transparent" />
        <p className="mt-3 text-xs text-[#2A0E1C]/60 font-medium">Loading timeline milestones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-none border border-rose-300 bg-rose-50 p-6 text-center text-rose-800">
        <p className="font-bold">{error}</p>
        <button
          onClick={fetchMilestones}
          className="mt-3 rounded-none bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
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
          className="rounded-none bg-[#FFF3C7] px-4 py-3 text-sm text-[#2A0E1C] border border-[#FC819E] shadow-xs font-bold"
        >
          {notification}
        </div>
      )}

      {/* Overdue alert banner */}
      {overdueCount > 0 && (
        <div
          role="alert"
          className="rounded-none border border-rose-300 bg-rose-50 p-4 text-rose-800 flex items-start gap-3"
        >
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-sm">
              {overdueCount} Milestone{overdueCount > 1 ? 's' : ''} Past Due Date
            </h4>
            <p className="text-xs mt-0.5 font-medium">
              Review and reschedule overdue deadlines to keep your event execution running smoothly.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-none border border-[#FEC7B4] bg-white p-3.5 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#2A0E1C]/70">Total Milestones</span>
          <p className="mt-1 text-xl sm:text-2xl font-bold text-[#2A0E1C]">{totalCount}</p>
          <span className="text-[11px] sm:text-xs text-[#2A0E1C]/60 font-medium">Scheduled checkpoints</span>
        </div>

        <div className="rounded-none border border-[#FEC7B4] bg-white p-3.5 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#2A0E1C]/70">Completed</span>
          <p className="mt-1 text-xl sm:text-2xl font-bold text-[#F7418F]">
            {completedCount}
          </p>
          <span className="text-[11px] sm:text-xs text-[#2A0E1C]/60 font-medium">{percentCompleted}% complete</span>
        </div>

        <div className="rounded-none border border-[#FEC7B4] bg-white p-3.5 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#2A0E1C]/70">Pending</span>
          <p className="mt-1 text-xl sm:text-2xl font-bold text-[#2A0E1C]">{pendingCount}</p>
          <span className="text-[11px] sm:text-xs text-[#2A0E1C]/60 font-medium">In progress</span>
        </div>

        <div className="rounded-none border border-[#FEC7B4] bg-white p-3.5 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#2A0E1C]/70">Overdue</span>
          <p
            className={`mt-1 text-xl sm:text-2xl font-bold ${
              overdueCount > 0 ? 'text-rose-600' : 'text-[#2A0E1C]'
            }`}
          >
            {overdueCount}
          </p>
          <span className="text-[11px] sm:text-xs text-[#2A0E1C]/60 font-medium">
            {overdueCount > 0 ? 'Needs action' : 'On schedule'}
          </span>
        </div>
      </div>

      {/* Past Event Timeline Notification */}
      {getRelativeDays(event.event_date).isPast && (
        <div className="rounded-none border-2 border-emerald-300 bg-emerald-50/70 p-3.5 sm:p-4 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <span>Celebration concluded on {formatDate(event.event_date)}. All historical milestones and task timelines are safely preserved.</span>
          </div>
        </div>
      )}

      {/* Progress Bar Card */}
      <div className="rounded-none border border-[#FEC7B4] bg-white p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-[#2A0E1C]">Milestone Completion Progress</span>
          <span className="font-bold text-[#F7418F]">{percentCompleted}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={percentCompleted}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Milestone Completion Progress"
          aria-valuetext={`${percentCompleted}% completed (${completedCount} of ${totalCount} milestones)`}
          className="w-full h-3.5 overflow-hidden rounded-none bg-[#FFF3C7] border border-[#FEC7B4]"
        >
          <div
            className="h-full bg-[#F7418F] transition-all duration-300 rounded-none"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Action and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-2">
        <div
          role="toolbar"
          aria-label="Filter milestones by status"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
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
                className={`rounded-none px-3 sm:px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#F7418F] text-white shadow-xs'
                    : 'bg-white border border-[#FEC7B4] text-[#2A0E1C] hover:bg-[#FEC7B4]/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateTemplate}
            disabled={isGeneratingTemplate}
            className="inline-flex items-center justify-center gap-1.5 rounded-none border border-[#FC819E] bg-[#FEC7B4]/40 hover:bg-[#FEC7B4] px-3.5 py-2 text-xs font-bold text-[#F7418F] transition-colors cursor-pointer w-full sm:w-auto"
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
            className="inline-flex items-center justify-center gap-1.5 rounded-none bg-[#F7418F] hover:bg-[#F7418F]/90 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
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
        <div className="rounded-none border-2 border-dashed border-[#FEC7B4] bg-white p-6 sm:p-10 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-[#FEC7B4] text-2xl text-[#F7418F] font-bold">
            📅
          </div>
          <h4 className="mt-3 text-base font-bold text-[#2A0E1C]">
            {activeFilter === 'all'
              ? 'No timeline milestones scheduled yet'
              : `No ${activeFilter} milestones found`}
          </h4>
          <p className="mt-1 text-xs text-[#2A0E1C]/70 max-w-sm mx-auto">
            Build a structured roadmap of deadlines from planning kickoff to your celebration date.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleGenerateTemplate}
              disabled={isGeneratingTemplate}
              className="rounded-none bg-[#F7418F] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#F7418F]/90 cursor-pointer w-full sm:w-auto"
            >
              📅 Auto-Generate {event.event_type.toUpperCase()} Roadmap
            </button>
            <button
              type="button"
              onClick={() => {
                setMilestoneToEdit(null);
                setIsModalOpen(true);
              }}
              className="rounded-none border border-[#FEC7B4] bg-white px-4 py-2 text-xs font-bold text-[#2A0E1C] hover:bg-[#FFF3C7] cursor-pointer w-full sm:w-auto"
            >
              + Add Custom Milestone
            </button>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#FEC7B4] space-y-4">
          {filteredMilestones.map((m) => {
            const rel = getRelativeDays(m.due_date);
            const isOverdue = !m.completed && m.due_date < todayStr;

            return (
              <div
                key={m.id}
                className={`relative rounded-none border p-5 transition-all shadow-xs ${
                  m.completed
                    ? 'border-[#FEC7B4] bg-[#FFF3C7]/30'
                    : isOverdue
                    ? 'border-rose-300 bg-rose-50/40'
                    : 'border-[#FEC7B4] bg-white'
                }`}
              >
                {/* Node icon on timeline spine */}
                <div
                  className={`absolute -left-[30px] sm:-left-[35px] top-6 flex h-6 w-6 items-center justify-center rounded-none border-2 bg-white ${
                    m.completed
                      ? 'border-[#F7418F] text-[#F7418F]'
                      : isOverdue
                      ? 'border-rose-600 text-rose-600'
                      : 'border-[#FEC7B4] text-[#2A0E1C]'
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
                    <div className="h-2 w-2 rounded-none bg-current" />
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
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-none border transition-colors cursor-pointer ${
                        m.completed
                          ? 'border-[#F7418F] bg-[#F7418F] text-white'
                          : 'border-[#FEC7B4] hover:border-[#FC819E] bg-white'
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
                            ? 'line-through text-[#2A0E1C]/50'
                            : 'text-[#2A0E1C]'
                        }`}
                      >
                        {m.title}
                      </h4>
                      {m.description && (
                        <p className="mt-1 text-xs text-[#2A0E1C]/70 leading-relaxed font-normal">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-[#FEC7B4]">
                    <div className="text-right">
                      <span className="block text-xs font-bold text-[#2A0E1C]">
                        {formatDate(m.due_date)}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-none border text-[11px] font-bold mt-0.5 ${
                          m.completed
                            ? 'bg-[#FEC7B4] text-[#F7418F] border-[#FC819E]'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-[#FFF3C7] text-[#2A0E1C] border-[#FEC7B4]'
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
                        className="rounded-none p-1.5 text-[#2A0E1C]/60 hover:bg-[#FFF3C7] hover:text-[#F7418F] cursor-pointer"
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
                        className="rounded-none p-1.5 text-[#2A0E1C]/50 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
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
