import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { VendorTracker } from '../VendorTracker';
import type { Event, Vendor } from '@/types';

expect.extend(toHaveNoViolations);

describe('VendorTracker Component', () => {
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

  const mockVendors: Vendor[] = [
    {
      id: 301,
      event_id: 1,
      name: 'Grand Ballroom Plaza',
      category: 'venue',
      status: 'booked',
      contact_name: 'David Miller',
      contact_email: 'david@ballroom.com',
      contact_phone: '555-1234',
      price_quote: 850000, // $8,500
      notes: 'Deposit paid, contract signed.',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 302,
      event_id: 1,
      name: 'Sunset Florals',
      category: 'florist',
      status: 'considering',
      contact_name: 'Rose Tyler',
      contact_email: 'rose@sunsetflorals.com',
      contact_phone: '555-5678',
      price_quote: 180000, // $1,800
      notes: 'Requested brochure and sample bouquet portfolio.',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockStats = {
    total: 2,
    considering: 1,
    contacted: 0,
    booked: 1,
    paid: 0,
    cancelled: 0,
    totalQuotes: 1030000,
    percentBookedOrPaid: 50,
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          vendors: mockVendors,
          stats: mockStats,
        },
      }),
    });
  });

  it('renders vendor cards and summary metrics accurately', async () => {
    render(<VendorTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Grand Ballroom Plaza')).toBeInTheDocument();
      expect(screen.getByText('Sunset Florals')).toBeInTheDocument();
    });

    // Check quotes and stats
    expect(screen.getByText('$8,500')).toBeInTheDocument();
    expect(screen.getByText('$1,800')).toBeInTheDocument();
    expect(screen.getByText('50% secured')).toBeInTheDocument();
    expect(screen.getByText('David Miller')).toBeInTheDocument();
    expect(screen.getByText('david@ballroom.com')).toBeInTheDocument();
  });

  it('advances vendor status using the next stage button', async () => {
    render(<VendorTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Sunset Florals')).toBeInTheDocument();
    });

    const advanceBtn = screen.getByRole('button', { name: /mark contacted/i });
    fireEvent.click(advanceBtn);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/events/1/vendors/302',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'contacted' }),
      })
    );
  });

  it('filters vendors by status tabs and search query', async () => {
    render(<VendorTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Grand Ballroom Plaza')).toBeInTheDocument();
      expect(screen.getByText('Sunset Florals')).toBeInTheDocument();
    });

    // Filter by Considering
    fireEvent.click(screen.getByRole('button', { name: /considering/i }));
    expect(screen.queryByText('Grand Ballroom Plaza')).not.toBeInTheDocument();
    expect(screen.getByText('Sunset Florals')).toBeInTheDocument();

    // Reset to All
    fireEvent.click(screen.getByRole('button', { name: /all/i }));
    expect(screen.getByText('Grand Ballroom Plaza')).toBeInTheDocument();

    // Search query
    const searchInput = screen.getByLabelText(/search vendors/i);
    fireEvent.change(searchInput, { target: { value: 'Ballroom' } });
    expect(screen.getByText('Grand Ballroom Plaza')).toBeInTheDocument();
    expect(screen.queryByText('Sunset Florals')).not.toBeInTheDocument();
  });

  it('passes accessibility audits without violations', async () => {
    const { container } = render(<VendorTracker event={mockEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Grand Ballroom Plaza')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
