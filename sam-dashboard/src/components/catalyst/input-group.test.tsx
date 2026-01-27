import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InputGroup, InputAddon, InputGroupInput } from './input-group'

describe('InputGroup', () => {
  it('renders input with leading text addon', () => {
    render(
      <InputGroup>
        <InputAddon>$</InputAddon>
        <InputGroupInput placeholder="0.00" />
      </InputGroup>
    )

    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
  })

  it('renders input with trailing text addon', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Enter amount" />
        <InputAddon>USD</InputAddon>
      </InputGroup>
    )

    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument()
  })

  it('renders input with both leading and trailing addons', () => {
    render(
      <InputGroup>
        <InputAddon>$</InputAddon>
        <InputGroupInput placeholder="0.00" />
        <InputAddon>USD</InputAddon>
      </InputGroup>
    )

    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
  })

  it('renders input with select dropdown as addon', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="0.00" />
        <InputAddon>
          <select>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </InputAddon>
      </InputGroup>
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'USD' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'EUR' })).toBeInTheDocument()
  })

  it('renders input with icon as addon', () => {
    const TestIcon = () => (
      <svg data-testid="test-icon" width="16" height="16">
        <circle cx="8" cy="8" r="8" />
      </svg>
    )

    render(
      <InputGroup>
        <InputAddon>
          <TestIcon />
        </InputAddon>
        <InputGroupInput placeholder="Search" />
      </InputGroup>
    )

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
  })

  it('applies custom className to InputGroup', () => {
    const { container } = render(
      <InputGroup className="custom-class">
        <InputAddon>$</InputAddon>
        <InputGroupInput placeholder="0.00" />
      </InputGroup>
    )

    const group = container.firstChild as HTMLElement
    expect(group.className).toContain('custom-class')
  })

  it('applies custom className to InputAddon', () => {
    render(
      <InputGroup>
        <InputAddon className="custom-addon">$</InputAddon>
        <InputGroupInput placeholder="0.00" />
      </InputGroup>
    )

    const addon = screen.getByText('$')
    expect(addon.className).toContain('custom-addon')
  })

  it('applies custom className to InputGroupInput', () => {
    render(
      <InputGroup>
        <InputAddon>$</InputAddon>
        <InputGroupInput className="custom-input" placeholder="0.00" />
      </InputGroup>
    )

    const input = screen.getByPlaceholderText('0.00')
    expect(input.className).toContain('custom-input')
  })

  it('renders with proper focus styling structure', () => {
    const { container } = render(
      <InputGroup>
        <InputAddon>$</InputAddon>
        <InputGroupInput placeholder="0.00" />
      </InputGroup>
    )

    const group = container.firstChild as HTMLElement
    // Should have relative positioning for focus ring
    expect(group.className).toContain('relative')
  })

  it('forwards ref to InputGroupInput', () => {
    const ref = { current: null }
    render(
      <InputGroup>
        <InputAddon>$</InputAddon>
        <InputGroupInput ref={ref} placeholder="0.00" />
      </InputGroup>
    )

    expect(ref.current).not.toBeNull()
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('spreads additional props to InputGroupInput', () => {
    render(
      <InputGroup>
        <InputAddon>$</InputAddon>
        <InputGroupInput
          placeholder="0.00"
          data-testid="test-input"
          aria-label="Price input"
          type="number"
        />
      </InputGroup>
    )

    const input = screen.getByPlaceholderText('0.00')
    expect(input.getAttribute('data-testid')).toBe('test-input')
    expect(input.getAttribute('aria-label')).toBe('Price input')
    expect(input.getAttribute('type')).toBe('number')
  })

  it('renders with multiple text addons', () => {
    render(
      <InputGroup>
        <InputAddon>https://</InputAddon>
        <InputGroupInput placeholder="www.example.com" />
        <InputAddon>.com</InputAddon>
      </InputGroup>
    )

    expect(screen.getByText('https://')).toBeInTheDocument()
    expect(screen.getByText('.com')).toBeInTheDocument()
  })

  it('renders with disabled state on input', () => {
    render(
      <InputGroup>
        <InputAddon>$</InputAddon>
        <InputGroupInput placeholder="0.00" disabled />
      </InputGroup>
    )

    const input = screen.getByPlaceholderText('0.00')
    expect(input).toBeDisabled()
  })

  it('renders with invalid state on input', () => {
    render(
      <InputGroup>
        <InputAddon>$</InputAddon>
        <InputGroupInput placeholder="0.00" aria-invalid="true" />
      </InputGroup>
    )

    const input = screen.getByPlaceholderText('0.00')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })
})
