/**
 * SbomDashboardPage - SBOM visualization dashboard
 */

import { Text, Button, FileCheckIcon, DownloadIcon, RefreshIcon } from '../../components/primitives';
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
  Box,
} from '../../components/layout';
import { SbomViewer } from '../../components/domain/compliance';
import { useSbom } from '../../hooks';

export function SbomDashboardPage(): React.ReactElement {
  const { info, bom, vulnerabilities, isLoading, error, refresh } = useSbom();

  const handleDownloadCycloneDx = () => {
    window.open('/api/v1/sbom/cyclonedx', '_blank');
  };

  const handleDownloadSpdx = () => {
    window.open('/api/v1/sbom/spdx', '_blank');
  };

  if (isLoading) {
    return (
      <Section id="sbom-dashboard">
        <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
          <Text variant="body" color="muted">
            Loading SBOM data...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (error !== null) {
    return (
      <Section id="sbom-dashboard">
        <SectionHeader
          title="Software Bill of Materials (SBOM)"
          icon={<FileCheckIcon size="lg" />}
        />
        <Card variant="outlined">
          <CardBody>
            <Flex
              direction="column"
              align="center"
              gap="md"
              style={{ padding: 'var(--spacing-8)' }}
            >
              <Text variant="body" color="danger">
                Error loading SBOM data: {error.message}
              </Text>
              <Button variant="outline" onClick={refresh}>
                <HStack spacing="var(--spacing-1)" align="center">
                  <RefreshIcon size="sm" />
                  <Text as="span" variant="bodySmall">
                    Try Again
                  </Text>
                </HStack>
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </Section>
    );
  }

  return (
    <Section id="sbom-dashboard">
      <SectionHeader
        title="Software Bill of Materials (SBOM)"
        icon={<FileCheckIcon size="lg" />}
        actions={
          <HStack spacing="var(--spacing-2)">
            <Button variant="outline" size="sm" onClick={refresh}>
              <HStack spacing="var(--spacing-1)" align="center">
                <RefreshIcon size="sm" />
                <Text as="span" variant="bodySmall">
                  Refresh
                </Text>
              </HStack>
            </Button>
            {info?.cyclonedxAvailable && (
              <Button variant="outline" size="sm" onClick={handleDownloadCycloneDx}>
                <HStack spacing="var(--spacing-1)" align="center">
                  <DownloadIcon size="sm" />
                  <Text as="span" variant="bodySmall">
                    CycloneDX
                  </Text>
                </HStack>
              </Button>
            )}
            {info?.spdxAvailable && (
              <Button variant="outline" size="sm" onClick={handleDownloadSpdx}>
                <HStack spacing="var(--spacing-1)" align="center">
                  <DownloadIcon size="sm" />
                  <Text as="span" variant="bodySmall">
                    SPDX
                  </Text>
                </HStack>
              </Button>
            )}
          </HStack>
        }
      />

      <Stack spacing="var(--spacing-4)">
        {/* Info Card */}
        {info !== null && (
          <Card variant="outlined">
            <CardHeader>
              <Text variant="heading6" weight="semibold">
                SBOM Information
              </Text>
            </CardHeader>
            <CardBody>
              <Grid columns="1fr 1fr 1fr" gap="var(--spacing-4)">
                <GridItem>
                  <Box>
                    <Text variant="caption" color="muted">
                      Application
                    </Text>
                    <Text variant="body">{info.application}</Text>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box>
                    <Text variant="caption" color="muted">
                      SBOM Version
                    </Text>
                    <Text variant="body">{info.sbomVersion}</Text>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box>
                    <Text variant="caption" color="muted">
                      Standard
                    </Text>
                    <Text variant="body">{info.standard}</Text>
                  </Box>
                </GridItem>
              </Grid>

              <Box style={{ marginTop: 'var(--spacing-4)' }}>
                <Text variant="caption" color="muted">
                  Available Formats
                </Text>
                <HStack spacing="var(--spacing-2)" style={{ marginTop: 'var(--spacing-1)' }}>
                  <Text
                    variant="bodySmall"
                    color={info.cyclonedxAvailable ? 'success' : 'muted'}
                  >
                    CycloneDX: {info.cyclonedxAvailable ? 'Available' : 'Not Available'}
                  </Text>
                  <Text variant="bodySmall" color="muted">
                    |
                  </Text>
                  <Text
                    variant="bodySmall"
                    color={info.spdxAvailable ? 'success' : 'muted'}
                  >
                    SPDX: {info.spdxAvailable ? 'Available' : 'Not Available'}
                  </Text>
                </HStack>
              </Box>

              {info.cyclonedxAvailable === false && info.spdxAvailable === false && (
                <Box
                  style={{
                    marginTop: 'var(--spacing-4)',
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--color-warning-light)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Text variant="bodySmall" color="warning">
                    SBOM not generated. Run the following command to generate:
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      fontFamily: 'monospace',
                      marginTop: 'var(--spacing-1)',
                      display: 'block',
                    }}
                  >
                    {info.generationCommand}
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>
        )}

        {/* Vulnerability Info */}
        {vulnerabilities !== null && (
          <Card variant="outlined">
            <CardHeader>
              <Text variant="heading6" weight="semibold">
                Vulnerability Scanning
              </Text>
            </CardHeader>
            <CardBody>
              <Stack spacing="var(--spacing-3)">
                <HStack spacing="var(--spacing-2)" align="center">
                  <Text variant="caption" color="muted">
                    Status:
                  </Text>
                  <Text
                    variant="bodySmall"
                    color={
                      vulnerabilities.status === 'not_implemented' ? 'warning' : 'success'
                    }
                  >
                    {vulnerabilities.status === 'not_implemented'
                      ? 'Not Configured'
                      : vulnerabilities.status}
                  </Text>
                </HStack>

                <Text variant="bodySmall" color="muted">
                  {vulnerabilities.message}
                </Text>

                {vulnerabilities.recommendation.length > 0 && (
                  <Box
                    style={{
                      padding: 'var(--spacing-3)',
                      backgroundColor: 'var(--color-info-light)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <Text variant="caption" color="info" weight="medium">
                      Recommendation:
                    </Text>
                    <Text
                      variant="caption"
                      style={{
                        fontFamily: 'monospace',
                        marginTop: 'var(--spacing-1)',
                        display: 'block',
                      }}
                    >
                      {vulnerabilities.recommendation}
                    </Text>
                  </Box>
                )}
              </Stack>
            </CardBody>
          </Card>
        )}

        {/* SBOM Viewer */}
        <SbomViewer bom={bom} onRefresh={refresh} />
      </Stack>
    </Section>
  );
}

export default SbomDashboardPage;
