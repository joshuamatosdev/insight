/**
 * Stat component using Catalyst styling
 *
 * Based on the Catalyst demo stat component pattern.
 * Shows how to create new components that match Catalyst's design language.
 */

import {Badge, Subheading, Text} from '../../catalyst'
import {Box} from '../../catalyst/layout'

interface StatProps {
    title: string
    value: string | number
    change?: string
    changeType?: 'positive' | 'negative' | 'neutral'
}

export function Stat({title, value, change, changeType}: StatProps) {
    const getBadgeColor = (): 'lime' | 'pink' | 'zinc' => {
        if (changeType === 'positive') return 'lime'
        if (changeType === 'negative') return 'pink'
        return 'zinc'
    }

    return (
        <Box>
            <Subheading>{title}</Subheading>
            <Text>{value}</Text>
            {change !== undefined && change !== null && (
                <Box>
                    <Badge color={getBadgeColor()}>{change}</Badge>
                </Box>
            )}
        </Box>
    )
}

export default Stat
