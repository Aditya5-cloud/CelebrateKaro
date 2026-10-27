import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from '../AuthModal';
import { registerUser } from '@/lib/auth';

describe('AuthModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AuthModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders sign in fields by default when open', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in to dashboard/i })).toBeInTheDocument();
  });

  it('switches between Sign In and Create Account tabs', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const createTabBtn = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(createTabBtn);

    expect(screen.getByPlaceholderText(/e\.g\. Rachel Adams/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/choose a secure password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/re-enter your password/i)).toBeInTheDocument();
  });

  it('shows error when sign in fails with wrong password', async () => {
    // Register a test user first with a specific password
    await registerUser('Test User', 'test@example.com', 'RightPassword123', 'host');

    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'WrongPassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in to dashboard/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/incorrect password/i);
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess when sign in succeeds with correct password', async () => {
    await registerUser('Correct User', 'correct@example.com', 'CorrectPassword123', 'host');

    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: 'correct@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'CorrectPassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in to dashboard/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'correct@example.com',
          name: 'Correct User',
        }),
        'login'
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
