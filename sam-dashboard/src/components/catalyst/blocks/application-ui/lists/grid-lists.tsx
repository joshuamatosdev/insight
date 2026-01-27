// Tailwind Plus UI Blocks - Grid Lists
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/lists/grid-lists
// Format: React JSX (v4.1)
// Downloaded automatically

import { Grid, HStack, Flex, Stack } from '@/components/catalyst/layout';
import { EnvelopeIcon, PhoneIcon, EllipsisVerticalIcon, EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import {
  AcademicCapIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  ClockIcon,
  ReceiptRefundIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

function classNames(...classes: Array<string | boolean | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

// =============================================================================
// 1. Contact cards with small portraits
// =============================================================================
const people1 = [
  {
    name: 'Jane Cooper',
    title: 'Regional Paradigm Technician',
    role: 'Admin',
    email: 'janecooper@example.com',
    telephone: '+1-202-555-0170',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Cody Fisher',
    title: 'Product Directives Officer',
    role: 'Admin',
    email: 'codyfisher@example.com',
    telephone: '+1-202-555-0114',
    imageUrl:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Esther Howard',
    title: 'Forward Response Developer',
    email: 'estherhoward@example.com',
    telephone: '+1-202-555-0143',
    role: 'Admin',
    imageUrl:
      'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Jenny Wilson',
    title: 'Central Security Manager',
    role: 'Admin',
    email: 'jennywilson@example.com',
    telephone: '+1-202-555-0184',
    imageUrl:
      'https://images.unsplash.com/photo-1498551172505-8ee7ad69f235?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Kristin Watson',
    title: 'Lead Implementation Liaison',
    role: 'Admin',
    email: 'kristinwatson@example.com',
    telephone: '+1-202-555-0191',
    imageUrl:
      'https://images.unsplash.com/photo-1532417344469-368f9ae6d187?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Cameron Williamson',
    title: 'Internal Applications Engineer',
    role: 'Admin',
    email: 'cameronwilliamson@example.com',
    telephone: '+1-202-555-0108',
    imageUrl:
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
];

export function ContactCardsSmallPortraits() {
  return (
    <ul role="list">
      <Grid columns={1} gap="lg" className="sm:grid-cols-2 lg:grid-cols-3">
        {people1.map((person) => (
          <li
            key={person.email}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10"
          >
            <HStack spacing="lg" justify="between" className="w-full p-6">
              <Stack spacing="none" className="flex-1 truncate">
                <HStack spacing="sm">
                  <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">{person.name}</h3>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 inset-ring inset-ring-green-600/20 dark:bg-green-500/10 dark:text-green-500 dark:inset-ring-green-500/10">
                    {person.role}
                  </span>
                </HStack>
                <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">{person.title}</p>
              </Stack>
              <img
                alt=""
                src={person.imageUrl}
                className="size-10 shrink-0 rounded-full bg-gray-300 outline -outline-offset-1 outline-black/5 dark:bg-gray-700 dark:outline-white/10"
              />
            </HStack>
            <div>
              <Flex className="-mt-px divide-x divide-gray-200 dark:divide-white/10">
                <div className="flex w-0 flex-1">
                  <a
                    href={`mailto:${person.email}`}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    <EnvelopeIcon aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
                    Email
                  </a>
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <a
                    href={`tel:${person.telephone}`}
                    className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    <PhoneIcon aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
                    Call
                  </a>
                </div>
              </Flex>
            </div>
          </li>
        ))}
      </Grid>
    </ul>
  );
}


// =============================================================================
// 2. Contact cards
// =============================================================================
const people2 = [
  {
    name: 'Jane Cooper',
    title: 'Paradigm Representative',
    role: 'Admin',
    email: 'janecooper@example.com',
    telephone: '+1-202-555-0170',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Cody Fisher',
    title: 'Lead Security Associate',
    role: 'Admin',
    email: 'codyfisher@example.com',
    telephone: '+1-202-555-0114',
    imageUrl:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Esther Howard',
    title: 'Assurance Administrator',
    email: 'estherhoward@example.com',
    telephone: '+1-202-555-0143',
    role: 'Admin',
    imageUrl:
      'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Jenny Wilson',
    title: 'Chief Accountability Analyst',
    role: 'Admin',
    email: 'jennywilson@example.com',
    telephone: '+1-202-555-0184',
    imageUrl:
      'https://images.unsplash.com/photo-1498551172505-8ee7ad69f235?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Kristin Watson',
    title: 'Investor Data Orchestrator',
    role: 'Admin',
    email: 'kristinwatson@example.com',
    telephone: '+1-202-555-0191',
    imageUrl:
      'https://images.unsplash.com/photo-1532417344469-368f9ae6d187?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Cameron Williamson',
    title: 'Product Infrastructure Executive',
    role: 'Admin',
    email: 'cameronwilliamson@example.com',
    telephone: '+1-202-555-0108',
    imageUrl:
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Courtney Henry',
    title: 'Investor Factors Associate',
    role: 'Admin',
    email: 'courtneyhenry@example.com',
    telephone: '+1-202-555-0104',
    imageUrl:
      'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
  {
    name: 'Theresa Webb',
    title: 'Global Division Officer',
    role: 'Admin',
    email: 'theresawebb@example.com',
    telephone: '+1-202-555-0138',
    imageUrl:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
  },
];

export function ContactCards() {
  return (
    <ul role="list">
      <Grid columns={1} gap="lg" className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {people2.map((person) => (
          <li
            key={person.email}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10"
          >
            <Stack spacing="none" className="flex-1 p-8">
              <img
                alt=""
                src={person.imageUrl}
                className="mx-auto size-32 shrink-0 rounded-full bg-gray-300 outline -outline-offset-1 outline-black/5 dark:bg-gray-700 dark:outline-white/10"
              />
              <h3 className="mt-6 text-sm font-medium text-gray-900 dark:text-white">{person.name}</h3>
              <dl className="mt-1 flex grow flex-col justify-between">
                <dt className="sr-only">Title</dt>
                <dd className="text-sm text-gray-500 dark:text-gray-400">{person.title}</dd>
                <dt className="sr-only">Role</dt>
                <dd className="mt-3">
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 inset-ring inset-ring-green-600/20 dark:bg-green-500/10 dark:text-green-500 dark:inset-ring-green-500/10">
                    {person.role}
                  </span>
                </dd>
              </dl>
            </Stack>
            <div>
              <Flex className="-mt-px divide-x divide-gray-200 dark:divide-white/10">
                <div className="flex w-0 flex-1">
                  <a
                    href={`mailto:${person.email}`}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    <EnvelopeIcon aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
                    Email
                  </a>
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <a
                    href={`tel:${person.telephone}`}
                    className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    <PhoneIcon aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
                    Call
                  </a>
                </div>
              </Flex>
            </div>
          </li>
        ))}
      </Grid>
    </ul>
  );
}


// =============================================================================
// 3. Simple cards
// =============================================================================
const projects = [
  { name: 'Graph API', initials: 'GA', href: '#', members: 16, bgColor: 'bg-pink-600 dark:bg-pink-700' },
  { name: 'Component Design', initials: 'CD', href: '#', members: 12, bgColor: 'bg-purple-600 dark:bg-purple-700' },
  { name: 'Templates', initials: 'T', href: '#', members: 16, bgColor: 'bg-yellow-500 dark:bg-yellow-600' },
  { name: 'React Components', initials: 'RC', href: '#', members: 8, bgColor: 'bg-green-500 dark:bg-green-600' },
];

export function SimpleCards() {
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pinned Projects</h2>
      <ul role="list" className="mt-3">
        <Grid columns={1} gap="md" className="sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <li key={project.name} className="col-span-1">
              <Flex className="rounded-md shadow-xs dark:shadow-none">
                <div
                  className={classNames(
                    project.bgColor,
                    'flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white',
                  )}
                >
                  {project.initials}
                </div>
                <HStack justify="between" className="flex-1 truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800/50">
                  <div className="flex-1 truncate px-4 py-2 text-sm">
                    <a
                      href={project.href}
                      className="font-medium text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-200"
                    >
                      {project.name}
                    </a>
                    <p className="text-gray-500 dark:text-gray-400">{project.members} Members</p>
                  </div>
                  <div className="shrink-0 pr-2">
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:hover:text-white dark:focus:outline-white"
                    >
                      <span className="sr-only">Open options</span>
                      <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
                    </button>
                  </div>
                </HStack>
              </Flex>
            </li>
          ))}
        </Grid>
      </ul>
    </div>
  );
}


// =============================================================================
// 4. Horizontal link cards
// =============================================================================
const people4 = [
  {
    name: 'Leslie Alexander',
    email: 'leslie.alexander@example.com',
    role: 'Co-Founder / CEO',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Michael Foster',
    email: 'michael.foster@example.com',
    role: 'Co-Founder / CTO',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Dries Vincent',
    email: 'dries.vincent@example.com',
    role: 'Business Relations',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Lindsay Walton',
    email: 'lindsay.walton@example.com',
    role: 'Front-end Developer',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

export function HorizontalLinkCards() {
  return (
    <Grid columns={1} gap="md" className="sm:grid-cols-2">
      {people4.map((person) => (
        <HStack
          key={person.email}
          spacing="sm"
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-xs focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 hover:border-gray-400 dark:border-white/10 dark:bg-gray-800/50 dark:shadow-none dark:focus-within:outline-indigo-500 dark:hover:border-white/25"
        >
          <div className="shrink-0">
            <img
              alt=""
              src={person.imageUrl}
              className="size-10 rounded-full bg-gray-300 outline -outline-offset-1 outline-black/5 dark:bg-gray-700 dark:outline-white/10"
            />
          </div>
          <div className="min-w-0 flex-1">
            <a href="#" className="focus:outline-hidden">
              <span aria-hidden="true" className="absolute inset-0" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">{person.role}</p>
            </a>
          </div>
        </HStack>
      ))}
    </Grid>
  );
}


// =============================================================================
// 5. Actions with shared borders
// =============================================================================
const actions = [
  {
    title: 'Request time off',
    href: '#',
    icon: ClockIcon,
    iconForeground: 'text-teal-700 dark:text-teal-400',
    iconBackground: 'bg-teal-50 dark:bg-teal-500/10',
  },
  {
    title: 'Benefits',
    href: '#',
    icon: CheckBadgeIcon,
    iconForeground: 'text-purple-700 dark:text-purple-400',
    iconBackground: 'bg-purple-50 dark:bg-purple-500/10',
  },
  {
    title: 'Schedule a one-on-one',
    href: '#',
    icon: UsersIcon,
    iconForeground: 'text-sky-700 dark:text-sky-400',
    iconBackground: 'bg-sky-50 dark:bg-sky-500/10',
  },
  {
    title: 'Payroll',
    href: '#',
    icon: BanknotesIcon,
    iconForeground: 'text-yellow-700 dark:text-yellow-400',
    iconBackground: 'bg-yellow-50 dark:bg-yellow-500/10',
  },
  {
    title: 'Submit an expense',
    href: '#',
    icon: ReceiptRefundIcon,
    iconForeground: 'text-rose-700 dark:text-rose-400',
    iconBackground: 'bg-rose-50 dark:bg-rose-500/10',
  },
  {
    title: 'Training',
    href: '#',
    icon: AcademicCapIcon,
    iconForeground: 'text-indigo-700 dark:text-indigo-400',
    iconBackground: 'bg-indigo-50 dark:bg-indigo-500/10',
  },
];

export function ActionsWithSharedBorders() {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow-sm dark:divide-white/10 dark:bg-gray-900 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/20">
      <Grid columns={1} className="sm:grid-cols-2 sm:divide-y-0">
        {actions.map((action, actionIdx) => (
          <div
            key={action.title}
            className={classNames(
              actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
              actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
              actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
              actionIdx === actions.length - 1 ? 'rounded-br-lg rounded-bl-lg sm:rounded-bl-none' : '',
              'group relative border-gray-200 bg-white p-6 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 sm:odd:not-nth-last-2:border-b sm:even:border-l sm:even:not-last:border-b dark:border-white/10 dark:bg-gray-800/50 dark:focus-within:outline-indigo-500',
            )}
          >
            <div>
              <span className={classNames(action.iconBackground, action.iconForeground, 'inline-flex rounded-lg p-3')}>
                <action.icon aria-hidden="true" className="size-6" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                <a href={action.href} className="focus:outline-hidden">
                  {/* Extend touch target to entire panel */}
                  <span aria-hidden="true" className="absolute inset-0" />
                  {action.title}
                </a>
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Doloribus dolores nostrum quia qui natus officia quod et dolorem. Sit repellendus qui ut at blanditiis et
                quo et molestiae.
              </p>
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400 dark:text-gray-500 dark:group-hover:text-gray-200"
            >
              <svg fill="currentColor" viewBox="0 0 24 24" className="size-6">
                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
              </svg>
            </span>
          </div>
        ))}
      </Grid>
    </div>
  );
}


// =============================================================================
// 6. Images with details
// =============================================================================
const files = [
  {
    title: 'IMG_4985.HEIC',
    size: '3.9 MB',
    source:
      'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  },
  {
    title: 'IMG_5214.HEIC',
    size: '4 MB',
    source:
      'https://images.unsplash.com/photo-1614926857083-7be149266cda?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=512&q=80',
  },
  {
    title: 'IMG_3851.HEIC',
    size: '3.8 MB',
    source:
      'https://images.unsplash.com/photo-1614705827065-62c3dc488f40?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  },
  {
    title: 'IMG_4278.HEIC',
    size: '4.1 MB',
    source:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  },
  {
    title: 'IMG_6842.HEIC',
    size: '4 MB',
    source:
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  },
  {
    title: 'IMG_3284.HEIC',
    size: '3.9 MB',
    source:
      'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=512&q=80',
  },
  {
    title: 'IMG_4841.HEIC',
    size: '3.8 MB',
    source:
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  },
  {
    title: 'IMG_5644.HEIC',
    size: '4 MB',
    source:
      'https://images.unsplash.com/photo-1492724724894-7464c27d0ceb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  },
];

export function ImagesWithDetails() {
  return (
    <ul role="list">
      <Grid columns={2} columnGap="md" rowGap="xl" className="sm:grid-cols-3 lg:grid-cols-4">
        {files.map((file) => (
          <li key={file.source} className="relative">
            <div className="group overflow-hidden rounded-lg bg-gray-100 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 dark:bg-gray-800 dark:focus-within:outline-indigo-500">
              <img
                alt=""
                src={file.source}
                className="pointer-events-none aspect-10/7 rounded-lg object-cover outline -outline-offset-1 outline-black/5 group-hover:opacity-75 dark:outline-white/10"
              />
              <button type="button" className="absolute inset-0 focus:outline-hidden">
                <span className="sr-only">View details for {file.title}</span>
              </button>
            </div>
            <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900 dark:text-white">
              {file.title}
            </p>
            <p className="pointer-events-none block text-sm font-medium text-gray-500 dark:text-gray-400">{file.size}</p>
          </li>
        ))}
      </Grid>
    </ul>
  );
}


// =============================================================================
// 7. Logos cards with description list
// =============================================================================
const clients = [
  {
    id: 1,
    name: 'Tuple',
    imageUrl: 'https://tailwindcss.com/plus-assets/img/logos/48x48/tuple.svg',
    lastInvoice: { date: 'December 13, 2022', dateTime: '2022-12-13', amount: '$2,000.00', status: 'Overdue' },
  },
  {
    id: 2,
    name: 'SavvyCal',
    imageUrl: 'https://tailwindcss.com/plus-assets/img/logos/48x48/savvycal.svg',
    lastInvoice: { date: 'January 22, 2023', dateTime: '2023-01-22', amount: '$14,000.00', status: 'Paid' },
  },
  {
    id: 3,
    name: 'Reform',
    imageUrl: 'https://tailwindcss.com/plus-assets/img/logos/48x48/reform.svg',
    lastInvoice: { date: 'January 23, 2023', dateTime: '2023-01-23', amount: '$7,600.00', status: 'Paid' },
  },
];

export function LogosCardsWithDescriptionList() {
  return (
    <ul role="list">
      <Grid columns={1} columnGap="lg" rowGap="xl" className="lg:grid-cols-3">
        {clients.map((client) => (
          <li
            key={client.id}
            className="overflow-hidden rounded-xl outline outline-gray-200 dark:-outline-offset-1 dark:outline-white/10"
          >
            <HStack spacing="md" className="border-b border-gray-900/5 bg-gray-50 p-6 dark:border-white/10 dark:bg-gray-800/50">
              <img
                alt={client.name}
                src={client.imageUrl}
                className="size-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10 dark:bg-gray-700 dark:ring-white/10"
              />
              <div className="text-sm/6 font-medium text-gray-900 dark:text-white">{client.name}</div>
              <Menu as="div" className="relative ml-auto">
                <MenuButton className="relative block text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white">
                  <span className="absolute -inset-2.5" />
                  <span className="sr-only">Open options</span>
                  <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg outline-1 outline-gray-900/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                >
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden dark:text-white dark:data-focus:bg-white/5"
                    >
                      View<span className="sr-only">, {client.name}</span>
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden dark:text-white dark:data-focus:bg-white/5"
                    >
                      Edit<span className="sr-only">, {client.name}</span>
                    </a>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </HStack>
            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm/6 dark:divide-white/10">
              <Flex justify="between" className="gap-x-4 py-3">
                <dt className="text-gray-500 dark:text-gray-400">Last invoice</dt>
                <dd className="text-gray-700 dark:text-gray-300">
                  <time dateTime={client.lastInvoice.dateTime}>{client.lastInvoice.date}</time>
                </dd>
              </Flex>
              <Flex justify="between" className="gap-x-4 py-3">
                <dt className="text-gray-500 dark:text-gray-400">Amount</dt>
                <dd>
                  <HStack spacing="xs">
                    <div className="font-medium text-gray-900 dark:text-white">{client.lastInvoice.amount}</div>
                    {client.lastInvoice.status === 'Paid' ? (
                      <div className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-500 dark:ring-green-500/10">
                        {client.lastInvoice.status}
                      </div>
                    ) : null}
                    {client.lastInvoice.status === 'Withdraw' ? (
                      <div className="rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset dark:bg-white/5 dark:text-gray-400 dark:ring-white/10">
                        {client.lastInvoice.status}
                      </div>
                    ) : null}
                    {client.lastInvoice.status === 'Overdue' ? (
                      <div className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/10">
                        {client.lastInvoice.status}
                      </div>
                    ) : null}
                  </HStack>
                </dd>
              </Flex>
            </dl>
          </li>
        ))}
      </Grid>
    </ul>
  );
}


// Default export for backwards compatibility
export default ContactCardsSmallPortraits;
