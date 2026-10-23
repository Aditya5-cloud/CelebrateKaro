import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChatAssistant } from '../ChatAssistant';
import type { Event, ChatMessage } from '@/types';

expect.extend(toHaveNoViolations);

describe('ChatAssistant Component', () => {
  const mockEvent: Event = {
    id: 1,
    name: 'Emma & Noah Seaside Nuptials',
    event_type: 'wedding',
    event_date: '2027-08-14',
    guest_count: 120,
    total_budget: 2500000,
    description: 'Beachfront wedding ceremony',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  const mockMessages: ChatMessage[] = [
    {
      id: 501,
      event_id: 1,
      role: 'user',
      content: 'Where can I reduce costs for my wedding?',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 502,
      event_id: 1,
      role: 'assistant',
      content: 'Consider choosing seasonal flowers and buffet-style catering.',
      created_at: '2026-01-01T00:00:05.000Z',
    },
  ];

  beforeEach(() => {
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    global.fetch = jest.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              userMessage: {
                id: 503,
                event_id: 1,
                role: 'user',
                content: 'Test user message',
                created_at: '2026-01-01T00:00:10.000Z',
              },
              assistantMessage: {
                id: 504,
                event_id: 1,
                role: 'assistant',
                content: 'Here is your personalized assistant response.',
                created_at: '2026-01-01T00:00:11.000Z',
              },
              isMock: true,
              model: 'grounded-event-assistant',
            },
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            messages: mockMessages,
          },
        }),
      });
    });
  });

  it('renders conversation history correctly', async () => {
    render(<ChatAssistant event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Where can I reduce costs for my wedding?')).toBeInTheDocument();
      expect(
        screen.getByText('Consider choosing seasonal flowers and buffet-style catering.')
      ).toBeInTheDocument();
    });
  });

  it('allows sending a new message to the assistant', async () => {
    render(<ChatAssistant event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Where can I reduce costs for my wedding?')).toBeInTheDocument();
    });

    const input = screen.getByLabelText(/type your planning question/i);
    const sendBtn = screen.getByLabelText(/send message to assistant/i);

    fireEvent.change(input, { target: { value: 'How is my budget looking?' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText('Here is your personalized assistant response.')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/events/1/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'How is my budget looking?' }),
      })
    );
  });

  it('passes accessibility audits without violations', async () => {
    const { container } = render(<ChatAssistant event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Where can I reduce costs for my wedding?')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
