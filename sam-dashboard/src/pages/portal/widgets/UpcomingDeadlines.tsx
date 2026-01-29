import {useEffect, useState} from 'react';
import {Box, Card, CardBody, Flex, Stack} from '../../../components/catalyst/layout';
import {Button, Text} from '../../../components/catalyst/primitives';
import {get} from '../../../services/apiClient';

interface Deadline {
    id: string;
    title: string;
    type: 'DELIVERABLE' | 'INVOICE' | 'MILESTONE' | 'COMPLIANCE' | 'MEETING' | 'REVIEW';
    contractNumber: string;
    contractId: string | null;
    dueDate: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: string;
}

/**
 * Widget showing upcoming deadlines across all contracts.
 */
export function UpcomingDeadlines(): React.ReactElement {
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDeadlines = async () => {
            setLoading(true);
            setError(null);
            const result = await get<Deadline[]>('/portal/deadlines/upcoming', {params: {daysAhead: 30}});
            if (result.success) {
                setDeadlines(result.data);
            } else {
                setError(result.error.message);
                setDeadlines([]);
            }
            setLoading(false);
        };
        loadDeadlines();
    }, []);

    const getTypeIcon = (type: Deadline['type']): string => {
        switch (type) {
            case 'DELIVERABLE':
                return '📦';
            case 'INVOICE':
                return '💰';
            case 'MILESTONE':
                return '🎯';
            case 'COMPLIANCE':
                return '📋';
            case 'MEETING':
                return '👥';
            case 'REVIEW':
                return '🔍';
            default:
                return '📌';
        }
    };

    const getPriorityColor = (priority: Deadline['priority']): string => {
        switch (priority) {
            case 'LOW':
                return '#71717a';
            case 'MEDIUM':
                return '#f59e0b';
            case 'HIGH':
                return '#ef4444';
            case 'CRITICAL':
                return '#dc2626';
            default:
                return '#71717a';
        }
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getDaysUntil = (dateStr: string): number => {
        const due = new Date(dateStr);
        const now = new Date();
        const diff = due.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <Card variant="bordered">
            <CardBody padding="md">
                <Stack spacing="md">
                    <Flex justify="space-between" align="center">
                        <Text variant="heading5">Upcoming Deadlines</Text>
                        <Button variant="ghost" size="sm">View Calendar</Button>
                    </Flex>

                    {loading === true ? (
                        <Text variant="caption" color="muted">Loading deadlines...</Text>
                    ) : error !== null ? (
                        <Text variant="caption" color="error">{error}</Text>
                    ) : deadlines.length === 0 ? (
                        <Text variant="caption" color="muted">No upcoming deadlines in the next 30 days.</Text>
                    ) : (
                        <Stack spacing="sm">
                            {deadlines.map((deadline) => {
                                const daysUntil = getDaysUntil(deadline.dueDate);

                                return (
                                    <Flex
                                        key={deadline.id}
                                        align="center"
                                        gap="sm"
                                    >
                                        {/* Icon */}
                                        <Box>
                                            {getTypeIcon(deadline.type)}
                                        </Box>

                                        {/* Details */}
                                        <Stack spacing="0">
                                            <Flex align="center" gap="sm">
                                                <Text variant="body" weight="semibold">{deadline.title}</Text>
                                                <Box
                                                    style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        backgroundColor: getPriorityColor(deadline.priority),
                                                    }}
                                                />
                                            </Flex>
                                            <Text variant="caption" color="muted">{deadline.contractNumber}</Text>
                                        </Stack>

                                        {/* Date */}
                                        <Stack spacing="0">
                                            <Text
                                                variant="caption"
                                                weight="semibold"
                                            >
                                                {daysUntil <= 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                            </Text>
                                            <Text variant="caption" color="muted">{formatDate(deadline.dueDate)}</Text>
                                        </Stack>
                                    </Flex>
                                );
                            })}
                        </Stack>
                    )}
                </Stack>
            </CardBody>
        </Card>
    );
}

export default UpcomingDeadlines;
