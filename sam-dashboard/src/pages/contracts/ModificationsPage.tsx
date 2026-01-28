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
    SectionHeader,
    Stack
} from '../../components/catalyst/layout';
import type {CreateModificationRequest, ModificationType} from '../../components/domain/contracts';
import {ModificationTimeline} from '../../components/domain/contracts';
import {useContract} from '../../hooks/useContracts';

export interface ModificationsPageProps {
    contractId: string;
    onBack?: () => void;
}

const MODIFICATION_TYPE_OPTIONS: Array<{ value: ModificationType; label: string }> = [
    {value: 'ADMINISTRATIVE', label: 'Administrative'},
    {value: 'BILATERAL', label: 'Bilateral'},
    {value: 'UNILATERAL', label: 'Unilateral'},
    {value: 'SUPPLEMENTAL', label: 'Supplemental'},
    {value: 'INCREMENTAL_FUNDING', label: 'Incremental Funding'},
    {value: 'NO_COST_EXTENSION', label: 'No-Cost Extension'},
    {value: 'OPTION_EXERCISE', label: 'Option Exercise'},
    {value: 'TERMINATION', label: 'Termination'},
    {value: 'SCOPE_CHANGE', label: 'Scope Change'},
    {value: 'OTHER', label: 'Other'},
];

interface ModificationFormState {
    modificationNumber: string;
    title: string;
    description: string;
    modificationType: ModificationType;
    effectiveDate: string;
    valueChange: string;
    fundingChange: string;
    popExtensionDays: string;
    newPopEndDate: string;
    scopeChangeSummary: string;
    reason: string;
}

export function ModificationsPage({contractId, onBack}: ModificationsPageProps) {
    const {
        contract,
        modifications,
        isLoading,
        error,
        addModification,
        executeModificationAction,
        refresh,
    } = useContract(contractId);

    const [showAddForm, setShowAddForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formState, setFormState] = useState<ModificationFormState>({
        modificationNumber: '',
        title: '',
        description: '',
        modificationType: 'BILATERAL',
        effectiveDate: '',
        valueChange: '',
        fundingChange: '',
        popExtensionDays: '',
        newPopEndDate: '',
        scopeChangeSummary: '',
        reason: '',
    });

    const handleChange = useCallback(
        (field: keyof ModificationFormState) =>
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

            if (formState.modificationNumber.trim().length === 0) {
                return;
            }

            const data: CreateModificationRequest = {
                modificationNumber: formState.modificationNumber,
                title: formState.title.length > 0 ? formState.title : undefined,
                description: formState.description.length > 0 ? formState.description : undefined,
                modificationType: formState.modificationType,
                effectiveDate: formState.effectiveDate.length > 0 ? formState.effectiveDate : undefined,
                valueChange:
                    formState.valueChange.length > 0 ? Number(formState.valueChange) : undefined,
                fundingChange:
                    formState.fundingChange.length > 0 ? Number(formState.fundingChange) : undefined,
                popExtensionDays:
                    formState.popExtensionDays.length > 0
                        ? Number(formState.popExtensionDays)
                        : undefined,
                newPopEndDate:
                    formState.newPopEndDate.length > 0 ? formState.newPopEndDate : undefined,
                scopeChangeSummary:
                    formState.scopeChangeSummary.length > 0 ? formState.scopeChangeSummary : undefined,
                reason: formState.reason.length > 0 ? formState.reason : undefined,
            };

            setIsSaving(true);
            const result = await addModification(data);
            setIsSaving(false);

            if (result !== null) {
                setShowAddForm(false);
                setFormState({
                    modificationNumber: '',
                    title: '',
                    description: '',
                    modificationType: 'BILATERAL',
                    effectiveDate: '',
                    valueChange: '',
                    fundingChange: '',
                    popExtensionDays: '',
                    newPopEndDate: '',
                    scopeChangeSummary: '',
                    reason: '',
                });
                refresh();
            }
        },
        [formState, addModification, refresh]
    );

    const handleExecuteModification = useCallback(
        async (modificationId: string) => {
            await executeModificationAction(modificationId);
        },
        [executeModificationAction]
    );

    const handleCancelForm = useCallback(() => {
        setShowAddForm(false);
    }, []);

    if (isLoading) {
        return (
            <Section>
                <Flex justify="center" align="center">
                    <Text variant="body" color="muted">
                        Loading modifications...
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
                        <Text variant="heading3">Modifications - {contract.contractNumber}</Text>
                        <Text variant="body" color="muted">
                            {contract.title}
                        </Text>
                    </Box>
                    <Button
                        variant="primary"
                        leftIcon={<PlusIcon size="sm"/>}
                        onClick={() => setShowAddForm(true)}
                    >
                        Create Modification
                    </Button>
                </HStack>
            </SectionHeader>

            {showAddForm && (
                <Card>
                    <Box as="form" onSubmit={handleSubmit}>
                        <CardHeader>
                            <Text variant="heading4">Create Modification</Text>
                        </CardHeader>
                        <CardBody>
                            <Stack spacing="lg">
                                <Box>
                                    <Text variant="heading5">
                                        Basic Information
                                    </Text>
                                    <Grid columns={2} gap="md">
                                        <FormField label="Modification Number" id="modificationNumber" required>
                                            <Input
                                                value={formState.modificationNumber}
                                                onChange={handleChange('modificationNumber')}
                                                disabled={isSaving}
                                                placeholder="e.g., P00001"
                                                required
                                            />
                                        </FormField>
                                        <FormField label="Type" id="modificationType" required>
                                            <Select
                                                value={formState.modificationType}
                                                onChange={handleChange('modificationType')}
                                                disabled={isSaving}
                                                options={MODIFICATION_TYPE_OPTIONS}
                                            />
                                        </FormField>
                                        <GridItem colSpan={2}>
                                            <FormField label="Title" id="title">
                                                <Input
                                                    value={formState.title}
                                                    onChange={handleChange('title')}
                                                    disabled={isSaving}
                                                    placeholder="Modification title"
                                                />
                                            </FormField>
                                        </GridItem>
                                        <GridItem colSpan={2}>
                                            <FormField label="Description" id="description">
                                                <Input
                                                    value={formState.description}
                                                    onChange={handleChange('description')}
                                                    disabled={isSaving}
                                                    placeholder="Detailed description of the modification"
                                                />
                                            </FormField>
                                        </GridItem>
                                        <FormField label="Effective Date" id="effectiveDate">
                                            <Input
                                                type="date"
                                                value={formState.effectiveDate}
                                                onChange={handleChange('effectiveDate')}
                                                disabled={isSaving}
                                            />
                                        </FormField>
                                    </Grid>
                                </Box>

                                <Box>
                                    <Text variant="heading5">
                                        Value Changes
                                    </Text>
                                    <Grid columns={2} gap="md">
                                        <FormField label="Value Change ($)" id="valueChange">
                                            <Input
                                                type="number"
                                                value={formState.valueChange}
                                                onChange={handleChange('valueChange')}
                                                disabled={isSaving}
                                                placeholder="Use negative for decreases"
                                            />
                                        </FormField>
                                        <FormField label="Funding Change ($)" id="fundingChange">
                                            <Input
                                                type="number"
                                                value={formState.fundingChange}
                                                onChange={handleChange('fundingChange')}
                                                disabled={isSaving}
                                                placeholder="Use negative for decreases"
                                            />
                                        </FormField>
                                    </Grid>
                                </Box>

                                <Box>
                                    <Text variant="heading5">
                                        Period of Performance Changes
                                    </Text>
                                    <Grid columns={2} gap="md">
                                        <FormField label="PoP Extension (days)" id="popExtensionDays">
                                            <Input
                                                type="number"
                                                value={formState.popExtensionDays}
                                                onChange={handleChange('popExtensionDays')}
                                                disabled={isSaving}
                                                placeholder="0"
                                            />
                                        </FormField>
                                        <FormField label="New PoP End Date" id="newPopEndDate">
                                            <Input
                                                type="date"
                                                value={formState.newPopEndDate}
                                                onChange={handleChange('newPopEndDate')}
                                                disabled={isSaving}
                                            />
                                        </FormField>
                                    </Grid>
                                </Box>

                                <FormField label="Scope Change Summary" id="scopeChangeSummary">
                                    <Input
                                        value={formState.scopeChangeSummary}
                                        onChange={handleChange('scopeChangeSummary')}
                                        disabled={isSaving}
                                        placeholder="Summary of any scope changes"
                                    />
                                </FormField>

                                <FormField label="Reason" id="reason">
                                    <Input
                                        value={formState.reason}
                                        onChange={handleChange('reason')}
                                        disabled={isSaving}
                                        placeholder="Reason for the modification"
                                    />
                                </FormField>
                            </Stack>
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
                                    {isSaving ? 'Creating...' : 'Create Modification'}
                                </Button>
                            </HStack>
                        </CardFooter>
                    </Box>
                </Card>
            )}

            <ModificationTimeline
                modifications={modifications}
                onExecuteModification={handleExecuteModification}
            />
        </Section>
    );
}

export default ModificationsPage;
