import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {Progress, ProgressWithLabel} from './progress'

describe('Progress', () => {
  it('renders a progress bar with correct ARIA attributes', () => {
    const { container } = render(<Progress value={50} max={100} />)
    const progressBar = container.querySelector('[role="progressbar"]')

    expect(progressBar).not.toBe(null)
    if (progressBar !== null) {
      expect(progressBar.getAttribute('aria-valuenow')).toBe('50')
      expect(progressBar.getAttribute('aria-valuemin')).toBe('0')
      expect(progressBar.getAttribute('aria-valuemax')).toBe('100')
    }
  })

  it('calculates percentage correctly', () => {
    const { container } = render(<Progress value={25} max={100} />)
    const progressBar = container.querySelector('[role="progressbar"]')
    const fill = progressBar?.querySelector('div')

    expect(fill).not.toBe(null)
    if (fill !== null && fill !== undefined) {
      expect(fill.style.width).toBe('25%')
    }
  })

  it('handles indeterminate state when value is undefined', () => {
    const { container } = render(<Progress />)
    const progressBar = container.querySelector('[role="progressbar"]')
    const fill = progressBar?.querySelector('div')

    expect(progressBar?.getAttribute('aria-valuenow')).toBe(null)
    if (fill !== null && fill !== undefined) {
      expect(fill.style.width).toBe('100%')
    }
  })

  it('clamps value to 0-100 range', () => {
    const { container: containerNegative } = render(<Progress value={-10} max={100} />)
    const progressBarNegative = containerNegative.querySelector('[role="progressbar"]')
    const fillNegative = progressBarNegative?.querySelector('div')

    if (fillNegative !== null && fillNegative !== undefined) {
      expect(fillNegative.style.width).toBe('0%')
    }

    const { container: containerOver } = render(<Progress value={150} max={100} />)
    const progressBarOver = containerOver.querySelector('[role="progressbar"]')
    const fillOver = progressBarOver?.querySelector('div')

    if (fillOver !== null && fillOver !== undefined) {
      expect(fillOver.style.width).toBe('100%')
    }
  })

  it('applies color variants correctly', () => {
    const { container: blueContainer } = render(<Progress value={50} color="blue" />)
    const blueFill = blueContainer.querySelector('[role="progressbar"] div')
    expect(blueFill?.className).toContain('bg-blue-600')

    const { container: greenContainer } = render(<Progress value={50} color="green" />)
    const greenFill = greenContainer.querySelector('[role="progressbar"] div')
    expect(greenFill?.className).toContain('bg-green-600')
  })

  it('applies size variants correctly', () => {
    const { container: xsContainer } = render(<Progress value={50} size="xs" />)
    const xsProgressBar = xsContainer.querySelector('[role="progressbar"]')
    expect(xsProgressBar?.className).toContain('h-1')

    const { container: xlContainer } = render(<Progress value={50} size="xl" />)
    const xlProgressBar = xlContainer.querySelector('[role="progressbar"]')
    expect(xlProgressBar?.className).toContain('h-3')
  })
})

describe('ProgressWithLabel', () => {
  it('renders label when provided', () => {
    render(<ProgressWithLabel value={50} label="Loading..." />)
    expect(screen.getByText('Loading...')).not.toBe(null)
  })

  it('shows percentage when showValue is true', () => {
    render(<ProgressWithLabel value={75} max={100} showValue={true} />)
    expect(screen.getByText('75%')).not.toBe(null)
  })

  it('does not show percentage when showValue is false', () => {
    render(<ProgressWithLabel value={75} max={100} showValue={false} />)
    expect(screen.queryByText('75%')).toBe(null)
  })

  it('does not show percentage for indeterminate state', () => {
    render(<ProgressWithLabel showValue={true} />)
    expect(screen.queryByText('%')).toBe(null)
  })

  it('renders both label and percentage together', () => {
    render(<ProgressWithLabel value={33} label="Processing" showValue={true} />)
    expect(screen.getByText('Processing')).not.toBe(null)
    expect(screen.getByText('33%')).not.toBe(null)
  })
})
