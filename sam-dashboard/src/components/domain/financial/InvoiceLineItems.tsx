/**
 * InvoiceLineItems - Table display of invoice line items
 */
import clsx from 'clsx';
import { Button } from '../../catalyst';
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../catalyst';
import type { InvoiceLineItemsProps } from './Financial.types';
import { formatCurrency } from '../../../services/financialService';

export function InvoiceLineItems({
  items,
  onAddItem,
  onDeleteItem,
  className,
}: InvoiceLineItemsProps) {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className={clsx(
      'rounded-lg bg-surface ring-1 ring-border dark:bg-zinc-800/50 dark:ring-white/10',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 dark:border-white/10">
        <h3 className="text-base/6 font-semibold text-on-surface">
          Line Items
        </h3>
        {onAddItem !== undefined && (
          <Button outline onClick={onAddItem}>
            <PlusIcon className="size-4" />
            Add Item
          </Button>
        )}
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12">
          <p className="text-sm/6 text-on-surface-muted">
            No line items added yet.
          </p>
          {onAddItem !== undefined && (
            <Button color="dark/zinc" className="mt-4" onClick={onAddItem}>
              <PlusIcon className="size-4" />
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>#</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader className="text-right">Qty/Hours</TableHeader>
              <TableHeader className="text-right">Rate</TableHeader>
              <TableHeader className="text-right">Amount</TableHeader>
              {onDeleteItem !== undefined && (
                <TableHeader className="text-center">Actions</TableHeader>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-on-surface-muted">
                  {item.lineNumber ?? index + 1}
                </TableCell>
                <TableCell className="font-medium text-on-surface">
                  {item.description}
                </TableCell>
                <TableCell className="text-on-surface-muted">
                  {item.lineType}
                </TableCell>
                <TableCell className="text-right text-on-surface">
                  {item.hours !== null
                    ? `${item.hours} hrs`
                    : item.quantity !== null
                      ? item.quantity
                      : '-'}
                </TableCell>
                <TableCell className="text-right text-on-surface">
                  {item.hourlyRate !== null
                    ? formatCurrency(item.hourlyRate)
                    : item.unitPrice !== null
                      ? formatCurrency(item.unitPrice)
                      : '-'}
                </TableCell>
                <TableCell className="text-right font-medium text-on-surface">
                  {formatCurrency(item.amount)}
                </TableCell>
                {onDeleteItem !== undefined && (
                  <TableCell className="text-center">
                    <Button
                      plain
                      onClick={() => onDeleteItem(item.id)}
                      aria-label="Delete line item"
                    >
                      <TrashIcon className="size-4 text-danger" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {/* Total Row */}
            <TableRow>
              <TableCell
                colSpan={onDeleteItem !== undefined ? 5 : 4}
                className="text-right font-semibold text-on-surface"
              >
                Total
              </TableCell>
              <TableCell className="text-right font-semibold text-on-surface">
                {formatCurrency(totalAmount)}
              </TableCell>
              {onDeleteItem !== undefined && <TableCell />}
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default InvoiceLineItems;
