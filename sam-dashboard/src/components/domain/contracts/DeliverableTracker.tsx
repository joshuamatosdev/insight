import { useMemo, CSSProperties } from 'react';
import { Text, Badge } from '../../catalyst/primitives';
import { Box, Stack, HStack, Grid, Card, CardBody } from '../../catalyst/layout';
import { DeliverableCard } from './DeliverableCard';
import type { DeliverableTrackerProps, ContractDeliverable } from './Contract.types';

interface DeliverableStats {
  total: number;
  pending: number;
  inProgress: number;
  submitted: number;
  accepted: number;
  overdue: number;
  dueSoon: number;
}

function calculateStats(deliverables: ContractDeliverable[]): DeliverableStats {
  return {
    total: deliverables.length,
    pending: deliverables.filter((d) => d.status === 'PENDING').length,
    inProgress: deliverables.filter((d) => d.status === 'IN_PROGRESS').length,
    submitted: deliverables.filter(
      (d) => d.status === 'SUBMITTED' || d.status === 'UNDER_REVIEW'
    ).length,
    accepted: deliverables.filter((d) => d.status === 'ACCEPTED').length,
    overdue: deliverables.filter((d) => d.isOverdue === true).length,
    dueSoon: deliverables.filter(
      (d) => d.isDueSoon === true && d.isOverdue === false
    ).length,
  };
}

export function DeliverableTracker({
  deliverables,
  onStatusChange,
  className,
  style,
}: DeliverableTrackerProps) {
  const stats = useMemo(() => calculateStats(deliverables), [deliverables]);

  const overdueDeliverables = useMemo(
    () => deliverables.filter((d) => d.isOverdue === true),
    [deliverables]
  );

  const upcomingDeliverables = useMemo(
    () =>
      deliverables
        .filter(
          (d) =>
            d.isOverdue === false &&
            d.status !== 'ACCEPTED' &&
            d.status !== 'WAIVED' &&
            d.dueDate !== null
        )
        .sort((a, b) => {
          if (a.dueDate === null || b.dueDate === null) {
            return 0;
          }
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }),
    [deliverables]
  );

  const completedDeliverables = useMemo(
    () =>
      deliverables.filter(
        (d) => d.status === 'ACCEPTED' || d.status === 'WAIVED'
      ),
    [deliverables]
  );

  const trackerStyles: CSSProperties = {
    ...style,
  };

  if (deliverables.length === 0) {
    return (
      <Box
        className={className}
        style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fafafa',
          borderRadius: '0.5rem',
          ...trackerStyles,
        }}
      >
        <Text variant="body" color="muted">
          No deliverables defined for this contract
        </Text>
      </Box>
    );
  }

  return (
    <Stack spacing="lg" className={className} style={trackerStyles}>
      <Card>
        <CardBody>
          <Grid columns={6} gap="md">
            <Box style={{ textAlign: 'center' }}>
              <Text variant="heading3" weight="semibold">
                {stats.total}
              </Text>
              <Text variant="caption" color="muted">
                Total
              </Text>
            </Box>
            <Box style={{ textAlign: 'center' }}>
              <Text variant="heading3" weight="semibold" color="danger">
                {stats.overdue}
              </Text>
              <Text variant="caption" color="muted">
                Overdue
              </Text>
            </Box>
            <Box style={{ textAlign: 'center' }}>
              <Text variant="heading3" weight="semibold" color="warning">
                {stats.dueSoon}
              </Text>
              <Text variant="caption" color="muted">
                Due Soon
              </Text>
            </Box>
            <Box style={{ textAlign: 'center' }}>
              <Text variant="heading3" weight="semibold">
                {stats.pending + stats.inProgress}
              </Text>
              <Text variant="caption" color="muted">
                In Progress
              </Text>
            </Box>
            <Box style={{ textAlign: 'center' }}>
              <Text variant="heading3" weight="semibold">
                {stats.submitted}
              </Text>
              <Text variant="caption" color="muted">
                Submitted
              </Text>
            </Box>
            <Box style={{ textAlign: 'center' }}>
              <Text variant="heading3" weight="semibold" color="success">
                {stats.accepted}
              </Text>
              <Text variant="caption" color="muted">
                Accepted
              </Text>
            </Box>
          </Grid>
        </CardBody>
      </Card>

      {overdueDeliverables.length > 0 && (
        <Box>
          <HStack spacing="sm" align="center" className="mb-3">
            <Text variant="heading5">Overdue</Text>
            <Badge variant="danger" size="sm">
              {overdueDeliverables.length}
            </Badge>
          </HStack>
          <Stack spacing="0">
            {overdueDeliverables.map((deliverable) => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                onStatusChange={onStatusChange}
              />
            ))}
          </Stack>
        </Box>
      )}

      {upcomingDeliverables.length > 0 && (
        <Box>
          <HStack spacing="sm" align="center" className="mb-3">
            <Text variant="heading5">Upcoming</Text>
            <Badge variant="info" size="sm">
              {upcomingDeliverables.length}
            </Badge>
          </HStack>
          <Stack spacing="0">
            {upcomingDeliverables.map((deliverable) => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                onStatusChange={onStatusChange}
              />
            ))}
          </Stack>
        </Box>
      )}

      {completedDeliverables.length > 0 && (
        <Box>
          <HStack spacing="sm" align="center" className="mb-3">
            <Text variant="heading5">Completed</Text>
            <Badge variant="success" size="sm">
              {completedDeliverables.length}
            </Badge>
          </HStack>
          <Stack spacing="0">
            {completedDeliverables.map((deliverable) => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                onStatusChange={onStatusChange}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

export default DeliverableTracker;
