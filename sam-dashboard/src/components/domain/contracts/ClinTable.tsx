import {CSSProperties} from 'react';

import {Badge, Button, PencilIcon, Text} from '../../catalyst/primitives';
import {Box, Card} from '../../catalyst/layout';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '../../catalyst';
import type {ClinTableProps, ClinType, PricingType} from './Contract.types';
import {formatCurrency} from './Contract.types';

function getClinTypeLabel(type: ClinType): string {
  const labels: Record<ClinType, string> = {
    BASE: 'Base',
    OPTION: 'Option',
    DATA: 'Data',
    SERVICES: 'Services',
    SUPPLIES: 'Supplies',
    OTHER: 'Other',
  };
  return labels[type];
}

function getPricingTypeLabel(type: PricingType | null): string {
  if (type === null) {
    return 'N/A';
  }
  const labels: Record<PricingType, string> = {
    FIRM_FIXED_PRICE: 'FFP',
    TIME_AND_MATERIALS: 'T&M',
    LABOR_HOUR: 'LH',
    COST_PLUS_FIXED_FEE: 'CPFF',
    COST_PLUS_INCENTIVE_FEE: 'CPIF',
    COST_REIMBURSEMENT: 'CR',
  };
  return labels[type];
}

type BadgeColor = 'blue' | 'cyan' | 'zinc';

function getClinTypeColor(type: ClinType): BadgeColor {
  if (type === 'BASE') {
    return 'blue';
  }
  if (type === 'OPTION') {
    return 'cyan';
  }
  return 'zinc';
}

export function ClinTable({
  clins,
  onEditClin,
  className,
  style,
}: ClinTableProps) {
  const tableStyles: CSSProperties = {
    ...style,
  };

  if (clins.length === 0) {
    return (
      <Box
        style={tableStyles}
      >
        <Text variant="body" color="muted">
          No CLINs defined for this contract
        </Text>
      </Box>
    );
  }

  // Calculate totals
  const totalValue = clins.reduce(
    (sum, clin) => sum + (clin.totalValue ?? 0),
    0
  );
  const totalFunded = clins.reduce(
    (sum, clin) => sum + (clin.fundedAmount ?? 0),
    0
  );
  const totalInvoiced = clins.reduce(
    (sum, clin) => sum + (clin.invoicedAmount ?? 0),
    0
  );
  const totalRemaining = clins.reduce(
    (sum, clin) => sum + (clin.remainingFunds ?? 0),
    0
  );

  return (
    <Card style={tableStyles}>
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>CLIN</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Pricing</TableHeader>
              <TableHeader>Total Value</TableHeader>
              <TableHeader>Funded</TableHeader>
              <TableHeader>Invoiced</TableHeader>
              <TableHeader>Remaining</TableHeader>
              {onEditClin !== undefined && <TableHeader>Actions</TableHeader>}
            </TableRow>
          </TableHead>
          <TableBody>
            {clins.map((clin) => (
              <TableRow key={clin.id}>
                <TableCell>
                  <Text variant="body" weight="semibold">
                    {clin.clinNumber}
                  </Text>
                  {clin.isOption === true && clin.optionPeriod !== null && (
                    <Text variant="caption" color="muted">
                      Option Period {clin.optionPeriod}
                    </Text>
                  )}
                </TableCell>
                <TableCell>
                  <Text
                    variant="bodySmall"
                  >
                    {clin.description ?? 'N/A'}
                  </Text>
                </TableCell>
                <TableCell>
                  <Badge color={getClinTypeColor(clin.clinType)}>
                    {getClinTypeLabel(clin.clinType)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Text variant="bodySmall">
                    {getPricingTypeLabel(clin.pricingType)}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="body" weight="semibold">
                    {formatCurrency(clin.totalValue)}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="body">
                    {formatCurrency(clin.fundedAmount)}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="body">
                    {formatCurrency(clin.invoicedAmount)}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text
                    variant="body"
                    weight="semibold"
                    color={
                      clin.remainingFunds !== null && clin.remainingFunds < 0
                        ? 'danger'
                        : undefined
                    }
                  >
                    {formatCurrency(clin.remainingFunds)}
                  </Text>
                </TableCell>
                {onEditClin !== undefined && (
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onEditClin(clin)}
                      leftIcon={<PencilIcon size="sm" />}
                    >
                      Edit
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4}>
                <Text variant="body" weight="semibold">
                  Totals
                </Text>
              </TableCell>
              <TableCell>
                <Text variant="body" weight="semibold">
                  {formatCurrency(totalValue)}
                </Text>
              </TableCell>
              <TableCell>
                <Text variant="body" weight="semibold">
                  {formatCurrency(totalFunded)}
                </Text>
              </TableCell>
              <TableCell>
                <Text variant="body" weight="semibold">
                  {formatCurrency(totalInvoiced)}
                </Text>
              </TableCell>
              <TableCell>
                <Text
                  variant="body"
                  weight="semibold"
                  color={totalRemaining < 0 ? 'danger' : 'success'}
                >
                  {formatCurrency(totalRemaining)}
                </Text>
              </TableCell>
              {onEditClin !== undefined && <TableCell>{' '}</TableCell>}
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}

export default ClinTable;
