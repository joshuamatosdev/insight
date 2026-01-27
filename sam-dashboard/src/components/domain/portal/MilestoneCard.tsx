import type { CSSProperties } from 'react';
import type { MilestoneCardProps } from './Portal.types';
import { Text, Badge, Button } from '../../primitives';
import { Card, CardHeader, CardBody, CardFooter, Flex, Stack, Box, HStack } from '../../layout';

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
  const getStatusVariant = (
    status: string
  ): 'primary' | 'success' | 'warning' | 'secondary' | 'danger' | 'info' => {
    switch (status) {
      case 'NOT_STARTED':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'DELAYED':
        return 'danger';
      case 'AT_RISK':
        return 'warning';
      case 'CANCELLED':
        return 'secondary';
      default:
        return 'secondary';
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
        ? 'var(--color-success)'
        : milestone.status === 'DELAYED' || isOverdue()
        ? 'var(--color-danger)'
        : milestone.status === 'AT_RISK'
        ? 'var(--color-warning)'
        : 'var(--color-gray-300)'
    }`,
    ...style,
  };

  return (
    <Card
      className={className}
      style={cardStyles}
      onClick={handleClick}
      aria-label={`Milestone: ${milestone.name}`}
    >
      <CardHeader>
        <Flex justify="space-between" align="flex-start">
          <Stack spacing="var(--spacing-1)">
            <Text variant="heading5">{milestone.name}</Text>
            <HStack spacing="var(--spacing-2)">
              <Badge variant={getStatusVariant(milestone.status)} size="sm">
                {milestone.status.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" size="sm">
                {getTypeLabel(milestone.type)}
              </Badge>
            </HStack>
          </Stack>
        </Flex>
      </CardHeader>
      <CardBody>
        {milestone.description !== null && milestone.description !== '' && (
          <Box className="mb-3">
            <Text variant="body" color="muted">
              {milestone.description}
            </Text>
          </Box>
        )}

        {/* Dates */}
        <HStack spacing="var(--spacing-4)" className="mb-3">
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
        <Box className="mb-2">
          <Flex justify="space-between" align="center" className="mb-1">
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
              backgroundColor: 'var(--color-gray-200)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                height: '100%',
                width: `${milestone.percentComplete}%`,
                backgroundColor:
                  milestone.percentComplete === 100
                    ? 'var(--color-success)'
                    : 'var(--color-primary)',
                borderRadius: 'var(--radius-full)',
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
          <Box className="mt-3">
            <Text variant="caption" weight="medium" className="mb-2">
              Deliverables ({milestone.deliverables.length})
            </Text>
            <Stack spacing="var(--spacing-2)">
              {milestone.deliverables.map((deliverable) => (
                <Flex
                  key={deliverable.id}
                  justify="space-between"
                  align="center"
                  style={{
                    padding: 'var(--spacing-2)',
                    backgroundColor: 'var(--color-gray-50)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <Text variant="bodySmall">{deliverable.name}</Text>
                  <Badge
                    variant={
                      deliverable.status === 'APPROVED'
                        ? 'success'
                        : deliverable.status === 'REJECTED'
                        ? 'danger'
                        : deliverable.status === 'SUBMITTED'
                        ? 'warning'
                        : 'secondary'
                    }
                    size="sm"
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
          <HStack spacing="var(--spacing-2)">
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
