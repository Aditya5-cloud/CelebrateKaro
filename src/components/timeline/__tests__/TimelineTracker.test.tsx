import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TimelineTracker } from '../TimelineTracker';
import type { Event, Milestone } from '@/types';

expect.extend(toHaveNoViolations);

describe('TimelineTracker Component', () => {
  const mockEvent: Event = {
    id: 1,
    name: 'Olivia & Liam Wedding',
    event_type: 'wedding',
    event_date: '2027-10-15',
    guest_count: 150,
    total_budget: 3000000,
    description: '',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  const mockMilestones: Milestone[] = [
    {
      id: 201,
      event_id: 1,
      title: 'Book Ceremony Venue',
      due_date: '2027-04-15',
      description: 'Reserve chapel and reception hall',
      completed: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 202,
      event_id: 1,
      title: 'Hire Photographer',
      due_date: '2027-06-15',
      description: 'Sign photography contract',
      completed: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockStats = {
    total: 2,
    completed: 1,
    pending: 1,
    overdue: 0,
    percentCompleted: 50,
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          milestones: mockMilestones,
          stats: mockStats,
        },
      }),
    });
  });

  it('renders milestone cards and KPI metrics accurately', async () => {
    render(<TimelineTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Book Ceremony Venue')).toBeInTheDocument();
      expect(screen.getByText('Hire Photographer')).toBeInTheDocument();
    });

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Scheduled checkpoints')).toBeInTheDocument();
  });

  it('provides accessible toggle checkboxes for completing milestones', async () => {
    render(<TimelineTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Book Ceremony Venue')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox', {
      name: /mark "hire photographer" as complete/i,
    });
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/events/1/milestones/202',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ completed: true }),
        })
      );
    });
  });

  it('filters milestones by status', async () => {
    render(<TimelineTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Book Ceremony Venue')).toBeInTheDocument();
    });

    // Click Pending filter
    fireEvent.click(screen.getByRole('button', { name: /pending/i }));
    expect(screen.queryByText('Book Ceremony Venue')).not.toBeInTheDocument();
    expect(screen.getByText('Hire Photographer')).toBeInTheDocument();

    // Click Completed filter
    fireEvent.click(screen.getByRole('button', { name: /completed/i }));
    expect(screen.getByText('Book Ceremony Venue')).toBeInTheDocument();
    expect(screen.queryByText('Hire Photographer')).not.toBeInTheDocument();
  });

  it('passes accessibility audits without violations', async () => {
    const { container } = render(<TimelineTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Book Ceremony Venue')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
