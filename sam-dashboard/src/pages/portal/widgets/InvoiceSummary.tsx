import { useState, useEffect } from 'react';
import { Card, CardBody, Stack, Flex, Box } from '../../../components/catalyst/layout';
import { Text, Button } from '../../../components/catalyst/primitives';

interface Invoice {
  id: string;
  invoiceNumber: string;
  contractNumber: string;
  amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'rejected';
  dueDate: string;
}

/**
 * Widget showing invoice summary and recent invoices.
 */
export function InvoiceSummary(): React.ReactElement {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totals, setTotals] = useState({ pending: 0, paid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const invoiceData: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-0042',
          contractNumber: 'FA8773-24-C-0001',
          amount: 45000,
          status: 'submitted',
          dueDate: '2024-02-15',
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-0041',
          contractNumber: 'W912DQ-23-D-0045',
          amount: 78500,
          status: 'approved',
          dueDate: '2024-02-10',
        },
        {
          id: '3',
          invoiceNumber: 'INV-2024-0040',
          contractNumber: 'GS-35F-0123X',
          amount: 32000,
          status: 'paid',
          dueDate: '2024-01-31',
        },
      ];
      setInvoices(invoiceData);
      
      const pending = invoiceData
        .filter((i) => i.status === 'submitted' || i.status === 'approved')
        .reduce((sum, i) => sum + i.amount, 0);
      const paid = invoiceData
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + i.amount, 0);
      setTotals({ pending, paid });
      
      setLoading(false);
    };
    loadInvoices();
  }, []);

  const getStatusColor = (status: Invoice['status']): string => {
    switch (status) {
      case 'draft':
        return '#71717a';
      case 'submitted':
        return '#2563eb';
      case 'approved':
        return '#10b981';
      case 'paid':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card variant="bordered">
      <CardBody padding="md">
        <Stack spacing="md">
          <Flex justify="space-between" align="center">
            <Text variant="heading5">Invoice Summary</Text>
            <Button variant="primary" size="sm">Create Invoice</Button>
          </Flex>

          {/* Summary Cards */}
          <Flex gap="md">
            <Box
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#fffbeb',
                borderRadius: '8px',
              }}
            >
              <Text variant="caption" color="muted">Pending</Text>
              <Text variant="heading4" style={{ color: 'rgb(245 158 11)' }}>
                {loading ? '...' : formatCurrency(totals.pending)}
              </Text>
            </Box>
            <Box
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#ecfdf5',
                borderRadius: '8px',
              }}
            >
              <Text variant="caption" color="muted">Paid (This Month)</Text>
              <Text variant="heading4" style={{ color: 'rgb(16 185 129)' }}>
                {loading ? '...' : formatCurrency(totals.paid)}
              </Text>
            </Box>
          </Flex>

          {/* Recent Invoices */}
          <Stack spacing="sm">
            <Text variant="caption" color="muted" style={{ fontWeight: 600 }}>
              Recent Invoices
            </Text>
            {loading === true ? (
              <Text variant="caption">Loading...</Text>
            ) : (
              invoices.map((invoice) => (
                <Flex
                  key={invoice.id}
                  justify="space-between"
                  align="center"
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#fafafa',
                    borderRadius: '6px',
                  }}
                >
                  <Stack spacing="0">
                    <Text variant="body" style={{ fontWeight: 500 }}>{invoice.invoiceNumber}</Text>
                    <Text variant="caption" color="muted">{invoice.contractNumber}</Text>
                  </Stack>
                  <Stack spacing="0" style={{ textAlign: 'right' }}>
                    <Text variant="body" style={{ fontWeight: 600 }}>{formatCurrency(invoice.amount)}</Text>
                    <Text
                      variant="caption"
                      style={{ color: getStatusColor(invoice.status), textTransform: 'capitalize' }}
                    >
                      {invoice.status}
                    </Text>
                  </Stack>
                </Flex>
              ))
            )}
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default InvoiceSummary;
