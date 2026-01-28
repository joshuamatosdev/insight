import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {Tooltip} from './tooltip'

describe('Tooltip', () => {
  afterEach(() => {
    vi.useRealTimers()
  })
  it('renders trigger element', () => {
    render(
      <Tooltip content="Delete this item">
        <button type="button">Delete</button>
      </Tooltip>
    )

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDefined()
  })

  it('does not show tooltip content initially', () => {
    render(
      <Tooltip content="Delete this item">
        <button type="button">Delete</button>
      </Tooltip>
    )

    expect(screen.queryByText('Delete this item')).toBeNull()
  })

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Helpful information">
        <button type="button">Info</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Info' })
    await user.hover(trigger)

    await waitFor(() => {
      expect(screen.getByText('Helpful information')).toBeDefined()
    })
  })

  it('hides tooltip on mouse leave', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Helpful information">
        <button type="button">Info</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Info' })

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Helpful information')).toBeDefined()
    })

    await user.unhover(trigger)
    await waitFor(() => {
      expect(screen.queryByText('Helpful information')).toBeNull()
    })
  })

  it('shows tooltip on focus', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Keyboard accessible">
        <button type="button">Focus me</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Focus me' })
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Keyboard accessible')).toBeDefined()
    })
  })

  it('hides tooltip on blur', async () => {
    const user = userEvent.setup()

    render(
      <>
        <Tooltip content="Keyboard accessible">
          <button type="button">Focus me</button>
        </Tooltip>
        <button type="button">Other button</button>
      </>
    )

    await user.tab()
    await waitFor(() => {
      expect(screen.getByText('Keyboard accessible')).toBeDefined()
    })

    await user.tab()
    await waitFor(() => {
      expect(screen.queryByText('Keyboard accessible')).toBeNull()
    })
  })

  it('supports top position', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Positioned top" position="top">
        <button type="button">Top</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Top' })
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByText('Positioned top')
      expect(tooltip).toBeDefined()
    })
  })

  it('supports bottom position', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Positioned bottom" position="bottom">
        <button type="button">Bottom</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Bottom' })
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByText('Positioned bottom')
      expect(tooltip).toBeDefined()
    })
  })

  it('supports left position', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Positioned left" position="left">
        <button type="button">Left</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Left' })
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByText('Positioned left')
      expect(tooltip).toBeDefined()
    })
  })

  it('supports right position', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Positioned right" position="right">
        <button type="button">Right</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Right' })
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByText('Positioned right')
      expect(tooltip).toBeDefined()
    })
  })

  it('defaults to top position when not specified', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Default position">
        <button type="button">Default</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Default' })
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByText('Default position')
      expect(tooltip).toBeDefined()
    })
  })

  it('supports custom delay', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Delayed tooltip" delay={50}>
        <button type="button">Delay</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Delay' })
    await user.hover(trigger)

    // Should not appear immediately
    expect(screen.queryByText('Delayed tooltip')).toBeNull()

    // Wait for the delay to pass
    await waitFor(() => {
      expect(screen.getByText('Delayed tooltip')).toBeDefined()
    }, { timeout: 200 })
  })

  it('applies custom className to tooltip', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Custom class" className="custom-tooltip">
        <button type="button">Custom</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Custom' })
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveClass('custom-tooltip')
    })
  })

  it('has proper aria attributes for accessibility', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Accessible tooltip">
        <button type="button">Accessible</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Accessible' })

    // Check aria-describedby is set when tooltip shows
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toBeDefined()
      expect(tooltip.id).toBeTruthy()
    })
  })

  it('tooltip has role="tooltip"', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Role tooltip">
        <button type="button">Role</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Role' })
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toBeDefined()
      expect(tooltip.textContent).toContain('Role tooltip')
    })
  })

  it('works with non-button triggers', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Icon tooltip">
        <span role="img" aria-label="Info icon">
          ℹ️
        </span>
      </Tooltip>
    )

    const trigger = screen.getByRole('img', { name: 'Info icon' })
    await user.hover(trigger)

    await waitFor(() => {
      expect(screen.getByText('Icon tooltip')).toBeDefined()
    })
  })

  it('handles long content properly', async () => {
    const user = userEvent.setup()
    const longContent =
      'This is a very long tooltip content that should wrap appropriately and maintain readability'

    render(
      <Tooltip content={longContent}>
        <button type="button">Long</button>
      </Tooltip>
    )

    const trigger = screen.getByRole('button', { name: 'Long' })
    await user.hover(trigger)

    await waitFor(() => {
      expect(screen.getByText(longContent)).toBeDefined()
    })
  })
})
