/**
 * SbomDashboardPage - SBOM visualization dashboard
 */

import {Button, DownloadIcon, FileCheckIcon, RefreshIcon, Text} from '../../components/catalyst/primitives';
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
import {SbomViewer} from '../../components/domain/compliance';
import {useSbom} from '../../hooks';

export function SbomDashboardPage(): React.ReactElement {
    const {info, bom, vulnerabilities, isLoading, error, refresh} = useSbom();

    const handleDownloadCycloneDx = () => {
        window.open('/sbom/cyclonedx', '_blank');
    };

    const handleDownloadSpdx = () => {
        window.open('/sbom/spdx', '_blank');
    };

    if (isLoading) {
        return (
            <Section id="sbom-dashboard">
                <Flex justify="center" align="center">
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
                    icon={<FileCheckIcon size="lg"/>}
                />
                <Card variant="outlined">
                    <CardBody>
                        <Flex
                            direction="column"
                            align="center"
                            gap="md"
                        >
                            <Text variant="body" color="danger">
                                Error loading SBOM data: {error.message}
                            </Text>
                            <Button variant="outline" onClick={refresh}>
                                <HStack spacing="xs" align="center">
                                    <RefreshIcon size="sm"/>
                                    <Text as="span" variant="bodySmall" color="muted">
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
                icon={<FileCheckIcon size="lg"/>}
                actions={
                    <HStack spacing="sm">
                        <Button variant="outline" size="sm" onClick={refresh}>
                            <HStack spacing="xs" align="center">
                                <RefreshIcon size="sm"/>
                                <Text as="span" variant="bodySmall" color="muted">
                                    Refresh
                                </Text>
                            </HStack>
                        </Button>
                        {info?.cyclonedxAvailable && (
                            <Button variant="outline" size="sm" onClick={handleDownloadCycloneDx}>
                                <HStack spacing="xs" align="center">
                                    <DownloadIcon size="sm"/>
                                    <Text as="span" variant="bodySmall" color="muted">
                                        CycloneDX
                                    </Text>
                                </HStack>
                            </Button>
                        )}
                        {info?.spdxAvailable && (
                            <Button variant="outline" size="sm" onClick={handleDownloadSpdx}>
                                <HStack spacing="xs" align="center">
                                    <DownloadIcon size="sm"/>
                                    <Text as="span" variant="bodySmall" color="muted">
                                        SPDX
                                    </Text>
                                </HStack>
                            </Button>
                        )}
                    </HStack>
                }
            />

            <Stack spacing="md">
                {/* Info Card */}
                {info !== null && (
                    <Card variant="outlined">
                        <CardHeader>
                            <Text variant="heading6" weight="semibold">
                                SBOM Information
                            </Text>
                        </CardHeader>
                        <CardBody>
                            <Grid columns={3} gap="md">
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

                            <Box>
                                <Text variant="caption" color="muted">
                                    Available Formats
                                </Text>
                                <HStack spacing="sm">
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
                                <Box>
                                    <Text variant="bodySmall" color="warning">
                                        SBOM not generated. Run the following command to generate:
                                    </Text>
                                    <Text
                                        variant="caption"
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
                            <Stack spacing="md">
                                <HStack spacing="sm" align="center">
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
                                    <Box>
                                        <Text variant="caption" color="info" weight="medium">
                                            Recommendation:
                                        </Text>
                                        <Text
                                            variant="caption"
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
                <SbomViewer bom={bom} onRefresh={refresh}/>
            </Stack>
        </Section>
    );
}

export default SbomDashboardPage;
