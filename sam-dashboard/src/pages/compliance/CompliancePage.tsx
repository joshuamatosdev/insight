/**
 * CompliancePage - Overview dashboard for compliance management
 */

import { useState, useCallback } from 'react';
import {
  Text,
  Badge,
  Button,
  FileCheckIcon,
  ShieldLockIcon,
  BellIcon,
  PlusIcon,
} from '../../components/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  Stack,
  HStack,
  Flex,
  Grid,
  GridItem,
} from '../../components/layout';
import {
  CertificationList,
  ExpirationAlert,
} from '../../components/domain/compliance';
import { useComplianceOverview } from '../../hooks';
import type { Certification, SecurityClearance } from '../../types/compliance.types';

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
      style={onClick !== undefined ? { cursor: 'pointer' } : undefined}
    >
      <CardBody>
        <HStack spacing="var(--spacing-3)" align="center">
          {icon}
          <Stack spacing="0">
            <Text variant="caption" color="muted">
              {label}
            </Text>
            <HStack spacing="var(--spacing-2)" align="baseline">
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
        <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
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
              className="p-8"
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
        icon={<FileCheckIcon size="lg" />}
        actions={
          <HStack spacing="var(--spacing-2)">
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

      <Stack spacing="var(--spacing-6)">
        {/* Stats Overview */}
        <Grid columns="repeat(auto-fit, minmax(200px, 1fr))" gap="var(--spacing-4)">
          <GridItem>
            <StatCard
              icon={<FileCheckIcon size="md" color="success" />}
              label="Active Certifications"
              value={activeCertifications}
              subValue={`of ${certifications.length} total`}
              variant="success"
              onClick={handleViewCertifications}
            />
          </GridItem>
          <GridItem>
            <StatCard
              icon={<ShieldLockIcon size="md" color="primary" />}
              label="Active Clearances"
              value={activeClearances}
              subValue={`of ${clearances.length} total`}
              variant="primary"
              onClick={handleViewClearances}
            />
          </GridItem>
          <GridItem>
            <StatCard
              icon={<BellIcon size="md" color="warning" />}
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
        <Grid columns="1fr 1fr 1fr" gap="var(--spacing-4)">
          <GridItem>
            <Card
              variant="outlined"
              onClick={handleViewCertifications}
              style={{ cursor: 'pointer' }}
            >
              <CardBody>
                <Flex direction="column" align="center" gap="sm">
                  <FileCheckIcon size="lg" color="primary" />
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
              style={{ cursor: 'pointer' }}
            >
              <CardBody>
                <Flex direction="column" align="center" gap="sm">
                  <ShieldLockIcon size="lg" color="primary" />
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
              style={{ cursor: 'pointer' }}
            >
              <CardBody>
                <Flex direction="column" align="center" gap="sm">
                  <FileCheckIcon size="lg" color="primary" />
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
                <HStack spacing="var(--spacing-2)" align="center">
                  <FileCheckIcon size="sm" color="primary" />
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
                className="p-8"
              >
                <FileCheckIcon size="xl" color="muted" />
                <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
                  No compliance items configured yet.
                </Text>
                <HStack spacing="var(--spacing-2)">
                  <Button variant="primary" onClick={handleViewCertifications}>
                    <HStack spacing="var(--spacing-1)" align="center">
                      <PlusIcon size="sm" />
                      <Text as="span" variant="bodySmall" color="white">
                        Add Certification
                      </Text>
                    </HStack>
                  </Button>
                  <Button variant="outline" onClick={handleViewClearances}>
                    <HStack spacing="var(--spacing-1)" align="center">
                      <PlusIcon size="sm" />
                      <Text as="span" variant="bodySmall">
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
