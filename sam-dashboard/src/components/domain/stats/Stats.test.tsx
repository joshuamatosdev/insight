import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { StatsGrid } from './StatsGrid';
import { Box } from '../../layout';

describe('StatCard', () => {
  it('renders value correctly', () => {
    render(<StatCard value={42} label="Total" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders label correctly', () => {
    render(<StatCard value={42} label="Total Items" />);
    expect(screen.getByText('Total Items')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <StatCard
        value={42}
        label="Total"
        icon={<Box as="span" data-testid="icon">📊</Box>}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies className correctly', () => {
    const { container } = render(
      <StatCard value={42} label="Total" className="custom-stat" />
    );
    expect(container.firstChild).toHaveClass('custom-stat');
  });

  it('renders with primary variant by default', () => {
    const { container } = render(<StatCard value={42} label="Total" />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ borderRadius: 'var(--radius-xl)' });
  });

  it('renders string value', () => {
    render(<StatCard value="$1,234" label="Revenue" />);
    expect(screen.getByText('$1,234')).toBeInTheDocument();
  });
});

describe('StatsGrid', () => {
  it('renders children correctly', () => {
    render(
      <StatsGrid>
        <StatCard value={1} label="One" />
        <StatCard value={2} label="Two" />
      </StatsGrid>
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders as a grid container', () => {
    const { container } = render(
      <StatsGrid>
        <StatCard value={1} label="One" />
      </StatsGrid>
    );
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ display: 'grid' });
  });

  it('applies default column count', () => {
    const { container } = render(
      <StatsGrid>
        <StatCard value={1} label="One" />
      </StatsGrid>
    );
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gridTemplateColumns: 'repeat(4, 1fr)' });
  });

  it('applies custom column count', () => {
    const { container } = render(
      <StatsGrid columns={3}>
        <StatCard value={1} label="One" />
      </StatsGrid>
    );
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gridTemplateColumns: 'repeat(3, 1fr)' });
  });
});
