// Tailwind Plus UI Blocks - Media Objects
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/layout/media-objects
// Format: React JSX (v4.1)
// Downloaded automatically

import { Flex, Stack } from '@/components/catalyst/layout';

// =============================================================================
// 1. Basic
// =============================================================================
export function MediaObjectBasic() {
  return (
    <Flex>
      <div className="mr-4 shrink-0">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="size-16 border border-gray-300 bg-white text-gray-300 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
        >
          <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <Stack spacing="none">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lorem ipsum</h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
          quidem ipsam quia iusto.
        </p>
      </Stack>
    </Flex>
  );
}


// =============================================================================
// 2. Aligned to center
// =============================================================================
export function MediaObjectAlignedCenter() {
  return (
    <Flex align="center">
      <div className="mr-4 shrink-0">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="size-16 border border-gray-300 bg-white text-gray-300 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
        >
          <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <Stack spacing="none">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lorem ipsum</h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
          quidem ipsam quia iusto.
        </p>
      </Stack>
    </Flex>
  );
}


// =============================================================================
// 3. Aligned to bottom
// =============================================================================
export function MediaObjectAlignedBottom() {
  return (
    <Flex align="end">
      <div className="mr-4 shrink-0">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="size-16 border border-gray-300 bg-white text-gray-300 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
        >
          <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <Stack spacing="none">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lorem ipsum</h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
          quidem ipsam quia iusto.
        </p>
      </Stack>
    </Flex>
  );
}


// =============================================================================
// 4. Stretched to fit
// =============================================================================
export function MediaObjectStretched() {
  return (
    <Flex>
      <div className="mr-4 shrink-0">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="h-full w-16 border border-gray-300 bg-white text-gray-300 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
        >
          <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <Stack spacing="none">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lorem ipsum</h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
          quidem ipsam quia iusto.
        </p>
      </Stack>
    </Flex>
  );
}


// =============================================================================
// 5. Media on right
// =============================================================================
export function MediaObjectMediaOnRight() {
  return (
    <Flex>
      <Stack spacing="none">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lorem ipsum</h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
          quidem ipsam quia iusto.
        </p>
      </Stack>
      <div className="ml-4 shrink-0">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="size-16 border border-gray-300 bg-white text-gray-300 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
        >
          <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </Flex>
  );
}


// =============================================================================
// 6. Basic responsive
// =============================================================================
export function MediaObjectBasicResponsive() {
  return (
    <Flex className="flex-col sm:flex-row">
      <div className="mb-4 shrink-0 sm:mr-4 sm:mb-0">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="size-16 border border-gray-300 bg-white text-gray-300 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
        >
          <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <Stack spacing="none">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lorem ipsum</h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
          quidem ipsam quia iusto.
        </p>
      </Stack>
    </Flex>
  );
}


// =============================================================================
// 7. Wide responsive
// =============================================================================
export function MediaObjectWideResponsive() {
  return (
    <Flex className="flex-col sm:flex-row">
      <div className="mb-4 shrink-0 sm:mr-4 sm:mb-0">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="h-32 w-full border border-gray-300 bg-white text-gray-300 sm:w-32 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
        >
          <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <Stack spacing="none">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lorem ipsum</h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
          quidem ipsam quia iusto.
        </p>
      </Stack>
    </Flex>
  );
}


// =============================================================================
// 8. Nested
// =============================================================================
export function MediaObjectNested() {
  return (
    <Flex>
      <div className="mr-4 shrink-0">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="size-16 border border-gray-300 bg-white text-gray-300 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
        >
          <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <Stack spacing="none">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lorem ipsum</h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
          quidem ipsam quia iusto.
        </p>

        <Flex className="mt-6">
          <div className="mr-4 shrink-0">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 200 200"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="size-12 border border-gray-300 bg-white text-gray-300 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
            >
              <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <Stack spacing="none">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lorem ipsum</h4>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
              quidem ipsam quia iusto.
            </p>
          </Stack>
        </Flex>
        <Flex className="mt-6">
          <div className="mr-4 shrink-0">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 200 200"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="size-12 border border-gray-300 bg-white text-gray-300 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
            >
              <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <Stack spacing="none">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lorem ipsum</h4>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
              quidem ipsam quia iusto.
            </p>
          </Stack>
        </Flex>
      </Stack>
    </Flex>
  );
}


// Default export for backwards compatibility
export default MediaObjectBasic;
