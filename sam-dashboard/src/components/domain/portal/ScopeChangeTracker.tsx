import type {CSSProperties} from 'react';
import type {ScopeChangeCardProps, ScopeChangeTrackerProps} from './Portal.types';
import {Badge, Button, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, Flex, HStack, Stack} from '../../catalyst/layout';

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
  const getStatusColor = (
    status: string
  ): 'blue' | 'green' | 'amber' | 'zinc' | 'red' | 'cyan' => {
    switch (status) {
      case 'PROPOSED':
        return 'zinc';
      case 'UNDER_REVIEW':
        return 'cyan';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'IMPLEMENTED':
        return 'blue';
      default:
        return 'zinc';
    }
  };

  const getChangeTypeColor = (
    type: string
  ): 'green' | 'amber' | 'red' | 'cyan' => {
    switch (type) {
      case 'ADDITION':
        return 'green';
      case 'MODIFICATION':
        return 'amber';
      case 'REMOVAL':
        return 'red';
      case 'CLARIFICATION':
        return 'cyan';
      default:
        return 'cyan';
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
      style={cardStyles}
      onClick={handleClick}
      aria-label={`Scope change: ${scopeChange.title}`}
    >
      <CardBody>
        <Stack spacing="md">
          {/* Header */}
          <Flex justify="space-between" align="flex-start">
            <Stack spacing="xs">
              <Text variant="heading5">{scopeChange.title}</Text>
              <HStack spacing="sm">
                <Badge color={getStatusColor(scopeChange.status)}>
                  {scopeChange.status.replace('_', ' ')}
                </Badge>
                <Badge color={getChangeTypeColor(scopeChange.changeType)}>
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
                padding: '0.5rem 0.75rem',
                backgroundColor: '#fafafa',
                borderRadius: '0.375rem',
              }}
            >
              <Text variant="caption" weight="semibold">
                Impact Assessment
              </Text>
              <HStack spacing="md">
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
              <Text variant="caption" weight="semibold">
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
              <HStack spacing="sm">
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
      <Box style={containerStyles}>
        <Flex
          justify="center"
          align="center"
          direction="column"
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
    <Box style={containerStyles}>
      <Stack spacing="lg">
        {/* Pending Changes */}
        {pendingChanges.length > 0 && (
          <Box>
            <Flex align="center" gap="sm">
              <Text variant="heading5">Pending Review</Text>
              <Badge color="amber">
                {pendingChanges.length}
              </Badge>
            </Flex>
            <Stack spacing="md">
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
            <Flex align="center" gap="sm">
              <Text variant="heading5">Approved</Text>
              <Badge color="green">
                {approvedChanges.length}
              </Badge>
            </Flex>
            <Stack spacing="md">
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
            <Flex align="center" gap="sm">
              <Text variant="heading5">Rejected</Text>
              <Badge color="red">
                {rejectedChanges.length}
              </Badge>
            </Flex>
            <Stack spacing="md">
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
