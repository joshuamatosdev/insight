import {useEffect, useState} from 'react';
import {Box, Card, CardBody, Flex, Stack} from '../../../components/catalyst/layout';
import {Button, Text} from '../../../components/catalyst/primitives';

interface Deadline {
    id: string;
    title: string;
    type: 'deliverable' | 'invoice' | 'report' | 'meeting' | 'review';
    contractNumber: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
}

/**
 * Widget showing upcoming deadlines across all contracts.
 */
export function UpcomingDeadlines(): React.ReactElement {
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDeadlines = async () => {
            setLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 300));
            setDeadlines([
                {
                    id: '1',
                    title: 'Monthly Status Report',
                    type: 'report',
                    contractNumber: 'FA8773-24-C-0001',
                    dueDate: '2024-02-05',
                    priority: 'high',
                },
                {
                    id: '2',
                    title: 'Invoice Submission',
                    type: 'invoice',
                    contractNumber: 'GS-35F-0123X',
                    dueDate: '2024-02-10',
                    priority: 'medium',
                },
                {
                    id: '3',
                    title: 'Quarterly Program Review',
                    type: 'meeting',
                    contractNumber: 'W912DQ-23-D-0045',
                    dueDate: '2024-02-12',
                    priority: 'high',
                },
                {
                    id: '4',
                    title: 'Technical Documentation Update',
                    type: 'deliverable',
                    contractNumber: 'FA8773-24-C-0001',
                    dueDate: '2024-02-15',
                    priority: 'low',
                },
                {
                    id: '5',
                    title: 'Security Review Meeting',
                    type: 'review',
                    contractNumber: 'GS-35F-0123X',
                    dueDate: '2024-02-18',
                    priority: 'medium',
                },
            ]);
            setLoading(false);
        };
        loadDeadlines();
    }, []);

    const getTypeIcon = (type: Deadline['type']): string => {
        switch (type) {
            case 'deliverable':
                return '📦';
            case 'invoice':
                return '💰';
            case 'report':
                return '📊';
            case 'meeting':
                return '👥';
            case 'review':
                return '🔍';
        }
    };

    const getPriorityColor = (priority: Deadline['priority']): string => {
        switch (priority) {
            case 'low':
                return '#71717a';
            case 'medium':
                return '#f59e0b';
            case 'high':
                return '#ef4444';
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
