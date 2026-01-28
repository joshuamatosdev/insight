// Tailwind Plus UI Blocks - Feeds
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/lists/feeds
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. Simple with icons
// =============================================================================
import { CheckIcon, HandThumbUpIcon, UserIcon } from '@heroicons/react/20/solid'

const timeline = [
  {
    id: 1,
    content: 'Applied to',
    target: 'Front End Developer',
    href: '#',
    date: 'Sep 20',
    datetime: '2020-09-20',
    icon: UserIcon,
    iconBackground: 'bg-gray-400 dark:bg-gray-600',
  },
  {
    id: 2,
    content: 'Advanced to phone screening by',
    target: 'Bethany Blake',
    href: '#',
    date: 'Sep 22',
    datetime: '2020-09-22',
    icon: HandThumbUpIcon,
    iconBackground: 'bg-blue-500',
  },
  {
    id: 3,
    content: 'Completed phone screening with',
    target: 'Martha Gardner',
    href: '#',
    date: 'Sep 28',
    datetime: '2020-09-28',
    icon: CheckIcon,
    iconBackground: 'bg-green-500',
  },
  {
    id: 4,
    content: 'Advanced to interview by',
    target: 'Bethany Blake',
    href: '#',
    date: 'Sep 30',
    datetime: '2020-09-30',
    icon: HandThumbUpIcon,
    iconBackground: 'bg-blue-500',
  },
  {
    id: 5,
    content: 'Completed interview with',
    target: 'Katherine Snyder',
    href: '#',
    date: 'Oct 4',
    datetime: '2020-10-04',
    icon: CheckIcon,
    iconBackground: 'bg-green-500',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {timeline.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== timeline.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-white/10"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={classNames(
                      event.iconBackground,
                      'flex size-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900',
                    )}
                  >
                    <event.icon aria-hidden="true" className="size-5 text-white" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.content}{' '}
                      <a href={event.href} className="font-medium text-gray-900 dark:text-white">
                        {event.target}
                      </a>
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    <time dateTime={event.datetime}>{event.date}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}


// =============================================================================
// 2. With comments
// =============================================================================
'use client'

import { useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import {
  FaceFrownIcon,
  FaceSmileIcon,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  PaperClipIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

const activity = [
  { id: 1, type: 'created', person: { name: 'Chelsea Hagon' }, date: '7d ago', dateTime: '2023-01-23T10:32' },
  { id: 2, type: 'edited', person: { name: 'Chelsea Hagon' }, date: '6d ago', dateTime: '2023-01-23T11:03' },
  { id: 3, type: 'sent', person: { name: 'Chelsea Hagon' }, date: '6d ago', dateTime: '2023-01-23T11:24' },
  {
    id: 4,
    type: 'commented',
    person: {
      name: 'Chelsea Hagon',
      imageUrl:
        'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    comment: 'Called client, they reassured me the invoice would be paid by the 25th.',
    date: '3d ago',
    dateTime: '2023-01-23T15:56',
  },
  { id: 5, type: 'viewed', person: { name: 'Alex Curren' }, date: '2d ago', dateTime: '2023-01-24T09:12' },
  { id: 6, type: 'paid', person: { name: 'Alex Curren' }, date: '1d ago', dateTime: '2023-01-24T09:20' },
]
const moods = [
  { name: 'Excited', value: 'excited', icon: FireIcon, iconColor: 'text-white', bgColor: 'bg-red-500' },
  { name: 'Loved', value: 'loved', icon: HeartIcon, iconColor: 'text-white', bgColor: 'bg-pink-400' },
  { name: 'Happy', value: 'happy', icon: FaceSmileIcon, iconColor: 'text-white', bgColor: 'bg-green-400' },
  { name: 'Sad', value: 'sad', icon: FaceFrownIcon, iconColor: 'text-white', bgColor: 'bg-yellow-400' },
  { name: 'Thumbsy', value: 'thumbsy', icon: HandThumbUpIcon, iconColor: 'text-white', bgColor: 'bg-blue-500' },
  {
    name: 'I feel nothing',
    value: null,
    icon: XMarkIcon,
    iconColor: 'text-gray-400 dark:text-gray-500',
    bgColor: 'bg-transparent',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [selected, setSelected] = useState(moods[5])

  return (
    <>
      <ul role="list" className="space-y-6">
        {activity.map((activityItem, activityItemIdx) => (
          <li key={activityItem.id} className="relative flex gap-x-4">
            <div
              className={classNames(
                activityItemIdx === activity.length - 1 ? 'h-6' : '-bottom-6',
                'absolute top-0 left-0 flex w-6 justify-center',
              )}
            >
              <div className="w-px bg-gray-200 dark:bg-white/15" />
            </div>
            {activityItem.type === 'commented' ? (
              <>
                <img
                  alt=""
                  src={activityItem.person.imageUrl}
                  className="relative mt-3 size-6 flex-none rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                />
                <div className="flex-auto rounded-md p-3 ring-1 ring-gray-200 ring-inset dark:ring-white/15">
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs/5 text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">{activityItem.person.name}</span>{' '}
                      commented
                    </div>
                    <time
                      dateTime={activityItem.dateTime}
                      className="flex-none py-0.5 text-xs/5 text-gray-500 dark:text-gray-400"
                    >
                      {activityItem.date}
                    </time>
                  </div>
                  <p className="text-sm/6 text-gray-500 dark:text-gray-400">{activityItem.comment}</p>
                </div>
              </>
            ) : (
              <>
                <div className="relative flex size-6 flex-none items-center justify-center bg-white dark:bg-gray-900">
                  {activityItem.type === 'paid' ? (
                    <CheckCircleIcon aria-hidden="true" className="size-6 text-indigo-600 dark:text-indigo-500" />
                  ) : (
                    <div className="size-1.5 rounded-full bg-gray-100 ring ring-gray-300 dark:bg-white/10 dark:ring-white/20" />
                  )}
                </div>
                <p className="flex-auto py-0.5 text-xs/5 text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">{activityItem.person.name}</span>{' '}
                  {activityItem.type} the invoice.
                </p>
                <time
                  dateTime={activityItem.dateTime}
                  className="flex-none py-0.5 text-xs/5 text-gray-500 dark:text-gray-400"
                >
                  {activityItem.date}
                </time>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* New comment form */}
      <div className="mt-6 flex gap-x-3">
        <img
          alt=""
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          className="size-6 flex-none rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
        />
        <form action="#" className="relative flex-auto">
          <div className="overflow-hidden rounded-lg pb-12 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-indigo-500">
            <label htmlFor="comment" className="sr-only">
              Add your comment
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={2}
              placeholder="Add your comment..."
              className="block w-full resize-none bg-transparent px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:text-white dark:placeholder:text-gray-500"
              defaultValue={''}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pr-2 pl-3">
            <div className="flex items-center space-x-5">
              <div className="flex items-center">
                <button
                  type="button"
                  className="-m-2.5 flex size-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-white"
                >
                  <PaperClipIcon aria-hidden="true" className="size-5" />
                  <span className="sr-only">Attach a file</span>
                </button>
              </div>
              <div className="flex items-center">
                <Listbox value={selected} onChange={setSelected}>
                  <Label className="sr-only">Your mood</Label>
                  <div className="relative">
                    <ListboxButton className="relative -m-2.5 flex size-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-white">
                      <span className="flex items-center justify-center">
                        {selected.value === null ? (
                          <span>
                            <FaceSmileIcon aria-hidden="true" className="size-5 shrink-0" />
                            <span className="sr-only">Add your mood</span>
                          </span>
                        ) : (
                          <span>
                            <span
                              className={classNames(
                                selected.bgColor,
                                'flex size-8 items-center justify-center rounded-full',
                              )}
                            >
                              <selected.icon aria-hidden="true" className="size-5 shrink-0 text-white" />
                            </span>
                            <span className="sr-only">{selected.name}</span>
                          </span>
                        )}
                      </span>
                    </ListboxButton>

                    <ListboxOptions
                      transition
                      className="absolute bottom-10 z-10 -ml-6 w-60 rounded-lg bg-white py-3 text-base shadow-sm outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:ml-auto sm:w-64 sm:text-sm dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                    >
                      {moods.map((mood) => (
                        <ListboxOption
                          key={mood.value}
                          value={mood}
                          className="relative cursor-default bg-white px-3 py-2 text-gray-900 select-none data-focus:bg-gray-100 dark:bg-transparent dark:text-white dark:data-focus:bg-white/5"
                        >
                          <div className="flex items-center">
                            <div
                              className={classNames(
                                mood.bgColor,
                                'flex size-8 items-center justify-center rounded-full',
                              )}
                            >
                              <mood.icon aria-hidden="true" className={classNames(mood.iconColor, 'size-5 shrink-0')} />
                            </div>
                            <span className="ml-3 block truncate font-medium">{mood.name}</span>
                          </div>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
            </div>
            <button
              type="submit"
              className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
            >
              Comment
            </button>
          </div>
        </form>
      </div>
    </>
  )
}


// =============================================================================
// 3. With multiple item types
// =============================================================================
import { Fragment } from 'react'
import { ChatBubbleLeftEllipsisIcon, TagIcon, UserCircleIcon } from '@heroicons/react/20/solid'

const activity = [
  {
    id: 1,
    type: 'comment',
    person: { name: 'Eduardo Benz', href: '#' },
    imageUrl:
      'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    comment:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam.',
    date: '6d ago',
  },
  {
    id: 2,
    type: 'assignment',
    person: { name: 'Hilary Mahy', href: '#' },
    assigned: { name: 'Kristin Watson', href: '#' },
    date: '2d ago',
  },
  {
    id: 3,
    type: 'tags',
    person: { name: 'Hilary Mahy', href: '#' },
    tags: [
      { name: 'Bug', href: '#', color: 'fill-red-500' },
      { name: 'Accessibility', href: '#', color: 'fill-indigo-500' },
    ],
    date: '6h ago',
  },
  {
    id: 4,
    type: 'comment',
    person: { name: 'Jason Meyers', href: '#' },
    imageUrl:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    comment:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
    date: '2h ago',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activity.map((activityItem, activityItemIdx) => (
          <li key={activityItem.id}>
            <div className="relative pb-8">
              {activityItemIdx !== activity.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-white/10"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                {activityItem.type === 'comment' ? (
                  <>
                    <div className="relative">
                      <img
                        alt=""
                        src={activityItem.imageUrl}
                        className="flex size-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white outline -outline-offset-1 outline-black/5 dark:ring-gray-900 dark:outline-white/10"
                      />

                      <span className="absolute -right-1 -bottom-0.5 rounded-tl bg-white px-0.5 py-px dark:bg-gray-900">
                        <ChatBubbleLeftEllipsisIcon aria-hidden="true" className="size-5 text-gray-400" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <a href={activityItem.person.href} className="font-medium text-gray-900 dark:text-white">
                            {activityItem.person.name}
                          </a>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Commented {activityItem.date}</p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                        <p>{activityItem.comment}</p>
                      </div>
                    </div>
                  </>
                ) : activityItem.type === 'assignment' ? (
                  <>
                    <div>
                      <div className="relative px-1">
                        <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-800 dark:ring-gray-900">
                          <UserCircleIcon aria-hidden="true" className="size-5 text-gray-500 dark:text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 py-1.5">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <a href={activityItem.person.href} className="font-medium text-gray-900 dark:text-white">
                          {activityItem.person.name}
                        </a>{' '}
                        assigned{' '}
                        <a href={activityItem.assigned.href} className="font-medium text-gray-900 dark:text-white">
                          {activityItem.assigned.name}
                        </a>{' '}
                        <span className="whitespace-nowrap">{activityItem.date}</span>
                      </div>
                    </div>
                  </>
                ) : activityItem.type === 'tags' ? (
                  <>
                    <div>
                      <div className="relative px-1">
                        <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-800 dark:ring-gray-900">
                          <TagIcon aria-hidden="true" className="size-5 text-gray-500 dark:text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 py-0">
                      <div className="text-sm/8 text-gray-500 dark:text-gray-400">
                        <span className="mr-0.5">
                          <a href={activityItem.person.href} className="font-medium text-gray-900 dark:text-white">
                            {activityItem.person.name}
                          </a>{' '}
                          added tags
                        </span>{' '}
                        <span className="mr-0.5">
                          {activityItem.tags.map((tag) => (
                            <Fragment key={tag.name}>
                              <a
                                href={tag.href}
                                className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 inset-ring inset-ring-gray-200 dark:bg-white/5 dark:text-gray-100 dark:inset-ring-white/10"
                              >
                                <svg viewBox="0 0 6 6" aria-hidden="true" className={classNames(tag.color, 'size-1.5')}>
                                  <circle r={3} cx={3} cy={3} />
                                </svg>
                                {tag.name}
                              </a>{' '}
                            </Fragment>
                          ))}
                        </span>
                        <span className="whitespace-nowrap">{activityItem.date}</span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}


