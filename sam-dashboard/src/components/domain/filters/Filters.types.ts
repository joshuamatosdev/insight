export type SortOption = 'deadline' | 'posted' | 'title';

export interface FilterState {
  search: string;
  sort: SortOption;
}
