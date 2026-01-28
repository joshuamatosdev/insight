/**
 * InvoicesPage - Invoice management list page
 */
import {useCallback, useState} from 'react';
import {
    Badge,
    Button,
    FileTextIcon,
    InlineAlert,
    InlineAlertDescription,
    PlusIcon,
    RefreshIcon,
    Text
} from '@/components/catalyst/primitives';
import {
    Card,
    CardBody,
    CardHeader,
    Flex,
    Grid,
    GridItem,
    HStack,
    Section,
    SectionHeader,
    Stack,
} from '@/components/catalyst/layout';
import {InvoiceCard, InvoiceForm} from '@/components/domain/financial';
import {useInvoices} from '@/hooks/useFinancial';
import type {Invoice, InvoiceFormState, InvoiceStatus, InvoiceType} from '@/types/financial.types';

const INITIAL_FORM_STATE: InvoiceFormState = {
    contractId: '',
    invoiceNumber: '',
    invoiceType: 'PROGRESS',
    invoiceDate: new Date().toISOString().split('T').at(0) ?? '',
    periodStart: '',
    periodEnd: '',
    dueDate: '',
    notes: '',
};

const STATUS_FILTERS: Array<{ value: InvoiceStatus | ''; label: string }> = [
    {value: '', label: 'All'},
    {value: 'DRAFT', label: 'Draft'},
    {value: 'SUBMITTED', label: 'Submitted'},
    {value: 'APPROVED', label: 'Approved'},
    {value: 'PAID', label: 'Paid'},
    {value: 'REJECTED', label: 'Rejected'},
];

// Mock contracts for demo - in real app, fetch from API
const MOCK_CONTRACTS = [
    {id: '1', contractNumber: 'FA8650-21-C-1234'},
    {id: '2', contractNumber: 'W911NF-22-D-0001'},
    {id: '3', contractNumber: 'N00014-23-C-5678'},
];

export interface InvoicesPageProps {
    onViewInvoice?: (id: string) => void;
}

export function InvoicesPage({onViewInvoice}: InvoicesPageProps) {
    const {
        invoices,
        totalElements,
        totalPages,
        currentPage,
        isLoading,
        error,
        loadInvoices,
        loadInvoicesByStatus,
        loadOverdueInvoices,
        createNewInvoice,
        submitInvoiceById,
        deleteInvoiceById,
        refresh,
    } = useInvoices();

    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');

    const handleCreateClick = useCallback(() => {
        setShowForm(true);
    }, []);

    const handleCancelForm = useCallback(() => {
        setShowForm(false);
    }, []);

    const handleSubmitForm = useCallback(
        async (formData: InvoiceFormState) => {
            setIsSubmitting(true);
            try {
                await createNewInvoice({
                    contractId: formData.contractId,
                    invoiceNumber: formData.invoiceNumber,
                    invoiceType: formData.invoiceType as InvoiceType,
                    invoiceDate: formData.invoiceDate,
                    periodStart: formData.periodStart.length > 0 ? formData.periodStart : undefined,
                    periodEnd: formData.periodEnd.length > 0 ? formData.periodEnd : undefined,
                    dueDate: formData.dueDate.length > 0 ? formData.dueDate : undefined,
                    notes: formData.notes.length > 0 ? formData.notes : undefined,
                });
                setShowForm(false);
            } catch (err) {
                console.error('Failed to create invoice:', err);
            } finally {
                setIsSubmitting(false);
            }
        },
        [createNewInvoice]
    );

    const handleViewInvoice = useCallback(
        (invoice: Invoice) => {
            if (onViewInvoice !== undefined) {
                onViewInvoice(invoice.id);
            }
        },
        [onViewInvoice]
    );

    const handleSubmitInvoice = useCallback(
        async (id: string) => {
            if (window.confirm('Submit this invoice for payment?') === false) {
                return;
            }
            try {
                await submitInvoiceById(id);
            } catch (err) {
                console.error('Failed to submit invoice:', err);
            }
        },
        [submitInvoiceById]
    );

    const handleDeleteInvoice = useCallback(
        async (id: string) => {
            if (window.confirm('Are you sure you want to delete this invoice?') === false) {
                return;
            }
            try {
                await deleteInvoiceById(id);
            } catch (err) {
                console.error('Failed to delete invoice:', err);
            }
        },
        [deleteInvoiceById]
    );

    const handleFilterChange = useCallback(
        (status: InvoiceStatus | '') => {
            setStatusFilter(status);
            if (status === '') {
                loadInvoices(0);
            } else {
                loadInvoicesByStatus(status);
            }
        },
        [loadInvoices, loadInvoicesByStatus]
    );

    const handleShowOverdue = useCallback(() => {
        setStatusFilter('');
        loadOverdueInvoices();
    }, [loadOverdueInvoices]);

    const handlePageChange = useCallback(
        (page: number) => {
            if (statusFilter === '') {
                loadInvoices(page);
            } else {
                loadInvoicesByStatus(statusFilter, page);
            }
        },
        [loadInvoices, loadInvoicesByStatus, statusFilter]
    );

    if (isLoading && invoices.length === 0) {
        return (
            <Section id="invoices">
                <Flex justify="center" align="center">
                    <Text variant="body" color="muted">
                        Loading invoices...
                    </Text>
                </Flex>
            </Section>
        );
    }

    return (
        <Section id="invoices">
            <SectionHeader
                title="Invoices"
                icon={<FileTextIcon size="lg"/>}
                actions={
                    showForm === false && (
                        <HStack spacing="sm">
                            <Button variant="ghost" size="sm" onClick={handleShowOverdue}>
                                <Badge color="red">
                                    Overdue
                                </Badge>
                            </Button>
                            <Button variant="outline" size="sm" onClick={refresh}>
                                <RefreshIcon size="sm"/>
                            </Button>
                            <Button variant="primary" onClick={handleCreateClick}>
                                <HStack spacing="xs" align="center">
                                    <PlusIcon size="sm"/>
                                    <Text as="span" variant="bodySmall" color="white">
                                        New Invoice
                                    </Text>
                                </HStack>
                            </Button>
                        </HStack>
                    )
                }
            />

            {error !== null && (
                <InlineAlert color="error">
                    <InlineAlertDescription>{error.message}</InlineAlertDescription>
                </InlineAlert>
            )}

            {/* Form */}
            {showForm && (
                <Card variant="elevated">
                    <CardHeader>
                        <Text variant="heading5">Create New Invoice</Text>
                    </CardHeader>
                    <CardBody>
                        <InvoiceForm
                            initialData={INITIAL_FORM_STATE}
                            onSubmit={handleSubmitForm}
                            onCancel={handleCancelForm}
                            isSubmitting={isSubmitting}
                            contracts={MOCK_CONTRACTS}
                        />
                    </CardBody>
                </Card>
            )}

            {/* Status Filter */}
            <Stack spacing="md">
                <HStack spacing="sm">
                    {STATUS_FILTERS.map((filter) => (
                        <Button
                            key={filter.value}
                            variant={statusFilter === filter.value ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleFilterChange(filter.value)}
                        >
                            {filter.label}
                        </Button>
                    ))}
                </HStack>

                {/* Invoice Grid */}
                {invoices.length === 0 ? (
                    <Card variant="outlined">
                        <CardBody>
                            <Flex
                                direction="column"
                                align="center"
                                gap="md"
                            >
                                <FileTextIcon size="xl" color="muted"/>
                                <Stack spacing="xs">
                                    <Text variant="body" color="muted">
                                        No invoices found.
                                    </Text>
                                    <Text variant="body" color="muted">
                                        Create an invoice to start billing your contracts.
                                    </Text>
                                </Stack>
                                <Button variant="primary" onClick={handleCreateClick}>
                                    <HStack spacing="xs" align="center">
                                        <PlusIcon size="sm"/>
                                        <Text as="span" variant="bodySmall" color="white">
                                            Create First Invoice
                                        </Text>
                                    </HStack>
                                </Button>
                            </Flex>
                        </CardBody>
                    </Card>
                ) : (
                    <Stack spacing="lg">
                        <Grid columns="repeat(auto-fill, minmax(380px, 1fr))" gap="md">
                            {invoices.map((invoice) => (
                                <GridItem key={invoice.id}>
                                    <InvoiceCard
                                        invoice={invoice}
                                        onView={handleViewInvoice}
                                        onSubmit={handleSubmitInvoice}
                                        onDelete={handleDeleteInvoice}
                                    />
                                </GridItem>
                            ))}
                        </Grid>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <HStack justify="center" spacing="sm">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    isDisabled={currentPage === 0}
                                >
                                    Previous
                                </Button>
                                <Text variant="bodySmall" color="muted">
                                    Page {currentPage + 1} of {totalPages} ({totalElements} invoices)
                                </Text>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    isDisabled={currentPage >= totalPages - 1}
                                >
                                    Next
                                </Button>
                            </HStack>
                        )}
                    </Stack>
                )}
            </Stack>
        </Section>
    );
}

export default InvoicesPage;
