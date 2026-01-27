/**
 * USAGE EXAMPLES for Catalyst Stat Components
 *
 * This file demonstrates the various ways to use the Stat components.
 * These are NOT tests - they are documentation examples.
 */

import { Stat, StatChange, StatGroup, StatIcon, StatLabel, StatValue } from './stat'

// Example 1: Simple stats with trending indicators
export function SimpleStatsWithTrending() {
  const stats = [
    { name: 'Revenue', value: '$405,091.00', change: '+4.75%', trend: 'up' as const },
    { name: 'Overdue invoices', value: '$12,787.00', change: '+54.02%', trend: 'down' as const },
    { name: 'Outstanding invoices', value: '$245,988.00', change: '-1.39%', trend: 'up' as const },
    { name: 'Expenses', value: '$30,156.00', change: '+10.18%', trend: 'down' as const },
  ]

  return (
    <StatGroup columns={4}>
      {stats.map((stat) => (
        <Stat key={stat.name}>
          <StatLabel>{stat.name}</StatLabel>
          <StatChange trend={stat.trend}>{stat.change}</StatChange>
          <StatValue>{stat.value}</StatValue>
        </Stat>
      ))}
    </StatGroup>
  )
}

// Example 2: Simple stats without change indicators
export function SimpleStats() {
  const stats = [
    { name: 'Number of deploys', value: '405' },
    { name: 'Average deploy time', value: '3.65 mins' },
    { name: 'Number of servers', value: '3' },
    { name: 'Success rate', value: '98.5%' },
  ]

  return (
    <StatGroup columns={4}>
      {stats.map((stat) => (
        <Stat key={stat.name}>
          <StatLabel>{stat.name}</StatLabel>
          <StatValue>{stat.value}</StatValue>
        </Stat>
      ))}
    </StatGroup>
  )
}

// Example 3: Stats with neutral trend (no arrow)
export function StatsWithNeutralTrend() {
  return (
    <StatGroup columns={3}>
      <Stat>
        <StatLabel>Active Contracts</StatLabel>
        <StatChange trend="neutral">No change</StatChange>
        <StatValue>42</StatValue>
      </Stat>
      <Stat>
        <StatLabel>Pending Proposals</StatLabel>
        <StatChange trend="neutral">0%</StatChange>
        <StatValue>12</StatValue>
      </Stat>
      <Stat>
        <StatLabel>Team Members</StatLabel>
        <StatValue>8</StatValue>
      </Stat>
    </StatGroup>
  )
}

// Example 4: Stats with custom icons (using StatIcon)
export function StatsWithIcons() {
  return (
    <StatGroup columns={2}>
      <Stat>
        <StatIcon>
          <svg className="size-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </StatIcon>
        <StatLabel>Total Revenue</StatLabel>
        <StatChange trend="up">+12.5%</StatChange>
        <StatValue>$1,234,567</StatValue>
      </Stat>
      <Stat>
        <StatIcon>
          <svg className="size-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </StatIcon>
        <StatLabel>Completed Projects</StatLabel>
        <StatChange trend="up">+23</StatChange>
        <StatValue>156</StatValue>
      </Stat>
    </StatGroup>
  )
}

// Example 5: Responsive column layouts
export function ResponsiveStatsLayouts() {
  const stats = [
    { name: 'Metric A', value: '1,234' },
    { name: 'Metric B', value: '5,678' },
    { name: 'Metric C', value: '9,012' },
  ]

  return (
    <div className="space-y-8">
      {/* Single column on mobile, 2 on tablet, 3 on desktop */}
      <StatGroup columns={3}>
        {stats.map((stat) => (
          <Stat key={stat.name}>
            <StatLabel>{stat.name}</StatLabel>
            <StatValue>{stat.value}</StatValue>
          </Stat>
        ))}
      </StatGroup>

      {/* Single column on mobile, 2 on tablet and up */}
      <StatGroup columns={2}>
        {stats.slice(0, 2).map((stat) => (
          <Stat key={stat.name}>
            <StatLabel>{stat.name}</StatLabel>
            <StatValue>{stat.value}</StatValue>
          </Stat>
        ))}
      </StatGroup>

      {/* Always single column */}
      <StatGroup columns={1}>
        <Stat>
          <StatLabel>{stats[0]?.name}</StatLabel>
          <StatValue>{stats[0]?.value}</StatValue>
        </Stat>
      </StatGroup>
    </div>
  )
}

// Example 6: Custom styling with className override
export function CustomStyledStats() {
  return (
    <StatGroup columns={2} className="rounded-lg shadow-lg">
      <Stat className="border-l-4 border-indigo-500">
        <StatLabel className="text-indigo-600">Primary Metric</StatLabel>
        <StatChange trend="up" className="font-bold">
          +15.3%
        </StatChange>
        <StatValue className="text-indigo-900">$500,000</StatValue>
      </Stat>
      <Stat className="border-l-4 border-rose-500">
        <StatLabel className="text-rose-600">Alert Metric</StatLabel>
        <StatChange trend="down" className="font-bold">
          -5.2%
        </StatChange>
        <StatValue className="text-rose-900">$75,000</StatValue>
      </Stat>
    </StatGroup>
  )
}
