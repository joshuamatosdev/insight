/**
 * MapLegend Component
 *
 * Displays the color scale legend for the choropleth map.
 */

import {Box, Flex, Text} from '@/components/catalyst';

import type {MapLegendProps} from './Map.types';

// Match color ranges from USChoroplethMap
const LIGHT_GRADIENT =
    'linear-gradient(to right, rgb(247, 251, 255), rgb(198, 219, 239), rgb(107, 174, 214), rgb(33, 113, 181), rgb(8, 48, 107))';

const DARK_GRADIENT =
    'linear-gradient(to right, rgb(30, 30, 46), rgb(69, 62, 132), rgb(110, 95, 201), rgb(160, 140, 235), rgb(220, 200, 255))';

/**
 * Format large numbers for legend display
 */
function formatLegendValue(value: number, metric: 'count' | 'value'): string {
    if (metric === 'value') {
        if (value >= 1_000_000_000) {
            return `$${(value / 1_000_000_000).toFixed(0)}B`;
        }
        if (value >= 1_000_000) {
            return `$${(value / 1_000_000).toFixed(0)}M`;
        }
        if (value >= 1_000) {
            return `$${(value / 1_000).toFixed(0)}K`;
        }
        return `$${value.toFixed(0)}`;
    }
    // Count metric
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toFixed(0);
}

export function MapLegend({min, max, metric, isDark = false, className}: MapLegendProps) {
    const gradient = isDark ? DARK_GRADIENT : LIGHT_GRADIENT;
    const metricLabel = metric === 'count' ? 'Opportunities' : 'Total Value';

    return (
        <Box
            className={`rounded-lg border border-outline-variant bg-surface-container/90 p-3 backdrop-blur-sm ${className ?? ''}`}
        >
            {/* Label */}
            <Text className="mb-2 text-xs font-medium text-on-surface-variant">{metricLabel}</Text>

            {/* Gradient bar */}
            <Box
                className="h-3 w-32 rounded"
                style={{background: gradient}}
            />

            {/* Min/Max labels */}
            <Flex justify="between" className="mt-1">
                <Text className="text-xs text-on-surface-variant">
                    {formatLegendValue(min, metric)}
                </Text>
                <Text className="text-xs text-on-surface-variant">
                    {formatLegendValue(max, metric)}
                </Text>
            </Flex>
        </Box>
    );
}

export default MapLegend;
