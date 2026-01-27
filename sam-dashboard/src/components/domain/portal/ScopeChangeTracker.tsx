import type { CSSProperties } from 'react';
import type { ScopeChangeTrackerProps, ScopeChangeCardProps } from './Portal.types';
import type { ScopeChange } from '../../../types/portal';
import { Text, Badge, Button } from '../../primitives';
import { Card, CardBody, Flex, Stack, Box, HStack } from '../../layout';

/**
 * Individual scope change card.
 */
function ScopeChangeCard({
  scopeChange,
  onApprove,
  onReject,
  onClick,
  className,
  style,
}: ScopeChangeCardProps): React.ReactElement {
  const getStatusVariant = (
    status: string
  ): 'primary' | 'success' | 'warning' | 'secondary' | 'danger' | 'info' => {
    switch (status) {
      case 'PROPOSED':
        return 'secondary';
      case 'UNDER_REVIEW':
        return 'info';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'IMPLEMENTED':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const getChangeTypeVariant = (
    type: string
  ): 'success' | 'warning' | 'danger' | 'info' => {
    switch (type) {
      case 'ADDITION':
        return 'success';
      case 'MODIFICATION':
        return 'warning';
      case 'REMOVAL':
        return 'danger';
      case 'CLARIFICATION':
        return 'info';
      default:
        return 'info';
    }
  };

  const getChangeTypeLabel = (type: string): string => {
    switch (type) {
      case 'ADDITION':
        return '+ Addition';
      case 'MODIFICATION':
        return '~ Modification';
      case 'REMOVAL':
        return '- Removal';
      case 'CLARIFICATION':
        return 'Clarification';
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

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleClick = () => {
    if (onClick !== undefined) {
      onClick(scopeChange);
    }
  };

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApprove !== undefined) {
      onApprove(scopeChange.id);
    }
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReject !== undefined) {
      onReject(scopeChange.id);
    }
  };

  const isPending =
    scopeChange.status === 'PROPOSED' || scopeChange.status === 'UNDER_REVIEW';

  const cardStyles: CSSProperties = {
    cursor: onClick !== undefined ? 'pointer' : 'default',
    ...style,
  };

  return (
    <Card
      className={className}
      style={cardStyles}
      onClick={handleClick}
      aria-label={`Scope change: ${scopeChange.title}`}
    >
      <CardBody>
        <Stack spacing="var(--spacing-3)">
          {/* Header */}
          <Flex justify="space-between" align="flex-start">
            <Stack spacing="var(--spacing-1)">
              <Text variant="heading5">{scopeChange.title}</Text>
              <HStack spacing="var(--spacing-2)">
                <Badge variant={getStatusVariant(scopeChange.status)} size="sm">
                  {scopeChange.status.replace('_', ' ')}
                </Badge>
                <Badge variant={getChangeTypeVariant(scopeChange.changeType)} size="sm">
                  {getChangeTypeLabel(scopeChange.changeType)}
                </Badge>
              </HStack>
            </Stack>
            <Text variant="caption" color="muted">
              {formatDate(scopeChange.requestedAt)}
            </Text>
          </Flex>

          {/* Description */}
          <Text variant="body" color="muted">
            {scopeChange.description}
          </Text>

          {/* Impact Analysis */}
          {(scopeChange.estimatedCostImpact !== null ||
            scopeChange.estimatedScheduleImpact !== null) && (
            <Box
              style={{
                padding: 'var(--spacing-2) var(--spacing-3)',
                backgroundColor: 'var(--color-gray-50)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Text variant="caption" weight="semibold" style={{ marginBottom: 'var(--spacing-1)' }}>
                Impact Assessment
              </Text>
              <HStack spacing="var(--spacing-4)">
                {scopeChange.estimatedCostImpact !== null && (
                  <Stack spacing="0">
                    <Text variant="caption" color="muted">
                      Cost Impact
                    </Text>
                    <Text
                      variant="bodySmall"
                      weight="medium"
                      color={scopeChange.estimatedCostImpact > 0 ? 'danger' : 'success'}
                    >
                      {scopeChange.estimatedCostImpact > 0 ? '+' : ''}
                      {formatCurrency(scopeChange.estimatedCostImpact)}
                    </Text>
                  </Stack>
                )}
                {scopeChange.estimatedScheduleImpact !== null && (
                  <Stack spacing="0">
                    <Text variant="caption" color="muted">
                      Schedule Impact
                    </Text>
                    <Text
                      variant="bodySmall"
                      weight="medium"
                      color={scopeChange.estimatedScheduleImpact > 0 ? 'danger' : 'success'}
                    >
                      {scopeChange.estimatedScheduleImpact > 0 ? '+' : ''}
                      {scopeChange.estimatedScheduleImpact} days
                    </Text>
                  </Stack>
                )}
              </HStack>
            </Box>
          )}

          {/* Justification */}
          {scopeChange.justification !== null && scopeChange.justification !== '' && (
            <Box>
              <Text variant="caption" weight="semibold" style={{ marginBottom: 'var(--spacing-1)' }}>
                Justification
              </Text>
              <Text variant="bodySmall" color="muted">
                {scopeChange.justification}
              </Text>
            </Box>
          )}

          {/* Footer */}
          <Flex justify="space-between" align="center">
            <Text variant="caption" color="muted">
              Requested by {scopeChange.requesterName}
            </Text>

            {/* Actions */}
            {isPending && (onApprove !== undefined || onReject !== undefined) && (
              <HStack spacing="var(--spacing-2)">
                {onReject !== undefined && (
                  <Button size="sm" variant="danger" onClick={handleReject}>
                    Reject
                  </Button>
                )}
                {onApprove !== undefined && (
                  <Button size="sm" variant="primary" onClick={handleApprove}>
                    Approve
                  </Button>
                )}
              </HStack>
            )}

            {scopeChange.approverName !== null && (
              <Text variant="caption" color="muted">
                {scopeChange.status === 'APPROVED' ? 'Approved' : 'Reviewed'} by{' '}
                {scopeChange.approverName}
              </Text>
            )}
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  );
}

/**
 * Component for tracking and managing scope changes.
 */
export function ScopeChangeTracker({
  scopeChanges,
  onApprove,
  onReject,
  onClick,
  className,
  style,
}: ScopeChangeTrackerProps): React.ReactElement {
  // Group changes by status
  const pendingChanges = scopeChanges.filter(
    (c) => c.status === 'PROPOSED' || c.status === 'UNDER_REVIEW'
  );
  const approvedChanges = scopeChanges.filter(
    (c) => c.status === 'APPROVED' || c.status === 'IMPLEMENTED'
  );
  const rejectedChanges = scopeChanges.filter((c) => c.status === 'REJECTED');

  const containerStyles: CSSProperties = {
    ...style,
  };

  if (scopeChanges.length === 0) {
    return (
      <Box className={className} style={containerStyles}>
        <Flex
          justify="center"
          align="center"
          direction="column"
          style={{ padding: 'var(--spacing-8)' }}
        >
          <Text variant="heading5" color="muted">
            No Scope Changes
          </Text>
          <Text variant="bodySmall" color="muted">
            All scope change requests will appear here
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box className={className} style={containerStyles}>
      <Stack spacing="var(--spacing-6)">
        {/* Pending Changes */}
        {pendingChanges.length > 0 && (
          <Box>
            <Flex align="center" gap="sm" style={{ marginBottom: 'var(--spacing-3)' }}>
              <Text variant="heading5">Pending Review</Text>
              <Badge variant="warning" size="sm">
                {pendingChanges.length}
              </Badge>
            </Flex>
            <Stack spacing="var(--spacing-3)">
              {pendingChanges.map((change) => (
                <ScopeChangeCard
                  key={change.id}
                  scopeChange={change}
                  onApprove={onApprove}
                  onReject={onReject}
                  onClick={onClick}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Approved Changes */}
        {approvedChanges.length > 0 && (
          <Box>
            <Flex align="center" gap="sm" style={{ marginBottom: 'var(--spacing-3)' }}>
              <Text variant="heading5">Approved</Text>
              <Badge variant="success" size="sm">
                {approvedChanges.length}
              </Badge>
            </Flex>
            <Stack spacing="var(--spacing-3)">
              {approvedChanges.map((change) => (
                <ScopeChangeCard
                  key={change.id}
                  scopeChange={change}
                  onClick={onClick}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Rejected Changes */}
        {rejectedChanges.length > 0 && (
          <Box>
            <Flex align="center" gap="sm" style={{ marginBottom: 'var(--spacing-3)' }}>
              <Text variant="heading5">Rejected</Text>
              <Badge variant="danger" size="sm">
                {rejectedChanges.length}
              </Badge>
            </Flex>
            <Stack spacing="var(--spacing-3)">
              {rejectedChanges.map((change) => (
                <ScopeChangeCard
                  key={change.id}
                  scopeChange={change}
                  onClick={onClick}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default ScopeChangeTracker;
