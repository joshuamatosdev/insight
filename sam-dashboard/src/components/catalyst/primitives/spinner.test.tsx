import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './spinner'

describe('Spinner', () => {
  it('renders spinner with default size', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('size-5')
  })

  it('renders spinner with size xs', () => {
    render(<Spinner size="xs" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('size-3')
  })

  it('renders spinner with size sm', () => {
    render(<Spinner size="sm" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('size-4')
  })

  it('renders spinner with size md', () => {
    render(<Spinner size="md" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('size-5')
  })

  it('renders spinner with size lg', () => {
    render(<Spinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('size-6')
  })

  it('renders spinner with size xl', () => {
    render(<Spinner size="xl" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('size-8')
  })

  it('renders spinner with primary color by default', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('text-indigo-600')
  })

  it('renders spinner with white color', () => {
    render(<Spinner color="white" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('text-white')
  })

  it('renders spinner with current color', () => {
    render(<Spinner color="current" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('text-current')
  })

  it('renders spinner with muted color', () => {
    render(<Spinner color="muted" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('text-zinc-400')
  })

  it('has sr-only loading text for accessibility', () => {
    render(<Spinner />)
    expect(screen.getByText('Loading...')).toHaveClass('sr-only')
  })

  it('uses custom label for accessibility', () => {
    render(<Spinner label="Processing data" />)
    expect(screen.getByText('Processing data')).toHaveClass('sr-only')
  })

  it('applies custom className', () => {
    render(<Spinner className="custom-class" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-class')
  })

  it('has animation class', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('animate-spin')
  })
})
