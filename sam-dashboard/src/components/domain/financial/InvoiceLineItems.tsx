/**
 * InvoiceLineItems - Table display of invoice line items
 */
import { Text, Button, PlusIcon, TrashIcon } from '../../primitives';
import {
  Card,
  CardHeader,
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
import type { InvoiceLineItemsProps } from './Financial.types';
import { formatCurrency } from '../../../services/financialService';

export function InvoiceLineItems({
  invoiceId,
  items,
  onAddItem,
  onDeleteItem,
  className,
  style,
}: InvoiceLineItemsProps) {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card variant="outlined" className={className} style={style}>
      <CardHeader>
        <HStack justify="between" align="center">
          <Text variant="heading6" weight="semibold">
            Line Items
          </Text>
          {onAddItem !== undefined && (
            <Button variant="outline" size="sm" onClick={onAddItem}>
              <HStack spacing="var(--spacing-1)" align="center">
                <PlusIcon size="sm" />
                <Text as="span" variant="bodySmall">
                  Add Item
                </Text>
              </HStack>
            </Button>
          )}
        </HStack>
      </CardHeader>

      <CardBody padding="none">
        {items.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            className="p-8"
          >
            <Text variant="body" color="muted">
              No line items added yet.
            </Text>
            {onAddItem !== undefined && (
              <Button
                variant="primary"
                size="sm"
                onClick={onAddItem}
                className="mt-3"
              >
                <HStack spacing="var(--spacing-1)" align="center">
                  <PlusIcon size="sm" />
                  <Text as="span" variant="bodySmall" color="white">
                    Add First Item
                  </Text>
                </HStack>
              </Button>
            )}
          </Flex>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>#</TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell align="right">Qty/Hours</TableHeaderCell>
                <TableHeaderCell align="right">Rate</TableHeaderCell>
                <TableHeaderCell align="right">Amount</TableHeaderCell>
                {onDeleteItem !== undefined && (
                  <TableHeaderCell align="center">Actions</TableHeaderCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Text variant="bodySmall">{item.lineNumber ?? index + 1}</Text>
                  </TableCell>
                  <TableCell>
                    <Text variant="bodySmall">{item.description}</Text>
                  </TableCell>
                  <TableCell>
                    <Text variant="bodySmall" color="muted">
                      {item.lineType}
                    </Text>
                  </TableCell>
                  <TableCell align="right">
                    <Text variant="bodySmall">
                      {item.hours !== null
                        ? `${item.hours} hrs`
                        : item.quantity !== null
                          ? item.quantity
                          : '-'}
                    </Text>
                  </TableCell>
                  <TableCell align="right">
                    <Text variant="bodySmall">
                      {item.hourlyRate !== null
                        ? formatCurrency(item.hourlyRate)
                        : item.unitPrice !== null
                          ? formatCurrency(item.unitPrice)
                          : '-'}
                    </Text>
                  </TableCell>
                  <TableCell align="right">
                    <Text variant="bodySmall" weight="medium">
                      {formatCurrency(item.amount)}
                    </Text>
                  </TableCell>
                  {onDeleteItem !== undefined && (
                    <TableCell align="center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteItem(item.id)}
                        aria-label="Delete line item"
                      >
                        <TrashIcon size="sm" color="danger" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow>
                <TableCell colSpan={onDeleteItem !== undefined ? 5 : 4} />
                <TableCell align="right">
                  <Text variant="body" weight="semibold">
                    {formatCurrency(totalAmount)}
                  </Text>
                </TableCell>
                {onDeleteItem !== undefined && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}

export default InvoiceLineItems;
