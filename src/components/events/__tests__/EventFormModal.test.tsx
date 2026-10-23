import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EventFormModal } from '../EventFormModal';

expect.extend(toHaveNoViolations);

describe('EventFormModal Component', () => {
  const mockClose = jest.fn();
  const mockSuccess = jest.fn();

  beforeEach(() => {
    mockClose.mockClear();
    mockSuccess.mockClear();
    global.fetch = jest.fn();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <EventFormModal isOpen={false} onClose={mockClose} onSuccess={mockSuccess} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly with accessible form controls when isOpen is true', () => {
    render(<EventFormModal isOpen={true} onClose={mockClose} onSuccess={mockSuccess} />);

    expect(screen.getByRole('dialog', { name: /plan a new celebration/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/celebration type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expected guests/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total budget/i)).toBeInTheDocument();
  });

  it('displays client-side validation errors when required fields are missing', async () => {
    render(<EventFormModal isOpen={true} onClose={mockClose} onSuccess={mockSuccess} />);

    const submitBtn = screen.getByRole('button', { name: /create celebration/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please provide an event name.')).toBeInTheDocument();
    expect(await screen.findByText('Please select a valid date.')).toBeInTheDocument();
    expect(mockSuccess).not.toHaveBeenCalled();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<EventFormModal isOpen={true} onClose={mockClose} onSuccess={mockSuccess} />);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('submits valid data to the API and triggers onSuccess', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 1,
          name: 'Annual Summer Festival',
          event_type: 'community',
          event_date: '2027-07-04',
          guest_count: 500,
          total_budget: 1000000,
        },
      }),
    });

    render(<EventFormModal isOpen={true} onClose={mockClose} onSuccess={mockSuccess} />);

    fireEvent.change(screen.getByLabelText(/event name/i), {
      target: { value: 'Annual Summer Festival' },
    });
    fireEvent.change(screen.getByLabelText(/celebration type/i), {
      target: { value: 'community' },
    });
    fireEvent.change(screen.getByLabelText(/event date/i), {
      target: { value: '2027-07-04' },
    });
    fireEvent.change(screen.getByLabelText(/expected guests/i), {
      target: { value: '500' },
    });
    fireEvent.change(screen.getByLabelText(/total budget/i), {
      target: { value: '10000' },
    });

    const submitBtn = screen.getByRole('button', { name: /create celebration/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/events',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(mockSuccess).toHaveBeenCalledTimes(1);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  it('passes accessibility checks without violations', async () => {
    const { container } = render(
      <EventFormModal isOpen={true} onClose={mockClose} onSuccess={mockSuccess} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
