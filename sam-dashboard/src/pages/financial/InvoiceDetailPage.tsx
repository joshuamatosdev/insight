/**
 * InvoiceDetailPage - Single invoice detail view
 */
import { useState, useCallback, useEffect } from 'react';
import {
  Text,
  Button,
  Badge,
  TrashIcon,
  ChevronLeftIcon,
  CheckIcon,
} from '@/components/catalyst/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  Stack,
  HStack,
  Grid,
  GridItem,
  Flex,
  Box,
} from '@/components/catalyst/layout';
import { InvoiceLineItems } from '@/components/domain/financial';
import { useInvoice } from '@/hooks/useFinancial';
import {
  submitInvoice,
  approveInvoice,
  deleteInvoice,
  fetchInvoiceLineItems,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from '@/services/financialService';
import type { InvoiceLineItem } from '@/types/financial.types';

export interface InvoiceDetailPageProps {
  invoiceId: string;
  onBack?: () => void;
}

export function InvoiceDetailPage({ invoiceId, onBack }: InvoiceDetailPageProps) {
  const { invoice, isLoading, error, refresh } = useInvoice(invoiceId);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [isLoadingLineItems, setIsLoadingLineItems] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLineItems() {
      setIsLoadingLineItems(true);
      try {
        const items = await fetchInvoiceLineItems(invoiceId);
        setLineItems(items);
      } catch (err) {
        console.error('Failed to load line items:', err);
      } finally {
        setIsLoadingLineItems(false);
      }
    }
    loadLineItems();
  }, [invoiceId]);

  const handleSubmit = useCallback(async () => {
    if (window.confirm('Submit this invoice for payment?') === false) {
      return;
    }
    setActionError(null);
    try {
      await submitInvoice(invoiceId);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit invoice');
    }
  }, [invoiceId, refresh]);

  const handleApprove = useCallback(async () => {
    if (window.confirm('Approve this invoice?') === false) {
      return;
    }
    setActionError(null);
    try {
      await approveInvoice(invoiceId);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve invoice');
    }
  }, [invoiceId, refresh]);

  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this invoice?') === false) {
      return;
    }
    try {
      await deleteInvoice(invoiceId);
      if (onBack !== undefined) {
        onBack();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  }, [invoiceId, onBack]);

  if (isLoading) {
    return (
      <Section id="invoice-detail">
        <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
          <Text variant="body" color="muted">
            Loading invoice details...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (error !== null || invoice === null) {
    return (
      <Section id="invoice-detail">
        <Box
          style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            borderRadius: '0.375rem',
            border: '1px solid #ef4444',
          }}
        >
          <Text variant="body" color="danger">
            {error !== null ? error.message : 'Invoice not found'}
          </Text>
        </Box>
      </Section>
    );
  }

  const canSubmit = invoice.status === 'DRAFT';
  const canApprove = invoice.status === 'SUBMITTED';
  const canDelete = invoice.status === 'DRAFT';

  return (
    <Section id="invoice-detail">
      <SectionHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        icon={
          onBack !== undefined ? (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeftIcon size="md" />
            </Button>
          ) : undefined
        }
        actions={
          <HStack spacing="sm">
            {canSubmit && (
              <Button variant="primary" size="sm" onClick={handleSubmit}>
                <HStack spacing="xs" align="center">
                  <CheckIcon size="sm" />
                  <Text as="span" variant="bodySmall" color="white">
                    Submit
                  </Text>
                </HStack>
              </Button>
            )}
            {canApprove && (
              <Button variant="primary" size="sm" onClick={handleApprove}>
                <HStack spacing="xs" align="center">
                  <CheckIcon size="sm" />
                  <Text as="span" variant="bodySmall" color="white">
                    Approve
                  </Text>
                </HStack>
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <TrashIcon size="sm" color="danger" />
              </Button>
            )}
          </HStack>
        }
      />

      {actionError !== null && (
        <Box
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fef2f2',
            borderRadius: '0.375rem',
            border: '1px solid #ef4444',
          }}
        >
          <Text variant="bodySmall" color="danger">
            {actionError}
          </Text>
        </Box>
      )}

      <Stack spacing="lg">
        {/* Status & Contract Info */}
        <HStack spacing="md">
          <Badge variant={getStatusColor(invoice.status)} size="lg">
            {getStatusLabel(invoice.status)}
          </Badge>
          <Badge variant="secondary" size="md">
            {invoice.invoiceType}
          </Badge>
          {invoice.isOverdue && (
            <Badge variant="danger" size="md">
              Overdue
            </Badge>
          )}
        </HStack>

        {/* Main Info Cards */}
        <Grid columns={2} gap="md">
          {/* Invoice Details */}
          <GridItem>
            <Card variant="outlined">
              <CardHeader>
                <Text variant="heading6" weight="semibold">
                  Invoice Details
                </Text>
              </CardHeader>
              <CardBody>
                <Stack spacing="md">
                  <HStack justify="between">
                    <Text variant="bodySmall" color="muted">
                      Contract
                    </Text>
                    <Text variant="bodySmall" weight="medium">
                      {invoice.contractNumber}
                    </Text>
                  </HStack>
                  <HStack justify="between">
                    <Text variant="bodySmall" color="muted">
                      Invoice Date
                    </Text>
                    <Text variant="bodySmall" weight="medium">
                      {formatDate(invoice.invoiceDate)}
                    </Text>
                  </HStack>
                  <HStack justify="between">
                    <Text variant="bodySmall" color="muted">
                      Due Date
                    </Text>
                    <Text
                      variant="bodySmall"
                      weight="medium"
                      color={invoice.isOverdue ? 'danger' : undefined}
                    >
                      {formatDate(invoice.dueDate)}
                    </Text>
                  </HStack>
                  <HStack justify="between">
                    <Text variant="bodySmall" color="muted">
                      Performance Period
                    </Text>
                    <Text variant="bodySmall" weight="medium">
                      {invoice.periodStart !== null && invoice.periodEnd !== null
                        ? `${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`
                        : '-'}
                    </Text>
                  </HStack>
                  {invoice.submittedDate !== null && (
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Submitted Date
                      </Text>
                      <Text variant="bodySmall" weight="medium">
                        {formatDate(invoice.submittedDate)}
                      </Text>
                    </HStack>
                  )}
                  {invoice.paidDate !== null && (
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Paid Date
                      </Text>
                      <Text variant="bodySmall" weight="medium" color="success">
                        {formatDate(invoice.paidDate)}
                      </Text>
                    </HStack>
                  )}
                  {invoice.daysOutstanding !== null && invoice.daysOutstanding > 0 && (
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Days Outstanding
                      </Text>
                      <Text variant="bodySmall" weight="medium">
                        {invoice.daysOutstanding} days
                      </Text>
                    </HStack>
                  )}
                </Stack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Financial Summary */}
          <GridItem>
            <Card variant="outlined">
              <CardHeader>
                <Text variant="heading6" weight="semibold">
                  Financial Summary
                </Text>
              </CardHeader>
              <CardBody>
                <Stack spacing="md">
                  <HStack justify="between">
                    <Text variant="bodySmall" color="muted">
                      Subtotal
                    </Text>
                    <Text variant="bodySmall" weight="medium">
                      {formatCurrency(invoice.subtotal)}
                    </Text>
                  </HStack>
                  {invoice.adjustments !== 0 && (
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Adjustments
                      </Text>
                      <Text variant="bodySmall" weight="medium">
                        {formatCurrency(invoice.adjustments)}
                      </Text>
                    </HStack>
                  )}
                  {invoice.retainage > 0 && (
                    <HStack justify="between">
                      <Text variant="bodySmall" color="muted">
                        Retainage
                      </Text>
                      <Text variant="bodySmall" weight="medium">
                        {formatCurrency(invoice.retainage)}
                      </Text>
                    </HStack>
                  )}
                  <HStack
                    justify="between"
                    style={{
                      paddingTop: '0.5rem',
                      borderTop: '1px solid #e4e4e7',
                    }}
                  >
                    <Text variant="body" weight="semibold">
                      Total Amount
                    </Text>
                    <Text variant="heading5" weight="semibold" color="primary">
                      {formatCurrency(invoice.totalAmount)}
                    </Text>
                  </HStack>
                  {invoice.amountPaid > 0 && (
                    <>
                      <HStack justify="between">
                        <Text variant="bodySmall" color="muted">
                          Amount Paid
                        </Text>
                        <Text variant="bodySmall" weight="medium" color="success">
                          {formatCurrency(invoice.amountPaid)}
                        </Text>
                      </HStack>
                      <HStack justify="between">
                        <Text variant="body" weight="medium">
                          Balance Due
                        </Text>
                        <Text
                          variant="body"
                          weight="semibold"
                          color={invoice.balance > 0 ? 'warning' : 'success'}
                        >
                          {formatCurrency(invoice.balance)}
                        </Text>
                      </HStack>
                    </>
                  )}
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Payment Information */}
        {(invoice.paymentMethod !== null ||
          invoice.paymentReference !== null ||
          invoice.voucherNumber !== null) && (
          <Card variant="outlined">
            <CardHeader>
              <Text variant="heading6" weight="semibold">
                Payment Information
              </Text>
            </CardHeader>
            <CardBody>
              <Grid columns={3} gap="md">
                {invoice.paymentMethod !== null && (
                  <GridItem>
                    <Text variant="caption" color="muted" weight="medium">
                      Payment Method
                    </Text>
                    <Text variant="body">{invoice.paymentMethod}</Text>
                  </GridItem>
                )}
                {invoice.paymentReference !== null && (
                  <GridItem>
                    <Text variant="caption" color="muted" weight="medium">
                      Payment Reference
                    </Text>
                    <Text variant="body">{invoice.paymentReference}</Text>
                  </GridItem>
                )}
                {invoice.voucherNumber !== null && (
                  <GridItem>
                    <Text variant="caption" color="muted" weight="medium">
                      Voucher Number
                    </Text>
                    <Text variant="body">{invoice.voucherNumber}</Text>
                  </GridItem>
                )}
              </Grid>
            </CardBody>
          </Card>
        )}

        {/* Line Items */}
        {isLoadingLineItems === false && (
          <InvoiceLineItems
            invoiceId={invoiceId}
            items={lineItems.map((item) => ({
              id: item.id,
              lineNumber: item.lineNumber,
              description: item.description,
              lineType: item.lineType,
              hours: item.hours,
              hourlyRate: item.hourlyRate,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
            }))}
          />
        )}

        {/* Notes */}
        {invoice.notes !== null && invoice.notes.length > 0 && (
          <Card variant="outlined">
            <CardHeader>
              <Text variant="heading6" weight="semibold">
                Notes
              </Text>
            </CardHeader>
            <CardBody>
              <Text variant="body">{invoice.notes}</Text>
            </CardBody>
          </Card>
        )}
      </Stack>
    </Section>
  );
}

export default InvoiceDetailPage;
