// Tailwind Plus UI Blocks - Dividers
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/layout/dividers
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. With label
// =============================================================================
export default function Example() {
  return (
    <div className="flex items-center">
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
      <div className="relative flex justify-center">
        <span className="bg-white px-2 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">Continue</span>
      </div>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </div>
  )
}


// =============================================================================
// 2. With icon
// =============================================================================
import { PlusIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="flex items-center">
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
      <div className="relative flex justify-center">
        <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <PlusIcon aria-hidden="true" className="size-5 text-gray-500 dark:text-gray-400" />
        </span>
      </div>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </div>
  )
}


// =============================================================================
// 3. With label on left
// =============================================================================
export default function Example() {
  return (
    <div className="flex items-center">
      <div className="relative flex justify-start">
        <span className="bg-white pr-2 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">Continue</span>
      </div>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </div>
  )
}


// =============================================================================
// 4. With title
// =============================================================================
export default function Example() {
  return (
    <div className="flex items-center">
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-base font-semibold text-gray-900 dark:bg-gray-900 dark:text-white">
          Projects
        </span>
      </div>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </div>
  )
}


// =============================================================================
// 5. With title on left
// =============================================================================
export default function Example() {
  return (
    <div className="flex items-center">
      <div className="relative flex justify-start">
        <span className="bg-white pr-3 text-base font-semibold text-gray-900 dark:bg-gray-900 dark:text-white">
          Projects
        </span>
      </div>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </div>
  )
}


// =============================================================================
// 6. With button
// =============================================================================
import { PlusIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="flex items-center">
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
      <div className="relative flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
        >
          <PlusIcon aria-hidden="true" className="-mr-0.5 -ml-1 size-5 text-gray-400" />
          Button text
        </button>
      </div>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/10" />
    </div>
  )
}


// =============================================================================
// 7. With title and button
// =============================================================================
import { PlusIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="relative flex items-center justify-between">
      <span className="bg-white pr-3 text-base font-semibold text-gray-900 dark:bg-gray-900 dark:text-white">
        Projects
      </span>
      <div className="flex w-full items-center">
        <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
        >
          <PlusIcon aria-hidden="true" className="-mr-0.5 -ml-1 size-5 text-gray-400" />
          <span>Button text</span>
        </button>
      </div>
    </div>
  )
}


// =============================================================================
// 8. With toolbar
// =============================================================================
import { ChatBubbleBottomCenterTextIcon, PaperClipIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="flex items-center">
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
      <div className="relative flex justify-center">
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
      </div>
      <div aria-hidden="true" className="w-full border-t border-gray-300 dark:border-white/15" />
    </div>
  )
}


