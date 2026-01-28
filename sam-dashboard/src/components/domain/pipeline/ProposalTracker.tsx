import {useMemo} from 'react'
import {Card, CardBody, CardHeader, HStack, Stack} from '../../catalyst/layout'
import {Badge, Text} from '../../catalyst/primitives'

import type {ProposalTrackerProps} from './ProposalTracker.types'
import type {PipelineStage} from '../../../types/pipeline'

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

function getDaysRemaining(deadline: string | null): number | null {
  if (deadline === null) {
    return null
  }
  const now = new Date()
  const due = new Date(deadline)
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getStageStatus(
  stage: PipelineStage,
  currentStagePosition: number
): 'completed' | 'current' | 'pending' {
  if (stage.position < currentStagePosition) {
    return 'completed'
  }
  if (stage.position === currentStagePosition) {
    return 'current'
  }
  return 'pending'
}

export function ProposalTracker({
  opportunity,
  stages,
  onStageChange,
}: ProposalTrackerProps) {
  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => a.position - b.position)
  }, [stages])

  const currentStage = useMemo(() => {
    return stages.find((s) => s.id === opportunity.stageId)
  }, [stages, opportunity.stageId])

  const currentStagePosition = currentStage?.position ?? 0
  const daysRemaining = getDaysRemaining(opportunity.responseDeadline)

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (sortedStages.length === 0) {
      return 0
    }
    const maxPosition = Math.max(...sortedStages.map((s) => s.position))
    if (maxPosition === 0) {
      return 0
    }
    return Math.round((currentStagePosition / maxPosition) * 100)
  }, [sortedStages, currentStagePosition])

  return (
    <Card>
      <CardHeader>
        <HStack justify="between" align="center">
          <Stack gap="xs">
            <Text variant="heading5">Proposal Progress</Text>
            <Text variant="caption" color="secondary">
              Current Stage: {currentStage?.name ?? 'Unknown'}
            </Text>
          </Stack>
          <Stack gap="xs" align="end">
            {daysRemaining !== null && (
              <Badge
                color={daysRemaining < 0 ? 'red' : daysRemaining <= 7 ? 'yellow' : 'green'}
              >
                {daysRemaining < 0
                  ? `${Math.abs(daysRemaining)} days overdue`
                  : `${daysRemaining} days remaining`}
              </Badge>
            )}
            <Text variant="caption" color="secondary">
              Due: {formatDate(opportunity.responseDeadline)}
            </Text>
          </Stack>
        </HStack>
      </CardHeader>
      <CardBody>
        <Stack gap="lg">
          {/* Progress bar */}
          <Stack gap="sm">
            <HStack justify="between" align="center">
              <Text variant="caption" color="secondary">
                Progress
              </Text>
              <Text variant="caption" weight="semibold">
                {progressPercentage}%
              </Text>
            </HStack>
            <div>
              <div
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </Stack>

          {/* Stage timeline */}
          <Stack gap="sm">
            {sortedStages.map((stage, index) => {
              const status = getStageStatus(stage, currentStagePosition)
              const isLast = index === sortedStages.length - 1

              return (
                <HStack key={stage.id} gap="md" align="start">
                  {/* Timeline indicator */}
                  <div>
                    <div
                    >
                      {status === 'completed' && (
                        <span>✓</span>
                      )}
                    </div>
                    {isLast === false && (
                      <div
                      />
                    )}
                  </div>

                  {/* Stage info */}
                  <div
                    onClick={
                      onStageChange !== undefined
                        ? () => onStageChange(stage.id)
                        : undefined
                    }
                  >
                    <HStack justify="between" align="center">
                      <Stack gap="0">
                        <Text
                          variant="bodySmall"
                          weight={status === 'current' ? 'semibold' : 'normal'}
                          color={status === 'pending' ? 'secondary' : 'default'}
                        >
                          {stage.name}
                        </Text>
                        {stage.description !== null && (
                          <Text variant="caption" color="secondary">
                            {stage.description}
                          </Text>
                        )}
                      </Stack>
                      {stage.probability !== null && (
                        <Text variant="caption" color="secondary">
                          {stage.probability}%
                        </Text>
                      )}
                    </HStack>
                  </div>
                </HStack>
              )
            })}
          </Stack>

          {/* Key dates */}
          <Stack gap="sm">
            <Text variant="caption" weight="semibold" color="secondary">
              Key Dates
            </Text>
            <HStack gap="lg" wrap="wrap">
              <Stack gap="0">
                <Text variant="caption" color="secondary">
                  Response Deadline
                </Text>
                <Text variant="bodySmall">
                  {formatDate(opportunity.responseDeadline)}
                </Text>
              </Stack>
              <Stack gap="0">
                <Text variant="caption" color="secondary">
                  Internal Deadline
                </Text>
                <Text variant="bodySmall">
                  {formatDate(opportunity.internalDeadline)}
                </Text>
              </Stack>
              <Stack gap="0">
                <Text variant="caption" color="secondary">
                  Review Date
                </Text>
                <Text variant="bodySmall">
                  {formatDate(opportunity.reviewDate)}
                </Text>
              </Stack>
              <Stack gap="0">
                <Text variant="caption" color="secondary">
                  Stage Entered
                </Text>
                <Text variant="bodySmall">
                  {formatDate(opportunity.stageEnteredAt)}
                </Text>
              </Stack>
            </HStack>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  )
}
