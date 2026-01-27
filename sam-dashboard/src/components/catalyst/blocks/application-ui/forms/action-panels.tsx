// Tailwind Plus UI Blocks - Action Panels
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/forms/action-panels
// Format: React JSX (v4.1)
// Downloaded automatically

import { Stack, HStack, Flex } from '@/components/catalyst/layout';

// =============================================================================
// 1. Simple
// =============================================================================
export function ActionPanelSimple() {
  return (
    <div className="bg-white shadow-sm sm:rounded-lg dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <Stack spacing="md" className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Manage subscription</h3>
        <div className="max-w-xl text-sm text-gray-500 dark:text-gray-400">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae voluptatibus corrupti atque repudiandae
            nam.
          </p>
        </div>
        <div>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Change plan
          </button>
        </div>
      </Stack>
    </div>
  );
}


// =============================================================================
// 2. With link
// =============================================================================
export function ActionPanelWithLink() {
  return (
    <div className="bg-white shadow-sm sm:rounded-lg dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <Stack spacing="sm" className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Continuous Integration</h3>
        <div className="max-w-xl text-sm text-gray-500 dark:text-gray-400">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, totam at reprehenderit maxime aut beatae
            ad.
          </p>
        </div>
        <div className="text-sm/6">
          <a
            href="#"
            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Learn more about our CI features
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </Stack>
    </div>
  );
}


// =============================================================================
// 3. With button on right
// =============================================================================
export function ActionPanelButtonRight() {
  return (
    <div className="bg-white shadow-sm sm:rounded-lg dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <Stack spacing="sm" className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Manage subscription</h3>
        <Flex align="start" justify="between" className="flex-col sm:flex-row">
          <div className="max-w-xl text-sm text-gray-500 dark:text-gray-400">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae voluptatibus corrupti atque
              repudiandae nam.
            </p>
          </div>
          <HStack align="center" className="mt-5 shrink-0 sm:mt-0 sm:ml-6">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Change plan
            </button>
          </HStack>
        </Flex>
      </Stack>
    </div>
  );
}


// =============================================================================
// 4. With button at top right
// =============================================================================
export function ActionPanelButtonTopRight() {
  return (
    <div className="bg-white shadow-sm sm:rounded-lg dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <div className="px-4 py-5 sm:p-6">
        <Flex align="start" justify="between" className="flex-col sm:flex-row">
          <Stack spacing="sm">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Manage subscription</h3>
            <div className="max-w-xl text-sm text-gray-500 dark:text-gray-400">
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae voluptatibus corrupti atque
                repudiandae nam.
              </p>
            </div>
          </Stack>
          <HStack align="center" className="mt-5 shrink-0 sm:mt-0 sm:ml-6">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Change plan
            </button>
          </HStack>
        </Flex>
      </div>
    </div>
  );
}


// =============================================================================
// 5. With toggle
// =============================================================================
export function ActionPanelWithToggle() {
  return (
    <div className="bg-white shadow-sm sm:rounded-lg dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <Stack spacing="sm" className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Renew subscription automatically</h3>
        <Flex align="start" justify="between" className="flex-col sm:flex-row">
          <div className="max-w-xl text-sm text-gray-500 dark:text-gray-400">
            <p id="renew-subscription-description">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo totam non cumque deserunt officiis ex
              maiores nostrum.
            </p>
          </div>
          <HStack align="center" className="mt-5 shrink-0 sm:mt-0 sm:ml-6">
            <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500">
              <span className="size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5" />
              <input
                name="renew-subscription"
                type="checkbox"
                aria-label="Renew subscription automatically"
                aria-describedby="renew-subscription-description"
                className="absolute inset-0 size-full appearance-none focus:outline-hidden"
              />
            </div>
          </HStack>
        </Flex>
      </Stack>
    </div>
  );
}


// =============================================================================
// 6. With input
// =============================================================================
export function ActionPanelWithInput() {
  return (
    <div className="bg-white shadow-sm sm:rounded-lg dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <Stack spacing="sm" className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Update your email</h3>
        <div className="max-w-xl text-sm text-gray-500 dark:text-gray-400">
          <p>Change the email address you want associated with your account.</p>
        </div>
        <form>
          <HStack align="center" className="flex-col sm:flex-row">
            <div className="w-full sm:max-w-xs">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                aria-label="Email"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-400 dark:focus:outline-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:mt-0 sm:ml-3 sm:w-auto dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Save
            </button>
          </HStack>
        </form>
      </Stack>
    </div>
  );
}


// =============================================================================
// 7. Simple well
// =============================================================================
export function ActionPanelSimpleWell() {
  return (
    <div className="bg-gray-50 sm:rounded-lg dark:bg-gray-800/50">
      <Stack spacing="md" className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Need more bandwidth?</h3>
        <div className="max-w-xl text-sm text-gray-500 dark:text-gray-400">
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus praesentium tenetur pariatur.</p>
        </div>
        <div>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-white/5 dark:hover:bg-white/20"
          >
            Contact sales
          </button>
        </div>
      </Stack>
    </div>
  );
}


// =============================================================================
// 8. With well
// =============================================================================
export function ActionPanelWithWell() {
  return (
    <div className="bg-white shadow-sm sm:rounded-lg dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
      <Stack spacing="md" className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Payment method</h3>
        <div className="rounded-md bg-gray-50 px-6 py-5 dark:bg-gray-800">
          <Flex align="start" justify="between" className="flex-col sm:flex-row">
            <h4 className="sr-only">Visa</h4>
            <HStack align="start" className="flex-col sm:flex-row">
              <svg viewBox="0 0 36 24" aria-hidden="true" className="h-8 w-auto sm:h-6 sm:shrink-0">
                <rect rx={4} fill="#224DBA" width={36} height={24} />
                <path
                  d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                  fill="#fff"
                />
              </svg>
              <Stack spacing="xs" className="mt-3 sm:mt-0 sm:ml-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Ending with 4242</div>
                <HStack align="center" className="text-sm text-gray-600 flex-col sm:flex-row dark:text-gray-400">
                  <div>Expires 12/20</div>
                  <span aria-hidden="true" className="hidden sm:mx-2 sm:inline">
                    &middot;
                  </span>
                  <div className="mt-1 sm:mt-0">Last updated on 22 Aug 2017</div>
                </HStack>
              </Stack>
            </HStack>
            <div className="mt-4 shrink-0 sm:mt-0 sm:ml-6">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-white/5 dark:hover:bg-white/20"
              >
                Edit
              </button>
            </div>
          </Flex>
        </div>
      </Stack>
    </div>
  );
}


// Default export for backwards compatibility
export default ActionPanelSimple;
