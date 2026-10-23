import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { VendorEmailModal } from '../VendorEmailModal';
import type { Event, Vendor } from '@/types';

expect.extend(toHaveNoViolations);

describe('VendorEmailModal Component', () => {
  const mockEvent: Event = {
    id: 1,
    name: 'Olivia & Liam Summer Wedding',
    event_type: 'wedding',
    event_date: '2027-07-24',
    guest_count: 140,
    total_budget: 3500000,
    description: 'Outdoor vineyard wedding',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const mockVendor: Vendor = {
    id: 201,
    event_id: 1,
    name: 'Gourmet Vineyard Catering',
    category: 'catering',
    status: 'considering',
    contact_name: 'Chef Antoine',
    contact_email: 'antoine@catering.com',
    contact_phone: '555-1234',
    price_quote: 650000,
    notes: 'Vegan options',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const type = body.emailType || 'inquiry';

      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            subject: `Subject for ${type}: ${mockEvent.name}`,
            body: `Dear Chef Antoine,\n\nWe are planning ${mockEvent.name} on ${mockEvent.event_date}.`,
            isMock: true,
            model: 'fallback-email-drafter',
            vendor: mockVendor,
          },
        }),
      });
    });
  });

  it('renders modal with vendor info and initial draft', async () => {
    render(
      <VendorEmailModal
        isOpen={true}
        onClose={jest.fn()}
        event={mockEvent}
        vendor={mockVendor}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('AI Vendor Email Drafter')).toBeInTheDocument();
      expect(screen.getByText('Gourmet Vineyard Catering')).toBeInTheDocument();
    });

    await waitFor(() => {
      const subjectInput = screen.getByLabelText(/subject line/i) as HTMLInputElement;
      expect(subjectInput.value).toContain('Subject for inquiry');
    });
  });

  it('switches email template when clicking goal buttons', async () => {
    render(
      <VendorEmailModal
        isOpen={true}
        onClose={jest.fn()}
        event={mockEvent}
        vendor={mockVendor}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Price Quote (RFQ)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Price Quote (RFQ)'));

    await waitFor(() => {
      const subjectInput = screen.getByLabelText(/subject line/i) as HTMLInputElement;
      expect(subjectInput.value).toContain('Subject for quote');
    });
  });

  it('passes accessibility audits without violations', async () => {
    const { container } = render(
      <VendorEmailModal
        isOpen={true}
        onClose={jest.fn()}
        event={mockEvent}
        vendor={mockVendor}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('AI Vendor Email Drafter')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
