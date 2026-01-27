import { CSSProperties } from 'react';
import { Text, Badge, Button, Select } from '../../primitives';
import { Card, CardHeader, CardBody, HStack, Grid, Box, Stack } from '../../layout';
import type {
  DeliverableCardProps,
  DeliverableStatus,
  DeliverableType,
  DeliverableFrequency,
} from './Contract.types';
import { getDeliverableStatusLabel, formatDate } from './Contract.types';
import type { BadgeVariant } from '../../primitives';

function getStatusVariant(status: DeliverableStatus): BadgeVariant {
  const variantMap: Record<DeliverableStatus, BadgeVariant> = {
    PENDING: 'secondary',
    IN_PROGRESS: 'info',
    SUBMITTED: 'primary',
    UNDER_REVIEW: 'warning',
    REVISION_REQUIRED: 'danger',
    ACCEPTED: 'success',
    REJECTED: 'danger',
    WAIVED: 'secondary',
  };
  return variantMap[status];
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
  className,
  style,
}: DeliverableCardProps) {
  const cardStyles: CSSProperties = {
    marginBottom: 'var(--spacing-3)',
    ...(deliverable.isOverdue === true && {
      borderLeft: '4px solid var(--color-danger)',
    }),
    ...(deliverable.isDueSoon === true &&
      deliverable.isOverdue === false && {
        borderLeft: '4px solid var(--color-warning)',
      }),
    ...style,
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onStatusChange !== undefined) {
      onStatusChange(deliverable.id, event.target.value as DeliverableStatus);
    }
  };

  return (
    <Card className={className} style={cardStyles}>
      <CardHeader>
        <HStack justify="between" align="start">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <HStack spacing="var(--spacing-2)" align="center">
              {deliverable.cdrlNumber !== null && (
                <Text variant="bodySmall" color="muted">
                  {deliverable.cdrlNumber}
                </Text>
              )}
              <Text variant="heading5">{deliverable.title}</Text>
            </HStack>
          </Box>
          <HStack spacing="var(--spacing-2)">
            <Badge variant="info" size="sm">
              {getDeliverableTypeLabel(deliverable.deliverableType)}
            </Badge>
            <Badge variant={getStatusVariant(deliverable.status)} size="sm">
              {getDeliverableStatusLabel(deliverable.status)}
            </Badge>
            {deliverable.isOverdue === true && (
              <Badge variant="danger" size="sm">
                Overdue
              </Badge>
            )}
            {deliverable.isDueSoon === true && deliverable.isOverdue === false && (
              <Badge variant="warning" size="sm">
                Due Soon
              </Badge>
            )}
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <Grid columns={4} gap="var(--spacing-4)">
          <Stack spacing="var(--spacing-1)">
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
          <Stack spacing="var(--spacing-1)">
            <Text variant="caption" color="muted">
              Frequency
            </Text>
            <Text variant="body">{getFrequencyLabel(deliverable.frequency)}</Text>
          </Stack>
          <Stack spacing="var(--spacing-1)">
            <Text variant="caption" color="muted">
              CLIN
            </Text>
            <Text variant="body">{deliverable.clinNumber ?? 'N/A'}</Text>
          </Stack>
          <Stack spacing="var(--spacing-1)">
            <Text variant="caption" color="muted">
              Owner
            </Text>
            <Text variant="body">{deliverable.ownerName ?? 'Unassigned'}</Text>
          </Stack>
        </Grid>

        {deliverable.description !== null && (
          <Box className="mt-3">
            <Text variant="bodySmall" color="muted">
              {deliverable.description}
            </Text>
          </Box>
        )}

        {(deliverable.submittedDate !== null || deliverable.acceptedDate !== null) && (
          <Box
            style={{
              marginTop: 'var(--spacing-3)',
              paddingTop: 'var(--spacing-3)',
              borderTop: '1px solid var(--color-gray-200)',
            }}
          >
            <Grid columns={2} gap="var(--spacing-4)">
              {deliverable.submittedDate !== null && (
                <Stack spacing="var(--spacing-1)">
                  <Text variant="caption" color="muted">
                    Submitted
                  </Text>
                  <Text variant="bodySmall">
                    {formatDate(deliverable.submittedDate)}
                  </Text>
                </Stack>
              )}
              {deliverable.acceptedDate !== null && (
                <Stack spacing="var(--spacing-1)">
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
          <Box
            style={{
              marginTop: 'var(--spacing-3)',
              paddingTop: 'var(--spacing-3)',
              borderTop: '1px solid var(--color-gray-200)',
            }}
          >
            <HStack spacing="var(--spacing-3)" align="center">
              <Text variant="bodySmall" weight="semibold">
                Update Status:
              </Text>
              <Select
                value={deliverable.status}
                onChange={handleStatusChange}
                size="sm"
                style={{ minWidth: '150px' }}
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
