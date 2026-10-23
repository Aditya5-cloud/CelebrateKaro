'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, Event } from '@/types';

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

export function ChatAssistant({ event }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>('gemini-2.0-flash');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/chat`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load chat history.');
      }
      setMessages(json.data.messages);
    } catch (err: unknown) {
      console.error(err);
      setError('Could not load conversation history.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [event.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

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
      const res = await fetch(`/api/events/${event.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
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
      if (json.data.model) {
        setActiveModel(json.data.model);
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
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[700px]"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-lg">
            ✨
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm tracking-tight text-white">
                GenAI Planning Assistant
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200">
                {activeModel.includes('gemini') ? 'Gemini 2.0' : 'Grounded Assistant'}
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              Grounded in your budget, vendors, timeline & checklist for {event.name}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearChat}
            className="text-xs text-indigo-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Message List */}
      <div
        className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50"
        role="log"
        aria-live="polite"
      >
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            <div className="inline-block w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
            <span>Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-3 shadow-xs">
              🤖
            </div>
            <h4 className="text-base font-bold text-slate-900">
              How can I assist your {event.event_type} planning?
            </h4>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              I am grounded in your live event state: budget allocations, timeline deadlines, booked vendors, and checklist tasks.
            </p>

            {/* Quick Starter Chips */}
            <div className="w-full space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-left">
                Suggested questions:
              </p>
              <div className="flex flex-col gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left text-xs text-slate-700 bg-white hover:bg-indigo-50/60 hover:text-indigo-900 hover:border-indigo-200 p-3 rounded-xl border border-slate-200/80 shadow-2xs transition-all flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <span className="text-slate-300 group-hover:text-indigo-500 transition-colors">
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
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-xs">
                      ✨
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-normal prose prose-xs max-w-none text-inherit">
                      {msg.content}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-xs">
                      👤
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-start space-x-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-xs">
                  ✨
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                  <div className="flex items-center space-x-1.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
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
        <div role="alert" className="px-6 py-2 bg-rose-50 border-t border-rose-200 text-xs text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Input Box Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-white border-t border-slate-200/80 shrink-0"
      >
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about budget, vendor gaps, timeline deadlines, or custom ideas..."
            aria-label="Type your planning question"
            disabled={isSending}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 hover:bg-white focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            aria-label="Send message to assistant"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}
