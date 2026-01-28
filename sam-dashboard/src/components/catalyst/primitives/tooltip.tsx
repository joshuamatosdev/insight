import clsx from 'clsx'
import type React from 'react'
import { useEffect, useId, useRef, useState } from 'react'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export type TooltipProps = {
  content: string
  position?: TooltipPosition
  delay?: number
  className?: string
  children: React.ReactElement
}

const positionStyles: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowStyles: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-zinc-900 dark:border-t-zinc-700',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-zinc-900 dark:border-b-zinc-700',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-zinc-900 dark:border-l-zinc-700',
  right:
    'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-zinc-900 dark:border-r-zinc-700',
}

export function Tooltip({
  content,
  position = 'top',
  delay = 0,
  className,
  children,
}: TooltipProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const tooltipId = useId()

  const clearTimer = (): void => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleMouseEnter = (): void => {
    clearTimer()
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(true)
      }, delay)
    } else {
      setIsVisible(true)
    }
  }

  const handleMouseLeave = (): void => {
    clearTimer()
    setIsVisible(false)
  }

  const handleFocus = (): void => {
    clearTimer()
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(true)
      }, delay)
    } else {
      setIsVisible(true)
    }
  }

  const handleBlur = (): void => {
    clearTimer()
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [])

  const trigger = children as React.ReactElement<{
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    onFocus?: () => void
    onBlur?: () => void
    'aria-describedby'?: string
  }>

  const triggerWithHandlers = {
    ...trigger,
    props: {
      ...trigger.props,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      'aria-describedby': isVisible ? tooltipId : undefined,
    },
  }

  return (
    <span className="relative inline-block">
      {triggerWithHandlers}
      {isVisible === true && (
        <span
          id={tooltipId}
          role="tooltip"
          className={clsx(
            className,
            'absolute z-50 px-2 py-1 text-sm text-white bg-zinc-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
            'dark:bg-zinc-700 dark:text-white',
            // Transitions
            'transition-opacity duration-100 opacity-100',
            // Position
            positionStyles[position]
          )}
        >
          {content}
          {/* Arrow */}
          <span
            className={clsx(
              'absolute w-0 h-0 border-4 pointer-events-none',
              arrowStyles[position]
            )}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  )
}
