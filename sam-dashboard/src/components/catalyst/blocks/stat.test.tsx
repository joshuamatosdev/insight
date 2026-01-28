import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stat, StatChange, StatGroup, StatLabel, StatValue } from './stat'

describe('Stat Components', () => {
  describe('StatGroup', () => {
    it('should render a container with dl element inside', () => {
      render(
        <StatGroup>
          <Stat>
            <StatLabel>Test Label</StatLabel>
            <StatValue>123</StatValue>
          </Stat>
        </StatGroup>
      )

      const list = screen.getByRole('list', { hidden: true })
      expect(list).toBeInTheDocument()
      expect(list.tagName).toBe('DL')
    })

    it('should apply column configuration for responsive grid', () => {
      const { container } = render(
        <StatGroup columns={4}>
          <Stat>
            <StatLabel>Revenue</StatLabel>
            <StatValue>$1,000</StatValue>
          </Stat>
        </StatGroup>
      )

      const dl = container.querySelector('dl')
      expect(dl).toHaveClass('sm:grid-cols-2')
      expect(dl).toHaveClass('lg:grid-cols-4')
    })

    it('should have border styling on wrapper div', () => {
      const { container } = render(
        <StatGroup>
          <Stat>
            <StatLabel>Test</StatLabel>
            <StatValue>100</StatValue>
          </Stat>
        </StatGroup>
      )

      const wrapper = container.querySelector('div')
      expect(wrapper).toHaveClass('border-b')
      expect(wrapper).toHaveClass('lg:border-t')
    })

    it('should merge custom className with default classes', () => {
      const { container } = render(<StatGroup className="custom-class">Content</StatGroup>)

      const wrapper = container.querySelector('div')
      expect(wrapper).toHaveClass('custom-class')
      expect(wrapper).toHaveClass('border-b')
    })
  })

  describe('Stat', () => {
    it('should render a div container for individual stat', () => {
      const { container } = render(
        <Stat>
          <StatLabel>Label</StatLabel>
          <StatValue>Value</StatValue>
        </Stat>
      )

      const div = container.firstChild
      expect(div).toBeInTheDocument()
      expect(div).toHaveClass('flex')
      expect(div).toHaveClass('flex-wrap')
    })

    it('should have border-t styling', () => {
      const { container } = render(
        <Stat>
          <StatLabel>Label</StatLabel>
          <StatValue>Value</StatValue>
        </Stat>
      )

      const div = container.firstChild
      expect(div).toHaveClass('border-t')
      expect(div).toHaveClass('lg:border-t-0')
    })

    it('should accept custom className', () => {
      const { container } = render(<Stat className="custom-stat">Content</Stat>)

      const div = container.firstChild
      expect(div).toHaveClass('custom-stat')
    })
  })

  describe('StatLabel', () => {
    it('should render as dt element', () => {
      render(<StatLabel>Total Revenue</StatLabel>)

      const label = screen.getByText('Total Revenue')
      expect(label).toBeInTheDocument()
      expect(label.tagName).toBe('DT')
    })

    it('should have correct styling classes', () => {
      render(<StatLabel>Test</StatLabel>)

      const label = screen.getByText('Test')
      expect(label).toHaveClass('text-sm/6')
      expect(label).toHaveClass('font-medium')
      expect(label).toHaveClass('text-zinc-500')
    })
  })

  describe('StatValue', () => {
    it('should render as dd element', () => {
      render(<StatValue>$1,234.56</StatValue>)

      const value = screen.getByText('$1,234.56')
      expect(value).toBeInTheDocument()
      expect(value.tagName).toBe('DD')
    })

    it('should have large text styling', () => {
      render(<StatValue>999</StatValue>)

      const value = screen.getByText('999')
      expect(value).toHaveClass('text-3xl/10')
      expect(value).toHaveClass('font-medium')
      expect(value).toHaveClass('tracking-tight')
    })

    it('should have correct text color classes', () => {
      render(<StatValue>999</StatValue>)

      const value = screen.getByText('999')
      expect(value).toHaveClass('text-zinc-900')
      expect(value).toHaveClass('dark:text-white')
    })
  })

  describe('StatChange', () => {
    it('should render change value with neutral trend by default', () => {
      render(<StatChange>+5%</StatChange>)

      const change = screen.getByText('+5%')
      expect(change).toBeInTheDocument()
      expect(change.tagName).toBe('DD')
    })

    it('should show up arrow icon for positive trend', () => {
      const { container } = render(<StatChange trend="up">+12%</StatChange>)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')

      const srText = screen.getByText(/increased by/i)
      expect(srText).toHaveClass('sr-only')
    })

    it('should show down arrow icon for negative trend', () => {
      const { container } = render(<StatChange trend="down">-8%</StatChange>)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()

      const srText = screen.getByText(/decreased by/i)
      expect(srText).toHaveClass('sr-only')
    })

    it('should not show arrow icon for neutral trend', () => {
      const { container } = render(<StatChange trend="neutral">0%</StatChange>)

      const icon = container.querySelector('svg')
      expect(icon).not.toBeInTheDocument()
    })

    it('should apply correct color classes based on trend', () => {
      const { rerender } = render(<StatChange trend="up">+5%</StatChange>)
      let change = screen.getByText('+5%').parentElement
      expect(change).toHaveClass('text-success')

      rerender(<StatChange trend="down">-5%</StatChange>)
      change = screen.getByText('-5%').parentElement
      expect(change).toHaveClass('text-danger')

      rerender(<StatChange trend="neutral">0%</StatChange>)
      change = screen.getByText('0%').parentElement
      expect(change).toHaveClass('text-on-surface-muted')
    })
  })

  describe('StatGroup with complete example', () => {
    it('should render a complete stats dashboard', () => {
      render(
        <StatGroup columns={3}>
          <Stat>
            <StatLabel>Revenue</StatLabel>
            <StatChange trend="up">+4.75%</StatChange>
            <StatValue>$405,091.00</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Overdue invoices</StatLabel>
            <StatChange trend="down">-2.5%</StatChange>
            <StatValue>$12,787.00</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Outstanding invoices</StatLabel>
            <StatChange trend="neutral">0%</StatChange>
            <StatValue>$245,988.00</StatValue>
          </Stat>
        </StatGroup>
      )

      expect(screen.getByText('Revenue')).toBeInTheDocument()
      expect(screen.getByText('$405,091.00')).toBeInTheDocument()
      expect(screen.getByText('+4.75%')).toBeInTheDocument()

      expect(screen.getByText('Overdue invoices')).toBeInTheDocument()
      expect(screen.getByText('$12,787.00')).toBeInTheDocument()
      expect(screen.getByText('-2.5%')).toBeInTheDocument()

      expect(screen.getByText('Outstanding invoices')).toBeInTheDocument()
      expect(screen.getByText('$245,988.00')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })
})
