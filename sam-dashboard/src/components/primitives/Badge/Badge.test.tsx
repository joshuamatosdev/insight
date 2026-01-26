import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Status</Badge>);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<Badge data-testid="badge">Label</Badge>);
    const element = screen.getByTestId('badge');
    expect(element.tagName).toBe('SPAN');
  });

  it('applies className correctly', () => {
    render(<Badge className="custom-badge" data-testid="badge">Label</Badge>);
    const element = screen.getByTestId('badge');
    expect(element.className).toBe('custom-badge');
  });

  it('renders with inline-flex display', () => {
    render(<Badge data-testid="badge">Label</Badge>);
    const element = screen.getByTestId('badge');
    expect(element).toHaveStyle({ display: 'inline-flex' });
  });

  it('renders with proper alignment', () => {
    render(<Badge data-testid="badge">Label</Badge>);
    const element = screen.getByTestId('badge');
    expect(element).toHaveStyle({ alignItems: 'center', justifyContent: 'center' });
  });

  it('merges custom styles with base styles', () => {
    render(
      <Badge data-testid="badge" style={{ marginTop: '10px' }}>
        Label
      </Badge>
    );
    const element = screen.getByTestId('badge');
    expect(element).toHaveStyle({ marginTop: '10px' });
  });

  it('passes through additional HTML attributes', () => {
    render(<Badge data-testid="badge" id="my-badge" title="tooltip">Label</Badge>);
    const element = screen.getByTestId('badge');
    expect(element.id).toBe('my-badge');
    expect(element.title).toBe('tooltip');
  });
});
