import { useState, useMemo } from 'react';
import { ListUlIcon } from '../components/primitives';
import { Section, SectionHeader, HStack } from '../components/layout';
import {
  Opportunity,
  OpportunityList,
  FilterBar,
  FilterState,
  SortOption,
} from '../components/domain';

interface AllOpportunitiesPageProps {
  opportunities: Opportunity[];
}

export function AllOpportunitiesPage({ opportunities }: AllOpportunitiesPageProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sort: 'deadline',
  });

  const filteredAndSorted = useMemo(() => {
    let result = [...opportunities];

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.title?.toLowerCase().includes(query) ||
          o.solicitationNumber?.toLowerCase().includes(query) ||
          o.naicsCode?.includes(query)
      );
    }

    // Sort
    const sortFn: Record<SortOption, (a: Opportunity, b: Opportunity) => number> = {
      deadline: (a, b) =>
        new Date(a.responseDeadLine || '9999').getTime() -
        new Date(b.responseDeadLine || '9999').getTime(),
      posted: (a, b) =>
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
      title: (a, b) => (a.title || '').localeCompare(b.title || ''),
    };

    result.sort(sortFn[filters.sort]);

    return result;
  }, [opportunities, filters]);

  return (
    <Section id="all-opportunities">
      <SectionHeader
        title="All Opportunities"
        icon={<ListUlIcon size="lg" />}
        actions={
          <HStack spacing="var(--spacing-2)">
            <FilterBar filters={filters} onFilterChange={setFilters} />
          </HStack>
        }
      />
      <OpportunityList
        opportunities={filteredAndSorted}
        emptyMessage="No opportunities match your search criteria."
      />
    </Section>
  );
}

export default AllOpportunitiesPage;
