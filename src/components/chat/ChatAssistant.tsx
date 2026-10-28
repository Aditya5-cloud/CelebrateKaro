'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, Event } from '@/types';
import { getCurrentUser } from '@/lib/auth';
import { getRelativeDays } from '@/lib/formatters';

interface ChatAssistantProps {
  event: Event;
}

const STARTER_PROMPTS = [
  'How is my budget looking and where can I optimize?',
  'What key vendors am I still missing for this event?',
  'What are my immediate next timeline milestones?',
  'Suggest 3 personalized creative ideas for my guests.',
  'Help me design a cost-effective decoration plan.',
];

const POST_EVENT_STARTER_PROMPTS = [
  'Draft personalized Thank You notes to send to attendees.',
  'Help me write gracious thank-you messages & reviews for our vendors.',
  'Review our final budget vs planned spend reconciliation.',
  'Suggest creative ideas for sharing photos and memory scrapbooks with guests.',
  'Tips for planning next year\'s celebration or anniversary edition.',
];

export function ChatAssistant({ event }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const MAX_QUESTIONS = 5;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUser = typeof window !== 'undefined' ? getCurrentUser() : null;
  const userName = currentUser?.name;
  const relativeDate = getRelativeDays(event.event_date);
  const isPast = relativeDate.isPast;
  const activePrompts = isPast ? POST_EVENT_STARTER_PROMPTS : STARTER_PROMPTS;

  const effectiveQuestionCount = Math.max(
    questionCount,
    messages.filter((m) => m.role === 'user').length
  );
  const isLimitReached = effectiveQuestionCount >= MAX_QUESTIONS;
  const questionsRemaining = Math.max(0, MAX_QUESTIONS - effectiveQuestionCount);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (currentUser?.id) {
        headers['x-user-id'] = currentUser.id;
      }
      const res = await fetch(`/api/events/${event.id}/chat`, { headers });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load chat history.');
      }
      setMessages(json.data.messages);
      if (typeof json.data?.questionCount === 'number') {
        setQuestionCount(json.data.questionCount);
      } else {
        const uCount = json.data.messages.filter((m: ChatMessage) => m.role === 'user').length;
        setQuestionCount(uCount);
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Could not load conversation history.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [event.id, currentUser?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    if (isLimitReached) {
      setError(`You have reached the limit of ${MAX_QUESTIONS} questions for the AI assistant.`);
      return;
    }

    setError(null);
    setInputMessage('');
    setIsSending(true);

    // Optimistically append user message
    const tempUserMessage: ChatMessage = {
      id: Date.now(),
      event_id: event.id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const payload: { message: string; userName?: string } = { message: text };
      if (userName) {
        payload.userName = userName;
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser?.id) {
        headers['x-user-id'] = currentUser.id;
      }

      const res = await fetch(`/api/events/${event.id}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate assistant reply.');
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMessage.id),
        json.data.userMessage,
        json.data.assistantMessage,
      ]);
      if (typeof json.data?.questionCount === 'number') {
        setQuestionCount(json.data.questionCount);
      } else {
        setQuestionCount((prev) => prev + 1);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error sending message.');
      // Remove optimistic message if failed
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      setInputMessage(text);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Clear conversation history?')) return;
    try {
      const res = await fetch(`/api/events/${event.id}/chat`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
      alert('Could not clear history.');
    }
  };

  return (
    <section
      aria-label="AI Planning Assistant Chat"
      className="bg-white rounded-none border border-[#FEC7B4] shadow-xs overflow-hidden flex flex-col h-[calc(100dvh-175px)] sm:h-[calc(100vh-140px)] min-h-[420px] sm:min-h-[500px] max-h-[800px]"
    >
      {/* Sleek Action Header when history exists */}
      {messages.length > 0 && (
        <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#FFF3C7] border-b border-[#FEC7B4] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[#F7418F]" />
            <span className="text-xs font-bold text-[#2A0E1C]">AI Planning Concierge</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-none border ${
                isLimitReached
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-white text-[#F7418F] border-[#FC819E]'
              }`}
            >
              {isLimitReached
                ? '5/5 questions asked'
                : `${questionsRemaining} of 5 questions left`}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearChat}
            className="text-xs font-bold text-[#F7418F] hover:bg-[#FEC7B4]/50 px-2 sm:px-2.5 py-1 rounded-none border border-[#FC819E] transition-colors cursor-pointer"
          >
            Clear Chat
          </button>
        </div>
      )}

      {/* Message List */}
      <div
        className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 bg-[#FFF3C7]/20"
        role="log"
        aria-live="polite"
      >
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full text-[#2A0E1C]/60 text-sm">
            <div className="inline-block w-6 h-6 border-2 border-[#F7418F] border-t-transparent rounded-full animate-spin mr-2" />
            <span>Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-4">
            <div className="w-10 h-10 rounded-none bg-[#FEC7B4] text-[#F7418F] flex items-center justify-center text-lg mb-2 shadow-xs font-bold">
              ✨
            </div>
            <h4 className="text-base font-bold text-[#2A0E1C]">
              {userName
                ? isPast
                  ? `Hey ${userName}, hope your ${event.event_type} was wonderful! Ready for post-celebration wrap-up?`
                  : `Hey ${userName}, how can I assist your ${event.event_type} planning?`
                : isPast
                ? `How can I assist your ${event.event_type} wrap-up?`
                : `How can I assist your ${event.event_type} planning?`}
            </h4>
            <p className="text-xs text-[#2A0E1C]/70 mt-1 mb-3">
              {isPast
                ? 'Ask any question about drafting guest thank-yous, final vendor reviews, expense reconciliation, or preserving celebration memories:'
                : userName
                ? `Ok ${userName}, according to the requirements, ask any question about your budget, vendors, timeline, or celebration ideas:`
                : 'Ask any question about your budget allocations, vendor gaps, timeline milestones, or personalized celebration ideas:'}
            </p>

            {/* 5-Question Allowance Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-white border border-[#FEC7B4] text-xs font-bold text-[#2A0E1C] mb-4 shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span>
                {isLimitReached
                  ? 'Limit reached: 5 of 5 questions asked'
                  : `${questionsRemaining} of 5 questions available for YOU`}
              </span>
            </div>

            {/* Quick Starter Chips */}
            <div className="w-full space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#2A0E1C]/60 text-left">
                Suggested questions:
              </p>
              <div className="flex flex-col gap-2">
                {activePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left text-xs font-bold text-[#2A0E1C] bg-white hover:bg-[#FEC7B4]/40 p-2.5 rounded-none border border-[#FEC7B4] shadow-2xs transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <span className="text-[#FC819E] group-hover:text-[#F7418F] transition-colors">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-none bg-[#F7418F] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                      ✨
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-none px-4 py-3 text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#F7418F] text-white'
                        : 'bg-white text-[#2A0E1C] border border-[#FEC7B4]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-normal prose prose-xs max-w-none text-inherit">
                      {msg.content}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-none bg-[#FEC7B4] text-[#F7418F] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                      👤
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-start space-x-2.5 justify-start">
                <div className="w-7 h-7 rounded-none bg-[#F7418F] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                  ✨
                </div>
                <div className="bg-white border border-[#FEC7B4] rounded-none px-4 py-3 shadow-xs">
                  <div className="flex items-center space-x-1.5 py-1">
                    <span className="w-2 h-2 rounded-none bg-[#F7418F] animate-bounce" />
                    <span className="w-2 h-2 rounded-none bg-[#F7418F] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-none bg-[#F7418F] animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div role="alert" className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-xs text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* 5-Question Limit Reached Notice */}
      {isLimitReached && (
        <div role="status" className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-2">
          <span>🔒</span>
          <span>You have reached the limit of 5 questions for the AI assistant.</span>
        </div>
      )}

      {/* Input Box Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 sm:p-3.5 bg-white border-t border-[#FEC7B4] shrink-0"
      >
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isLimitReached
                ? 'Question limit reached (5 of 5 asked)'
                : 'Ask about budget, vendor gaps, timeline ideas...'
            }
            aria-label="Type your planning question"
            disabled={isSending || isLimitReached}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-none border border-[#FEC7B4] text-[#2A0E1C] placeholder-[#2A0E1C]/40 focus:outline-hidden focus:border-[#F7418F] focus:ring-1 focus:ring-[#F7418F] bg-white transition-colors disabled:bg-slate-50 disabled:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending || isLimitReached}
            aria-label="Send message to assistant"
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#F7418F] hover:bg-[#F7418F]/90 active:bg-[#F7418F] disabled:opacity-40 text-white font-bold rounded-none shadow-xs transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}
