import { CSSProperties } from 'react';
import { Text, Badge, Button } from '../../primitives';
import { Box, Stack, HStack, Card, CardBody, Grid } from '../../layout';
import type {
  ModificationTimelineProps,
  ContractModification,
  ModificationStatus,
} from './Contract.types';
import { getModificationTypeLabel, formatCurrency, formatDate } from './Contract.types';
import type { BadgeVariant } from '../../primitives';

function getStatusVariant(status: ModificationStatus): BadgeVariant {
  const variantMap: Record<ModificationStatus, BadgeVariant> = {
    DRAFT: 'secondary',
    PENDING: 'warning',
    UNDER_REVIEW: 'info',
    APPROVED: 'primary',
    EXECUTED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'secondary',
  };
  return variantMap[status];
}

function getStatusLabel(status: ModificationStatus): string {
  const labels: Record<ModificationStatus, string> = {
    DRAFT: 'Draft',
    PENDING: 'Pending',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    EXECUTED: 'Executed',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
  };
  return labels[status];
}

interface ModificationItemProps {
  modification: ContractModification;
  onExecute?: (modificationId: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

function ModificationItem({
  modification,
  onExecute,
  isFirst,
  isLast,
}: ModificationItemProps) {
  const hasValueChange =
    modification.valueChange !== null && modification.valueChange !== 0;
  const hasFundingChange =
    modification.fundingChange !== null && modification.fundingChange !== 0;
  const hasPopChange =
    modification.popExtensionDays !== null || modification.newPopEndDate !== null;

  const canExecute =
    modification.status === 'APPROVED' && onExecute !== undefined;

  return (
    <Box style={{ position: 'relative', paddingLeft: 'var(--spacing-8)' }}>
      <Box
        style={{
          position: 'absolute',
          left: '10px',
          top: '0',
          bottom: isLast ? '50%' : '0',
          width: '2px',
          backgroundColor: 'var(--color-gray-300)',
        }}
      />
      {isFirst === false && (
        <Box
          style={{
            position: 'absolute',
            left: '10px',
            top: '0',
            height: '50%',
            width: '2px',
            backgroundColor: 'var(--color-gray-300)',
          }}
        />
      )}
      <Box
        style={{
          position: 'absolute',
          left: '4px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor:
            modification.status === 'EXECUTED'
              ? 'var(--color-success)'
              : modification.status === 'APPROVED'
                ? 'var(--color-primary)'
                : 'var(--color-gray-400)',
          border: '2px solid var(--color-white)',
          zIndex: 1,
        }}
      />

      <Card className="mb-4">
        <CardBody>
          <HStack justify="between" align="start" className="mb-3">
            <Box>
              <HStack spacing="var(--spacing-2)" align="center">
                <Text variant="heading5">{modification.modificationNumber}</Text>
                <Badge variant="info" size="sm">
                  {getModificationTypeLabel(modification.modificationType)}
                </Badge>
                <Badge variant={getStatusVariant(modification.status)} size="sm">
                  {getStatusLabel(modification.status)}
                </Badge>
              </HStack>
              {modification.title !== null && (
                <Text variant="body" className="mt-1">
                  {modification.title}
                </Text>
              )}
            </Box>
            {canExecute && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onExecute(modification.id)}
              >
                Execute
              </Button>
            )}
          </HStack>

          <Grid columns={3} gap="var(--spacing-4)">
            <Stack spacing="var(--spacing-1)">
              <Text variant="caption" color="muted">
                Effective Date
              </Text>
              <Text variant="bodySmall">
                {formatDate(modification.effectiveDate)}
              </Text>
            </Stack>
            {modification.executedDate !== null && (
              <Stack spacing="var(--spacing-1)">
                <Text variant="caption" color="muted">
                  Executed Date
                </Text>
                <Text variant="bodySmall">
                  {formatDate(modification.executedDate)}
                </Text>
              </Stack>
            )}
            {modification.contractingOfficerName !== null && (
              <Stack spacing="var(--spacing-1)">
                <Text variant="caption" color="muted">
                  Contracting Officer
                </Text>
                <Text variant="bodySmall">
                  {modification.contractingOfficerName}
                </Text>
              </Stack>
            )}
          </Grid>

          {(hasValueChange || hasFundingChange || hasPopChange) && (
            <Box
              style={{
                marginTop: 'var(--spacing-3)',
                paddingTop: 'var(--spacing-3)',
                borderTop: '1px solid var(--color-gray-200)',
              }}
            >
              <Text
                variant="caption"
                color="muted"
                className="mb-2"
              >
                Changes
              </Text>
              <Grid columns={3} gap="var(--spacing-4)">
                {hasValueChange && (
                  <Stack spacing="var(--spacing-1)">
                    <Text variant="caption" color="muted">
                      Value Change
                    </Text>
                    <Text
                      variant="body"
                      weight="semibold"
                      color={
                        modification.valueChange !== null && modification.valueChange > 0
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {modification.valueChange !== null && modification.valueChange > 0
                        ? '+'
                        : ''}
                      {formatCurrency(modification.valueChange)}
                    </Text>
                  </Stack>
                )}
                {hasFundingChange && (
                  <Stack spacing="var(--spacing-1)">
                    <Text variant="caption" color="muted">
                      Funding Change
                    </Text>
                    <Text
                      variant="body"
                      weight="semibold"
                      color={
                        modification.fundingChange !== null &&
                        modification.fundingChange > 0
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {modification.fundingChange !== null && modification.fundingChange > 0
                        ? '+'
                        : ''}
                      {formatCurrency(modification.fundingChange)}
                    </Text>
                  </Stack>
                )}
                {modification.newTotalValue !== null && (
                  <Stack spacing="var(--spacing-1)">
                    <Text variant="caption" color="muted">
                      New Total Value
                    </Text>
                    <Text variant="body" weight="semibold">
                      {formatCurrency(modification.newTotalValue)}
                    </Text>
                  </Stack>
                )}
                {modification.popExtensionDays !== null && (
                  <Stack spacing="var(--spacing-1)">
                    <Text variant="caption" color="muted">
                      PoP Extension
                    </Text>
                    <Text variant="body" weight="semibold">
                      +{modification.popExtensionDays} days
                    </Text>
                  </Stack>
                )}
                {modification.newPopEndDate !== null && (
                  <Stack spacing="var(--spacing-1)">
                    <Text variant="caption" color="muted">
                      New PoP End Date
                    </Text>
                    <Text variant="body" weight="semibold">
                      {formatDate(modification.newPopEndDate)}
                    </Text>
                  </Stack>
                )}
              </Grid>
            </Box>
          )}

          {modification.scopeChangeSummary !== null && (
            <Box
              style={{
                marginTop: 'var(--spacing-3)',
                paddingTop: 'var(--spacing-3)',
                borderTop: '1px solid var(--color-gray-200)',
              }}
            >
              <Text
                variant="caption"
                color="muted"
                className="mb-1"
              >
                Scope Change Summary
              </Text>
              <Text variant="bodySmall">{modification.scopeChangeSummary}</Text>
            </Box>
          )}

          {modification.reason !== null && (
            <Box className="mt-2">
              <Text
                variant="caption"
                color="muted"
                className="mb-1"
              >
                Reason
              </Text>
              <Text variant="bodySmall">{modification.reason}</Text>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}

export function ModificationTimeline({
  modifications,
  onExecuteModification,
  className,
  style,
}: ModificationTimelineProps) {
  const timelineStyles: CSSProperties = {
    ...style,
  };

  if (modifications.length === 0) {
    return (
      <Box
        className={className}
        style={{
          padding: 'var(--spacing-8)',
          textAlign: 'center',
          backgroundColor: 'var(--color-gray-50)',
          borderRadius: 'var(--radius-lg)',
          ...timelineStyles,
        }}
      >
        <Text variant="body" color="muted">
          No modifications for this contract
        </Text>
      </Box>
    );
  }

  return (
    <Stack spacing="var(--spacing-0)" className={className} style={timelineStyles}>
      {modifications.map((modification, index) => (
        <ModificationItem
          key={modification.id}
          modification={modification}
          onExecute={onExecuteModification}
          isFirst={index === 0}
          isLast={index === modifications.length - 1}
        />
      ))}
    </Stack>
  );
}

export default ModificationTimeline;
