// Tailwind Plus UI Blocks - Bento Grids
// Source: https://tailwindcss.com/plus/ui-blocks/marketing/sections/bento-grids
// Format: React JSX (v4.1)
// Downloaded automatically

import { Grid, Flex, Box } from '@/components/catalyst/layout'

// =============================================================================
// 1. Three column bento grid (Light)
// =============================================================================
export function BentoGridLight() {
  return (
    <Box className="bg-gray-50 py-24 sm:py-32">
      <Box className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-center text-base/7 font-semibold text-indigo-600">Deploy faster</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
          Everything you need to deploy your app
        </p>
        <Grid gap="md" className="mt-10 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          <Box className="relative lg:row-span-2">
            <Box className="absolute inset-px rounded-lg bg-white lg:rounded-l-4xl" />
            <Flex direction="column" className="relative h-full overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
              <Box className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Mobile friendly
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.
                </p>
              </Box>
              <Box className="@container relative min-h-120 w-full grow max-lg:mx-auto max-lg:max-w-sm">
                <Box className="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 shadow-2xl">
                  <img
                    alt=""
                    src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-mobile-friendly.png"
                    className="size-full object-cover object-top"
                  />
                </Box>
              </Box>
            </Flex>
            <Box className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 lg:rounded-l-4xl" />
          </Box>
          <Box className="relative max-lg:row-start-1">
            <Box className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-4xl" />
            <Flex direction="column" className="relative h-full overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
              <Box className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">Performance</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit maiores impedit.
                </p>
              </Box>
              <Flex className="flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-performance.png"
                  className="w-full max-lg:max-w-xs"
                />
              </Flex>
            </Flex>
            <Box className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 max-lg:rounded-t-4xl" />
          </Box>
          <Box className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
            <Box className="absolute inset-px rounded-lg bg-white" />
            <Flex direction="column" className="relative h-full overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
              <Box className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">Security</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi.
                </p>
              </Box>
              <Flex className="@container flex-1 items-center max-lg:py-6 lg:pb-2">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-security.png"
                  className="h-[min(152px,40cqw)] object-cover"
                />
              </Flex>
            </Flex>
            <Box className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5" />
          </Box>
          <Box className="relative lg:row-span-2">
            <Box className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-4xl lg:rounded-r-4xl" />
            <Flex direction="column" className="relative h-full overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <Box className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Powerful APIs
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget sem sodales gravida.
                </p>
              </Box>
              <Box className="relative min-h-120 w-full grow">
                <Box className="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl outline outline-white/10">
                  <Flex className="bg-gray-900 outline outline-white/5">
                    <Flex className="-mb-px text-sm/6 font-medium text-gray-400">
                      <Box className="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">
                        NotificationSetting.jsx
                      </Box>
                      <Box className="border-r border-gray-600/10 px-4 py-2">App.jsx</Box>
                    </Flex>
                  </Flex>
                  <Box className="px-6 pt-6 pb-14">{/* Your code example */}</Box>
                </Box>
              </Box>
            </Flex>
            <Box className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 max-lg:rounded-b-4xl lg:rounded-r-4xl" />
          </Box>
        </Grid>
      </Box>
    </Box>
  )
}


// =============================================================================
// 2. Three column bento grid (Dark)
// =============================================================================
export function BentoGridDark() {
  return (
    <Box className="bg-gray-900 py-24 sm:py-32">
      <Box className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-center text-base/7 font-semibold text-indigo-400">Deploy faster</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
          Everything you need to deploy your app
        </p>
        <Grid gap="md" className="mt-10 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          <Box className="relative lg:row-span-2">
            <Box className="absolute inset-px rounded-lg bg-gray-800 lg:rounded-l-4xl" />
            <Flex direction="column" className="relative h-full overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
              <Box className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-white max-lg:text-center">Mobile friendly</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400 max-lg:text-center">
                  Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.
                </p>
              </Box>
              <Box className="@container relative min-h-120 w-full grow max-lg:mx-auto max-lg:max-w-sm">
                <Box className="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 outline outline-white/20">
                  <img
                    alt=""
                    src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-mobile-friendly.png"
                    className="size-full object-cover object-top"
                  />
                </Box>
              </Box>
            </Flex>
            <Box className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15 lg:rounded-l-4xl" />
          </Box>
          <Box className="relative max-lg:row-start-1">
            <Box className="absolute inset-px rounded-lg bg-gray-800 max-lg:rounded-t-4xl" />
            <Flex direction="column" className="relative h-full overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
              <Box className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-white max-lg:text-center">Performance</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400 max-lg:text-center">
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit maiores impedit.
                </p>
              </Box>
              <Flex className="flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/component-images/dark-bento-03-performance.png"
                  className="w-full max-lg:max-w-xs"
                />
              </Flex>
            </Flex>
            <Box className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15 max-lg:rounded-t-4xl" />
          </Box>
          <Box className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
            <Box className="absolute inset-px rounded-lg bg-gray-800" />
            <Flex direction="column" className="relative h-full overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
              <Box className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-white max-lg:text-center">Security</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400 max-lg:text-center">
                  Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi.
                </p>
              </Box>
              <Flex className="@container flex-1 items-center max-lg:py-6 lg:pb-2">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/component-images/dark-bento-03-security.png"
                  className="h-[min(152px,40cqw)] object-cover"
                />
              </Flex>
            </Flex>
            <Box className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15" />
          </Box>
          <Box className="relative lg:row-span-2">
            <Box className="absolute inset-px rounded-lg bg-gray-800 max-lg:rounded-b-4xl lg:rounded-r-4xl" />
            <Flex direction="column" className="relative h-full overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <Box className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-white max-lg:text-center">Powerful APIs</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400 max-lg:text-center">
                  Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget sem sodales gravida.
                </p>
              </Box>
              <Box className="relative min-h-120 w-full grow">
                <Box className="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900/60 outline outline-white/10">
                  <Flex className="bg-gray-900 outline outline-white/5">
                    <Flex className="-mb-px text-sm/6 font-medium text-gray-400">
                      <Box className="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">
                        NotificationSetting.jsx
                      </Box>
                      <Box className="border-r border-gray-600/10 px-4 py-2">App.jsx</Box>
                    </Flex>
                  </Flex>
                  <Box className="px-6 pt-6 pb-14">{/* Your code example */}</Box>
                </Box>
              </Box>
            </Flex>
            <Box className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15 max-lg:rounded-b-4xl lg:rounded-r-4xl" />
          </Box>
        </Grid>
      </Box>
    </Box>
  )
}

export default BentoGridLight
