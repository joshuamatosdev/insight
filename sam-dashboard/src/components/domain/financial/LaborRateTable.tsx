/**
 * LaborRateTable - Table display of labor rates
 */
import clsx from 'clsx';
import { Badge, Button } from '../../catalyst';
import { PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../catalyst';
import type { LaborRateTableProps } from './Financial.types';
import { formatCurrency, formatDate } from '../../../services/financialService';

export function LaborRateTable({
  rates,
  onEdit,
  onToggleActive,
  onDelete,
  className,
}: LaborRateTableProps) {
  if (rates.length === 0) {
    return (
      <div className={clsx(
        'rounded-lg bg-surface ring-1 ring-border dark:bg-zinc-800/50 dark:ring-white/10',
        className
      )}>
        <div className="flex flex-col items-center justify-center px-6 py-12">
          <p className="text-sm/6 text-on-surface-muted">
            No labor rates configured yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'rounded-lg bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10 overflow-hidden',
      className
    )}>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Labor Category</TableHeader>
            <TableHeader>Experience</TableHeader>
            <TableHeader className="text-right">Base Rate</TableHeader>
            <TableHeader className="text-right">Fully Burdened</TableHeader>
            <TableHeader className="text-right">Billing Rate</TableHeader>
            <TableHeader>Effective Period</TableHeader>
            <TableHeader className="text-center">Status</TableHeader>
            <TableHeader className="text-center">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rates.map((rate) => (
            <TableRow key={rate.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-on-surface">
                    {rate.laborCategory}
                  </p>
                  {rate.laborCategoryDescription !== null && (
                    <p className="text-xs text-on-surface-muted">
                      {rate.laborCategoryDescription}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-on-surface">
                    {rate.minYearsExperience !== null || rate.maxYearsExperience !== null
                      ? `${rate.minYearsExperience ?? 0}-${rate.maxYearsExperience ?? '+'} years`
                      : '-'}
                  </p>
                  {rate.educationRequirement !== null && (
                    <p className="text-xs text-on-surface-muted">
                      {rate.educationRequirement}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <p className="text-on-surface">{formatCurrency(rate.baseRate)}</p>
                  {rate.rateType !== null && (
                    <p className="text-xs text-on-surface-muted">
                      /{rate.rateType.toLowerCase()}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium text-on-surface">
                {rate.fullyBurdenedRate !== null
                  ? formatCurrency(rate.fullyBurdenedRate)
                  : '-'}
              </TableCell>
              <TableCell className="text-right font-medium text-accent">
                {rate.billingRate !== null ? formatCurrency(rate.billingRate) : '-'}
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-on-surface">
                    {rate.effectiveDate !== null
                      ? formatDate(rate.effectiveDate)
                      : 'No start'}
                    {' - '}
                    {rate.endDate !== null ? formatDate(rate.endDate) : 'Ongoing'}
                  </p>
                  {rate.fiscalYear !== null && (
                    <p className="text-xs text-on-surface-muted">
                      FY{rate.fiscalYear}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge color={rate.isActive ? 'green' : 'zinc'}>
                  {rate.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {onToggleActive !== undefined && (
                    <Button
                      plain
                      onClick={() => onToggleActive(rate.id, !rate.isActive)}
                      aria-label={rate.isActive ? 'Deactivate rate' : 'Activate rate'}
                    >
                      <span className={clsx(
                        'text-xs',
                        rate.isActive
                          ? 'text-danger'
                          : 'text-success'
                      )}>
                        {rate.isActive ? 'Disable' : 'Enable'}
                      </span>
                    </Button>
                  )}
                  {onEdit !== undefined && (
                    <Button
                      plain
                      onClick={() => onEdit(rate)}
                      aria-label="Edit labor rate"
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                  )}
                  {onDelete !== undefined && (
                    <Button
                      plain
                      onClick={() => onDelete(rate.id)}
                      aria-label="Delete labor rate"
                    >
                      <TrashIcon className="size-4 text-danger" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default LaborRateTable;
