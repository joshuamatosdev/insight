// Tailwind Plus UI Blocks - Drawers
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/overlays/drawers
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. Empty
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                        Panel title
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">{/* Your content */}</div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 2. Wide empty
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-2xl transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                        Panel title
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">{/* Your content */}</div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 3. With background overlay
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0 dark:bg-gray-900/50"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                        Panel title
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">{/* Your content */}</div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 4. With close button on outside
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0 dark:bg-gray-900/50"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <TransitionChild>
                  <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 duration-500 ease-in-out data-closed:opacity-0 sm:-ml-10 sm:pr-4">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="relative rounded-md text-gray-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-gray-400 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                    >
                      <span className="absolute -inset-2.5" />
                      <span className="sr-only">Close panel</span>
                      <XMarkIcon aria-hidden="true" className="size-6" />
                    </button>
                  </div>
                </TransitionChild>
                <div className="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="px-4 sm:px-6">
                    <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                      Panel title
                    </DialogTitle>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">{/* Your content */}</div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 5. With branded header
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="relative flex h-full flex-col overflow-y-auto bg-white shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="bg-indigo-700 px-4 py-6 sm:px-6 dark:bg-indigo-800">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-base font-semibold text-white">Panel title</DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md text-indigo-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:text-indigo-300 dark:hover:text-white"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-indigo-300 dark:text-indigo-200">
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit aliquam ad hic recusandae soluta.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex-1 px-4 py-6 sm:px-6">{/* Your content */}</div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 6. With sticky footer
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="relative flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-6">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                          Panel title
                        </DialogTitle>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="size-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">{/* Your content */}</div>
                  </div>
                  <div className="flex shrink-0 justify-end px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:inset-ring-gray-400 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20 dark:hover:inset-ring-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 7. Create project form example
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { LinkIcon, PlusIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid'

const team = [
  {
    name: 'Tom Cook',
    email: 'tom.cook@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Whitney Francis',
    email: 'whitney.francis@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Leonard Krasner',
    email: 'leonard.krasner@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Floyd Miles',
    email: 'floyd.miles@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Emily Selman',
    email: 'emily.selman@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <form className="relative flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/10 dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="h-0 flex-1 overflow-y-auto">
                    <div className="bg-indigo-700 px-4 py-6 sm:px-6 dark:bg-indigo-800">
                      <div className="flex items-center justify-between">
                        <DialogTitle className="text-base font-semibold text-white">New project</DialogTitle>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="relative rounded-md text-indigo-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:text-indigo-300 dark:hover:text-white"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="size-6" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-indigo-300">
                          Get started by filling in the information below to create your new project.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="divide-y divide-gray-200 px-4 sm:px-6 dark:divide-white/10">
                        <div className="space-y-6 pt-6 pb-5">
                          <div>
                            <label
                              htmlFor="project-name"
                              className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
                            >
                              Project name
                            </label>
                            <div className="mt-2">
                              <input
                                id="project-name"
                                name="project-name"
                                type="text"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="project-description"
                              className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
                            >
                              Description
                            </label>
                            <div className="mt-2">
                              <textarea
                                id="project-description"
                                name="project-description"
                                rows={3}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                defaultValue={''}
                              />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Team Members</h3>
                            <div className="mt-2">
                              <div className="flex space-x-2">
                                {team.map((person) => (
                                  <a
                                    key={person.email}
                                    href={person.href}
                                    className="relative rounded-full hover:opacity-75"
                                  >
                                    <img
                                      alt={person.name}
                                      src={person.imageUrl}
                                      className="inline-block size-8 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                                    />
                                  </a>
                                ))}
                                <button
                                  type="button"
                                  className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-white/20 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-white/30 dark:hover:text-gray-200 dark:focus-visible:outline-indigo-500"
                                >
                                  <span className="absolute -inset-2" />
                                  <span className="sr-only">Add team member</span>
                                  <PlusIcon aria-hidden="true" className="size-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <fieldset>
                            <legend className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Privacy</legend>
                            <div className="mt-2 space-y-4">
                              <div className="relative flex items-start">
                                <div className="absolute flex h-6 items-center">
                                  <input
                                    defaultValue="public"
                                    defaultChecked
                                    id="privacy-public"
                                    name="privacy"
                                    type="radio"
                                    aria-describedby="privacy-public-description"
                                    className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/20 dark:bg-black/10 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/10 dark:disabled:bg-gray-800 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
                                  />
                                </div>
                                <div className="pl-7 text-sm/6">
                                  <label
                                    htmlFor="privacy-public"
                                    className="font-medium text-gray-900 dark:text-gray-100"
                                  >
                                    Public access
                                  </label>
                                  <p id="privacy-public-description" className="text-gray-500 dark:text-gray-400">
                                    Everyone with the link will see this project.
                                  </p>
                                </div>
                              </div>
                              <div>
                                <div className="relative flex items-start">
                                  <div className="absolute flex h-6 items-center">
                                    <input
                                      defaultValue="private-to-project"
                                      id="privacy-private-to-project"
                                      name="privacy"
                                      type="radio"
                                      aria-describedby="privacy-private-to-project-description"
                                      className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/20 dark:bg-black/10 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/10 dark:disabled:bg-gray-800 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
                                    />
                                  </div>
                                  <div className="pl-7 text-sm/6">
                                    <label
                                      htmlFor="privacy-private-to-project"
                                      className="font-medium text-gray-900 dark:text-gray-100"
                                    >
                                      Private to project members
                                    </label>
                                    <p
                                      id="privacy-private-to-project-description"
                                      className="text-gray-500 dark:text-gray-400"
                                    >
                                      Only members of this project would be able to access.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="relative flex items-start">
                                  <div className="absolute flex h-6 items-center">
                                    <input
                                      defaultValue="private"
                                      id="privacy-private"
                                      name="privacy"
                                      type="radio"
                                      aria-describedby="privacy-private-to-project-description"
                                      className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/20 dark:bg-black/10 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/10 dark:disabled:bg-gray-800 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
                                    />
                                  </div>
                                  <div className="pl-7 text-sm/6">
                                    <label
                                      htmlFor="privacy-private"
                                      className="font-medium text-gray-900 dark:text-gray-100"
                                    >
                                      Private to you
                                    </label>
                                    <p id="privacy-private-description" className="text-gray-500 dark:text-gray-400">
                                      You are the only one able to access this project.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                        <div className="pt-4 pb-6">
                          <div className="flex text-sm">
                            <a
                              href="#"
                              className="group inline-flex items-center font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <LinkIcon
                                aria-hidden="true"
                                className="size-5 text-indigo-500 group-hover:text-indigo-900 dark:text-indigo-400 dark:group-hover:text-indigo-300"
                              />
                              <span className="ml-2">Copy link</span>
                            </a>
                          </div>
                          <div className="mt-4 flex text-sm">
                            <a
                              href="#"
                              className="group inline-flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                              <QuestionMarkCircleIcon
                                aria-hidden="true"
                                className="size-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-300"
                              />
                              <span className="ml-2">Learn more about sharing</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 justify-end px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 8. Wide create project form example
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { LinkIcon, PlusIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid'

const team = [
  {
    name: 'Tom Cook',
    email: 'tom.cook@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Whitney Francis',
    email: 'whitney.francis@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Leonard Krasner',
    email: 'leonard.krasner@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Floyd Miles',
    email: 'floyd.miles@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Emily Selman',
    email: 'emily.selman@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-2xl transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <form className="relative flex h-full flex-col overflow-y-auto bg-white shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-6 sm:px-6 dark:bg-gray-800/50">
                      <div className="flex items-start justify-between space-x-3">
                        <div className="space-y-1">
                          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                            New project
                          </DialogTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get started by filling in the information below to create your new project.
                          </p>
                        </div>
                        <div className="flex h-7 items-center">
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="size-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Divider container */}
                    <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0 dark:sm:divide-white/10">
                      {/* Project name */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="project-name"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5 dark:text-white"
                          >
                            Project name
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            id="project-name"
                            name="project-name"
                            type="text"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Project description */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="project-description"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5 dark:text-white"
                          >
                            Description
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <textarea
                            id="project-description"
                            name="project-description"
                            rows={3}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                            defaultValue={''}
                          />
                        </div>
                      </div>

                      {/* Team members */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <h3 className="text-sm/6 font-medium text-gray-900 dark:text-white">Team Members</h3>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex space-x-2">
                            {team.map((person) => (
                              <a
                                key={person.email}
                                href={person.href}
                                className="shrink-0 rounded-full hover:opacity-75"
                              >
                                <img
                                  alt={person.name}
                                  src={person.imageUrl}
                                  className="inline-block size-8 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                                />
                              </a>
                            ))}

                            <button
                              type="button"
                              className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-white/20 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-white/30 dark:hover:text-gray-200 dark:focus-visible:outline-indigo-500"
                            >
                              <span className="absolute -inset-2" />
                              <span className="sr-only">Add team member</span>
                              <PlusIcon aria-hidden="true" className="size-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Privacy */}
                      <fieldset className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <legend className="sr-only">Privacy</legend>
                        <div aria-hidden="true" className="text-sm/6 font-medium text-gray-900 dark:text-white">
                          Privacy
                        </div>
                        <div className="space-y-5 sm:col-span-2">
                          <div className="space-y-5 sm:mt-0">
                            <div className="relative flex items-start">
                              <div className="absolute flex h-6 items-center">
                                <input
                                  defaultValue="public"
                                  defaultChecked
                                  id="privacy-public"
                                  name="privacy"
                                  type="radio"
                                  aria-describedby="privacy-public-description"
                                  className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/20 dark:bg-black/10 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/10 dark:disabled:bg-gray-800 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
                                />
                              </div>
                              <div className="pl-7 text-sm/6">
                                <label htmlFor="privacy-public" className="font-medium text-gray-900 dark:text-white">
                                  Public access
                                </label>
                                <p id="privacy-public-description" className="text-gray-500 dark:text-gray-400">
                                  Everyone with the link will see this project.
                                </p>
                              </div>
                            </div>
                            <div className="relative flex items-start">
                              <div className="absolute flex h-6 items-center">
                                <input
                                  defaultValue="private-to-project"
                                  id="privacy-private-to-project"
                                  name="privacy"
                                  type="radio"
                                  aria-describedby="privacy-private-to-project-description"
                                  className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/20 dark:bg-black/10 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/10 dark:disabled:bg-gray-800 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
                                />
                              </div>
                              <div className="pl-7 text-sm/6">
                                <label
                                  htmlFor="privacy-private-to-project"
                                  className="font-medium text-gray-900 dark:text-white"
                                >
                                  Private to project members
                                </label>
                                <p
                                  id="privacy-private-to-project-description"
                                  className="text-gray-500 dark:text-gray-400"
                                >
                                  Only members of this project would be able to access.
                                </p>
                              </div>
                            </div>
                            <div className="relative flex items-start">
                              <div className="absolute flex h-6 items-center">
                                <input
                                  defaultValue="private"
                                  id="privacy-private"
                                  name="privacy"
                                  type="radio"
                                  aria-describedby="privacy-private-to-project-description"
                                  className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/20 dark:bg-black/10 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/10 dark:disabled:bg-gray-800 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
                                />
                              </div>
                              <div className="pl-7 text-sm/6">
                                <label htmlFor="privacy-private" className="font-medium text-gray-900 dark:text-white">
                                  Private to you
                                </label>
                                <p id="privacy-private-description" className="text-gray-500 dark:text-gray-400">
                                  You are the only one able to access this project.
                                </p>
                              </div>
                            </div>
                          </div>
                          <hr className="border-gray-200 dark:border-white/10" />
                          <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div>
                              <a
                                href="#"
                                className="group flex items-center space-x-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                <LinkIcon
                                  aria-hidden="true"
                                  className="size-5 text-indigo-500 group-hover:text-indigo-900 dark:text-indigo-400 dark:group-hover:text-indigo-300"
                                />
                                <span>Copy link</span>
                              </a>
                            </div>
                            <div>
                              <a
                                href="#"
                                className="group flex items-center space-x-2.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                              >
                                <QuestionMarkCircleIcon
                                  aria-hidden="true"
                                  className="size-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400"
                                />
                                <span>Learn more about sharing</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6 dark:border-white/10">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </form>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 9. User profile example
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="relative flex h-full flex-col overflow-y-auto bg-white shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 id="slide-over-heading" className="text-base font-semibold text-gray-900 dark:text-white">
                        Profile
                      </h2>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Main */}
                  <div>
                    <div className="pb-1 sm:pb-6">
                      <div>
                        <div className="relative h-40 sm:h-56">
                          <img
                            alt=""
                            src="https://images.unsplash.com/photo-1501031170107-cfd33f0cbdcc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&h=600&q=80"
                            className="absolute size-full object-cover"
                          />
                        </div>
                        <div className="mt-6 px-4 sm:mt-8 sm:flex sm:items-end sm:px-6">
                          <div className="sm:flex-1">
                            <div>
                              <div className="flex items-center">
                                <h3 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                                  Ashley Porter
                                </h3>
                                <span className="ml-2.5 inline-block size-2 shrink-0 rounded-full bg-green-400">
                                  <span className="sr-only">Online</span>
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">@ashleyporter</p>
                            </div>
                            <div className="mt-5 flex flex-wrap space-y-3 sm:space-y-0 sm:space-x-3">
                              <button
                                type="button"
                                className="inline-flex w-full shrink-0 items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:flex-1 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                              >
                                Message
                              </button>
                              <button
                                type="button"
                                className="inline-flex w-full flex-1 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                              >
                                Call
                              </button>
                              <div className="ml-3 inline-flex sm:ml-0">
                                <Menu as="div" className="relative inline-block text-left">
                                  <MenuButton className="relative inline-flex items-center rounded-md bg-white p-2 text-gray-400 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20">
                                    <span className="absolute -inset-1" />
                                    <span className="sr-only">Open options menu</span>
                                    <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
                                  </MenuButton>
                                  <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10"
                                  >
                                    <div className="py-1">
                                      <MenuItem>
                                        <a
                                          href="#"
                                          className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                                        >
                                          View profile
                                        </a>
                                      </MenuItem>
                                      <MenuItem>
                                        <a
                                          href="#"
                                          className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                                        >
                                          Copy profile link
                                        </a>
                                      </MenuItem>
                                    </div>
                                  </MenuItems>
                                </Menu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pt-5 pb-5 sm:px-0 sm:pt-0">
                      <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
                        <div>
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 dark:text-gray-400">
                            Bio
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">
                            <p>
                              Enim feugiat ut ipsum, neque ut. Tristique mi id elementum praesent. Gravida in tempus
                              feugiat netus enim aliquet a, quam scelerisque. Dictumst in convallis nec in bibendum
                              aenean arcu.
                            </p>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 dark:text-gray-400">
                            Location
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">
                            New York, NY, USA
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 dark:text-gray-400">
                            Website
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">ashleyporter.com</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 dark:text-gray-400">
                            Birthday
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">
                            <time dateTime="1988-06-23">June 23, 1988</time>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 10. Wide horizontal user profile example
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-2xl transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="relative flex h-full flex-col overflow-y-auto bg-white shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                        Profile
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Main */}
                  <div className="divide-y divide-gray-200 dark:divide-white/10">
                    <div className="pb-6">
                      <div className="h-24 bg-indigo-700 sm:h-20 lg:h-28 dark:bg-indigo-600" />
                      <div className="-mt-12 flow-root px-4 sm:-mt-8 sm:flex sm:items-end sm:px-6 lg:-mt-16">
                        <div>
                          <div className="-m-1 flex">
                            <div className="inline-flex overflow-hidden rounded-lg border-4 border-white dark:border-gray-800">
                              <img
                                alt=""
                                src="https://images.unsplash.com/photo-1501031170107-cfd33f0cbdcc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80"
                                className="size-24 shrink-0 bg-gray-100 outline -outline-offset-1 outline-black/5 sm:size-40 lg:size-48 dark:bg-gray-800 dark:outline-white/10"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 sm:ml-6 sm:flex-1">
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                                Ashley Porter
                              </h3>
                              <span className="ml-2.5 inline-block size-2 shrink-0 rounded-full bg-green-400">
                                <span className="sr-only">Online</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">@ashleyporter</p>
                          </div>
                          <div className="mt-5 flex flex-wrap space-y-3 sm:space-y-0 sm:space-x-3">
                            <button
                              type="button"
                              className="inline-flex w-full shrink-0 items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:flex-1 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                            >
                              Message
                            </button>
                            <button
                              type="button"
                              className="inline-flex w-full flex-1 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                            >
                              Call
                            </button>
                            <div className="ml-3 inline-flex sm:ml-0">
                              <Menu as="div" className="relative inline-block text-left">
                                <MenuButton className="relative inline-flex items-center rounded-md bg-white p-2 text-gray-400 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20">
                                  <span className="absolute -inset-1" />
                                  <span className="sr-only">Open options menu</span>
                                  <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
                                </MenuButton>
                                <MenuItems
                                  transition
                                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10"
                                >
                                  <div className="py-1">
                                    <MenuItem>
                                      <a
                                        href="#"
                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                                      >
                                        View profile
                                      </a>
                                    </MenuItem>
                                    <MenuItem>
                                      <a
                                        href="#"
                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                                      >
                                        Copy profile link
                                      </a>
                                    </MenuItem>
                                  </div>
                                </MenuItems>
                              </Menu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-5 sm:px-0 sm:py-0">
                      <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200 dark:sm:divide-white/10">
                        <div className="sm:flex sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48 dark:text-gray-400">
                            Bio
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6 dark:text-white">
                            <p>
                              Enim feugiat ut ipsum, neque ut. Tristique mi id elementum praesent. Gravida in tempus
                              feugiat netus enim aliquet a, quam scelerisque. Dictumst in convallis nec in bibendum
                              aenean arcu.
                            </p>
                          </dd>
                        </div>
                        <div className="sm:flex sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48 dark:text-gray-400">
                            Location
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6 dark:text-white">
                            New York, NY, USA
                          </dd>
                        </div>
                        <div className="sm:flex sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48 dark:text-gray-400">
                            Website
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6 dark:text-white">
                            ashleyporter.com
                          </dd>
                        </div>
                        <div className="sm:flex sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48 dark:text-gray-400">
                            Birthday
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6 dark:text-white">
                            <time dateTime="1982-06-23">June 23, 1982</time>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 11. Contact list example
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'

const tabs = [
  { name: 'All', href: '#', current: true },
  { name: 'Online', href: '#', current: false },
  { name: 'Offline', href: '#', current: false },
]
const team = [
  {
    name: 'Leslie Alexander',
    handle: 'lesliealexander',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Michael Foster',
    handle: 'michaelfoster',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Dries Vincent',
    handle: 'driesvincent',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Lindsay Walton',
    handle: 'lindsaywalton',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Courtney Henry',
    handle: 'courtneyhenry',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Tom Cook',
    handle: 'tomcook',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Whitney Francis',
    handle: 'whitneyfrancis',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Leonard Krasner',
    handle: 'leonardkrasner',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Floyd Miles',
    handle: 'floydmiles',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Emily Selman',
    handle: 'emilyselman',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Kristin Watson',
    handle: 'kristinwatson',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Emma Dorsey',
    handle: 'emmadorsey',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1505840717430-882ce147ef2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Alicia Bell',
    handle: 'aliciabell',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Jenny Wilson',
    handle: 'jennywilson',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1507101105822-7472b28e22ac?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Anna Roberts',
    handle: 'annaroberts',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Benjamin Russel',
    handle: 'benjaminrussel',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Jeffrey Webb',
    handle: 'jeffreywebb',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Kathryn Murphy',
    handle: 'kathrynmurphy',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="relative flex h-full flex-col overflow-y-auto bg-white shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">Team</DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border-b border-gray-200 dark:border-white/10">
                    <div className="px-6">
                      <nav className="-mb-px flex space-x-6">
                        {tabs.map((tab) => (
                          <a
                            key={tab.name}
                            href={tab.href}
                            className={classNames(
                              tab.current
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
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
                  <ul role="list" className="flex-1 divide-y divide-gray-200 overflow-y-auto dark:divide-white/10">
                    {team.map((person) => (
                      <li key={person.handle}>
                        <div className="group relative flex items-center px-5 py-6">
                          <a href={person.href} className="-m-1 block flex-1 p-1">
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 group-hover:bg-gray-50 dark:group-hover:bg-white/2.5"
                            />
                            <div className="relative flex min-w-0 flex-1 items-center">
                              <span className="relative inline-block shrink-0">
                                <img
                                  alt=""
                                  src={person.imageUrl}
                                  className="size-10 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                                />
                                <span
                                  aria-hidden="true"
                                  className={classNames(
                                    person.status === 'online' ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-500',
                                    'absolute top-0 right-0 block size-2.5 rounded-full ring-2 ring-white dark:ring-gray-800',
                                  )}
                                />
                              </span>
                              <div className="ml-4 truncate">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                  {person.name}
                                </p>
                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                  {'@' + person.handle}
                                </p>
                              </div>
                            </div>
                          </a>
                          <Menu as="div" className="relative ml-2 inline-block shrink-0 text-left">
                            <MenuButton className="group relative inline-flex size-8 items-center justify-center rounded-full bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-gray-800 dark:focus-visible:outline-indigo-500">
                              <span className="absolute -inset-1.5" />
                              <span className="sr-only">Open options menu</span>
                              <span className="flex size-full items-center justify-center rounded-full">
                                <EllipsisVerticalIcon
                                  aria-hidden="true"
                                  className="size-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                                />
                              </span>
                            </MenuButton>
                            <MenuItems
                              transition
                              className="absolute top-0 right-full z-10 mr-1 w-48 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10"
                            >
                              <div className="py-1">
                                <MenuItem>
                                  <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                                  >
                                    View profile
                                  </a>
                                </MenuItem>
                                <MenuItem>
                                  <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                                  >
                                    Send message
                                  </a>
                                </MenuItem>
                              </div>
                            </MenuItems>
                          </Menu>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


// =============================================================================
// 12. File details example
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PencilIcon, PlusIcon } from '@heroicons/react/20/solid'

export default function Example() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
      >
        Open drawer
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0 dark:bg-gray-900/50"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto relative w-96 transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <TransitionChild>
                  <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 duration-500 ease-in-out data-closed:opacity-0 sm:-ml-10 sm:pr-4">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="relative rounded-md text-gray-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-gray-400 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                    >
                      <span className="absolute -inset-2.5" />
                      <span className="sr-only">Close panel</span>
                      <XMarkIcon aria-hidden="true" className="size-6" />
                    </button>
                  </div>
                </TransitionChild>
                <div className="relative h-full overflow-y-auto bg-white p-8 dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                  <div className="space-y-6 pb-16">
                    <div>
                      <img
                        alt=""
                        src="https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80"
                        className="block aspect-10/7 w-full rounded-lg bg-gray-100 object-cover outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                      />
                      <div className="mt-4 flex items-start justify-between">
                        <div>
                          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            <span className="sr-only">Details for </span>IMG_4985.HEIC
                          </h2>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">3.9 MB</p>
                        </div>
                        <button
                          type="button"
                          className="relative ml-4 flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                        >
                          <span className="absolute -inset-1.5" />
                          <HeartIcon aria-hidden="true" className="size-6" />
                          <span className="sr-only">Favorite</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Information</h3>
                      <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200 dark:divide-white/10 dark:border-white/10">
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500 dark:text-gray-400">Uploaded by</dt>
                          <dd className="text-gray-900 dark:text-white">Marie Culver</dd>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                          <dd className="text-gray-900 dark:text-white">June 8, 2020</dd>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500 dark:text-gray-400">Last modified</dt>
                          <dd className="text-gray-900 dark:text-white">June 8, 2020</dd>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500 dark:text-gray-400">Dimensions</dt>
                          <dd className="text-gray-900 dark:text-white">4032 x 3024</dd>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500 dark:text-gray-400">Resolution</dt>
                          <dd className="text-gray-900 dark:text-white">72 x 72</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Description</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-gray-500 italic dark:text-gray-400">
                          Add a description to this image.
                        </p>
                        <button
                          type="button"
                          className="relative -mr-2 flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                        >
                          <span className="absolute -inset-1.5" />
                          <PencilIcon aria-hidden="true" className="size-5" />
                          <span className="sr-only">Add description</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Shared with</h3>
                      <ul
                        role="list"
                        className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200 dark:divide-white/10 dark:border-white/10"
                      >
                        <li className="flex items-center justify-between py-3">
                          <div className="flex items-center">
                            <img
                              alt=""
                              src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=1024&h=1024&q=80"
                              className="size-8 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                            />
                            <p className="ml-4 text-sm font-medium text-gray-900 dark:text-white">Aimee Douglas</p>
                          </div>
                          <button
                            type="button"
                            className="ml-6 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 dark:focus-visible:outline-indigo-500"
                          >
                            Remove<span className="sr-only"> Aimee Douglas</span>
                          </button>
                        </li>
                        <li className="flex items-center justify-between py-3">
                          <div className="flex items-center">
                            <img
                              alt=""
                              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixqx=oilqXxSqey&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                              className="size-8 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                            />
                            <p className="ml-4 text-sm font-medium text-gray-900 dark:text-white">Andrea McMillan</p>
                          </div>
                          <button
                            type="button"
                            className="ml-6 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 dark:focus-visible:outline-indigo-500"
                          >
                            Remove<span className="sr-only"> Andrea McMillan</span>
                          </button>
                        </li>
                        <li className="flex items-center justify-between py-2">
                          <button
                            type="button"
                            className="group -ml-1 flex items-center rounded-md p-1 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500"
                          >
                            <span className="flex size-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 dark:border-white/20">
                              <PlusIcon aria-hidden="true" className="size-5" />
                            </span>
                            <span className="ml-4 text-sm font-medium text-indigo-600 group-hover:text-indigo-500 dark:text-indigo-400 dark:group-hover:text-indigo-300">
                              Share
                            </span>
                          </button>
                        </li>
                      </ul>
                    </div>
                    <div className="flex">
                      <button
                        type="button"
                        className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        className="ml-3 flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}


