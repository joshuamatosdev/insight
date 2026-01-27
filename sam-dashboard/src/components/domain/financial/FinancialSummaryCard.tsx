/**
 * FinancialSummaryCard - Displays key financial metrics using flat grid pattern
 */
import clsx from 'clsx';
import { Badge } from '../../catalyst';
import type { FinancialSummaryCardProps } from './Financial.types';
import { formatCurrency } from '../../../services/financialService';

export function FinancialSummaryCard({
  summary,
  className,
}: FinancialSummaryCardProps) {
  const stats = [
    {
      label: 'Total Invoiced',
      value: formatCurrency(summary.totalInvoiced),
      color: 'text-on-surface',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(summary.totalOutstanding),
      color: summary.totalOutstanding > 0
        ? 'text-warning'
        : 'text-success',
    },
    {
      label: 'Draft Invoices',
      value: summary.draftInvoices.toString(),
      color: 'text-on-surface',
    },
    {
      label: 'Submitted',
      value: summary.submittedInvoices.toString(),
      color: 'text-accent',
    },
  ];

  return (
    <div className={clsx('rounded-lg bg-surface ring-1 ring-border dark:bg-zinc-800/50 dark:ring-white/10', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 dark:border-white/10">
        <h3 className="text-base/6 font-semibold text-on-surface">
          Financial Overview
        </h3>
        {summary.overdueInvoices > 0 && (
          <Badge color="red">
            {summary.overdueInvoices} Overdue
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={stat.label}
            className={clsx(
              'px-6 py-6',
              idx !== 0 && 'border-l border-border dark:border-white/10',
              idx >= 2 && 'border-t border-border lg:border-t-0 dark:border-white/10'
            )}
          >
            <dt className="text-sm/6 font-medium text-on-surface-muted">
              {stat.label}
            </dt>
            <dd className={clsx('mt-1 text-2xl/8 font-semibold tracking-tight', stat.color)}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default FinancialSummaryCard;
