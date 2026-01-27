import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Input } from './Input';

expect.extend(toHaveNoViolations);

describe('Input accessibility', () => {
  it('should have no accessibility violations with label', async () => {
    const { container } = render(
      <div>
        <label htmlFor="test-input">Test Label</label>
        <Input id="test-input" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with aria-label', async () => {
    const { container } = render(<Input aria-label="Search" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with placeholder', async () => {
    const { container } = render(
      <div>
        <label htmlFor="search-input">Search</label>
        <Input id="search-input" placeholder="Enter search term..." />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when disabled', async () => {
    const { container } = render(
      <div>
        <label htmlFor="disabled-input">Disabled Field</label>
        <Input id="disabled-input" disabled />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with error state', async () => {
    const { container } = render(
      <div>
        <label htmlFor="error-input">Email</label>
        <Input
          id="error-input"
          aria-invalid="true"
          aria-describedby="error-message"
        />
        <span id="error-message" role="alert">
          Invalid email format
        </span>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with required attribute', async () => {
    const { container } = render(
      <div>
        <label htmlFor="required-input">
          Required Field <span aria-hidden="true">*</span>
        </label>
        <Input id="required-input" required aria-required="true" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with helper text', async () => {
    const { container } = render(
      <div>
        <label htmlFor="helper-input">Password</label>
        <Input
          id="helper-input"
          type="password"
          aria-describedby="helper-text"
        />
        <span id="helper-text">Must be at least 8 characters</span>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
