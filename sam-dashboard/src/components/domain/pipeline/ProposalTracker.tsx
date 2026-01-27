import { useMemo } from 'react';
import { Card, CardHeader, CardBody } from '../../layout/Card';
import { Stack, HStack } from '../../layout/Stack';
import { Box } from '../../layout/Box';
import { Text } from '../../primitives/Text';
import { Badge } from '../../primitives/Badge';
import type { ProposalTrackerProps } from './ProposalTracker.types';
import type { PipelineStage } from '../../../types/pipeline';

function formatDate(dateString: string | null): string {
  if (dateString === null) {
    return '-';
  }
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysRemaining(deadline: string | null): number | null {
  if (deadline === null) {
    return null;
  }
  const now = new Date();
  const due = new Date(deadline);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getStageStatus(
  stage: PipelineStage,
  currentStagePosition: number
): 'completed' | 'current' | 'pending' {
  if (stage.position < currentStagePosition) {
    return 'completed';
  }
  if (stage.position === currentStagePosition) {
    return 'current';
  }
  return 'pending';
}

function getStatusColor(status: 'completed' | 'current' | 'pending'): string {
  switch (status) {
    case 'completed':
      return 'var(--color-success)';
    case 'current':
      return 'var(--color-primary)';
    case 'pending':
      return 'var(--color-gray-300)';
    default:
      return 'var(--color-gray-300)';
  }
}

export function ProposalTracker({
  opportunity,
  stages,
  onStageChange,
}: ProposalTrackerProps) {
  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => a.position - b.position);
  }, [stages]);

  const currentStage = useMemo(() => {
    return stages.find((s) => s.id === opportunity.stageId);
  }, [stages, opportunity.stageId]);

  const currentStagePosition = currentStage?.position ?? 0;
  const daysRemaining = getDaysRemaining(opportunity.responseDeadline);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (sortedStages.length === 0) {
      return 0;
    }
    const maxPosition = Math.max(...sortedStages.map((s) => s.position));
    if (maxPosition === 0) {
      return 0;
    }
    return Math.round((currentStagePosition / maxPosition) * 100);
  }, [sortedStages, currentStagePosition]);

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
            <Box
              style={{
                height: '8px',
                backgroundColor: 'var(--color-gray-200)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  height: '100%',
                  width: `${progressPercentage}%`,
                  backgroundColor: 'var(--color-primary)',
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
          </Stack>

          {/* Stage timeline */}
          <Stack gap="sm">
            {sortedStages.map((stage, index) => {
              const status = getStageStatus(stage, currentStagePosition);
              const isLast = index === sortedStages.length - 1;

              return (
                <HStack key={stage.id} gap="md" align="start">
                  {/* Timeline indicator */}
                  <Stack gap="0" align="center" style={{ width: '24px' }}>
                    <Box
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(status),
                        border: status === 'current' ? '3px solid var(--color-primary-light)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {status === 'completed' && (
                        <Text variant="caption" color="white" style={{ fontSize: '10px' }}>
                          ✓
                        </Text>
                      )}
                    </Box>
                    {isLast === false && (
                      <Box
                        style={{
                          width: '2px',
                          height: '32px',
                          backgroundColor:
                            status === 'completed'
                              ? 'var(--color-success)'
                              : 'var(--color-gray-300)',
                        }}
                      />
                    )}
                  </Stack>

                  {/* Stage info */}
                  <Box
                    onClick={
                      onStageChange !== undefined
                        ? () => onStageChange(stage.id)
                        : undefined
                    }
                    style={{
                      flex: 1,
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      backgroundColor:
                        status === 'current'
                          ? 'var(--color-primary-light)'
                          : 'transparent',
                      borderRadius: 'var(--radius-md)',
                      cursor: onStageChange !== undefined ? 'pointer' : 'default',
                    }}
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
                  </Box>
                </HStack>
              );
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
  );
}
