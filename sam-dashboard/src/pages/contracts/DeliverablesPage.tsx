import {useCallback, useState} from 'react';
import {
    Button,
    ChevronLeftIcon,
    FormField,
    InlineAlert,
    InlineAlertDescription,
    InlineAlertTitle,
    Input,
    PlusIcon,
    Select,
    Text
} from '../../components/catalyst/primitives';
import {
    Box,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Flex,
    Grid,
    GridItem,
    HStack,
    Section,
    SectionHeader
} from '../../components/catalyst/layout';
import type {
    CreateDeliverableRequest,
    DeliverableFrequency,
    DeliverableStatus,
    DeliverableType,
} from '../../components/domain/contracts';
import {DeliverableTracker} from '../../components/domain/contracts';
import {useContract} from '../../hooks/useContracts';

export interface DeliverablesPageProps {
    contractId: string;
    onBack?: () => void;
}

const DELIVERABLE_TYPE_OPTIONS: Array<{ value: DeliverableType; label: string }> = [
    {value: 'REPORT', label: 'Report'},
    {value: 'DATA', label: 'Data'},
    {value: 'SOFTWARE', label: 'Software'},
    {value: 'DOCUMENTATION', label: 'Documentation'},
    {value: 'HARDWARE', label: 'Hardware'},
    {value: 'SERVICES', label: 'Services'},
    {value: 'MILESTONE', label: 'Milestone'},
    {value: 'STATUS_REPORT', label: 'Status Report'},
    {value: 'FINANCIAL_REPORT', label: 'Financial Report'},
    {value: 'TECHNICAL_REPORT', label: 'Technical Report'},
    {value: 'OTHER', label: 'Other'},
];

const FREQUENCY_OPTIONS: Array<{ value: DeliverableFrequency | ''; label: string }> = [
    {value: '', label: 'Select...'},
    {value: 'ONE_TIME', label: 'One-time'},
    {value: 'DAILY', label: 'Daily'},
    {value: 'WEEKLY', label: 'Weekly'},
    {value: 'BI_WEEKLY', label: 'Bi-weekly'},
    {value: 'MONTHLY', label: 'Monthly'},
    {value: 'QUARTERLY', label: 'Quarterly'},
    {value: 'SEMI_ANNUALLY', label: 'Semi-annually'},
    {value: 'ANNUALLY', label: 'Annually'},
    {value: 'AS_REQUIRED', label: 'As Required'},
];

interface DeliverableFormState {
    cdrlNumber: string;
    title: string;
    description: string;
    deliverableType: DeliverableType;
    dueDate: string;
    frequency: DeliverableFrequency | '';
    notes: string;
}

export function DeliverablesPage({contractId, onBack}: DeliverablesPageProps) {
    const {
        contract,
        deliverables,
        isLoading,
        error,
        addDeliverable,
        updateDeliverableStatusAction,
        refresh,
    } = useContract(contractId);

    const [showAddForm, setShowAddForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formState, setFormState] = useState<DeliverableFormState>({
        cdrlNumber: '',
        title: '',
        description: '',
        deliverableType: 'REPORT',
        dueDate: '',
        frequency: 'ONE_TIME',
        notes: '',
    });

    const handleChange = useCallback(
        (field: keyof DeliverableFormState) =>
            (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                setFormState((prev) => ({
                    ...prev,
                    [field]: event.target.value,
                }));
            },
        []
    );

    const handleSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault();

            if (formState.title.trim().length === 0) {
                return;
            }

            const data: CreateDeliverableRequest = {
                cdrlNumber: formState.cdrlNumber.length > 0 ? formState.cdrlNumber : undefined,
                title: formState.title,
                description: formState.description.length > 0 ? formState.description : undefined,
                deliverableType: formState.deliverableType,
                dueDate: formState.dueDate.length > 0 ? formState.dueDate : undefined,
                frequency: formState.frequency.length > 0 ? (formState.frequency as DeliverableFrequency) : undefined,
                notes: formState.notes.length > 0 ? formState.notes : undefined,
            };

            setIsSaving(true);
            const result = await addDeliverable(data);
            setIsSaving(false);

            if (result !== null) {
                setShowAddForm(false);
                setFormState({
                    cdrlNumber: '',
                    title: '',
                    description: '',
                    deliverableType: 'REPORT',
                    dueDate: '',
                    frequency: 'ONE_TIME',
                    notes: '',
                });
                refresh();
            }
        },
        [formState, addDeliverable, refresh]
    );

    const handleStatusChange = useCallback(
        async (deliverableId: string, status: DeliverableStatus) => {
            await updateDeliverableStatusAction(deliverableId, status);
        },
        [updateDeliverableStatusAction]
    );

    const handleCancelForm = useCallback(() => {
        setShowAddForm(false);
    }, []);

    if (isLoading) {
        return (
            <Section>
                <Flex justify="center" align="center">
                    <Text variant="body" color="muted">
                        Loading deliverables...
                    </Text>
                </Flex>
            </Section>
        );
    }

    if (error !== null || contract === null) {
        return (
            <Section>
                <InlineAlert color="error">
                    <InlineAlertTitle>Error</InlineAlertTitle>
                    <InlineAlertDescription>
                        {error !== null ? error.message : 'Contract not found'}
                    </InlineAlertDescription>
                </InlineAlert>
                {onBack !== undefined && (
                    <Box>
                        <Button variant="secondary" onClick={onBack}>
                            Back
                        </Button>
                    </Box>
                )}
            </Section>
        );
    }

    return (
        <Section>
            <SectionHeader>
                <HStack justify="between" align="center">
                    <Box>
                        {onBack !== undefined && (
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<ChevronLeftIcon size="sm"/>}
                                onClick={onBack}
                            >
                                Back to Contract
                            </Button>
                        )}
                        <Text variant="heading3">Deliverables - {contract.contractNumber}</Text>
                        <Text variant="body" color="muted">
                            {contract.title}
                        </Text>
                    </Box>
                    <Button
                        variant="primary"
                        leftIcon={<PlusIcon size="sm"/>}
                        onClick={() => setShowAddForm(true)}
                    >
                        Add Deliverable
                    </Button>
                </HStack>
            </SectionHeader>

            {showAddForm && (
                <Card>
                    <Box as="form" onSubmit={handleSubmit}>
                        <CardHeader>
                            <Text variant="heading4">Add Deliverable</Text>
                        </CardHeader>
                        <CardBody>
                            <Grid columns={2} gap="md">
                                <FormField label="CDRL Number" id="cdrlNumber">
                                    <Input
                                        value={formState.cdrlNumber}
                                        onChange={handleChange('cdrlNumber')}
                                        disabled={isSaving}
                                        placeholder="e.g., A001"
                                    />
                                </FormField>
                                <FormField label="Type" id="deliverableType" required>
                                    <Select
                                        value={formState.deliverableType}
                                        onChange={handleChange('deliverableType')}
                                        disabled={isSaving}
                                        options={DELIVERABLE_TYPE_OPTIONS}
                                    />
                                </FormField>
                                <GridItem colSpan={2}>
                                    <FormField label="Title" id="title" required>
                                        <Input
                                            value={formState.title}
                                            onChange={handleChange('title')}
                                            disabled={isSaving}
                                            placeholder="Deliverable title"
                                            required
                                        />
                                    </FormField>
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <FormField label="Description" id="description">
                                        <Input
                                            value={formState.description}
                                            onChange={handleChange('description')}
                                            disabled={isSaving}
                                            placeholder="Deliverable description"
                                        />
                                    </FormField>
                                </GridItem>
                                <FormField label="Due Date" id="dueDate">
                                    <Input
                                        type="date"
                                        value={formState.dueDate}
                                        onChange={handleChange('dueDate')}
                                        disabled={isSaving}
                                    />
                                </FormField>
                                <FormField label="Frequency" id="frequency">
                                    <Select
                                        value={formState.frequency}
                                        onChange={handleChange('frequency')}
                                        disabled={isSaving}
                                        options={FREQUENCY_OPTIONS}
                                    />
                                </FormField>
                                <GridItem colSpan={2}>
                                    <FormField label="Notes" id="notes">
                                        <Input
                                            value={formState.notes}
                                            onChange={handleChange('notes')}
                                            disabled={isSaving}
                                            placeholder="Additional notes"
                                        />
                                    </FormField>
                                </GridItem>
                            </Grid>
                        </CardBody>
                        <CardFooter>
                            <HStack justify="end" spacing="md">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCancelForm}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={isSaving}>
                                    {isSaving ? 'Adding...' : 'Add Deliverable'}
                                </Button>
                            </HStack>
                        </CardFooter>
                    </Box>
                </Card>
            )}

            <DeliverableTracker deliverables={deliverables} onStatusChange={handleStatusChange}/>
        </Section>
    );
}

export default DeliverablesPage;
