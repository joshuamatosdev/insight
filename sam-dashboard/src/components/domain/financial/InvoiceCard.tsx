/**
 * InvoiceCard - Displays invoice summary with Pocket-style design
 */

import {Badge, Button} from '../../catalyst';
import {DocumentTextIcon, PencilIcon, TrashIcon} from '@heroicons/react/20/solid';
import type {InvoiceCardProps} from './Financial.types';
import type {InvoiceStatus} from '../../../types/financial.types';
import {formatCurrency, formatDate, getStatusColor, getStatusLabel,} from '../../../services/financialService';

// Map status colors to Catalyst badge colors
function getBadgeColor(status: InvoiceStatus): 'green' | 'yellow' | 'red' | 'zinc' {
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
    <div>
      {/* Header */}
      <div>
        <div>
          <div>
            <DocumentTextIcon />
          </div>
          <div>
            <h3>
              {invoice.invoiceNumber}
            </h3>
            <p>
              {invoice.contractNumber}
            </p>
          </div>
        </div>
        <Badge color={getBadgeColor(invoice.status)}>
          {getStatusLabel(invoice.status)}
        </Badge>
      </div>

      {/* Body */}
      <div>
        {/* Invoice Details */}
        <dl>
          <div>
            <dt>
              Invoice Date
            </dt>
            <dd>
              {formatDate(invoice.invoiceDate)}
            </dd>
          </div>

          <div>
            <dt>
              Due Date
            </dt>
            <dd>
              {formatDate(invoice.dueDate)}
              {invoice.isOverdue && ' (Overdue)'}
            </dd>
          </div>

          <div>
            <dt>
              Period
            </dt>
            <dd>
              {invoice.periodStart !== null && invoice.periodEnd !== null
                ? `${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`
                : '-'}
            </dd>
          </div>

          <div>
            <dt>
              Type
            </dt>
            <dd>
              {invoice.invoiceType}
            </dd>
          </div>
        </dl>

        {/* Amounts */}
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>
              {formatCurrency(invoice.subtotal)}
            </dd>
          </div>
          {invoice.adjustments !== 0 && (
            <div>
              <dt>Adjustments</dt>
              <dd>
                {formatCurrency(invoice.adjustments)}
              </dd>
            </div>
          )}
          <div>
            <dt>Total</dt>
            <dd>
              {formatCurrency(invoice.totalAmount)}
            </dd>
          </div>
          {invoice.amountPaid > 0 && (
            <>
              <div>
                <dt>Paid</dt>
                <dd>
                  {formatCurrency(invoice.amountPaid)}
                </dd>
              </div>
              <div>
                <dt>Balance</dt>
                <dd>
                  {formatCurrency(invoice.balance)}
                </dd>
              </div>
            </>
          )}
        </dl>

        {/* Days Outstanding */}
        {invoice.daysOutstanding !== null && invoice.daysOutstanding > 0 && (
          <p>
            {invoice.daysOutstanding} days outstanding
          </p>
        )}
      </div>

      {/* Footer */}
      <div>
        {canSubmit && onSubmit !== undefined ? (
          <Button color="dark/zinc" onClick={() => onSubmit(invoice.id)}>
            Submit
          </Button>
        ) : (
          <span />
        )}

        <div>
          {onView !== undefined && (
            <Button
              plain
              onClick={() => onView(invoice)}
              aria-label="View invoice"
            >
              <PencilIcon />
            </Button>
          )}
          {canDelete && onDelete !== undefined && (
            <Button
              plain
              onClick={() => onDelete(invoice.id)}
              aria-label="Delete invoice"
            >
              <TrashIcon />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceCard;
