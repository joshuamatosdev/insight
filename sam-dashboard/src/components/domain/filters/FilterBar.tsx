import { CSSProperties } from 'react';
import { HStack } from '../../layout';
import { SearchInput } from './SearchInput';
import { SortSelect } from './SortSelect';
import { FilterState } from './Filters.types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
  style?: CSSProperties;
}

export function FilterBar({ filters, onFilterChange, className, style }: FilterBarProps) {
  return (
    <HStack spacing="var(--spacing-2)" className={className} style={style}>
      <SearchInput
        value={filters.search}
        onChange={(search) => onFilterChange({ ...filters, search })}
      />
      <SortSelect
        value={filters.sort}
        onChange={(sort) => onFilterChange({ ...filters, sort })}
      />
    </HStack>
  );
}

export default FilterBar;
