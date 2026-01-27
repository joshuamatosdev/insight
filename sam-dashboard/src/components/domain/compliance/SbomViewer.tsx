/**
 * SbomViewer - SBOM dependency tree visualization
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Text,
  Button,
  Input,
  Badge,
  RefreshIcon,
  SearchIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '../../primitives';
import {
  Card,
  CardHeader,
  CardBody,
  Section,
  SectionHeader,
  Stack,
  HStack,
  Box,
  Flex,
  Grid,
  GridItem,
} from '../../layout';
import type { SbomViewerProps, SbomComponent, CycloneDxBom } from './Compliance.types';

/**
 * StatCard for SBOM overview
 */
function SbomStatCard({
  label,
  value,
  variant = 'primary',
}: {
  label: string;
  value: string | number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}): React.ReactElement {
  return (
    <Card variant="outlined">
      <CardBody padding="sm">
        <Stack spacing="var(--spacing-1)">
          <Text variant="caption" color="muted">
            {label}
          </Text>
          <Text variant="heading5" color={variant} weight="semibold">
            {value}
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}

/**
 * ComponentCard for displaying a single SBOM component
 */
function ComponentCard({
  component,
  isExpanded,
  onToggle,
  level = 0,
}: {
  component: SbomComponent;
  isExpanded: boolean;
  onToggle: () => void;
  level?: number;
}): React.ReactElement {
  const hasDependencies =
    component.dependencies !== undefined && component.dependencies.length > 0;

  return (
    <Box
      style={{
        marginLeft: `${level * 20}px`,
        borderLeft: level > 0 ? '2px solid var(--color-border)' : undefined,
        paddingLeft: level > 0 ? 'var(--spacing-3)' : undefined,
      }}
    >
      <Card variant="outlined">
        <CardBody padding="sm">
          <HStack justify="between" align="start">
            <HStack spacing="var(--spacing-2)" align="center">
              {hasDependencies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  style={{ padding: 0, minWidth: 'auto' }}
                >
                  {isExpanded ? (
                    <ChevronDownIcon size="sm" />
                  ) : (
                    <ChevronRightIcon size="sm" />
                  )}
                </Button>
              )}
              {hasDependencies === false && (
                <Box style={{ width: '24px' }} />
              )}

              <Stack spacing="0">
                <Text variant="bodySmall" weight="medium">
                  {component.name}
                </Text>
                <HStack spacing="var(--spacing-2)" align="center">
                  <Text variant="caption" color="muted">
                    v{component.version}
                  </Text>
                  {component.license !== undefined && (
                    <Badge variant="secondary" size="sm">
                      {component.license}
                    </Badge>
                  )}
                </HStack>
              </Stack>
            </HStack>

            <Badge
              variant={component.type === 'library' ? 'info' : 'secondary'}
              size="sm"
            >
              {component.type}
            </Badge>
          </HStack>

          {component.description !== undefined &&
            component.description.length > 0 && (
              <Text
                variant="caption"
                color="muted"
                className="mt-2 ml-7"
              >
                {component.description}
              </Text>
            )}
        </CardBody>
      </Card>
    </Box>
  );
}

/**
 * Groups components by type
 */
function groupComponentsByType(
  components: SbomComponent[]
): Record<string, SbomComponent[]> {
  const groups: Record<string, SbomComponent[]> = {};
  components.forEach((component) => {
    const type = component.type || 'unknown';
    if (groups[type] === undefined) {
      groups[type] = [];
    }
    groups[type].push(component);
  });
  return groups;
}

export function SbomViewer({
  bom,
  isLoading = false,
  onRefresh,
}: SbomViewerProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(
    new Set()
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    []
  );

  const toggleComponent = useCallback((name: string) => {
    setExpandedComponents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  // Filter and group components
  const { filteredComponents, componentsByType, stats } = useMemo(() => {
    if (bom === null || bom.components === undefined) {
      return {
        filteredComponents: [],
        componentsByType: {},
        stats: { total: 0, libraries: 0, frameworks: 0 },
      };
    }

    const query = searchQuery.toLowerCase();
    const filtered =
      query.length > 0
        ? bom.components.filter(
            (c) =>
              c.name.toLowerCase().includes(query) ||
              (c.description !== undefined &&
                c.description.toLowerCase().includes(query))
          )
        : bom.components;

    const byType = groupComponentsByType(filtered);

    const libraries = bom.components.filter(
      (c) => c.type === 'library'
    ).length;
    const frameworks = bom.components.filter(
      (c) => c.type === 'framework'
    ).length;

    return {
      filteredComponents: filtered,
      componentsByType: byType,
      stats: {
        total: bom.components.length,
        libraries,
        frameworks,
      },
    };
  }, [bom, searchQuery]);

  if (isLoading) {
    return (
      <Section id="sbom-viewer">
        <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
          <Text variant="body" color="muted">
            Loading SBOM data...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (bom === null) {
    return (
      <Section id="sbom-viewer">
        <Card variant="outlined">
          <CardBody>
            <Flex
              direction="column"
              align="center"
              gap="md"
              className="p-8"
            >
              <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
                SBOM data is not available.
              </Text>
              <Text variant="caption" color="muted" style={{ textAlign: 'center' }}>
                Generate SBOM using: ./gradlew cyclonedxBom
              </Text>
              {onRefresh !== undefined && (
                <Button variant="outline" onClick={onRefresh}>
                  <HStack spacing="var(--spacing-1)" align="center">
                    <RefreshIcon size="sm" />
                    <Text as="span" variant="bodySmall">
                      Refresh
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

  return (
    <Section id="sbom-viewer">
      <SectionHeader
        title="Software Bill of Materials (SBOM)"
        actions={
          onRefresh !== undefined && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <HStack spacing="var(--spacing-1)" align="center">
                <RefreshIcon size="sm" />
                <Text as="span" variant="bodySmall">
                  Refresh
                </Text>
              </HStack>
            </Button>
          )
        }
      />

      <Stack spacing="var(--spacing-4)">
        {/* Stats Overview */}
        <Grid columns="repeat(auto-fit, minmax(150px, 1fr))" gap="var(--spacing-4)">
          <GridItem>
            <SbomStatCard label="Total Components" value={stats.total} variant="primary" />
          </GridItem>
          <GridItem>
            <SbomStatCard label="Libraries" value={stats.libraries} variant="info" />
          </GridItem>
          <GridItem>
            <SbomStatCard label="Frameworks" value={stats.frameworks} variant="success" />
          </GridItem>
          <GridItem>
            <SbomStatCard
              label="SBOM Version"
              value={bom.specVersion ?? 'Unknown'}
              variant="info"
            />
          </GridItem>
        </Grid>

        {/* Metadata */}
        {bom.metadata !== undefined && (
          <Card variant="outlined">
            <CardHeader>
              <Text variant="heading6" weight="semibold">
                SBOM Metadata
              </Text>
            </CardHeader>
            <CardBody>
              <Grid columns="1fr 1fr" gap="var(--spacing-3)">
                <GridItem>
                  <Text variant="caption" color="muted">
                    Format
                  </Text>
                  <Text variant="bodySmall">{bom.bomFormat}</Text>
                </GridItem>
                <GridItem>
                  <Text variant="caption" color="muted">
                    Spec Version
                  </Text>
                  <Text variant="bodySmall">{bom.specVersion}</Text>
                </GridItem>
                {bom.metadata.timestamp !== undefined && (
                  <GridItem>
                    <Text variant="caption" color="muted">
                      Generated
                    </Text>
                    <Text variant="bodySmall">
                      {new Date(bom.metadata.timestamp).toLocaleString()}
                    </Text>
                  </GridItem>
                )}
                {bom.metadata.component !== undefined && (
                  <GridItem>
                    <Text variant="caption" color="muted">
                      Application
                    </Text>
                    <Text variant="bodySmall">
                      {bom.metadata.component.name} v{bom.metadata.component.version}
                    </Text>
                  </GridItem>
                )}
              </Grid>
            </CardBody>
          </Card>
        )}

        {/* Search */}
        <Card variant="outlined">
          <CardBody padding="sm">
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search components..."
              leftIcon={<SearchIcon size="sm" color="muted" />}
              fullWidth
            />
          </CardBody>
        </Card>

        {/* Components by Type */}
        {Object.entries(componentsByType).map(([type, components]) => (
          <Card key={type} variant="outlined">
            <CardHeader>
              <HStack justify="between" align="center">
                <Text variant="heading6" weight="semibold" style={{ textTransform: 'capitalize' }}>
                  {type}s
                </Text>
                <Badge variant="secondary" size="sm">
                  {components.length}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stack spacing="var(--spacing-2)">
                {components.slice(0, 20).map((component) => (
                  <ComponentCard
                    key={`${component.name}-${component.version}`}
                    component={component}
                    isExpanded={expandedComponents.has(component.name)}
                    onToggle={() => toggleComponent(component.name)}
                  />
                ))}
                {components.length > 20 && (
                  <Text
                    variant="caption"
                    color="muted"
                    className="text-center mt-2"
                  >
                    +{components.length - 20} more {type}s
                  </Text>
                )}
              </Stack>
            </CardBody>
          </Card>
        ))}

        {filteredComponents.length === 0 && searchQuery.length > 0 && (
          <Card variant="outlined">
            <CardBody>
              <Flex justify="center" align="center" className="p-6">
                <Text variant="body" color="muted">
                  No components found matching "{searchQuery}"
                </Text>
              </Flex>
            </CardBody>
          </Card>
        )}
      </Stack>
    </Section>
  );
}

export default SbomViewer;
