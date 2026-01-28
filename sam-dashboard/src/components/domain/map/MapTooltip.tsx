/**
 * MapTooltip Component
 *
 * Displays hover information for a state on the choropleth map.
 */

import {Box, Flex, Text} from '@/components/catalyst';

import type {MapTooltipProps} from './Map.types';

/**
 * Format currency value for display
 */
function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format number with commas
 */
function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function MapTooltip({stateData, x, y, visible}: MapTooltipProps) {
  if (!visible || stateData === null) {
    return null;
  }

  // Position tooltip with offset from cursor
  const tooltipStyle = {
    position: 'absolute' as const,
    left: x + 16,
    top: y - 8,
    zIndex: 50,
    pointerEvents: 'none' as const,
    transform: 'translateY(-50%)',
  };

  return (
    <Box
      style={tooltipStyle}
      className="rounded-lg border border-outline-variant bg-surface-container p-3 shadow-lg"
    >
      {/* State Name */}
      <Text className="text-sm font-semibold text-on-surface">
        {stateData.stateName}
      </Text>

      {/* Stats */}
      <Flex direction="column" gap="xs" className="mt-2">
        <Flex justify="between" gap="md">
          <Text className="text-xs text-on-surface-variant">Opportunities:</Text>
          <Text className="text-xs font-medium text-on-surface">
            {formatNumber(stateData.opportunityCount)}
          </Text>
        </Flex>

        <Flex justify="between" gap="md">
          <Text className="text-xs text-on-surface-variant">Total Value:</Text>
          <Text className="text-xs font-medium text-on-surface">
            {formatCurrency(stateData.totalValue)}
          </Text>
        </Flex>
      </Flex>

      {/* Top Agencies (if any) */}
      {stateData.topAgencies.length > 0 && (
        <Box className="mt-2 border-t border-outline-variant pt-2">
          <Text className="text-xs text-on-surface-variant">Top Agencies:</Text>
          <Flex direction="column" gap="none" className="mt-1">
            {stateData.topAgencies.slice(0, 3).map((agency) => (
              <Text key={agency} className="truncate text-xs text-on-surface">
                {agency}
              </Text>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
}

export default MapTooltip;
