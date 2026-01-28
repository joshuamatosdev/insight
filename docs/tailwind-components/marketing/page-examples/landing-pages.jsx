// Tailwind Plus UI Blocks - Landing Pages
// Source: https://tailwindcss.com/plus/ui-blocks/marketing/page-examples/landing-pages
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. With screenshots and stats
// =============================================================================
import {
  ArrowPathIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid'
import { BoltIcon, CalendarDaysIcon, UsersIcon } from '@heroicons/react/24/outline'

const primaryFeatures = [
  {
    name: 'Server monitoring',
    description:
      'Non quo aperiam repellendus quas est est. Eos aut dolore aut ut sit nesciunt. Ex tempora quia. Sit nobis consequatur dolores incidunt.',
    href: '#',
    icon: BoltIcon,
  },
  {
    name: 'Collaborate',
    description:
      'Vero eum voluptatem aliquid nostrum voluptatem. Vitae esse natus. Earum nihil deserunt eos quasi cupiditate. A inventore et molestiae natus.',
    href: '#',
    icon: UsersIcon,
  },
  {
    name: 'Task scheduling',
    description:
      'Et quod quaerat dolorem quaerat architecto aliquam accusantium. Ex adipisci et doloremque autem quia quam. Quis eos molestiae at iure impedit.',
    href: '#',
    icon: CalendarDaysIcon,
  },
]
const secondaryFeatures = [
  {
    name: 'Push to deploy.',
    description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'SSL certificates.',
    description: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
    icon: LockClosedIcon,
  },
  {
    name: 'Simple queues.',
    description: 'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Advanced security.',
    description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.',
    icon: FingerPrintIcon,
  },
  {
    name: 'Powerful API.',
    description: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
    icon: Cog6ToothIcon,
  },
  {
    name: 'Database backups.',
    description: 'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.',
    icon: ServerIcon,
  },
]
const stats = [
  { id: 1, name: 'Developers on the platform', value: '8,000+' },
  { id: 2, name: 'Daily requests', value: '900m+' },
  { id: 3, name: 'Uptime guarantee', value: '99.9%' },
  { id: 4, name: 'Projects deployed', value: '12m' },
]
const footerNavigation = {
  solutions: [
    { name: 'Hosting', href: '#' },
    { name: 'Data Services', href: '#' },
    { name: 'Uptime Monitoring', href: '#' },
    { name: 'Enterprise Services', href: '#' },
  ],
  support: [
    { name: 'Pricing', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'Guides', href: '#' },
    { name: 'API Reference', href: '#' },
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Jobs', href: '#' },
    { name: 'Press', href: '#' },
    { name: 'Partners', href: '#' },
  ],
  legal: [
    { name: 'Claim', href: '#' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'X',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
}

export default function Example() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <main>
        {/* Hero section */}
        <div className="relative isolate overflow-hidden bg-white dark:bg-gray-900">
          <svg
            aria-hidden="true"
            className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-gray-200 dark:stroke-white/10"
          >
            <defs>
              <pattern
                x="50%"
                y={-1}
                id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
                width={200}
                height={200}
                patternUnits="userSpaceOnUse"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={-1} className="overflow-visible fill-gray-50 dark:fill-gray-800/20">
              <path
                d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)" width="100%" height="100%" strokeWidth={0} />
          </svg>
          <div
            aria-hidden="true"
            className="absolute top-10 left-[calc(50%-4rem)] -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:top-[calc(50%-30rem)] lg:left-48 xl:left-[calc(50%-24rem)]"
          >
            <div
              style={{
                clipPath:
                  'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
              }}
              className="aspect-1108/632 w-277 bg-linear-to-r from-[#80caff] to-[#4f46e5] opacity-20"
            />
          </div>
          <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl shrink-0 lg:mx-0 lg:pt-8">
              <img
                alt="Your Company"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-11 dark:hidden"
              />
              <img
                alt="Your Company"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-11 not-dark:hidden"
              />
              <div className="mt-24 sm:mt-32 lg:mt-16">
                <a href="#" className="inline-flex space-x-6">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm/6 font-semibold text-indigo-600 ring-1 ring-indigo-600/20 ring-inset dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/25">
                    What's new
                  </span>
                  <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-gray-600 dark:text-gray-300">
                    <span>Just shipped v1.0</span>
                    <ChevronRightIcon aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
                  </span>
                </a>
              </div>
              <h1 className="mt-10 text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-7xl dark:text-white">
                Deploy to the cloud with confidence
              </h1>
              <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
                Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet
                fugiat veniam occaecat.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <a
                  href="#"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  Get started
                </a>
                <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:mt-0 lg:mr-0 lg:ml-10 lg:max-w-none lg:flex-none xl:ml-32">
              <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                <img
                  alt="App screenshot"
                  src="https://tailwindcss.com/plus-assets/img/component-images/project-app-screenshot.png"
                  width={2432}
                  height={1442}
                  className="w-304 rounded-md bg-gray-50 shadow-xl ring-1 ring-gray-900/10 dark:hidden"
                />
                <img
                  alt="App screenshot"
                  src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
                  width={2432}
                  height={1442}
                  className="w-304 rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 not-dark:hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo cloud */}
        <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:px-8">
          <h2 className="text-center text-lg/8 font-semibold text-gray-900 dark:text-white">
            The world’s most innovative companies use our app
          </h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            <img
              alt="Transistor"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
            />
            <img
              alt="Transistor"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
            />

            <img
              alt="Reform"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
            />
            <img
              alt="Reform"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
            />

            <img
              alt="Tuple"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
            />
            <img
              alt="Tuple"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
            />

            <img
              alt="SavvyCal"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 dark:hidden"
            />
            <img
              alt="SavvyCal"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden sm:col-start-2 lg:col-span-1"
            />

            <img
              alt="Statamic"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 dark:hidden"
            />
            <img
              alt="Statamic"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 col-start-2 max-h-12 w-full object-contain not-dark:hidden sm:col-start-auto lg:col-span-1"
            />
          </div>
        </div>

        {/* Feature section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Deploy faster</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance dark:text-white">
              Everything you need to deploy your app
            </p>
            <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
              Quis tellus eget adipiscing convallis sit sit eget aliquet quis. Suspendisse eget egestas a elementum
              pulvinar et feugiat blandit at. In mi viverra elit nunc.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {primaryFeatures.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="text-base/7 font-semibold text-gray-900 dark:text-white">
                    <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
                      <feature.icon aria-hidden="true" className="size-6 text-white" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600 dark:text-gray-400">
                    <p className="flex-auto">{feature.description}</p>
                    <p className="mt-6">
                      <a
                        href={feature.href}
                        className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Learn more <span aria-hidden="true">→</span>
                      </a>
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Feature section */}
        <div className="mt-32 sm:mt-56">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Everything you need</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl sm:text-balance dark:text-white">
                No server? No problem.
              </p>
              <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque,
                iste dolor cupiditate blanditiis.
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden pt-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <img
                alt="App screenshot"
                src="https://tailwindcss.com/plus-assets/img/component-images/project-app-screenshot.png"
                width={2432}
                height={1442}
                className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10 dark:hidden dark:ring-white/10"
              />
              <img
                alt="App screenshot"
                src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
                width={2432}
                height={1442}
                className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10 not-dark:hidden dark:ring-white/10"
              />
              <div aria-hidden="true" className="relative">
                <div className="absolute -inset-x-20 bottom-0 bg-linear-to-t from-white pt-[7%] dark:from-gray-900" />
              </div>
            </div>
          </div>
          <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
            <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base/7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16 dark:text-gray-400">
              {secondaryFeatures.map((feature) => (
                <div key={feature.name} className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900 dark:text-white">
                    <feature.icon
                      aria-hidden="true"
                      className="absolute top-1 left-1 size-5 text-indigo-600 dark:text-indigo-400"
                    />
                    {feature.name}
                  </dt>{' '}
                  <dd className="inline">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
            <h2 className="text-base/8 font-semibold text-indigo-600 dark:text-indigo-400">Our track record</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
              Trusted by thousands of creators&nbsp;worldwide
            </p>
            <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste
              dolor cupiditate blanditiis.
            </p>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-gray-900 sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4 dark:text-white">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="flex flex-col gap-y-3 border-l border-gray-900/15 pl-6 dark:border-white/10"
              >
                <dt className="text-sm/6">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* CTA section */}
        <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
          <svg
            aria-hidden="true"
            className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-gray-200 dark:stroke-white/10"
          >
            <defs>
              <pattern
                x="50%"
                y={0}
                id="1d4240dd-898f-445f-932d-e2872fd12de3"
                width={200}
                height={200}
                patternUnits="userSpaceOnUse"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={0} className="overflow-visible fill-gray-50 dark:fill-gray-800/20">
              <path
                d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect fill="url(#1d4240dd-898f-445f-932d-e2872fd12de3)" width="100%" height="100%" strokeWidth={0} />
          </svg>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-10 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
          >
            <div
              style={{
                clipPath:
                  'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
              }}
              className="aspect-1108/632 w-277 flex-none bg-linear-to-r from-[#80caff] to-[#4f46e5] opacity-20"
            />
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
              Boost your productivity. Start using our app today.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-600 dark:text-gray-300">
              Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim id veniam aliqua proident excepteur
              commodo do ea.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
              >
                Get started
              </a>
              <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="border-t border-gray-200 py-12 md:flex md:items-center md:justify-between dark:border-white/10">
          <div className="flex justify-center gap-x-6 md:order-2">
            {footerNavigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon aria-hidden="true" className="size-6" />
              </a>
            ))}
          </div>
          <p className="mt-8 text-center text-sm/6 text-gray-600 md:order-1 md:mt-0 dark:text-gray-400">
            &copy; 2024 Your Company, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}


// =============================================================================
// 2. With large screenshot and testimonial
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import {
  ArrowPathIcon,
  Bars3Icon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
]
const features = [
  {
    name: 'Push to deploy',
    description:
      'Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'SSL certificates',
    description:
      'Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.',
    icon: LockClosedIcon,
  },
  {
    name: 'Simple queues',
    description:
      'Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Advanced security',
    description:
      'Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.',
    icon: FingerPrintIcon,
  },
]
const tiers = [
  {
    name: 'Freelancer',
    id: 'tier-freelancer',
    href: '#',
    priceMonthly: '$19',
    description: 'The essentials to provide your best work for clients.',
    features: ['5 products', 'Up to 1,000 subscribers', 'Basic analytics', '48-hour support response time'],
    mostPopular: false,
  },
  {
    name: 'Startup',
    id: 'tier-startup',
    href: '#',
    priceMonthly: '$49',
    description: 'A plan that scales with your rapidly growing business.',
    features: [
      '25 products',
      'Up to 10,000 subscribers',
      'Advanced analytics',
      '24-hour support response time',
      'Marketing automations',
    ],
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    priceMonthly: '$99',
    description: 'Dedicated support and infrastructure for your company.',
    features: [
      'Unlimited products',
      'Unlimited subscribers',
      'Advanced analytics',
      '1-hour, dedicated support response time',
      'Marketing automations',
    ],
    mostPopular: false,
  },
]
const faqs = [
  {
    id: 1,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 2,
    question: 'How do you make holy water?',
    answer:
      'You boil the hell out of it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam aut tempora vitae odio inventore fuga aliquam nostrum quod porro. Delectus quia facere id sequi expedita natus.',
  },
  {
    id: 3,
    question: 'What do you call someone with no body and no nose?',
    answer:
      'Nobody knows. Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa, voluptas ipsa quia excepturi, quibusdam natus exercitationem sapiente tempore labore voluptatem.',
  },
  {
    id: 4,
    question: 'Why do you never see elephants hiding in trees?',
    answer:
      "Because they're so good at it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 5,
    question: "Why can't you hear a pterodactyl go to the bathroom?",
    answer:
      'Because the pee is silent. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsam, quas voluptatibus ex culpa ipsum, aspernatur blanditiis fugiat ullam magnam suscipit deserunt illum natus facilis atque vero consequatur! Quisquam, debitis error.',
  },
  {
    id: 6,
    question: 'Why did the invisible man turn down the job offer?',
    answer:
      "He couldn't see himself doing it. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eveniet perspiciatis officiis corrupti tenetur. Temporibus ut voluptatibus, perferendis sed unde rerum deserunt eius.",
  },
]
const footerNavigation = {
  solutions: [
    { name: 'Hosting', href: '#' },
    { name: 'Data services', href: '#' },
    { name: 'Uptime monitoring', href: '#' },
    { name: 'Enterprise services', href: '#' },
    { name: 'Analytics', href: '#' },
  ],
  support: [
    { name: 'Submit ticket', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'Guides', href: '#' },
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Jobs', href: '#' },
    { name: 'Press', href: '#' },
  ],
  legal: [
    { name: 'Terms of service', href: '#' },
    { name: 'Privacy policy', href: '#' },
    { name: 'License', href: '#' },
  ],
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto not-dark:hidden"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-gray-900 dark:sm:ring-gray-100/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto dark:hidden"
                />
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-8 w-auto not-dark:hidden"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-500/30">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <main className="isolate">
        {/* Hero section */}
        <div className="relative pt-14">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75 dark:opacity-20"
            />
          </div>
          <div className="py-24 sm:py-32 lg:pb-40">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
                  Deploy to the cloud with confidence
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
                  Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt
                  amet fugiat veniam occaecat.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                    href="#"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                  >
                    Get started
                  </a>
                  <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
              <div className="mt-16 flow-root sm:mt-24">
                <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-gray-900/10 ring-inset lg:-m-4 lg:rounded-2xl lg:p-4 dark:bg-white/2.5 dark:ring-white/10">
                  <img
                    alt="App screenshot"
                    src="https://tailwindcss.com/plus-assets/img/component-images/project-app-screenshot.png"
                    width={2432}
                    height={1442}
                    className="w-304 rounded-md bg-gray-50 shadow-xl ring-1 ring-gray-900/10 dark:hidden"
                  />
                  <img
                    alt="App screenshot"
                    src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
                    width={2432}
                    height={1442}
                    className="w-304 rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 not-dark:hidden"
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75 dark:opacity-20"
            />
          </div>
        </div>

        {/* Logo cloud */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            <img
              alt="Transistor"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
            />
            <img
              alt="Transistor"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
            />

            <img
              alt="Reform"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
            />
            <img
              alt="Reform"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
            />

            <img
              alt="Tuple"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
            />
            <img
              alt="Tuple"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
            />

            <img
              alt="SavvyCal"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 dark:hidden"
            />
            <img
              alt="SavvyCal"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden sm:col-start-2 lg:col-span-1"
            />

            <img
              alt="Statamic"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 dark:hidden"
            />
            <img
              alt="Statamic"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 col-start-2 max-h-12 w-full object-contain not-dark:hidden sm:col-start-auto lg:col-span-1"
            />
          </div>
          <div className="mt-16 flex justify-center">
            <p className="relative rounded-full bg-white/25 px-4 py-1.5 text-sm/6 text-gray-600 inset-ring inset-ring-gray-900/10 dark:bg-gray-800/25 dark:text-gray-400 dark:inset-ring-white/10">
              <span className="hidden md:inline">
                Transistor saves up to $40,000 per year, per employee by working with us.
              </span>
              <a
                href="#"
                className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <span aria-hidden="true" className="absolute inset-0" /> Read our case study{' '}
                <span aria-hidden="true">&rarr;</span>
              </a>
            </p>
          </div>
        </div>

        {/* Feature section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Deploy faster</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance dark:text-white">
              Everything you need to deploy your app
            </p>
            <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
              Quis tellus eget adipiscing convallis sit sit eget aliquet quis. Suspendisse eget egestas a elementum
              pulvinar et feugiat blandit at. In mi viverra elit nunc.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base/7 font-semibold text-gray-900 dark:text-white">
                    <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
                      <feature.icon aria-hidden="true" className="size-6 text-white" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base/7 text-gray-600 dark:text-gray-400">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Testimonial section */}
        <div className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gray-900 px-6 py-20 shadow-xl sm:rounded-3xl sm:px-10 sm:py-24 md:px-12 lg:px-20 dark:bg-black dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:inset-ring dark:after:inset-ring-white/10 dark:after:sm:rounded-3xl">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1601381718415-a05fb0a261f3?ixid=MXwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8ODl8fHxlbnwwfHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1216&q=80"
              className="absolute inset-0 size-full object-cover brightness-150 saturate-0"
            />
            <div className="absolute inset-0 bg-gray-900/90 mix-blend-multiply" />
            <div aria-hidden="true" className="absolute -top-56 -left-80 transform-gpu blur-3xl">
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="aspect-1097/845 w-274.25 bg-linear-to-r from-[#ff4694] to-[#776fff] opacity-[0.45] dark:opacity-[0.30]"
              />
            </div>
            <div
              aria-hidden="true"
              className="hidden md:absolute md:bottom-16 md:left-200 md:block md:transform-gpu md:blur-3xl"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="aspect-1097/845 w-274.25 bg-linear-to-r from-[#ff4694] to-[#776fff] opacity-25 dark:opacity-20"
              />
            </div>
            <div className="relative mx-auto max-w-2xl lg:mx-0">
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/workcation-logo-white.svg"
                className="h-12 w-auto dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/workcation-logo-white.svg"
                className="h-12 w-auto not-dark:hidden"
              />
              <figure>
                <blockquote className="mt-6 text-lg font-semibold text-white sm:text-xl/8">
                  <p>
                    “Amet amet eget scelerisque tellus sit neque faucibus non eleifend. Integer eu praesent at a. Ornare
                    arcu gravida natoque erat et cursus tortor consequat at. Vulputate gravida sociis enim nullam
                    ultricies habitant malesuada lorem ac.”
                  </p>
                </blockquote>
                <figcaption className="mt-6 text-base text-white dark:text-gray-200">
                  <div className="font-semibold">Judith Black</div>
                  <div className="mt-1">CEO of Tuple</div>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        {/* Pricing section */}
        <div className="py-24 sm:pt-48">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Pricing</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
                Pricing that grows with you
              </p>
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg/8 text-pretty text-gray-600 sm:text-xl/8 dark:text-gray-400">
              Choose an affordable plan that’s packed with the best features for engaging your audience, creating
              customer loyalty, and driving sales.
            </p>
            <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {tiers.map((tier, tierIdx) => (
                <div
                  key={tier.id}
                  className={classNames(
                    tier.mostPopular ? 'lg:z-10 lg:rounded-b-none' : 'lg:mt-8',
                    tierIdx === 0 ? '-mr-px lg:rounded-r-none' : '',
                    tierIdx === tiers.length - 1 ? '-ml-px lg:rounded-l-none' : '',
                    'flex flex-col justify-between rounded-3xl bg-white p-8 inset-ring inset-ring-gray-200 xl:p-10 dark:bg-gray-800/50 dark:inset-ring-gray-700',
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-x-4">
                      <h3
                        id={tier.id}
                        className={classNames(
                          tier.mostPopular ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white',
                          'text-lg/8 font-semibold',
                        )}
                      >
                        {tier.name}
                      </h3>
                      {tier.mostPopular ? (
                        <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs/5 font-semibold text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                          Most popular
                        </p>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm/6 text-gray-600 dark:text-gray-400">{tier.description}</p>
                    <p className="mt-6 flex items-baseline gap-x-1">
                      <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        {tier.priceMonthly}
                      </span>
                      <span className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400">/month</span>
                    </p>
                    <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-600 dark:text-gray-400">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-x-3">
                          <CheckIcon
                            aria-hidden="true"
                            className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href={tier.href}
                    aria-describedby={tier.id}
                    className={classNames(
                      tier.mostPopular
                        ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400'
                        : 'text-indigo-600 inset-ring inset-ring-indigo-200 hover:inset-ring-indigo-300 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20 dark:hover:inset-ring-white/5 dark:focus-visible:outline-white/75',
                      'mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500',
                    )}
                  >
                    Buy plan
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mx-auto max-w-2xl px-6 pb-8 sm:pt-12 sm:pb-24 lg:max-w-7xl lg:px-8 lg:pb-32">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Frequently asked questions
          </h2>
          <dl className="mt-20 divide-y divide-gray-900/10 dark:divide-white/10">
            {faqs.map((faq) => (
              <div key={faq.id} className="py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8">
                <dt className="text-base/7 font-semibold text-gray-900 lg:col-span-5 dark:text-white">
                  {faq.question}
                </dt>
                <dd className="mt-4 lg:col-span-7 lg:mt-0">
                  <p className="text-base/7 text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* CTA section */}
        <div className="relative -z-10 mt-32 px-6 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 transform-gpu justify-center overflow-hidden blur-3xl sm:top-auto sm:right-[calc(50%-6rem)] sm:bottom-0 sm:translate-y-0 sm:justify-end"
          >
            <div
              style={{
                clipPath:
                  'polygon(73.6% 48.6%, 91.7% 88.5%, 100% 53.9%, 97.4% 18.1%, 92.5% 15.4%, 75.7% 36.3%, 55.3% 52.8%, 46.5% 50.9%, 45% 37.4%, 50.3% 13.1%, 21.3% 36.2%, 0.1% 0.1%, 5.4% 49.1%, 21.4% 36.4%, 58.9% 100%, 73.6% 48.6%)',
              }}
              className="aspect-1108/632 w-277 flex-none bg-linear-to-r from-[#ff80b5] to-[#9089fc] opacity-25"
            />
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
              Boost your productivity. Start using our app today.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-600 dark:text-gray-300">
              Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim id veniam aliqua proident excepteur
              commodo do ea.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
              >
                Get started
              </a>
              <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute top-full right-0 left-1/2 -z-10 hidden -translate-y-1/2 transform-gpu overflow-hidden blur-3xl sm:block"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="aspect-1155/678 w-288.75 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mx-auto mt-32 max-w-7xl px-6 lg:px-8">
        <div className="border-t border-gray-900/10 py-16 sm:py-24 lg:py-32 dark:border-white/10">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <img
              alt="Company name"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-9 dark:hidden"
            />
            <img
              alt="Company name"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
              className="h-9 not-dark:hidden"
            />
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Solutions</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.solutions.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Support</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.support.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Company</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.company.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.legal.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


// =============================================================================
// 3. With background image hero and pricing section
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, MinusSmallIcon, PlusSmallIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  ArrowPathIcon,
  CheckIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid'

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
]
const features = [
  {
    name: 'Push to deploy.',
    description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'SSL certificates.',
    description: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
    icon: LockClosedIcon,
  },
  {
    name: 'Simple queues.',
    description: 'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Advanced security.',
    description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.',
    icon: FingerPrintIcon,
  },
  {
    name: 'Powerful API.',
    description: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
    icon: Cog6ToothIcon,
  },
  {
    name: 'Database backups.',
    description: 'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.',
    icon: ServerIcon,
  },
]
const tiers = [
  {
    name: 'Hobby',
    id: 'tier-hobby',
    href: '#',
    priceMonthly: '$19',
    description: "The perfect plan if you're just getting started with our product.",
    features: ['25 products', 'Up to 10,000 subscribers', 'Advanced analytics', '24-hour support response time'],
    featured: false,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    priceMonthly: '$49',
    description: 'Dedicated support and infrastructure for your company.',
    features: [
      'Unlimited products',
      'Unlimited subscribers',
      'Advanced analytics',
      'Dedicated support representative',
      'Marketing automations',
      'Custom integrations',
    ],
    featured: true,
  },
]
const faqs = [
  {
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    question: 'How do you make holy water?',
    answer:
      'You boil the hell out of it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam aut tempora vitae odio inventore fuga aliquam nostrum quod porro. Delectus quia facere id sequi expedita natus.',
  },
  {
    question: 'What do you call someone with no body and no nose?',
    answer:
      'Nobody knows. Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa, voluptas ipsa quia excepturi, quibusdam natus exercitationem sapiente tempore labore voluptatem.',
  },
  {
    question: 'Why do you never see elephants hiding in trees?',
    answer:
      "Because they're so good at it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    question: "Why can't you hear a pterodactyl go to the bathroom?",
    answer:
      'Because the pee is silent. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsam, quas voluptatibus ex culpa ipsum, aspernatur blanditiis fugiat ullam magnam suscipit deserunt illum natus facilis atque vero consequatur! Quisquam, debitis error.',
  },
  {
    question: 'Why did the invisible man turn down the job offer?',
    answer:
      "He couldn't see himself doing it. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eveniet perspiciatis officiis corrupti tenetur. Temporibus ut voluptatibus, perferendis sed unde rerum deserunt eius.",
  },
]
const footerNavigation = {
  solutions: [
    { name: 'Marketing', href: '#' },
    { name: 'Analytics', href: '#' },
    { name: 'Automation', href: '#' },
    { name: 'Commerce', href: '#' },
    { name: 'Insights', href: '#' },
  ],
  support: [
    { name: 'Submit ticket', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'Guides', href: '#' },
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Jobs', href: '#' },
    { name: 'Press', href: '#' },
  ],
  legal: [
    { name: 'Terms of service', href: '#' },
    { name: 'Privacy policy', href: '#' },
    { name: 'License', href: '#' },
  ],
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto not-dark:hidden"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-500 dark:text-gray-400"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-gray-900 dark:sm:ring-gray-100/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto dark:hidden"
                />
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-8 w-auto not-dark:hidden"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-400"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-500/25">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <main>
        {/* Hero section */}
        <div className="relative isolate overflow-hidden pt-14 pb-16 sm:pb-20">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
            className="absolute inset-0 -z-10 size-full object-cover not-dark:hidden"
          />
          <img
            alt=""
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=fff&sat=-100&exp=15&blend-mode=overlay"
            className="absolute inset-0 -z-10 size-full object-cover opacity-10 dark:hidden"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"
            />
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:text-gray-400 dark:ring-white/10 dark:hover:ring-white/20">
                  Announcing our next round of funding.{' '}
                  <a href="#" className="font-semibold text-indigo-600 dark:text-indigo-400">
                    <span aria-hidden="true" className="absolute inset-0" />
                    Read more <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
                  Data to enrich your online business
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-gray-600 sm:text-xl/8 dark:text-gray-400">
                  Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt
                  amet fugiat veniam occaecat.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                    href="#"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                  >
                    Get started
                  </a>
                  <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Logo cloud */}
            <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
              <img
                alt="Transistor"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
              />
              <img
                alt="Transistor"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-white.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
              />

              <img
                alt="Reform"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
              />
              <img
                alt="Reform"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-white.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
              />

              <img
                alt="Tuple"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
              />
              <img
                alt="Tuple"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-white.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
              />

              <img
                alt="SavvyCal"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 dark:hidden"
              />
              <img
                alt="SavvyCal"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-white.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain not-dark:hidden sm:col-start-2 lg:col-span-1"
              />

              <img
                alt="Statamic"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
                width={158}
                height={48}
                className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 dark:hidden"
              />
              <img
                alt="Statamic"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-white.svg"
                width={158}
                height={48}
                className="col-span-2 col-start-2 max-h-12 w-full object-contain not-dark:hidden sm:col-start-auto lg:col-span-1"
              />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-288.75"
            />
          </div>
        </div>

        {/* Feature section */}
        <div className="mt-32 sm:mt-56">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Everything you need</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl sm:text-balance dark:text-white">
                No server? No problem.
              </p>
              <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque,
                iste dolor cupiditate blanditiis.
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden pt-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <img
                alt="App screenshot"
                src="https://tailwindcss.com/plus-assets/img/component-images/project-app-screenshot.png"
                width={2432}
                height={1442}
                className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10 dark:hidden dark:ring-white/10"
              />
              <img
                alt="App screenshot"
                src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
                width={2432}
                height={1442}
                className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10 not-dark:hidden dark:ring-white/10"
              />
              <div aria-hidden="true" className="relative">
                <div className="absolute -inset-x-20 bottom-0 bg-linear-to-t from-white pt-[7%] dark:from-gray-900" />
              </div>
            </div>
          </div>
          <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
            <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base/7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16 dark:text-gray-400">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900 dark:text-white">
                    <feature.icon
                      aria-hidden="true"
                      className="absolute top-1 left-1 size-5 text-indigo-600 dark:text-indigo-400"
                    />
                    {feature.name}
                  </dt>{' '}
                  <dd className="inline">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Testimonial section */}
        <div className="relative z-10 mt-32 mb-20 sm:mt-56 sm:mb-24 xl:mb-0">
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[calc(50%-36rem)] left-[calc(50%-19rem)] transform-gpu blur-3xl">
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="aspect-1097/1023 w-274.25 bg-linear-to-r from-[#ff4694] to-[#776fff] opacity-25"
              />
            </div>
          </div>
          <div className="bg-gray-900 pb-20 sm:pb-24 xl:pb-0 dark:bg-gray-800/50 dark:outline dark:outline-white/5">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-x-8 gap-y-10 px-6 sm:gap-y-8 lg:px-8 xl:flex-row xl:items-stretch">
              <div className="-mt-8 w-full max-w-2xl xl:-mb-8 xl:w-96 xl:flex-none">
                <div className="relative aspect-2/1 h-full after:absolute after:inset-0 after:rounded-2xl after:inset-ring after:inset-ring-white/15 md:-mx-8 xl:mx-0 xl:aspect-auto">
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2102&q=80"
                    className="absolute inset-0 size-full rounded-2xl bg-gray-800 object-cover shadow-2xl dark:bg-gray-700 dark:shadow-none"
                  />
                </div>
              </div>
              <div className="w-full max-w-2xl xl:max-w-none xl:flex-auto xl:px-16 xl:py-24">
                <figure className="relative isolate pt-6 sm:pt-12">
                  <svg
                    fill="none"
                    viewBox="0 0 162 128"
                    aria-hidden="true"
                    className="absolute top-0 left-0 -z-10 h-32 stroke-white/20"
                  >
                    <path
                      d="M65.5697 118.507L65.8918 118.89C68.9503 116.314 71.367 113.253 73.1386 109.71C74.9162 106.155 75.8027 102.28 75.8027 98.0919C75.8027 94.237 75.16 90.6155 73.8708 87.2314C72.5851 83.8565 70.8137 80.9533 68.553 78.5292C66.4529 76.1079 63.9476 74.2482 61.0407 72.9536C58.2795 71.4949 55.276 70.767 52.0386 70.767C48.9935 70.767 46.4686 71.1668 44.4872 71.9924L44.4799 71.9955L44.4726 71.9988C42.7101 72.7999 41.1035 73.6831 39.6544 74.6492C38.2407 75.5916 36.8279 76.455 35.4159 77.2394L35.4047 77.2457L35.3938 77.2525C34.2318 77.9787 32.6713 78.3634 30.6736 78.3634C29.0405 78.3634 27.5131 77.2868 26.1274 74.8257C24.7483 72.2185 24.0519 69.2166 24.0519 65.8071C24.0519 60.0311 25.3782 54.4081 28.0373 48.9335C30.703 43.4454 34.3114 38.345 38.8667 33.6325C43.5812 28.761 49.0045 24.5159 55.1389 20.8979C60.1667 18.0071 65.4966 15.6179 71.1291 13.7305C73.8626 12.8145 75.8027 10.2968 75.8027 7.38572C75.8027 3.6497 72.6341 0.62247 68.8814 1.1527C61.1635 2.2432 53.7398 4.41426 46.6119 7.66522C37.5369 11.6459 29.5729 17.0612 22.7236 23.9105C16.0322 30.6019 10.618 38.4859 6.47981 47.558L6.47976 47.558L6.47682 47.5647C2.4901 56.6544 0.5 66.6148 0.5 77.4391C0.5 84.2996 1.61702 90.7679 3.85425 96.8404L3.8558 96.8445C6.08991 102.749 9.12394 108.02 12.959 112.654L12.959 112.654L12.9646 112.661C16.8027 117.138 21.2829 120.739 26.4034 123.459L26.4033 123.459L26.4144 123.465C31.5505 126.033 37.0873 127.316 43.0178 127.316C47.5035 127.316 51.6783 126.595 55.5376 125.148L55.5376 125.148L55.5477 125.144C59.5516 123.542 63.0052 121.456 65.9019 118.881L65.5697 118.507Z"
                      id="b56e9dab-6ccb-4d32-ad02-6b4bb5d9bbeb"
                    />
                    <use x={86} href="#b56e9dab-6ccb-4d32-ad02-6b4bb5d9bbeb" />
                  </svg>
                  <blockquote className="text-xl/8 font-semibold text-white sm:text-2xl/9 dark:text-gray-100">
                    <p>
                      Gravida quam mi erat tortor neque molestie. Auctor aliquet at porttitor a enim nunc suscipit
                      tincidunt nunc. Et non lorem tortor posuere. Nunc eu scelerisque interdum eget tellus non nibh
                      scelerisque bibendum.
                    </p>
                  </blockquote>
                  <figcaption className="mt-8 text-base">
                    <div className="font-semibold text-white dark:text-gray-100">Judith Black</div>
                    <div className="mt-1 text-gray-400">CEO of Tuple</div>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing section */}
        <div className="relative isolate mt-32 px-6 sm:mt-56 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="mx-auto aspect-1155/678 w-288.75 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20"
            />
          </div>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Pricing</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
              Choose the right plan for you
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg/8 text-pretty text-gray-600 dark:text-gray-400">
            Choose an affordable plan that’s packed with the best features for engaging your audience, creating customer
            loyalty, and driving sales.
          </p>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
            {tiers.map((tier, tierIdx) => (
              <div
                key={tier.id}
                className={classNames(
                  tier.featured
                    ? 'relative bg-gray-900 shadow-2xl dark:bg-gray-800 dark:shadow-none'
                    : 'bg-white/60 sm:mx-8 lg:mx-0 dark:bg-white/2.5',
                  tier.featured
                    ? ''
                    : tierIdx === 0
                      ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl'
                      : 'sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none',
                  'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10 dark:ring-white/10',
                )}
              >
                <h3
                  id={tier.id}
                  className={classNames(
                    tier.featured ? 'text-indigo-400' : 'text-indigo-600 dark:text-indigo-400',
                    'text-base/7 font-semibold',
                  )}
                >
                  {tier.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span
                    className={classNames(
                      tier.featured ? 'text-white' : 'text-gray-900 dark:text-white',
                      'text-5xl font-semibold tracking-tight',
                    )}
                  >
                    {tier.priceMonthly}
                  </span>
                  <span
                    className={classNames(
                      tier.featured ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400',
                      'text-base',
                    )}
                  >
                    /month
                  </span>
                </p>
                <p
                  className={classNames(
                    tier.featured ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300',
                    'mt-6 text-base/7',
                  )}
                >
                  {tier.description}
                </p>
                <ul
                  role="list"
                  className={classNames(
                    tier.featured ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300',
                    'mt-8 space-y-3 text-sm/6 sm:mt-10',
                  )}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon
                        aria-hidden="true"
                        className={classNames(
                          tier.featured ? 'text-indigo-400' : 'text-indigo-600 dark:text-indigo-400',
                          'h-6 w-5 flex-none',
                        )}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.href}
                  aria-describedby={tier.id}
                  className={classNames(
                    tier.featured
                      ? 'bg-indigo-500 text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-indigo-500 dark:shadow-none'
                      : 'text-indigo-600 inset-ring inset-ring-indigo-200 hover:inset-ring-indigo-300 focus-visible:outline-indigo-600 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20 dark:hover:inset-ring-white/5 dark:focus-visible:outline-white/75',
                    'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10',
                  )}
                >
                  Get started today
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              Frequently asked questions
            </h2>
            <dl className="mt-16 divide-y divide-gray-900/10 dark:divide-white/10">
              {faqs.map((faq) => (
                <Disclosure key={faq.question} as="div" className="py-6 first:pt-0 last:pb-0">
                  <dt>
                    <DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900 dark:text-white">
                      <span className="text-base/7 font-semibold">{faq.question}</span>
                      <span className="ml-6 flex h-7 items-center">
                        <PlusSmallIcon aria-hidden="true" className="size-6 group-data-open:hidden" />
                        <MinusSmallIcon aria-hidden="true" className="size-6 group-not-data-open:hidden" />
                      </span>
                    </DisclosureButton>
                  </dt>
                  <DisclosurePanel as="dd" className="mt-2 pr-12">
                    <p className="text-base/7 text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </DisclosurePanel>
                </Disclosure>
              ))}
            </dl>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 sm:mt-56">
        <div className="mx-auto max-w-7xl border-t border-gray-200 px-6 py-16 sm:py-24 lg:px-8 lg:py-32 dark:border-white/10">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <img
              alt="Company name"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-9 dark:hidden"
            />
            <img
              alt="Company name"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
              className="h-9 not-dark:hidden"
            />
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Solutions</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.solutions.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Support</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.support.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Company</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.company.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.legal.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


// =============================================================================
// 4. With mobile screenshot and testimonials grid
// =============================================================================
'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  ArrowPathIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid'

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
]
const primaryFeatures = [
  {
    name: 'Push to deploy.',
    description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'SSL certificates.',
    description: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
    icon: LockClosedIcon,
  },
  {
    name: 'Database backups.',
    description: 'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.',
    icon: ServerIcon,
  },
]
const secondaryFeatures = [
  {
    name: 'Push to deploy',
    description:
      'Commodo nec sagittis tortor mauris sed. Turpis tortor quis scelerisque diam id accumsan nullam tempus. Pulvinar etiam lacus volutpat eu. Phasellus praesent ligula sit faucibus.',
    href: '#',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'SSL certificates',
    description:
      'Pellentesque enim a commodo malesuada turpis eleifend risus. Facilisis donec placerat sapien consequat tempor fermentum nibh.',
    href: '#',
    icon: LockClosedIcon,
  },
  {
    name: 'Simple queues',
    description:
      'Pellentesque sit elit congue ante nec amet. Dolor aenean curabitur viverra suspendisse iaculis eget. Nec mollis placerat ultricies euismod ut condimentum.',
    href: '#',
    icon: ArrowPathIcon,
  },
]
const featuredTestimonial = {
  body: 'Integer id nunc sit semper purus. Bibendum at lacus ut arcu blandit montes vitae auctor libero. Hac condimentum dignissim nibh vulputate ut nunc. Amet nibh orci mi venenatis blandit vel et proin. Non hendrerit in vel ac diam.',
  author: {
    name: 'Brenna Goyette',
    handle: 'brennagoyette',
    imageUrl:
      'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=1024&h=1024&q=80',
    logoUrl: 'https://tailwindcss.com/plus-assets/img/logos/savvycal-logo-gray-900.svg',
  },
}
const testimonials = [
  [
    [
      {
        body: 'Laborum quis quam. Dolorum et ut quod quia. Voluptas numquam delectus nihil. Aut enim doloremque et ipsam.',
        author: {
          name: 'Leslie Alexander',
          handle: 'lesliealexander',
          imageUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body: 'Quia dolorem qui et. Atque quo aliquid sit eos officia. Dolores similique laboriosam quaerat cupiditate.',
        author: {
          name: 'Michael Foster',
          handle: 'michaelfoster',
          imageUrl:
            'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body: 'Consequatur ut atque. Itaque nostrum molestiae id veniam eos cumque. Ut quia eum fugit laborum autem inventore ut voluptate.',
        author: {
          name: 'Dries Vincent',
          handle: 'driesvincent',
          imageUrl:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
    [
      {
        body: 'Aut reprehenderit voluptatem eum asperiores beatae id. Iure molestiae ipsam ut officia rem nulla blanditiis.',
        author: {
          name: 'Lindsay Walton',
          handle: 'lindsaywalton',
          imageUrl:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body: 'Nam nesciunt dolorem dolor asperiores cum. Incidunt molestiae quis deleniti vitae ut in earum delectus iusto.',
        author: {
          name: 'Courtney Henry',
          handle: 'courtneyhenry',
          imageUrl:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
  ],
  [
    [
      {
        body: 'Voluptas quos itaque ipsam in voluptatem est. Iste eos blanditiis repudiandae. Earum deserunt enim molestiae ipsum perferendis recusandae saepe corrupti.',
        author: {
          name: 'Tom Cook',
          handle: 'tomcook',
          imageUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body: 'Aliquid dolore praesentium ratione. Cumque ea officia repellendus laboriosam. Vitae quod id explicabo non sunt.',
        author: {
          name: 'Whitney Francis',
          handle: 'whitneyfrancis',
          imageUrl:
            'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
    [
      {
        body: 'Molestias ea earum quos nostrum doloremque sed. Quaerat quasi aut velit incidunt excepturi rerum voluptatem minus harum.',
        author: {
          name: 'Leonard Krasner',
          handle: 'leonardkrasner',
          imageUrl:
            'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body: 'Architecto libero natus est. Est quam debitis officia enim atque et ut non. Sunt reiciendis quasi eaque. Itaque error ut et.',
        author: {
          name: 'Floyd Miles',
          handle: 'floydmiles',
          imageUrl:
            'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body: 'Temporibus ea molestiae impedit adipisci perspiciatis illo aliquid. Quis ut ratione et voluptatem et. Nostrum explicabo iste unde beatae.',
        author: {
          name: 'Emily Selman',
          handle: 'emilyselman',
          imageUrl:
            'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
  ],
]
const footerNavigation = {
  solutions: [
    { name: 'Marketing', href: '#' },
    { name: 'Analytics', href: '#' },
    { name: 'Automation', href: '#' },
    { name: 'Commerce', href: '#' },
    { name: 'Insights', href: '#' },
  ],
  support: [
    { name: 'Submit ticket', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'Guides', href: '#' },
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Jobs', href: '#' },
    { name: 'Press', href: '#' },
  ],
  legal: [
    { name: 'Terms of service', href: '#' },
    { name: 'Privacy policy', href: '#' },
    { name: 'License', href: '#' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'X',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto not-dark:hidden"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-gray-900 dark:sm:ring-gray-100/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto dark:hidden"
                />
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-8 w-auto not-dark:hidden"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10 dark:divide-white/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <main>
        {/* Hero section */}
        <div className="relative isolate pt-14">
          <svg
            aria-hidden="true"
            className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-gray-200 dark:stroke-white/10"
          >
            <defs>
              <pattern
                x="50%"
                y={-1}
                id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                width={200}
                height={200}
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={-1} className="overflow-visible fill-gray-50 dark:fill-gray-800/50">
              <path
                d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" width="100%" height="100%" strokeWidth={0} />
          </svg>
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
              <div className="flex">
                <div className="relative flex items-center gap-x-4 rounded-full bg-white px-4 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10 dark:hover:ring-white/20">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">We’re hiring</span>
                  <span aria-hidden="true" className="h-4 w-px bg-gray-900/10 dark:bg-white/10" />
                  <a href="#" className="flex items-center gap-x-1">
                    <span aria-hidden="true" className="absolute inset-0" />
                    See open positions
                    <ChevronRightIcon aria-hidden="true" className="-mr-2 size-5 text-gray-400" />
                  </a>
                </div>
              </div>
              <h1 className="mt-10 text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-7xl dark:text-white">
                A better way to ship your projects
              </h1>
              <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
                Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet
                fugiat veniam occaecat fugiat aliqua. Anim aute id magna aliqua ad ad non deserunt sunt.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <a
                  href="#"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  Get started
                </a>
                <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:shrink-0 lg:grow">
              <svg role="img" viewBox="0 0 366 729" className="mx-auto w-91.5 max-w-full drop-shadow-xl">
                <title>App screenshot</title>
                <defs>
                  <clipPath id="2ade4387-9c63-4fc4-b754-10e687a0d332">
                    <rect rx={36} width={316} height={684} />
                  </clipPath>
                </defs>
                <path
                  d="M363.315 64.213C363.315 22.99 341.312 1 300.092 1H66.751C25.53 1 3.528 22.99 3.528 64.213v44.68l-.857.143A2 2 0 0 0 1 111.009v24.611a2 2 0 0 0 1.671 1.973l.95.158a2.26 2.26 0 0 1-.093.236v26.173c.212.1.398.296.541.643l-1.398.233A2 2 0 0 0 1 167.009v47.611a2 2 0 0 0 1.671 1.973l1.368.228c-.139.319-.314.533-.511.653v16.637c.221.104.414.313.56.689l-1.417.236A2 2 0 0 0 1 237.009v47.611a2 2 0 0 0 1.671 1.973l1.347.225c-.135.294-.302.493-.49.607v377.681c0 41.213 22 63.208 63.223 63.208h95.074c.947-.504 2.717-.843 4.745-.843l.141.001h.194l.086-.001 33.704.005c1.849.043 3.442.37 4.323.838h95.074c41.222 0 63.223-21.999 63.223-63.212v-394.63c-.259-.275-.48-.796-.63-1.47l-.011-.133 1.655-.276A2 2 0 0 0 366 266.62v-77.611a2 2 0 0 0-1.671-1.973l-1.712-.285c.148-.839.396-1.491.698-1.811V64.213Z"
                  fill="#4B5563"
                />
                <path
                  d="M16 59c0-23.748 19.252-43 43-43h246c23.748 0 43 19.252 43 43v615c0 23.196-18.804 42-42 42H58c-23.196 0-42-18.804-42-42V59Z"
                  fill="#343E4E"
                />
                <foreignObject
                  width={316}
                  height={684}
                  clipPath="url(#2ade4387-9c63-4fc4-b754-10e687a0d332)"
                  transform="translate(24 24)"
                >
                  <img
                    alt=""
                    src="https://tailwindcss.com/plus-assets/img/component-images/mobile-app-screenshot.png"
                  />
                </foreignObject>
              </svg>
            </div>
          </div>
        </div>

        {/* Logo cloud */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-12 opacity-40 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            <img
              alt="Transistor"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
            />
            <img
              alt="Transistor"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
            />

            <img
              alt="Reform"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
            />
            <img
              alt="Reform"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
            />

            <img
              alt="Tuple"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
            />
            <img
              alt="Tuple"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
            />

            <img
              alt="SavvyCal"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 dark:hidden"
            />
            <img
              alt="SavvyCal"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 max-h-12 w-full object-contain not-dark:hidden sm:col-start-2 lg:col-span-1"
            />

            <img
              alt="Statamic"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
              width={158}
              height={48}
              className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 dark:hidden"
            />
            <img
              alt="Statamic"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-white.svg"
              width={158}
              height={48}
              className="col-span-2 col-start-2 max-h-12 w-full object-contain not-dark:hidden sm:col-start-auto lg:col-span-1"
            />
          </div>
        </div>

        {/* Feature section */}
        <div className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-20 sm:rounded-3xl sm:px-10 sm:py-24 lg:py-24 xl:px-24 dark:bg-gray-800/50 dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:inset-ring dark:after:inset-ring-white/10 dark:after:sm:rounded-3xl">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-y-0">
              <div className="lg:row-start-2 lg:max-w-md">
                <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
                  Boost your productivity. Start using our app today.
                </h2>
                <p className="mt-6 text-lg/8 text-gray-300">
                  Ac euismod vel sit maecenas id pellentesque eu sed consectetur. Malesuada adipiscing sagittis vel
                  nulla. Ac euismod vel sit maecenas.
                </p>
              </div>
              <img
                alt="Product screenshot"
                src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
                width={2432}
                height={1442}
                className="relative -z-20 max-w-xl min-w-full rounded-xl shadow-xl ring-1 ring-white/10 lg:row-span-4 lg:w-5xl lg:max-w-none"
              />
              <div className="max-w-xl lg:row-start-3 lg:mt-10 lg:max-w-md lg:border-t lg:border-white/10 lg:pt-10">
                <dl className="max-w-xl space-y-8 text-base/7 text-gray-300 lg:max-w-none">
                  {primaryFeatures.map((feature) => (
                    <div key={feature.name} className="relative">
                      <dt className="ml-9 inline-block font-semibold text-white">
                        <feature.icon
                          aria-hidden="true"
                          className="absolute top-1 left-1 size-5 text-indigo-500 dark:text-indigo-400"
                        />
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-12 -z-10 -translate-y-1/2 transform-gpu blur-3xl lg:top-auto lg:-bottom-48 lg:translate-y-0"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="aspect-1155/678 w-288.75 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-25 dark:opacity-20"
              />
            </div>
          </div>
        </div>

        {/* Feature section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Deploy faster</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance dark:text-white">
              Everything you need to deploy your app
            </p>
            <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
              Quis tellus eget adipiscing convallis sit sit eget aliquet quis. Suspendisse eget egestas a elementum
              pulvinar et feugiat blandit at. In mi viverra elit nunc.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {secondaryFeatures.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-gray-900 dark:text-white">
                    <feature.icon
                      aria-hidden="true"
                      className="size-5 flex-none text-indigo-600 dark:text-indigo-400"
                    />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-600 dark:text-gray-400">
                    <p className="flex-auto">{feature.description}</p>
                    <p className="mt-6">
                      <a
                        href={feature.href}
                        className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Learn more <span aria-hidden="true">→</span>
                      </a>
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Newsletter section */}
        <div className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32 dark:bg-gray-800 dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:inset-ring dark:after:inset-ring-white/15 dark:after:sm:rounded-3xl">
            <h2 className="mx-auto max-w-3xl text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Get notified when we’re launching
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-center text-lg text-gray-300">
              Reprehenderit ad esse et non officia in nulla. Id proident tempor incididunt nostrud nulla et culpa.
            </p>
            <form className="mx-auto mt-10 flex max-w-md gap-x-4">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                autoComplete="email"
                className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 dark:outline-white/20"
              />
              <button
                type="submit"
                className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:shadow-none"
              >
                Notify me
              </button>
            </form>
            <svg
              viewBox="0 0 1024 1024"
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-x-1/2"
            >
              <circle r={512} cx={512} cy={512} fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fillOpacity="0.7" />
              <defs>
                <radialGradient
                  r={1}
                  cx={0}
                  cy={0}
                  id="759c1415-0410-454c-8f7c-9a820de03641"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(512 512) rotate(90) scale(512)"
                >
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" stopOpacity={0} />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Testimonials section */}
        <div className="relative isolate mt-32 sm:mt-56 sm:pt-32">
          <svg
            aria-hidden="true"
            className="absolute inset-0 -z-10 hidden size-full mask-[radial-gradient(64rem_64rem_at_top,white,transparent)] stroke-gray-200 sm:block dark:stroke-white/10"
          >
            <defs>
              <pattern
                x="50%"
                y={0}
                id="55d3d46d-692e-45f2-becd-d8bdc9344f45"
                width={200}
                height={200}
                patternUnits="userSpaceOnUse"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={0} className="overflow-visible fill-gray-50 dark:fill-gray-800/20">
              <path
                d="M-200.5 0h201v201h-201Z M599.5 0h201v201h-201Z M399.5 400h201v201h-201Z M-400.5 600h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect fill="url(#55d3d46d-692e-45f2-becd-d8bdc9344f45)" width="100%" height="100%" strokeWidth={0} />
          </svg>
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="ml-[max(50%,38rem)] aspect-1313/771 w-328.25 bg-linear-to-tr from-[#ff80b5] to-[#9089fc]"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden pt-32 opacity-25 blur-3xl sm:pt-40 xl:justify-end"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="-ml-88 aspect-1313/771 w-328.25 flex-none origin-top-right rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] xl:mr-[calc(50%-12rem)] xl:ml-0"
              />
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Testimonials</h2>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
                  We have worked with thousands of amazing people
                </p>
              </div>
              <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm/6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4 dark:text-gray-100">
                <figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 sm:col-span-2 xl:col-start-2 xl:row-end-1 dark:bg-gray-800/75 dark:shadow-none dark:ring-white/10">
                  <blockquote className="p-6 text-lg font-semibold tracking-tight text-gray-900 sm:p-12 sm:text-xl/8 dark:text-white">
                    <p>{`“${featuredTestimonial.body}”`}</p>
                  </blockquote>
                  <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-900/10 px-6 py-4 sm:flex-nowrap dark:border-white/10">
                    <img
                      alt=""
                      src={featuredTestimonial.author.imageUrl}
                      className="size-10 flex-none rounded-full bg-gray-50 dark:bg-gray-700"
                    />
                    <div className="flex-auto">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {featuredTestimonial.author.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">{`@${featuredTestimonial.author.handle}`}</div>
                    </div>
                    <img
                      alt=""
                      src={featuredTestimonial.author.logoUrl}
                      className="h-10 w-auto flex-none dark:hidden"
                    />
                    <img
                      alt=""
                      src={featuredTestimonial.author.logoUrl.replace('-gray-900', '-gray-100')}
                      className="h-10 w-auto flex-none not-dark:hidden"
                    />
                  </figcaption>
                </figure>
                {testimonials.map((columnGroup, columnGroupIdx) => (
                  <div key={columnGroupIdx} className="space-y-8 xl:contents xl:space-y-0">
                    {columnGroup.map((column, columnIdx) => (
                      <div
                        key={columnIdx}
                        className={classNames(
                          (columnGroupIdx === 0 && columnIdx === 0) ||
                            (columnGroupIdx === testimonials.length - 1 && columnIdx === columnGroup.length - 1)
                            ? 'xl:row-span-2'
                            : 'xl:row-start-1',
                          'space-y-8',
                        )}
                      >
                        {column.map((testimonial) => (
                          <figure
                            key={testimonial.author.handle}
                            className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5 dark:bg-gray-800/75 dark:shadow-none dark:ring-white/10"
                          >
                            <blockquote className="text-gray-900 dark:text-white">
                              <p>{`“${testimonial.body}”`}</p>
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-x-4">
                              <img
                                alt=""
                                src={testimonial.author.imageUrl}
                                className="size-10 rounded-full bg-gray-50 dark:bg-gray-700"
                              />
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {testimonial.author.name}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">{`@${testimonial.author.handle}`}</div>
                              </div>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 sm:mt-56">
        <div className="mx-auto max-w-7xl border-t border-gray-200 px-6 pt-16 pb-8 sm:pt-24 lg:px-8 lg:pt-32 dark:border-white/10">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <img
              alt="Company name"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-9 dark:hidden"
            />
            <img
              alt="Company name"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
              className="h-9 not-dark:hidden"
            />
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Solutions</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.solutions.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Support</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.support.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Company</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.company.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {footerNavigation.legal.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24 lg:flex lg:items-center lg:justify-between dark:border-white/10">
            <div>
              <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Subscribe to our newsletter</h3>
              <p className="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">
                The latest news, articles, and resources, sent to your inbox weekly.
              </p>
            </div>
            <form className="mt-6 sm:flex sm:max-w-md lg:mt-0">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email-address"
                type="email"
                required
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full min-w-0 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus-visible:outline-indigo-600 sm:w-56 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-gray-700 dark:placeholder:text-gray-500 dark:focus-visible:outline-indigo-500"
              />
              <div className="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
          <div className="mt-8 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between dark:border-white/10">
            <div className="flex gap-x-6 md:order-2">
              {footerNavigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="size-6" />
                </a>
              ))}
            </div>
            <p className="mt-8 text-sm/6 text-gray-600 md:order-1 md:mt-0 dark:text-gray-400">
              &copy; 2024 Your Company, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


