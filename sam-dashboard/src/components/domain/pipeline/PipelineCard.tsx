import {Card, CardBody, CardHeader, HStack, Stack} from '../../catalyst/layout'
import {Badge, Button, Text} from '../../catalyst/primitives'

import type {PipelineCardProps} from './PipelineCard.types'
import type {BidDecision} from '../../../types/pipeline'

function getBidDecisionLabel(decision: BidDecision): string {
    const labels: Record<BidDecision, string> = {
        PENDING: 'Pending',
        BID: 'Bid',
        NO_BID: 'No Bid',
        WATCH: 'Watch',
    }
    return labels[decision]
}

function getBidDecisionVariant(decision: BidDecision): 'yellow' | 'green' | 'red' | 'blue' {
    const variants: Record<BidDecision, 'yellow' | 'green' | 'red' | 'blue'> = {
        PENDING: 'yellow',
        BID: 'green',
        NO_BID: 'red',
        WATCH: 'blue',
    }
    return variants[decision]
}

function formatCurrency(value: number | null): string {
    if (value === null) {
        return '-'
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value)
}

function formatDate(dateString: string | null): string {
    if (dateString === null) {
        return '-'
    }
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function isDeadlineApproaching(deadline: string | null): boolean {
    if (deadline === null) {
        return false
    }
    const daysUntil = Math.ceil(
        (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return daysUntil >= 0 && daysUntil <= 7
}

function isDeadlinePast(deadline: string | null): boolean {
    if (deadline === null) {
        return false
    }
    return new Date(deadline).getTime() < Date.now()
}

export function PipelineCard({
                                 opportunity,
                                 onClick,
                                 onEdit,
                                 onDelete,
                                 showActions = true,
                                 isDragging = false,
                             }: PipelineCardProps) {
    const handleClick = () => {
        if (onClick !== undefined) {
            onClick(opportunity)
        }
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onEdit !== undefined) {
            onEdit(opportunity)
        }
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onDelete !== undefined) {
            onDelete(opportunity)
        }
    }

    const title = opportunity.internalName ?? opportunity.opportunityTitle ?? 'Untitled'
    const deadlineApproaching = isDeadlineApproaching(opportunity.responseDeadline)
    const deadlinePast = isDeadlinePast(opportunity.responseDeadline)

    return (
        <Card
            onClick={onClick !== undefined ? handleClick : undefined}
        >
            <CardHeader>
                <Stack gap="xs">
                    <HStack justify="between" align="start">
                        <Text variant="bodySmall" weight="semibold">
                            {title}
                        </Text>
                        <Badge color={getBidDecisionVariant(opportunity.decision)} size="sm">
                            {getBidDecisionLabel(opportunity.decision)}
                        </Badge>
                    </HStack>
                    {opportunity.solicitationNumber !== null && (
                        <Text variant="caption" color="secondary">
                            {opportunity.solicitationNumber}
                        </Text>
                    )}
                </Stack>
            </CardHeader>
            <CardBody>
                <Stack gap="sm">
                    <HStack justify="between" align="center">
                        <Text variant="caption" color="secondary">
                            Est. Value
                        </Text>
                        <Text variant="bodySmall" weight="medium">
                            {formatCurrency(opportunity.estimatedValue)}
                        </Text>
                    </HStack>

                    {opportunity.probabilityOfWin !== null && (
                        <HStack justify="between" align="center">
                            <Text variant="caption" color="secondary">
                                Prob. Win
                            </Text>
                            <Text variant="bodySmall">{opportunity.probabilityOfWin}%</Text>
                        </HStack>
                    )}

                    {opportunity.responseDeadline !== null && (
                        <HStack justify="between" align="center">
                            <Text variant="caption" color="secondary">
                                Due Date
                            </Text>
                            <Text
                                variant="bodySmall"
                                color={
                                    deadlinePast === true
                                        ? 'danger'
                                        : deadlineApproaching === true
                                            ? 'warning'
                                            : 'default'
                                }
                                weight={deadlineApproaching === true || deadlinePast === true ? 'semibold' : 'normal'}
                            >
                                {formatDate(opportunity.responseDeadline)}
                            </Text>
                        </HStack>
                    )}

                    {opportunity.ownerName !== null && (
                        <HStack justify="between" align="center">
                            <Text variant="caption" color="secondary">
                                Owner
                            </Text>
                            <Text variant="bodySmall">{opportunity.ownerName}</Text>
                        </HStack>
                    )}

                    {showActions === true && (onEdit !== undefined || onDelete !== undefined) && (
                        <HStack justify="end" gap="sm">
                            {onEdit !== undefined && (
                                <Button variant="ghost" size="sm" onClick={handleEdit}>
                                    Edit
                                </Button>
                            )}
                            {onDelete !== undefined && (
                                <Button variant="ghost" size="sm" onClick={handleDelete}>
                                    Remove
                                </Button>
                            )}
                        </HStack>
                    )}
                </Stack>
            </CardBody>
        </Card>
    )
}
