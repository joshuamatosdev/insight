import type { CSSProperties } from 'react';
import type { SprintBoardProps, SprintTaskCardProps } from './Portal.types';
import type { SprintTask, SprintTaskStatus } from '../../../types/portal';
import { Text, Badge, Button } from '../../primitives';
import { Card, CardBody, Flex, Stack, Box, Grid } from '../../layout';

const COLUMN_CONFIG: Array<{ status: SprintTaskStatus; label: string; color: string }> = [
  { status: 'TODO', label: 'To Do', color: 'var(--color-gray-400)' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'var(--color-info)' },
  { status: 'IN_REVIEW', label: 'In Review', color: 'var(--color-warning)' },
  { status: 'DONE', label: 'Done', color: 'var(--color-success)' },
];

/**
 * Task card for the sprint board.
 */
function SprintTaskCard({
  task,
  isDragging = false,
  onClick,
  className,
  style,
}: SprintTaskCardProps): React.ReactElement {
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'CRITICAL':
        return 'var(--color-danger)';
      case 'HIGH':
        return 'var(--color-warning)';
      case 'MEDIUM':
        return 'var(--color-info)';
      case 'LOW':
        return 'var(--color-gray-400)';
      default:
        return 'var(--color-gray-400)';
    }
  };

  const getPriorityVariant = (
    priority: string
  ): 'danger' | 'warning' | 'info' | 'secondary' => {
    switch (priority) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const cardStyles: CSSProperties = {
    cursor: 'pointer',
    opacity: isDragging ? 0.7 : 1,
    transform: isDragging ? 'rotate(3deg)' : 'none',
    borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
    ...style,
  };

  const handleClick = () => {
    if (onClick !== undefined) {
      onClick(task);
    }
  };

  return (
    <Card
      variant="outlined"
      className={className}
      style={cardStyles}
      onClick={handleClick}
      aria-label={`Task: ${task.title}`}
    >
      <CardBody padding="sm">
        <Stack spacing="var(--spacing-2)">
          <Text variant="bodySmall" weight="medium">
            {task.title}
          </Text>
          {task.description !== null && task.description !== '' && (
            <Text variant="caption" color="muted" style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {task.description}
            </Text>
          )}
          <Flex justify="space-between" align="center">
            <Badge variant={getPriorityVariant(task.priority)} size="sm">
              {task.priority}
            </Badge>
            {task.assigneeName !== null && (
              <Box
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={task.assigneeName}
              >
                <Text variant="caption" weight="semibold" className="text-primary">
                  {task.assigneeName.charAt(0).toUpperCase()}
                </Text>
              </Box>
            )}
          </Flex>
          {task.estimatedHours !== null && (
            <Text variant="caption" color="muted">
              Est: {task.estimatedHours}h
              {task.actualHours !== null && ` / Actual: ${task.actualHours}h`}
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

/**
 * Kanban-style sprint board for managing tasks.
 */
export function SprintBoard({
  sprint,
  onTaskMove,
  onTaskClick,
  onTaskCreate,
  className,
  style,
}: SprintBoardProps): React.ReactElement {
  const getTasksForColumn = (status: SprintTaskStatus): SprintTask[] => {
    return sprint.tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (e: React.DragEvent, task: SprintTask) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('currentStatus', task.status);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: SprintTaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const tasksInColumn = getTasksForColumn(targetStatus);
    const newOrder = tasksInColumn.length;

    if (onTaskMove !== undefined && taskId !== '') {
      onTaskMove(taskId, targetStatus, newOrder);
    }
  };

  const handleAddTask = (status: SprintTaskStatus) => {
    if (onTaskCreate !== undefined) {
      onTaskCreate(status);
    }
  };

  const boardStyles: CSSProperties = {
    minHeight: '400px',
    ...style,
  };

  return (
    <Box className={className} style={boardStyles}>
      {/* Sprint Header */}
      <Flex justify="space-between" align="center" className="mb-4">
        <Stack spacing="0">
          <Text variant="heading4">{sprint.name}</Text>
          {sprint.goal !== null && (
            <Text variant="bodySmall" color="muted">
              {sprint.goal}
            </Text>
          )}
        </Stack>
        <Badge
          variant={sprint.status === 'ACTIVE' ? 'primary' : 'secondary'}
          size="md"
        >
          {sprint.status}
        </Badge>
      </Flex>

      {/* Kanban Columns */}
      <Grid columns={4} gap="md">
        {COLUMN_CONFIG.map((column) => {
          const tasks = getTasksForColumn(column.status);
          return (
            <Box
              key={column.status}
              style={{
                backgroundColor: 'var(--color-gray-50)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-3)',
                minHeight: '300px',
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column Header */}
              <Flex
                justify="space-between"
                align="center"
                className="mb-3"
              >
                <Flex align="center" gap="sm">
                  <Box
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: column.color,
                    }}
                  />
                  <Text variant="bodySmall" weight="semibold">
                    {column.label}
                  </Text>
                </Flex>
                <Badge variant="secondary" size="sm">
                  {tasks.length}
                </Badge>
              </Flex>

              {/* Tasks */}
              <Stack spacing="var(--spacing-2)">
                {tasks.map((task) => (
                  <Box
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                  >
                    <SprintTaskCard
                      task={task}
                      onClick={onTaskClick}
                    />
                  </Box>
                ))}

                {/* Add Task Button */}
                {onTaskCreate !== undefined && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddTask(column.status)}
                    style={{ width: '100%' }}
                  >
                    + Add Task
                  </Button>
                )}
              </Stack>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
}

export default SprintBoard;
