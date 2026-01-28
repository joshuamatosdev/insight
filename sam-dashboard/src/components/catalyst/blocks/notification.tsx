import {Transition} from '@headlessui/react'
import {XMarkIcon} from '@heroicons/react/20/solid'
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import type React from 'react'

const positions = {
  'top-right': 'top-0 right-0 items-end sm:items-start',
  'top-left': 'top-0 left-0 items-start sm:items-start',
  'bottom-right': 'bottom-0 right-0 items-end sm:items-end',
  'bottom-left': 'bottom-0 left-0 items-start sm:items-end',
  'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center sm:items-start',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 items-center sm:items-end',
}

const iconColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
}

const iconComponents = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
}

export function Notification({
  show = true,
  onClose,
  position = 'top-right',
  className,
  children,
}: {
  show?: boolean
  onClose?: () => void
  position?: keyof typeof positions
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      aria-live="assertive"
      className={clsx(
        'pointer-events-none fixed inset-0 flex px-4 py-6 sm:p-6',
        positions[position]
      )}
    >
      <div className="flex w-full flex-col space-y-4 sm:items-end">
        <Transition show={show}>
          <div
            className={clsx(
              className,
              'pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg outline-1 outline-black/5 transition data-closed:opacity-0 data-enter:transform data-enter:duration-300 data-enter:ease-out data-closed:data-enter:translate-y-2 data-leave:duration-100 data-leave:ease-in data-closed:data-enter:sm:translate-x-2 data-closed:data-enter:sm:translate-y-0 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10'
            )}
          >
            <div className="p-4">
              <div className="flex items-start">
                {children}
                {onClose !== undefined && onClose !== null && (
                  <div className="ml-4 flex shrink-0">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:hover:text-white dark:focus:outline-indigo-500"
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon aria-hidden="true" className="size-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  )
}

export function NotificationIcon({
  color = 'info',
  className,
  children,
}: {
  color?: keyof typeof iconColors
  className?: string
  children?: React.ReactNode
}) {
  const IconComponent = iconComponents[color]

  return (
    <div className="shrink-0">
      {children !== undefined && children !== null ? (
        <div className={clsx(className, iconColors[color])}>{children}</div>
      ) : (
        <IconComponent
          aria-hidden="true"
          className={clsx(className, 'size-6', iconColors[color])}
        />
      )}
    </div>
  )
}

export function NotificationContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={clsx(className, 'ml-3 w-0 flex-1 pt-0.5')}>{children}</div>
  )
}

export function NotificationTitle({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      className={clsx(
        className,
        'text-sm font-medium text-gray-900 dark:text-white'
      )}
    >
      {children}
    </p>
  )
}

export function NotificationDescription({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p className={clsx(className, 'mt-1 text-sm text-gray-500 dark:text-gray-400')}>
      {children}
    </p>
  )
}

export function NotificationActions({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={clsx(className, 'mt-3 flex space-x-7')}>{children}</div>
}

export function NotificationDismiss({
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        className,
        'rounded-md text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 dark:text-gray-300 dark:hover:text-white dark:focus:outline-indigo-400'
      )}
    >
      Dismiss
    </button>
  )
}
