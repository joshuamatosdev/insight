// Tailwind Plus UI Blocks - Dividers
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/layout/dividers
// Format: React JSX (v4.1)
// Downloaded automatically

import { HStack, Flex } from '@/components/catalyst/layout';
import { ChatBubbleBottomCenterTextIcon, PaperClipIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid';

// =============================================================================
// 1. With label
// =============================================================================
export function DividerWithLabel() {
  return (
    <HStack align="center">
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
      <Flex justify="center" className="relative">
        <span className="bg-white px-2 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">Continue</span>
      </Flex>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </HStack>
  );
}


// =============================================================================
// 2. With icon
// =============================================================================
export function DividerWithIcon() {
  return (
    <HStack align="center">
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
      <Flex justify="center" className="relative">
        <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <PlusIcon aria-hidden="true" className="size-5 text-gray-500 dark:text-gray-400" />
        </span>
      </Flex>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </HStack>
  );
}


// =============================================================================
// 3. With label on left
// =============================================================================
export function DividerWithLabelLeft() {
  return (
    <HStack align="center">
      <Flex justify="start" className="relative">
        <span className="bg-white pr-2 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">Continue</span>
      </Flex>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </HStack>
  );
}


// =============================================================================
// 4. With title
// =============================================================================
export function DividerWithTitle() {
  return (
    <HStack align="center">
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
      <Flex justify="center" className="relative">
        <span className="bg-white px-3 text-base font-semibold text-gray-900 dark:bg-gray-900 dark:text-white">
          Projects
        </span>
      </Flex>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </HStack>
  );
}


// =============================================================================
// 5. With title on left
// =============================================================================
export function DividerWithTitleLeft() {
  return (
    <HStack align="center">
      <Flex justify="start" className="relative">
        <span className="bg-white pr-3 text-base font-semibold text-gray-900 dark:bg-gray-900 dark:text-white">
          Projects
        </span>
      </Flex>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </HStack>
  );
}


// =============================================================================
// 6. With button
// =============================================================================
export function DividerWithButton() {
  return (
    <HStack align="center">
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
      <Flex justify="center" className="relative">
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
        >
          <PlusIcon aria-hidden="true" className="-mr-0.5 -ml-1 size-5 text-gray-400" />
          Button text
        </button>
      </Flex>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/10" />
    </HStack>
  );
}


// =============================================================================
// 7. With title and button
// =============================================================================
export function DividerWithTitleAndButton() {
  return (
    <Flex align="center" justify="between" className="relative">
      <span className="bg-white pr-3 text-base font-semibold text-gray-900 dark:bg-gray-900 dark:text-white">
        Projects
      </span>
      <HStack align="center" className="w-full">
        <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
        >
          <PlusIcon aria-hidden="true" className="-mr-0.5 -ml-1 size-5 text-gray-400" />
          <span>Button text</span>
        </button>
      </HStack>
    </Flex>
  );
}


// =============================================================================
// 8. With toolbar
// =============================================================================
export function DividerWithToolbar() {
  return (
    <HStack align="center">
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
      <Flex justify="center" className="relative">
        <span className="isolate inline-flex -space-x-px rounded-md shadow-xs dark:shadow-none">
          <button
            type="button"
            className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-gray-400 inset-ring inset-ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-white/5 dark:inset-ring-gray-700 dark:hover:bg-white/10"
          >
            <span className="sr-only">Edit</span>
            <PencilIcon aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            className="relative inline-flex items-center bg-white px-3 py-2 text-gray-400 inset-ring inset-ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-white/5 dark:inset-ring-gray-700 dark:hover:bg-white/10"
          >
            <span className="sr-only">Attachment</span>
            <PaperClipIcon aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            className="relative inline-flex items-center bg-white px-3 py-2 text-gray-400 inset-ring inset-ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-white/5 dark:inset-ring-gray-700 dark:hover:bg-white/10"
          >
            <span className="sr-only">Annotate</span>
            <ChatBubbleBottomCenterTextIcon aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            className="relative inline-flex items-center rounded-r-md bg-white px-3 py-2 text-gray-400 inset-ring inset-ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-white/5 dark:inset-ring-gray-700 dark:hover:bg-white/10"
          >
            <span className="sr-only">Delete</span>
            <TrashIcon aria-hidden="true" className="size-5" />
          </button>
        </span>
      </Flex>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </HStack>
  );
}


// Default export for backwards compatibility
export default DividerWithLabel;
