/**
 * StateRankingSidebar Component Tests
 *
 * Tests for the state ranking sidebar component.
 */

import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import type {MapDataAggregation, StateAggregation} from './Map.types';
import {StateRankingSidebar} from './StateRankingSidebar';

// Helper to create mock state aggregation
const createMockStateAggregation = (overrides: Partial<StateAggregation> = {}): StateAggregation => ({
  stateCode: 'CA',
  stateName: 'California',
  opportunityCount: 100,
  totalValue: 5000000,
  topAgencies: ['Department of Defense', 'NASA'],
  topNaics: ['541512', '236220'],
  setAsideBreakdown: {'Small Business': 50, '8(a)': 30},
  ...overrides,
});

// Helper to create mock map data
const createMockMapData = (states: StateAggregation[]): MapDataAggregation => {
  const byState = new Map<string, StateAggregation>();
  let totalCount = 0;
  let totalValue = 0;
  let maxCount = 0;
  let maxValue = 0;

  for (const state of states) {
    byState.set(state.stateCode, state);
    totalCount += state.opportunityCount;
    totalValue += state.totalValue;
    if (state.opportunityCount > maxCount) maxCount = state.opportunityCount;
    if (state.totalValue > maxValue) maxValue = state.totalValue;
  }

  return {
    byState,
    totals: {
      count: totalCount,
      value: totalValue,
      statesWithData: states.length,
    },
    maxCount,
    maxValue,
  };
};

describe('StateRankingSidebar', () => {
  describe('rendering', () => {
    it('renders the sidebar with header', () => {
      const mockData = createMockMapData([
        createMockStateAggregation({stateCode: 'CA', stateName: 'California'}),
      ]);

      render(<StateRankingSidebar data={mockData} />);

      expect(screen.getByText('Top States')).toBeInTheDocument();
    });

    it('renders state names in ranked order by count', () => {
      const mockData = createMockMapData([
        createMockStateAggregation({
          stateCode: 'TX',
          stateName: 'Texas',
          opportunityCount: 50,
        }),
        createMockStateAggregation({
          stateCode: 'CA',
          stateName: 'California',
          opportunityCount: 100,
        }),
        createMockStateAggregation({
          stateCode: 'NY',
          stateName: 'New York',
          opportunityCount: 75,
        }),
      ]);

      render(<StateRankingSidebar data={mockData} sortBy="count" />);

      // Get all state name elements
      const stateNames = screen.getAllByText(/California|Texas|New York/);
      expect(stateNames[0]).toHaveTextContent('California');
      expect(stateNames[1]).toHaveTextContent('New York');
      expect(stateNames[2]).toHaveTextContent('Texas');
    });

    it('renders state names in ranked order by value', () => {
      const mockData = createMockMapData([
        createMockStateAggregation({
          stateCode: 'TX',
          stateName: 'Texas',
          totalValue: 10000000,
        }),
        createMockStateAggregation({
          stateCode: 'CA',
          stateName: 'California',
          totalValue: 5000000,
        }),
        createMockStateAggregation({
          stateCode: 'NY',
          stateName: 'New York',
          totalValue: 7500000,
        }),
      ]);

      render(<StateRankingSidebar data={mockData} sortBy="value" />);

      const stateNames = screen.getAllByText(/California|Texas|New York/);
      expect(stateNames[0]).toHaveTextContent('Texas');
      expect(stateNames[1]).toHaveTextContent('New York');
      expect(stateNames[2]).toHaveTextContent('California');
    });

    it('displays formatted opportunity counts', () => {
      const mockData = createMockMapData([
        createMockStateAggregation({
          stateCode: 'CA',
          stateName: 'California',
          opportunityCount: 1234,
        }),
      ]);

      render(<StateRankingSidebar data={mockData} />);

      expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('displays formatted currency values', () => {
      const mockData = createMockMapData([
        createMockStateAggregation({
          stateCode: 'CA',
          stateName: 'California',
          totalValue: 5000000,
        }),
      ]);

      render(<StateRankingSidebar data={mockData} />);

      expect(screen.getByText('$5.0M')).toBeInTheDocument();
    });

    it('respects maxItems prop', () => {
      const mockData = createMockMapData([
        createMockStateAggregation({stateCode: 'CA', stateName: 'California', opportunityCount: 100}),
        createMockStateAggregation({stateCode: 'TX', stateName: 'Texas', opportunityCount: 90}),
        createMockStateAggregation({stateCode: 'NY', stateName: 'New York', opportunityCount: 80}),
        createMockStateAggregation({stateCode: 'FL', stateName: 'Florida', opportunityCount: 70}),
        createMockStateAggregation({stateCode: 'WA', stateName: 'Washington', opportunityCount: 60}),
      ]);

      render(<StateRankingSidebar data={mockData} maxItems={3} />);

      expect(screen.getByText('California')).toBeInTheDocument();
      expect(screen.getByText('Texas')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
      expect(screen.queryByText('Florida')).not.toBeInTheDocument();
      expect(screen.queryByText('Washington')).not.toBeInTheDocument();
    });

    it('shows empty state message when no data', () => {
      const mockData = createMockMapData([]);

      render(<StateRankingSidebar data={mockData} />);

      expect(screen.getByText('No location data available')).toBeInTheDocument();
    });

    it('displays footer with total counts', () => {
      const mockData = createMockMapData([
        createMockStateAggregation({stateCode: 'CA', opportunityCount: 100}),
        createMockStateAggregation({stateCode: 'TX', opportunityCount: 50}),
      ]);

      render(<StateRankingSidebar data={mockData} />);

      expect(screen.getByText('2 states with data')).toBeInTheDocument();
      expect(screen.getByText('150 total')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onStateClick when a state is clicked', async () => {
      const user = userEvent.setup();
      const mockOnStateClick = vi.fn();
      const mockData = createMockMapData([
        createMockStateAggregation({stateCode: 'CA', stateName: 'California'}),
      ]);

      render(<StateRankingSidebar data={mockData} onStateClick={mockOnStateClick} />);

      await user.click(screen.getByText('California'));

      expect(mockOnStateClick).toHaveBeenCalledWith('CA');
    });

    it('supports keyboard navigation with Enter key', async () => {
      const user = userEvent.setup();
      const mockOnStateClick = vi.fn();
      const mockData = createMockMapData([
        createMockStateAggregation({stateCode: 'CA', stateName: 'California'}),
      ]);

      render(<StateRankingSidebar data={mockData} onStateClick={mockOnStateClick} />);

      const stateItem = screen.getByRole('button', {name: /California/i});
      stateItem.focus();
      await user.keyboard('{Enter}');

      expect(mockOnStateClick).toHaveBeenCalledWith('CA');
    });

    it('supports keyboard navigation with Space key', async () => {
      const user = userEvent.setup();
      const mockOnStateClick = vi.fn();
      const mockData = createMockMapData([
        createMockStateAggregation({stateCode: 'TX', stateName: 'Texas'}),
      ]);

      render(<StateRankingSidebar data={mockData} onStateClick={mockOnStateClick} />);

      const stateItem = screen.getByRole('button', {name: /Texas/i});
      stateItem.focus();
      await user.keyboard(' ');

      expect(mockOnStateClick).toHaveBeenCalledWith('TX');
    });

    it('highlights selected state', () => {
      const mockData = createMockMapData([
        createMockStateAggregation({stateCode: 'CA', stateName: 'California'}),
        createMockStateAggregation({stateCode: 'TX', stateName: 'Texas'}),
      ]);

      render(<StateRankingSidebar data={mockData} selectedState="CA" />);

      const selectedItem = screen.getByRole('button', {name: /California/i});
      expect(selectedItem).toHaveAttribute('aria-pressed', 'true');

      const unselectedItem = screen.getByRole('button', {name: /Texas/i});
      expect(unselectedItem).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for state items', () => {
      const mockData = createMockMapData([
        createMockStateAggregation({
          stateCode: 'CA',
          stateName: 'California',
          opportunityCount: 100,
          totalValue: 5000000,
        }),
      ]);

      render(<StateRankingSidebar data={mockData} />);

      const stateItem = screen.getByRole('button', {name: /California: 100 opportunities, \$5\.0M/i});
      expect(stateItem).toBeInTheDocument();
    });

    it('state items are focusable', () => {
      const mockData = createMockMapData([
        createMockStateAggregation({stateCode: 'CA', stateName: 'California'}),
      ]);

      render(<StateRankingSidebar data={mockData} />);

      const stateItem = screen.getByRole('button', {name: /California/i});
      expect(stateItem).toHaveAttribute('tabindex', '0');
    });
  });
});
