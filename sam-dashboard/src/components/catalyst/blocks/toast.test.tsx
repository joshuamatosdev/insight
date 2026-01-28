import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  Toast,
  ToastProvider,
  useToast,
} from './toast'

// Test component that uses the useToast hook
function ToastTrigger() {
  const toast = useToast()
  return (
    <div>
      <button onClick={() => toast.success('Success message')}>Show Success</button>
      <button onClick={() => toast.error('Error message')}>Show Error</button>
      <button onClick={() => toast.warning('Warning message')}>Show Warning</button>
      <button onClick={() => toast.info('Info message')}>Show Info</button>
      <button onClick={() => toast.custom({ type: 'info', title: 'Custom', description: 'Custom toast' })}>
        Show Custom
      </button>
    </div>
  )
}

describe('Toast', () => {
  describe('Toast Component', () => {
    it('renders toast with message', () => {
      render(
        <Toast
          id="test-toast"
          type="success"
          message="Test message"
          onDismiss={() => {}}
        />
      )

      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('renders success toast with correct styling', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="success"
          message="Success!"
          onDismiss={() => {}}
        />
      )

      const icon = container.querySelector('svg')
      expect(icon).toHaveClass('text-green-400')
    })

    it('renders error toast with correct styling', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="error"
          message="Error!"
          onDismiss={() => {}}
        />
      )

      const icon = container.querySelector('svg')
      expect(icon).toHaveClass('text-red-400')
    })

    it('renders warning toast with correct styling', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="warning"
          message="Warning!"
          onDismiss={() => {}}
        />
      )

      const icon = container.querySelector('svg')
      expect(icon).toHaveClass('text-amber-400')
    })

    it('renders info toast with correct styling', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="info"
          message="Info!"
          onDismiss={() => {}}
        />
      )

      const icon = container.querySelector('svg')
      expect(icon).toHaveClass('text-blue-400')
    })

    it('renders toast with title and description', () => {
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Title"
          description="Description"
          onDismiss={() => {}}
        />
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('calls onDismiss when close button is clicked', async () => {
      const user = userEvent.setup()
      const handleDismiss = vi.fn()

      render(
        <Toast
          id="test-toast"
          type="success"
          message="Test"
          onDismiss={handleDismiss}
        />
      )

      const closeButton = screen.getByRole('button', { name: /dismiss/i })
      await user.click(closeButton)

      expect(handleDismiss).toHaveBeenCalledWith('test-toast')
    })

    it('has accessible role and aria attributes', () => {
      render(
        <Toast
          id="test-toast"
          type="success"
          message="Test"
          onDismiss={() => {}}
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('ToastProvider', () => {
    it('renders children', () => {
      render(
        <ToastProvider>
          <div>Child content</div>
        </ToastProvider>
      )

      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('provides toast context to children', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      )

      expect(screen.getByText('Show Success')).toBeInTheDocument()
    })
  })

  describe('useToast hook', () => {
    it('shows success toast when toast.success is called', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Success'))

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument()
      })
    })

    it('shows error toast when toast.error is called', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Error'))

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })
    })

    it('shows warning toast when toast.warning is called', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Warning'))

      await waitFor(() => {
        expect(screen.getByText('Warning message')).toBeInTheDocument()
      })
    })

    it('shows info toast when toast.info is called', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Info'))

      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument()
      })
    })

    it('shows custom toast when toast.custom is called', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Custom'))

      await waitFor(() => {
        expect(screen.getByText('Custom')).toBeInTheDocument()
        expect(screen.getByText('Custom toast')).toBeInTheDocument()
      })
    })

    it('auto-dismisses toast after duration', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(
        <ToastProvider duration={1000}>
          <ToastTrigger />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Success'))

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument()
      })

      act(() => {
        vi.advanceTimersByTime(1500)
      })

      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument()
      })

      vi.useRealTimers()
    })

    it('can show multiple toasts', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Success'))
      await user.click(screen.getByText('Show Error'))

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument()
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })
    })
  })
})
