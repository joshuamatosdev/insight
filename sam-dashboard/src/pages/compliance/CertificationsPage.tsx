/**
 * CertificationsPage - List of business certifications
 */

import {useCallback, useState} from 'react';
import {Badge, Button, FileCheckIcon, PlusIcon, RefreshIcon, Select, Text,} from '../../components/catalyst/primitives';
import {Card, CardBody, CardHeader, HStack, Section, SectionHeader, Stack,} from '../../components/catalyst/layout';
import {CertificationForm, CertificationList,} from '../../components/domain/compliance';
import {useCertifications} from '../../hooks';
import type {
    Certification,
    CertificationFormState,
    CertificationType,
    CreateCertificationRequest,
} from '../../types/compliance.types';

interface CertificationsPageProps {
    onViewDetails?: (certification: Certification) => void;
}

const TYPE_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
    {value: '', label: 'All Types'},
    {value: 'SAM_REGISTRATION', label: 'SAM Registration'},
    {value: 'EIGHT_A', label: '8(a) Business Development'},
    {value: 'HUBZONE', label: 'HUBZone'},
    {value: 'WOSB', label: 'Women-Owned Small Business'},
    {value: 'EDWOSB', label: 'Economically Disadvantaged WOSB'},
    {value: 'SDVOSB', label: 'Service-Disabled Veteran-Owned'},
    {value: 'VOSB', label: 'Veteran-Owned Small Business'},
    {value: 'SBA_MENTOR_PROTEGE', label: 'SBA Mentor-Protege'},
    {value: 'DBE', label: 'Disadvantaged Business Enterprise'},
    {value: 'MBE', label: 'Minority Business Enterprise'},
    {value: 'WBE', label: 'Women Business Enterprise'},
    {value: 'SBE', label: 'Small Business Enterprise'},
    {value: 'STATE_CERTIFICATION', label: 'State Certification'},
    {value: 'ISO_9001', label: 'ISO 9001'},
    {value: 'ISO_27001', label: 'ISO 27001'},
    {value: 'ISO_20000', label: 'ISO 20000'},
    {value: 'CMMI', label: 'CMMI'},
    {value: 'SOC2', label: 'SOC 2'},
    {value: 'FEDRAMP', label: 'FedRAMP'},
    {value: 'FACILITY_CLEARANCE', label: 'Facility Clearance'},
    {value: 'CMMC', label: 'CMMC'},
    {value: 'OTHER', label: 'Other'},
];

/**
 * Converts form state to API request
 */
function formStateToRequest(form: CertificationFormState): CreateCertificationRequest {
    return {
        certificationType: form.certificationType,
        name: form.name,
        description: form.description.length > 0 ? form.description : undefined,
        certificateNumber: form.certificateNumber.length > 0 ? form.certificateNumber : undefined,
        issuingAgency: form.issuingAgency.length > 0 ? form.issuingAgency : undefined,
        issueDate: form.issueDate.length > 0 ? form.issueDate : undefined,
        expirationDate: form.expirationDate.length > 0 ? form.expirationDate : undefined,
        renewalDate: form.renewalDate.length > 0 ? form.renewalDate : undefined,
        naicsCode: form.naicsCode.length > 0 ? form.naicsCode : undefined,
        sizeStandard: form.sizeStandard.length > 0 ? form.sizeStandard : undefined,
        uei: form.uei.length > 0 ? form.uei : undefined,
        cageCode: form.cageCode.length > 0 ? form.cageCode : undefined,
        samRegistrationDate: form.samRegistrationDate.length > 0 ? form.samRegistrationDate : undefined,
        samExpirationDate: form.samExpirationDate.length > 0 ? form.samExpirationDate : undefined,
        eightAEntryDate: form.eightAEntryDate.length > 0 ? form.eightAEntryDate : undefined,
        eightAGraduationDate: form.eightAGraduationDate.length > 0 ? form.eightAGraduationDate : undefined,
        hubzoneCertificationDate: form.hubzoneCertificationDate.length > 0 ? form.hubzoneCertificationDate : undefined,
        documentUrl: form.documentUrl.length > 0 ? form.documentUrl : undefined,
        notes: form.notes.length > 0 ? form.notes : undefined,
        reminderDaysBefore: form.reminderDaysBefore.length > 0 ? parseInt(form.reminderDaysBefore, 10) : undefined,
    };
}

/**
 * Converts certification to form state for editing
 */
function certificationToFormState(cert: Certification): CertificationFormState {
    return {
        certificationType: cert.certificationType,
        name: cert.name,
        description: cert.description ?? '',
        certificateNumber: cert.certificateNumber ?? '',
        issuingAgency: cert.issuingAgency ?? '',
        issueDate: cert.issueDate ?? '',
        expirationDate: cert.expirationDate ?? '',
        renewalDate: cert.renewalDate ?? '',
        naicsCode: cert.naicsCode ?? '',
        sizeStandard: cert.sizeStandard ?? '',
        uei: cert.uei ?? '',
        cageCode: cert.cageCode ?? '',
        samRegistrationDate: cert.samRegistrationDate ?? '',
        samExpirationDate: cert.samExpirationDate ?? '',
        eightAEntryDate: cert.eightAEntryDate ?? '',
        eightAGraduationDate: cert.eightAGraduationDate ?? '',
        hubzoneCertificationDate: cert.hubzoneCertificationDate ?? '',
        documentUrl: cert.documentUrl ?? '',
        notes: cert.notes ?? '',
        reminderDaysBefore: String(cert.reminderDaysBefore),
    };
}

export function CertificationsPage({
                                       onViewDetails,
                                   }: CertificationsPageProps): React.ReactElement {
    const [typeFilter, setTypeFilter] = useState<CertificationType | undefined>(undefined);
    const [showForm, setShowForm] = useState(false);
    const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        certifications,
        totalElements,
        totalPages,
        currentPage,
        isLoading,
        error: loadError,
        refresh,
        setPage,
        create,
        update,
        remove,
    } = useCertifications(typeFilter);

    const handleTypeFilterChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const value = event.target.value;
            setTypeFilter(value.length > 0 ? (value as CertificationType) : undefined);
        },
        []
    );

    const handleCreateClick = useCallback(() => {
        setEditingCertification(null);
        setShowForm(true);
        setError(null);
    }, []);

    const handleEditClick = useCallback((certification: Certification) => {
        setEditingCertification(certification);
        setShowForm(true);
        setError(null);
    }, []);

    const handleCancelForm = useCallback(() => {
        setShowForm(false);
        setEditingCertification(null);
        setError(null);
    }, []);

    const handleSubmitForm = useCallback(
        async (formData: CertificationFormState) => {
            setIsSubmitting(true);
            setError(null);

            try {
                const request = formStateToRequest(formData);

                if (editingCertification !== null) {
                    const result = await update(editingCertification.id, request);
                    if (result === null) {
                        setError('Failed to update certification');
                        return;
                    }
                } else {
                    const result = await create(request);
                    if (result === null) {
                        setError('Failed to create certification');
                        return;
                    }
                }

                setShowForm(false);
                setEditingCertification(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsSubmitting(false);
            }
        },
        [editingCertification, create, update]
    );

    const handleDeleteClick = useCallback(
        async (id: string) => {
            if (window.confirm('Are you sure you want to delete this certification?') === false) {
                return;
            }

            const success = await remove(id);
            if (success === false) {
                setError('Failed to delete certification');
            }
        },
        [remove]
    );

    const getFormInitialData = useCallback((): CertificationFormState | undefined => {
        if (editingCertification !== null) {
            return certificationToFormState(editingCertification);
        }
        return undefined;
    }, [editingCertification]);

    return (
        <Section id="certifications">
            <SectionHeader
                title="Business Certifications"
                icon={<FileCheckIcon size="lg"/>}
                actions={
                    showForm === false && (
                        <HStack spacing="sm">
                            <Button variant="outline" size="sm" onClick={refresh}>
                                <HStack spacing="xs" align="center">
                                    <RefreshIcon size="sm"/>
                                    <Text as="span" variant="bodySmall" color="muted">
                                        Refresh
                                    </Text>
                                </HStack>
                            </Button>
                            <Button variant="primary" onClick={handleCreateClick}>
                                <HStack spacing="xs" align="center">
                                    <PlusIcon size="sm"/>
                                    <Text as="span" variant="bodySmall" color="white">
                                        Add Certification
                                    </Text>
                                </HStack>
                            </Button>
                        </HStack>
                    )
                }
            />

            <Stack spacing="md">
                {/* Error Display */}
                {(error !== null || loadError !== null) && (
                    <Card variant="outlined">
                        <CardBody padding="sm">
                            <Text variant="bodySmall" color="danger">
                                {error ?? loadError?.message}
                            </Text>
                        </CardBody>
                    </Card>
                )}

                {/* Create/Edit Form */}
                {showForm && (
                    <Card variant="elevated">
                        <CardHeader>
                            <Text variant="heading5">
                                {editingCertification !== null
                                    ? 'Edit Certification'
                                    : 'Add New Certification'}
                            </Text>
                        </CardHeader>
                        <CardBody>
                            <CertificationForm
                                initialData={getFormInitialData()}
                                onSubmit={handleSubmitForm}
                                onCancel={handleCancelForm}
                                isSubmitting={isSubmitting}
                            />
                        </CardBody>
                    </Card>
                )}

                {/* Filters */}
                {showForm === false && (
                    <Card variant="outlined">
                        <CardBody padding="sm">
                            <HStack justify="between" align="center">
                                <HStack spacing="md" align="center">
                                    <Text variant="bodySmall" color="muted">
                                        Filter by Type:
                                    </Text>
                                    <Select
                                        value={typeFilter ?? ''}
                                        onChange={handleTypeFilterChange}
                                        options={TYPE_FILTER_OPTIONS}
                                    />
                                </HStack>

                                <HStack spacing="sm" align="center">
                                    <Text variant="caption" color="muted">
                                        {totalElements} certification{totalElements !== 1 ? 's' : ''}
                                    </Text>
                                    {totalPages > 1 && (
                                        <Badge color="zinc">
                                            Page {currentPage + 1} of {totalPages}
                                        </Badge>
                                    )}
                                </HStack>
                            </HStack>
                        </CardBody>
                    </Card>
                )}

                {/* Certifications List */}
                {showForm === false && (
                    <CertificationList
                        certifications={certifications}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onViewDetails={onViewDetails}
                        isLoading={isLoading}
                        emptyMessage="No certifications found. Add your first certification to get started."
                    />
                )}

                {/* Pagination */}
                {showForm === false && totalPages > 1 && (
                    <HStack justify="center" spacing="sm">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(currentPage - 1)}
                            isDisabled={currentPage === 0}
                        >
                            Previous
                        </Button>
                        <Text variant="bodySmall" color="muted">
                            Page {currentPage + 1} of {totalPages}
                        </Text>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(currentPage + 1)}
                            isDisabled={currentPage >= totalPages - 1}
                        >
                            Next
                        </Button>
                    </HStack>
                )}
            </Stack>
        </Section>
    );
}

export default CertificationsPage;
