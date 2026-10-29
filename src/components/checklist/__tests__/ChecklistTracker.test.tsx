import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChecklistTracker } from '../ChecklistTracker';
import type { Event, ChecklistItem } from '@/types';

expect.extend(toHaveNoViolations);

describe('ChecklistTracker Component', () => {
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

  const mockItems: ChecklistItem[] = [
    {
      id: 401,
      event_id: 1,
      category: 'venue',
      task: 'Book oceanfront ceremony space',
      completed: true,
      ai_generated: true,
      sort_order: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 402,
      event_id: 1,
      category: 'catering',
      task: 'Schedule seafood tasting with catering chef',
      completed: false,
      ai_generated: true,
      sort_order: 2,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 403,
      event_id: 1,
      category: 'general',
      task: 'Pick up bespoke wedding rings',
      completed: false,
      ai_generated: false,
      sort_order: 3,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockStats = {
    total: 3,
    completed: 1,
    pending: 2,
    aiGeneratedCount: 2,
    percentCompleted: 33,
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/generate')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              items: mockItems,
              stats: mockStats,
              isMock: true,
              message: 'Checklist generated.',
            },
          }),
        });
      }

      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              item: {
                id: 404,
                event_id: 1,
                category: 'decor',
                task: 'New test task',
                completed: false,
                ai_generated: false,
                sort_order: 4,
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
              },
              stats: { ...mockStats, total: 4, pending: 3 },
            },
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            items: mockItems,
            stats: mockStats,
          },
        }),
      });
    });
  });

  it('renders checklist items, category pills, and AI tags', async () => {
    render(<ChecklistTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Book oceanfront ceremony space')).toBeInTheDocument();
      expect(screen.getByText('Schedule seafood tasting with catering chef')).toBeInTheDocument();
      expect(screen.getByText('Pick up bespoke wedding rings')).toBeInTheDocument();
    });

    // Check stats and badges
    expect(screen.getByText('33% completed')).toBeInTheDocument();
    expect(screen.getAllByText('✨ AI Idea').length).toBe(2);
  });

  it('toggles task completion using accessible checkbox', async () => {
    render(<ChecklistTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Schedule seafood tasting with catering chef')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox', {
      name: /mark task as complete: schedule seafood tasting with catering chef/i,
    });
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/events/1/checklist/402',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ completed: true }),
        })
      );
    });
  });

  it('filters items by Active, Completed, and AI-only tabs', async () => {
    render(<ChecklistTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Book oceanfront ceremony space')).toBeInTheDocument();
    });

    // Filter Active
    fireEvent.click(screen.getByRole('button', { name: /active \(2\)/i }));
    expect(screen.queryByText('Book oceanfront ceremony space')).not.toBeInTheDocument();
    expect(screen.getByText('Schedule seafood tasting with catering chef')).toBeInTheDocument();

    // Filter Completed
    fireEvent.click(screen.getByRole('button', { name: /completed \(1\)/i }));
    expect(screen.getByText('Book oceanfront ceremony space')).toBeInTheDocument();
    expect(screen.queryByText('Schedule seafood tasting with catering chef')).not.toBeInTheDocument();

    // Filter AI Ideas
    fireEvent.click(screen.getByRole('button', { name: /✨ ai ideas \(2\)/i }));
    expect(screen.getByText('Book oceanfront ceremony space')).toBeInTheDocument();
    expect(screen.getByText('Schedule seafood tasting with catering chef')).toBeInTheDocument();
    expect(screen.queryByText('Pick up bespoke wedding rings')).not.toBeInTheDocument();
  });

  it('passes accessibility audits without violations', async () => {
    const { container } = render(<ChecklistTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Book oceanfront ceremony space')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
