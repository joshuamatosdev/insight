import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  PageHeading,
  PageHeadingTitle,
  PageHeadingDescription,
  PageHeadingActions,
  PageHeadingMeta,
  PageHeadingMetaItem,
  PageHeadingSection,
} from './page-heading'

/**
 * BEHAVIORAL TESTS for PageHeading component
 *
 * These tests verify the PUBLIC BEHAVIOR and OUTPUT of the components,
 * not implementation details. Tests should remain stable through refactoring.
 */

describe('PageHeading', () => {
  it('renders a container with children', () => {
    render(
      <PageHeading>
        <div data-testid="child-content">Content</div>
      </PageHeading>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('applies custom className alongside default styles', () => {
    const { container } = render(
      <PageHeading className="custom-class">Content</PageHeading>
    )

    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('custom-class')
    // Verify flex layout is present (core behavior)
    expect(element).toHaveClass('lg:flex')
  })

  it('accepts additional HTML attributes', () => {
    render(
      <PageHeading data-testid="page-heading" role="region">
        Content
      </PageHeading>
    )

    const element = screen.getByTestId('page-heading')
    expect(element).toHaveAttribute('role', 'region')
  })
})

describe('PageHeadingTitle', () => {
  it('renders title text as an h1 element', () => {
    render(<PageHeadingTitle>Contract Details</PageHeadingTitle>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Contract Details')
  })

  it('applies custom className alongside default styles', () => {
    render(<PageHeadingTitle className="custom-title">Title</PageHeadingTitle>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('custom-title')
    // Verify core font styles are present
    expect(heading).toHaveClass('font-bold')
  })

  it('accepts additional HTML attributes', () => {
    render(
      <PageHeadingTitle id="main-title">Title</PageHeadingTitle>
    )

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveAttribute('id', 'main-title')
  })
})

describe('PageHeadingDescription', () => {
  it('renders description text', () => {
    render(
      <PageHeadingDescription>
        View and manage contract information
      </PageHeadingDescription>
    )

    expect(
      screen.getByText('View and manage contract information')
    ).toBeInTheDocument()
  })

  it('applies custom className alongside default styles', () => {
    const { container } = render(
      <PageHeadingDescription className="custom-desc">
        Description
      </PageHeadingDescription>
    )

    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('custom-desc')
    // Verify core text styles
    expect(element).toHaveClass('text-sm')
  })

  it('accepts additional HTML attributes', () => {
    render(
      <PageHeadingDescription data-testid="description">
        Description text
      </PageHeadingDescription>
    )

    expect(screen.getByTestId('description')).toBeInTheDocument()
  })
})

describe('PageHeadingActions', () => {
  it('renders action buttons as children', () => {
    render(
      <PageHeadingActions>
        <button>Edit</button>
        <button>Save</button>
      </PageHeadingActions>
    )

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('applies custom className alongside default styles', () => {
    const { container } = render(
      <PageHeadingActions className="custom-actions">
        <button>Action</button>
      </PageHeadingActions>
    )

    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('custom-actions')
    // Verify flex layout is present
    expect(element).toHaveClass('flex')
  })

  it('accepts additional HTML attributes', () => {
    render(
      <PageHeadingActions data-testid="actions">
        <button>Action</button>
      </PageHeadingActions>
    )

    expect(screen.getByTestId('actions')).toBeInTheDocument()
  })
})

describe('PageHeadingMeta', () => {
  it('renders metadata items as children', () => {
    render(
      <PageHeadingMeta>
        <span>Status: Active</span>
        <span>Due: Jan 30</span>
      </PageHeadingMeta>
    )

    expect(screen.getByText('Status: Active')).toBeInTheDocument()
    expect(screen.getByText('Due: Jan 30')).toBeInTheDocument()
  })

  it('applies custom className alongside default styles', () => {
    const { container } = render(
      <PageHeadingMeta className="custom-meta">
        <span>Meta</span>
      </PageHeadingMeta>
    )

    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('custom-meta')
    // Verify flex layout is present
    expect(element).toHaveClass('flex')
  })

  it('accepts additional HTML attributes', () => {
    render(
      <PageHeadingMeta data-testid="meta">
        <span>Meta</span>
      </PageHeadingMeta>
    )

    expect(screen.getByTestId('meta')).toBeInTheDocument()
  })
})

describe('PageHeadingMetaItem', () => {
  it('renders metadata text without icon', () => {
    render(<PageHeadingMetaItem>Full-time</PageHeadingMetaItem>)

    expect(screen.getByText('Full-time')).toBeInTheDocument()
  })

  it('renders metadata text with icon', () => {
    const MockIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
      <svg data-testid="mock-icon" {...props} />
    )

    render(
      <PageHeadingMetaItem icon={MockIcon}>Remote</PageHeadingMetaItem>
    )

    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })

  it('hides icon from accessibility tree', () => {
    const MockIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
      <svg {...props} />
    )

    render(
      <PageHeadingMetaItem icon={MockIcon}>Remote</PageHeadingMetaItem>
    )

    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies custom className alongside default styles', () => {
    const { container } = render(
      <PageHeadingMetaItem className="custom-item">
        Item
      </PageHeadingMetaItem>
    )

    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('custom-item')
    // Verify flex layout for icon + text
    expect(element).toHaveClass('flex')
    expect(element).toHaveClass('items-center')
  })

  it('accepts additional HTML attributes', () => {
    render(
      <PageHeadingMetaItem data-testid="meta-item">
        Item
      </PageHeadingMetaItem>
    )

    expect(screen.getByTestId('meta-item')).toBeInTheDocument()
  })
})

describe('PageHeadingSection', () => {
  it('renders section wrapper with children', () => {
    render(
      <PageHeadingSection>
        <span data-testid="section-content">Section content</span>
      </PageHeadingSection>
    )

    expect(screen.getByTestId('section-content')).toBeInTheDocument()
  })

  it('applies custom className alongside default styles', () => {
    const { container } = render(
      <PageHeadingSection className="custom-section">
        Content
      </PageHeadingSection>
    )

    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('custom-section')
    // Verify flex-1 for layout
    expect(element).toHaveClass('flex-1')
  })

  it('accepts additional HTML attributes', () => {
    render(
      <PageHeadingSection data-testid="section">
        Content
      </PageHeadingSection>
    )

    expect(screen.getByTestId('section')).toBeInTheDocument()
  })
})

describe('PageHeading - Integration', () => {
  it('renders complete page heading with all sections', () => {
    const MockIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
      <svg data-testid="test-icon" {...props} />
    )

    render(
      <PageHeading>
        <PageHeadingSection>
          <PageHeadingTitle>Contract ABC-123</PageHeadingTitle>
          <PageHeadingDescription>
            Federal contract for IT services
          </PageHeadingDescription>
          <PageHeadingMeta>
            <PageHeadingMetaItem icon={MockIcon}>
              Active
            </PageHeadingMetaItem>
            <PageHeadingMetaItem icon={MockIcon}>
              $500K
            </PageHeadingMetaItem>
          </PageHeadingMeta>
        </PageHeadingSection>
        <PageHeadingActions>
          <button>Edit</button>
          <button>Export</button>
        </PageHeadingActions>
      </PageHeading>
    )

    // Verify all content is present
    expect(
      screen.getByRole('heading', { level: 1, name: 'Contract ABC-123' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Federal contract for IT services')
    ).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('$500K')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()

    // Verify icons are present
    const icons = screen.getAllByTestId('test-icon')
    expect(icons.length).toBe(2)
  })
})
