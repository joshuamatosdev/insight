import type { CSSProperties } from 'react';
import type { MilestoneTimelineProps } from './Portal.types';
import type { Milestone } from '../../../types/portal';
import { Text, Badge } from '../../catalyst/primitives';
import { Flex, Stack, Box } from '../../catalyst/layout';

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
        return '#a1a1aa';
      case 'IN_PROGRESS':
        return '#2563eb';
      case 'COMPLETED':
        return '#10b981';
      case 'DELAYED':
        return '#ef4444';
      case 'AT_RISK':
        return '#f59e0b';
      case 'CANCELLED':
        return '#d4d4d8';
      default:
        return '#a1a1aa';
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
    padding: '1rem',
    ...style,
  };

  if (milestones.length === 0) {
    return (
      <Box className={className} style={containerStyles}>
        <Flex justify="center" align="center" className="p-8">
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
          top: '1.5rem',
          bottom: '1.5rem',
          width: '2px',
          backgroundColor: '#e4e4e7',
        }}
      />

      {/* Milestones */}
      <Stack spacing="md">
        {sortedMilestones.map((milestone, index) => {
          const color = getStatusColor(milestone.status);
          const isCritical = isOnCriticalPath(milestone.id);

          const nodeStyles: CSSProperties = {
            position: 'relative',
            marginLeft: '40px',
            padding: '0.75rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: isCritical
              ? '2px solid #ef4444'
              : '1px solid #e4e4e7',
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
            border: '3px solid #ffffff',
            boxShadow: '0 0 0 2px #e4e4e7',
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
                <Stack spacing="xs" style={{ flex: 1 }}>
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
                <Box className="mt-2">
                  <Box
                    style={{
                      height: '4px',
                      backgroundColor: '#e4e4e7',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        height: '100%',
                        width: `${milestone.percentComplete}%`,
                        backgroundColor: '#2563eb',
                        borderRadius: '9999px',
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
