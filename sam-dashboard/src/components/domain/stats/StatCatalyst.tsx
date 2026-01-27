/**
 * Stat component using Catalyst styling
 * 
 * Based on the Catalyst demo stat component pattern.
 * Shows how to create new components that match Catalyst's design language.
 */

import { Badge, Subheading, Text } from '../../catalyst'
import { Box } from '../../layout'

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

  return (
    <Box className="rounded-xl border border-zinc-950/10 p-6 dark:border-white/10">
      <Subheading>{title}</Subheading>
      <Text className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</Text>
      {change !== undefined && change !== null && (
        <Box className="mt-3">
          <Badge color={getBadgeColor()}>{change}</Badge>
        </Box>
      )}
    </Box>
  )
}

export default Stat
