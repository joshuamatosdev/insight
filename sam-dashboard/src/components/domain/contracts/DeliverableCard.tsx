import {Badge, Select, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, CardHeader, Grid, HStack, Stack} from '../../catalyst/layout';
import type {DeliverableCardProps, DeliverableFrequency, DeliverableStatus, DeliverableType,} from './Contract.types';
import {formatDate, getDeliverableStatusLabel} from './Contract.types';

type BadgeColor = 'zinc' | 'cyan' | 'blue' | 'amber' | 'red' | 'green';

function getStatusColor(status: DeliverableStatus): BadgeColor {
    const colorMap: Record<DeliverableStatus, BadgeColor> = {
        PENDING: 'zinc',
        IN_PROGRESS: 'cyan',
        SUBMITTED: 'blue',
        UNDER_REVIEW: 'amber',
        REVISION_REQUIRED: 'red',
        ACCEPTED: 'green',
        REJECTED: 'red',
        WAIVED: 'zinc',
    };
    return colorMap[status];
}

function getDeliverableTypeLabel(type: DeliverableType): string {
    const labels: Record<DeliverableType, string> = {
        REPORT: 'Report',
        DATA: 'Data',
        SOFTWARE: 'Software',
        DOCUMENTATION: 'Documentation',
        HARDWARE: 'Hardware',
        SERVICES: 'Services',
        MILESTONE: 'Milestone',
        STATUS_REPORT: 'Status Report',
        FINANCIAL_REPORT: 'Financial Report',
        TECHNICAL_REPORT: 'Technical Report',
        OTHER: 'Other',
    };
    return labels[type];
}

function getFrequencyLabel(frequency: DeliverableFrequency | null): string {
    if (frequency === null) {
        return 'One-time';
    }
    const labels: Record<DeliverableFrequency, string> = {
        ONE_TIME: 'One-time',
        DAILY: 'Daily',
        WEEKLY: 'Weekly',
        BI_WEEKLY: 'Bi-weekly',
        MONTHLY: 'Monthly',
        QUARTERLY: 'Quarterly',
        SEMI_ANNUALLY: 'Semi-annually',
        ANNUALLY: 'Annually',
        AS_REQUIRED: 'As Required',
    };
    return labels[frequency];
}

const STATUS_OPTIONS: DeliverableStatus[] = [
    'PENDING',
    'IN_PROGRESS',
    'SUBMITTED',
    'UNDER_REVIEW',
    'REVISION_REQUIRED',
    'ACCEPTED',
    'REJECTED',
    'WAIVED',
];

export function DeliverableCard({
                                    deliverable,
                                    onStatusChange,
                                }: DeliverableCardProps) {
    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (onStatusChange !== undefined) {
            onStatusChange(deliverable.id, event.target.value as DeliverableStatus);
        }
    };

    return (
        <Card>
            <CardHeader>
                <HStack justify="between" align="start">
                    <Box>
                        <HStack spacing="sm" align="center">
                            {deliverable.cdrlNumber !== null && (
                                <Text variant="bodySmall" color="muted">
                                    {deliverable.cdrlNumber}
                                </Text>
                            )}
                            <Text variant="heading5">{deliverable.title}</Text>
                        </HStack>
                    </Box>
                    <HStack spacing="sm">
                        <Badge color="cyan">
                            {getDeliverableTypeLabel(deliverable.deliverableType)}
                        </Badge>
                        <Badge color={getStatusColor(deliverable.status)}>
                            {getDeliverableStatusLabel(deliverable.status)}
                        </Badge>
                        {deliverable.isOverdue === true && (
                            <Badge color="red">
                                Overdue
                            </Badge>
                        )}
                        {deliverable.isDueSoon === true && deliverable.isOverdue === false && (
                            <Badge color="amber">
                                Due Soon
                            </Badge>
                        )}
                    </HStack>
                </HStack>
            </CardHeader>
            <CardBody>
                <Grid columns={4} gap="md">
                    <Stack spacing="xs">
                        <Text variant="caption" color="muted">
                            Due Date
                        </Text>
                        <Text
                            variant="body"
                            weight="semibold"
                            color={
                                deliverable.isOverdue === true
                                    ? 'danger'
                                    : deliverable.isDueSoon === true
                                        ? 'warning'
                                        : undefined
                            }
                        >
                            {formatDate(deliverable.dueDate)}
                        </Text>
                    </Stack>
                    <Stack spacing="xs">
                        <Text variant="caption" color="muted">
                            Frequency
                        </Text>
                        <Text variant="body">{getFrequencyLabel(deliverable.frequency)}</Text>
                    </Stack>
                    <Stack spacing="xs">
                        <Text variant="caption" color="muted">
                            CLIN
                        </Text>
                        <Text variant="body">{deliverable.clinNumber ?? 'N/A'}</Text>
                    </Stack>
                    <Stack spacing="xs">
                        <Text variant="caption" color="muted">
                            Owner
                        </Text>
                        <Text variant="body">{deliverable.ownerName ?? 'Unassigned'}</Text>
                    </Stack>
                </Grid>

                {deliverable.description !== null && (
                    <Box>
                        <Text variant="bodySmall" color="muted">
                            {deliverable.description}
                        </Text>
                    </Box>
                )}

                {(deliverable.submittedDate !== null || deliverable.acceptedDate !== null) && (
                    <Box>
                        <Grid columns={2} gap="md">
                            {deliverable.submittedDate !== null && (
                                <Stack spacing="xs">
                                    <Text variant="caption" color="muted">
                                        Submitted
                                    </Text>
                                    <Text variant="bodySmall">
                                        {formatDate(deliverable.submittedDate)}
                                    </Text>
                                </Stack>
                            )}
                            {deliverable.acceptedDate !== null && (
                                <Stack spacing="xs">
                                    <Text variant="caption" color="muted">
                                        Accepted
                                    </Text>
                                    <Text variant="bodySmall">
                                        {formatDate(deliverable.acceptedDate)}
                                    </Text>
                                </Stack>
                            )}
                        </Grid>
                    </Box>
                )}

                {onStatusChange !== undefined && (
                    <Box>
                        <HStack spacing="md" align="center">
                            <Text variant="bodySmall" weight="semibold">
                                Update Status:
                            </Text>
                            <Select
                                value={deliverable.status}
                                onChange={handleStatusChange}
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                        {getDeliverableStatusLabel(status)}
                                    </option>
                                ))}
                            </Select>
                        </HStack>
                    </Box>
                )}
            </CardBody>
        </Card>
    );
}

export default DeliverableCard;
