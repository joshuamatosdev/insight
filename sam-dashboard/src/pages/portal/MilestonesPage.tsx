import {useEffect, useState} from 'react';
import {Button, Select, Text} from '../../components/catalyst/primitives';
import {Box, Card, CardBody, CardHeader, Flex, Grid, Stack} from '../../components/catalyst/layout';
import {MilestoneCard, MilestoneTimeline} from '../../components/domain/portal';
import {useMilestones} from '../../hooks';
import type {Milestone, MilestoneStatus} from '../../types/portal';

type ViewMode = 'timeline' | 'cards' | 'calendar';

/**
 * Milestones page with timeline and card views.
 */
export function MilestonesPage(): React.ReactElement {
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');
    const [statusFilter, setStatusFilter] = useState<MilestoneStatus | 'ALL'>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

    const {
        milestones,
        timeline,
        isLoading,
        error,
        refresh,
        loadTimeline,
        createMilestone,
        updateMilestone,
        deleteMilestone,
    } = useMilestones();

    // Load timeline when we have milestones
    useEffect(() => {
        if (milestones.length > 0) {
            const contractId = milestones.at(0)?.contractId;
            if (contractId !== undefined) {
                loadTimeline(contractId);
            }
        }
    }, [milestones, loadTimeline]);

    const handleMilestoneClick = (milestone: Milestone) => {
        setSelectedMilestone(milestone);
    };

    // Filter milestones
    const filteredMilestones = milestones.filter((m) => {
        if (statusFilter !== 'ALL' && m.status !== statusFilter) {
            return false;
        }
        return true;
    });

    // Calculate stats
    const stats = {
        total: milestones.length,
        completed: milestones.filter((m) => m.status === 'COMPLETED').length,
        inProgress: milestones.filter((m) => m.status === 'IN_PROGRESS').length,
        delayed: milestones.filter((m) => m.status === 'DELAYED').length,
        atRisk: milestones.filter((m) => m.status === 'AT_RISK').length,
        upcoming: milestones.filter((m) => {
            const planned = new Date(m.plannedDate);
            const now = new Date();
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return m.status !== 'COMPLETED' && planned <= weekFromNow && planned >= now;
        }).length,
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center">
                <Text variant="body" color="muted">
                    Loading milestones...
                </Text>
            </Flex>
        );
    }

    if (error !== null) {
        return (
            <Box>
                <Text variant="body" color="danger">
                    Error loading milestones: {error.message}
                </Text>
                <Button variant="secondary" onClick={refresh}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Stack spacing="lg">
            {/* Header */}
            <Flex justify="space-between" align="center">
                <Stack spacing="0">
                    <Text variant="heading2">Milestones</Text>
                    <Text variant="body" color="muted">
                        Track project milestones and deliverables
                    </Text>
                </Stack>
                <Flex gap="sm">
                    <Button variant="secondary" onClick={refresh}>
                        Refresh
                    </Button>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        Add Milestone
                    </Button>
                </Flex>
            </Flex>

            {/* Stats */}
            <Grid columns={6} gap="md">
                <Card variant="outlined">
                    <CardBody padding="md">
                        <Stack spacing="0">
                            <Text variant="caption" color="muted">
                                Total
                            </Text>
                            <Text variant="heading3">{stats.total}</Text>
                        </Stack>
                    </CardBody>
                </Card>
                <Card variant="outlined">
                    <CardBody padding="md">
                        <Stack spacing="0">
                            <Text variant="caption" color="muted">
                                Completed
                            </Text>
                            <Text variant="heading3" color="success">
                                {stats.completed}
                            </Text>
                        </Stack>
                    </CardBody>
                </Card>
                <Card variant="outlined">
                    <CardBody padding="md">
                        <Stack spacing="0">
                            <Text variant="caption" color="muted">
                                In Progress
                            </Text>
                            <Text variant="heading3">
                                {stats.inProgress}
                            </Text>
                        </Stack>
                    </CardBody>
                </Card>
                <Card variant="outlined">
                    <CardBody padding="md">
                        <Stack spacing="0">
                            <Text variant="caption" color="muted">
                                Delayed
                            </Text>
                            <Text variant="heading3" color="danger">
                                {stats.delayed}
                            </Text>
                        </Stack>
                    </CardBody>
                </Card>
                <Card variant="outlined">
                    <CardBody padding="md">
                        <Stack spacing="0">
                            <Text variant="caption" color="muted">
                                At Risk
                            </Text>
                            <Text variant="heading3" color="warning">
                                {stats.atRisk}
                            </Text>
                        </Stack>
                    </CardBody>
                </Card>
                <Card variant="outlined">
                    <CardBody padding="md">
                        <Stack spacing="0">
                            <Text variant="caption" color="muted">
                                Due This Week
                            </Text>
                            <Text variant="heading3">{stats.upcoming}</Text>
                        </Stack>
                    </CardBody>
                </Card>
            </Grid>

            {/* View Controls */}
            <Card>
                <CardBody>
                    <Flex justify="space-between" align="center">
                        {/* View Mode */}
                        <Flex align="center" gap="sm">
                            <Text variant="bodySmall" color="muted">
                                View:
                            </Text>
                            <Flex gap="xs">
                                {(['timeline', 'cards'] as ViewMode[]).map((mode) => (
                                    <Button
                                        key={mode}
                                        size="sm"
                                        variant={viewMode === mode ? 'primary' : 'secondary'}
                                        onClick={() => setViewMode(mode)}
                                    >
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </Button>
                                ))}
                            </Flex>
                        </Flex>

                        {/* Status Filter */}
                        <Flex align="center" gap="sm">
                            <Text as="label" htmlFor="milestone-status-filter" variant="bodySmall" color="muted">
                                Status:
                            </Text>
                            <Select
                                id="milestone-status-filter"
                                name="milestone-status-filter"
                                value={statusFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setStatusFilter(e.target.value as MilestoneStatus | 'ALL')
                                }
                                options={[
                                    {value: 'ALL', label: 'All Statuses'},
                                    {value: 'NOT_STARTED', label: 'Not Started'},
                                    {value: 'IN_PROGRESS', label: 'In Progress'},
                                    {value: 'COMPLETED', label: 'Completed'},
                                    {value: 'DELAYED', label: 'Delayed'},
                                    {value: 'AT_RISK', label: 'At Risk'},
                                ]}
                            />
                        </Flex>
                    </Flex>
                </CardBody>
            </Card>

            {/* Content */}
            {filteredMilestones.length === 0 ? (
                <Flex
                    justify="center"
                    align="center"
                    direction="column"
                >
                    <Text variant="heading4" color="muted">
                        No milestones found
                    </Text>
                    <Text variant="body" color="muted">
                        {statusFilter !== 'ALL'
                            ? 'Try changing the status filter'
                            : 'Add your first milestone to get started'}
                    </Text>
                </Flex>
            ) : viewMode === 'timeline' ? (
                <Card>
                    <CardBody>
                        <MilestoneTimeline
                            milestones={filteredMilestones}
                            onMilestoneClick={handleMilestoneClick}
                            showCriticalPath={timeline !== null}
                            criticalPath={timeline?.criticalPath ?? []}
                        />
                    </CardBody>
                </Card>
            ) : (
                <Grid columns={2} gap="md">
                    {filteredMilestones
                        .sort(
                            (a, b) =>
                                new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
                        )
                        .map((milestone) => (
                            <MilestoneCard
                                key={milestone.id}
                                milestone={milestone}
                                onClick={handleMilestoneClick}
                                showDeliverables
                            />
                        ))}
                </Grid>
            )}

            {/* Selected Milestone Detail (could be a modal) */}
            {selectedMilestone !== null && (
                <Card>
                    <CardHeader>
                        <Flex justify="space-between" align="center">
                            <Text variant="heading4">Milestone Details</Text>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedMilestone(null)}
                            >
                                Close
                            </Button>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        <MilestoneCard
                            milestone={selectedMilestone}
                            showDeliverables
                            onEdit={() => console.log('Edit milestone')}
                            onDelete={() => console.log('Delete milestone')}
                        />
                    </CardBody>
                </Card>
            )}
        </Stack>
    );
}

export default MilestonesPage;
