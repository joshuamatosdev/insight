import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';
import { HStack } from './HStack';

describe('Stack', () => {
  it('renders children correctly', () => {
    render(<Stack>Content</Stack>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<Stack data-testid="stack">Content</Stack>);
    const element = screen.getByTestId('stack');
    expect(element.tagName).toBe('DIV');
  });

  it('applies display flex with column direction', () => {
    render(<Stack data-testid="stack">Content</Stack>);
    const element = screen.getByTestId('stack');
    expect(element).toHaveStyle({ display: 'flex', flexDirection: 'column' });
  });

  it('applies default spacing', () => {
    render(<Stack data-testid="stack">Content</Stack>);
    const element = screen.getByTestId('stack');
    expect(element).toHaveStyle({ gap: 'var(--spacing-4)' });
  });

  it('applies custom spacing with number', () => {
    render(<Stack spacing={20} data-testid="stack">Content</Stack>);
    const element = screen.getByTestId('stack');
    expect(element).toHaveStyle({ gap: '20px' });
  });

  it('applies custom spacing with string', () => {
    render(<Stack spacing="2rem" data-testid="stack">Content</Stack>);
    const element = screen.getByTestId('stack');
    expect(element).toHaveStyle({ gap: '2rem' });
  });

  it('applies align correctly', () => {
    render(<Stack align="center" data-testid="stack">Content</Stack>);
    const element = screen.getByTestId('stack');
    expect(element).toHaveStyle({ alignItems: 'center' });
  });

  it('applies className correctly', () => {
    render(<Stack className="custom-stack" data-testid="stack">Content</Stack>);
    const element = screen.getByTestId('stack');
    expect(element.className).toBe('custom-stack');
  });

  it('passes through additional HTML attributes', () => {
    render(<Stack data-testid="stack" id="my-stack">Content</Stack>);
    const element = screen.getByTestId('stack');
    expect(element.id).toBe('my-stack');
  });
});

describe('HStack', () => {
  it('renders children correctly', () => {
    render(<HStack>Content</HStack>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<HStack data-testid="hstack">Content</HStack>);
    const element = screen.getByTestId('hstack');
    expect(element.tagName).toBe('DIV');
  });

  it('applies display flex with row direction', () => {
    render(<HStack data-testid="hstack">Content</HStack>);
    const element = screen.getByTestId('hstack');
    expect(element).toHaveStyle({ display: 'flex', flexDirection: 'row' });
  });

  it('applies justify correctly', () => {
    render(<HStack justify="between" data-testid="hstack">Content</HStack>);
    const element = screen.getByTestId('hstack');
    expect(element).toHaveStyle({ justifyContent: 'space-between' });
  });

  it('applies center alignment by default', () => {
    render(<HStack data-testid="hstack">Content</HStack>);
    const element = screen.getByTestId('hstack');
    expect(element).toHaveStyle({ alignItems: 'center' });
  });

  it('passes through additional HTML attributes', () => {
    render(<HStack data-testid="hstack" id="my-hstack">Content</HStack>);
    const element = screen.getByTestId('hstack');
    expect(element.id).toBe('my-hstack');
  });
});
