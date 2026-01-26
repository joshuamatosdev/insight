import { CSSProperties } from 'react';

export type SortOption = 'deadline' | 'posted' | 'title';

export interface FilterState {
  search: string;
  sort: SortOption;
}

export interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
  style?: CSSProperties;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}

export interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
  style?: CSSProperties;
}
