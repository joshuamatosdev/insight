import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {FormField} from './FormField';
import {Input} from '../input';

describe('FormField', () => {
  it('renders label associated with input', () => {
    render(
      <FormField label="Email">
        <Input type="email" />
      </FormField>
    );

    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  it('marks required fields with aria-required', () => {
    render(
      <FormField label="Email" required>
        <Input type="email" />
      </FormField>
    );

    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('renders error message when error prop is provided', () => {
    render(
      <FormField label="Email" error="Invalid email address">
        <Input type="email" />
      </FormField>
    );

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent('Invalid email address');
  });

  it('renders description text', () => {
    render(
      <FormField label="Email" description="We will never share your email">
        <Input type="email" />
      </FormField>
    );

    expect(screen.getByText('We will never share your email')).toBeInTheDocument();
  });

  it('displays character count', () => {
    render(
      <FormField label="Bio" characterCount={{ current: 50, max: 100 }}>
        <Input type="text" />
      </FormField>
    );

    expect(screen.getByText('50/100')).toBeInTheDocument();
  });

  it('renders hidden label when hideLabel is true', () => {
    render(
      <FormField label="Search" hideLabel>
        <Input type="search" placeholder="Search..." />
      </FormField>
    );

    // Label should still be in the document for screen readers
    const input = screen.getByLabelText('Search');
    expect(input).toBeInTheDocument();
  });
});
