import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';
import { GridItem } from './GridItem';

describe('Grid', () => {
  it('renders children correctly', () => {
    render(<Grid>Content</Grid>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<Grid data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.tagName).toBe('DIV');
  });

  it('applies display grid', () => {
    render(<Grid data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element).toHaveStyle({ display: 'grid' });
  });

  it('applies single column by default', () => {
    render(<Grid data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element).toHaveStyle({ gridTemplateColumns: 'repeat(1, 1fr)' });
  });

  it('applies multiple columns with number', () => {
    render(<Grid columns={3} data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element).toHaveStyle({ gridTemplateColumns: 'repeat(3, 1fr)' });
  });

  it('applies columns with custom string', () => {
    render(<Grid columns="1fr 2fr 1fr" data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element).toHaveStyle({ gridTemplateColumns: '1fr 2fr 1fr' });
  });

  it('applies gap with number', () => {
    render(<Grid gap={16} data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element).toHaveStyle({ gap: '16px' });
  });

  it('applies gap with string', () => {
    render(<Grid gap="1rem" data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element).toHaveStyle({ gap: '1rem' });
  });

  it('applies className correctly', () => {
    render(<Grid className="custom-grid" data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.className).toBe('custom-grid');
  });

  it('passes through additional HTML attributes', () => {
    render(<Grid data-testid="grid" id="my-grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.id).toBe('my-grid');
  });
});

describe('GridItem', () => {
  it('renders children correctly', () => {
    render(<GridItem>Content</GridItem>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<GridItem data-testid="item">Content</GridItem>);
    const element = screen.getByTestId('item');
    expect(element.tagName).toBe('DIV');
  });

  it('applies colSpan correctly', () => {
    render(<GridItem colSpan={2} data-testid="item">Content</GridItem>);
    const element = screen.getByTestId('item');
    expect(element).toHaveStyle({ gridColumn: 'span 2' });
  });

  it('applies rowSpan correctly', () => {
    render(<GridItem rowSpan={3} data-testid="item">Content</GridItem>);
    const element = screen.getByTestId('item');
    expect(element).toHaveStyle({ gridRow: 'span 3' });
  });

  it('applies className correctly', () => {
    render(<GridItem className="custom-item" data-testid="item">Content</GridItem>);
    const element = screen.getByTestId('item');
    expect(element.className).toBe('custom-item');
  });

  it('passes through additional HTML attributes', () => {
    render(<GridItem data-testid="item" id="my-item">Content</GridItem>);
    const element = screen.getByTestId('item');
    expect(element.id).toBe('my-item');
  });
});
