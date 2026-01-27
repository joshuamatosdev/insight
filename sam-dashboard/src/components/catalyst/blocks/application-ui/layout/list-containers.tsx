// Tailwind Plus UI Blocks - List Containers
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/layout/list-containers
// Format: React JSX (v4.1)
// Downloaded automatically

import { Stack } from '@/components/catalyst/layout';
import type { ReactNode } from 'react';

// =============================================================================
// 1. Simple with dividers
// =============================================================================
const items1 = [{ id: 1 }, { id: 2 }, { id: 3 }];

export function ListContainerSimple() {
  return (
    <ul role="list" className="divide-y divide-gray-200 dark:divide-white/10">
      {items1.map((item) => (
        <li key={item.id} className="py-4">
          {/* Your content */}
        </li>
      ))}
    </ul>
  );
}


// =============================================================================
// 2. Card with dividers
// =============================================================================
const items2 = [{ id: 1 }, { id: 2 }, { id: 3 }];

export function ListContainerCardDividers() {
  return (
    <div className="overflow-hidden rounded-md bg-white shadow-sm dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-0 dark:outline-white/10">
      <ul role="list" className="divide-y divide-gray-200 dark:divide-white/10">
        {items2.map((item) => (
          <li key={item.id} className="px-6 py-4">
            {/* Your content */}
          </li>
        ))}
      </ul>
    </div>
  );
}


// =============================================================================
// 3. Card with dividers, full-width on mobile
// =============================================================================
const items3 = [{ id: 1 }, { id: 2 }, { id: 3 }];

export function ListContainerCardFullWidth() {
  return (
    <div className="overflow-hidden bg-white shadow-sm sm:rounded-md dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <ul role="list" className="divide-y divide-gray-200 dark:divide-white/10">
        {items3.map((item) => (
          <li key={item.id} className="px-4 py-4 sm:px-6">
            {/* Your content */}
          </li>
        ))}
      </ul>
    </div>
  );
}


// =============================================================================
// 4. Separate cards
// =============================================================================
const items4 = [{ id: 1 }, { id: 2 }, { id: 3 }];

export function ListContainerSeparateCards() {
  return (
    <Stack spacing="sm" as="ul" role="list">
      {items4.map((item) => (
        <li
          key={item.id}
          className="overflow-hidden rounded-md bg-white px-6 py-4 shadow-sm dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10"
        >
          {/* Your content */}
        </li>
      ))}
    </Stack>
  );
}


// =============================================================================
// 5. Separate cards, full-width on mobile
// =============================================================================
const items5 = [{ id: 1 }, { id: 2 }, { id: 3 }];

export function ListContainerSeparateCardsFullWidth() {
  return (
    <Stack spacing="sm" as="ul" role="list">
      {items5.map((item) => (
        <li
          key={item.id}
          className="overflow-hidden bg-white px-4 py-4 shadow-sm sm:rounded-md sm:px-6 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10"
        >
          {/* Your content */}
        </li>
      ))}
    </Stack>
  );
}


// =============================================================================
// 6. Flat card with dividers
// =============================================================================
const items6 = [{ id: 1 }, { id: 2 }, { id: 3 }];

export function ListContainerFlatCard() {
  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white dark:border-white/10 dark:bg-gray-900">
      <ul role="list" className="divide-y divide-gray-300 dark:divide-white/10">
        {items6.map((item) => (
          <li key={item.id} className="px-6 py-4">
            {/* Your content */}
          </li>
        ))}
      </ul>
    </div>
  );
}


// =============================================================================
// 7. Simple with dividers, full-width on mobile
// =============================================================================
const items7 = [{ id: 1 }, { id: 2 }, { id: 3 }];

export function ListContainerSimpleFullWidth() {
  return (
    <ul role="list" className="divide-y divide-gray-200 dark:divide-white/10">
      {items7.map((item) => (
        <li key={item.id} className="px-4 py-4 sm:px-0">
          {/* Your content */}
        </li>
      ))}
    </ul>
  );
}


// Default export for backwards compatibility
export default ListContainerSimple;
