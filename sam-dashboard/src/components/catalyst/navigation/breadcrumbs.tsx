import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import React, { forwardRef } from 'react'
import { Link } from '../primitives/link'

type SeparatorType = 'slash' | 'chevron' | 'arrow'

const separators = {
  slash: (
    <svg
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="size-5 shrink-0 text-gray-300 dark:text-gray-600"
    >
      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
    </svg>
  ),
  chevron: <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400 dark:text-gray-500" />,
  arrow: (
    <svg
      fill="currentColor"
      viewBox="0 0 24 44"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="h-full w-6 shrink-0 text-gray-200 dark:text-white/10"
    >
      <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
    </svg>
  ),
}

type BreadcrumbsProps = {
  separator?: SeparatorType
  showHome?: boolean
  homeHref?: string
  className?: string
  children: React.ReactNode
}

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { separator = 'chevron', showHome = true, homeHref = '/', className, children },
  ref
) {
  return (
    <nav ref={ref} aria-label="Breadcrumb" className={clsx('flex', className)}>
      <ol role="list" className="flex items-center space-x-4">
        {showHome !== false && (
          <li>
            <div>
              <Link
                href={homeHref}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
                <span className="sr-only">Home</span>
              </Link>
            </div>
          </li>
        )}
        {children}
      </ol>
    </nav>
  )
})

type BreadcrumbItemProps = {
  href?: string
  current?: boolean
  className?: string
  children: React.ReactNode
  separator?: SeparatorType
}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { href, current = false, className, children, separator = 'chevron' },
  ref
) {
  const separatorIcon = separators[separator]

  return (
    <li ref={ref} className={clsx('flex', className)}>
      <div className="flex items-center">
        {separatorIcon}
        {href !== undefined && href !== null ? (
          <Link
            href={href}
            aria-current={current === true ? 'page' : undefined}
            className={clsx(
              'ml-4 text-sm font-medium',
              current === true
                ? 'text-gray-700 dark:text-gray-200'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            {children}
          </Link>
        ) : (
          <span
            aria-current={current === true ? 'page' : undefined}
            className={clsx(
              'ml-4 text-sm font-medium',
              current === true
                ? 'text-gray-700 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {children}
          </span>
        )}
      </div>
    </li>
  )
})
