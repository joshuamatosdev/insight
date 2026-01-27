// Tailwind Plus UI Blocks - Stats
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/data-display/stats
// Format: React JSX (v4.1)
// Downloaded automatically

import { Grid, Stack, HStack, Flex } from '@/components/catalyst/layout';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { CursorArrowRaysIcon, EnvelopeOpenIcon, UsersIcon } from '@heroicons/react/24/outline';

// =============================================================================
// 1. With trending
// =============================================================================
const stats1 = [
  { name: 'Revenue', value: '$405,091.00', change: '+4.75%', changeType: 'positive' },
  { name: 'Overdue invoices', value: '$12,787.00', change: '+54.02%', changeType: 'negative' },
  { name: 'Outstanding invoices', value: '$245,988.00', change: '-1.39%', changeType: 'positive' },
  { name: 'Expenses', value: '$30,156.00', change: '+10.18%', changeType: 'negative' },
];

function classNames(...classes: Array<string | boolean | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

export function StatsWithTrending() {
  return (
    <dl className="mx-auto bg-gray-900/5 dark:bg-white/10">
      <Grid columns={1} gap="none" className="sm:grid-cols-2 lg:grid-cols-4 gap-px">
        {stats1.map((stat) => (
          <Flex
            key={stat.name}
            wrap="wrap"
            align="baseline"
            justify="between"
            gap="md"
            className="bg-white px-4 py-10 sm:px-6 xl:px-8 dark:bg-gray-900"
          >
            <dt className="text-sm/6 font-medium text-gray-500 dark:text-gray-400">{stat.name}</dt>
            <dd
              className={classNames(
                stat.changeType === 'negative' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-gray-300',
                'text-xs font-medium',
              )}
            >
              {stat.change}
            </dd>
            <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900 dark:text-white">
              {stat.value}
            </dd>
          </Flex>
        ))}
      </Grid>
    </dl>
  );
}


// =============================================================================
// 2. Simple
// =============================================================================
const stats2 = [
  { name: 'Number of deploys', value: '405' },
  { name: 'Average deploy time', value: '3.65', unit: 'mins' },
  { name: 'Number of servers', value: '3' },
  { name: 'Success rate', value: '98.5%' },
];

export function StatsSimple() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <Grid columns={1} gap="none" className="bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-4 gap-px dark:bg-white/10">
          {stats2.map((stat) => (
            <div key={stat.name} className="bg-white px-4 py-6 sm:px-6 lg:px-8 dark:bg-gray-900">
              <p className="text-sm/6 font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
              <HStack spacing="xs" align="baseline" className="mt-2">
                <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {stat.value}
                </span>
                {stat.unit !== undefined && stat.unit !== null ? (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{stat.unit}</span>
                ) : null}
              </HStack>
            </div>
          ))}
        </Grid>
      </div>
    </div>
  );
}


// =============================================================================
// 3. Simple in cards
// =============================================================================
const stats3 = [
  { name: 'Total Subscribers', stat: '71,897' },
  { name: 'Avg. Open Rate', stat: '58.16%' },
  { name: 'Avg. Click Rate', stat: '24.57%' },
];

export function StatsSimpleInCards() {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Last 30 days</h3>
      <dl className="mt-5">
        <Grid columns={1} gap="md" className="sm:grid-cols-3">
          {stats3.map((item) => (
            <div
              key={item.name}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm sm:p-6 dark:bg-gray-800/75 dark:inset-ring dark:inset-ring-white/10"
            >
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{item.stat}</dd>
            </div>
          ))}
        </Grid>
      </dl>
    </div>
  );
}


// =============================================================================
// 4. With brand icon
// =============================================================================
const stats4 = [
  { id: 1, name: 'Total Subscribers', stat: '71,897', icon: UsersIcon, change: '122', changeType: 'increase' },
  { id: 2, name: 'Avg. Open Rate', stat: '58.16%', icon: EnvelopeOpenIcon, change: '5.4%', changeType: 'increase' },
  { id: 3, name: 'Avg. Click Rate', stat: '24.57%', icon: CursorArrowRaysIcon, change: '3.2%', changeType: 'decrease' },
];

export function StatsWithBrandIcon() {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Last 30 days</h3>

      <dl className="mt-5">
        <Grid columns={1} gap="md" className="sm:grid-cols-2 lg:grid-cols-3">
          {stats4.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow-sm sm:px-6 sm:pt-6 dark:bg-gray-800/75 dark:inset-ring dark:inset-ring-white/10"
            >
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <item.icon aria-hidden="true" className="size-6 text-white" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</p>
              </dt>
              <dd className="ml-16 pb-6 sm:pb-7">
                <HStack spacing="xs" align="baseline">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{item.stat}</p>
                  <p
                    className={classNames(
                      item.changeType === 'increase'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400',
                      'ml-2 flex items-baseline text-sm font-semibold',
                    )}
                  >
                    {item.changeType === 'increase' ? (
                      <ArrowUpIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 self-center text-green-500 dark:text-green-400"
                      />
                    ) : (
                      <ArrowDownIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 self-center text-red-500 dark:text-red-400"
                      />
                    )}

                    <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                    {item.change}
                  </p>
                </HStack>
                <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6 dark:bg-gray-700/20">
                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      View all<span className="sr-only"> {item.name} stats</span>
                    </a>
                  </div>
                </div>
              </dd>
            </div>
          ))}
        </Grid>
      </dl>
    </div>
  );
}


// =============================================================================
// 5. With shared borders
// =============================================================================
const stats5 = [
  { name: 'Total Subscribers', stat: '71,897', previousStat: '70,946', change: '12%', changeType: 'increase' },
  { name: 'Avg. Open Rate', stat: '58.16%', previousStat: '56.14%', change: '2.02%', changeType: 'increase' },
  { name: 'Avg. Click Rate', stat: '24.57%', previousStat: '28.62%', change: '4.05%', changeType: 'decrease' },
];

export function StatsWithSharedBorders() {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Last 30 days</h3>
      <dl className="mt-5 divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm md:divide-x md:divide-y-0 dark:divide-white/10 dark:bg-gray-800/75 dark:shadow-none dark:inset-ring dark:inset-ring-white/10">
        <Grid columns={1} className="md:grid-cols-3">
          {stats5.map((item) => (
            <div key={item.name} className="px-4 py-5 sm:p-6">
              <dt className="text-base font-normal text-gray-900 dark:text-gray-100">{item.name}</dt>
              <dd className="mt-1 md:block lg:flex">
                <Flex align="baseline" justify="between" className="gap-x-4">
                  <HStack spacing="xs" align="baseline" className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>{item.stat}</span>
                    <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      from {item.previousStat}
                    </span>
                  </HStack>

                  <HStack
                    spacing="none"
                    align="baseline"
                    className={classNames(
                      item.changeType === 'increase'
                        ? 'bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-400',
                      'rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0',
                    )}
                  >
                    {item.changeType === 'increase' ? (
                      <ArrowUpIcon
                        aria-hidden="true"
                        className="mr-0.5 -ml-1 size-5 shrink-0 self-center text-green-500 dark:text-green-400"
                      />
                    ) : (
                      <ArrowDownIcon
                        aria-hidden="true"
                        className="mr-0.5 -ml-1 size-5 shrink-0 self-center text-red-500 dark:text-red-400"
                      />
                    )}

                    <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                    {item.change}
                  </HStack>
                </Flex>
              </dd>
            </div>
          ))}
        </Grid>
      </dl>
    </div>
  );
}


// Default export for backwards compatibility
export default StatsWithTrending;
