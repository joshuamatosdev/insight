/**
 * Notification Component Examples
 *
 * This file demonstrates all the ways to use the Notification component
 * from the Catalyst UI Kit.
 */

import { useState } from 'react'
import {
  Notification,
  NotificationActions,
  NotificationContent,
  NotificationDescription,
  NotificationDismiss,
  NotificationIcon,
  NotificationTitle,
} from './notification'

// Example 1: Simple Success Notification
export function SimpleSuccessNotification() {
  const [show, setShow] = useState(true)

  return (
    <Notification show={show} onClose={() => setShow(false)}>
      <NotificationIcon color="success" />
      <NotificationContent>
        <NotificationTitle>Successfully saved!</NotificationTitle>
        <NotificationDescription>
          Anyone with a link can now view this file.
        </NotificationDescription>
      </NotificationContent>
    </Notification>
  )
}

// Example 2: Error Notification (Bottom Right)
export function ErrorNotification() {
  const [show, setShow] = useState(true)

  return (
    <Notification show={show} position="bottom-right" onClose={() => setShow(false)}>
      <NotificationIcon color="error" />
      <NotificationContent>
        <NotificationTitle>Error occurred</NotificationTitle>
        <NotificationDescription>
          Unable to save your changes. Please try again.
        </NotificationDescription>
      </NotificationContent>
    </Notification>
  )
}

// Example 3: Warning Notification (Top Center)
export function WarningNotification() {
  const [show, setShow] = useState(true)

  return (
    <Notification show={show} position="top-center" onClose={() => setShow(false)}>
      <NotificationIcon color="warning" />
      <NotificationContent>
        <NotificationTitle>Session expiring soon</NotificationTitle>
        <NotificationDescription>
          Your session will expire in 5 minutes. Please save your work.
        </NotificationDescription>
      </NotificationContent>
    </Notification>
  )
}

// Example 4: Info Notification with Actions
export function InfoNotificationWithActions() {
  const [show, setShow] = useState(true)

  const handleUndo = () => {
    console.log('Undo action')
    setShow(false)
  }

  const handleDismiss = () => {
    console.log('Dismiss action')
    setShow(false)
  }

  return (
    <Notification show={show} onClose={() => setShow(false)}>
      <NotificationIcon color="info" />
      <NotificationContent>
        <NotificationTitle>Discussion moved</NotificationTitle>
        <NotificationDescription>
          The discussion has been moved to the archive folder.
        </NotificationDescription>
        <NotificationActions>
          <button
            type="button"
            onClick={handleUndo}
            className="rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 dark:focus:outline-indigo-400"
          >
            Undo
          </button>
          <NotificationDismiss onClick={handleDismiss} />
        </NotificationActions>
      </NotificationContent>
    </Notification>
  )
}

// Example 5: Condensed Notification (No Icon, Inline Action)
export function CondensedNotification() {
  const [show, setShow] = useState(true)

  return (
    <Notification show={show} onClose={() => setShow(false)}>
      <NotificationContent>
        <div className="flex items-center">
          <div className="flex w-0 flex-1 justify-between">
            <p className="w-0 flex-1 text-sm font-medium text-gray-900 dark:text-white">
              Discussion archived
            </p>
            <button
              type="button"
              className="ml-3 shrink-0 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 dark:bg-gray-800 dark:text-indigo-400 dark:hover:text-indigo-300 dark:focus:outline-indigo-400"
            >
              Undo
            </button>
          </div>
        </div>
      </NotificationContent>
    </Notification>
  )
}

// Example 6: Custom Icon
export function CustomIconNotification() {
  const [show, setShow] = useState(true)

  return (
    <Notification show={show} onClose={() => setShow(false)}>
      <NotificationIcon color="success">
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </NotificationIcon>
      <NotificationContent>
        <NotificationTitle>Payment processed</NotificationTitle>
        <NotificationDescription>
          Your payment has been successfully processed.
        </NotificationDescription>
      </NotificationContent>
    </Notification>
  )
}

// Example 7: All Position Options Demo
export function AllPositionsDemo() {
  const [topRight, setTopRight] = useState(false)
  const [topLeft, setTopLeft] = useState(false)
  const [bottomRight, setBottomRight] = useState(false)
  const [bottomLeft, setBottomLeft] = useState(false)
  const [topCenter, setTopCenter] = useState(false)
  const [bottomCenter, setBottomCenter] = useState(false)

  return (
    <div className="space-y-4 p-8">
      <button
        onClick={() => setTopRight(true)}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white"
      >
        Show Top Right
      </button>
      <button
        onClick={() => setTopLeft(true)}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white"
      >
        Show Top Left
      </button>
      <button
        onClick={() => setBottomRight(true)}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white"
      >
        Show Bottom Right
      </button>
      <button
        onClick={() => setBottomLeft(true)}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white"
      >
        Show Bottom Left
      </button>
      <button
        onClick={() => setTopCenter(true)}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white"
      >
        Show Top Center
      </button>
      <button
        onClick={() => setBottomCenter(true)}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white"
      >
        Show Bottom Center
      </button>

      <Notification show={topRight} position="top-right" onClose={() => setTopRight(false)}>
        <NotificationIcon color="success" />
        <NotificationContent>
          <NotificationTitle>Top Right</NotificationTitle>
        </NotificationContent>
      </Notification>

      <Notification show={topLeft} position="top-left" onClose={() => setTopLeft(false)}>
        <NotificationIcon color="info" />
        <NotificationContent>
          <NotificationTitle>Top Left</NotificationTitle>
        </NotificationContent>
      </Notification>

      <Notification show={bottomRight} position="bottom-right" onClose={() => setBottomRight(false)}>
        <NotificationIcon color="warning" />
        <NotificationContent>
          <NotificationTitle>Bottom Right</NotificationTitle>
        </NotificationContent>
      </Notification>

      <Notification show={bottomLeft} position="bottom-left" onClose={() => setBottomLeft(false)}>
        <NotificationIcon color="error" />
        <NotificationContent>
          <NotificationTitle>Bottom Left</NotificationTitle>
        </NotificationContent>
      </Notification>

      <Notification show={topCenter} position="top-center" onClose={() => setTopCenter(false)}>
        <NotificationIcon color="success" />
        <NotificationContent>
          <NotificationTitle>Top Center</NotificationTitle>
        </NotificationContent>
      </Notification>

      <Notification show={bottomCenter} position="bottom-center" onClose={() => setBottomCenter(false)}>
        <NotificationIcon color="info" />
        <NotificationContent>
          <NotificationTitle>Bottom Center</NotificationTitle>
        </NotificationContent>
      </Notification>
    </div>
  )
}

// Example 8: No Close Button (Auto-dismiss)
export function AutoDismissNotification() {
  const [show, setShow] = useState(true)

  // Auto-dismiss after 3 seconds
  useState(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 3000)
    return () => clearTimeout(timer)
  })

  return (
    <Notification show={show}>
      <NotificationIcon color="success" />
      <NotificationContent>
        <NotificationTitle>Saved automatically</NotificationTitle>
        <NotificationDescription>This will auto-dismiss in 3 seconds.</NotificationDescription>
      </NotificationContent>
    </Notification>
  )
}
