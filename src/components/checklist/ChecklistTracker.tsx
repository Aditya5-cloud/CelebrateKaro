'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ChecklistItem, Event } from '@/types';
import type { ChecklistStats } from '@/lib/checklist';

interface ChecklistTrackerProps {
  event: Event;
  onChecklistUpdated?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  venue: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  catering: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  decor: 'bg-pink-50 text-pink-700 border-pink-200',
  music: 'bg-purple-50 text-purple-700 border-purple-200',
  'guest-list': 'bg-blue-50 text-blue-700 border-blue-200',
  permits: 'bg-amber-50 text-amber-700 border-amber-200',
  logistics: 'bg-teal-50 text-teal-700 border-teal-200',
  general: 'bg-slate-100 text-slate-700 border-slate-200',
};

const POPULAR_FOCUS_TAGS = [
  'Full Milestone Roadmap',
  'Budget & Cost-Saving',
  'Eco-Friendly / Zero-Waste',
  'Luxury VIP Experience',
  'Kid-Friendly Activities',
];

export function ChecklistTracker({ event, onChecklistUpdated }: ChecklistTrackerProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [stats, setStats] = useState<ChecklistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'ai'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Generation State
  const [customFocus, setCustomFocus] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  // Manual Add Form State
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('general');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  const fetchChecklist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/checklist`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load checklist.');
      }
      setItems(json.data.items);
      setStats(json.data.stats);
    } catch (err: unknown) {
      console.error(err);
      setError('Could not load event checklist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  const handleToggleComplete = async (item: ChecklistItem) => {
    const newCompleted = !item.completed;
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, completed: newCompleted } : i))
    );

    try {
      const res = await fetch(`/api/events/${event.id}/checklist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update item.');
      }
      setStats(json.data.stats);
      onChecklistUpdated?.();
      showNotification(
        newCompleted ? `Completed: "${item.task}"` : `Marked active: "${item.task}"`
      );
    } catch (err) {
      console.error(err);
      fetchChecklist();
      alert('Failed to update checklist item status.');
    }
  };

  const handleDeleteItem = async (item: ChecklistItem) => {
    if (!window.confirm(`Delete task "${item.task}"?`)) return;

    try {
      const res = await fetch(`/api/events/${event.id}/checklist/${item.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete task.');
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setStats(json.data.stats);
      onChecklistUpdated?.();
      showNotification('Task removed.');
    } catch (err) {
      console.error(err);
      alert('Could not delete checklist item.');
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setGenerationNotice(null);
    try {
      const res = await fetch(`/api/events/${event.id}/checklist/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus: customFocus.trim(),
          replaceExisting,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'AI checklist generation failed.');
      }
      setItems(json.data.items);
      setStats(json.data.stats);
      setGenerationNotice(json.data.message);
      onChecklistUpdated?.();
      showNotification('AI personalized checklist generated!');
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to generate AI checklist.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!newTaskText.trim()) {
      setAddError('Task description cannot be empty.');
      return;
    }

    setIsAddingTask(true);
    try {
      const res = await fetch(`/api/events/${event.id}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: newTaskText.trim(),
          category: newTaskCategory,
          completed: false,
          ai_generated: false,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to add task.');
      }
      setItems((prev) => [...prev, json.data.item]);
      setStats(json.data.stats);
      setNewTaskText('');
      onChecklistUpdated?.();
      showNotification('Custom task added to checklist.');
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Error adding task.');
    } finally {
      setIsAddingTask(false);
    }
  };

  // Distinct categories in the current checklist
  const availableCategories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return Array.from(set).filter(Boolean);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter === 'pending' && item.completed) return false;
      if (filter === 'completed' && !item.completed) return false;
      if (filter === 'ai' && !item.ai_generated) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTask = item.task.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesTask && !matchesCat) return false;
      }
      return true;
    });
  }, [items, filter, categoryFilter, searchQuery]);

  return (
    <section aria-label="AI Event Checklist" className="space-y-6">
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

      {/* AI Generator Control Panel */}
      <div className="rounded-3xl border border-[#073330]/20 bg-[#073330] p-6 sm:p-8 text-white shadow-xl overflow-hidden relative">
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#00e599]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e599] text-[#073330] font-black text-base shadow-sm">
                ✨
              </span>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white">
                  GenAI Personalized Checklist Generator
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Generates customized planning tasks tailored to your {event.event_type} celebration, guest scale, and budget.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#00e599]">
              Personalized Celebration Roadmap
            </span>
          </div>

          {/* Quick Focus Tags */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
              Select or customize planning focus:
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_FOCUS_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCustomFocus(tag)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                    customFocus === tag
                      ? 'bg-[#00e599] text-[#073330] border-[#00e599] shadow-xs'
                      : 'bg-white/10 text-white hover:bg-white/15 border-white/15'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Focus Prompt Input & Action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              placeholder="e.g., Focus on outdoor tent setup, dietary food trucks, live acoustic music..."
              aria-label="Custom planning focus prompt"
              className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-[#00e599] focus:bg-white/15 transition-all"
            />
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="px-6 py-2.5 text-sm font-bold rounded-xl bg-[#00e599] hover:bg-[#1cf3a6] text-[#073330] shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-[#073330]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Generating Tasks...</span>
                </>
              ) : (
                <>
                  <span>✨ Generate Checklist</span>
                </>
              )}
            </button>
          </div>

          {/* Options & Generation Notice */}
          <div className="flex flex-wrap items-center justify-between text-xs text-white/70 gap-2 pt-1 border-t border-white/10">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="rounded-sm border-white/30 text-[#00e599] focus:ring-[#00e599] h-4 w-4 bg-white/10"
              />
              <span>Replace existing checklist items with fresh AI generation</span>
            </label>

            {generationNotice && (
              <span className="text-[#00e599] font-bold animate-in fade-in">
                {generationNotice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-[#073330]/10 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
          <p className="text-3xl font-black text-[#073330] mt-2">{stats ? stats.total : 0}</p>
          <p className="text-xs text-slate-400 mt-1">Checklist items</p>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-[#073330]/10 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-black text-emerald-700 mt-2">{stats ? stats.completed : 0}</p>
          <div className="mt-2 w-full bg-[#073330]/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#00e599] h-full rounded-full transition-all duration-300"
              style={{ width: `${stats ? stats.percentCompleted : 0}%` }}
            />
          </div>
          <p className="text-xs text-emerald-700 mt-1 font-bold">
            {stats ? `${stats.percentCompleted}% completed` : '0%'}
          </p>
        </div>

        {/* AI-Generated */}
        <div className="bg-white p-5 rounded-2xl border border-[#073330]/10 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Suggestions</p>
          <p className="text-3xl font-black text-[#073330] mt-2">
            {stats ? stats.aiGeneratedCount : 0}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Personalized ideas</p>
        </div>

        {/* Active Pending */}
        <div className="bg-white p-5 rounded-2xl border border-[#073330]/10 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Pending</p>
          <p className="text-3xl font-black text-[#073330] mt-2">{stats ? stats.pending : 0}</p>
          <p className="text-xs text-slate-500 mt-1">Awaiting completion</p>
        </div>
      </div>

      {/* Manual Task Add Bar */}
      <form onSubmit={handleManualAdd} className="bg-white p-4 rounded-2xl border border-[#073330]/10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="+ Add a custom task (e.g., Pick up party favors on Friday)..."
            aria-label="Add custom task"
            className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-[#073330]/20 focus:outline-hidden focus:ring-2 focus:ring-[#073330] text-[#073330] bg-white"
          />
          <div className="flex items-center space-x-2">
            <select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
              aria-label="Task category"
              className="text-xs py-2 px-3 rounded-xl border border-[#073330]/20 bg-white text-[#073330] hover:border-[#073330]/40 focus:outline-hidden focus:ring-2 focus:ring-[#073330]"
            >
              <option value="general">General</option>
              <option value="venue">Venue</option>
              <option value="catering">Catering</option>
              <option value="decor">Decor</option>
              <option value="music">Music</option>
              <option value="guest-list">Guest List</option>
              <option value="logistics">Logistics</option>
              <option value="permits">Permits</option>
            </select>
            <button
              type="submit"
              disabled={isAddingTask}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-900 shrink-0 disabled:opacity-50"
            >
              Add Task
            </button>
          </div>
        </div>
        {addError && <p className="mt-2 text-xs text-rose-600 font-medium">{addError}</p>}
      </form>

      {/* Checklist Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Active ({stats ? stats.pending : 0})
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Completed ({stats ? stats.completed : 0})
            </button>
            <button
              type="button"
              onClick={() => setFilter('ai')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'ai'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ✨ AI Ideas ({stats ? stats.aiGeneratedCount : 0})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              aria-label="Search checklist tasks"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {availableCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Task Items List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/80">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium">Loading planning checklist...</p>
        </div>
      ) : error ? (
        <div role="alert" className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-center">
          <p className="font-semibold text-sm">{error}</p>
          <button
            type="button"
            onClick={fetchChecklist}
            className="mt-3 px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 text-xl">
            ✨
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {items.length === 0 ? 'No Checklist Tasks Yet' : 'No Tasks Match Your Filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {items.length === 0
              ? 'Click "Generate Checklist" above to create a tailored planning roadmap for your event.'
              : 'Try clearing your search query or switching filters.'}
          </p>
          {items.length === 0 && (
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              ✨ Generate Initial AI Checklist
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2.5" aria-label="Planning checklist tasks">
          {filteredItems.map((item) => {
            const catClass = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general;

            return (
              <li
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 ${
                  item.completed
                    ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                    : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Left: Checkbox & Task */}
                <div className="flex items-start sm:items-center space-x-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.completed}
                    aria-label={`Mark task as ${item.completed ? 'incomplete' : 'complete'}: ${item.task}`}
                    onClick={() => handleToggleComplete(item)}
                    className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      item.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-slate-400 bg-white'
                    }`}
                  >
                    {item.completed && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
                    <span
                      className={`text-sm tracking-tight text-slate-800 ${
                        item.completed ? 'line-through text-slate-400' : 'font-medium'
                      }`}
                    >
                      {item.task}
                    </span>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md border ${catClass}`}
                      >
                        {item.category}
                      </span>
                      {item.ai_generated && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          ✨ AI Idea
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item)}
                  aria-label={`Delete task: ${item.task}`}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
