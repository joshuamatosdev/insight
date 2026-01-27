import type { CSSProperties } from 'react';
import type { SprintCardProps } from './Portal.types';
import { Text, Badge, Button } from '../../primitives';
import { Card, CardHeader, CardBody, CardFooter, Flex, Stack, Box, HStack } from '../../layout';

/**
 * Displays sprint information in a card format.
 */
export function SprintCard({
  sprint,
  isSelected = false,
  onClick,
  onEdit,
  onDelete,
  className,
  style,
}: SprintCardProps): React.ReactElement {
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

  const getStatusVariant = (
    status: string
  ): 'primary' | 'success' | 'warning' | 'secondary' | 'danger' => {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'PLANNING':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const tasksByStatus = {
    todo: sprint.tasks.filter((t) => t.status === 'TODO').length,
    inProgress: sprint.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    inReview: sprint.tasks.filter((t) => t.status === 'IN_REVIEW').length,
    done: sprint.tasks.filter((t) => t.status === 'DONE').length,
  };

  const totalTasks = sprint.tasks.length;
  const completedPercentage = totalTasks > 0 ? Math.round((tasksByStatus.done / totalTasks) * 100) : 0;

  const cardStyles: CSSProperties = {
    cursor: onClick !== undefined ? 'pointer' : 'default',
    border: isSelected ? '2px solid #2563eb' : undefined,
    ...style,
  };

  const handleClick = () => {
    if (onClick !== undefined) {
      onClick(sprint);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit !== undefined) {
      onEdit(sprint);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete !== undefined) {
      onDelete(sprint);
    }
  };

  return (
    <Card
      className={className}
      style={cardStyles}
      onClick={handleClick}
      aria-label={`Sprint: ${sprint.name}`}
    >
      <CardHeader>
        <Flex justify="space-between" align="flex-start">
          <Stack spacing="xs">
            <Text variant="heading5">{sprint.name}</Text>
            <Text variant="caption" color="muted">
              {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
            </Text>
          </Stack>
          <Badge variant={getStatusVariant(sprint.status)} size="sm">
            {sprint.status}
          </Badge>
        </Flex>
      </CardHeader>
      <CardBody>
        {sprint.goal !== null && sprint.goal !== '' && (
          <Box className="mb-3">
            <Text variant="bodySmall" color="muted">
              {sprint.goal}
            </Text>
          </Box>
        )}

        {/* Progress Bar */}
        <Box className="mb-3">
          <Flex justify="space-between" align="center" className="mb-1">
            <Text variant="caption" color="muted">
              Progress
            </Text>
            <Text variant="caption" weight="semibold">
              {completedPercentage}%
            </Text>
          </Flex>
          <Box
            style={{
              height: '6px',
              backgroundColor: '#e4e4e7',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                height: '100%',
                width: `${completedPercentage}%`,
                backgroundColor: '#10b981',
                borderRadius: '9999px',
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>

        {/* Task Summary */}
        <HStack spacing="sm">
          <Box
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#f4f4f5',
              borderRadius: '0.25rem',
            }}
          >
            <Text variant="caption">{tasksByStatus.todo} Todo</Text>
          </Box>
          <Box
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#f0f9ff',
              borderRadius: '0.25rem',
            }}
          >
            <Text variant="caption">{tasksByStatus.inProgress} In Progress</Text>
          </Box>
          <Box
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#fffbeb',
              borderRadius: '0.25rem',
            }}
          >
            <Text variant="caption">{tasksByStatus.inReview} Review</Text>
          </Box>
          <Box
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#d1fae5',
              borderRadius: '0.25rem',
            }}
          >
            <Text variant="caption">{tasksByStatus.done} Done</Text>
          </Box>
        </HStack>
      </CardBody>
      {(onEdit !== undefined || onDelete !== undefined) && (
        <CardFooter>
          <HStack spacing="sm">
            {onEdit !== undefined && (
              <Button size="sm" variant="secondary" onClick={handleEdit}>
                Edit
              </Button>
            )}
            {onDelete !== undefined && (
              <Button size="sm" variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </HStack>
        </CardFooter>
      )}
    </Card>
  );
}

export default SprintCard;
