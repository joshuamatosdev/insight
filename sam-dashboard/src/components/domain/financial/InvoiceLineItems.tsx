/**
 * InvoiceLineItems - Table display of invoice line items
 */

import {Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../catalyst';
import {PlusIcon, TrashIcon} from '@heroicons/react/20/solid';
import type {InvoiceLineItemsProps} from './Financial.types';
import {formatCurrency} from '../../../services/financialService';

export function InvoiceLineItems({
                                     items,
                                     onAddItem,
                                     onDeleteItem,
                                     className,
                                 }: InvoiceLineItemsProps) {
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div>
            {/* Header */}
            <div>
                <h3>
                    Line Items
                </h3>
                {onAddItem !== undefined && (
                    <Button outline onClick={onAddItem}>
                        <PlusIcon/>
                        Add Item
                    </Button>
                )}
            </div>

            {/* Content */}
            {items.length === 0 ? (
                <div>
                    <p>
                        No line items added yet.
                    </p>
                    {onAddItem !== undefined && (
                        <Button color="dark/zinc" onClick={onAddItem}>
                            <PlusIcon/>
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
                            <TableHeader>Qty/Hours</TableHeader>
                            <TableHeader>Rate</TableHeader>
                            <TableHeader>Amount</TableHeader>
                            {onDeleteItem !== undefined && (
                                <TableHeader>Actions</TableHeader>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {item.lineNumber ?? index + 1}
                                </TableCell>
                                <TableCell>
                                    {item.description}
                                </TableCell>
                                <TableCell>
                                    {item.lineType}
                                </TableCell>
                                <TableCell>
                                    {item.hours !== null
                                        ? `${item.hours} hrs`
                                        : item.quantity !== null
                                            ? item.quantity
                                            : '-'}
                                </TableCell>
                                <TableCell>
                                    {item.hourlyRate !== null
                                        ? formatCurrency(item.hourlyRate)
                                        : item.unitPrice !== null
                                            ? formatCurrency(item.unitPrice)
                                            : '-'}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(item.amount)}
                                </TableCell>
                                {onDeleteItem !== undefined && (
                                    <TableCell>
                                        <Button
                                            plain
                                            onClick={() => onDeleteItem(item.id)}
                                            aria-label="Delete line item"
                                        >
                                            <TrashIcon/>
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow>
                            <TableCell
                                colSpan={onDeleteItem !== undefined ? 5 : 4}
                            >
                                Total
                            </TableCell>
                            <TableCell>
                                {formatCurrency(totalAmount)}
                            </TableCell>
                            {onDeleteItem !== undefined && <TableCell>{' '}</TableCell>}
                        </TableRow>
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

export default InvoiceLineItems;
