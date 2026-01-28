/**
 * OpportunityTable using Catalyst components with Pocket-style aesthetics
 *
 * Features:
 * - Light, minimal design with thin gray borders
 * - NO colored badges in cells
 * - Plain text with semantic color classes
 * - Subtle hover states
 * - Dense spacing for cleaner look
 */

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '../../catalyst'
import {Box} from '../../catalyst/layout'
import {OpportunityTableProps, Text} from '@/components'

export function OpportunityTableCatalyst({opportunities, maxRows}: OpportunityTableProps) {
    const formatDate = (dateStr: string | undefined): string => {
        if (dateStr === undefined || dateStr === null) return 'N/A'
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        } catch {
            return dateStr
        }
    }

    const getDeadlineColorClass = (deadline: string | undefined): string => {
        if (deadline === undefined || deadline === null) return 'text-zinc-400'
        const now = new Date()
        const dl = new Date(deadline)
        const daysUntil = (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        if (daysUntil < 0) return 'text-zinc-400'
        if (daysUntil <= 3) return 'text-danger'
        if (daysUntil <= 7) return 'text-warning'
        return 'text-zinc-600'
    }

    const truncate = (str: string | undefined, len: number): string => {
        if (str === undefined || str === null) return 'N/A'
        return str.length > len ? str.substring(0, len) + '...' : str
    }

    const displayOpportunities =
        maxRows !== undefined ? opportunities.slice(0, maxRows) : opportunities

    if (opportunities.length === 0) {
        return (
            <Box>
                <Text as="span" variant="bodySmall">No opportunities to display.</Text>
            </Box>
        )
    }

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeader>Title</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>NAICS</TableHeader>
                    <TableHeader>Deadline</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {displayOpportunities.map((opp) => (
                    <TableRow key={opp.id} href={opp.url ?? '#'} title={opp.title}>
                        <TableCell>
                            <Text as="span" variant="bodySmall" weight="medium">
                                {truncate(opp.title, 50)}
                            </Text>
                        </TableCell>
                        <TableCell>
                            <Text as="span" variant="bodySmall">
                                {opp.type !== undefined && opp.type !== null ? opp.type : 'N/A'}
                            </Text>
                        </TableCell>
                        <TableCell>
                            <Text as="span" variant="bodySmall">
                                {opp.naicsCode !== undefined && opp.naicsCode !== null ? opp.naicsCode : '—'}
                            </Text>
                        </TableCell>
                        <TableCell>
                            <Text as="span" variant="bodySmall">
                                {formatDate(opp.responseDeadLine)}
                            </Text>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default OpportunityTableCatalyst
