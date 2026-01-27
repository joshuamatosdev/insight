/**
 * Stat component using Catalyst styling
 * 
 * Based on the Catalyst demo stat component pattern.
 * Shows how to create new components that match Catalyst's design language.
 */

import { Badge } from '../../catalyst'
import { Subheading } from '../../catalyst'

interface StatProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}

export function Stat({ title, value, change, changeType }: StatProps) {
  const getBadgeColor = (): 'lime' | 'pink' | 'zinc' => {
    if (changeType === 'positive') return 'lime'
    if (changeType === 'negative') return 'pink'
    return 'zinc'
  }

  // Determine change type from the change string if not explicitly provided
  const derivedChangeType = (): 'positive' | 'negative' | 'neutral' => {
    if (changeType !== undefined) return changeType
    if (change === undefined || change === null) return 'neutral'
    if (change.startsWith('+')) return 'positive'
    if (change.startsWith('-')) return 'negative'
    return 'neutral'
  }

  return (
    <div className="rounded-xl border border-zinc-950/10 p-6 dark:border-white/10">
      <Subheading>{title}</Subheading>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
      {change !== undefined && change !== null && (
        <div className="mt-3">
          <Badge color={getBadgeColor()}>{change}</Badge>
        </div>
      )}
    </div>
  )
}

export default Stat
