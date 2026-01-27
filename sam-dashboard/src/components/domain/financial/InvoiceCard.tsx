/**
 * InvoiceCard - Displays invoice summary
 */
import { Text, Badge, Button, FileTextIcon, PencilIcon, TrashIcon } from '../../primitives';
import { Card, CardHeader, CardBody, CardFooter, Stack, HStack, Grid, GridItem } from '../../layout';
import type { InvoiceCardProps } from './Financial.types';
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from '../../../services/financialService';

export function InvoiceCard({
  invoice,
  onView,
  onSubmit,
  onDelete,
  className,
  style,
}: InvoiceCardProps) {
  const canSubmit = invoice.status === 'DRAFT';
  const canDelete = invoice.status === 'DRAFT';

  return (
    <Card variant="outlined" className={className} style={style}>
      <CardHeader>
        <HStack justify="between" align="start">
          <HStack spacing="var(--spacing-2)" align="center">
            <FileTextIcon size="sm" color="primary" />
            <Stack spacing="0">
              <Text variant="heading6" weight="semibold">
                {invoice.invoiceNumber}
              </Text>
              <Text variant="caption" color="muted">
                {invoice.contractNumber}
              </Text>
            </Stack>
          </HStack>
          <Badge variant={getStatusColor(invoice.status)} size="sm">
            {getStatusLabel(invoice.status)}
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody>
        <Stack spacing="var(--spacing-3)">
          {/* Invoice Details */}
          <Grid columns="1fr 1fr" gap="var(--spacing-3)">
            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Invoice Date
              </Text>
              <Text variant="bodySmall">{formatDate(invoice.invoiceDate)}</Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Due Date
              </Text>
              <Text
                variant="bodySmall"
                color={invoice.isOverdue ? 'danger' : undefined}
              >
                {formatDate(invoice.dueDate)}
                {invoice.isOverdue && ' (Overdue)'}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Period
              </Text>
              <Text variant="bodySmall">
                {invoice.periodStart !== null && invoice.periodEnd !== null
                  ? `${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`
                  : '-'}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Type
              </Text>
              <Text variant="bodySmall">{invoice.invoiceType}</Text>
            </GridItem>
          </Grid>

          {/* Amounts */}
          <Stack
            spacing="var(--spacing-2)"
            style={{
              paddingTop: 'var(--spacing-3)',
              borderTop: '1px solid var(--color-gray-200)',
            }}
          >
            <HStack justify="between">
              <Text variant="bodySmall" color="muted">
                Subtotal
              </Text>
              <Text variant="bodySmall">{formatCurrency(invoice.subtotal)}</Text>
            </HStack>
            {invoice.adjustments !== 0 && (
              <HStack justify="between">
                <Text variant="bodySmall" color="muted">
                  Adjustments
                </Text>
                <Text variant="bodySmall">{formatCurrency(invoice.adjustments)}</Text>
              </HStack>
            )}
            <HStack justify="between">
              <Text variant="body" weight="semibold">
                Total
              </Text>
              <Text variant="body" weight="semibold" color="primary">
                {formatCurrency(invoice.totalAmount)}
              </Text>
            </HStack>
            {invoice.amountPaid > 0 && (
              <>
                <HStack justify="between">
                  <Text variant="bodySmall" color="muted">
                    Paid
                  </Text>
                  <Text variant="bodySmall" color="success">
                    {formatCurrency(invoice.amountPaid)}
                  </Text>
                </HStack>
                <HStack justify="between">
                  <Text variant="bodySmall" weight="medium">
                    Balance
                  </Text>
                  <Text
                    variant="bodySmall"
                    weight="medium"
                    color={invoice.balance > 0 ? 'warning' : 'success'}
                  >
                    {formatCurrency(invoice.balance)}
                  </Text>
                </HStack>
              </>
            )}
          </Stack>

          {/* Days Outstanding */}
          {invoice.daysOutstanding !== null && invoice.daysOutstanding > 0 && (
            <Text variant="caption" color="muted">
              {invoice.daysOutstanding} days outstanding
            </Text>
          )}
        </Stack>
      </CardBody>

      <CardFooter>
        <HStack justify="between" align="center">
          {canSubmit && onSubmit !== undefined && (
            <Button variant="primary" size="sm" onClick={() => onSubmit(invoice.id)}>
              Submit
            </Button>
          )}
          {!canSubmit && <span />}

          <HStack spacing="var(--spacing-2)">
            {onView !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(invoice)}
                aria-label="View invoice"
              >
                <PencilIcon size="sm" />
              </Button>
            )}
            {canDelete && onDelete !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(invoice.id)}
                aria-label="Delete invoice"
              >
                <TrashIcon size="sm" color="danger" />
              </Button>
            )}
          </HStack>
        </HStack>
      </CardFooter>
    </Card>
  );
}

export default InvoiceCard;
