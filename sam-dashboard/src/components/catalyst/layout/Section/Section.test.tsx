import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Section} from './Section';
import {SectionHeader} from './SectionHeader';

describe('Section', () => {
  it('renders children correctly', () => {
    render(<Section>Content</Section>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as a section element', () => {
    render(<Section data-testid="section">Content</Section>);
    const element = screen.getByTestId('section');
    expect(element.tagName).toBe('SECTION');
  });

  it('applies id attribute', () => {
    render(<Section id="my-section" data-testid="section">Content</Section>);
    const element = screen.getByTestId('section');
    expect(element.id).toBe('my-section');
  });

  it('applies scroll margin top for anchor navigation', () => {
    render(<Section data-testid="section">Content</Section>);
    const element = screen.getByTestId('section');
    expect(element).toHaveStyle({ scrollMarginTop: '20px' });
  });

  it('applies className correctly', () => {
    render(<Section className="custom-section" data-testid="section">Content</Section>);
    const element = screen.getByTestId('section');
    expect(element.className).toBe('custom-section');
  });

  it('passes through additional HTML attributes', () => {
    render(<Section data-testid="section" title="tooltip">Content</Section>);
    const element = screen.getByTestId('section');
    expect(element.title).toBe('tooltip');
  });
});

describe('SectionHeader', () => {
  it('renders title correctly', () => {
    render(<SectionHeader title="My Section" />);
    expect(screen.getByText('My Section')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<SectionHeader title="My Section" data-testid="header" />);
    const element = screen.getByTestId('header');
    expect(element.tagName).toBe('DIV');
  });

  it('renders icon when provided', () => {
    render(
      <SectionHeader
        title="My Section"
        icon={<span data-testid="icon">📌</span>}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <SectionHeader
        title="My Section"
        actions={<button data-testid="action">Action</button>}
      />
    );
    expect(screen.getByTestId('action')).toBeInTheDocument();
  });

  it('applies padding and border styles', () => {
    render(<SectionHeader title="My Section" data-testid="header" />);
    const element = screen.getByTestId('header');
    expect(element).toHaveStyle({ padding: 'var(--spacing-4) 0' });
  });

  it('passes through additional HTML attributes', () => {
    render(<SectionHeader title="My Section" data-testid="header" id="my-header" />);
    const element = screen.getByTestId('header');
    expect(element.id).toBe('my-header');
  });
});
