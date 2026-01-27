// Tailwind Plus UI Blocks - Cards
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/layout/cards
// Format: React JSX (v4.1)
// Downloaded automatically

import { Stack } from '@/components/catalyst/layout';

// =============================================================================
// 1. Basic card
// =============================================================================
export function BasicCard() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
    </div>
  );
}


// =============================================================================
// 2. Card, edge-to-edge on mobile
// =============================================================================
export function CardEdgeToEdge() {
  return (
    <>
      {/* Be sure to use this with a layout container that is full-width on mobile */}
      <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
        <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
      </div>
    </>
  );
}


// =============================================================================
// 3. Card with header
// =============================================================================
export function CardWithHeader() {
  return (
    <Stack spacing="none" className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <div className="px-4 py-5 sm:px-6">
        {/* Content goes here */}
        {/* We use less vertical padding on card headers on desktop than on body sections */}
      </div>
      <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
    </Stack>
  );
}


// =============================================================================
// 4. Card with footer
// =============================================================================
export function CardWithFooter() {
  return (
    <Stack spacing="none" className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
      <div className="px-4 py-4 sm:px-6">
        {/* Content goes here */}
        {/* We use less vertical padding on card footers at all sizes than on headers or body sections */}
      </div>
    </Stack>
  );
}


// =============================================================================
// 5. Card with header and footer
// =============================================================================
export function CardWithHeaderAndFooter() {
  return (
    <Stack spacing="none" className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <div className="px-4 py-5 sm:px-6">
        {/* Content goes here */}
        {/* We use less vertical padding on card headers on desktop than on body sections */}
      </div>
      <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
      <div className="px-4 py-4 sm:px-6">
        {/* Content goes here */}
        {/* We use less vertical padding on card footers at all sizes than on headers or body sections */}
      </div>
    </Stack>
  );
}


// =============================================================================
// 6. Card with gray footer
// =============================================================================
export function CardWithGrayFooter() {
  return (
    <Stack spacing="none" className="overflow-hidden rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6 dark:bg-gray-800/50">
        {/* Content goes here */}
        {/* We use less vertical padding on card footers at all sizes than on headers or body sections */}
      </div>
    </Stack>
  );
}


// =============================================================================
// 7. Card with gray body
// =============================================================================
export function CardWithGrayBody() {
  return (
    <Stack spacing="none" className="overflow-hidden rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <div className="px-4 py-5 sm:px-6">
        {/* Content goes here */}
        {/* We use less vertical padding on card headers on desktop than on body sections */}
      </div>
      <div className="bg-gray-50 px-4 py-5 sm:p-6 dark:bg-gray-800/50">{/* Content goes here */}</div>
    </Stack>
  );
}


// =============================================================================
// 8. Well
// =============================================================================
export function Well() {
  return (
    <div className="overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
    </div>
  );
}


// =============================================================================
// 9. Well on gray
// =============================================================================
export function WellOnGray() {
  return (
    <div className="overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800/50">
      <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
    </div>
  );
}


// =============================================================================
// 10. Well, edge-to-edge on mobile
// =============================================================================
export function WellEdgeToEdge() {
  return (
    <>
      {/* Be sure to use this with a layout container that is full-width on mobile */}
      <div className="overflow-hidden bg-gray-50 sm:rounded-lg dark:bg-gray-800/50">
        <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
      </div>
    </>
  );
}


// Default export for backwards compatibility
export default BasicCard;
