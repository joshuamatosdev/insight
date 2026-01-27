import { CSSProperties } from 'react';
import { Text, Badge } from '../../primitives';
import { Card, CardHeader, CardBody, HStack, Grid, Box, Stack } from '../../layout';
import { ContractStatusBadge } from './ContractStatusBadge';
import type { ContractCardProps } from './Contract.types';
import { getContractTypeLabel, formatCurrency, formatDate } from './Contract.types';

export function ContractCard({
  contract,
  onClick,
  className,
  style,
}: ContractCardProps) {
  const cardStyles: CSSProperties = {
    marginBottom: 'var(--spacing-4)',
    cursor: onClick !== undefined ? 'pointer' : 'default',
    transition: 'var(--transition-normal)',
    ...style,
  };

  const handleClick = () => {
    if (onClick !== undefined) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick !== undefined && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  const getDaysUntilExpiration = (): number | null => {
    if (contract.popEndDate === null) {
      return null;
    }
    const endDate = new Date(contract.popEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationColor = (): 'danger' | 'warning' | 'success' | 'muted' => {
    const days = getDaysUntilExpiration();
    if (days === null) {
      return 'muted';
    }
    if (days < 0) {
      return 'muted';
    }
    if (days <= 30) {
      return 'danger';
    }
    if (days <= 90) {
      return 'warning';
    }
    return 'success';
  };

  return (
    <Card
      className={className}
      style={cardStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick !== undefined ? 0 : undefined}
      role={onClick !== undefined ? 'button' : undefined}
    >
      <CardHeader>
        <HStack justify="between" align="start">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text
              variant="heading5"
              style={{
                marginBottom: 'var(--spacing-1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {contract.title}
            </Text>
            <Text variant="bodySmall" color="muted">
              {contract.contractNumber}
            </Text>
          </Box>
          <HStack spacing="var(--spacing-2)">
            <Badge variant="info" size="sm">
              {getContractTypeLabel(contract.contractType)}
            </Badge>
            <ContractStatusBadge status={contract.status} />
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <Grid columns={4} gap="var(--spacing-4)">
          <Stack spacing="var(--spacing-1)">
            <Text variant="caption" color="muted">
              Agency
            </Text>
            <Text variant="body" weight="semibold">
              {contract.agency ?? 'N/A'}
            </Text>
          </Stack>
          <Stack spacing="var(--spacing-1)">
            <Text variant="caption" color="muted">
              Total Value
            </Text>
            <Text variant="body" weight="semibold">
              {formatCurrency(contract.totalValue)}
            </Text>
          </Stack>
          <Stack spacing="var(--spacing-1)">
            <Text variant="caption" color="muted">
              Funded Value
            </Text>
            <Text variant="body" weight="semibold">
              {formatCurrency(contract.fundedValue)}
            </Text>
          </Stack>
          <Stack spacing="var(--spacing-1)">
            <Text variant="caption" color="muted">
              PoP End Date
            </Text>
            <Text variant="body" weight="semibold" color={getExpirationColor()}>
              {formatDate(contract.popEndDate)}
            </Text>
          </Stack>
        </Grid>
        {(contract.contractingOfficerName !== null ||
          contract.programManagerName !== null) && (
          <Box style={{ marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-gray-200)' }}>
            <Grid columns={2} gap="var(--spacing-4)">
              {contract.contractingOfficerName !== null && (
                <Stack spacing="var(--spacing-1)">
                  <Text variant="caption" color="muted">
                    Contracting Officer
                  </Text>
                  <Text variant="bodySmall">
                    {contract.contractingOfficerName}
                  </Text>
                </Stack>
              )}
              {contract.programManagerName !== null && (
                <Stack spacing="var(--spacing-1)">
                  <Text variant="caption" color="muted">
                    Program Manager
                  </Text>
                  <Text variant="bodySmall">
                    {contract.programManagerName}
                  </Text>
                </Stack>
              )}
            </Grid>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}

export default ContractCard;
