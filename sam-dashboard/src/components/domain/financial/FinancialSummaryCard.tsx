/**
 * FinancialSummaryCard - Displays key financial metrics using flat grid pattern
 */

import {Badge} from '../../catalyst';
import type {FinancialSummaryCardProps} from './Financial.types';
import {formatCurrency} from '../../../services/financialService';

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
    <div>
      {/* Header */}
      <div>
        <h3>
          Financial Overview
        </h3>
        {summary.overdueInvoices > 0 && (
          <Badge color="red">
            {summary.overdueInvoices} Overdue
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <dl>
        {stats.map((stat, idx) => (
          <div
            key={stat.label}
          >
            <dt>
              {stat.label}
            </dt>
            <dd>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default FinancialSummaryCard;
