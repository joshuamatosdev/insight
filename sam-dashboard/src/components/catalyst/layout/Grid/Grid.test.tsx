import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Grid} from './Grid';
import {GridItem} from './GridItem';

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

  it('applies grid class', () => {
    render(<Grid data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.className).toContain('grid');
  });

  it('applies single column class by default', () => {
    render(<Grid data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.className).toContain('grid-cols-1');
  });

  it('applies multiple columns class with number', () => {
    render(<Grid columns={3} data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.className).toContain('grid-cols-3');
  });

  it('applies columns with custom string via inline style', () => {
    render(<Grid columns="1fr 2fr 1fr" data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element).toHaveStyle({gridTemplateColumns: '1fr 2fr 1fr'});
  });

  it('applies gap class with size token', () => {
    render(<Grid gap="lg" data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.className).toContain('gap-6');
  });

  it('applies rowGap class with size token', () => {
    render(<Grid rowGap="md" data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.className).toContain('gap-y-4');
  });

  it('applies columnGap class with size token', () => {
    render(<Grid columnGap="sm" data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.className).toContain('gap-x-2');
  });

  it('applies className correctly', () => {
    render(<Grid className="custom-grid" data-testid="grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.className).toContain('custom-grid');
  });

  it('passes through additional HTML attributes', () => {
    render(<Grid data-testid="grid" id="my-grid">Content</Grid>);
    const element = screen.getByTestId('grid');
    expect(element.id).toBe('my-grid');
  });

  it('does not pass BaseStyleProps to DOM', () => {
    render(
      <Grid
        data-testid="grid"
        marginRight="lg"
        padding="md"
        fullWidth={true}
      >
        Content
      </Grid>
    );
    const element = screen.getByTestId('grid');
    expect(element).not.toHaveAttribute('marginRight');
    expect(element).not.toHaveAttribute('padding');
    expect(element).not.toHaveAttribute('fullWidth');
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
    expect(element).toHaveStyle({gridColumn: 'span 2'});
  });

  it('applies rowSpan correctly', () => {
    render(<GridItem rowSpan={3} data-testid="item">Content</GridItem>);
    const element = screen.getByTestId('item');
    expect(element).toHaveStyle({gridRow: 'span 3'});
  });

  it('applies className correctly', () => {
    render(<GridItem className="custom-item" data-testid="item">Content</GridItem>);
    const element = screen.getByTestId('item');
    expect(element.className).toContain('custom-item');
  });

  it('passes through additional HTML attributes', () => {
    render(<GridItem data-testid="item" id="my-item">Content</GridItem>);
    const element = screen.getByTestId('item');
    expect(element.id).toBe('my-item');
  });

  it('does not pass BaseStyleProps to DOM', () => {
    render(
      <GridItem
        data-testid="item"
        marginRight="lg"
        padding="md"
        fullWidth={true}
      >
        Content
      </GridItem>
    );
    const element = screen.getByTestId('item');
    expect(element).not.toHaveAttribute('marginRight');
    expect(element).not.toHaveAttribute('padding');
    expect(element).not.toHaveAttribute('fullWidth');
  });
});
