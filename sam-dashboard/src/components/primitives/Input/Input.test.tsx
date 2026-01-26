import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input data-testid="input" />);
    const element = screen.getByTestId('input');
    expect(element.tagName).toBe('INPUT');
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} data-testid="input" />);

    await user.type(screen.getByTestId('input'), 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays placeholder text', () => {
    render(<Input placeholder="Enter text" data-testid="input" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('applies className correctly', () => {
    render(<Input className="custom-input" data-testid="input" />);
    expect(screen.getByTestId('input').className).toBe('custom-input');
  });

  it('renders left icon when provided', () => {
    render(
      <Input
        leftIcon={<span data-testid="left-icon">🔍</span>}
        data-testid="input"
      />
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders right icon when provided', () => {
    render(
      <Input
        rightIcon={<span data-testid="right-icon">✕</span>}
        data-testid="input"
      />
    );
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('wraps input in div when icons are present', () => {
    const { container } = render(
      <Input
        leftIcon={<span>🔍</span>}
        data-testid="input"
      />
    );
    const wrapper = container.firstChild;
    expect(wrapper?.nodeName).toBe('DIV');
  });

  it('renders input directly when no icons', () => {
    const { container } = render(<Input data-testid="input" />);
    const firstChild = container.firstChild;
    expect(firstChild?.nodeName).toBe('INPUT');
  });

  it('passes through type attribute', () => {
    render(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input').getAttribute('type')).toBe('password');
  });

  it('passes through disabled attribute', () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('passes through id attribute', () => {
    render(<Input id="email-input" data-testid="input" />);
    expect(screen.getByTestId('input').id).toBe('email-input');
  });

  it('displays name correctly', () => {
    expect(Input.displayName).toBe('Input');
  });
});
