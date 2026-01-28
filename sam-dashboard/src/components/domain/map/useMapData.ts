/**
 * useMapData Hook
 *
 * Aggregates opportunity data by state for choropleth visualization.
 */

import {useMemo} from 'react';

import type {Opportunity} from '@/components/domain/opportunity/Opportunity.types';

import type {
  MapDataAggregation,
  MapFilters,
  StateAggregation,
} from './Map.types';
import {getStateName} from './Map.types';

/**
 * Filter opportunities based on map filters
 */
function filterOpportunities(
  opportunities: Opportunity[],
  filters: MapFilters
): Opportunity[] {
  return opportunities.filter((opp) => {
    // Data source filter
    if (filters.dataSource !== 'all') {
      const source = opp.source?.toLowerCase() ?? '';
      if (filters.dataSource === 'sam' && !source.includes('sam')) return false;
      if (filters.dataSource === 'sbir' && !opp.isSbir && !opp.isSttr) return false;
    }

    // NAICS filter
    if (
      filters.naicsCode !== null &&
      filters.naicsCode !== '' &&
      opp.naicsCode !== filters.naicsCode
    ) {
      return false;
    }

    // Set-aside filter
    if (filters.setAside !== 'all') {
      const setAsideType = opp.setAsideType?.toLowerCase() ?? '';
      if (filters.setAside === '8a' && !setAsideType.includes('8(a)') && !setAsideType.includes('8a')) {
        return false;
      }
      if (filters.setAside === 'hubzone' && !setAsideType.includes('hubzone')) return false;
      if (filters.setAside === 'sdvosb' && !setAsideType.includes('sdvosb')) return false;
      if (filters.setAside === 'wosb' && !setAsideType.includes('wosb')) return false;
      if (
        filters.setAside === 'small-business' &&
        !setAsideType.includes('small') &&
        !setAsideType.includes('sb')
      ) {
        return false;
      }
    }

    // Agency filter
    if (
      filters.agency !== null &&
      filters.agency !== '' &&
      opp.agency !== filters.agency
    ) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start !== null || filters.dateRange.end !== null) {
      const postedDate = new Date(opp.postedDate);
      if (
        filters.dateRange.start !== null &&
        postedDate < new Date(filters.dateRange.start)
      ) {
        return false;
      }
      if (
        filters.dateRange.end !== null &&
        postedDate > new Date(filters.dateRange.end)
      ) {
        return false;
      }
    }

    // Value range filter - use high estimate if available, otherwise low estimate
    const value = opp.estimatedValueHigh ?? opp.estimatedValueLow ?? 0;
    if (filters.valueRange.min !== null && value < filters.valueRange.min) {
      return false;
    }
    if (filters.valueRange.max !== null && value > filters.valueRange.max) {
      return false;
    }

    return true;
  });
}

/**
 * Get top N items from a frequency map
 */
function getTopItems(freqMap: Map<string, number>, n: number): string[] {
  return Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);
}

/**
 * Aggregate opportunities by state
 */
function aggregateByState(opportunities: Opportunity[]): Map<string, StateAggregation> {
  const stateMap = new Map<string, StateAggregation>();

  for (const opp of opportunities) {
    const stateCode = opp.placeOfPerformanceState?.toUpperCase();
    if (stateCode === undefined || stateCode === null || stateCode === '') {
      continue;
    }

    const existing = stateMap.get(stateCode);
    // Use high estimate if available, otherwise low estimate
    const value = opp.estimatedValueHigh ?? opp.estimatedValueLow ?? 0;

    if (existing === undefined) {
      // Create new state aggregation
      const agencyMap = new Map<string, number>();
      const naicsMap = new Map<string, number>();
      const setAsideMap: Record<string, number> = {};

      if (opp.agency !== undefined && opp.agency !== null) {
        agencyMap.set(opp.agency, 1);
      }
      if (opp.naicsCode !== undefined && opp.naicsCode !== '') {
        naicsMap.set(opp.naicsCode, 1);
      }
      if (opp.setAsideType !== undefined && opp.setAsideType !== null) {
        setAsideMap[opp.setAsideType] = 1;
      }

      stateMap.set(stateCode, {
        stateCode,
        stateName: getStateName(stateCode),
        opportunityCount: 1,
        totalValue: value,
        topAgencies: opp.agency !== undefined && opp.agency !== null ? [opp.agency] : [],
        topNaics: opp.naicsCode !== undefined && opp.naicsCode !== '' ? [opp.naicsCode] : [],
        setAsideBreakdown: setAsideMap,
      });

      // Store frequency maps as metadata (we'll process them at the end)
      (stateMap.get(stateCode) as StateAggregation & {_agencyMap?: Map<string, number>})._agencyMap = agencyMap;
      (stateMap.get(stateCode) as StateAggregation & {_naicsMap?: Map<string, number>})._naicsMap = naicsMap;
    } else {
      // Update existing state aggregation
      existing.opportunityCount += 1;
      existing.totalValue += value;

      // Update agency frequency
      const extendedExisting = existing as StateAggregation & {
        _agencyMap?: Map<string, number>;
        _naicsMap?: Map<string, number>;
      };

      if (opp.agency !== undefined && opp.agency !== null && extendedExisting._agencyMap !== undefined) {
        const count = extendedExisting._agencyMap.get(opp.agency) ?? 0;
        extendedExisting._agencyMap.set(opp.agency, count + 1);
      }

      // Update NAICS frequency
      if (opp.naicsCode !== undefined && opp.naicsCode !== '' && extendedExisting._naicsMap !== undefined) {
        const count = extendedExisting._naicsMap.get(opp.naicsCode) ?? 0;
        extendedExisting._naicsMap.set(opp.naicsCode, count + 1);
      }

      // Update set-aside breakdown
      if (opp.setAsideType !== undefined && opp.setAsideType !== null) {
        existing.setAsideBreakdown[opp.setAsideType] =
          (existing.setAsideBreakdown[opp.setAsideType] ?? 0) + 1;
      }
    }
  }

  // Finalize top agencies and NAICS for each state
  for (const state of stateMap.values()) {
    const extendedState = state as StateAggregation & {
      _agencyMap?: Map<string, number>;
      _naicsMap?: Map<string, number>;
    };

    if (extendedState._agencyMap !== undefined) {
      state.topAgencies = getTopItems(extendedState._agencyMap, 5);
      delete extendedState._agencyMap;
    }
    if (extendedState._naicsMap !== undefined) {
      state.topNaics = getTopItems(extendedState._naicsMap, 5);
      delete extendedState._naicsMap;
    }
  }

  return stateMap;
}

/**
 * Hook to aggregate opportunity data for map visualization
 *
 * @param opportunities - Array of opportunities to aggregate
 * @param filters - Optional filters to apply
 * @returns Aggregated map data
 */
export function useMapData(
  opportunities: Opportunity[],
  filters?: MapFilters
): MapDataAggregation {
  return useMemo(() => {
    // Apply filters if provided
    const filteredOpportunities =
      filters !== undefined ? filterOpportunities(opportunities, filters) : opportunities;

    // Aggregate by state
    const byState = aggregateByState(filteredOpportunities);

    // Calculate totals and max values
    let totalCount = 0;
    let totalValue = 0;
    let maxCount = 0;
    let maxValue = 0;

    for (const state of byState.values()) {
      totalCount += state.opportunityCount;
      totalValue += state.totalValue;
      if (state.opportunityCount > maxCount) {
        maxCount = state.opportunityCount;
      }
      if (state.totalValue > maxValue) {
        maxValue = state.totalValue;
      }
    }

    return {
      byState,
      totals: {
        count: totalCount,
        value: totalValue,
        statesWithData: byState.size,
      },
      maxCount,
      maxValue,
    };
  }, [opportunities, filters]);
}

/**
 * Hook to extract unique filter options from opportunities
 */
export function useFilterOptions(opportunities: Opportunity[]): {
  agencies: string[];
  naicsCodes: string[];
} {
  return useMemo(() => {
    const agencySet = new Set<string>();
    const naicsSet = new Set<string>();

    for (const opp of opportunities) {
      if (opp.agency !== undefined && opp.agency !== null && opp.agency !== '') {
        agencySet.add(opp.agency);
      }
      if (opp.naicsCode !== undefined && opp.naicsCode !== '') {
        naicsSet.add(opp.naicsCode);
      }
    }

    return {
      agencies: Array.from(agencySet).sort(),
      naicsCodes: Array.from(naicsSet).sort(),
    };
  }, [opportunities]);
}
