/**
 * CertificationDetailPage - Single certification detail view
 */

import {useCallback, useState} from 'react';
import {
    Button,
    CalendarIcon,
    ChevronLeftIcon,
    ExternalLinkIcon,
    FileCheckIcon,
    Link,
    PencilIcon,
    Text,
    TrashIcon,
} from '../../components/catalyst/primitives';
import {
    Box,
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
} from '../../components/catalyst/layout';
import {CertificationForm, ComplianceStatusBadge,} from '../../components/domain/compliance';
import {useCertification, useCertifications} from '../../hooks';
import type {Certification, CertificationFormState, UpdateCertificationRequest,} from '../../types/compliance.types';

interface CertificationDetailPageProps {
    certificationId: string;
    onBack?: () => void;
}

/**
 * Formats date for display
 */
function formatDate(dateString: string | null): string {
    if (dateString === null) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Formats certification type for display
 */
function formatCertificationType(type: string): string {
    const typeLabels: Record<string, string> = {
        SAM_REGISTRATION: 'SAM Registration',
        EIGHT_A: '8(a) Business Development Program',
        HUBZONE: 'HUBZone Program',
        WOSB: 'Women-Owned Small Business',
        EDWOSB: 'Economically Disadvantaged WOSB',
        SDVOSB: 'Service-Disabled Veteran-Owned',
        VOSB: 'Veteran-Owned Small Business',
        SBA_MENTOR_PROTEGE: 'SBA Mentor-Protege Program',
        DBE: 'Disadvantaged Business Enterprise',
        MBE: 'Minority Business Enterprise',
        WBE: 'Women Business Enterprise',
        SBE: 'Small Business Enterprise',
        STATE_CERTIFICATION: 'State Certification',
        ISO_9001: 'ISO 9001 Quality Management',
        ISO_27001: 'ISO 27001 Information Security',
        ISO_20000: 'ISO 20000 IT Service Management',
        CMMI: 'CMMI (Capability Maturity Model Integration)',
        SOC2: 'SOC 2 Compliance',
        FEDRAMP: 'FedRAMP Authorization',
        FACILITY_CLEARANCE: 'Facility Security Clearance',
        CMMC: 'CMMC (Cybersecurity Maturity Model Certification)',
        OTHER: 'Other Certification',
    };
    return typeLabels[type] ?? type;
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

/**
 * Converts form state to API request
 */
function formStateToRequest(form: CertificationFormState): UpdateCertificationRequest {
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
 * DetailRow component for displaying label-value pairs
 */
function DetailRow({
                       label,
                       value,
                       isLink = false,
                   }: {
    label: string;
    value: string | null;
    isLink?: boolean;
}): React.ReactElement | null {
    if (value === null || value.length === 0) {
        return null;
    }

    return (
        <Box>
            <Text variant="caption" color="muted" weight="medium">
                {label}
            </Text>
            {isLink ? (
                <HStack spacing="xs" align="center">
                    <Link
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Text variant="body" color="primary">
                            View Document
                        </Text>
                    </Link>
                    <ExternalLinkIcon size="xs" color="primary"/>
                </HStack>
            ) : (
                <Text variant="body">{value}</Text>
            )}
        </Box>
    );
}

export function CertificationDetailPage({
                                            certificationId,
                                            onBack,
                                        }: CertificationDetailPageProps): React.ReactElement {
    const {certification, isLoading, error, refresh} = useCertification(certificationId);
    const {update, remove} = useCertifications();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleEditClick = useCallback(() => {
        setIsEditing(true);
        setSubmitError(null);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setSubmitError(null);
    }, []);

    const handleSubmitEdit = useCallback(
        async (formData: CertificationFormState) => {
            if (certification === null) return;

            setIsSubmitting(true);
            setSubmitError(null);

            try {
                const request = formStateToRequest(formData);
                const result = await update(certification.id, request);

                if (result === null) {
                    setSubmitError('Failed to update certification');
                    return;
                }

                setIsEditing(false);
                await refresh();
            } catch (err) {
                setSubmitError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsSubmitting(false);
            }
        },
        [certification, update, refresh]
    );

    const handleDelete = useCallback(async () => {
        if (certification === null) return;

        if (
            window.confirm(
                'Are you sure you want to delete this certification? This action cannot be undone.'
            ) === false
        ) {
            return;
        }

        const success = await remove(certification.id);
        if (success && onBack !== undefined) {
            onBack();
        }
    }, [certification, remove, onBack]);

    if (isLoading) {
        return (
            <Section id="certification-detail">
                <Flex justify="center" align="center">
                    <Text variant="body" color="muted">
                        Loading certification...
                    </Text>
                </Flex>
            </Section>
        );
    }

    if (error !== null || certification === null) {
        return (
            <Section id="certification-detail">
                <Card variant="outlined">
                    <CardBody>
                        <Flex
                            direction="column"
                            align="center"
                            gap="md"
                        >
                            <Text variant="body" color="danger">
                                {error?.message ?? 'Certification not found'}
                            </Text>
                            {onBack !== undefined && (
                                <Button variant="outline" onClick={onBack}>
                                    <HStack spacing="xs" align="center">
                                        <ChevronLeftIcon size="sm"/>
                                        <Text as="span" variant="bodySmall" color="muted">
                                            Back to Certifications
                                        </Text>
                                    </HStack>
                                </Button>
                            )}
                        </Flex>
                    </CardBody>
                </Card>
            </Section>
        );
    }

    if (isEditing) {
        return (
            <Section id="certification-detail">
                <SectionHeader
                    title="Edit Certification"
                    icon={<PencilIcon size="lg"/>}
                    actions={
                        <Button variant="ghost" onClick={handleCancelEdit}>
                            Cancel
                        </Button>
                    }
                />

                {submitError !== null && (
                    <Card
                        variant="outlined"
                    >
                        <CardBody padding="sm">
                            <Text variant="bodySmall" color="danger">
                                {submitError}
                            </Text>
                        </CardBody>
                    </Card>
                )}

                <Card variant="elevated">
                    <CardBody>
                        <CertificationForm
                            initialData={certificationToFormState(certification)}
                            onSubmit={handleSubmitEdit}
                            onCancel={handleCancelEdit}
                            isSubmitting={isSubmitting}
                        />
                    </CardBody>
                </Card>
            </Section>
        );
    }

    return (
        <Section id="certification-detail">
            <SectionHeader
                title={certification.name}
                icon={<FileCheckIcon size="lg"/>}
                actions={
                    <HStack spacing="sm">
                        {onBack !== undefined && (
                            <Button variant="ghost" onClick={onBack}>
                                <HStack spacing="xs" align="center">
                                    <ChevronLeftIcon size="sm"/>
                                    <Text as="span" variant="bodySmall" color="muted">
                                        Back
                                    </Text>
                                </HStack>
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleEditClick}>
                            <HStack spacing="xs" align="center">
                                <PencilIcon size="sm"/>
                                <Text as="span" variant="bodySmall" color="muted">
                                    Edit
                                </Text>
                            </HStack>
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            <HStack spacing="xs" align="center">
                                <TrashIcon size="sm"/>
                                <Text as="span" variant="bodySmall" color="white">
                                    Delete
                                </Text>
                            </HStack>
                        </Button>
                    </HStack>
                }
            />

            <Stack spacing="md">
                {/* Status and Type */}
                <Card variant="outlined">
                    <CardBody>
                        <HStack justify="between" align="center">
                            <Stack spacing="xs">
                                <Text variant="caption" color="muted">
                                    Certification Type
                                </Text>
                                <Text variant="heading6" weight="medium">
                                    {formatCertificationType(certification.certificationType)}
                                </Text>
                            </Stack>
                            <ComplianceStatusBadge
                                status={certification.status}
                                type="certification"
                                size="md"
                            />
                        </HStack>
                    </CardBody>
                </Card>

                {/* Expiration Alert */}
                {certification.daysUntilExpiration !== null &&
                    certification.daysUntilExpiration <= 90 && (
                        <Card
                            variant="outlined"
                        >
                            <CardBody>
                                <HStack spacing="sm" align="center">
                                    <CalendarIcon
                                        size="sm"
                                        color={
                                            certification.daysUntilExpiration <= 30 ? 'danger' : 'warning'
                                        }
                                    />
                                    <Text
                                        variant="body"
                                        color={
                                            certification.daysUntilExpiration <= 30 ? 'danger' : 'warning'
                                        }
                                        weight="medium"
                                    >
                                        {certification.daysUntilExpiration <= 0
                                            ? 'This certification has expired'
                                            : certification.daysUntilExpiration === 1
                                                ? 'This certification expires tomorrow'
                                                : `This certification expires in ${certification.daysUntilExpiration} days`}
                                    </Text>
                                </HStack>
                            </CardBody>
                        </Card>
                    )}

                {/* Basic Details */}
                <Card variant="outlined">
                    <CardHeader>
                        <Text variant="heading6" weight="semibold">
                            Certification Details
                        </Text>
                    </CardHeader>
                    <CardBody>
                        <Grid columns={2} gap="md">
                            <GridItem>
                                <DetailRow label="Certificate Number" value={certification.certificateNumber}/>
                            </GridItem>
                            <GridItem>
                                <DetailRow label="Issuing Agency" value={certification.issuingAgency}/>
                            </GridItem>
                            <GridItem>
                                <DetailRow label="Issue Date" value={formatDate(certification.issueDate)}/>
                            </GridItem>
                            <GridItem>
                                <DetailRow
                                    label="Expiration Date"
                                    value={formatDate(certification.expirationDate)}
                                />
                            </GridItem>
                            <GridItem>
                                <DetailRow label="Renewal Date" value={formatDate(certification.renewalDate)}/>
                            </GridItem>
                            <GridItem>
                                <DetailRow
                                    label="Reminder"
                                    value={`${certification.reminderDaysBefore} days before expiration`}
                                />
                            </GridItem>
                        </Grid>
                    </CardBody>
                </Card>

                {/* SAM.gov Details */}
                {(certification.uei !== null ||
                    certification.cageCode !== null ||
                    certification.samRegistrationDate !== null) && (
                    <Card variant="outlined">
                        <CardHeader>
                            <Text variant="heading6" weight="semibold">
                                SAM.gov Details
                            </Text>
                        </CardHeader>
                        <CardBody>
                            <Grid columns={2} gap="md">
                                <GridItem>
                                    <DetailRow label="UEI (Unique Entity Identifier)" value={certification.uei}/>
                                </GridItem>
                                <GridItem>
                                    <DetailRow label="CAGE Code" value={certification.cageCode}/>
                                </GridItem>
                                <GridItem>
                                    <DetailRow
                                        label="SAM Registration Date"
                                        value={formatDate(certification.samRegistrationDate)}
                                    />
                                </GridItem>
                                <GridItem>
                                    <DetailRow
                                        label="SAM Expiration Date"
                                        value={formatDate(certification.samExpirationDate)}
                                    />
                                </GridItem>
                            </Grid>
                        </CardBody>
                    </Card>
                )}

                {/* 8(a) Details */}
                {certification.certificationType === 'EIGHT_A' && (
                    <Card variant="outlined">
                        <CardHeader>
                            <Text variant="heading6" weight="semibold">
                                8(a) Program Details
                            </Text>
                        </CardHeader>
                        <CardBody>
                            <Grid columns={2} gap="md">
                                <GridItem>
                                    <DetailRow
                                        label="8(a) Entry Date"
                                        value={formatDate(certification.eightAEntryDate)}
                                    />
                                </GridItem>
                                <GridItem>
                                    <DetailRow
                                        label="8(a) Graduation Date"
                                        value={formatDate(certification.eightAGraduationDate)}
                                    />
                                </GridItem>
                            </Grid>
                        </CardBody>
                    </Card>
                )}

                {/* Additional Information */}
                <Card variant="outlined">
                    <CardHeader>
                        <Text variant="heading6" weight="semibold">
                            Additional Information
                        </Text>
                    </CardHeader>
                    <CardBody>
                        <Stack spacing="md">
                            {certification.description !== null && certification.description.length > 0 && (
                                <DetailRow label="Description" value={certification.description}/>
                            )}
                            <Grid columns={2} gap="md">
                                <GridItem>
                                    <DetailRow label="NAICS Code" value={certification.naicsCode}/>
                                </GridItem>
                                <GridItem>
                                    <DetailRow label="Size Standard" value={certification.sizeStandard}/>
                                </GridItem>
                            </Grid>
                            <DetailRow
                                label="Document"
                                value={certification.documentUrl}
                                isLink={true}
                            />
                            {certification.notes !== null && certification.notes.length > 0 && (
                                <DetailRow label="Notes" value={certification.notes}/>
                            )}
                        </Stack>
                    </CardBody>
                </Card>

                {/* Metadata */}
                <Card variant="outlined">
                    <CardBody padding="sm">
                        <HStack justify="between" align="center">
                            <Text variant="caption" color="muted">
                                Created: {new Date(certification.createdAt).toLocaleString()}
                            </Text>
                            <Text variant="caption" color="muted">
                                Updated: {new Date(certification.updatedAt).toLocaleString()}
                            </Text>
                        </HStack>
                    </CardBody>
                </Card>
            </Stack>
        </Section>
    );
}

export default CertificationDetailPage;
