'use client';

import React, { useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { loginUser, registerUser } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'signin' | 'register';
  onClose: () => void;
  onSuccess: (user: User, action: 'login' | 'register') => void;
}

export function AuthModal({
  isOpen,
  initialTab = 'signin',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('host');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setPassword('');
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = loginUser(email);
    if (!result.success || !result.user) {
      setError(result.error || 'Failed to sign in. Please verify your email.');
      return;
    }
    onSuccess(result.user, 'login');
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = registerUser(name, email, role);
    if (!result.success || !result.user) {
      setError(result.error || 'Failed to register account.');
      return;
    }
    onSuccess(result.user, 'register');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-sm">
              ✨
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {tab === 'signin' ? 'Sign in to Your Account' : 'Create Your Planner Account'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {tab === 'signin' ? 'Access your real-time celebrations dashboard' : 'Start organizing your events with Gemini 3.5 AI'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          role="tablist"
          className="mt-4 flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'signin'}
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              tab === 'signin'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'register'}
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              tab === 'register'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
          >
            <svg className="h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: Sign In */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-hidden focus:ring-1 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-hidden focus:ring-1 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all active:scale-[0.98]"
            >
              Sign In to Dashboard
            </button>

            <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
              >
                Create one now
              </button>
            </p>
          </form>
        )}

        {/* TAB 2: Register */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-hidden focus:ring-1 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-hidden focus:ring-1 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a secure password"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-hidden focus:ring-1 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Planning Focus
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-violet-500 focus:outline-hidden focus:ring-1 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="host">💍 Wedding or Private Host</option>
                <option value="planner">🎂 Birthday & Family Celebrations Lead</option>
                <option value="community">🏘️ Community Festival Director</option>
                <option value="coordinator">🌟 Professional Event Producer</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all active:scale-[0.98]"
            >
              Register & Go to Dashboard
            </button>

            <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setError(null);
                }}
                className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
