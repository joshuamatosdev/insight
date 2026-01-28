import {ChangeEvent, FormEvent, useCallback, useEffect, useState} from 'react';
import {
    Badge,
    BellIcon,
    Button,
    Input,
    PencilIcon,
    PlusIcon,
    Select,
    Text,
    TrashIcon,
} from '../components/catalyst/primitives';
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
    SectionHeader,
    Stack,
} from '../components/catalyst/layout';
import {
    createOpportunityAlert,
    deleteOpportunityAlert,
    fetchOpportunityAlerts,
    toggleOpportunityAlert,
    updateOpportunityAlert,
} from '../services/alertService';
import {useIsPortalUser} from '../hooks';
import type {
    AlertFormErrors,
    AlertFormState,
    ContractAlert,
    ContractAlertFormErrors,
    ContractAlertFormState,
    ContractAlertType,
    CreateAlertRequest,
    OpportunityAlert,
    UpdateAlertRequest,
} from './AlertsPage.types';

const INITIAL_FORM_STATE: AlertFormState = {
    name: '',
    description: '',
    naicsCodes: [],
    keywords: [],
    minValue: '',
    maxValue: '',
    enabled: true,
};

const INITIAL_CONTRACT_FORM_STATE: ContractAlertFormState = {
    name: '',
    description: '',
    alertType: 'DELIVERABLE_DUE',
    contractId: '',
    daysBeforeReminder: '7',
    enabled: true,
};

/**
 * Contract alert type options
 */
const CONTRACT_ALERT_TYPE_OPTIONS = [
    {value: 'DELIVERABLE_DUE', label: 'Deliverable Due'},
    {value: 'MILESTONE_APPROACHING', label: 'Milestone Approaching'},
    {value: 'INVOICE_OVERDUE', label: 'Invoice Overdue'},
    {value: 'CONTRACT_EXPIRING', label: 'Contract Expiring'},
];

/**
 * Days before reminder options
 */
const DAYS_BEFORE_OPTIONS = [
    {value: '1', label: '1 day before'},
    {value: '3', label: '3 days before'},
    {value: '7', label: '7 days before'},
    {value: '14', label: '14 days before'},
    {value: '30', label: '30 days before'},
];

/**
 * Validates the opportunity alert form
 */
function validateForm(form: AlertFormState): AlertFormErrors {
    const errors: AlertFormErrors = {};

    if (form.name.trim().length === 0) {
        errors.name = 'Alert name is required';
    } else if (form.name.length > 100) {
        errors.name = 'Alert name must be less than 100 characters';
    }

    if (form.naicsCodes.length === 0 && form.keywords.length === 0) {
        errors.general = 'At least one NAICS code or keyword is required';
    }

    if (form.minValue !== '' && isNaN(Number(form.minValue))) {
        errors.minValue = 'Minimum value must be a valid number';
    }

    if (form.maxValue !== '' && isNaN(Number(form.maxValue))) {
        errors.maxValue = 'Maximum value must be a valid number';
    }

    if (
        form.minValue !== '' &&
        form.maxValue !== '' &&
        Number(form.minValue) > Number(form.maxValue)
    ) {
        errors.minValue = 'Minimum value cannot be greater than maximum value';
    }

    return errors;
}

/**
 * Validates the contract alert form
 */
function validateContractForm(form: ContractAlertFormState): ContractAlertFormErrors {
    const errors: ContractAlertFormErrors = {};

    if (form.name.trim().length === 0) {
        errors.name = 'Alert name is required';
    } else if (form.name.length > 100) {
        errors.name = 'Alert name must be less than 100 characters';
    }

    if (form.daysBeforeReminder === '' || isNaN(Number(form.daysBeforeReminder))) {
        errors.daysBeforeReminder = 'Days before reminder is required';
    }

    return errors;
}

/**
 * Parses comma-separated string into array of trimmed values
 */
function parseCommaSeparated(value: string): string[] {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

/**
 * Formats array to comma-separated string
 */
function formatCommaSeparated(arr: string[]): string {
    return arr.join(', ');
}

/**
 * Formats number value for display
 */
function formatCurrency(value: number | null): string {
    if (value === null) return '-';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Formats date for display
 */
function formatDate(dateString: string | null): string {
    if (dateString === null) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Gets label for contract alert type
 */
function getContractAlertTypeLabel(type: ContractAlertType): string {
    const option = CONTRACT_ALERT_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option?.label ?? type;
}

/**
 * Opportunity Alert Card Component (Intelligence Users)
 */
function OpportunityAlertCard({
    alert,
    onEdit,
    onDelete,
    onToggle,
}: {
    alert: OpportunityAlert;
    onEdit: (alert: OpportunityAlert) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}) {
    return (
        <Card variant="default">
            <CardHeader>
                <HStack justify="between" align="center">
                    <HStack spacing="sm" align="center">
                        <BellIcon
                            size="sm"
                            color={alert.enabled ? 'primary' : 'muted'}
                        />
                        <Text variant="heading6" weight="semibold">
                            {alert.name}
                        </Text>
                    </HStack>
                    <Badge
                        variant={alert.enabled ? 'success' : 'secondary'}
                        size="sm"
                    >
                        {alert.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                </HStack>
            </CardHeader>

            <CardBody>
                <Stack spacing="md">
                    {alert.description !== null && alert.description.length > 0 && (
                        <Text variant="bodySmall" color="muted">
                            {alert.description}
                        </Text>
                    )}

                    <Grid columns="1fr 1fr" gap="md">
                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                NAICS Codes
                            </Text>
                            <Text variant="bodySmall">
                                {alert.naicsCodes.length > 0
                                    ? alert.naicsCodes.join(', ')
                                    : 'Any'}
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Keywords
                            </Text>
                            <Text variant="bodySmall">
                                {alert.keywords.length > 0
                                    ? alert.keywords.join(', ')
                                    : 'Any'}
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Value Range
                            </Text>
                            <Text variant="bodySmall">
                                {alert.minValue !== null || alert.maxValue !== null
                                    ? `${formatCurrency(alert.minValue)} - ${formatCurrency(alert.maxValue)}`
                                    : 'Any'}
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Created
                            </Text>
                            <Text variant="bodySmall">{formatDate(alert.createdAt)}</Text>
                        </GridItem>
                    </Grid>
                </Stack>
            </CardBody>

            <CardFooter>
                <HStack justify="between" align="center">
                    <Button
                        variant={alert.enabled ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => onToggle(alert.id)}
                    >
                        {alert.enabled ? 'Disable' : 'Enable'}
                    </Button>

                    <HStack spacing="sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(alert)}
                            aria-label="Edit alert"
                        >
                            <PencilIcon size="sm"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(alert.id)}
                            aria-label="Delete alert"
                        >
                            <TrashIcon size="sm" color="danger"/>
                        </Button>
                    </HStack>
                </HStack>
            </CardFooter>
        </Card>
    );
}

/**
 * Contract Alert Card Component (Portal Users)
 */
function ContractAlertCard({
    alert,
    onEdit,
    onDelete,
    onToggle,
}: {
    alert: ContractAlert;
    onEdit: (alert: ContractAlert) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}) {
    return (
        <Card variant="default">
            <CardHeader>
                <HStack justify="between" align="center">
                    <HStack spacing="sm" align="center">
                        <BellIcon
                            size="sm"
                            color={alert.enabled ? 'primary' : 'muted'}
                        />
                        <Text variant="heading6" weight="semibold">
                            {alert.name}
                        </Text>
                    </HStack>
                    <Badge
                        variant={alert.enabled ? 'success' : 'secondary'}
                        size="sm"
                    >
                        {alert.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                </HStack>
            </CardHeader>

            <CardBody>
                <Stack spacing="md">
                    {alert.description !== null && alert.description.length > 0 && (
                        <Text variant="bodySmall" color="muted">
                            {alert.description}
                        </Text>
                    )}

                    <Grid columns="1fr 1fr" gap="md">
                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Alert Type
                            </Text>
                            <Badge variant="info" size="sm">
                                {getContractAlertTypeLabel(alert.alertType)}
                            </Badge>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Contract
                            </Text>
                            <Text variant="bodySmall">
                                {alert.contractName ?? 'All Contracts'}
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Reminder
                            </Text>
                            <Text variant="bodySmall">
                                {alert.daysBeforeReminder} days before
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Created
                            </Text>
                            <Text variant="bodySmall">{formatDate(alert.createdAt)}</Text>
                        </GridItem>
                    </Grid>
                </Stack>
            </CardBody>

            <CardFooter>
                <HStack justify="between" align="center">
                    <Button
                        variant={alert.enabled ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => onToggle(alert.id)}
                    >
                        {alert.enabled ? 'Disable' : 'Enable'}
                    </Button>

                    <HStack spacing="sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(alert)}
                            aria-label="Edit alert"
                        >
                            <PencilIcon size="sm"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(alert.id)}
                            aria-label="Delete alert"
                        >
                            <TrashIcon size="sm" color="danger"/>
                        </Button>
                    </HStack>
                </HStack>
            </CardFooter>
        </Card>
    );
}

/**
 * Opportunity Alert Form Component (Intelligence Users)
 */
function OpportunityAlertForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
}: {
    initialData: AlertFormState;
    onSubmit: (data: AlertFormState) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [form, setForm] = useState<AlertFormState>(initialData);
    const [naicsInput, setNaicsInput] = useState(formatCommaSeparated(initialData.naicsCodes));
    const [keywordsInput, setKeywordsInput] = useState(formatCommaSeparated(initialData.keywords));
    const [errors, setErrors] = useState<AlertFormErrors>({});

    const handleInputChange = useCallback(
        (field: keyof AlertFormState) => (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setForm((prev) => ({...prev, [field]: value}));

            // Clear error for this field
            if (errors[field as keyof AlertFormErrors] !== undefined) {
                setErrors((prev) => ({...prev, [field]: undefined}));
            }
        },
        [errors]
    );

    const handleNaicsChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setNaicsInput(event.target.value);
            setForm((prev) => ({
                ...prev,
                naicsCodes: parseCommaSeparated(event.target.value),
            }));
            if (errors.naicsCodes !== undefined || errors.general !== undefined) {
                setErrors((prev) => ({...prev, naicsCodes: undefined, general: undefined}));
            }
        },
        [errors]
    );

    const handleKeywordsChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setKeywordsInput(event.target.value);
            setForm((prev) => ({
                ...prev,
                keywords: parseCommaSeparated(event.target.value),
            }));
            if (errors.keywords !== undefined || errors.general !== undefined) {
                setErrors((prev) => ({...prev, keywords: undefined, general: undefined}));
            }
        },
        [errors]
    );

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const validationErrors = validateForm(form);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            onSubmit(form);
        },
        [form, onSubmit]
    );

    return (
        <Box as="form" onSubmit={handleSubmit}>
            <Stack spacing="md">
                {errors.general !== undefined && (
                    <Box>
                        <Text variant="bodySmall" color="danger">
                            {errors.general}
                        </Text>
                    </Box>
                )}

                {/* Alert Name */}
                <Box>
                    <Text as="label" variant="label">
                        Alert Name *
                    </Text>
                    <Input
                        type="text"
                        value={form.name}
                        onChange={handleInputChange('name')}
                        placeholder="e.g., IT Services 541512"
                        fullWidth
                        invalid={errors.name !== undefined}
                    />
                    {errors.name !== undefined && (
                        <Text variant="caption" color="danger">
                            {errors.name}
                        </Text>
                    )}
                </Box>

                {/* Description */}
                <Box>
                    <Text as="label" variant="label">
                        Description
                    </Text>
                    <Input
                        type="text"
                        value={form.description}
                        onChange={handleInputChange('description')}
                        placeholder="Optional description for this alert"
                        fullWidth
                    />
                </Box>

                {/* NAICS Codes */}
                <Box>
                    <Text as="label" variant="label">
                        NAICS Codes
                    </Text>
                    <Input
                        type="text"
                        value={naicsInput}
                        onChange={handleNaicsChange}
                        placeholder="e.g., 541512, 541511, 518210"
                        fullWidth
                        invalid={errors.naicsCodes !== undefined}
                    />
                    <Text variant="caption" color="muted">
                        Comma-separated NAICS codes to monitor
                    </Text>
                </Box>

                {/* Keywords */}
                <Box>
                    <Text as="label" variant="label">
                        Keywords
                    </Text>
                    <Input
                        type="text"
                        value={keywordsInput}
                        onChange={handleKeywordsChange}
                        placeholder="e.g., cloud, security, data analytics"
                        fullWidth
                        invalid={errors.keywords !== undefined}
                    />
                    <Text variant="caption" color="muted">
                        Comma-separated keywords to match in title or description
                    </Text>
                </Box>

                {/* Value Range */}
                <Grid columns="1fr 1fr" gap="md">
                    <GridItem>
                        <Text as="label" variant="label">
                            Minimum Value ($)
                        </Text>
                        <Input
                            type="number"
                            value={form.minValue}
                            onChange={handleInputChange('minValue')}
                            placeholder="e.g., 100000"
                            fullWidth
                            invalid={errors.minValue !== undefined}
                        />
                        {errors.minValue !== undefined && (
                            <Text variant="caption" color="danger">
                                {errors.minValue}
                            </Text>
                        )}
                    </GridItem>

                    <GridItem>
                        <Text as="label" variant="label">
                            Maximum Value ($)
                        </Text>
                        <Input
                            type="number"
                            value={form.maxValue}
                            onChange={handleInputChange('maxValue')}
                            placeholder="e.g., 5000000"
                            fullWidth
                            invalid={errors.maxValue !== undefined}
                        />
                        {errors.maxValue !== undefined && (
                            <Text variant="caption" color="danger">
                                {errors.maxValue}
                            </Text>
                        )}
                    </GridItem>
                </Grid>

                {/* Submit buttons */}
                <HStack justify="end" spacing="sm">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={isSubmitting}
                        isDisabled={isSubmitting}
                    >
                        {initialData.name !== '' ? 'Update Alert' : 'Create Alert'}
                    </Button>
                </HStack>
            </Stack>
        </Box>
    );
}

/**
 * Contract Alert Form Component (Portal Users)
 */
function ContractAlertForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
}: {
    initialData: ContractAlertFormState;
    onSubmit: (data: ContractAlertFormState) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [form, setForm] = useState<ContractAlertFormState>(initialData);
    const [errors, setErrors] = useState<ContractAlertFormErrors>({});

    const handleInputChange = useCallback(
        (field: keyof ContractAlertFormState) => (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setForm((prev) => ({...prev, [field]: value}));

            if (errors[field as keyof ContractAlertFormErrors] !== undefined) {
                setErrors((prev) => ({...prev, [field]: undefined}));
            }
        },
        [errors]
    );

    const handleSelectChange = useCallback(
        (field: keyof ContractAlertFormState) => (event: ChangeEvent<HTMLSelectElement>) => {
            const value = event.target.value;
            setForm((prev) => ({...prev, [field]: value}));

            if (errors[field as keyof ContractAlertFormErrors] !== undefined) {
                setErrors((prev) => ({...prev, [field]: undefined}));
            }
        },
        [errors]
    );

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const validationErrors = validateContractForm(form);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            onSubmit(form);
        },
        [form, onSubmit]
    );

    return (
        <Box as="form" onSubmit={handleSubmit}>
            <Stack spacing="md">
                {errors.general !== undefined && (
                    <Box>
                        <Text variant="bodySmall" color="danger">
                            {errors.general}
                        </Text>
                    </Box>
                )}

                {/* Alert Name */}
                <Box>
                    <Text as="label" variant="label">
                        Alert Name *
                    </Text>
                    <Input
                        type="text"
                        value={form.name}
                        onChange={handleInputChange('name')}
                        placeholder="e.g., Weekly Deliverable Reminder"
                        fullWidth
                        invalid={errors.name !== undefined}
                    />
                    {errors.name !== undefined && (
                        <Text variant="caption" color="danger">
                            {errors.name}
                        </Text>
                    )}
                </Box>

                {/* Description */}
                <Box>
                    <Text as="label" variant="label">
                        Description
                    </Text>
                    <Input
                        type="text"
                        value={form.description}
                        onChange={handleInputChange('description')}
                        placeholder="Optional description for this alert"
                        fullWidth
                    />
                </Box>

                {/* Alert Type */}
                <Box>
                    <Text as="label" variant="label">
                        Alert Type *
                    </Text>
                    <Select
                        value={form.alertType}
                        onChange={handleSelectChange('alertType')}
                        options={CONTRACT_ALERT_TYPE_OPTIONS}
                        fullWidth
                    />
                    <Text variant="caption" color="muted">
                        Select what type of event should trigger this alert
                    </Text>
                </Box>

                {/* Days Before Reminder */}
                <Box>
                    <Text as="label" variant="label">
                        Reminder Timing *
                    </Text>
                    <Select
                        value={form.daysBeforeReminder}
                        onChange={handleSelectChange('daysBeforeReminder')}
                        options={DAYS_BEFORE_OPTIONS}
                        fullWidth
                    />
                    <Text variant="caption" color="muted">
                        How many days before the event should we send the reminder?
                    </Text>
                </Box>

                {/* Submit buttons */}
                <HStack justify="end" spacing="sm">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={isSubmitting}
                        isDisabled={isSubmitting}
                    >
                        {initialData.name !== '' ? 'Update Alert' : 'Create Alert'}
                    </Button>
                </HStack>
            </Stack>
        </Box>
    );
}

/**
 * Alerts Page Component
 * Shows different alert types based on user role:
 * - Intelligence users: Opportunity alerts (NAICS, keywords, value ranges)
 * - Portal users: Contract alerts (deliverables, milestones, invoices)
 */
export function AlertsPage(): React.ReactElement {
    const isPortalUser = useIsPortalUser();

    // Opportunity alerts state (Intelligence users)
    const [opportunityAlerts, setOpportunityAlerts] = useState<OpportunityAlert[]>([]);

    // Contract alerts state (Portal users) - mock data for now
    const [contractAlerts, setContractAlerts] = useState<ContractAlert[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingOpportunityAlert, setEditingOpportunityAlert] = useState<OpportunityAlert | null>(null);
    const [editingContractAlert, setEditingContractAlert] = useState<ContractAlert | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadAlerts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (isPortalUser) {
                // TODO: Implement contract alerts API
                // For now, use empty array - backend endpoint not yet implemented
                setContractAlerts([]);
            } else {
                const response = await fetchOpportunityAlerts();
                setOpportunityAlerts(response.content);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load alerts');
        } finally {
            setIsLoading(false);
        }
    }, [isPortalUser]);

    useEffect(() => {
        void loadAlerts();
    }, [loadAlerts]);

    const handleCreateClick = useCallback(() => {
        setEditingOpportunityAlert(null);
        setEditingContractAlert(null);
        setShowForm(true);
    }, []);

    const handleEditOpportunityAlert = useCallback((alert: OpportunityAlert) => {
        setEditingOpportunityAlert(alert);
        setEditingContractAlert(null);
        setShowForm(true);
    }, []);

    const handleEditContractAlert = useCallback((alert: ContractAlert) => {
        setEditingContractAlert(alert);
        setEditingOpportunityAlert(null);
        setShowForm(true);
    }, []);

    const handleCancelForm = useCallback(() => {
        setShowForm(false);
        setEditingOpportunityAlert(null);
        setEditingContractAlert(null);
    }, []);

    const handleSubmitOpportunityForm = useCallback(
        async (formData: AlertFormState) => {
            setIsSubmitting(true);
            try {
                if (editingOpportunityAlert !== null) {
                    const request: UpdateAlertRequest = {
                        name: formData.name,
                        description: formData.description.length > 0 ? formData.description : undefined,
                        naicsCodes: formData.naicsCodes,
                        keywords: formData.keywords,
                        minValue:
                            formData.minValue !== '' ? Number(formData.minValue) : undefined,
                        maxValue:
                            formData.maxValue !== '' ? Number(formData.maxValue) : undefined,
                        enabled: formData.enabled,
                    };
                    await updateOpportunityAlert(editingOpportunityAlert.id, request);
                } else {
                    const request: CreateAlertRequest = {
                        name: formData.name,
                        description: formData.description.length > 0 ? formData.description : undefined,
                        naicsCodes: formData.naicsCodes,
                        keywords: formData.keywords,
                        minValue:
                            formData.minValue !== '' ? Number(formData.minValue) : undefined,
                        maxValue:
                            formData.maxValue !== '' ? Number(formData.maxValue) : undefined,
                        enabled: formData.enabled,
                    };
                    await createOpportunityAlert(request);
                }

                setShowForm(false);
                setEditingOpportunityAlert(null);
                await loadAlerts();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save alert');
            } finally {
                setIsSubmitting(false);
            }
        },
        [editingOpportunityAlert, loadAlerts]
    );

    const handleSubmitContractForm = useCallback(
        async (formData: ContractAlertFormState) => {
            setIsSubmitting(true);
            try {
                // TODO: Implement contract alerts API
                // For now, just close the form
                console.log('Contract alert form submitted:', formData);
                setShowForm(false);
                setEditingContractAlert(null);
                await loadAlerts();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save alert');
            } finally {
                setIsSubmitting(false);
            }
        },
        [loadAlerts]
    );

    const handleToggleOpportunityAlert = useCallback(
        async (id: string) => {
            try {
                await toggleOpportunityAlert(id);
                await loadAlerts();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to toggle alert');
            }
        },
        [loadAlerts]
    );

    const handleToggleContractAlert = useCallback(
        async (id: string) => {
            // TODO: Implement contract alerts API
            console.log('Toggle contract alert:', id);
        },
        []
    );

    const handleDeleteOpportunityAlert = useCallback(
        async (id: string) => {
            if (window.confirm('Are you sure you want to delete this alert?') === false) {
                return;
            }

            try {
                await deleteOpportunityAlert(id);
                await loadAlerts();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete alert');
            }
        },
        [loadAlerts]
    );

    const handleDeleteContractAlert = useCallback(
        async (id: string) => {
            if (window.confirm('Are you sure you want to delete this alert?') === false) {
                return;
            }

            // TODO: Implement contract alerts API
            console.log('Delete contract alert:', id);
        },
        []
    );

    const getOpportunityFormInitialData = useCallback((): AlertFormState => {
        if (editingOpportunityAlert !== null) {
            return {
                name: editingOpportunityAlert.name,
                description: editingOpportunityAlert.description ?? '',
                naicsCodes: editingOpportunityAlert.naicsCodes,
                keywords: editingOpportunityAlert.keywords,
                minValue: editingOpportunityAlert.minValue !== null ? String(editingOpportunityAlert.minValue) : '',
                maxValue: editingOpportunityAlert.maxValue !== null ? String(editingOpportunityAlert.maxValue) : '',
                enabled: editingOpportunityAlert.enabled,
            };
        }
        return INITIAL_FORM_STATE;
    }, [editingOpportunityAlert]);

    const getContractFormInitialData = useCallback((): ContractAlertFormState => {
        if (editingContractAlert !== null) {
            return {
                name: editingContractAlert.name,
                description: editingContractAlert.description ?? '',
                alertType: editingContractAlert.alertType,
                contractId: editingContractAlert.contractId ?? '',
                daysBeforeReminder: String(editingContractAlert.daysBeforeReminder),
                enabled: editingContractAlert.enabled,
            };
        }
        return INITIAL_CONTRACT_FORM_STATE;
    }, [editingContractAlert]);

    if (isLoading) {
        return (
            <Section id="alerts">
                <Flex justify="center" align="center">
                    <Text variant="body" color="muted">
                        Loading alerts...
                    </Text>
                </Flex>
            </Section>
        );
    }

    const pageTitle = isPortalUser ? 'Contract Alerts' : 'Opportunity Alerts';
    const emptyMessage = isPortalUser
        ? 'Create an alert to get notified about upcoming deliverables, milestones, and deadlines.'
        : 'Create an alert to get notified when matching opportunities are posted.';

    const alerts = isPortalUser ? contractAlerts : opportunityAlerts;

    return (
        <Section id="alerts">
            <SectionHeader
                title={pageTitle}
                icon={<BellIcon size="lg"/>}
                actions={
                    showForm === false && (
                        <Button variant="primary" onClick={handleCreateClick}>
                            <HStack spacing="xs" align="center">
                                <PlusIcon size="sm"/>
                                <Text as="span" variant="bodySmall" color="white">
                                    Create Alert
                                </Text>
                            </HStack>
                        </Button>
                    )
                }
            />

            {error !== null && (
                <Box>
                    <Text variant="bodySmall" color="danger">
                        {error}
                    </Text>
                </Box>
            )}

            {showForm && (
                <Card variant="elevated">
                    <CardHeader>
                        <Text variant="heading5">
                            {isPortalUser
                                ? (editingContractAlert !== null ? 'Edit Alert' : 'Create New Alert')
                                : (editingOpportunityAlert !== null ? 'Edit Alert' : 'Create New Alert')}
                        </Text>
                    </CardHeader>
                    <CardBody>
                        {isPortalUser ? (
                            <ContractAlertForm
                                initialData={getContractFormInitialData()}
                                onSubmit={handleSubmitContractForm}
                                onCancel={handleCancelForm}
                                isSubmitting={isSubmitting}
                            />
                        ) : (
                            <OpportunityAlertForm
                                initialData={getOpportunityFormInitialData()}
                                onSubmit={handleSubmitOpportunityForm}
                                onCancel={handleCancelForm}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </CardBody>
                </Card>
            )}

            {alerts.length === 0 && showForm === false ? (
                <Card variant="default">
                    <CardBody>
                        <Flex direction="column" align="center" gap="md">
                            <BellIcon size="xl" color="muted"/>
                            <Stack spacing="xs" align="center">
                                <Text variant="body" color="muted">
                                    No alerts configured yet.
                                </Text>
                                <Text variant="body" color="muted">
                                    {emptyMessage}
                                </Text>
                            </Stack>
                            <Button variant="primary" onClick={handleCreateClick}>
                                <HStack spacing="xs" align="center">
                                    <PlusIcon size="sm"/>
                                    <Text as="span" variant="bodySmall" color="white">
                                        Create Your First Alert
                                    </Text>
                                </HStack>
                            </Button>
                        </Flex>
                    </CardBody>
                </Card>
            ) : (
                <Grid columns="repeat(auto-fill, minmax(400px, 1fr))" gap="md">
                    {isPortalUser
                        ? contractAlerts.map((alert) => (
                            <GridItem key={alert.id}>
                                <ContractAlertCard
                                    alert={alert}
                                    onEdit={handleEditContractAlert}
                                    onDelete={handleDeleteContractAlert}
                                    onToggle={handleToggleContractAlert}
                                />
                            </GridItem>
                        ))
                        : opportunityAlerts.map((alert) => (
                            <GridItem key={alert.id}>
                                <OpportunityAlertCard
                                    alert={alert}
                                    onEdit={handleEditOpportunityAlert}
                                    onDelete={handleDeleteOpportunityAlert}
                                    onToggle={handleToggleOpportunityAlert}
                                />
                            </GridItem>
                        ))}
                </Grid>
            )}
        </Section>
    );
}

export default AlertsPage;
