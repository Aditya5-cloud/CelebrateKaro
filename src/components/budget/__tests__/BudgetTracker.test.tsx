import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BudgetTracker } from '../BudgetTracker';
import type { Event, BudgetCategory } from '@/types';

expect.extend(toHaveNoViolations);

describe('BudgetTracker Component', () => {
  const mockEvent: Event = {
    id: 1,
    name: 'Emma & Noah Wedding',
    event_type: 'wedding',
    event_date: '2027-09-25',
    guest_count: 120,
    total_budget: 2500000, // $25,000
    description: '',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  const mockCategories: BudgetCategory[] = [
    {
      id: 101,
      event_id: 1,
      name: 'Venue & Banquet Hall',
      planned_amount: 800000, // $8,000
      actual_amount: 400000,  // $4,000
      notes: 'Initial deposit paid',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 102,
      event_id: 1,
      name: 'Catering & Beverages',
      planned_amount: 700000, // $7,000
      actual_amount: 750000,  // $7,500 (over planned by $500)
      notes: '',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockSummary = {
    eventId: 1,
    totalTargetBudget: 2500000,
    totalPlanned: 1500000,
    totalSpent: 1150000,
    remainingFromTarget: 1350000,
    unallocatedTarget: 1000000,
    isOverBudget: false,
    isOverPlanned: false,
    percentSpent: 46,
    percentPlanned: 60,
    categoryCount: 2,
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          categories: mockCategories,
          summary: mockSummary,
        },
      }),
    });
  });

  it('renders budget KPI cards and category rows properly', async () => {
    render(<BudgetTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Venue & Banquet Hall')).toBeInTheDocument();
      expect(screen.getByText('Catering & Beverages')).toBeInTheDocument();
    });

    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText('$15,000')).toBeInTheDocument();
    expect(screen.getByText('$11,500')).toBeInTheDocument();
    expect(screen.getByText('$13,500')).toBeInTheDocument();
  });

  it('renders table headers with semantic attributes', async () => {
    render(<BudgetTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByRole('table', { name: /budget categories table/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('columnheader', { name: /category & notes/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /^planned$/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /actual spent/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /variance/i })).toBeInTheDocument();
  });

  it('passes accessibility checks without violations', async () => {
    const { container } = render(<BudgetTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Venue & Banquet Hall')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
