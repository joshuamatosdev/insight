import {useCallback, useState} from 'react'
import {HStack, Stack} from '../../catalyst/layout'
import {Badge, Text} from '../../catalyst/primitives'
import {PipelineCard} from './PipelineCard'

import type {PipelineStageColumnProps} from './PipelineStageColumn.types'
import type {PipelineOpportunity} from '../../../types/pipeline'

function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '$0'
    }
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(0)}K`
    }
    return `$${value.toFixed(0)}`
}

export function PipelineStageColumn({
                                        stage,
                                        opportunities,
                                        onOpportunityClick,
                                        onOpportunityEdit,
                                        onOpportunityDelete,
                                        onOpportunityDrop,
                                        totalValue = 0,
                                        weightedValue = 0,
                                    }: PipelineStageColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragOver(false)

            const opportunityData = e.dataTransfer.getData('application/json')
            if (opportunityData.length === 0) {
                return
            }

            try {
                const opportunity = JSON.parse(opportunityData) as PipelineOpportunity
                if (opportunity.stageId !== stage.id && onOpportunityDrop !== undefined) {
                    onOpportunityDrop(opportunity, stage.id)
                }
            } catch {
                // Invalid JSON, ignore
            }
        },
        [stage.id, onOpportunityDrop]
    )

    const handleDragStart = useCallback(
        (e: React.DragEvent, opportunity: PipelineOpportunity) => {
            e.dataTransfer.setData('application/json', JSON.stringify(opportunity))
            e.dataTransfer.effectAllowed = 'move'
        },
        []
    )

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Column Header */}
            <div>
                <HStack justify="between" align="center">
                    <HStack gap="sm" align="center">
                        <div
                        />
                        <Text variant="bodySmall" weight="semibold">
                            {stage.name}
                        </Text>
                    </HStack>
                    <Badge color="gray" size="sm">
                        {opportunities.length}
                    </Badge>
                </HStack>

                <HStack justify="between" gap="md">
                    <Stack gap="0">
                        <Text variant="caption" color="secondary">
                            Total Value
                        </Text>
                        <Text variant="bodySmall" weight="medium">
                            {formatCurrency(totalValue)}
                        </Text>
                    </Stack>
                    <Stack gap="0">
                        <Text variant="caption" color="secondary">
                            Weighted
                        </Text>
                        <Text variant="bodySmall" weight="medium">
                            {formatCurrency(weightedValue)}
                        </Text>
                    </Stack>
                    {stage.probability !== null && (
                        <Stack gap="0">
                            <Text variant="caption" color="secondary">
                                Prob.
                            </Text>
                            <Text variant="bodySmall" weight="medium">
                                {stage.probability}%
                            </Text>
                        </Stack>
                    )}
                </HStack>
            </div>

            {/* Opportunity Cards */}
            <div>
                <Stack gap="sm">
                    {opportunities.map((opportunity) => (
                        <div
                            key={opportunity.id}
                            draggable={onOpportunityDrop !== undefined}
                            onDragStart={(e) => handleDragStart(e, opportunity)}
                        >
                            <PipelineCard
                                opportunity={opportunity}
                                onClick={onOpportunityClick}
                                onEdit={onOpportunityEdit}
                                onDelete={onOpportunityDelete}
                                showActions={onOpportunityEdit !== undefined || onOpportunityDelete !== undefined}
                            />
                        </div>
                    ))}

                    {opportunities.length === 0 && (
                        <div>
                            <Text variant="bodySmall" color="secondary">
                                No opportunities
                            </Text>
                            <Text variant="caption" color="secondary">
                                Drag opportunities here
                            </Text>
                        </div>
                    )}
                </Stack>
            </div>
        </div>
    )
}
