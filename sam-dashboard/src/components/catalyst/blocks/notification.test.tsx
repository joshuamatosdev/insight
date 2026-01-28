import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {
    Notification,
    NotificationActions,
    NotificationContent,
    NotificationDescription,
    NotificationDismiss,
    NotificationIcon,
    NotificationTitle,
} from './notification'

describe('Notification', () => {
  describe('Notification Container', () => {
    it('renders notification with children', () => {
      render(
        <Notification show={true}>
          <div>Test notification content</div>
        </Notification>
      )

      expect(screen.getByText('Test notification content')).toBeInTheDocument()
    })

    it('renders notification with default position top-right', () => {
      const { container } = render(
        <Notification show={true}>
          <div>Test content</div>
        </Notification>
      )

      const wrapper = container.querySelector('[aria-live="assertive"]')
      expect(wrapper).toHaveClass('top-0', 'right-0')
    })

    it('renders notification with position top-left', () => {
      const { container } = render(
        <Notification show={true} position="top-left">
          <div>Test content</div>
        </Notification>
      )

      const wrapper = container.querySelector('[aria-live="assertive"]')
      expect(wrapper).toHaveClass('top-0', 'left-0')
    })

    it('renders notification with position bottom-right', () => {
      const { container } = render(
        <Notification show={true} position="bottom-right">
          <div>Test content</div>
        </Notification>
      )

      const wrapper = container.querySelector('[aria-live="assertive"]')
      expect(wrapper).toHaveClass('bottom-0', 'right-0')
    })

    it('renders notification with position bottom-left', () => {
      const { container } = render(
        <Notification show={true} position="bottom-left">
          <div>Test content</div>
        </Notification>
      )

      const wrapper = container.querySelector('[aria-live="assertive"]')
      expect(wrapper).toHaveClass('bottom-0', 'left-0')
    })

    it('renders notification with position top-center', () => {
      const { container } = render(
        <Notification show={true} position="top-center">
          <div>Test content</div>
        </Notification>
      )

      const wrapper = container.querySelector('[aria-live="assertive"]')
      expect(wrapper).toHaveClass('top-0', 'left-1/2')
    })

    it('renders notification with position bottom-center', () => {
      const { container } = render(
        <Notification show={true} position="bottom-center">
          <div>Test content</div>
        </Notification>
      )

      const wrapper = container.querySelector('[aria-live="assertive"]')
      expect(wrapper).toHaveClass('bottom-0', 'left-1/2')
    })

    it('renders close button when onClose is provided', () => {
      const handleClose = vi.fn()
      render(
        <Notification show={true} onClose={handleClose}>
          <div>Test content</div>
        </Notification>
      )

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('does not render close button when onClose is not provided', () => {
      render(
        <Notification show={true}>
          <div>Test content</div>
        </Notification>
      )

      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()
      render(
        <Notification show={true} onClose={handleClose}>
          <div>Test content</div>
        </Notification>
      )

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('applies custom className', () => {
      const { container } = render(
        <Notification show={true} className="custom-class">
          <div>Test content</div>
        </Notification>
      )

      const notification = container.querySelector('.custom-class')
      expect(notification).toBeInTheDocument()
    })

    it('has aria-live="assertive" for accessibility', () => {
      const { container } = render(
        <Notification show={true}>
          <div>Test content</div>
        </Notification>
      )

      expect(container.querySelector('[aria-live="assertive"]')).toBeInTheDocument()
    })
  })

  describe('NotificationIcon', () => {
    it('renders success icon by default', () => {
      const { container } = render(<NotificationIcon color="success" />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('text-green-400')
    })

    it('renders error icon with correct color', () => {
      const { container } = render(<NotificationIcon color="error" />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('text-red-400')
    })

    it('renders warning icon with correct color', () => {
      const { container } = render(<NotificationIcon color="warning" />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('text-amber-400')
    })

    it('renders info icon with correct color', () => {
      const { container } = render(<NotificationIcon color="info" />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('text-blue-400')
    })

    it('renders custom icon when children provided', () => {
      render(
        <NotificationIcon color="success">
          <div data-testid="custom-icon">Custom Icon</div>
        </NotificationIcon>
      )

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<NotificationIcon color="success" className="custom-icon-class" />)
      const icon = container.querySelector('.custom-icon-class')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('NotificationContent', () => {
    it('renders content with children', () => {
      render(
        <NotificationContent>
          <div>Notification content</div>
        </NotificationContent>
      )

      expect(screen.getByText('Notification content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <NotificationContent className="custom-content-class">
          <div>Content</div>
        </NotificationContent>
      )

      expect(container.querySelector('.custom-content-class')).toBeInTheDocument()
    })
  })

  describe('NotificationTitle', () => {
    it('renders title text', () => {
      render(<NotificationTitle>Success notification</NotificationTitle>)

      expect(screen.getByText('Success notification')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <NotificationTitle className="custom-title-class">Title</NotificationTitle>
      )

      expect(container.querySelector('.custom-title-class')).toBeInTheDocument()
    })
  })

  describe('NotificationDescription', () => {
    it('renders description text', () => {
      render(<NotificationDescription>Your changes have been saved successfully.</NotificationDescription>)

      expect(screen.getByText('Your changes have been saved successfully.')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <NotificationDescription className="custom-description-class">Description</NotificationDescription>
      )

      expect(container.querySelector('.custom-description-class')).toBeInTheDocument()
    })
  })

  describe('NotificationActions', () => {
    it('renders action buttons', () => {
      render(
        <NotificationActions>
          <button>Undo</button>
          <button>View</button>
        </NotificationActions>
      )

      expect(screen.getByText('Undo')).toBeInTheDocument()
      expect(screen.getByText('View')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <NotificationActions className="custom-actions-class">
          <button>Action</button>
        </NotificationActions>
      )

      expect(container.querySelector('.custom-actions-class')).toBeInTheDocument()
    })
  })

  describe('NotificationDismiss', () => {
    it('renders dismiss button with text', () => {
      render(<NotificationDismiss />)

      expect(screen.getByText('Dismiss')).toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleDismiss = vi.fn()
      render(<NotificationDismiss onClick={handleDismiss} />)

      const dismissButton = screen.getByText('Dismiss')
      await user.click(dismissButton)

      expect(handleDismiss).toHaveBeenCalledTimes(1)
    })

    it('applies custom className', () => {
      const { container } = render(<NotificationDismiss className="custom-dismiss-class" />)

      expect(container.querySelector('.custom-dismiss-class')).toBeInTheDocument()
    })
  })

  describe('Complete notification examples', () => {
    it('renders complete success notification', () => {
      const handleClose = vi.fn()
      render(
        <Notification show={true} onClose={handleClose}>
          <NotificationIcon color="success" />
          <NotificationContent>
            <NotificationTitle>Successfully saved!</NotificationTitle>
            <NotificationDescription>
              Anyone with a link can now view this file.
            </NotificationDescription>
          </NotificationContent>
        </Notification>
      )

      expect(screen.getByText('Successfully saved!')).toBeInTheDocument()
      expect(screen.getByText('Anyone with a link can now view this file.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('renders notification with actions', () => {
      render(
        <Notification show={true}>
          <NotificationIcon color="info" />
          <NotificationContent>
            <NotificationTitle>Discussion moved</NotificationTitle>
            <NotificationDescription>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </NotificationDescription>
            <NotificationActions>
              <button>Undo</button>
              <NotificationDismiss />
            </NotificationActions>
          </NotificationContent>
        </Notification>
      )

      expect(screen.getByText('Discussion moved')).toBeInTheDocument()
      expect(screen.getByText('Undo')).toBeInTheDocument()
      expect(screen.getByText('Dismiss')).toBeInTheDocument()
    })

    it('renders error notification', () => {
      render(
        <Notification show={true} position="bottom-right">
          <NotificationIcon color="error" />
          <NotificationContent>
            <NotificationTitle>Error occurred</NotificationTitle>
            <NotificationDescription>
              Unable to save your changes. Please try again.
            </NotificationDescription>
          </NotificationContent>
        </Notification>
      )

      expect(screen.getByText('Error occurred')).toBeInTheDocument()
      expect(screen.getByText('Unable to save your changes. Please try again.')).toBeInTheDocument()
    })

    it('renders warning notification', () => {
      render(
        <Notification show={true} position="top-center">
          <NotificationIcon color="warning" />
          <NotificationContent>
            <NotificationTitle>Warning</NotificationTitle>
            <NotificationDescription>
              Your session will expire in 5 minutes.
            </NotificationDescription>
          </NotificationContent>
        </Notification>
      )

      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('Your session will expire in 5 minutes.')).toBeInTheDocument()
    })
  })
})
