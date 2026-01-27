import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton, SkeletonCircle, SkeletonText } from './skeleton'

describe('Skeleton', () => {
  describe('Skeleton (base)', () => {
    it('renders skeleton element', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild
      expect(skeleton).toBeInTheDocument()
    })

    it('has animation class', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('applies custom width', () => {
      const { container } = render(<Skeleton width="200px" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.style.width).toBe('200px')
    })

    it('applies custom height', () => {
      const { container } = render(<Skeleton height="100px" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.style.height).toBe('100px')
    })

    it('applies rounded corners by default', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('rounded-md')
    })

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('custom-class')
    })

    it('has correct background color', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('bg-zinc-200')
    })

    it('renders with full width when specified', () => {
      const { container } = render(<Skeleton width="full" />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('w-full')
    })
  })

  describe('SkeletonText', () => {
    it('renders single line by default', () => {
      const { container } = render(<SkeletonText />)
      const lines = container.querySelectorAll('.animate-pulse')
      expect(lines.length).toBe(1)
    })

    it('renders multiple lines when specified', () => {
      const { container } = render(<SkeletonText lines={3} />)
      const wrapper = container.firstChild
      const lines = wrapper?.childNodes
      expect(lines?.length).toBe(3)
    })

    it('last line is shorter by default', () => {
      const { container } = render(<SkeletonText lines={3} />)
      const wrapper = container.firstChild
      const lastLine = wrapper?.lastChild as HTMLElement
      expect(lastLine).toHaveClass('w-3/4')
    })

    it('applies custom spacing between lines', () => {
      const { container } = render(<SkeletonText lines={2} spacing="lg" />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('space-y-3')
    })

    it('applies custom className', () => {
      const { container } = render(<SkeletonText className="custom-class" />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-class')
    })
  })

  describe('SkeletonCircle', () => {
    it('renders circular skeleton', () => {
      const { container } = render(<SkeletonCircle />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('rounded-full')
    })

    it('renders with default size', () => {
      const { container } = render(<SkeletonCircle />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('size-10')
    })

    it('renders with size sm', () => {
      const { container } = render(<SkeletonCircle size="sm" />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('size-8')
    })

    it('renders with size lg', () => {
      const { container } = render(<SkeletonCircle size="lg" />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('size-12')
    })

    it('renders with size xl', () => {
      const { container } = render(<SkeletonCircle size="xl" />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('size-16')
    })

    it('applies custom className', () => {
      const { container } = render(<SkeletonCircle className="custom-class" />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('custom-class')
    })
  })
})
