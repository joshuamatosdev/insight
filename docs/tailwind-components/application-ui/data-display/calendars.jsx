// Tailwind Plus UI Blocks - Calendars
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/data-display/calendars
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. Small with meetings
// =============================================================================
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
} from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const meetings = [
  {
    id: 1,
    date: 'January 10th, 2022',
    time: '5:00 PM',
    datetime: '2022-01-10T17:00',
    name: 'Leslie Alexander',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    location: 'Starbucks',
  },
  {
    id: 2,
    date: 'January 12th, 2022',
    time: '3:00 PM',
    datetime: '2022-01-12T15:00',
    name: 'Michael Foster',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    location: 'Tim Hortons',
  },
  {
    id: 3,
    date: 'January 12th, 2022',
    time: '5:00 PM',
    datetime: '2022-01-12T17:00',
    name: 'Dries Vincent',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    location: 'Costa Coffee at Braehead',
  },
  {
    id: 4,
    date: 'January 14th, 2022',
    time: '10:00 AM',
    datetime: '2022-01-14T10:00',
    name: 'Lindsay Walton',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    location: 'Silverburn',
  },
  {
    id: 5,
    date: 'January 14th, 2022',
    time: '12:00 PM',
    datetime: '2022-01-14T12:00',
    name: 'Courtney Henry',
    imageUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    location: 'The Glasgow Green',
  },
]
const days = [
  { date: '2021-12-27' },
  { date: '2021-12-28' },
  { date: '2021-12-29' },
  { date: '2021-12-30' },
  { date: '2021-12-31' },
  { date: '2022-01-01', isCurrentMonth: true },
  { date: '2022-01-02', isCurrentMonth: true },
  { date: '2022-01-03', isCurrentMonth: true },
  { date: '2022-01-04', isCurrentMonth: true },
  { date: '2022-01-05', isCurrentMonth: true },
  { date: '2022-01-06', isCurrentMonth: true },
  { date: '2022-01-07', isCurrentMonth: true },
  { date: '2022-01-08', isCurrentMonth: true },
  { date: '2022-01-09', isCurrentMonth: true },
  { date: '2022-01-10', isCurrentMonth: true },
  { date: '2022-01-11', isCurrentMonth: true },
  { date: '2022-01-12', isCurrentMonth: true, isToday: true },
  { date: '2022-01-13', isCurrentMonth: true },
  { date: '2022-01-14', isCurrentMonth: true },
  { date: '2022-01-15', isCurrentMonth: true },
  { date: '2022-01-16', isCurrentMonth: true },
  { date: '2022-01-17', isCurrentMonth: true },
  { date: '2022-01-18', isCurrentMonth: true },
  { date: '2022-01-19', isCurrentMonth: true },
  { date: '2022-01-20', isCurrentMonth: true },
  { date: '2022-01-21', isCurrentMonth: true },
  { date: '2022-01-22', isCurrentMonth: true, isSelected: true },
  { date: '2022-01-23', isCurrentMonth: true },
  { date: '2022-01-24', isCurrentMonth: true },
  { date: '2022-01-25', isCurrentMonth: true },
  { date: '2022-01-26', isCurrentMonth: true },
  { date: '2022-01-27', isCurrentMonth: true },
  { date: '2022-01-28', isCurrentMonth: true },
  { date: '2022-01-29', isCurrentMonth: true },
  { date: '2022-01-30', isCurrentMonth: true },
  { date: '2022-01-31', isCurrentMonth: true },
  { date: '2022-02-01' },
  { date: '2022-02-02' },
  { date: '2022-02-03' },
  { date: '2022-02-04' },
  { date: '2022-02-05' },
  { date: '2022-02-06' },
]

export default function Example() {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming meetings</h2>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
        <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
          <div className="flex items-center text-gray-900 dark:text-white">
            <button
              type="button"
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-white"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>
            <div className="flex-auto text-sm font-semibold">January</div>
            <button
              type="button"
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-white"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-7 text-xs/6 text-gray-500 dark:text-gray-400">
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
            <div>S</div>
          </div>
          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow-sm ring-1 ring-gray-200 dark:bg-white/15 dark:shadow-none dark:ring-white/15">
            {days.map((day) => (
              <button
                key={day.date}
                type="button"
                data-is-today={day.isToday ? '' : undefined}
                data-is-selected={day.isSelected ? '' : undefined}
                data-is-current-month={day.isCurrentMonth ? '' : undefined}
                className="py-1.5 not-data-is-current-month:bg-gray-50 not-data-is-selected:not-data-is-current-month:not-data-is-today:text-gray-400 first:rounded-tl-lg last:rounded-br-lg hover:bg-gray-100 focus:z-10 data-is-current-month:bg-white not-data-is-selected:data-is-current-month:not-data-is-today:text-gray-900 data-is-current-month:hover:bg-gray-100 data-is-selected:font-semibold data-is-selected:text-white data-is-today:font-semibold data-is-today:not-data-is-selected:text-indigo-600 nth-36:rounded-bl-lg nth-7:rounded-tr-lg dark:not-data-is-current-month:bg-gray-900/75 dark:not-data-is-selected:not-data-is-current-month:not-data-is-today:text-gray-500 dark:hover:bg-gray-900/25 dark:data-is-current-month:bg-gray-900/90 dark:not-data-is-selected:data-is-current-month:not-data-is-today:text-white dark:data-is-current-month:hover:bg-gray-900/50 dark:data-is-selected:text-gray-900 dark:data-is-today:not-data-is-selected:text-indigo-400"
              >
                <time
                  dateTime={day.date}
                  className="mx-auto flex size-7 items-center justify-center rounded-full in-data-is-selected:not-in-data-is-today:bg-gray-900 in-data-is-selected:in-data-is-today:bg-indigo-600 dark:in-data-is-selected:not-in-data-is-today:bg-white dark:in-data-is-selected:in-data-is-today:bg-indigo-500"
                >
                  {day.date.split('-').pop().replace(/^0/, '')}
                </time>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-8 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Add event
          </button>
        </div>
        <ol className="mt-4 divide-y divide-gray-100 text-sm/6 lg:col-span-7 xl:col-span-8 dark:divide-white/10">
          {meetings.map((meeting) => (
            <li key={meeting.id} className="relative flex gap-x-6 py-6 xl:static">
              <img
                alt=""
                src={meeting.imageUrl}
                className="size-14 flex-none rounded-full dark:outline dark:-outline-offset-1 dark:outline-white/10"
              />
              <div className="flex-auto">
                <h3 className="pr-10 font-semibold text-gray-900 xl:pr-0 dark:text-white">{meeting.name}</h3>
                <dl className="mt-2 flex flex-col text-gray-500 xl:flex-row dark:text-gray-400">
                  <div className="flex items-start gap-x-3">
                    <dt className="mt-0.5">
                      <span className="sr-only">Date</span>
                      <CalendarIcon aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
                    </dt>
                    <dd>
                      <time dateTime={meeting.datetime}>
                        {meeting.date} at {meeting.time}
                      </time>
                    </dd>
                  </div>
                  <div className="mt-2 flex items-start gap-x-3 xl:mt-0 xl:ml-3.5 xl:border-l xl:border-gray-400/50 xl:pl-3.5 dark:xl:border-gray-500/50">
                    <dt className="mt-0.5">
                      <span className="sr-only">Location</span>
                      <MapPinIcon aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
                    </dt>
                    <dd>{meeting.location}</dd>
                  </div>
                </dl>
              </div>
              <Menu as="div" className="absolute top-6 right-0 xl:relative xl:top-auto xl:right-auto xl:self-center">
                <MenuButton className="relative flex items-center rounded-full text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white">
                  <span className="absolute -inset-2" />
                  <span className="sr-only">Open options</span>
                  <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                >
                  <div className="py-1">
                    <MenuItem>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                      >
                        Edit
                      </a>
                    </MenuItem>
                    <MenuItem>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                      >
                        Cancel
                      </a>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}


// =============================================================================
// 2. Month view
// =============================================================================
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const events = [
  { id: 1, name: 'Maple syrup museum', time: '3PM', datetime: '2022-01-15T09:00', href: '#' },
  { id: 2, name: 'Hockey game', time: '7PM', datetime: '2022-01-22T19:00', href: '#' },
]
const days = [
  { date: '2021-12-27', events: [] },
  { date: '2021-12-28', events: [] },
  { date: '2021-12-29', events: [] },
  { date: '2021-12-30', events: [] },
  { date: '2021-12-31', events: [] },
  { date: '2022-01-01', isCurrentMonth: true, events: [] },
  { date: '2022-01-02', isCurrentMonth: true, events: [] },
  {
    date: '2022-01-03',
    isCurrentMonth: true,
    events: [
      { id: 1, name: 'Design review', time: '10AM', datetime: '2022-01-03T10:00', href: '#' },
      { id: 2, name: 'Sales meeting', time: '2PM', datetime: '2022-01-03T14:00', href: '#' },
    ],
  },
  { date: '2022-01-04', isCurrentMonth: true, events: [] },
  { date: '2022-01-05', isCurrentMonth: true, events: [] },
  { date: '2022-01-06', isCurrentMonth: true, events: [] },
  {
    date: '2022-01-07',
    isCurrentMonth: true,
    events: [{ id: 3, name: 'Date night', time: '6PM', datetime: '2022-01-08T18:00', href: '#' }],
  },
  { date: '2022-01-08', isCurrentMonth: true, events: [] },
  { date: '2022-01-09', isCurrentMonth: true, events: [] },
  { date: '2022-01-10', isCurrentMonth: true, events: [] },
  { date: '2022-01-11', isCurrentMonth: true, events: [] },
  {
    date: '2022-01-12',
    isCurrentMonth: true,
    isToday: true,
    events: [{ id: 6, name: "Sam's birthday party", time: '2PM', datetime: '2022-01-25T14:00', href: '#' }],
  },
  { date: '2022-01-13', isCurrentMonth: true, events: [] },
  { date: '2022-01-14', isCurrentMonth: true, events: [] },
  { date: '2022-01-15', isCurrentMonth: true, events: [] },
  { date: '2022-01-16', isCurrentMonth: true, events: [] },
  { date: '2022-01-17', isCurrentMonth: true, events: [] },
  { date: '2022-01-18', isCurrentMonth: true, events: [] },
  { date: '2022-01-19', isCurrentMonth: true, events: [] },
  { date: '2022-01-20', isCurrentMonth: true, events: [] },
  { date: '2022-01-21', isCurrentMonth: true, events: [] },
  {
    date: '2022-01-22',
    isCurrentMonth: true,
    isSelected: true,
    events: [
      { id: 4, name: 'Maple syrup museum', time: '3PM', datetime: '2022-01-22T15:00', href: '#' },
      { id: 5, name: 'Hockey game', time: '7PM', datetime: '2022-01-22T19:00', href: '#' },
    ],
  },
  { date: '2022-01-23', isCurrentMonth: true, events: [] },
  { date: '2022-01-24', isCurrentMonth: true, events: [] },
  { date: '2022-01-25', isCurrentMonth: true, events: [] },
  { date: '2022-01-26', isCurrentMonth: true, events: [] },
  { date: '2022-01-27', isCurrentMonth: true, events: [] },
  { date: '2022-01-28', isCurrentMonth: true, events: [] },
  { date: '2022-01-29', isCurrentMonth: true, events: [] },
  { date: '2022-01-30', isCurrentMonth: true, events: [] },
  { date: '2022-01-31', isCurrentMonth: true, events: [] },
  { date: '2022-02-01', events: [] },
  { date: '2022-02-02', events: [] },
  { date: '2022-02-03', events: [] },
  {
    date: '2022-02-04',
    events: [{ id: 7, name: 'Cinema with friends', time: '9PM', datetime: '2022-02-04T21:00', href: '#' }],
  },
  { date: '2022-02-05', events: [] },
  { date: '2022-02-06', events: [] },
]

export default function Example() {
  return (
    <div className="lg:flex lg:h-full lg:flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none dark:border-white/10 dark:bg-gray-800/50">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
          <time dateTime="2022-01">January 2022</time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-xs outline -outline-offset-1 outline-gray-300 md:items-stretch dark:bg-white/10 dark:shadow-none dark:outline-white/5">
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50 dark:hover:text-white dark:md:hover:bg-white/10"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              className="hidden px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block dark:text-white dark:hover:bg-white/10"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden dark:bg-white/10" />
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50 dark:hover:text-white dark:md:hover:bg-white/10"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <MenuButton
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
              >
                Month view
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400 dark:text-gray-500" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Day view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Week view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Month view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Year view
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
            <div className="ml-6 h-6 w-px bg-gray-300 dark:bg-white/10" />
            <button
              type="button"
              className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Add event
            </button>
          </div>
          <Menu as="div" className="relative ml-6 md:hidden">
            <MenuButton className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white">
              <span className="sr-only">Open menu</span>
              <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:divide-white/10 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10"
            >
              <div className="py-1">
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                  >
                    Create event
                  </a>
                </MenuItem>
              </div>
              <div className="py-1">
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                  >
                    Go to today
                  </a>
                </MenuItem>
              </div>
              <div className="py-1">
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                  >
                    Day view
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                  >
                    Week view
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                  >
                    Month view
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                  >
                    Year view
                  </a>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </header>
      <div className="shadow-sm ring-1 ring-black/5 lg:flex lg:flex-auto lg:flex-col dark:shadow-none dark:ring-white/5">
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs/6 font-semibold text-gray-700 lg:flex-none dark:border-white/5 dark:bg-white/15 dark:text-gray-300">
          <div className="flex justify-center bg-white py-2 dark:bg-gray-900">
            <span>M</span>
            <span className="sr-only sm:not-sr-only">on</span>
          </div>
          <div className="flex justify-center bg-white py-2 dark:bg-gray-900">
            <span>T</span>
            <span className="sr-only sm:not-sr-only">ue</span>
          </div>
          <div className="flex justify-center bg-white py-2 dark:bg-gray-900">
            <span>W</span>
            <span className="sr-only sm:not-sr-only">ed</span>
          </div>
          <div className="flex justify-center bg-white py-2 dark:bg-gray-900">
            <span>T</span>
            <span className="sr-only sm:not-sr-only">hu</span>
          </div>
          <div className="flex justify-center bg-white py-2 dark:bg-gray-900">
            <span>F</span>
            <span className="sr-only sm:not-sr-only">ri</span>
          </div>
          <div className="flex justify-center bg-white py-2 dark:bg-gray-900">
            <span>S</span>
            <span className="sr-only sm:not-sr-only">at</span>
          </div>
          <div className="flex justify-center bg-white py-2 dark:bg-gray-900">
            <span>S</span>
            <span className="sr-only sm:not-sr-only">un</span>
          </div>
        </div>
        <div className="flex bg-gray-200 text-xs/6 text-gray-700 lg:flex-auto dark:bg-white/10 dark:text-gray-300">
          <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
            {days.map((day) => (
              <div
                key={day.date}
                data-is-today={day.isToday ? '' : undefined}
                data-is-current-month={day.isCurrentMonth ? '' : undefined}
                className="group relative bg-gray-50 px-3 py-2 text-gray-500 data-is-current-month:bg-white dark:bg-gray-900 dark:text-gray-400 dark:not-data-is-current-month:before:pointer-events-none dark:not-data-is-current-month:before:absolute dark:not-data-is-current-month:before:inset-0 dark:not-data-is-current-month:before:bg-gray-800/50 dark:data-is-current-month:bg-gray-900"
              >
                <time
                  dateTime={day.date}
                  className="relative group-not-data-is-current-month:opacity-75 in-data-is-today:flex in-data-is-today:size-6 in-data-is-today:items-center in-data-is-today:justify-center in-data-is-today:rounded-full in-data-is-today:bg-indigo-600 in-data-is-today:font-semibold in-data-is-today:text-white dark:in-data-is-today:bg-indigo-500"
                >
                  {day.date.split('-').pop().replace(/^0/, '')}
                </time>
                {day.events.length > 0 ? (
                  <ol className="mt-2">
                    {day.events.slice(0, 2).map((event) => (
                      <li key={event.id}>
                        <a href={event.href} className="group flex">
                          <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            {event.name}
                          </p>
                          <time
                            dateTime={event.datetime}
                            className="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block dark:text-gray-400 dark:group-hover:text-indigo-400"
                          >
                            {event.time}
                          </time>
                        </a>
                      </li>
                    ))}
                    {day.events.length > 2 ? (
                      <li className="text-gray-500 dark:text-gray-400">+ {day.events.length - 2} more</li>
                    ) : null}
                  </ol>
                ) : null}
              </div>
            ))}
          </div>
          <div className="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">
            {days.map((day) => (
              <button
                key={day.date}
                type="button"
                data-is-today={day.isToday ? '' : undefined}
                data-is-selected={day.isSelected ? '' : undefined}
                data-is-current-month={day.isCurrentMonth ? '' : undefined}
                className="group relative flex h-14 flex-col px-3 py-2 not-data-is-current-month:bg-gray-50 not-data-is-selected:not-data-is-current-month:not-data-is-today:text-gray-500 hover:bg-gray-100 focus:z-10 data-is-current-month:bg-white not-data-is-selected:data-is-current-month:not-data-is-today:text-gray-900 data-is-current-month:hover:bg-gray-100 data-is-selected:font-semibold data-is-selected:text-white data-is-today:font-semibold not-data-is-selected:data-is-today:text-indigo-600 dark:not-data-is-current-month:bg-gray-900 dark:not-data-is-selected:not-data-is-current-month:not-data-is-today:text-gray-400 dark:not-data-is-current-month:before:pointer-events-none dark:not-data-is-current-month:before:absolute dark:not-data-is-current-month:before:inset-0 dark:not-data-is-current-month:before:bg-gray-800/50 dark:hover:bg-gray-900/50 dark:data-is-current-month:bg-gray-900 dark:not-data-is-selected:data-is-current-month:not-data-is-today:text-white dark:data-is-current-month:hover:bg-gray-900/50 dark:not-data-is-selected:data-is-today:text-indigo-400"
              >
                <time
                  dateTime={day.date}
                  className="ml-auto group-not-data-is-current-month:opacity-75 in-data-is-selected:flex in-data-is-selected:size-6 in-data-is-selected:items-center in-data-is-selected:justify-center in-data-is-selected:rounded-full in-data-is-selected:not-in-data-is-today:bg-gray-900 in-data-is-selected:in-data-is-today:bg-indigo-600 dark:in-data-is-selected:not-in-data-is-today:bg-white dark:in-data-is-selected:not-in-data-is-today:text-gray-900 dark:in-data-is-selected:in-data-is-today:bg-indigo-500"
                >
                  {day.date.split('-').pop().replace(/^0/, '')}
                </time>
                <span className="sr-only">{day.events.length} events</span>
                {day.events.length > 0 ? (
                  <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                    {day.events.map((event) => (
                      <span key={event.id} className="mx-0.5 mb-1 size-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                    ))}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative px-4 py-10 sm:px-6 lg:hidden dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:top-0 dark:after:h-px dark:after:bg-white/10">
        <ol className="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white text-sm shadow-sm outline-1 outline-black/5 dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
          {events.map((event) => (
            <li
              key={event.id}
              className="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50 dark:focus-within:bg-white/5 dark:hover:bg-white/5"
            >
              <div className="flex-auto">
                <p className="font-semibold text-gray-900 dark:text-white">{event.name}</p>
                <time dateTime={event.datetime} className="mt-2 flex items-center text-gray-700 dark:text-gray-300">
                  <ClockIcon aria-hidden="true" className="mr-2 size-5 text-gray-400 dark:text-gray-500" />
                  {event.time}
                </time>
              </div>
              <a
                href={event.href}
                className="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 opacity-0 shadow-xs ring-1 ring-gray-300 ring-inset group-hover:opacity-100 hover:ring-gray-400 focus:opacity-100 dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-white/5 dark:hover:bg-white/20 dark:hover:ring-white/5"
              >
                Edit<span className="sr-only">, {event.name}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}


// =============================================================================
// 3. Week view
// =============================================================================
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

export default function Example() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/15 dark:bg-gray-800/50">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
          <time dateTime="2022-01">January 2022</time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-xs outline -outline-offset-1 outline-gray-300 md:items-stretch dark:bg-white/10 dark:shadow-none dark:outline-white/5">
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50 dark:hover:text-white dark:md:hover:bg-white/10"
            >
              <span className="sr-only">Previous week</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              className="hidden px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block dark:text-white dark:hover:bg-white/10"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden dark:bg-white/10" />
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50 dark:hover:text-white dark:md:hover:bg-white/10"
            >
              <span className="sr-only">Next week</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <MenuButton
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
              >
                Week view
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400 dark:text-gray-500" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Day view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Week view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Month view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Year view
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
            <div className="ml-6 h-6 w-px bg-gray-300 dark:bg-white/10" />
            <button
              type="button"
              className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Add event
            </button>
          </div>
          <div className="ml-6 md:hidden">
            <Menu as="div" className="relative">
              <MenuButton className="relative flex items-center rounded-full text-gray-400 outline-offset-8 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white">
                <span className="absolute -inset-2" />
                <span className="sr-only">Open menu</span>
                <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:divide-white/10 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Create event
                    </a>
                  </MenuItem>
                </div>
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Go to today
                    </a>
                  </MenuItem>
                </div>
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Day view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Week view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Month view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Year view
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </header>
      <div className="isolate flex flex-auto flex-col overflow-auto bg-white dark:bg-gray-900">
        <div style={{ width: '165%' }} className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
          <div className="sticky top-0 z-30 flex-none bg-white shadow-sm ring-1 ring-black/5 sm:pr-8 dark:bg-gray-900 dark:shadow-none dark:ring-white/20">
            <div className="grid grid-cols-7 text-sm/6 text-gray-500 sm:hidden dark:text-gray-400">
              <button type="button" className="flex flex-col items-center pt-2 pb-3">
                M{' '}
                <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-white">
                  10
                </span>
              </button>
              <button type="button" className="flex flex-col items-center pt-2 pb-3">
                T{' '}
                <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-white">
                  11
                </span>
              </button>
              <button type="button" className="flex flex-col items-center pt-2 pb-3">
                W{' '}
                <span className="mt-1 flex size-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white dark:bg-indigo-500">
                  12
                </span>
              </button>
              <button type="button" className="flex flex-col items-center pt-2 pb-3">
                T{' '}
                <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-white">
                  13
                </span>
              </button>
              <button type="button" className="flex flex-col items-center pt-2 pb-3">
                F{' '}
                <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-white">
                  14
                </span>
              </button>
              <button type="button" className="flex flex-col items-center pt-2 pb-3">
                S{' '}
                <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-white">
                  15
                </span>
              </button>
              <button type="button" className="flex flex-col items-center pt-2 pb-3">
                S{' '}
                <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-white">
                  16
                </span>
              </button>
            </div>

            <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm/6 text-gray-500 sm:grid dark:divide-white/10 dark:border-white/10 dark:text-gray-400">
              <div className="col-end-1 w-14" />
              <div className="flex items-center justify-center py-3">
                <span>
                  Mon{' '}
                  <span className="items-center justify-center font-semibold text-gray-900 dark:text-white">10</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span>
                  Tue{' '}
                  <span className="items-center justify-center font-semibold text-gray-900 dark:text-white">11</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span className="flex items-baseline">
                  Wed{' '}
                  <span className="ml-1.5 flex size-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white dark:bg-indigo-500">
                    12
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span>
                  Thu{' '}
                  <span className="items-center justify-center font-semibold text-gray-900 dark:text-white">13</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span>
                  Fri{' '}
                  <span className="items-center justify-center font-semibold text-gray-900 dark:text-white">14</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span>
                  Sat{' '}
                  <span className="items-center justify-center font-semibold text-gray-900 dark:text-white">15</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span>
                  Sun{' '}
                  <span className="items-center justify-center font-semibold text-gray-900 dark:text-white">16</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-auto">
            <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-white/5" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Horizontal lines */}
              <div
                style={{ gridTemplateRows: 'repeat(48, minmax(3.5rem, 1fr))' }}
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100 dark:divide-white/5"
              >
                <div className="row-end-1 h-7" />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    12AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    1AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    2AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    3AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    4AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    5AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    6AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    7AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    8AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    9AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    10AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    11AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    12PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    1PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    2PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    3PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    4PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    5PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    6PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    7PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    8PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    9PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    10PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    11PM
                  </div>
                </div>
                <div />
              </div>

              {/* Vertical lines */}
              <div className="col-start-1 col-end-2 row-start-1 hidden grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7 dark:divide-white/5">
                <div className="col-start-1 row-span-full" />
                <div className="col-start-2 row-span-full" />
                <div className="col-start-3 row-span-full" />
                <div className="col-start-4 row-span-full" />
                <div className="col-start-5 row-span-full" />
                <div className="col-start-6 row-span-full" />
                <div className="col-start-7 row-span-full" />
                <div className="col-start-8 row-span-full w-8" />
              </div>

              {/* Events */}
              <ol
                style={{ gridTemplateRows: '1.75rem repeat(288, minmax(0, 1fr)) auto' }}
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
              >
                <li
                  style={{ gridRow: '74 / span 12' }}
                  className="relative mt-px flex sm:col-start-3 dark:before:pointer-events-none dark:before:absolute dark:before:inset-1 dark:before:z-0 dark:before:rounded-lg dark:before:bg-gray-900"
                >
                  <a
                    href="#"
                    className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-blue-50 p-2 text-xs/5 hover:bg-blue-100 dark:bg-blue-600/15 dark:hover:bg-blue-600/20"
                  >
                    <p className="order-1 font-semibold text-blue-700 dark:text-blue-300">Breakfast</p>
                    <p className="text-blue-500 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                      <time dateTime="2022-01-12T06:00">6:00 AM</time>
                    </p>
                  </a>
                </li>
                <li
                  style={{ gridRow: '92 / span 30' }}
                  className="relative mt-px flex sm:col-start-3 dark:before:pointer-events-none dark:before:absolute dark:before:inset-1 dark:before:z-0 dark:before:rounded-lg dark:before:bg-gray-900"
                >
                  <a
                    href="#"
                    className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-pink-50 p-2 text-xs/5 hover:bg-pink-100 dark:bg-pink-600/15 dark:hover:bg-pink-600/20"
                  >
                    <p className="order-1 font-semibold text-pink-700 dark:text-pink-300">Flight to Paris</p>
                    <p className="text-pink-500 group-hover:text-pink-700 dark:text-pink-400 dark:group-hover:text-pink-300">
                      <time dateTime="2022-01-12T07:30">7:30 AM</time>
                    </p>
                  </a>
                </li>
                <li
                  style={{ gridRow: '122 / span 24' }}
                  className="relative mt-px hidden sm:col-start-6 sm:flex dark:before:pointer-events-none dark:before:absolute dark:before:inset-1 dark:before:z-0 dark:before:rounded-lg dark:before:bg-gray-900"
                >
                  <a
                    href="#"
                    className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-gray-100 p-2 text-xs/5 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15"
                  >
                    <p className="order-1 font-semibold text-gray-700 dark:text-gray-300">
                      Meeting with design team at Disney
                    </p>
                    <p className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
                      <time dateTime="2022-01-15T10:00">10:00 AM</time>
                    </p>
                  </a>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 4. Day view
// =============================================================================
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const days = [
  { date: '2021-12-27' },
  { date: '2021-12-28' },
  { date: '2021-12-29' },
  { date: '2021-12-30' },
  { date: '2021-12-31' },
  { date: '2022-01-01', isCurrentMonth: true },
  { date: '2022-01-02', isCurrentMonth: true },
  { date: '2022-01-03', isCurrentMonth: true },
  { date: '2022-01-04', isCurrentMonth: true },
  { date: '2022-01-05', isCurrentMonth: true },
  { date: '2022-01-06', isCurrentMonth: true },
  { date: '2022-01-07', isCurrentMonth: true },
  { date: '2022-01-08', isCurrentMonth: true },
  { date: '2022-01-09', isCurrentMonth: true },
  { date: '2022-01-10', isCurrentMonth: true },
  { date: '2022-01-11', isCurrentMonth: true },
  { date: '2022-01-12', isCurrentMonth: true },
  { date: '2022-01-13', isCurrentMonth: true },
  { date: '2022-01-14', isCurrentMonth: true },
  { date: '2022-01-15', isCurrentMonth: true },
  { date: '2022-01-16', isCurrentMonth: true },
  { date: '2022-01-17', isCurrentMonth: true },
  { date: '2022-01-18', isCurrentMonth: true },
  { date: '2022-01-19', isCurrentMonth: true },
  { date: '2022-01-20', isCurrentMonth: true, isToday: true },
  { date: '2022-01-21', isCurrentMonth: true },
  { date: '2022-01-22', isCurrentMonth: true, isSelected: true },
  { date: '2022-01-23', isCurrentMonth: true },
  { date: '2022-01-24', isCurrentMonth: true },
  { date: '2022-01-25', isCurrentMonth: true },
  { date: '2022-01-26', isCurrentMonth: true },
  { date: '2022-01-27', isCurrentMonth: true },
  { date: '2022-01-28', isCurrentMonth: true },
  { date: '2022-01-29', isCurrentMonth: true },
  { date: '2022-01-30', isCurrentMonth: true },
  { date: '2022-01-31', isCurrentMonth: true },
  { date: '2022-02-01' },
  { date: '2022-02-02' },
  { date: '2022-02-03' },
  { date: '2022-02-04' },
  { date: '2022-02-05' },
  { date: '2022-02-06' },
]

export default function Example() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/10 dark:bg-gray-800/50 dark:max-md:border-white/15">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            <time dateTime="2022-01-22" className="sm:hidden">
              Jan 22, 2022
            </time>
            <time dateTime="2022-01-22" className="hidden sm:inline">
              January 22, 2022
            </time>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Saturday</p>
        </div>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-xs outline -outline-offset-1 outline-gray-300 md:items-stretch dark:bg-white/10 dark:shadow-none dark:outline-white/5">
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50 dark:hover:text-white dark:md:hover:bg-white/10"
            >
              <span className="sr-only">Previous day</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              className="hidden px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block dark:text-white dark:hover:bg-white/10"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden dark:bg-white/10" />
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50 dark:hover:text-white dark:md:hover:bg-white/10"
            >
              <span className="sr-only">Next day</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <MenuButton
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
              >
                Day view
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Day view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Week view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Month view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Year view
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
            <div className="ml-6 h-6 w-px bg-gray-300 dark:bg-white/10" />
            <button
              type="button"
              className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Add event
            </button>
          </div>
          <div className="ml-6 md:hidden">
            <Menu as="div" className="relative">
              <MenuButton className="relative flex items-center rounded-full text-gray-400 outline-offset-8 hover:text-gray-500 dark:text-gray-500 dark:hover:text-white">
                <span className="absolute -inset-2" />
                <span className="sr-only">Open menu</span>
                <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:divide-white/10 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Create event
                    </a>
                  </MenuItem>
                </div>
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Go to today
                    </a>
                  </MenuItem>
                </div>
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Day view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Week view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Month view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Year view
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </header>
      <div className="isolate flex flex-auto overflow-hidden bg-white dark:bg-gray-900">
        <div className="flex flex-auto flex-col overflow-auto">
          <div className="sticky top-0 z-10 grid flex-none grid-cols-7 bg-white text-xs text-gray-500 shadow-sm ring-1 ring-black/5 md:hidden dark:bg-gray-900 dark:text-gray-400 dark:shadow-none dark:ring-white/20">
            <button type="button" className="flex flex-col items-center pt-3 pb-1.5">
              <span>W</span>
              {/* Default: "text-gray-900 dark:text-white", Selected: "bg-gray-900 text-white", Today (Not Selected): "text-indigo-600", Today (Selected): "bg-indigo-600 text-white" */}
              <span className="mt-3 flex size-8 items-center justify-center rounded-full text-base font-semibold text-gray-900 dark:text-white">
                19
              </span>
            </button>
            <button type="button" className="flex flex-col items-center pt-3 pb-1.5">
              <span>T</span>
              <span className="mt-3 flex size-8 items-center justify-center rounded-full text-base font-semibold text-indigo-600 dark:text-indigo-400">
                20
              </span>
            </button>
            <button type="button" className="flex flex-col items-center pt-3 pb-1.5">
              <span>F</span>
              <span className="mt-3 flex size-8 items-center justify-center rounded-full text-base font-semibold text-gray-900 dark:text-white">
                21
              </span>
            </button>
            <button type="button" className="flex flex-col items-center pt-3 pb-1.5">
              <span>S</span>
              <span className="mt-3 flex size-8 items-center justify-center rounded-full bg-gray-900 text-base font-semibold text-white dark:bg-white dark:text-gray-900">
                22
              </span>
            </button>
            <button type="button" className="flex flex-col items-center pt-3 pb-1.5">
              <span>S</span>
              <span className="mt-3 flex size-8 items-center justify-center rounded-full text-base font-semibold text-gray-900 dark:text-white">
                23
              </span>
            </button>
            <button type="button" className="flex flex-col items-center pt-3 pb-1.5">
              <span>M</span>
              <span className="mt-3 flex size-8 items-center justify-center rounded-full text-base font-semibold text-gray-900 dark:text-white">
                24
              </span>
            </button>
            <button type="button" className="flex flex-col items-center pt-3 pb-1.5">
              <span>T</span>
              <span className="mt-3 flex size-8 items-center justify-center rounded-full text-base font-semibold text-gray-900 dark:text-white">
                25
              </span>
            </button>
          </div>
          <div className="flex w-full flex-auto">
            <div className="w-14 flex-none bg-white ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-white/5" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Horizontal lines */}
              <div
                style={{ gridTemplateRows: 'repeat(48, minmax(3.5rem, 1fr))' }}
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100 dark:divide-white/5"
              >
                <div className="row-end-1 h-7" />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    12AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    1AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    2AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    3AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    4AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    5AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    6AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    7AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    8AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    9AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    10AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    11AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    12PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    1PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    2PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    3PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    4PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    5PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    6PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    7PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    8PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    9PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    10PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="-mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                    11PM
                  </div>
                </div>
                <div />
              </div>

              {/* Events */}
              <ol
                style={{ gridTemplateRows: '1.75rem repeat(288, minmax(0, 1fr)) auto' }}
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1"
              >
                <li
                  style={{ gridRow: '74 / span 12' }}
                  className="relative mt-px flex dark:before:pointer-events-none dark:before:absolute dark:before:inset-1 dark:before:z-0 dark:before:rounded-lg dark:before:bg-gray-900"
                >
                  <a
                    href="#"
                    className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-blue-50 p-2 text-xs/5 hover:bg-blue-100 dark:bg-blue-600/15 dark:hover:bg-blue-600/20"
                  >
                    <p className="order-1 font-semibold text-blue-700 dark:text-blue-300">Breakfast</p>
                    <p className="text-blue-500 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                      <time dateTime="2022-01-22T06:00">6:00 AM</time>
                    </p>
                  </a>
                </li>
                <li
                  style={{ gridRow: '92 / span 30' }}
                  className="relative mt-px flex dark:before:pointer-events-none dark:before:absolute dark:before:inset-1 dark:before:z-0 dark:before:rounded-lg dark:before:bg-gray-900"
                >
                  <a
                    href="#"
                    className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-pink-50 p-2 text-xs/5 hover:bg-pink-100 dark:bg-pink-600/15 dark:hover:bg-pink-600/20"
                  >
                    <p className="order-1 font-semibold text-pink-700 dark:text-pink-300">Flight to Paris</p>
                    <p className="order-1 text-pink-500 group-hover:text-pink-700 dark:text-pink-400 dark:group-hover:text-pink-300">
                      John F. Kennedy International Airport
                    </p>
                    <p className="text-pink-500 group-hover:text-pink-700 dark:text-pink-400 dark:group-hover:text-pink-300">
                      <time dateTime="2022-01-22T07:30">7:30 AM</time>
                    </p>
                  </a>
                </li>
                <li
                  style={{ gridRow: '134 / span 18' }}
                  className="relative mt-px flex dark:before:pointer-events-none dark:before:absolute dark:before:inset-1 dark:before:z-0 dark:before:rounded-lg dark:before:bg-gray-900"
                >
                  <a
                    href="#"
                    className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-indigo-50 p-2 text-xs/5 hover:bg-indigo-100 dark:bg-indigo-600/15 dark:hover:bg-indigo-600/20"
                  >
                    <p className="order-1 font-semibold text-indigo-700 dark:text-indigo-300">Sightseeing</p>
                    <p className="order-1 text-indigo-500 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300">
                      Eiffel Tower
                    </p>
                    <p className="text-indigo-500 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300">
                      <time dateTime="2022-01-22T11:00">11:00 AM</time>
                    </p>
                  </a>
                </li>
              </ol>
            </div>
          </div>
        </div>
        <div className="hidden w-1/2 max-w-md flex-none border-l border-gray-100 px-8 py-10 md:block dark:border-white/10">
          <div className="flex items-center text-center text-gray-900 dark:text-white">
            <button
              type="button"
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>
            <div className="flex-auto text-sm font-semibold">January 2022</div>
            <button
              type="button"
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-7 text-center text-xs/6 text-gray-500 dark:text-gray-400">
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
            <div>S</div>
          </div>
          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow-sm ring-1 ring-gray-200 dark:bg-white/10 dark:shadow-none dark:ring-white/10">
            {days.map((day) => (
              <button
                key={day.date}
                type="button"
                data-is-today={day.isToday ? '' : undefined}
                data-is-selected={day.isSelected ? '' : undefined}
                data-is-current-month={day.isCurrentMonth ? '' : undefined}
                className="py-1.5 not-data-is-current-month:bg-gray-50 not-data-is-selected:not-data-is-current-month:not-data-is-today:text-gray-400 first:rounded-tl-lg last:rounded-br-lg hover:bg-gray-100 focus:z-10 data-is-current-month:bg-white not-data-is-selected:data-is-current-month:not-data-is-today:text-gray-900 data-is-current-month:hover:bg-gray-100 data-is-selected:font-semibold data-is-selected:text-white data-is-today:font-semibold data-is-today:not-data-is-selected:text-indigo-600 nth-36:rounded-bl-lg nth-7:rounded-tr-lg dark:not-data-is-current-month:bg-gray-900/75 dark:not-data-is-selected:not-data-is-current-month:not-data-is-today:text-gray-500 dark:hover:bg-gray-900/25 dark:data-is-current-month:bg-gray-900/90 dark:not-data-is-selected:data-is-current-month:not-data-is-today:text-white dark:data-is-current-month:hover:bg-gray-900/50 dark:data-is-selected:text-gray-900 dark:data-is-today:not-data-is-selected:text-indigo-400"
              >
                <time
                  dateTime={day.date}
                  className="mx-auto flex size-7 items-center justify-center rounded-full in-data-is-selected:not-in-data-is-today:bg-gray-900 in-data-is-selected:in-data-is-today:bg-indigo-600 dark:in-data-is-selected:not-in-data-is-today:bg-white dark:in-data-is-selected:in-data-is-today:bg-indigo-500"
                >
                  {day.date.split('-').pop().replace(/^0/, '')}
                </time>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 5. Year view
// =============================================================================
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const months = [
  {
    name: 'January',
    days: [
      { date: '2021-12-27' },
      { date: '2021-12-28' },
      { date: '2021-12-29' },
      { date: '2021-12-30' },
      { date: '2021-12-31' },
      { date: '2022-01-01', isCurrentMonth: true },
      { date: '2022-01-02', isCurrentMonth: true },
      { date: '2022-01-03', isCurrentMonth: true },
      { date: '2022-01-04', isCurrentMonth: true },
      { date: '2022-01-05', isCurrentMonth: true },
      { date: '2022-01-06', isCurrentMonth: true },
      { date: '2022-01-07', isCurrentMonth: true },
      { date: '2022-01-08', isCurrentMonth: true },
      { date: '2022-01-09', isCurrentMonth: true },
      { date: '2022-01-10', isCurrentMonth: true },
      { date: '2022-01-11', isCurrentMonth: true },
      { date: '2022-01-12', isCurrentMonth: true, isToday: true },
      { date: '2022-01-13', isCurrentMonth: true },
      { date: '2022-01-14', isCurrentMonth: true },
      { date: '2022-01-15', isCurrentMonth: true },
      { date: '2022-01-16', isCurrentMonth: true },
      { date: '2022-01-17', isCurrentMonth: true },
      { date: '2022-01-18', isCurrentMonth: true },
      { date: '2022-01-19', isCurrentMonth: true },
      { date: '2022-01-20', isCurrentMonth: true },
      { date: '2022-01-21', isCurrentMonth: true },
      { date: '2022-01-22', isCurrentMonth: true },
      { date: '2022-01-23', isCurrentMonth: true },
      { date: '2022-01-24', isCurrentMonth: true },
      { date: '2022-01-25', isCurrentMonth: true },
      { date: '2022-01-26', isCurrentMonth: true },
      { date: '2022-01-27', isCurrentMonth: true },
      { date: '2022-01-28', isCurrentMonth: true },
      { date: '2022-01-29', isCurrentMonth: true },
      { date: '2022-01-30', isCurrentMonth: true },
      { date: '2022-01-31', isCurrentMonth: true },
      { date: '2022-02-01' },
      { date: '2022-02-02' },
      { date: '2022-02-03' },
      { date: '2022-02-04' },
      { date: '2022-02-05' },
      { date: '2022-02-06' },
    ],
  },
  {
    name: 'February',
    days: [
      { date: '2022-01-31' },
      { date: '2022-02-01', isCurrentMonth: true },
      { date: '2022-02-02', isCurrentMonth: true },
      { date: '2022-02-03', isCurrentMonth: true },
      { date: '2022-02-04', isCurrentMonth: true },
      { date: '2022-02-05', isCurrentMonth: true },
      { date: '2022-02-06', isCurrentMonth: true },
      { date: '2022-02-07', isCurrentMonth: true },
      { date: '2022-02-08', isCurrentMonth: true },
      { date: '2022-02-09', isCurrentMonth: true },
      { date: '2022-02-10', isCurrentMonth: true },
      { date: '2022-02-11', isCurrentMonth: true },
      { date: '2022-02-12', isCurrentMonth: true },
      { date: '2022-02-13', isCurrentMonth: true },
      { date: '2022-02-14', isCurrentMonth: true },
      { date: '2022-02-15', isCurrentMonth: true },
      { date: '2022-02-16', isCurrentMonth: true },
      { date: '2022-02-17', isCurrentMonth: true },
      { date: '2022-02-18', isCurrentMonth: true },
      { date: '2022-02-19', isCurrentMonth: true },
      { date: '2022-02-20', isCurrentMonth: true },
      { date: '2022-02-21', isCurrentMonth: true },
      { date: '2022-02-22', isCurrentMonth: true },
      { date: '2022-02-23', isCurrentMonth: true },
      { date: '2022-02-24', isCurrentMonth: true },
      { date: '2022-02-25', isCurrentMonth: true },
      { date: '2022-02-26', isCurrentMonth: true },
      { date: '2022-02-27', isCurrentMonth: true },
      { date: '2022-02-28', isCurrentMonth: true },
      { date: '2022-03-01' },
      { date: '2022-03-02' },
      { date: '2022-03-03' },
      { date: '2022-03-04' },
      { date: '2022-03-05' },
      { date: '2022-03-06' },
      { date: '2022-03-07' },
      { date: '2022-03-08' },
      { date: '2022-03-09' },
      { date: '2022-03-10' },
      { date: '2022-03-11' },
      { date: '2022-03-12' },
      { date: '2022-03-13' },
    ],
  },
  {
    name: 'March',
    days: [
      { date: '2022-02-28' },
      { date: '2022-03-01', isCurrentMonth: true },
      { date: '2022-03-02', isCurrentMonth: true },
      { date: '2022-03-03', isCurrentMonth: true },
      { date: '2022-03-04', isCurrentMonth: true },
      { date: '2022-03-05', isCurrentMonth: true },
      { date: '2022-03-06', isCurrentMonth: true },
      { date: '2022-03-07', isCurrentMonth: true },
      { date: '2022-03-08', isCurrentMonth: true },
      { date: '2022-03-09', isCurrentMonth: true },
      { date: '2022-03-10', isCurrentMonth: true },
      { date: '2022-03-11', isCurrentMonth: true },
      { date: '2022-03-12', isCurrentMonth: true },
      { date: '2022-03-13', isCurrentMonth: true },
      { date: '2022-03-14', isCurrentMonth: true },
      { date: '2022-03-15', isCurrentMonth: true },
      { date: '2022-03-16', isCurrentMonth: true },
      { date: '2022-03-17', isCurrentMonth: true },
      { date: '2022-03-18', isCurrentMonth: true },
      { date: '2022-03-19', isCurrentMonth: true },
      { date: '2022-03-20', isCurrentMonth: true },
      { date: '2022-03-21', isCurrentMonth: true },
      { date: '2022-03-22', isCurrentMonth: true },
      { date: '2022-03-23', isCurrentMonth: true },
      { date: '2022-03-24', isCurrentMonth: true },
      { date: '2022-03-25', isCurrentMonth: true },
      { date: '2022-03-26', isCurrentMonth: true },
      { date: '2022-03-27', isCurrentMonth: true },
      { date: '2022-03-28', isCurrentMonth: true },
      { date: '2022-03-29', isCurrentMonth: true },
      { date: '2022-03-30', isCurrentMonth: true },
      { date: '2022-03-31', isCurrentMonth: true },
      { date: '2022-04-01' },
      { date: '2022-04-02' },
      { date: '2022-04-03' },
      { date: '2022-04-04' },
      { date: '2022-04-05' },
      { date: '2022-04-06' },
      { date: '2022-04-07' },
      { date: '2022-04-08' },
      { date: '2022-04-09' },
      { date: '2022-04-10' },
    ],
  },
  {
    name: 'April',
    days: [
      { date: '2022-03-28' },
      { date: '2022-03-29' },
      { date: '2022-03-30' },
      { date: '2022-03-31' },
      { date: '2022-04-01', isCurrentMonth: true },
      { date: '2022-04-02', isCurrentMonth: true },
      { date: '2022-04-03', isCurrentMonth: true },
      { date: '2022-04-04', isCurrentMonth: true },
      { date: '2022-04-05', isCurrentMonth: true },
      { date: '2022-04-06', isCurrentMonth: true },
      { date: '2022-04-07', isCurrentMonth: true },
      { date: '2022-04-08', isCurrentMonth: true },
      { date: '2022-04-09', isCurrentMonth: true },
      { date: '2022-04-10', isCurrentMonth: true },
      { date: '2022-04-11', isCurrentMonth: true },
      { date: '2022-04-12', isCurrentMonth: true },
      { date: '2022-04-13', isCurrentMonth: true },
      { date: '2022-04-14', isCurrentMonth: true },
      { date: '2022-04-15', isCurrentMonth: true },
      { date: '2022-04-16', isCurrentMonth: true },
      { date: '2022-04-17', isCurrentMonth: true },
      { date: '2022-04-18', isCurrentMonth: true },
      { date: '2022-04-19', isCurrentMonth: true },
      { date: '2022-04-20', isCurrentMonth: true },
      { date: '2022-04-21', isCurrentMonth: true },
      { date: '2022-04-22', isCurrentMonth: true },
      { date: '2022-04-23', isCurrentMonth: true },
      { date: '2022-04-24', isCurrentMonth: true },
      { date: '2022-04-25', isCurrentMonth: true },
      { date: '2022-04-26', isCurrentMonth: true },
      { date: '2022-04-27', isCurrentMonth: true },
      { date: '2022-04-28', isCurrentMonth: true },
      { date: '2022-04-29', isCurrentMonth: true },
      { date: '2022-04-30', isCurrentMonth: true },
      { date: '2022-05-01' },
      { date: '2022-05-02' },
      { date: '2022-05-03' },
      { date: '2022-05-04' },
      { date: '2022-05-05' },
      { date: '2022-05-06' },
      { date: '2022-05-07' },
      { date: '2022-05-08' },
    ],
  },
  {
    name: 'May',
    days: [
      { date: '2022-04-25' },
      { date: '2022-04-26' },
      { date: '2022-04-27' },
      { date: '2022-04-28' },
      { date: '2022-04-29' },
      { date: '2022-04-30' },
      { date: '2022-05-01', isCurrentMonth: true },
      { date: '2022-05-02', isCurrentMonth: true },
      { date: '2022-05-03', isCurrentMonth: true },
      { date: '2022-05-04', isCurrentMonth: true },
      { date: '2022-05-05', isCurrentMonth: true },
      { date: '2022-05-06', isCurrentMonth: true },
      { date: '2022-05-07', isCurrentMonth: true },
      { date: '2022-05-08', isCurrentMonth: true },
      { date: '2022-05-09', isCurrentMonth: true },
      { date: '2022-05-10', isCurrentMonth: true },
      { date: '2022-05-11', isCurrentMonth: true },
      { date: '2022-05-12', isCurrentMonth: true },
      { date: '2022-05-13', isCurrentMonth: true },
      { date: '2022-05-14', isCurrentMonth: true },
      { date: '2022-05-15', isCurrentMonth: true },
      { date: '2022-05-16', isCurrentMonth: true },
      { date: '2022-05-17', isCurrentMonth: true },
      { date: '2022-05-18', isCurrentMonth: true },
      { date: '2022-05-19', isCurrentMonth: true },
      { date: '2022-05-20', isCurrentMonth: true },
      { date: '2022-05-21', isCurrentMonth: true },
      { date: '2022-05-22', isCurrentMonth: true },
      { date: '2022-05-23', isCurrentMonth: true },
      { date: '2022-05-24', isCurrentMonth: true },
      { date: '2022-05-25', isCurrentMonth: true },
      { date: '2022-05-26', isCurrentMonth: true },
      { date: '2022-05-27', isCurrentMonth: true },
      { date: '2022-05-28', isCurrentMonth: true },
      { date: '2022-05-29', isCurrentMonth: true },
      { date: '2022-05-30', isCurrentMonth: true },
      { date: '2022-05-31', isCurrentMonth: true },
      { date: '2022-06-01' },
      { date: '2022-06-02' },
      { date: '2022-06-03' },
      { date: '2022-06-04' },
      { date: '2022-06-05' },
    ],
  },
  {
    name: 'June',
    days: [
      { date: '2022-05-30' },
      { date: '2022-05-31' },
      { date: '2022-06-01', isCurrentMonth: true },
      { date: '2022-06-02', isCurrentMonth: true },
      { date: '2022-06-03', isCurrentMonth: true },
      { date: '2022-06-04', isCurrentMonth: true },
      { date: '2022-06-05', isCurrentMonth: true },
      { date: '2022-06-06', isCurrentMonth: true },
      { date: '2022-06-07', isCurrentMonth: true },
      { date: '2022-06-08', isCurrentMonth: true },
      { date: '2022-06-09', isCurrentMonth: true },
      { date: '2022-06-10', isCurrentMonth: true },
      { date: '2022-06-11', isCurrentMonth: true },
      { date: '2022-06-12', isCurrentMonth: true },
      { date: '2022-06-13', isCurrentMonth: true },
      { date: '2022-06-14', isCurrentMonth: true },
      { date: '2022-06-15', isCurrentMonth: true },
      { date: '2022-06-16', isCurrentMonth: true },
      { date: '2022-06-17', isCurrentMonth: true },
      { date: '2022-06-18', isCurrentMonth: true },
      { date: '2022-06-19', isCurrentMonth: true },
      { date: '2022-06-20', isCurrentMonth: true },
      { date: '2022-06-21', isCurrentMonth: true },
      { date: '2022-06-22', isCurrentMonth: true },
      { date: '2022-06-23', isCurrentMonth: true },
      { date: '2022-06-24', isCurrentMonth: true },
      { date: '2022-06-25', isCurrentMonth: true },
      { date: '2022-06-26', isCurrentMonth: true },
      { date: '2022-06-27', isCurrentMonth: true },
      { date: '2022-06-28', isCurrentMonth: true },
      { date: '2022-06-29', isCurrentMonth: true },
      { date: '2022-06-30', isCurrentMonth: true },
      { date: '2022-07-01' },
      { date: '2022-07-02' },
      { date: '2022-07-03' },
      { date: '2022-07-04' },
      { date: '2022-07-05' },
      { date: '2022-07-06' },
      { date: '2022-07-07' },
      { date: '2022-07-08' },
      { date: '2022-07-09' },
      { date: '2022-07-10' },
    ],
  },
  {
    name: 'July',
    days: [
      { date: '2022-06-27' },
      { date: '2022-06-28' },
      { date: '2022-06-29' },
      { date: '2022-06-30' },
      { date: '2022-07-01', isCurrentMonth: true },
      { date: '2022-07-02', isCurrentMonth: true },
      { date: '2022-07-03', isCurrentMonth: true },
      { date: '2022-07-04', isCurrentMonth: true },
      { date: '2022-07-05', isCurrentMonth: true },
      { date: '2022-07-06', isCurrentMonth: true },
      { date: '2022-07-07', isCurrentMonth: true },
      { date: '2022-07-08', isCurrentMonth: true },
      { date: '2022-07-09', isCurrentMonth: true },
      { date: '2022-07-10', isCurrentMonth: true },
      { date: '2022-07-11', isCurrentMonth: true },
      { date: '2022-07-12', isCurrentMonth: true },
      { date: '2022-07-13', isCurrentMonth: true },
      { date: '2022-07-14', isCurrentMonth: true },
      { date: '2022-07-15', isCurrentMonth: true },
      { date: '2022-07-16', isCurrentMonth: true },
      { date: '2022-07-17', isCurrentMonth: true },
      { date: '2022-07-18', isCurrentMonth: true },
      { date: '2022-07-19', isCurrentMonth: true },
      { date: '2022-07-20', isCurrentMonth: true },
      { date: '2022-07-21', isCurrentMonth: true },
      { date: '2022-07-22', isCurrentMonth: true },
      { date: '2022-07-23', isCurrentMonth: true },
      { date: '2022-07-24', isCurrentMonth: true },
      { date: '2022-07-25', isCurrentMonth: true },
      { date: '2022-07-26', isCurrentMonth: true },
      { date: '2022-07-27', isCurrentMonth: true },
      { date: '2022-07-28', isCurrentMonth: true },
      { date: '2022-07-29', isCurrentMonth: true },
      { date: '2022-07-30', isCurrentMonth: true },
      { date: '2022-07-31', isCurrentMonth: true },
      { date: '2022-08-01' },
      { date: '2022-08-02' },
      { date: '2022-08-03' },
      { date: '2022-08-04' },
      { date: '2022-08-05' },
      { date: '2022-08-06' },
      { date: '2022-08-07' },
    ],
  },
  {
    name: 'August',
    days: [
      { date: '2022-08-01', isCurrentMonth: true },
      { date: '2022-08-02', isCurrentMonth: true },
      { date: '2022-08-03', isCurrentMonth: true },
      { date: '2022-08-04', isCurrentMonth: true },
      { date: '2022-08-05', isCurrentMonth: true },
      { date: '2022-08-06', isCurrentMonth: true },
      { date: '2022-08-07', isCurrentMonth: true },
      { date: '2022-08-08', isCurrentMonth: true },
      { date: '2022-08-09', isCurrentMonth: true },
      { date: '2022-08-10', isCurrentMonth: true },
      { date: '2022-08-11', isCurrentMonth: true },
      { date: '2022-08-12', isCurrentMonth: true },
      { date: '2022-08-13', isCurrentMonth: true },
      { date: '2022-08-14', isCurrentMonth: true },
      { date: '2022-08-15', isCurrentMonth: true },
      { date: '2022-08-16', isCurrentMonth: true },
      { date: '2022-08-17', isCurrentMonth: true },
      { date: '2022-08-18', isCurrentMonth: true },
      { date: '2022-08-19', isCurrentMonth: true },
      { date: '2022-08-20', isCurrentMonth: true },
      { date: '2022-08-21', isCurrentMonth: true },
      { date: '2022-08-22', isCurrentMonth: true },
      { date: '2022-08-23', isCurrentMonth: true },
      { date: '2022-08-24', isCurrentMonth: true },
      { date: '2022-08-25', isCurrentMonth: true },
      { date: '2022-08-26', isCurrentMonth: true },
      { date: '2022-08-27', isCurrentMonth: true },
      { date: '2022-08-28', isCurrentMonth: true },
      { date: '2022-08-29', isCurrentMonth: true },
      { date: '2022-08-30', isCurrentMonth: true },
      { date: '2022-08-31', isCurrentMonth: true },
      { date: '2022-09-01' },
      { date: '2022-09-02' },
      { date: '2022-09-03' },
      { date: '2022-09-04' },
      { date: '2022-09-05' },
      { date: '2022-09-06' },
      { date: '2022-09-07' },
      { date: '2022-09-08' },
      { date: '2022-09-09' },
      { date: '2022-09-10' },
      { date: '2022-09-11' },
    ],
  },
  {
    name: 'September',
    days: [
      { date: '2022-08-29' },
      { date: '2022-08-30' },
      { date: '2022-08-31' },
      { date: '2022-09-01', isCurrentMonth: true },
      { date: '2022-09-02', isCurrentMonth: true },
      { date: '2022-09-03', isCurrentMonth: true },
      { date: '2022-09-04', isCurrentMonth: true },
      { date: '2022-09-05', isCurrentMonth: true },
      { date: '2022-09-06', isCurrentMonth: true },
      { date: '2022-09-07', isCurrentMonth: true },
      { date: '2022-09-08', isCurrentMonth: true },
      { date: '2022-09-09', isCurrentMonth: true },
      { date: '2022-09-10', isCurrentMonth: true },
      { date: '2022-09-11', isCurrentMonth: true },
      { date: '2022-09-12', isCurrentMonth: true },
      { date: '2022-09-13', isCurrentMonth: true },
      { date: '2022-09-14', isCurrentMonth: true },
      { date: '2022-09-15', isCurrentMonth: true },
      { date: '2022-09-16', isCurrentMonth: true },
      { date: '2022-09-17', isCurrentMonth: true },
      { date: '2022-09-18', isCurrentMonth: true },
      { date: '2022-09-19', isCurrentMonth: true },
      { date: '2022-09-20', isCurrentMonth: true },
      { date: '2022-09-21', isCurrentMonth: true },
      { date: '2022-09-22', isCurrentMonth: true },
      { date: '2022-09-23', isCurrentMonth: true },
      { date: '2022-09-24', isCurrentMonth: true },
      { date: '2022-09-25', isCurrentMonth: true },
      { date: '2022-09-26', isCurrentMonth: true },
      { date: '2022-09-27', isCurrentMonth: true },
      { date: '2022-09-28', isCurrentMonth: true },
      { date: '2022-09-29', isCurrentMonth: true },
      { date: '2022-09-30', isCurrentMonth: true },
      { date: '2022-10-01' },
      { date: '2022-10-02' },
      { date: '2022-10-03' },
      { date: '2022-10-04' },
      { date: '2022-10-05' },
      { date: '2022-10-06' },
      { date: '2022-10-07' },
      { date: '2022-10-08' },
      { date: '2022-10-09' },
    ],
  },
  {
    name: 'October',
    days: [
      { date: '2022-09-26' },
      { date: '2022-09-27' },
      { date: '2022-09-28' },
      { date: '2022-09-29' },
      { date: '2022-09-30' },
      { date: '2022-10-01', isCurrentMonth: true },
      { date: '2022-10-02', isCurrentMonth: true },
      { date: '2022-10-03', isCurrentMonth: true },
      { date: '2022-10-04', isCurrentMonth: true },
      { date: '2022-10-05', isCurrentMonth: true },
      { date: '2022-10-06', isCurrentMonth: true },
      { date: '2022-10-07', isCurrentMonth: true },
      { date: '2022-10-08', isCurrentMonth: true },
      { date: '2022-10-09', isCurrentMonth: true },
      { date: '2022-10-10', isCurrentMonth: true },
      { date: '2022-10-11', isCurrentMonth: true },
      { date: '2022-10-12', isCurrentMonth: true },
      { date: '2022-10-13', isCurrentMonth: true },
      { date: '2022-10-14', isCurrentMonth: true },
      { date: '2022-10-15', isCurrentMonth: true },
      { date: '2022-10-16', isCurrentMonth: true },
      { date: '2022-10-17', isCurrentMonth: true },
      { date: '2022-10-18', isCurrentMonth: true },
      { date: '2022-10-19', isCurrentMonth: true },
      { date: '2022-10-20', isCurrentMonth: true },
      { date: '2022-10-21', isCurrentMonth: true },
      { date: '2022-10-22', isCurrentMonth: true },
      { date: '2022-10-23', isCurrentMonth: true },
      { date: '2022-10-24', isCurrentMonth: true },
      { date: '2022-10-25', isCurrentMonth: true },
      { date: '2022-10-26', isCurrentMonth: true },
      { date: '2022-10-27', isCurrentMonth: true },
      { date: '2022-10-28', isCurrentMonth: true },
      { date: '2022-10-29', isCurrentMonth: true },
      { date: '2022-10-30', isCurrentMonth: true },
      { date: '2022-10-31', isCurrentMonth: true },
      { date: '2022-11-01' },
      { date: '2022-11-02' },
      { date: '2022-11-03' },
      { date: '2022-11-04' },
      { date: '2022-11-05' },
      { date: '2022-11-06' },
    ],
  },
  {
    name: 'November',
    days: [
      { date: '2022-10-31' },
      { date: '2022-11-01', isCurrentMonth: true },
      { date: '2022-11-02', isCurrentMonth: true },
      { date: '2022-11-03', isCurrentMonth: true },
      { date: '2022-11-04', isCurrentMonth: true },
      { date: '2022-11-05', isCurrentMonth: true },
      { date: '2022-11-06', isCurrentMonth: true },
      { date: '2022-11-07', isCurrentMonth: true },
      { date: '2022-11-08', isCurrentMonth: true },
      { date: '2022-11-09', isCurrentMonth: true },
      { date: '2022-11-10', isCurrentMonth: true },
      { date: '2022-11-11', isCurrentMonth: true },
      { date: '2022-11-12', isCurrentMonth: true },
      { date: '2022-11-13', isCurrentMonth: true },
      { date: '2022-11-14', isCurrentMonth: true },
      { date: '2022-11-15', isCurrentMonth: true },
      { date: '2022-11-16', isCurrentMonth: true },
      { date: '2022-11-17', isCurrentMonth: true },
      { date: '2022-11-18', isCurrentMonth: true },
      { date: '2022-11-19', isCurrentMonth: true },
      { date: '2022-11-20', isCurrentMonth: true },
      { date: '2022-11-21', isCurrentMonth: true },
      { date: '2022-11-22', isCurrentMonth: true },
      { date: '2022-11-23', isCurrentMonth: true },
      { date: '2022-11-24', isCurrentMonth: true },
      { date: '2022-11-25', isCurrentMonth: true },
      { date: '2022-11-26', isCurrentMonth: true },
      { date: '2022-11-27', isCurrentMonth: true },
      { date: '2022-11-28', isCurrentMonth: true },
      { date: '2022-11-29', isCurrentMonth: true },
      { date: '2022-11-30', isCurrentMonth: true },
      { date: '2022-12-01' },
      { date: '2022-12-02' },
      { date: '2022-12-03' },
      { date: '2022-12-04' },
      { date: '2022-12-05' },
      { date: '2022-12-06' },
      { date: '2022-12-07' },
      { date: '2022-12-08' },
      { date: '2022-12-09' },
      { date: '2022-12-10' },
      { date: '2022-12-11' },
    ],
  },
  {
    name: 'December',
    days: [
      { date: '2022-11-28' },
      { date: '2022-11-29' },
      { date: '2022-11-30' },
      { date: '2022-12-01', isCurrentMonth: true },
      { date: '2022-12-02', isCurrentMonth: true },
      { date: '2022-12-03', isCurrentMonth: true },
      { date: '2022-12-04', isCurrentMonth: true },
      { date: '2022-12-05', isCurrentMonth: true },
      { date: '2022-12-06', isCurrentMonth: true },
      { date: '2022-12-07', isCurrentMonth: true },
      { date: '2022-12-08', isCurrentMonth: true },
      { date: '2022-12-09', isCurrentMonth: true },
      { date: '2022-12-10', isCurrentMonth: true },
      { date: '2022-12-11', isCurrentMonth: true },
      { date: '2022-12-12', isCurrentMonth: true },
      { date: '2022-12-13', isCurrentMonth: true },
      { date: '2022-12-14', isCurrentMonth: true },
      { date: '2022-12-15', isCurrentMonth: true },
      { date: '2022-12-16', isCurrentMonth: true },
      { date: '2022-12-17', isCurrentMonth: true },
      { date: '2022-12-18', isCurrentMonth: true },
      { date: '2022-12-19', isCurrentMonth: true },
      { date: '2022-12-20', isCurrentMonth: true },
      { date: '2022-12-21', isCurrentMonth: true },
      { date: '2022-12-22', isCurrentMonth: true },
      { date: '2022-12-23', isCurrentMonth: true },
      { date: '2022-12-24', isCurrentMonth: true },
      { date: '2022-12-25', isCurrentMonth: true },
      { date: '2022-12-26', isCurrentMonth: true },
      { date: '2022-12-27', isCurrentMonth: true },
      { date: '2022-12-28', isCurrentMonth: true },
      { date: '2022-12-29', isCurrentMonth: true },
      { date: '2022-12-30', isCurrentMonth: true },
      { date: '2022-12-31', isCurrentMonth: true },
      { date: '2023-01-01' },
      { date: '2023-01-02' },
      { date: '2023-01-03' },
      { date: '2023-01-04' },
      { date: '2023-01-05' },
      { date: '2023-01-06' },
      { date: '2023-01-07' },
      { date: '2023-01-08' },
    ],
  },
]

export default function Example() {
  return (
    <div>
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/10 dark:bg-gray-800/50">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
          <time dateTime={2022}>2022</time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-xs outline -outline-offset-1 outline-gray-300 md:items-stretch dark:bg-white/10 dark:shadow-none dark:outline-white/5">
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50 dark:hover:text-white dark:md:hover:bg-white/10"
            >
              <span className="sr-only">Previous year</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              className="hidden px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block dark:text-white dark:hover:bg-white/10"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden dark:bg-white/10" />
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50 dark:hover:text-white dark:md:hover:bg-white/10"
            >
              <span className="sr-only">Next year</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <MenuButton
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
              >
                Year view
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/5"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Day view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Week view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Month view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Year view
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
            <div className="ml-6 h-6 w-px bg-gray-300 dark:bg-white/10" />
            <button
              type="button"
              className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Add event
            </button>
          </div>
          <div className="ml-6 md:hidden">
            <Menu as="div" className="relative">
              <MenuButton className="relative flex items-center rounded-full text-gray-400 outline-offset-8 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white">
                <span className="absolute -inset-2" />
                <span className="sr-only">Open menu</span>
                <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:divide-white/10 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/5"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Create event
                    </a>
                  </MenuItem>
                </div>
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Go to today
                    </a>
                  </MenuItem>
                </div>
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Day view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Week view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Month view
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                    >
                      Year view
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </header>
      <div className="bg-white dark:bg-gray-900">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-8 gap-y-16 px-4 py-16 sm:grid-cols-2 sm:px-6 xl:max-w-none xl:grid-cols-3 xl:px-8 2xl:grid-cols-4">
          {months.map((month) => (
            <section key={month.name} className="text-center">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{month.name}</h2>
              <div className="mt-6 grid grid-cols-7 text-xs/6 text-gray-500 dark:text-gray-400">
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
                <div>S</div>
              </div>
              <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow-sm ring-1 ring-gray-200 dark:bg-white/10 dark:shadow-none dark:ring-white/10">
                {month.days.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    data-is-today={day.isToday ? '' : undefined}
                    data-is-current-month={day.isCurrentMonth ? '' : undefined}
                    className="relative bg-gray-50 py-1.5 text-gray-400 first:rounded-tl-lg last:rounded-br-lg hover:bg-gray-100 focus:z-10 data-is-current-month:bg-white data-is-current-month:text-gray-900 data-is-current-month:hover:bg-gray-100 nth-36:rounded-bl-lg nth-7:rounded-tr-lg dark:bg-gray-900/75 dark:text-gray-500 dark:hover:bg-gray-900/25 dark:data-is-current-month:bg-gray-900 dark:data-is-current-month:text-gray-100 dark:data-is-current-month:hover:bg-gray-900/50"
                  >
                    <time
                      dateTime={day.date}
                      className="mx-auto flex size-7 items-center justify-center rounded-full in-data-is-today:bg-indigo-600 in-data-is-today:font-semibold in-data-is-today:text-white dark:in-data-is-today:bg-indigo-500"
                    >
                      {day.date.split('-').pop().replace(/^0/, '')}
                    </time>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 6. Double
// =============================================================================
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

const months = [
  {
    name: 'January',
    days: [
      { date: '2021-12-27' },
      { date: '2021-12-28' },
      { date: '2021-12-29' },
      { date: '2021-12-30' },
      { date: '2021-12-31' },
      { date: '2022-01-01', isCurrentMonth: true },
      { date: '2022-01-02', isCurrentMonth: true },
      { date: '2022-01-03', isCurrentMonth: true },
      { date: '2022-01-04', isCurrentMonth: true },
      { date: '2022-01-05', isCurrentMonth: true },
      { date: '2022-01-06', isCurrentMonth: true },
      { date: '2022-01-07', isCurrentMonth: true },
      { date: '2022-01-08', isCurrentMonth: true },
      { date: '2022-01-09', isCurrentMonth: true },
      { date: '2022-01-10', isCurrentMonth: true },
      { date: '2022-01-11', isCurrentMonth: true },
      { date: '2022-01-12', isCurrentMonth: true, isToday: true },
      { date: '2022-01-13', isCurrentMonth: true },
      { date: '2022-01-14', isCurrentMonth: true },
      { date: '2022-01-15', isCurrentMonth: true },
      { date: '2022-01-16', isCurrentMonth: true },
      { date: '2022-01-17', isCurrentMonth: true },
      { date: '2022-01-18', isCurrentMonth: true },
      { date: '2022-01-19', isCurrentMonth: true },
      { date: '2022-01-20', isCurrentMonth: true },
      { date: '2022-01-21', isCurrentMonth: true },
      { date: '2022-01-22', isCurrentMonth: true },
      { date: '2022-01-23', isCurrentMonth: true },
      { date: '2022-01-24', isCurrentMonth: true },
      { date: '2022-01-25', isCurrentMonth: true },
      { date: '2022-01-26', isCurrentMonth: true },
      { date: '2022-01-27', isCurrentMonth: true },
      { date: '2022-01-28', isCurrentMonth: true },
      { date: '2022-01-29', isCurrentMonth: true },
      { date: '2022-01-30', isCurrentMonth: true },
      { date: '2022-01-31', isCurrentMonth: true },
      { date: '2022-02-01' },
      { date: '2022-02-02' },
      { date: '2022-02-03' },
      { date: '2022-02-04' },
      { date: '2022-02-05' },
      { date: '2022-02-06' },
    ],
  },
  {
    name: 'February',
    days: [
      { date: '2022-01-31' },
      { date: '2022-02-01', isCurrentMonth: true },
      { date: '2022-02-02', isCurrentMonth: true },
      { date: '2022-02-03', isCurrentMonth: true },
      { date: '2022-02-04', isCurrentMonth: true },
      { date: '2022-02-05', isCurrentMonth: true },
      { date: '2022-02-06', isCurrentMonth: true },
      { date: '2022-02-07', isCurrentMonth: true },
      { date: '2022-02-08', isCurrentMonth: true },
      { date: '2022-02-09', isCurrentMonth: true },
      { date: '2022-02-10', isCurrentMonth: true },
      { date: '2022-02-11', isCurrentMonth: true },
      { date: '2022-02-12', isCurrentMonth: true },
      { date: '2022-02-13', isCurrentMonth: true },
      { date: '2022-02-14', isCurrentMonth: true },
      { date: '2022-02-15', isCurrentMonth: true },
      { date: '2022-02-16', isCurrentMonth: true },
      { date: '2022-02-17', isCurrentMonth: true },
      { date: '2022-02-18', isCurrentMonth: true },
      { date: '2022-02-19', isCurrentMonth: true },
      { date: '2022-02-20', isCurrentMonth: true },
      { date: '2022-02-21', isCurrentMonth: true },
      { date: '2022-02-22', isCurrentMonth: true },
      { date: '2022-02-23', isCurrentMonth: true },
      { date: '2022-02-24', isCurrentMonth: true },
      { date: '2022-02-25', isCurrentMonth: true },
      { date: '2022-02-26', isCurrentMonth: true },
      { date: '2022-02-27', isCurrentMonth: true },
      { date: '2022-02-28', isCurrentMonth: true },
      { date: '2022-03-01' },
      { date: '2022-03-02' },
      { date: '2022-03-03' },
      { date: '2022-03-04' },
      { date: '2022-03-05' },
      { date: '2022-03-06' },
      { date: '2022-03-07' },
      { date: '2022-03-08' },
      { date: '2022-03-09' },
      { date: '2022-03-10' },
      { date: '2022-03-11' },
      { date: '2022-03-12' },
      { date: '2022-03-13' },
    ],
  },
]

export default function Example() {
  return (
    <div>
      <div className="relative grid grid-cols-1 gap-x-14 md:grid-cols-2">
        <button
          type="button"
          className="absolute -top-1 -left-1.5 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white"
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeftIcon aria-hidden="true" className="size-5" />
        </button>
        <button
          type="button"
          className="absolute -top-1 -right-1.5 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white"
        >
          <span className="sr-only">Next month</span>
          <ChevronRightIcon aria-hidden="true" className="size-5" />
        </button>
        {months.map((month, monthIdx) => (
          <section key={monthIdx} className="text-center last:max-md:hidden">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{month.name}</h2>
            <div className="mt-6 grid grid-cols-7 text-xs/6 text-gray-500 dark:text-gray-400">
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>
            <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow-sm ring-1 ring-gray-200 dark:bg-white/10 dark:shadow-none dark:ring-white/10">
              {month.days.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  data-is-today={day.isToday ? '' : undefined}
                  data-is-current-month={day.isCurrentMonth ? '' : undefined}
                  className="relative bg-gray-50 py-1.5 text-gray-400 first:rounded-tl-lg last:rounded-br-lg hover:bg-gray-100 focus:z-10 data-is-current-month:bg-white data-is-current-month:text-gray-900 data-is-current-month:hover:bg-gray-100 nth-36:rounded-bl-lg nth-7:rounded-tr-lg dark:bg-gray-900/75 dark:text-gray-500 dark:hover:bg-gray-900/25 dark:data-is-current-month:bg-gray-900 dark:data-is-current-month:text-gray-100 dark:data-is-current-month:hover:bg-gray-900/50"
                >
                  <time
                    dateTime={day.date}
                    className="mx-auto flex size-7 items-center justify-center rounded-full in-data-is-today:bg-indigo-600 in-data-is-today:font-semibold in-data-is-today:text-white dark:in-data-is-today:bg-indigo-500"
                  >
                    {day.date.split('-').pop().replace(/^0/, '')}
                  </time>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="mt-12">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming events</h2>
        <ol className="mt-2 divide-y divide-gray-200 text-sm/6 text-gray-500 dark:divide-white/10 dark:text-gray-400">
          <li className="py-4 sm:flex">
            <time dateTime="2022-01-17" className="w-28 flex-none">
              Wed, Jan 12
            </time>
            <p className="mt-2 flex-auto sm:mt-0">Nothing on today’s schedule</p>
          </li>
          <li className="py-4 sm:flex">
            <time dateTime="2022-01-19" className="w-28 flex-none">
              Thu, Jan 13
            </time>
            <p className="mt-2 flex-auto font-semibold text-gray-900 sm:mt-0 dark:text-white">
              View house with real estate agent
            </p>
            <p className="flex-none sm:ml-6">
              <time dateTime="2022-01-13T14:30">2:30 PM</time> - <time dateTime="2022-01-13T16:30">4:30 PM</time>
            </p>
          </li>
          <li className="py-4 sm:flex">
            <time dateTime="2022-01-20" className="w-28 flex-none">
              Fri, Jan 14
            </time>
            <p className="mt-2 flex-auto font-semibold text-gray-900 sm:mt-0 dark:text-white">
              Meeting with bank manager
            </p>
            <p className="flex-none sm:ml-6">All day</p>
          </li>
          <li className="py-4 sm:flex">
            <time dateTime="2022-01-18" className="w-28 flex-none">
              Mon, Jan 17
            </time>
            <p className="mt-2 flex-auto font-semibold text-gray-900 sm:mt-0 dark:text-white">
              Sign paperwork at lawyers
            </p>
            <p className="flex-none sm:ml-6">
              <time dateTime="2022-01-17T10:00">10:00 AM</time> - <time dateTime="2022-01-17T10:15">10:15 AM</time>
            </p>
          </li>
        </ol>
      </section>
    </div>
  )
}


// =============================================================================
// 7. Borderless stacked
// =============================================================================
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'

const meetings = [
  {
    id: 1,
    name: 'Leslie Alexander',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    start: '1:00 PM',
    startDatetime: '2022-01-21T13:00',
    end: '2:30 PM',
    endDatetime: '2022-01-21T14:30',
  },
  {
    id: 2,
    name: 'Michael Foster',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    start: '3:00 PM',
    startDatetime: '2022-01-21T15:00',
    end: '4:30 PM',
    endDatetime: '2022-01-21T16:30',
  },
  {
    id: 3,
    name: 'Dries Vincent',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    start: '5:00 PM',
    startDatetime: '2022-01-21T17:00',
    end: '6:30 PM',
    endDatetime: '2022-01-21T18:30',
  },
  {
    id: 4,
    name: 'Lindsay Walton',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    start: '7:00 PM',
    startDatetime: '2022-01-21T19:00',
    end: '8:30 PM',
    endDatetime: '2022-01-21T20:30',
  },
]
const days = [
  { date: '2021-12-27' },
  { date: '2021-12-28' },
  { date: '2021-12-29' },
  { date: '2021-12-30' },
  { date: '2021-12-31' },
  { date: '2022-01-01', isCurrentMonth: true },
  { date: '2022-01-02', isCurrentMonth: true },
  { date: '2022-01-03', isCurrentMonth: true },
  { date: '2022-01-04', isCurrentMonth: true },
  { date: '2022-01-05', isCurrentMonth: true },
  { date: '2022-01-06', isCurrentMonth: true },
  { date: '2022-01-07', isCurrentMonth: true },
  { date: '2022-01-08', isCurrentMonth: true },
  { date: '2022-01-09', isCurrentMonth: true },
  { date: '2022-01-10', isCurrentMonth: true },
  { date: '2022-01-11', isCurrentMonth: true },
  { date: '2022-01-12', isCurrentMonth: true, isToday: true },
  { date: '2022-01-13', isCurrentMonth: true },
  { date: '2022-01-14', isCurrentMonth: true },
  { date: '2022-01-15', isCurrentMonth: true },
  { date: '2022-01-16', isCurrentMonth: true },
  { date: '2022-01-17', isCurrentMonth: true },
  { date: '2022-01-18', isCurrentMonth: true },
  { date: '2022-01-19', isCurrentMonth: true },
  { date: '2022-01-20', isCurrentMonth: true },
  { date: '2022-01-21', isCurrentMonth: true, isSelected: true },
  { date: '2022-01-22', isCurrentMonth: true },
  { date: '2022-01-23', isCurrentMonth: true },
  { date: '2022-01-24', isCurrentMonth: true },
  { date: '2022-01-25', isCurrentMonth: true },
  { date: '2022-01-26', isCurrentMonth: true },
  { date: '2022-01-27', isCurrentMonth: true },
  { date: '2022-01-28', isCurrentMonth: true },
  { date: '2022-01-29', isCurrentMonth: true },
  { date: '2022-01-30', isCurrentMonth: true },
  { date: '2022-01-31', isCurrentMonth: true },
  { date: '2022-02-01' },
  { date: '2022-02-02' },
  { date: '2022-02-03' },
  { date: '2022-02-04' },
  { date: '2022-02-05' },
  { date: '2022-02-06' },
]

export default function Example() {
  return (
    <div>
      <div className="flex items-center">
        <h2 className="flex-auto text-sm font-semibold text-gray-900 dark:text-white">January 2022</h2>
        <button
          type="button"
          className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white"
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeftIcon aria-hidden="true" className="size-5" />
        </button>
        <button
          type="button"
          className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white"
        >
          <span className="sr-only">Next month</span>
          <ChevronRightIcon aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="mt-10 grid grid-cols-7 text-center text-xs/6 text-gray-500 dark:text-gray-400">
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
        <div>S</div>
      </div>
      <div className="mt-2 grid grid-cols-7 text-sm">
        {days.map((day, dayIdx) => (
          <div
            key={day.date}
            data-first-line={dayIdx <= 6 ? '' : undefined}
            className="py-2 not-data-first-line:border-t not-data-first-line:border-gray-200 dark:not-data-first-line:border-white/10"
          >
            <button
              type="button"
              data-is-today={day.isToday ? '' : undefined}
              data-is-selected={day.isSelected ? '' : undefined}
              data-is-current-month={day.isCurrentMonth ? '' : undefined}
              className="mx-auto flex size-8 items-center justify-center rounded-full not-data-is-selected:not-data-is-today:not-data-is-current-month:text-gray-400 not-data-is-selected:hover:bg-gray-200 not-data-is-selected:not-data-is-today:data-is-current-month:text-gray-900 data-is-selected:font-semibold data-is-selected:text-white data-is-selected:not-data-is-today:bg-gray-900 data-is-today:font-semibold not-data-is-selected:data-is-today:text-indigo-600 data-is-selected:data-is-today:bg-indigo-600 dark:not-data-is-selected:not-data-is-today:not-data-is-current-month:text-gray-500 dark:not-data-is-selected:hover:bg-white/10 dark:not-data-is-selected:not-data-is-today:data-is-current-month:text-white dark:data-is-selected:not-data-is-today:bg-white dark:data-is-selected:not-data-is-today:text-gray-900 dark:not-data-is-selected:data-is-today:text-indigo-400 dark:data-is-selected:data-is-today:bg-indigo-500"
            >
              <time dateTime={day.date}>{day.date.split('-').pop().replace(/^0/, '')}</time>
            </button>
          </div>
        ))}
      </div>
      <section className="mt-12">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Schedule for <time dateTime="2022-01-21">January 21, 2022</time>
        </h2>
        <ol className="mt-4 flex flex-col gap-y-1 text-sm/6 text-gray-500 dark:text-gray-400">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="group flex items-center gap-x-4 rounded-xl px-4 py-2 focus-within:bg-gray-100 hover:bg-gray-100 dark:focus-within:bg-white/5 dark:hover:bg-white/5"
            >
              <img alt="" src={meeting.imageUrl} className="size-10 flex-none rounded-full" />
              <div className="flex-auto">
                <p className="text-gray-900 dark:text-white">{meeting.name}</p>
                <p className="mt-0.5">
                  <time dateTime={meeting.startDatetime}>{meeting.start}</time> -{' '}
                  <time dateTime={meeting.endDatetime}>{meeting.end}</time>
                </p>
              </div>
              <Menu as="div" className="relative opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                <MenuButton className="relative flex items-center rounded-full text-gray-500 outline-offset-6 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white">
                  <span className="absolute -inset-2" />
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon aria-hidden="true" className="size-6" />
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                >
                  <div className="py-1">
                    <MenuItem>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                      >
                        Edit
                      </a>
                    </MenuItem>
                    <MenuItem>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                      >
                        Cancel
                      </a>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}


// =============================================================================
// 8. Borderless side-by-side
// =============================================================================
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'

const meetings = [
  {
    id: 1,
    name: 'Leslie Alexander',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    start: '1:00 PM',
    startDatetime: '2022-01-21T13:00',
    end: '2:30 PM',
    endDatetime: '2022-01-21T14:30',
  },
  {
    id: 2,
    name: 'Michael Foster',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    start: '3:00 PM',
    startDatetime: '2022-01-21T15:00',
    end: '4:30 PM',
    endDatetime: '2022-01-21T16:30',
  },
  {
    id: 3,
    name: 'Dries Vincent',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    start: '5:00 PM',
    startDatetime: '2022-01-21T17:00',
    end: '6:30 PM',
    endDatetime: '2022-01-21T18:30',
  },
  {
    id: 4,
    name: 'Lindsay Walton',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    start: '7:00 PM',
    startDatetime: '2022-01-21T19:00',
    end: '8:30 PM',
    endDatetime: '2022-01-21T20:30',
  },
  {
    id: 5,
    name: 'Courtney Henry',
    imageUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    start: '9:00 PM',
    startDatetime: '2022-01-21T21:00',
    end: '10:30 PM',
    endDatetime: '2022-01-21T22:30',
  },
]
const days = [
  { date: '2021-12-27' },
  { date: '2021-12-28' },
  { date: '2021-12-29' },
  { date: '2021-12-30' },
  { date: '2021-12-31' },
  { date: '2022-01-01', isCurrentMonth: true },
  { date: '2022-01-02', isCurrentMonth: true },
  { date: '2022-01-03', isCurrentMonth: true },
  { date: '2022-01-04', isCurrentMonth: true },
  { date: '2022-01-05', isCurrentMonth: true },
  { date: '2022-01-06', isCurrentMonth: true },
  { date: '2022-01-07', isCurrentMonth: true },
  { date: '2022-01-08', isCurrentMonth: true },
  { date: '2022-01-09', isCurrentMonth: true },
  { date: '2022-01-10', isCurrentMonth: true },
  { date: '2022-01-11', isCurrentMonth: true },
  { date: '2022-01-12', isCurrentMonth: true, isToday: true },
  { date: '2022-01-13', isCurrentMonth: true },
  { date: '2022-01-14', isCurrentMonth: true },
  { date: '2022-01-15', isCurrentMonth: true },
  { date: '2022-01-16', isCurrentMonth: true },
  { date: '2022-01-17', isCurrentMonth: true },
  { date: '2022-01-18', isCurrentMonth: true },
  { date: '2022-01-19', isCurrentMonth: true },
  { date: '2022-01-20', isCurrentMonth: true },
  { date: '2022-01-21', isCurrentMonth: true, isSelected: true },
  { date: '2022-01-22', isCurrentMonth: true },
  { date: '2022-01-23', isCurrentMonth: true },
  { date: '2022-01-24', isCurrentMonth: true },
  { date: '2022-01-25', isCurrentMonth: true },
  { date: '2022-01-26', isCurrentMonth: true },
  { date: '2022-01-27', isCurrentMonth: true },
  { date: '2022-01-28', isCurrentMonth: true },
  { date: '2022-01-29', isCurrentMonth: true },
  { date: '2022-01-30', isCurrentMonth: true },
  { date: '2022-01-31', isCurrentMonth: true },
  { date: '2022-02-01' },
  { date: '2022-02-02' },
  { date: '2022-02-03' },
  { date: '2022-02-04' },
  { date: '2022-02-05' },
  { date: '2022-02-06' },
]

export default function Example() {
  return (
    <div className="md:grid md:grid-cols-2 md:divide-x md:divide-gray-200 dark:md:divide-white/10">
      <div className="md:pr-14">
        <div className="flex items-center">
          <h2 className="flex-auto text-sm font-semibold text-gray-900 dark:text-white">January 2022</h2>
          <button
            type="button"
            className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white"
          >
            <span className="sr-only">Previous month</span>
            <ChevronLeftIcon aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white"
          >
            <span className="sr-only">Next month</span>
            <ChevronRightIcon aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="mt-10 grid grid-cols-7 text-center text-xs/6 text-gray-500 dark:text-gray-400">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>
        <div className="mt-2 grid grid-cols-7 text-sm">
          {days.map((day, dayIdx) => (
            <div
              key={day.date}
              data-first-line={dayIdx <= 6 ? '' : undefined}
              className="py-2 not-data-first-line:border-t not-data-first-line:border-gray-200 dark:not-data-first-line:border-white/10"
            >
              <button
                type="button"
                data-is-today={day.isToday ? '' : undefined}
                data-is-selected={day.isSelected ? '' : undefined}
                data-is-current-month={day.isCurrentMonth ? '' : undefined}
                className="mx-auto flex size-8 items-center justify-center rounded-full not-data-is-selected:not-data-is-today:not-data-is-current-month:text-gray-400 not-data-is-selected:hover:bg-gray-200 not-data-is-selected:not-data-is-today:data-is-current-month:text-gray-900 data-is-selected:font-semibold data-is-selected:text-white data-is-selected:not-data-is-today:bg-gray-900 data-is-today:font-semibold not-data-is-selected:data-is-today:text-indigo-600 data-is-selected:data-is-today:bg-indigo-600 dark:not-data-is-selected:not-data-is-today:not-data-is-current-month:text-gray-500 dark:not-data-is-selected:hover:bg-white/10 dark:not-data-is-selected:not-data-is-today:data-is-current-month:text-white dark:data-is-selected:not-data-is-today:bg-white dark:data-is-selected:not-data-is-today:text-gray-900 dark:not-data-is-selected:data-is-today:text-indigo-400 dark:data-is-selected:data-is-today:bg-indigo-500"
              >
                <time dateTime={day.date}>{day.date.split('-').pop().replace(/^0/, '')}</time>
              </button>
            </div>
          ))}
        </div>
      </div>
      <section className="mt-12 md:mt-0 md:pl-14">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Schedule for <time dateTime="2022-01-21">January 21, 2022</time>
        </h2>
        <ol className="mt-4 flex flex-col gap-y-1 text-sm/6 text-gray-500 dark:text-gray-400">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="group flex items-center gap-x-4 rounded-xl px-4 py-2 focus-within:bg-gray-100 hover:bg-gray-100 dark:focus-within:bg-white/5 dark:hover:bg-white/5"
            >
              <img
                alt=""
                src={meeting.imageUrl}
                className="size-10 flex-none rounded-full dark:outline dark:-outline-offset-1 dark:outline-white/10"
              />
              <div className="flex-auto">
                <p className="text-gray-900 dark:text-white">{meeting.name}</p>
                <p className="mt-0.5">
                  <time dateTime={meeting.startDatetime}>{meeting.start}</time> -{' '}
                  <time dateTime={meeting.endDatetime}>{meeting.end}</time>
                </p>
              </div>
              <Menu as="div" className="relative opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                <MenuButton className="relative flex items-center rounded-full text-gray-500 outline-offset-6 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white">
                  <span className="absolute -inset-2" />
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon aria-hidden="true" className="size-6" />
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                >
                  <div className="py-1">
                    <MenuItem>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                      >
                        Edit
                      </a>
                    </MenuItem>
                    <MenuItem>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                      >
                        Cancel
                      </a>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}


