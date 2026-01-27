import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text', () => {
  it('renders children correctly', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders as p by default for body variant', () => {
    render(<Text data-testid="text">Body text</Text>);
    const element = screen.getByTestId('text');
    expect(element.tagName).toBe('P');
  });

  it('renders as h1 for heading1 variant', () => {
    render(<Text variant="heading1" data-testid="text">Heading 1</Text>);
    const element = screen.getByTestId('text');
    expect(element.tagName).toBe('H1');
  });

  it('renders as h2 for heading2 variant', () => {
    render(<Text variant="heading2" data-testid="text">Heading 2</Text>);
    const element = screen.getByTestId('text');
    expect(element.tagName).toBe('H2');
  });

  it('renders as h3 for heading3 variant', () => {
    render(<Text variant="heading3" data-testid="text">Heading 3</Text>);
    const element = screen.getByTestId('text');
    expect(element.tagName).toBe('H3');
  });

  it('allows overriding the element with as prop', () => {
    render(<Text as="p" data-testid="text">Paragraph</Text>);
    const element = screen.getByTestId('text');
    expect(element.tagName).toBe('P');
  });

  it('applies className correctly', () => {
    render(<Text className="custom-class" data-testid="text">Text</Text>);
    const element = screen.getByTestId('text');
    expect(element.className).toBe('custom-class');
  });

  it('applies truncate styles when truncate is true', () => {
    render(<Text truncate data-testid="text">Long text that should be truncated</Text>);
    const element = screen.getByTestId('text');
    expect(element).toHaveStyle({ overflow: 'hidden', whiteSpace: 'nowrap' });
  });

  it('applies text alignment when align prop is provided', () => {
    render(<Text align="center" data-testid="text">Centered text</Text>);
    const element = screen.getByTestId('text');
    expect(element).toHaveStyle({ textAlign: 'center' });
  });

  it('passes through additional HTML attributes', () => {
    render(<Text data-testid="text" id="my-text" title="tooltip">Text</Text>);
    const element = screen.getByTestId('text');
    expect(element.id).toBe('my-text');
    expect(element.title).toBe('tooltip');
  });
});
