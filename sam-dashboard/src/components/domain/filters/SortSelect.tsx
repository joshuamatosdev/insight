import { CSSProperties } from 'react';
import { Select } from '../../primitives';
import { SortOption } from './Filters.types';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
  style?: CSSProperties;
}

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
