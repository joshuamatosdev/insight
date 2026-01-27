/**
 * EmptyState Component Usage Examples
 *
 * This file demonstrates various use cases for the EmptyState component
 * following Catalyst UI Kit patterns.
 */

import { PlusIcon } from '@heroicons/react/20/solid'
import { Button } from './button'
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDashed,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from './empty-state'

/**
 * Example 1: Simple Empty State
 * Use this for basic "no data" scenarios
 */
export function SimpleEmptyState() {
  return (
    <EmptyState>
      <EmptyStateIcon>
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </EmptyStateIcon>
      <EmptyStateTitle>No projects</EmptyStateTitle>
      <EmptyStateDescription>
        Get started by creating a new project.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button color="indigo">
          <PlusIcon aria-hidden="true" />
          New Project
        </Button>
      </EmptyStateActions>
    </EmptyState>
  )
}

/**
 * Example 2: Dashed Border Empty State (Interactive)
 * Use this for clickable empty states that trigger actions
 */
export function DashedBorderEmptyState() {
  return (
    <EmptyStateDashed as="button" type="button">
      <EmptyStateIcon>
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </EmptyStateIcon>
      <EmptyStateTitle>Create a new database</EmptyStateTitle>
    </EmptyStateDashed>
  )
}

/**
 * Example 3: Empty State with Multiple Actions
 * Use this when you need to offer multiple options
 */
export function EmptyStateWithMultipleActions() {
  return (
    <EmptyState>
      <EmptyStateIcon>
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </EmptyStateIcon>
      <EmptyStateTitle>Add team members</EmptyStateTitle>
      <EmptyStateDescription>
        You haven't added any team members to your project yet.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button color="indigo">
          <PlusIcon aria-hidden="true" />
          Invite Member
        </Button>
        <Button color="white">Import from CSV</Button>
      </EmptyStateActions>
    </EmptyState>
  )
}

/**
 * Example 4: Empty State with Icon Component
 * Use this when using Heroicons or other icon libraries
 */
export function EmptyStateWithIconComponent() {
  return (
    <EmptyState>
      <EmptyStateIcon>
        <PlusIcon />
      </EmptyStateIcon>
      <EmptyStateTitle>No contracts found</EmptyStateTitle>
      <EmptyStateDescription>
        Start by adding your first contract to get started.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button color="indigo">Add Contract</Button>
      </EmptyStateActions>
    </EmptyState>
  )
}

/**
 * Example 5: Empty State in a Card
 * Use this inside cards or panels
 */
export function EmptyStateInCard() {
  return (
    <div className="rounded-lg border border-gray-200 p-8 dark:border-white/10">
      <EmptyState>
        <EmptyStateIcon>
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 4.5v15m7.5-7.5h-15"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </EmptyStateIcon>
        <EmptyStateTitle>No opportunities</EmptyStateTitle>
        <EmptyStateDescription>
          Track government contracting opportunities here.
        </EmptyStateDescription>
        <EmptyStateActions>
          <Button color="indigo">Browse Opportunities</Button>
        </EmptyStateActions>
      </EmptyState>
    </div>
  )
}

/**
 * Example 6: Minimal Empty State (No Actions)
 * Use this for read-only empty states
 */
export function MinimalEmptyState() {
  return (
    <EmptyState>
      <EmptyStateIcon>
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </EmptyStateIcon>
      <EmptyStateTitle>No results found</EmptyStateTitle>
      <EmptyStateDescription>
        Try adjusting your search or filter to find what you're looking for.
      </EmptyStateDescription>
    </EmptyState>
  )
}
