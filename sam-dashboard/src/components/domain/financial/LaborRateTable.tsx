/**
 * LaborRateTable - Table display of labor rates
 */
import { Text, Badge, Button, PencilIcon, TrashIcon } from '../../primitives';
import {
  Card,
  CardBody,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  HStack,
  Flex,
} from '../../layout';
import type { LaborRateTableProps } from './Financial.types';
import { formatCurrency, formatDate } from '../../../services/financialService';

export function LaborRateTable({
  rates,
  onEdit,
  onToggleActive,
  onDelete,
  className,
  style,
}: LaborRateTableProps) {
  if (rates.length === 0) {
    return (
      <Card variant="outlined" className={className} style={style}>
        <CardBody>
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{ padding: 'var(--spacing-8)' }}
          >
            <Text variant="body" color="muted">
              No labor rates configured yet.
            </Text>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card variant="outlined" className={className} style={style}>
      <CardBody padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Labor Category</TableHeaderCell>
              <TableHeaderCell>Experience</TableHeaderCell>
              <TableHeaderCell align="right">Base Rate</TableHeaderCell>
              <TableHeaderCell align="right">Fully Burdened</TableHeaderCell>
              <TableHeaderCell align="right">Billing Rate</TableHeaderCell>
              <TableHeaderCell>Effective Period</TableHeaderCell>
              <TableHeaderCell align="center">Status</TableHeaderCell>
              <TableHeaderCell align="center">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>
                  <Text variant="bodySmall" weight="medium">
                    {rate.laborCategory}
                  </Text>
                  {rate.laborCategoryDescription !== null && (
                    <Text variant="caption" color="muted">
                      {rate.laborCategoryDescription}
                    </Text>
                  )}
                </TableCell>
                <TableCell>
                  <Text variant="bodySmall">
                    {rate.minYearsExperience !== null || rate.maxYearsExperience !== null
                      ? `${rate.minYearsExperience ?? 0}-${rate.maxYearsExperience ?? '+'} years`
                      : '-'}
                  </Text>
                  {rate.educationRequirement !== null && (
                    <Text variant="caption" color="muted">
                      {rate.educationRequirement}
                    </Text>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Text variant="bodySmall">{formatCurrency(rate.baseRate)}</Text>
                  {rate.rateType !== null && (
                    <Text variant="caption" color="muted">
                      /{rate.rateType.toLowerCase()}
                    </Text>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Text variant="bodySmall" weight="medium">
                    {rate.fullyBurdenedRate !== null
                      ? formatCurrency(rate.fullyBurdenedRate)
                      : '-'}
                  </Text>
                </TableCell>
                <TableCell align="right">
                  <Text variant="bodySmall" weight="medium" color="primary">
                    {rate.billingRate !== null ? formatCurrency(rate.billingRate) : '-'}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="bodySmall">
                    {rate.effectiveDate !== null
                      ? formatDate(rate.effectiveDate)
                      : 'No start'}
                    {' - '}
                    {rate.endDate !== null ? formatDate(rate.endDate) : 'Ongoing'}
                  </Text>
                  {rate.fiscalYear !== null && (
                    <Text variant="caption" color="muted">
                      FY{rate.fiscalYear}
                    </Text>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Badge
                    variant={rate.isActive ? 'success' : 'secondary'}
                    size="sm"
                  >
                    {rate.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell align="center">
                  <HStack spacing="var(--spacing-1)" justify="center">
                    {onToggleActive !== undefined && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleActive(rate.id, !rate.isActive)}
                        aria-label={rate.isActive ? 'Deactivate rate' : 'Activate rate'}
                      >
                        <Text variant="caption" color={rate.isActive ? 'danger' : 'success'}>
                          {rate.isActive ? 'Disable' : 'Enable'}
                        </Text>
                      </Button>
                    )}
                    {onEdit !== undefined && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(rate)}
                        aria-label="Edit labor rate"
                      >
                        <PencilIcon size="sm" />
                      </Button>
                    )}
                    {onDelete !== undefined && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(rate.id)}
                        aria-label="Delete labor rate"
                      >
                        <TrashIcon size="sm" color="danger" />
                      </Button>
                    )}
                  </HStack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}

export default LaborRateTable;
