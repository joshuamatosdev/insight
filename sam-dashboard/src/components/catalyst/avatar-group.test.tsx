import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AvatarGroup } from './avatar-group'
import { Avatar } from './avatar'

describe('AvatarGroup Component', () => {
  it('renders multiple avatars', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
        <Avatar initials="EF" alt="User C" />
      </AvatarGroup>
    )

    expect(screen.getByText('AB')).toBeDefined()
    expect(screen.getByText('CD')).toBeDefined()
    expect(screen.getByText('EF')).toBeDefined()

    const avatars = container.querySelectorAll('[data-slot="avatar"]')
    expect(avatars.length).toBe(3)
  })

  it('limits displayed avatars with max prop', () => {
    const { container } = render(
      <AvatarGroup max={2}>
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
        <Avatar initials="EF" alt="User C" />
        <Avatar initials="GH" alt="User D" />
      </AvatarGroup>
    )

    const avatars = container.querySelectorAll('[data-slot="avatar"]')
    expect(avatars.length).toBe(2)

    // First two avatars should be visible
    expect(screen.getByText('AB')).toBeDefined()
    expect(screen.getByText('CD')).toBeDefined()

    // Last two should not be rendered
    expect(screen.queryByText('EF')).toBeNull()
    expect(screen.queryByText('GH')).toBeNull()
  })

  it('shows overflow indicator (+N) when max exceeded', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
        <Avatar initials="EF" alt="User C" />
        <Avatar initials="GH" alt="User D" />
      </AvatarGroup>
    )

    // Should show +2 indicator (4 total - 2 shown = 2 remaining)
    expect(screen.getByText('+2')).toBeDefined()
  })

  it('does not show overflow indicator when max not exceeded', () => {
    render(
      <AvatarGroup max={5}>
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
        <Avatar initials="EF" alt="User C" />
      </AvatarGroup>
    )

    // Should not show overflow indicator
    expect(screen.queryByText(/^\+\d+$/)).toBeNull()
  })

  it('avatars overlap correctly with negative margin', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
      </AvatarGroup>
    )

    const group = container.firstChild as HTMLElement
    expect(group.className).toContain('flex')
    expect(group.className).toContain('-space-x-')
  })

  it('supports different sizes', () => {
    const { container } = render(
      <AvatarGroup size="lg">
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
      </AvatarGroup>
    )

    const group = container.firstChild as HTMLElement
    expect(group.className).toContain('size-12')
  })

  it('applies default size when not specified', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
      </AvatarGroup>
    )

    const group = container.firstChild as HTMLElement
    expect(group.className).toContain('size-10')
  })

  it('supports custom className', () => {
    const { container } = render(
      <AvatarGroup className="custom-group">
        <Avatar initials="AB" alt="User A" />
      </AvatarGroup>
    )

    const group = container.firstChild as HTMLElement
    expect(group.className).toContain('custom-group')
  })

  it('preserves all avatars when max prop is not provided', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
        <Avatar initials="EF" alt="User C" />
        <Avatar initials="GH" alt="User D" />
        <Avatar initials="IJ" alt="User E" />
      </AvatarGroup>
    )

    const avatars = container.querySelectorAll('[data-slot="avatar"]')
    expect(avatars.length).toBe(5)
  })

  it('applies ring styling to avatars for visual separation', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
      </AvatarGroup>
    )

    const avatars = container.querySelectorAll('[data-slot="avatar"]')
    avatars.forEach((avatar) => {
      const element = avatar as HTMLElement
      expect(element.className).toContain('ring')
    })
  })

  it('overflow indicator has same size as avatars', () => {
    const { container } = render(
      <AvatarGroup max={1} size="lg">
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
      </AvatarGroup>
    )

    const overflow = screen.getByText('+1').parentElement
    expect(overflow?.className).toContain('size-12')
  })

  it('spreads additional props to container', () => {
    const { container } = render(
      <AvatarGroup data-testid="test-group" aria-label="Team members">
        <Avatar initials="AB" alt="User A" />
      </AvatarGroup>
    )

    const group = container.firstChild as HTMLElement
    expect(group.getAttribute('data-testid')).toBe('test-group')
    expect(group.getAttribute('aria-label')).toBe('Team members')
  })

  it('handles empty children gracefully', () => {
    const { container } = render(<AvatarGroup />)

    const group = container.firstChild as HTMLElement
    expect(group).toBeDefined()
    expect(group.children.length).toBe(0)
  })

  it('handles max value of 0', () => {
    render(
      <AvatarGroup max={0}>
        <Avatar initials="AB" alt="User A" />
        <Avatar initials="CD" alt="User B" />
      </AvatarGroup>
    )

    // Should show +2 indicator (all avatars overflow)
    expect(screen.getByText('+2')).toBeDefined()
    expect(screen.queryByText('AB')).toBeNull()
    expect(screen.queryByText('CD')).toBeNull()
  })
})
