import {FilterBarProps} from './Filters.types';
import {HStack} from '../../catalyst/layout';
import {SearchInput} from './SearchInput';
import {SortSelect} from './SortSelect';

export function FilterBar({filters, onFilterChange, className, style}: FilterBarProps) {
    return (
        <HStack spacing="sm" style={style}>
            <SearchInput
                value={filters.search}
                onChange={(search) => onFilterChange({...filters, search})}
            />
            <SortSelect
                value={filters.sort}
                onChange={(sort) => onFilterChange({...filters, sort})}
            />
        </HStack>
    );
}

export default FilterBar;
