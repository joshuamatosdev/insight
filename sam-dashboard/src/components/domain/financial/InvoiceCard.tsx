/**
 * InvoiceCard - Displays invoice summary with Pocket-style design
 */
import clsx from 'clsx';
import { Badge, Button } from '../../catalyst';
import { DocumentTextIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import type { InvoiceCardProps } from './Financial.types';
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from '../../../services/financialService';

// Map status colors to Catalyst badge colors
function getBadgeColor(status: string): 'green' | 'yellow' | 'red' | 'zinc' {
  const colorMap: Record<string, 'green' | 'yellow' | 'red' | 'zinc'> = {
    success: 'green',
    warning: 'yellow',
    danger: 'red',
    secondary: 'zinc',
    info: 'zinc',
    primary: 'zinc',
  };
  const color = getStatusColor(status);
  return colorMap[color] ?? 'zinc';
}

export function InvoiceCard({
  invoice,
  onView,
  onSubmit,
  onDelete,
  className,
}: InvoiceCardProps) {
  const canSubmit = invoice.status === 'DRAFT';
  const canDelete = invoice.status === 'DRAFT';

  return (
    <div className={clsx(
      'rounded-lg bg-surface ring-1 ring-border dark:bg-zinc-800/50 dark:ring-white/10',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-6 py-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light">
            <DocumentTextIcon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-base/6 font-semibold text-on-surface">
              {invoice.invoiceNumber}
            </h3>
            <p className="text-sm/5 text-on-surface-muted">
              {invoice.contractNumber}
            </p>
          </div>
        </div>
        <Badge color={getBadgeColor(invoice.status)}>
          {getStatusLabel(invoice.status)}
        </Badge>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        {/* Invoice Details */}
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs/5 font-medium text-on-surface-muted">
              Invoice Date
            </dt>
            <dd className="text-sm/6 text-on-surface">
              {formatDate(invoice.invoiceDate)}
            </dd>
          </div>

          <div>
            <dt className="text-xs/5 font-medium text-on-surface-muted">
              Due Date
            </dt>
            <dd className={clsx(
              'text-sm/6',
              invoice.isOverdue
                ? 'text-danger'
                : 'text-on-surface'
            )}>
              {formatDate(invoice.dueDate)}
              {invoice.isOverdue && ' (Overdue)'}
            </dd>
          </div>

          <div>
            <dt className="text-xs/5 font-medium text-on-surface-muted">
              Period
            </dt>
            <dd className="text-sm/6 text-on-surface">
              {invoice.periodStart !== null && invoice.periodEnd !== null
                ? `${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`
                : '-'}
            </dd>
          </div>

          <div>
            <dt className="text-xs/5 font-medium text-on-surface-muted">
              Type
            </dt>
            <dd className="text-sm/6 text-on-surface">
              {invoice.invoiceType}
            </dd>
          </div>
        </dl>

        {/* Amounts */}
        <dl className="space-y-2 border-t border-border pt-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <dt className="text-sm/6 text-on-surface-muted">Subtotal</dt>
            <dd className="text-sm/6 text-on-surface">
              {formatCurrency(invoice.subtotal)}
            </dd>
          </div>
          {invoice.adjustments !== 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-sm/6 text-on-surface-muted">Adjustments</dt>
              <dd className="text-sm/6 text-on-surface">
                {formatCurrency(invoice.adjustments)}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-sm/6 font-semibold text-on-surface">Total</dt>
            <dd className="text-sm/6 font-semibold text-accent">
              {formatCurrency(invoice.totalAmount)}
            </dd>
          </div>
          {invoice.amountPaid > 0 && (
            <>
              <div className="flex items-center justify-between">
                <dt className="text-sm/6 text-on-surface-muted">Paid</dt>
                <dd className="text-sm/6 text-success">
                  {formatCurrency(invoice.amountPaid)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm/6 font-medium text-on-surface">Balance</dt>
                <dd className={clsx(
                  'text-sm/6 font-medium',
                  invoice.balance > 0
                    ? 'text-warning'
                    : 'text-success'
                )}>
                  {formatCurrency(invoice.balance)}
                </dd>
              </div>
            </>
          )}
        </dl>

        {/* Days Outstanding */}
        {invoice.daysOutstanding !== null && invoice.daysOutstanding > 0 && (
          <p className="text-xs/5 text-on-surface-muted">
            {invoice.daysOutstanding} days outstanding
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-6 py-3 dark:border-white/10">
        {canSubmit && onSubmit !== undefined ? (
          <Button color="dark/zinc" onClick={() => onSubmit(invoice.id)}>
            Submit
          </Button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {onView !== undefined && (
            <Button
              plain
              onClick={() => onView(invoice)}
              aria-label="View invoice"
            >
              <PencilIcon className="size-4" />
            </Button>
          )}
          {canDelete && onDelete !== undefined && (
            <Button
              plain
              onClick={() => onDelete(invoice.id)}
              aria-label="Delete invoice"
            >
              <TrashIcon className="size-4 text-danger" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceCard;
