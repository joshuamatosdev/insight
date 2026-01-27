import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('should have no accessibility violations with default props', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with primary variant', async () => {
    const { container } = render(<Button variant="primary">Primary Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with secondary variant', async () => {
    const { container } = render(<Button variant="secondary">Secondary Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when disabled', async () => {
    const { container } = render(<Button disabled>Disabled Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with icon', async () => {
    const { container } = render(
      <Button aria-label="Add item">
        <span aria-hidden="true">+</span>
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with loading state', async () => {
    const { container } = render(<Button aria-busy="true">Loading...</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations as a link button', async () => {
    const { container } = render(
      <Button as="a" href="/test">
        Link Button
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
