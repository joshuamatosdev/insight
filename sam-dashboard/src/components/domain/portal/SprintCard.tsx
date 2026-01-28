import type {CSSProperties} from 'react';

import type {SprintCardProps} from './Portal.types';
import {Badge, Button, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, CardFooter, CardHeader, Flex, HStack, Stack} from '../../catalyst/layout';

/**
 * Displays sprint information in a card format.
 */
export function SprintCard({
  sprint,
  isSelected = false,
  onClick,
  onEdit,
  onDelete,
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

  const getStatusColor = (
    status: string
  ): 'blue' | 'green' | 'amber' | 'zinc' | 'red' => {
    switch (status) {
      case 'ACTIVE':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'PLANNING':
        return 'amber';
      case 'CANCELLED':
        return 'red';
      default:
        return 'zinc';
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
          <Badge color={getStatusColor(sprint.status)}>
            {sprint.status}
          </Badge>
        </Flex>
      </CardHeader>
      <CardBody>
        {sprint.goal !== null && sprint.goal !== '' && (
          <Box>
            <Text variant="bodySmall" color="muted">
              {sprint.goal}
            </Text>
          </Box>
        )}

        {/* Progress Bar */}
        <Box>
          <Flex justify="space-between" align="center">
            <Text variant="caption" color="muted">
              Progress
            </Text>
            <Text variant="caption" weight="semibold">
              {completedPercentage}%
            </Text>
          </Flex>
          <Box>
            <Box
              style={{ width: `${completedPercentage}%` }}
            />
          </Box>
        </Box>

        {/* Task Summary */}
        <HStack spacing="sm">
          <Box>
            <Text variant="caption">{tasksByStatus.todo} Todo</Text>
          </Box>
          <Box>
            <Text variant="caption">{tasksByStatus.inProgress} In Progress</Text>
          </Box>
          <Box>
            <Text variant="caption">{tasksByStatus.inReview} Review</Text>
          </Box>
          <Box>
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
