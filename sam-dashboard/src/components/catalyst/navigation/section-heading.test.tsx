import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  SectionHeading,
  SectionHeadingTitle,
  SectionHeadingDescription,
  SectionHeadingActions,
} from './section-heading'

describe('SectionHeading', () => {
  describe('SectionHeading container', () => {
    it('renders children', () => {
      render(
        <SectionHeading>
          <div data-testid="child">Content</div>
        </SectionHeading>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('applies border by default', () => {
      const { container } = render(
        <SectionHeading>
          <div>Content</div>
        </SectionHeading>
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('border-b')
      expect(wrapper).toHaveClass('border-gray-200')
    })

    it('removes border when border=false', () => {
      const { container } = render(
        <SectionHeading border={false}>
          <div>Content</div>
        </SectionHeading>
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).not.toHaveClass('border-b')
    })

    it('accepts custom className', () => {
      const { container } = render(
        <SectionHeading className="custom-class">
          <div>Content</div>
        </SectionHeading>
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('custom-class')
    })
  })

  describe('SectionHeadingTitle', () => {
    it('renders as h3 by default', () => {
      render(<SectionHeadingTitle>Test Title</SectionHeadingTitle>)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Test Title')
    })

    it('renders as h2 when level=h2', () => {
      render(<SectionHeadingTitle level="h2">Test Title</SectionHeadingTitle>)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Test Title')
    })

    it('renders as h4 when level=h4', () => {
      render(<SectionHeadingTitle level="h4">Test Title</SectionHeadingTitle>)

      const heading = screen.getByRole('heading', { level: 4 })
      expect(heading).toHaveTextContent('Test Title')
    })

    it('applies correct styling classes', () => {
      render(<SectionHeadingTitle>Test Title</SectionHeadingTitle>)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveClass('text-base')
      expect(heading).toHaveClass('font-semibold')
      expect(heading).toHaveClass('text-gray-900')
      expect(heading).toHaveClass('dark:text-white')
    })

    it('accepts custom className', () => {
      render(<SectionHeadingTitle className="custom-title">Test Title</SectionHeadingTitle>)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveClass('custom-title')
    })
  })

  describe('SectionHeadingDescription', () => {
    it('renders description text', () => {
      render(<SectionHeadingDescription>Test description text</SectionHeadingDescription>)

      expect(screen.getByText('Test description text')).toBeInTheDocument()
    })

    it('applies correct styling classes', () => {
      const { container } = render(
        <SectionHeadingDescription>Test description</SectionHeadingDescription>
      )

      const description = container.firstChild as HTMLElement
      expect(description).toHaveClass('mt-2')
      expect(description).toHaveClass('max-w-4xl')
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('text-gray-500')
      expect(description).toHaveClass('dark:text-gray-400')
    })

    it('accepts custom className', () => {
      const { container } = render(
        <SectionHeadingDescription className="custom-desc">
          Test description
        </SectionHeadingDescription>
      )

      const description = container.firstChild as HTMLElement
      expect(description).toHaveClass('custom-desc')
    })
  })

  describe('SectionHeadingActions', () => {
    it('renders action buttons', () => {
      render(
        <SectionHeadingActions>
          <button>Action 1</button>
          <button>Action 2</button>
        </SectionHeadingActions>
      )

      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument()
    })

    it('applies correct styling classes', () => {
      const { container } = render(
        <SectionHeadingActions>
          <button>Action</button>
        </SectionHeadingActions>
      )

      const actions = container.firstChild as HTMLElement
      expect(actions).toHaveClass('mt-3')
      expect(actions).toHaveClass('flex')
      expect(actions).toHaveClass('sm:mt-0')
      expect(actions).toHaveClass('sm:ml-4')
    })

    it('accepts custom className', () => {
      const { container } = render(
        <SectionHeadingActions className="custom-actions">
          <button>Action</button>
        </SectionHeadingActions>
      )

      const actions = container.firstChild as HTMLElement
      expect(actions).toHaveClass('custom-actions')
    })
  })

  describe('Composition patterns', () => {
    it('renders simple heading with border', () => {
      render(
        <SectionHeading>
          <SectionHeadingTitle>Job Postings</SectionHeadingTitle>
        </SectionHeading>
      )

      expect(screen.getByRole('heading', { name: 'Job Postings' })).toBeInTheDocument()
    })

    it('renders heading with description', () => {
      render(
        <SectionHeading>
          <SectionHeadingTitle>Job Postings</SectionHeadingTitle>
          <SectionHeadingDescription>
            Workcation is a property rental website
          </SectionHeadingDescription>
        </SectionHeading>
      )

      expect(screen.getByRole('heading', { name: 'Job Postings' })).toBeInTheDocument()
      expect(screen.getByText('Workcation is a property rental website')).toBeInTheDocument()
    })

    it('renders heading with actions', () => {
      render(
        <SectionHeading>
          <div className="sm:flex sm:items-center sm:justify-between">
            <SectionHeadingTitle>Job Postings</SectionHeadingTitle>
            <SectionHeadingActions>
              <button>Share</button>
              <button>Create</button>
            </SectionHeadingActions>
          </div>
        </SectionHeading>
      )

      expect(screen.getByRole('heading', { name: 'Job Postings' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    })

    it('renders without border for tabs integration', () => {
      const { container } = render(
        <SectionHeading border={false}>
          <SectionHeadingTitle>Candidates</SectionHeadingTitle>
        </SectionHeading>
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).not.toHaveClass('border-b')
      expect(screen.getByRole('heading', { name: 'Candidates' })).toBeInTheDocument()
    })
  })
})
