import { useState } from 'react';
import { Text, Button, Badge } from '../../components/primitives';
import { Flex, Stack, Grid, Box, Card, CardBody } from '../../components/layout';
import { SprintBoard, SprintCard } from '../../components/domain/portal';
import { useSprints, useSprint } from '../../hooks';
import type { Sprint, SprintTaskStatus, CreateSprintRequest } from '../../types/portal';

/**
 * Sprint tracking page with kanban board view.
 */
export function SprintTrackingPage(): React.ReactElement {
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    sprints,
    isLoading,
    error,
    refresh,
    createSprint,
    updateSprint,
    deleteSprint,
  } = useSprints();

  const {
    sprint: selectedSprint,
    isLoading: sprintLoading,
    moveTask,
    createTask,
  } = useSprint(selectedSprintId);

  const handleSprintSelect = (sprint: Sprint) => {
    setSelectedSprintId(sprint.id);
  };

  const handleTaskMove = async (
    taskId: string,
    newStatus: SprintTaskStatus,
    newOrder: number
  ) => {
    try {
      await moveTask(taskId, newStatus, newOrder);
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  const handleTaskCreate = async (status: SprintTaskStatus) => {
    if (selectedSprintId === null) {
      return;
    }
    try {
      await createTask({
        sprintId: selectedSprintId,
        title: 'New Task',
        status,
        priority: 'MEDIUM',
      });
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const activeSprints = sprints.filter((s) => s.status === 'ACTIVE');
  const planningSprints = sprints.filter((s) => s.status === 'PLANNING');
  const completedSprints = sprints.filter((s) => s.status === 'COMPLETED');

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
        <Text variant="body" color="muted">
          Loading sprints...
        </Text>
      </Flex>
    );
  }

  if (error !== null) {
    return (
      <Box
        style={{
          padding: 'var(--spacing-8)',
          textAlign: 'center',
          backgroundColor: 'var(--color-danger-light)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <Text variant="body" color="danger">
          Error loading sprints: {error.message}
        </Text>
        <Button variant="secondary" onClick={refresh} className="mt-3">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing="var(--spacing-6)" className="p-6">
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Stack spacing="0">
          <Text variant="heading2">Sprint Tracking</Text>
          <Text variant="body" color="muted">
            Manage agile sprints and track task progress
          </Text>
        </Stack>
        <Flex gap="sm">
          <Button variant="secondary" onClick={refresh}>
            Refresh
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            New Sprint
          </Button>
        </Flex>
      </Flex>

      {/* Main Content */}
      <Grid columns={4} gap="lg">
        {/* Sprint List Sidebar */}
        <Box>
          <Stack spacing="var(--spacing-4)">
            {/* Active Sprints */}
            <Box>
              <Flex align="center" gap="sm" className="mb-2">
                <Text variant="bodySmall" weight="semibold">
                  Active
                </Text>
                <Badge variant="primary" size="sm">
                  {activeSprints.length}
                </Badge>
              </Flex>
              <Stack spacing="var(--spacing-2)">
                {activeSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    isSelected={selectedSprintId === sprint.id}
                    onClick={handleSprintSelect}
                  />
                ))}
                {activeSprints.length === 0 && (
                  <Text variant="caption" color="muted">
                    No active sprints
                  </Text>
                )}
              </Stack>
            </Box>

            {/* Planning Sprints */}
            <Box>
              <Flex align="center" gap="sm" className="mb-2">
                <Text variant="bodySmall" weight="semibold">
                  Planning
                </Text>
                <Badge variant="warning" size="sm">
                  {planningSprints.length}
                </Badge>
              </Flex>
              <Stack spacing="var(--spacing-2)">
                {planningSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    isSelected={selectedSprintId === sprint.id}
                    onClick={handleSprintSelect}
                  />
                ))}
                {planningSprints.length === 0 && (
                  <Text variant="caption" color="muted">
                    No sprints in planning
                  </Text>
                )}
              </Stack>
            </Box>

            {/* Completed Sprints */}
            <Box>
              <Flex align="center" gap="sm" className="mb-2">
                <Text variant="bodySmall" weight="semibold">
                  Completed
                </Text>
                <Badge variant="success" size="sm">
                  {completedSprints.length}
                </Badge>
              </Flex>
              <Stack spacing="var(--spacing-2)">
                {completedSprints.slice(0, 3).map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    isSelected={selectedSprintId === sprint.id}
                    onClick={handleSprintSelect}
                  />
                ))}
                {completedSprints.length === 0 && (
                  <Text variant="caption" color="muted">
                    No completed sprints
                  </Text>
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Sprint Board (3 columns) */}
        <Box style={{ gridColumn: 'span 3' }}>
          {selectedSprint !== null ? (
            <Card>
              <CardBody>
                <SprintBoard
                  sprint={selectedSprint}
                  onTaskMove={handleTaskMove}
                  onTaskCreate={handleTaskCreate}
                />
              </CardBody>
            </Card>
          ) : (
            <Flex
              justify="center"
              align="center"
              direction="column"
              style={{
                minHeight: '400px',
                backgroundColor: 'var(--color-gray-50)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Text variant="heading4" color="muted">
                Select a Sprint
              </Text>
              <Text variant="body" color="muted">
                Choose a sprint from the sidebar to view its board
              </Text>
            </Flex>
          )}
        </Box>
      </Grid>
    </Stack>
  );
}

export default SprintTrackingPage;
