import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<Card data-testid="card">Content</Card>);
    const element = screen.getByTestId('card');
    expect(element.tagName).toBe('DIV');
  });

  it('applies border-radius', () => {
    render(<Card data-testid="card">Content</Card>);
    const element = screen.getByTestId('card');
    expect(element).toHaveStyle({ borderRadius: 'var(--radius-xl)' });
  });

  it('applies overflow hidden', () => {
    render(<Card data-testid="card">Content</Card>);
    const element = screen.getByTestId('card');
    expect(element).toHaveStyle({ overflow: 'hidden' });
  });

  it('applies className correctly', () => {
    render(<Card className="custom-card" data-testid="card">Content</Card>);
    const element = screen.getByTestId('card');
    expect(element.className).toBe('custom-card');
  });

  it('passes through additional HTML attributes', () => {
    render(<Card data-testid="card" id="my-card">Content</Card>);
    const element = screen.getByTestId('card');
    expect(element.id).toBe('my-card');
  });
});

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header Content</CardHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<CardHeader data-testid="header">Content</CardHeader>);
    const element = screen.getByTestId('header');
    expect(element.tagName).toBe('DIV');
  });

  it('applies padding', () => {
    render(<CardHeader data-testid="header">Content</CardHeader>);
    const element = screen.getByTestId('header');
    expect(element).toHaveStyle({ padding: 'var(--spacing-4) var(--spacing-5)' });
  });

  it('passes through additional HTML attributes', () => {
    render(<CardHeader data-testid="header" id="my-header">Content</CardHeader>);
    const element = screen.getByTestId('header');
    expect(element.id).toBe('my-header');
  });
});

describe('CardBody', () => {
  it('renders children correctly', () => {
    render(<CardBody>Body Content</CardBody>);
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<CardBody data-testid="body">Content</CardBody>);
    const element = screen.getByTestId('body');
    expect(element.tagName).toBe('DIV');
  });

  it('applies default md padding', () => {
    render(<CardBody data-testid="body">Content</CardBody>);
    const element = screen.getByTestId('body');
    expect(element).toHaveStyle({ padding: 'var(--spacing-5)' });
  });

  it('applies none padding when specified', () => {
    render(<CardBody padding="none" data-testid="body">Content</CardBody>);
    const element = screen.getByTestId('body');
    expect(element).toHaveStyle({ padding: '0' });
  });

  it('passes through additional HTML attributes', () => {
    render(<CardBody data-testid="body" id="my-body">Content</CardBody>);
    const element = screen.getByTestId('body');
    expect(element.id).toBe('my-body');
  });
});

describe('CardFooter', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer Content</CardFooter>);
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<CardFooter data-testid="footer">Content</CardFooter>);
    const element = screen.getByTestId('footer');
    expect(element.tagName).toBe('DIV');
  });

  it('applies padding', () => {
    render(<CardFooter data-testid="footer">Content</CardFooter>);
    const element = screen.getByTestId('footer');
    expect(element).toHaveStyle({ padding: 'var(--spacing-4) var(--spacing-5)' });
  });

  it('passes through additional HTML attributes', () => {
    render(<CardFooter data-testid="footer" id="my-footer">Content</CardFooter>);
    const element = screen.getByTestId('footer');
    expect(element.id).toBe('my-footer');
  });
});
