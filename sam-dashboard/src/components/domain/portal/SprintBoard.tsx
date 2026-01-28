import type {CSSProperties} from 'react';

import type {SprintBoardProps, SprintTaskCardProps} from './Portal.types';
import type {SprintTask, SprintTaskStatus} from '../../../types/portal';
import {Badge, Button, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, Flex, Grid, Stack} from '../../catalyst/layout';

type ColumnStatusConfig = {
    status: SprintTaskStatus;
    label: string;
    dotClass: string;
};

const COLUMN_CONFIG: ColumnStatusConfig[] = [
    {status: 'TODO', label: 'To Do', dotClass: 'bg-zinc-400'},
    {status: 'IN_PROGRESS', label: 'In Progress', dotClass: 'bg-sky-500'},
    {status: 'IN_REVIEW', label: 'In Review', dotClass: 'bg-amber-500'},
    {status: 'DONE', label: 'Done', dotClass: 'bg-emerald-500'},
];

type PriorityBorderClass = 'border-l-red-500' | 'border-l-amber-500' | 'border-l-sky-500' | 'border-l-zinc-400';

const getPriorityBorderClass = (priority: string): PriorityBorderClass => {
    switch (priority) {
        case 'CRITICAL':
            return 'border-l-red-500';
        case 'HIGH':
            return 'border-l-amber-500';
        case 'MEDIUM':
            return 'border-l-sky-500';
        case 'LOW':
        default:
            return 'border-l-zinc-400';
    }
};

/**
 * Task card for the sprint board.
 */
function SprintTaskCard({
                            task,
                            isDragging = false,
                            onClick,
                            style,
                        }: SprintTaskCardProps): React.ReactElement {
    const getPriorityBadgeColor = (
        priority: string
    ): 'red' | 'amber' | 'cyan' | 'zinc' => {
        switch (priority) {
            case 'CRITICAL':
                return 'red';
            case 'HIGH':
                return 'amber';
            case 'MEDIUM':
                return 'cyan';
            default:
                return 'zinc';
        }
    };

    const cardStyles: CSSProperties = {
        cursor: 'pointer',
        opacity: isDragging ? 0.7 : 1,
        transform: isDragging ? 'rotate(3deg)' : 'none',
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
            style={cardStyles}
            onClick={handleClick}
            aria-label={`Task: ${task.title}`}
        >
            <CardBody padding="sm">
                <Stack spacing="sm">
                    <Text variant="bodySmall" weight="medium">
                        {task.title}
                    </Text>
                    {task.description !== null && task.description !== '' && (
                        <Text variant="caption" color="muted">
                            {task.description}
                        </Text>
                    )}
                    <Flex justify="space-between" align="center">
                        <Badge color={getPriorityBadgeColor(task.priority)}>
                            {task.priority}
                        </Badge>
                        {task.assigneeName !== null && (
                            <Box
                                title={task.assigneeName}
                            >
                                <Text variant="caption" weight="semibold">
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
        <Box style={boardStyles}>
            {/* Sprint Header */}
            <Flex justify="space-between" align="center">
                <Stack spacing="0">
                    <Text variant="heading4">{sprint.name}</Text>
                    {sprint.goal !== null && (
                        <Text variant="bodySmall" color="muted">
                            {sprint.goal}
                        </Text>
                    )}
                </Stack>
                <Badge
                    color={sprint.status === 'ACTIVE' ? 'blue' : 'zinc'}
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
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.status)}
                        >
                            {/* Column Header */}
                            <Flex
                                justify="space-between"
                                align="center"
                            >
                                <Flex align="center" gap="sm">
                                    <Box
                                    />
                                    <Text variant="bodySmall" weight="semibold">
                                        {column.label}
                                    </Text>
                                </Flex>
                                <Badge color="zinc">
                                    {tasks.length}
                                </Badge>
                            </Flex>

                            {/* Tasks */}
                            <Stack spacing="sm">
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
