/**
 * MapFilters Component
 *
 * Filter controls for the opportunity map visualization.
 */

import clsx from 'clsx';
import {useCallback} from 'react';

import {Box, Flex, Text} from '@/components/catalyst';
import {Button} from '@/components/catalyst/primitives/Button';

import type {DataSource, MapFilters as MapFiltersType, MapFiltersProps, SetAsideType} from './Map.types';
import {DEFAULT_MAP_FILTERS} from './Map.types';

/**
 * Data source options for filter
 */
const DATA_SOURCE_OPTIONS: Array<{value: DataSource; label: string}> = [
  {value: 'all', label: 'All Sources'},
  {value: 'sam', label: 'SAM.gov'},
  {value: 'sbir', label: 'SBIR/STTR'},
  {value: 'state-local', label: 'State & Local'},
  {value: 'commercial', label: 'Commercial'},
];

/**
 * Set-aside options for filter
 */
const SET_ASIDE_OPTIONS: Array<{value: SetAsideType; label: string}> = [
  {value: 'all', label: 'All Set-Asides'},
  {value: '8a', label: '8(a)'},
  {value: 'hubzone', label: 'HUBZone'},
  {value: 'sdvosb', label: 'SDVOSB'},
  {value: 'wosb', label: 'WOSB'},
  {value: 'small-business', label: 'Small Business'},
  {value: 'none', label: 'No Set-Aside'},
];

export function MapFilters({
  filters,
  onFiltersChange,
  availableAgencies = [],
  availableNaics = [],
  className,
}: MapFiltersProps) {
  const handleDataSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as DataSource;
      onFiltersChange({...filters, dataSource: value});
    },
    [filters, onFiltersChange]
  );

  const handleSetAsideChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as SetAsideType;
      onFiltersChange({...filters, setAside: value});
    },
    [filters, onFiltersChange]
  );

  const handleAgencyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onFiltersChange({...filters, agency: value === '' ? null : value});
    },
    [filters, onFiltersChange]
  );

  const handleNaicsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onFiltersChange({...filters, naicsCode: value === '' ? null : value});
    },
    [filters, onFiltersChange]
  );

  const handleReset = useCallback(() => {
    onFiltersChange(DEFAULT_MAP_FILTERS);
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.dataSource !== 'all' ||
    filters.setAside !== 'all' ||
    filters.agency !== null ||
    filters.naicsCode !== null ||
    filters.dateRange.start !== null ||
    filters.dateRange.end !== null;

  const selectClassName = clsx(
    'h-9 rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface',
    'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
    'dark:bg-surface-container dark:text-on-surface'
  );

  return (
    <Box className={clsx('rounded-lg border border-outline-variant bg-surface-container p-4', className)}>
      <Flex direction="column" gap="md">
        {/* Filter Header */}
        <Flex justify="between" align="center">
          <Text className="text-sm font-semibold text-on-surface">Filters</Text>
          {hasActiveFilters && (
            <Button
              variant="plain"
              size="sm"
              onClick={handleReset}
              className="text-xs text-primary hover:text-primary/80"
            >
              Reset
            </Button>
          )}
        </Flex>

        {/* Filter Controls */}
        <Flex direction="column" gap="sm">
          {/* Data Source */}
          <Box>
            <Text as="label" htmlFor="data-source-filter" className="mb-1 block text-xs text-on-surface-variant">
              Data Source
            </Text>
            <select
              id="data-source-filter"
              value={filters.dataSource}
              onChange={handleDataSourceChange}
              className={selectClassName}
            >
              {DATA_SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Box>

          {/* Set-Aside */}
          <Box>
            <Text as="label" htmlFor="set-aside-filter" className="mb-1 block text-xs text-on-surface-variant">
              Set-Aside
            </Text>
            <select
              id="set-aside-filter"
              value={filters.setAside}
              onChange={handleSetAsideChange}
              className={selectClassName}
            >
              {SET_ASIDE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Box>

          {/* NAICS Code */}
          {availableNaics.length > 0 && (
            <Box>
              <Text as="label" htmlFor="naics-filter" className="mb-1 block text-xs text-on-surface-variant">
                NAICS Code
              </Text>
              <select
                id="naics-filter"
                value={filters.naicsCode ?? ''}
                onChange={handleNaicsChange}
                className={selectClassName}
              >
                <option value="">All NAICS</option>
                {availableNaics.slice(0, 50).map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </Box>
          )}

          {/* Agency */}
          {availableAgencies.length > 0 && (
            <Box>
              <Text as="label" htmlFor="agency-filter" className="mb-1 block text-xs text-on-surface-variant">
                Agency
              </Text>
              <select
                id="agency-filter"
                value={filters.agency ?? ''}
                onChange={handleAgencyChange}
                className={selectClassName}
              >
                <option value="">All Agencies</option>
                {availableAgencies.slice(0, 50).map((agency) => (
                  <option key={agency} value={agency}>
                    {agency}
                  </option>
                ))}
              </select>
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default MapFilters;
