import { useState } from 'react'
import {
  InlineAlert,
  InlineAlertTitle,
  InlineAlertDescription,
  InlineAlertActions,
} from './inline-alert'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid'

/**
 * Example usage of the InlineAlert component
 */
export function InlineAlertExamples() {
  const [showDismissible, setShowDismissible] = useState(true)

  return (
    <div className="space-y-4 p-8">
      {/* Info Alert with Icon */}
      <InlineAlert color="info" icon={InformationCircleIcon}>
        <InlineAlertTitle>Information</InlineAlertTitle>
        <InlineAlertDescription>
          A new software update is available. See what's new in version 2.0.4.
        </InlineAlertDescription>
      </InlineAlert>

      {/* Success Alert with Actions */}
      <InlineAlert color="success" icon={CheckCircleIcon}>
        <InlineAlertTitle>Order completed</InlineAlertTitle>
        <InlineAlertDescription>
          Your order has been processed and will be shipped within 2 business days.
        </InlineAlertDescription>
        <InlineAlertActions>
          <button
            type="button"
            className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:bg-transparent dark:text-green-200 dark:hover:bg-white/10"
          >
            View status
          </button>
          <button
            type="button"
            className="ml-3 rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:bg-transparent dark:text-green-200 dark:hover:bg-white/10"
          >
            Dismiss
          </button>
        </InlineAlertActions>
      </InlineAlert>

      {/* Warning Alert with List */}
      <InlineAlert color="warning" icon={ExclamationTriangleIcon}>
        <InlineAlertTitle>Attention needed</InlineAlertTitle>
        <InlineAlertDescription>
          <p>Please review the following items before proceeding:</p>
          <ul role="list" className="mt-2 list-disc space-y-1 pl-5">
            <li>Ensure all required fields are completed</li>
            <li>Verify contact information is up to date</li>
            <li>Review terms and conditions</li>
          </ul>
        </InlineAlertDescription>
      </InlineAlert>

      {/* Error Alert with List */}
      <InlineAlert color="error" icon={XCircleIcon}>
        <InlineAlertTitle>There were 2 errors with your submission</InlineAlertTitle>
        <InlineAlertDescription>
          <ul role="list" className="list-disc space-y-1 pl-5">
            <li>Your password must be at least 8 characters</li>
            <li>Your password must include at least one special character</li>
          </ul>
        </InlineAlertDescription>
      </InlineAlert>

      {/* Dismissible Alert */}
      {showDismissible && (
        <InlineAlert
          color="success"
          icon={CheckCircleIcon}
          onDismiss={() => setShowDismissible(false)}
        >
          <InlineAlertTitle>Successfully uploaded</InlineAlertTitle>
        </InlineAlert>
      )}

      {/* Simple Alert without Icon */}
      <InlineAlert color="info">
        <InlineAlertDescription>
          This is a simple informational message without an icon or title.
        </InlineAlertDescription>
      </InlineAlert>

      {/* Custom className example */}
      <InlineAlert color="warning" className="border-l-4 border-yellow-400">
        <InlineAlertDescription>
          You have no credits left.{' '}
          <a
            href="#"
            className="font-medium underline hover:text-yellow-600 dark:hover:text-yellow-200"
          >
            Upgrade your account to add more credits.
          </a>
        </InlineAlertDescription>
      </InlineAlert>
    </div>
  )
}
