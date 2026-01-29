import {useEffect, useState} from 'react';

import {Box, Card, CardBody, Flex, Stack} from '../../../components/catalyst/layout';
import {Button, Text} from '../../../components/catalyst/primitives';
import {PORTAL_LABELS} from '@/constants/labels';

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
    const [totals, setTotals] = useState({pending: 0, paid: 0});
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
            setTotals({pending, paid});

            setLoading(false);
        };
        loadInvoices();
    }, []);

    const getStatusTextClass = (status: Invoice['status']): string => {
        switch (status) {
            case 'draft':
                return 'text-zinc-500';
            case 'submitted':
                return 'text-blue-600';
            case 'approved':
                return 'text-emerald-500';
            case 'paid':
                return 'text-emerald-500';
            case 'rejected':
                return 'text-red-500';
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
                        <Text variant="heading5">{PORTAL_LABELS.INVOICE_SUMMARY}</Text>
                        <Button variant="primary" size="sm">Create Invoice</Button>
                    </Flex>

                    {/* Summary Cards */}
                    <Flex gap="md">
                        <Box>
                            <Text variant="caption" color="muted">Pending</Text>
                            <Text variant="heading4">
                                {loading === true ? '...' : formatCurrency(totals.pending)}
                            </Text>
                        </Box>
                        <Box>
                            <Text variant="caption" color="muted">Paid (This Month)</Text>
                            <Text variant="heading4">
                                {loading === true ? '...' : formatCurrency(totals.paid)}
                            </Text>
                        </Box>
                    </Flex>

                    {/* Recent Invoices */}
                    <Stack spacing="sm">
                        <Text variant="caption" color="muted" weight="semibold">
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
                                >
                                    <Stack spacing="0">
                                        <Text variant="body" weight="medium">{invoice.invoiceNumber}</Text>
                                        <Text variant="caption" color="muted">{invoice.contractNumber}</Text>
                                    </Stack>
                                    <Stack spacing="0">
                                        <Text variant="body" weight="semibold">{formatCurrency(invoice.amount)}</Text>
                                        <Text
                                            variant="caption"
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
