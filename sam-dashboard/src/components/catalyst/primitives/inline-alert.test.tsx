import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {InlineAlert, InlineAlertActions, InlineAlertDescription, InlineAlertTitle,} from './inline-alert'
import {CheckCircleIcon} from '@heroicons/react/20/solid'

describe('InlineAlert', () => {
  it('renders alert with title and description', () => {
    render(
      <InlineAlert color="success">
        <InlineAlertTitle>Success</InlineAlertTitle>
        <InlineAlertDescription>Operation completed successfully.</InlineAlertDescription>
      </InlineAlert>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Operation completed successfully.')).toBeInTheDocument()
  })

  it('renders with icon when provided', () => {
    render(
      <InlineAlert color="success" icon={CheckCircleIcon}>
        <InlineAlertTitle>Success</InlineAlertTitle>
      </InlineAlert>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()

    // Icon should be rendered
    const icon = alert.querySelector('svg')
    expect(icon).not.toBeNull()
  })

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()

    render(
      <InlineAlert color="info" onDismiss={onDismiss}>
        <InlineAlertTitle>Info</InlineAlertTitle>
      </InlineAlert>
    )

    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    await user.click(dismissButton)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(
      <InlineAlert color="info">
        <InlineAlertTitle>Info</InlineAlertTitle>
      </InlineAlert>
    )

    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
  })

  it('renders actions when provided', () => {
    render(
      <InlineAlert color="warning">
        <InlineAlertTitle>Warning</InlineAlertTitle>
        <InlineAlertActions>
          <button type="button">View Details</button>
          <button type="button">Dismiss</button>
        </InlineAlertActions>
      </InlineAlert>
    )

    expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('supports all color variants', () => {
    const colors: Array<'info' | 'success' | 'warning' | 'error'> = ['info', 'success', 'warning', 'error']

    colors.forEach((color) => {
      const { unmount } = render(
        <InlineAlert color={color} data-testid={`alert-${color}`}>
          <InlineAlertTitle>{color} alert</InlineAlertTitle>
        </InlineAlert>
      )

      expect(screen.getByTestId(`alert-${color}`)).toBeInTheDocument()
      unmount()
    })
  })

  it('applies custom className to root element', () => {
    render(
      <InlineAlert color="info" className="custom-class">
        <InlineAlertTitle>Info</InlineAlertTitle>
      </InlineAlert>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-class')
  })

  it('throws error when compound components are used outside InlineAlert context', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = vi.fn()

    expect(() => {
      render(<InlineAlertTitle>Orphan Title</InlineAlertTitle>)
    }).toThrow('InlineAlert compound components must be used within InlineAlert')

    console.error = originalError
  })

  it('renders with both icon and dismiss button', () => {
    const onDismiss = vi.fn()

    render(
      <InlineAlert color="success" icon={CheckCircleIcon} onDismiss={onDismiss}>
        <InlineAlertTitle>Success</InlineAlertTitle>
        <InlineAlertDescription>Operation completed.</InlineAlertDescription>
      </InlineAlert>
    )

    const alert = screen.getByRole('alert')

    // Both icon and dismiss button should be present
    expect(alert.querySelector('svg')).not.toBeNull()
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
  })
})
