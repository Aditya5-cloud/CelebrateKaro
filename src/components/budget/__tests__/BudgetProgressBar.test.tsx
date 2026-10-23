import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BudgetProgressBar } from '../BudgetProgressBar';

expect.extend(toHaveNoViolations);

describe('BudgetProgressBar Component', () => {
  it('renders progress bar with accurate ARIA attributes when within budget', () => {
    render(<BudgetProgressBar spentCents={500000} targetCents={1000000} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText(/Within Budget \(50%\)/)).toBeInTheDocument();
  });

  it('renders near limit warning badge when spend is >= 85%', () => {
    render(<BudgetProgressBar spentCents={900000} targetCents={1000000} />);
    expect(screen.getByText(/Near Limit \(90%\)/)).toBeInTheDocument();
  });

  it('renders over-budget warning when actual spend exceeds target', () => {
    render(<BudgetProgressBar spentCents={1200000} targetCents={1000000} />);
    expect(screen.getByText(/Over Budget \(120%\)/)).toBeInTheDocument();
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(<BudgetProgressBar spentCents={400000} targetCents={1000000} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
