/**
 * MapPage
 *
 * Geographic visualization page for opportunity data.
 * Shows a choropleth map of the US with opportunity counts by state.
 */

import {useCallback, useState} from 'react';

import {Box, Card, CardBody, CardHeader, Flex, Grid, GridItem, Heading, Text} from '@/components/catalyst';
import {Button} from '@/components/catalyst/primitives/Button';
import {
    ColorMetric,
    DEFAULT_MAP_FILTERS,
    MapFilters as MapFiltersType,
    MapFilters,
    StateRankingSidebar,
    USChoroplethMap,
    useFilterOptions,
    useMapData,
} from '@/components/domain/map';
import type {Opportunity} from '@/components/domain/opportunity/Opportunity.types';
import {useDarkMode} from '@/hooks';

/**
 * Props for the MapPage component
 */
export interface MapPageProps {
    /** Array of opportunities to visualize */
    opportunities: Opportunity[];
    /** Callback when navigation is requested */
    onNavigate?: (section: string) => void;
}

/**
 * MapPage component - Geographic visualization of opportunities
 */
export function MapPage({opportunities, onNavigate}: MapPageProps) {
    const {isDark} = useDarkMode();
    const [filters, setFilters] = useState<MapFiltersType>(DEFAULT_MAP_FILTERS);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [colorMetric, setColorMetric] = useState<ColorMetric>('count');

    // Aggregate data with filters
    const mapData = useMapData(opportunities, filters);
    const filterOptions = useFilterOptions(opportunities);

    // Handle state selection
    const handleStateClick = useCallback((stateCode: string) => {
        setSelectedState((prev) => (prev === stateCode ? null : stateCode));
    }, []);

    // Handle metric toggle
    const handleMetricToggle = useCallback(() => {
        setColorMetric((prev) => (prev === 'count' ? 'value' : 'count'));
    }, []);

    // Get selected state data
    const selectedStateData = selectedState !== null ? mapData.byState.get(selectedState) ?? null : null;

    return (
        <Box className="space-y-6">
            {/* Page Header */}
            <Flex justify="between" align="center">
                <Box>
                    <Heading level={1}>Opportunity Map</Heading>
                    <Text className="mt-1 text-on-surface-variant">
                        Geographic distribution of contracting opportunities across the United States
                    </Text>
                </Box>

                {/* Metric Toggle */}
                <Flex gap="sm" align="center">
                    <Text className="text-sm text-on-surface-variant">Color by:</Text>
                    <Button
                        variant={colorMetric === 'count' ? 'solid' : 'outline'}
                        size="sm"
                        onClick={() => setColorMetric('count')}
                    >
                        Count
                    </Button>
                    <Button
                        variant={colorMetric === 'value' ? 'solid' : 'outline'}
                        size="sm"
                        onClick={() => setColorMetric('value')}
                    >
                        Value
                    </Button>
                </Flex>
            </Flex>

            {/* Summary Stats */}
            <Grid columns={4} gap="md">
                <GridItem>
                    <Card>
                        <CardBody>
                            <Text className="text-xs uppercase tracking-wide text-on-surface-variant">
                                Total Opportunities
                            </Text>
                            <Text className="mt-1 text-2xl font-semibold text-on-surface">
                                {mapData.totals.count.toLocaleString()}
                            </Text>
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem>
                    <Card>
                        <CardBody>
                            <Text className="text-xs uppercase tracking-wide text-on-surface-variant">
                                States with Data
                            </Text>
                            <Text className="mt-1 text-2xl font-semibold text-on-surface">
                                {mapData.totals.statesWithData}
                            </Text>
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem>
                    <Card>
                        <CardBody>
                            <Text className="text-xs uppercase tracking-wide text-on-surface-variant">
                                Total Estimated Value
                            </Text>
                            <Text className="mt-1 text-2xl font-semibold text-on-surface">
                                {mapData.totals.value >= 1_000_000
                                    ? `$${(mapData.totals.value / 1_000_000).toFixed(1)}M`
                                    : `$${mapData.totals.value.toLocaleString()}`}
                            </Text>
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem>
                    <Card>
                        <CardBody>
                            <Text className="text-xs uppercase tracking-wide text-on-surface-variant">
                                Highest State
                            </Text>
                            <Text className="mt-1 text-2xl font-semibold text-on-surface">
                                {colorMetric === 'count'
                                    ? `${mapData.maxCount.toLocaleString()} opps`
                                    : mapData.maxValue >= 1_000_000
                                        ? `$${(mapData.maxValue / 1_000_000).toFixed(1)}M`
                                        : `$${mapData.maxValue.toLocaleString()}`}
                            </Text>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            {/* Main Content - Map and Sidebar */}
            <Grid columns={12} gap="lg">
                {/* Filters Sidebar */}
                <GridItem colSpan={2}>
                    <MapFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        availableAgencies={filterOptions.agencies}
                        availableNaics={filterOptions.naicsCodes}
                    />
                </GridItem>

                {/* Map */}
                <GridItem colSpan={7}>
                    <Card className="overflow-hidden">
                        <CardBody className="p-0">
                            <Box className="h-[500px]">
                                <USChoroplethMap
                                    data={mapData}
                                    selectedState={selectedState}
                                    onStateClick={handleStateClick}
                                    colorMetric={colorMetric}
                                    isDark={isDark}
                                />
                            </Box>
                        </CardBody>
                    </Card>

                    {/* Selected State Details */}
                    {selectedStateData !== null && selectedStateData !== undefined && (
                        <Card className="mt-4">
                            <CardHeader>
                                <Flex justify="between" align="center">
                                    <Heading level={3}>{selectedStateData.stateName}</Heading>
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        onClick={() => setSelectedState(null)}
                                    >
                                        Clear Selection
                                    </Button>
                                </Flex>
                            </CardHeader>
                            <CardBody>
                                <Grid columns={3} gap="md">
                                    <Box>
                                        <Text className="text-xs uppercase tracking-wide text-on-surface-variant">
                                            Opportunities
                                        </Text>
                                        <Text className="mt-1 text-lg font-semibold text-on-surface">
                                            {selectedStateData.opportunityCount.toLocaleString()}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <Text className="text-xs uppercase tracking-wide text-on-surface-variant">
                                            Total Value
                                        </Text>
                                        <Text className="mt-1 text-lg font-semibold text-on-surface">
                                            {selectedStateData.totalValue >= 1_000_000
                                                ? `$${(selectedStateData.totalValue / 1_000_000).toFixed(1)}M`
                                                : `$${selectedStateData.totalValue.toLocaleString()}`}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <Text className="text-xs uppercase tracking-wide text-on-surface-variant">
                                            Top Agencies
                                        </Text>
                                        <Text className="mt-1 text-sm text-on-surface">
                                            {selectedStateData.topAgencies.length > 0
                                                ? selectedStateData.topAgencies.slice(0, 3).join(', ')
                                                : 'N/A'}
                                        </Text>
                                    </Box>
                                </Grid>
                            </CardBody>
                        </Card>
                    )}
                </GridItem>

                {/* State Rankings */}
                <GridItem colSpan={3}>
                    <StateRankingSidebar
                        data={mapData}
                        selectedState={selectedState}
                        onStateClick={handleStateClick}
                        sortBy={colorMetric}
                        maxItems={15}
                    />
                </GridItem>
            </Grid>

            {/* Footer Note */}
            <Text className="text-center text-xs text-on-surface-variant">
                Location data based on place of performance. Some opportunities may not have location
                information available.
            </Text>
        </Box>
    );
}

export default MapPage;
