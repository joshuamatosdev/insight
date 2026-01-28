/**
 * StateRankingSidebar Component
 *
 * Displays a ranked list of states by opportunity count or value.
 */

import clsx from 'clsx';
import {useMemo} from 'react';

import {Box, Flex, Text} from '@/components/catalyst';

import type {StateRankingSidebarProps} from './Map.types';

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

export function StateRankingSidebar({
  data,
  selectedState,
  onStateClick,
  maxItems = 10,
  sortBy = 'count',
  className,
}: StateRankingSidebarProps) {
  // Sort states by selected metric
  const rankedStates = useMemo(() => {
    const states = Array.from(data.byState.values());

    states.sort((a, b) => {
      if (sortBy === 'count') {
        return b.opportunityCount - a.opportunityCount;
      }
      return b.totalValue - a.totalValue;
    });

    return states.slice(0, maxItems);
  }, [data.byState, sortBy, maxItems]);

  const handleStateClick = (stateCode: string) => {
    if (onStateClick !== undefined) {
      onStateClick(stateCode);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, stateCode: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStateClick(stateCode);
    }
  };

  if (rankedStates.length === 0) {
    return (
      <Box className={clsx('rounded-lg border border-outline-variant bg-surface-container p-4', className)}>
        <Text className="text-center text-sm text-on-surface-variant">
          No location data available
        </Text>
      </Box>
    );
  }

  return (
    <Box className={clsx('rounded-lg border border-outline-variant bg-surface-container', className)}>
      {/* Header */}
      <Box className="border-b border-outline-variant p-4">
        <Text className="text-sm font-semibold text-on-surface">
          Top States
        </Text>
        <Text className="mt-1 text-xs text-on-surface-variant">
          by {sortBy === 'count' ? 'opportunity count' : 'total value'}
        </Text>
      </Box>

      {/* Ranked List */}
      <Box className="divide-y divide-outline-variant">
        {rankedStates.map((state, index) => {
          const isSelected = selectedState === state.stateCode;
          const rank = index + 1;

          return (
            <Box
              key={state.stateCode}
              className={clsx(
                'cursor-pointer p-3 transition-colors',
                'hover:bg-surface-container-high',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                isSelected && 'bg-surface-container-highest'
              )}
              onClick={() => handleStateClick(state.stateCode)}
              onKeyDown={(e) => handleKeyDown(e, state.stateCode)}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              aria-label={`${state.stateName}: ${formatNumber(state.opportunityCount)} opportunities, ${formatCurrency(state.totalValue)}`}
            >
              <Flex align="start" gap="sm">
                {/* Rank Number */}
                <Text className="w-6 text-sm font-medium text-on-surface-variant">
                  {rank}.
                </Text>

                {/* State Info */}
                <Flex direction="column" gap="none" className="min-w-0 flex-1">
                  <Flex justify="between" align="center" gap="sm">
                    <Text
                      className={clsx(
                        'truncate text-sm font-medium',
                        isSelected ? 'text-primary' : 'text-on-surface'
                      )}
                    >
                      {state.stateName}
                    </Text>
                    <Text className="whitespace-nowrap text-xs font-medium text-on-surface">
                      {formatNumber(state.opportunityCount)}
                    </Text>
                  </Flex>

                  <Text className="text-xs text-on-surface-variant">
                    {formatCurrency(state.totalValue)}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          );
        })}
      </Box>

      {/* Footer with total */}
      <Box className="border-t border-outline-variant p-4">
        <Flex justify="between" align="center">
          <Text className="text-xs text-on-surface-variant">
            {data.totals.statesWithData} states with data
          </Text>
          <Text className="text-xs font-medium text-on-surface">
            {formatNumber(data.totals.count)} total
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}

export default StateRankingSidebar;
