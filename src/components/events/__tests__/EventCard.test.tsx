import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EventCard } from '../EventCard';
import type { EventWithStats } from '@/lib/events';

expect.extend(toHaveNoViolations);

describe('EventCard Component', () => {
  const mockEvent: EventWithStats = {
    id: 42,
    name: 'Sophia & Lucas Wedding',
    event_type: 'wedding',
    event_date: '2027-08-21',
    guest_count: 150,
    total_budget: 3500000, // $35,000 in cents
    description: 'An elegant coastal celebration with family and friends',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    total_planned_budget: 3000000,
    total_spent_budget: 1200000,
    milestones_count: 8,
    milestones_completed: 3,
    vendors_count: 5,
    checklist_count: 12,
    checklist_completed: 6,
  };

  const mockDelete = jest.fn();

  beforeEach(() => {
    mockDelete.mockClear();
  });

  it('renders event details accurately', () => {
    render(<EventCard event={mockEvent} onDeleteRequest={mockDelete} />);

    expect(screen.getByText('Sophia & Lucas Wedding')).toBeInTheDocument();
    expect(screen.getByText('Wedding')).toBeInTheDocument();
    expect(screen.getByText('₹35,000')).toBeInTheDocument();
    expect(screen.getByText('150 expected')).toBeInTheDocument();
    expect(screen.getByText(/An elegant coastal celebration/)).toBeInTheDocument();
    expect(screen.getByText('6/12 tasks')).toBeInTheDocument();
  });

  it('links to the detailed event assistant page', () => {
    render(<EventCard event={mockEvent} onDeleteRequest={mockDelete} />);

    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/events/42');
  });

  it('triggers delete request with the event object when clicked', () => {
    render(<EventCard event={mockEvent} onDeleteRequest={mockDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /delete event sophia & lucas wedding/i });
    fireEvent.click(deleteBtn);

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith(mockEvent);
  });

  it('meets accessibility standards without a11y violations', async () => {
    const { container } = render(<EventCard event={mockEvent} onDeleteRequest={mockDelete} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
