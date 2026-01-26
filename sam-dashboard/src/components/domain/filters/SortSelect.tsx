import { SortSelectProps, SortOption } from './Filters.types';
import { Select } from '../../primitives';

const SORT_OPTIONS = [
  { value: 'deadline', label: 'Sort by Deadline' },
  { value: 'posted', label: 'Sort by Posted Date' },
  { value: 'title', label: 'Sort by Title' },
];

export function SortSelect({ value, onChange, className, style }: SortSelectProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      options={SORT_OPTIONS}
      className={className}
      style={{ width: '180px', ...style }}
    />
  );
}

export default SortSelect;
