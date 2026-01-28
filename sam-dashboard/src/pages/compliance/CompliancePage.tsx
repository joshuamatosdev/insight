/**
 * CompliancePage - Overview dashboard for compliance management
 */

import {useCallback} from 'react';
import {BellIcon, Button, FileCheckIcon, PlusIcon, ShieldLockIcon, Text,} from '../../components/catalyst/primitives';
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
} from '../../components/catalyst/layout';
import {CertificationList, ExpirationAlert,} from '../../components/domain/compliance';
import {useComplianceOverview} from '../../hooks';
import type {Certification, SecurityClearance} from '../../types/compliance.types';

interface CompliancePageProps {
    onNavigate?: (section: string) => void;
}

/**
 * StatCard for compliance overview
 */
function StatCard({
                      icon,
                      label,
                      value,
                      subValue,
                      variant = 'primary',
                      onClick,
                  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    subValue?: string;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    onClick?: () => void;
}): React.ReactElement {
    return (
        <Card
            variant="outlined"
            onClick={onClick}
        >
            <CardBody>
                <HStack spacing="md" align="center">
                    {icon}
                    <Stack spacing="0">
                        <Text variant="caption" color="muted">
                            {label}
                        </Text>
                        <HStack spacing="sm" align="baseline">
                            <Text variant="heading4" color={variant} weight="semibold">
                                {value}
                            </Text>
                            {subValue !== undefined && (
                                <Text variant="caption" color="muted">
                                    {subValue}
                                </Text>
                            )}
                        </HStack>
                    </Stack>
                </HStack>
            </CardBody>
        </Card>
    );
}

export function CompliancePage({
                                   onNavigate,
                               }: CompliancePageProps): React.ReactElement {
    const {
        certifications,
        clearances,
        expiringCertifications,
        expiringClearances,
        isLoading,
        error,
        refresh,
    } = useComplianceOverview();

    const handleViewCertifications = useCallback(() => {
        if (onNavigate !== undefined) {
            onNavigate('certifications');
        }
    }, [onNavigate]);

    const handleViewClearances = useCallback(() => {
        if (onNavigate !== undefined) {
            onNavigate('clearances');
        }
    }, [onNavigate]);

    const handleViewSbom = useCallback(() => {
        if (onNavigate !== undefined) {
            onNavigate('sbom');
        }
    }, [onNavigate]);

    const handleViewCertification = useCallback(
        (certification: Certification) => {
            if (onNavigate !== undefined) {
                onNavigate(`certification-${certification.id}`);
            }
        },
        [onNavigate]
    );

    const handleViewClearance = useCallback(
        (clearance: SecurityClearance) => {
            if (onNavigate !== undefined) {
                onNavigate('clearances');
            }
        },
        [onNavigate]
    );

    // Calculate stats
    const activeCertifications = certifications.filter(
        (c) => c.status === 'ACTIVE'
    ).length;
    const activeClearances = clearances.filter(
        (c) => c.status === 'ACTIVE'
    ).length;

    if (isLoading) {
        return (
            <Section id="compliance">
                <Flex justify="center" align="center">
                    <Text variant="body" color="muted">
                        Loading compliance data...
                    </Text>
                </Flex>
            </Section>
        );
    }

    if (error !== null) {
        return (
            <Section id="compliance">
                <Card variant="outlined">
                    <CardBody>
                        <Flex
                            direction="column"
                            align="center"
                            gap="md"
                        >
                            <Text variant="body" color="danger">
                                Error loading compliance data: {error.message}
                            </Text>
                            <Button variant="outline" onClick={refresh}>
                                Try Again
                            </Button>
                        </Flex>
                    </CardBody>
                </Card>
            </Section>
        );
    }

    return (
        <Section id="compliance">
            <SectionHeader
                title="Compliance Management"
                icon={<FileCheckIcon size="lg"/>}
                actions={
                    <HStack spacing="sm">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewCertifications}
                        >
                            View All Certifications
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewClearances}
                        >
                            View All Clearances
                        </Button>
                    </HStack>
                }
            />

            <Stack spacing="lg">
                {/* Stats Overview */}
                <Grid columns="repeat(auto-fit, minmax(200px, 1fr))" gap="md">
                    <GridItem>
                        <StatCard
                            icon={<FileCheckIcon size="md" color="success"/>}
                            label="Active Certifications"
                            value={activeCertifications}
                            subValue={`of ${certifications.length} total`}
                            variant="success"
                            onClick={handleViewCertifications}
                        />
                    </GridItem>
                    <GridItem>
                        <StatCard
                            icon={<ShieldLockIcon size="md" color="primary"/>}
                            label="Active Clearances"
                            value={activeClearances}
                            subValue={`of ${clearances.length} total`}
                            variant="primary"
                            onClick={handleViewClearances}
                        />
                    </GridItem>
                    <GridItem>
                        <StatCard
                            icon={<BellIcon size="md" color="warning"/>}
                            label="Expiring Soon"
                            value={expiringCertifications.length + expiringClearances.length}
                            subValue="within 90 days"
                            variant="warning"
                        />
                    </GridItem>
                </Grid>

                {/* Expiring Items Alert */}
                {(expiringCertifications.length > 0 || expiringClearances.length > 0) && (
                    <ExpirationAlert
                        expiringCertifications={expiringCertifications}
                        expiringClearances={expiringClearances}
                        daysThreshold={90}
                        onViewCertification={handleViewCertification}
                        onViewClearance={handleViewClearance}
                    />
                )}

                {/* Quick Actions */}
                <Grid columns={3} gap="md">
                    <GridItem>
                        <Card
                            variant="outlined"
                            onClick={handleViewCertifications}
                        >
                            <CardBody>
                                <Flex direction="column" align="center" gap="sm">
                                    <FileCheckIcon size="lg" color="primary"/>
                                    <Text variant="body" weight="medium">
                                        Certifications
                                    </Text>
                                    <Text variant="caption" color="muted">
                                        Manage business certifications
                                    </Text>
                                </Flex>
                            </CardBody>
                        </Card>
                    </GridItem>

                    <GridItem>
                        <Card
                            variant="outlined"
                            onClick={handleViewClearances}
                        >
                            <CardBody>
                                <Flex direction="column" align="center" gap="sm">
                                    <ShieldLockIcon size="lg" color="primary"/>
                                    <Text variant="body" weight="medium">
                                        Security Clearances
                                    </Text>
                                    <Text variant="caption" color="muted">
                                        Track personnel and facility clearances
                                    </Text>
                                </Flex>
                            </CardBody>
                        </Card>
                    </GridItem>

                    <GridItem>
                        <Card
                            variant="outlined"
                            onClick={handleViewSbom}
                        >
                            <CardBody>
                                <Flex direction="column" align="center" gap="sm">
                                    <FileCheckIcon size="lg" color="primary"/>
                                    <Text variant="body" weight="medium">
                                        SBOM Dashboard
                                    </Text>
                                    <Text variant="caption" color="muted">
                                        Software Bill of Materials
                                    </Text>
                                </Flex>
                            </CardBody>
                        </Card>
                    </GridItem>
                </Grid>

                {/* Recent Certifications */}
                {certifications.length > 0 && (
                    <Card variant="outlined">
                        <CardHeader>
                            <HStack justify="between" align="center">
                                <HStack spacing="sm" align="center">
                                    <FileCheckIcon size="sm" color="primary"/>
                                    <Text variant="heading6" weight="semibold">
                                        Recent Certifications
                                    </Text>
                                </HStack>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleViewCertifications}
                                >
                                    View All
                                </Button>
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <CertificationList
                                certifications={certifications.slice(0, 4)}
                                onViewDetails={handleViewCertification}
                            />
                        </CardBody>
                    </Card>
                )}

                {/* Empty State */}
                {certifications.length === 0 && clearances.length === 0 && (
                    <Card variant="outlined">
                        <CardBody>
                            <Flex
                                direction="column"
                                align="center"
                                gap="md"
                            >
                                <FileCheckIcon size="xl" color="muted"/>
                                <Text variant="body" color="muted">
                                    No compliance items configured yet.
                                </Text>
                                <HStack spacing="sm">
                                    <Button variant="primary" onClick={handleViewCertifications}>
                                        <HStack spacing="xs" align="center">
                                            <PlusIcon size="sm"/>
                                            <Text as="span" variant="bodySmall" color="white">
                                                Add Certification
                                            </Text>
                                        </HStack>
                                    </Button>
                                    <Button variant="outline" onClick={handleViewClearances}>
                                        <HStack spacing="xs" align="center">
                                            <PlusIcon size="sm"/>
                                            <Text as="span" variant="bodySmall" color="muted">
                                                Add Clearance
                                            </Text>
                                        </HStack>
                                    </Button>
                                </HStack>
                            </Flex>
                        </CardBody>
                    </Card>
                )}
            </Stack>
        </Section>
    );
}

export default CompliancePage;
