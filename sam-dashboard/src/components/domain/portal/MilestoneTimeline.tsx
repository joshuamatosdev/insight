import type { CSSProperties } from 'react';
import type { MilestoneTimelineProps } from './Portal.types';
import type { Milestone } from '../../../types/portal';
import { Text, Badge } from '../../primitives';
import { Flex, Stack, Box } from '../../layout';

/**
 * Visual timeline component for displaying milestones.
 */
export function MilestoneTimeline({
  milestones,
  onMilestoneClick,
  showCriticalPath = false,
  criticalPath = [],
  className,
  style,
}: MilestoneTimelineProps): React.ReactElement {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'NOT_STARTED':
        return 'var(--color-gray-400)';
      case 'IN_PROGRESS':
        return 'var(--color-primary)';
      case 'COMPLETED':
        return 'var(--color-success)';
      case 'DELAYED':
        return 'var(--color-danger)';
      case 'AT_RISK':
        return 'var(--color-warning)';
      case 'CANCELLED':
        return 'var(--color-gray-300)';
      default:
        return 'var(--color-gray-400)';
    }
  };

  const getStatusVariant = (
    status: string
  ): 'primary' | 'success' | 'warning' | 'secondary' | 'danger' => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'DELAYED':
        return 'danger';
      case 'AT_RISK':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const sortedMilestones = [...milestones].sort((a, b) => {
    return new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime();
  });

  const isOnCriticalPath = (milestoneId: string): boolean => {
    return showCriticalPath && criticalPath.includes(milestoneId);
  };

  const handleClick = (milestone: Milestone) => {
    if (onMilestoneClick !== undefined) {
      onMilestoneClick(milestone);
    }
  };

  const containerStyles: CSSProperties = {
    position: 'relative',
    padding: 'var(--spacing-4)',
    ...style,
  };

  if (milestones.length === 0) {
    return (
      <Box className={className} style={containerStyles}>
        <Flex justify="center" align="center" style={{ padding: 'var(--spacing-8)' }}>
          <Text variant="body" color="muted">
            No milestones to display
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box className={className} style={containerStyles}>
      {/* Timeline line */}
      <Box
        style={{
          position: 'absolute',
          left: '20px',
          top: 'var(--spacing-6)',
          bottom: 'var(--spacing-6)',
          width: '2px',
          backgroundColor: 'var(--color-gray-200)',
        }}
      />

      {/* Milestones */}
      <Stack spacing="var(--spacing-4)">
        {sortedMilestones.map((milestone, index) => {
          const color = getStatusColor(milestone.status);
          const isCritical = isOnCriticalPath(milestone.id);

          const nodeStyles: CSSProperties = {
            position: 'relative',
            marginLeft: '40px',
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            border: isCritical
              ? '2px solid var(--color-danger)'
              : '1px solid var(--color-gray-200)',
            cursor: onMilestoneClick !== undefined ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
          };

          const dotStyles: CSSProperties = {
            position: 'absolute',
            left: '-32px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: color,
            border: '3px solid var(--color-white)',
            boxShadow: '0 0 0 2px var(--color-gray-200)',
          };

          return (
            <Box
              key={milestone.id}
              style={nodeStyles}
              onClick={() => handleClick(milestone)}
              role={onMilestoneClick !== undefined ? 'button' : undefined}
              tabIndex={onMilestoneClick !== undefined ? 0 : undefined}
              onKeyDown={(e) => {
                if (
                  onMilestoneClick !== undefined &&
                  (e.key === 'Enter' || e.key === ' ')
                ) {
                  e.preventDefault();
                  handleClick(milestone);
                }
              }}
            >
              {/* Timeline dot */}
              <Box style={dotStyles} aria-hidden="true" />

              {/* Content */}
              <Flex justify="space-between" align="flex-start">
                <Stack spacing="var(--spacing-1)" style={{ flex: 1 }}>
                  <Flex align="center" gap="sm">
                    <Text variant="bodySmall" weight="semibold">
                      {milestone.name}
                    </Text>
                    {isCritical && (
                      <Badge variant="danger" size="sm">
                        Critical Path
                      </Badge>
                    )}
                  </Flex>
                  {milestone.description !== null && milestone.description !== '' && (
                    <Text variant="caption" color="muted">
                      {milestone.description}
                    </Text>
                  )}
                  <Flex align="center" gap="md">
                    <Badge variant={getStatusVariant(milestone.status)} size="sm">
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                    {milestone.percentComplete > 0 && milestone.status !== 'COMPLETED' && (
                      <Text variant="caption" color="muted">
                        {milestone.percentComplete}% complete
                      </Text>
                    )}
                  </Flex>
                </Stack>

                {/* Date */}
                <Stack spacing="0" align="flex-end">
                  <Text variant="caption" color="muted">
                    {milestone.completedDate !== null
                      ? 'Completed'
                      : milestone.actualDate !== null
                      ? 'Actual'
                      : 'Planned'}
                  </Text>
                  <Text variant="bodySmall" weight="medium">
                    {formatDate(
                      milestone.completedDate ??
                        milestone.actualDate ??
                        milestone.plannedDate
                    )}
                  </Text>
                </Stack>
              </Flex>

              {/* Progress bar for in-progress milestones */}
              {milestone.status === 'IN_PROGRESS' && (
                <Box style={{ marginTop: 'var(--spacing-2)' }}>
                  <Box
                    style={{
                      height: '4px',
                      backgroundColor: 'var(--color-gray-200)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        height: '100%',
                        width: `${milestone.percentComplete}%`,
                        backgroundColor: 'var(--color-primary)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

export default MilestoneTimeline;
