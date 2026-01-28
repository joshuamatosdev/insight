// Tailwind Plus UI Blocks - Section Headings
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/headings/section-headings
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. Simple
// =============================================================================
export default function Example() {
  return (
    <div className="border-b border-gray-200 pb-5 dark:border-white/10">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Job Postings</h3>
    </div>
  )
}


// =============================================================================
// 2. With description
// =============================================================================
export default function Example() {
  return (
    <div className="border-b border-gray-200 pb-5 dark:border-white/10">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Job Postings</h3>
      <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
        Workcation is a property rental website. Etiam ullamcorper massa viverra consequat, consectetur id nulla tempus.
        Fringilla egestas justo massa purus sagittis malesuada.
      </p>
    </div>
  )
}


// =============================================================================
// 3. With actions
// =============================================================================
export default function Example() {
  return (
    <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between dark:border-white/10">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Job Postings</h3>
      <div className="mt-3 flex sm:mt-0 sm:ml-4">
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
        >
          Share
        </button>
        <button
          type="button"
          className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
        >
          Create
        </button>
      </div>
    </div>
  )
}


// =============================================================================
// 4. With action
// =============================================================================
export default function Example() {
  return (
    <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between dark:border-white/10">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Job Postings</h3>
      <div className="mt-3 sm:mt-0 sm:ml-4">
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
        >
          Create new job
        </button>
      </div>
    </div>
  )
}


// =============================================================================
// 5. With input group
// =============================================================================
import { BarsArrowUpIcon, MagnifyingGlassIcon } from '@heroicons/react/16/solid'

export default function Example() {
  return (
    <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between dark:border-white/10">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Job Postings</h3>
      <div className="mt-3 flex sm:mt-0 sm:ml-4">
        <div className="-mr-px grid grow grid-cols-1 focus-within:relative">
          <input
            id="query"
            name="query"
            type="text"
            placeholder="Search candidates"
            aria-label="Search candidates"
            className="col-start-1 row-start-1 block w-full rounded-l-md bg-white py-1.5 pr-3 pl-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:pl-9 sm:text-sm/6 dark:bg-gray-800/50 dark:text-white dark:outline-gray-700 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
          />
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4"
          />
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-x-1.5 rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-50 focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/10 dark:text-white dark:outline-gray-700 dark:hover:bg-white/20 dark:focus:outline-indigo-500"
        >
          <BarsArrowUpIcon aria-hidden="true" className="-ml-0.5 size-4 text-gray-400" />
          Sort
        </button>
      </div>
    </div>
  )
}


// =============================================================================
// 6. With tabs
// =============================================================================
import { ChevronDownIcon } from '@heroicons/react/16/solid'

const tabs = [
  { name: 'Applied', href: '#', current: false },
  { name: 'Phone Screening', href: '#', current: false },
  { name: 'Interview', href: '#', current: true },
  { name: 'Offer', href: '#', current: false },
  { name: 'Hired', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="border-b border-gray-200 pb-5 sm:pb-0 dark:border-white/10">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Candidates</h3>
      <div className="mt-3 sm:mt-4">
        <div className="grid grid-cols-1 sm:hidden">
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            defaultValue={tabs.find((tab) => tab.current).name}
            aria-label="Select a tab"
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-white"
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500 dark:fill-gray-400"
          />
        </div>
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                aria-current={tab.current ? 'page' : undefined}
                className={classNames(
                  tab.current
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white',
                  'border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap',
                )}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 7. With actions and tabs
// =============================================================================
import { ChevronDownIcon } from '@heroicons/react/16/solid'

const tabs = [
  { name: 'Applied', href: '#', current: false },
  { name: 'Phone Screening', href: '#', current: false },
  { name: 'Interview', href: '#', current: true },
  { name: 'Offer', href: '#', current: false },
  { name: 'Hired', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="relative border-b border-gray-200 pb-5 sm:pb-0 dark:border-white/10">
      <div className="md:flex md:items-center md:justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Candidates</h3>
        <div className="mt-3 flex md:absolute md:top-3 md:right-0 md:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
          >
            Share
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Create
          </button>
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:hidden">
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            defaultValue={tabs.find((tab) => tab.current).name}
            aria-label="Select a tab"
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-white"
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500 dark:fill-gray-400"
          />
        </div>
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                aria-current={tab.current ? 'page' : undefined}
                className={classNames(
                  tab.current
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white',
                  'border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap',
                )}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 8. With inline tabs
// =============================================================================
const tabs = [
  { name: 'Open', href: '#', current: true },
  { name: 'Closed', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="border-b border-gray-200 dark:border-white/10">
      <div className="sm:flex sm:items-baseline">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Issues</h3>
        <div className="mt-4 sm:mt-0 sm:ml-10">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                aria-current={tab.current ? 'page' : undefined}
                className={classNames(
                  tab.current
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white',
                  'border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap',
                )}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 9. With label
// =============================================================================
export default function Example() {
  return (
    <div className="border-b border-gray-200 pb-5 dark:border-white/10">
      <div className="-mt-2 -ml-2 flex flex-wrap items-baseline">
        <h3 className="mt-2 ml-2 text-base font-semibold text-gray-900 dark:text-white">Job Postings</h3>
        <p className="mt-1 ml-2 truncate text-sm text-gray-500 dark:text-gray-400">in Engineering</p>
      </div>
    </div>
  )
}


// =============================================================================
// 10. With badge and dropdown
// =============================================================================
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="border-b border-gray-200 pb-5 dark:border-white/10">
      <div className="sm:flex sm:items-baseline sm:justify-between">
        <div className="sm:w-0 sm:flex-1">
          <h1 id="message-heading" className="text-base font-semibold text-gray-900 dark:text-white">
            Full-Stack Developer
          </h1>
          <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">Checkout and Payments Team</p>
        </div>

        <div className="mt-4 flex items-center justify-between sm:mt-0 sm:ml-6 sm:shrink-0 sm:justify-start">
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 inset-ring inset-ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:inset-ring-green-500/10">
            Open
          </span>
          <div className="-my-2 ml-3 inline-block text-left">
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center rounded-full p-2 text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:hover:text-gray-300">
                <span className="sr-only">Open options</span>
                <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="flex justify-between px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      <span>Edit</span>
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="flex justify-between px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      <span>Duplicate</span>
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <button
                      type="button"
                      className="flex w-full justify-between px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      <span>Archive</span>
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  )
}


