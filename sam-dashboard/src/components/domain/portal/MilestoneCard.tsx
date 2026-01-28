import type {CSSProperties} from 'react';
import type {MilestoneCardProps} from './Portal.types';
import {Badge, Button, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, CardFooter, CardHeader, Flex, HStack, Stack} from '../../catalyst/layout';

/**
 * Card displaying milestone information.
 */
export function MilestoneCard({
                                  milestone,
                                  onClick,
                                  onEdit,
                                  onDelete,
                                  showDeliverables = false,
                                  className,
                                  style,
                              }: MilestoneCardProps): React.ReactElement {
    const getStatusColor = (
        status: string
    ): 'blue' | 'green' | 'amber' | 'zinc' | 'red' | 'cyan' => {
        switch (status) {
            case 'NOT_STARTED':
                return 'zinc';
            case 'IN_PROGRESS':
                return 'blue';
            case 'COMPLETED':
                return 'green';
            case 'DELAYED':
                return 'red';
            case 'AT_RISK':
                return 'amber';
            case 'CANCELLED':
                return 'zinc';
            default:
                return 'zinc';
        }
    };

    const getTypeLabel = (type: string): string => {
        switch (type) {
            case 'DELIVERABLE':
                return 'Deliverable';
            case 'REVIEW':
                return 'Review';
            case 'APPROVAL':
                return 'Approval';
            case 'PAYMENT':
                return 'Payment';
            case 'PHASE_COMPLETION':
                return 'Phase Completion';
            case 'CONTRACT_START':
                return 'Contract Start';
            case 'CONTRACT_END':
                return 'Contract End';
            default:
                return type;
        }
    };

    const formatDate = (dateStr: string): string => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const isOverdue = (): boolean => {
        if (milestone.status === 'COMPLETED' || milestone.status === 'CANCELLED') {
            return false;
        }
        const plannedDate = new Date(milestone.plannedDate);
        return plannedDate < new Date();
    };

    const handleClick = () => {
        if (onClick !== undefined) {
            onClick(milestone);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit !== undefined) {
            onEdit(milestone);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete !== undefined) {
            onDelete(milestone);
        }
    };

    const cardStyles: CSSProperties = {
        cursor: onClick !== undefined ? 'pointer' : 'default',
        borderLeft: `4px solid ${
            milestone.status === 'COMPLETED'
                ? '#10b981'
                : milestone.status === 'DELAYED' || isOverdue()
                    ? '#ef4444'
                    : milestone.status === 'AT_RISK'
                        ? '#f59e0b'
                        : '#d4d4d8'
        }`,
        ...style,
    };

    return (
        <Card
            style={cardStyles}
            onClick={handleClick}
            aria-label={`Milestone: ${milestone.name}`}
        >
            <CardHeader>
                <Flex justify="space-between" align="flex-start">
                    <Stack spacing="xs">
                        <Text variant="heading5">{milestone.name}</Text>
                        <HStack spacing="sm">
                            <Badge color={getStatusColor(milestone.status)}>
                                {milestone.status.replace('_', ' ')}
                            </Badge>
                            <Badge color="zinc">
                                {getTypeLabel(milestone.type)}
                            </Badge>
                        </HStack>
                    </Stack>
                </Flex>
            </CardHeader>
            <CardBody>
                {milestone.description !== null && milestone.description !== '' && (
                    <Box>
                        <Text variant="body" color="muted">
                            {milestone.description}
                        </Text>
                    </Box>
                )}

                {/* Dates */}
                <HStack spacing="md">
                    <Stack spacing="0">
                        <Text variant="caption" color="muted">
                            Planned Date
                        </Text>
                        <Text
                            variant="bodySmall"
                            weight="medium"
                            color={isOverdue() ? 'danger' : undefined}
                        >
                            {formatDate(milestone.plannedDate)}
                        </Text>
                    </Stack>
                    {milestone.actualDate !== null && (
                        <Stack spacing="0">
                            <Text variant="caption" color="muted">
                                Actual Date
                            </Text>
                            <Text variant="bodySmall" weight="medium">
                                {formatDate(milestone.actualDate)}
                            </Text>
                        </Stack>
                    )}
                    {milestone.completedDate !== null && (
                        <Stack spacing="0">
                            <Text variant="caption" color="muted">
                                Completed
                            </Text>
                            <Text variant="bodySmall" weight="medium" color="success">
                                {formatDate(milestone.completedDate)}
                            </Text>
                        </Stack>
                    )}
                </HStack>

                {/* Progress Bar */}
                <Box>
                    <Flex justify="space-between" align="center">
                        <Text variant="caption" color="muted">
                            Progress
                        </Text>
                        <Text variant="caption" weight="semibold">
                            {milestone.percentComplete}%
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
                                width: `${milestone.percentComplete}%`,
                                backgroundColor:
                                    milestone.percentComplete === 100
                                        ? '#10b981'
                                        : '#2563eb',
                                borderRadius: '9999px',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </Box>
                </Box>

                {/* Assignee */}
                {milestone.assigneeName !== null && (
                    <Text variant="caption" color="muted">
                        Assigned to: {milestone.assigneeName}
                    </Text>
                )}

                {/* Deliverables */}
                {showDeliverables && milestone.deliverables.length > 0 && (
                    <Box>
                        <Text variant="caption" weight="medium">
                            Deliverables ({milestone.deliverables.length})
                        </Text>
                        <Stack spacing="sm">
                            {milestone.deliverables.map((deliverable) => (
                                <Flex
                                    key={deliverable.id}
                                    justify="space-between"
                                    align="center"
                                    style={{
                                        padding: '0.5rem',
                                        backgroundColor: '#fafafa',
                                        borderRadius: '0.25rem',
                                    }}
                                >
                                    <Text variant="bodySmall">{deliverable.name}</Text>
                                    <Badge
                                        color={
                                            deliverable.status === 'APPROVED'
                                                ? 'green'
                                                : deliverable.status === 'REJECTED'
                                                    ? 'red'
                                                    : deliverable.status === 'SUBMITTED'
                                                        ? 'amber'
                                                        : 'zinc'
                                        }
                                    >
                                        {deliverable.status}
                                    </Badge>
                                </Flex>
                            ))}
                        </Stack>
                    </Box>
                )}
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

export default MilestoneCard;
