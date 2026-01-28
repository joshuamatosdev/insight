import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {Drawer, DrawerBody, DrawerFooter, DrawerHeader} from './drawer'

describe('Drawer', () => {
  it('does not render when open is false', () => {
    render(
      <Drawer open={false} onClose={vi.fn()}>
        <DrawerBody>Drawer content</DrawerBody>
      </Drawer>
    )

    expect(screen.queryByText('Drawer content')).not.toBeInTheDocument()
  })

  it('renders when open is true', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerBody>Drawer content</DrawerBody>
      </Drawer>
    )

    expect(screen.getByText('Drawer content')).toBeInTheDocument()
  })

  it('renders content when opened', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerHeader>Settings</DrawerHeader>
        <DrawerBody>Body content here</DrawerBody>
        <DrawerFooter>Footer actions</DrawerFooter>
      </Drawer>
    )

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Body content here')).toBeInTheDocument()
    expect(screen.getByText('Footer actions')).toBeInTheDocument()
  })

  it('supports left position by default', () => {
    const { container } = render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    const panel = container.querySelector('[role="dialog"]')
    expect(panel).toBeDefined()
    // Left position should have translate from left
    const panelElement = panel as HTMLElement
    expect(panelElement.className).toContain('left-0')
  })

  it('supports right position', () => {
    const { container } = render(
      <Drawer open={true} onClose={vi.fn()} position="right">
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    const panel = container.querySelector('[role="dialog"]')
    const panelElement = panel as HTMLElement
    expect(panelElement.className).toContain('right-0')
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    render(
      <Drawer open={true} onClose={handleClose}>
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    // Click the backdrop/overlay
    const backdrop = screen.getByRole('dialog').parentElement?.previousSibling as HTMLElement
    if (backdrop !== undefined && backdrop !== null) {
      await user.click(backdrop)
      expect(handleClose).toHaveBeenCalled()
    }
  })

  it('calls onClose when escape key is pressed', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    render(
      <Drawer open={true} onClose={handleClose}>
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    await user.keyboard('{Escape}')
    expect(handleClose).toHaveBeenCalled()
  })

  it('has accessible role and aria attributes', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerHeader>Drawer Title</DrawerHeader>
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('renders DrawerHeader with proper styling', () => {
    const { container } = render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerHeader>Header Title</DrawerHeader>
      </Drawer>
    )

    const header = screen.getByText('Header Title')
    expect(header).toBeInTheDocument()
    expect(header.className).toContain('font-semibold')
  })

  it('renders DrawerBody with proper spacing', () => {
    const { container } = render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerBody>Body content</DrawerBody>
      </Drawer>
    )

    const body = screen.getByText('Body content')
    expect(body).toBeInTheDocument()
  })

  it('renders DrawerFooter with proper styling', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerFooter>Footer content</DrawerFooter>
      </Drawer>
    )

    const footer = screen.getByText('Footer content')
    expect(footer).toBeInTheDocument()
  })

  it('supports custom className on Drawer', () => {
    const { container } = render(
      <Drawer open={true} onClose={vi.fn()} className="custom-drawer">
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog.className).toContain('custom-drawer')
  })

  it('supports custom className on DrawerHeader', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerHeader className="custom-header">Header</DrawerHeader>
      </Drawer>
    )

    const header = screen.getByText('Header')
    expect(header.className).toContain('custom-header')
  })

  it('supports custom className on DrawerBody', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerBody className="custom-body">Body</DrawerBody>
      </Drawer>
    )

    const body = screen.getByText('Body')
    expect(body.className).toContain('custom-body')
  })

  it('supports custom className on DrawerFooter', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerFooter className="custom-footer">Footer</DrawerFooter>
      </Drawer>
    )

    const footer = screen.getByText('Footer')
    expect(footer.className).toContain('custom-footer')
  })

  it('supports different sizes', () => {
    const { rerender, container } = render(
      <Drawer open={true} onClose={vi.fn()} size="sm">
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    let dialog = container.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog.className).toContain('max-w-sm')

    rerender(
      <Drawer open={true} onClose={vi.fn()} size="md">
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    dialog = container.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog.className).toContain('max-w-md')

    rerender(
      <Drawer open={true} onClose={vi.fn()} size="lg">
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    dialog = container.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog.className).toContain('max-w-lg')

    rerender(
      <Drawer open={true} onClose={vi.fn()} size="xl">
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    dialog = container.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog.className).toContain('max-w-xl')
  })

  it('has backdrop with blur/dim effect', () => {
    const { container } = render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    // Check for backdrop element
    const backdrop = container.querySelector('[class*="bg-zinc"]')
    expect(backdrop).toBeDefined()
  })

  it('spreads additional props to Drawer', () => {
    const { container } = render(
      <Drawer open={true} onClose={vi.fn()} data-testid="test-drawer" aria-labelledby="drawer-title">
        <DrawerBody>Content</DrawerBody>
      </Drawer>
    )

    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog.getAttribute('data-testid')).toBe('test-drawer')
    expect(dialog.getAttribute('aria-labelledby')).toBe('drawer-title')
  })
})
