import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  const testPaths = ['M8 0L16 8L8 16L0 8Z'];

  it('renders an svg element', () => {
    render(<Icon paths={testPaths} data-testid="icon" />);
    const element = screen.getByTestId('icon');
    expect(element.tagName).toBe('svg');
  });

  it('renders paths correctly', () => {
    render(<Icon paths={testPaths} data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    const path = svg.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute('d')).toBe(testPaths[0]);
  });

  it('renders multiple paths', () => {
    const multiplePaths = ['M0 0H8V8H0Z', 'M8 8H16V16H8Z'];
    render(<Icon paths={multiplePaths} data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    const paths = svg.querySelectorAll('path');
    expect(paths.length).toBe(2);
  });

  it('has aria-hidden attribute for accessibility', () => {
    render(<Icon paths={testPaths} data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses default viewBox when not provided', () => {
    render(<Icon paths={testPaths} data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    expect(svg.getAttribute('viewBox')).toBe('0 0 16 16');
  });

  it('uses custom viewBox when provided', () => {
    render(<Icon paths={testPaths} viewBox="0 0 24 24" data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
  });

  it('applies className correctly', () => {
    render(<Icon paths={testPaths} className="custom-icon" data-testid="icon" />);
    const svg = screen.getByTestId('icon') as unknown as SVGSVGElement;
    expect(svg.className.baseVal).toBe('custom-icon');
  });

  it('uses default size of md (20px)', () => {
    render(<Icon paths={testPaths} data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    expect(svg).toHaveStyle({ width: '20px', height: '20px' });
  });

  it('applies xs size correctly (12px)', () => {
    render(<Icon paths={testPaths} size="xs" data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    expect(svg).toHaveStyle({ width: '12px', height: '12px' });
  });

  it('applies lg size correctly (24px)', () => {
    render(<Icon paths={testPaths} size="lg" data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    expect(svg).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('applies xl size correctly (32px)', () => {
    render(<Icon paths={testPaths} size="xl" data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    expect(svg).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('merges custom styles', () => {
    render(<Icon paths={testPaths} style={{ opacity: 0.5 }} data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    expect(svg).toHaveStyle({ opacity: '0.5' });
  });

  it('applies fillRule to paths', () => {
    render(<Icon paths={testPaths} fillRule="evenodd" data-testid="icon" />);
    const svg = screen.getByTestId('icon');
    const path = svg.querySelector('path');
    expect(path?.getAttribute('fill-rule')).toBe('evenodd');
  });
});
