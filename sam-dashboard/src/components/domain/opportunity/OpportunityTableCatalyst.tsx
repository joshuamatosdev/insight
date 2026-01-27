/**
 * OpportunityTable using Catalyst components
 * 
 * This demonstrates how to incrementally adopt Catalyst UI Kit
 * while keeping your existing business logic and domain types.
 */

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../catalyst'
import { Badge } from '../../catalyst'
import { Text } from '../../catalyst'
import { OpportunityTableProps, getOpportunityType } from './Opportunity.types'

export function OpportunityTableCatalyst({ opportunities, maxRows }: OpportunityTableProps) {
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

  const getDeadlineBadgeColor = (
    deadline: string | undefined
  ): 'red' | 'yellow' | 'green' | 'zinc' => {
    if (deadline === undefined || deadline === null) return 'zinc'
    const now = new Date()
    const dl = new Date(deadline)
    const daysUntil = (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    if (daysUntil < 0) return 'zinc'
    if (daysUntil <= 3) return 'red'
    if (daysUntil <= 7) return 'yellow'
    return 'green'
  }

  const getTypeBadgeColor = (
    type: string
  ): 'blue' | 'purple' | 'amber' | 'emerald' | 'zinc' => {
    const oppType = getOpportunityType(type)
    switch (oppType) {
      case 'solicitation':
        return 'blue'
      case 'sources-sought':
        return 'purple'
      case 'presolicitation':
        return 'amber'
      case 'award':
        return 'emerald'
      default:
        return 'zinc'
    }
  }

  const truncate = (str: string | undefined, len: number): string => {
    if (str === undefined || str === null) return 'N/A'
    return str.length > len ? str.substring(0, len) + '...' : str
  }

  const displayOpportunities =
    maxRows !== undefined ? opportunities.slice(0, maxRows) : opportunities

  if (opportunities.length === 0) {
    return (
      <div className="p-8 text-center">
        <Text className="text-zinc-500">No opportunities to display.</Text>
      </div>
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
              <Text className="font-medium">{truncate(opp.title, 50)}</Text>
            </TableCell>
            <TableCell>
              <Badge color={getTypeBadgeColor(opp.type)}>{opp.type}</Badge>
            </TableCell>
            <TableCell>
              {opp.naicsCode !== undefined && opp.naicsCode !== null ? (
                <Badge color="zinc">{opp.naicsCode}</Badge>
              ) : (
                <Text className="text-zinc-400">—</Text>
              )}
            </TableCell>
            <TableCell>
              <Badge color={getDeadlineBadgeColor(opp.responseDeadLine)}>
                {formatDate(opp.responseDeadLine)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default OpportunityTableCatalyst
