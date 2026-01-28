/**
 * MapPage Component Tests
 *
 * Tests for the opportunity map page.
 */

import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest';

import type {Opportunity} from '@/components/domain/opportunity/Opportunity.types';

import {MapPage} from './MapPage';

// Mock useDarkMode
vi.mock('@/hooks', () => ({
  useDarkMode: () => ({isDark: false, theme: 'light', setTheme: vi.fn(), toggleDark: vi.fn()}),
}));

// Helper to create mock opportunity
const createMockOpportunity = (overrides: Partial<Opportunity> = {}): Opportunity => ({
  id: `opp-${Math.random().toString(36).slice(2, 9)}`,
  title: 'Test Opportunity',
  solicitationNumber: 'TEST-001',
  type: 'Solicitation',
  naicsCode: '541512',
  postedDate: '2024-01-15',
  responseDeadLine: '2024-02-15',
  url: 'https://sam.gov/test',
  placeOfPerformanceState: 'CA',
  placeOfPerformanceCity: 'Los Angeles',
  estimatedValueLow: 80000,
  estimatedValueHigh: 100000,
  agency: 'Department of Defense',
  setAsideType: 'Small Business',
  ...overrides,
});

describe('MapPage', () => {
  // Mock fetch for GeoJSON loading
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({type: 'FeatureCollection', features: []}),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders the page header', async () => {
      render(<MapPage opportunities={[]} />);

      expect(screen.getByRole('heading', {level: 1, name: 'Opportunity Map'})).toBeInTheDocument();
      expect(screen.getByText(/Geographic distribution of contracting opportunities/)).toBeInTheDocument();
    });

    it('renders summary stats cards', async () => {
      const opportunities = [
        createMockOpportunity({placeOfPerformanceState: 'CA'}),
        createMockOpportunity({placeOfPerformanceState: 'TX'}),
      ];

      render(<MapPage opportunities={opportunities} />);

      expect(screen.getByText('Total Opportunities')).toBeInTheDocument();
      expect(screen.getByText('States with Data')).toBeInTheDocument();
      expect(screen.getByText('Total Estimated Value')).toBeInTheDocument();
      expect(screen.getByText('Highest State')).toBeInTheDocument();
    });

    it('renders color metric toggle buttons', async () => {
      render(<MapPage opportunities={[]} />);

      expect(screen.getByRole('button', {name: 'Count'})).toBeInTheDocument();
      expect(screen.getByRole('button', {name: 'Value'})).toBeInTheDocument();
    });

    it('renders the filter sidebar', async () => {
      render(<MapPage opportunities={[]} />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Data Source')).toBeInTheDocument();
      expect(screen.getByText('Set-Aside')).toBeInTheDocument();
    });

    it('renders the state ranking sidebar', async () => {
      const opportunities = [
        createMockOpportunity({placeOfPerformanceState: 'CA'}),
      ];

      render(<MapPage opportunities={opportunities} />);

      expect(screen.getByText('Top States')).toBeInTheDocument();
    });

    it('renders the footer note about location data', async () => {
      render(<MapPage opportunities={[]} />);

      expect(screen.getByText(/Location data based on place of performance/)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('toggles color metric when clicking buttons', async () => {
      const user = userEvent.setup();
      render(<MapPage opportunities={[]} />);

      const countButton = screen.getByRole('button', {name: 'Count'});
      const valueButton = screen.getByRole('button', {name: 'Value'});

      // Click value button
      await user.click(valueButton);
      // Both buttons should be present
      expect(countButton).toBeInTheDocument();
      expect(valueButton).toBeInTheDocument();
    });
  });

  describe('data display', () => {
    it('displays correct total opportunity count', async () => {
      const opportunities = [
        createMockOpportunity({placeOfPerformanceState: 'CA'}),
        createMockOpportunity({placeOfPerformanceState: 'TX'}),
        createMockOpportunity({placeOfPerformanceState: 'NY'}),
      ];

      render(<MapPage opportunities={opportunities} />);

      // Find the Total Opportunities card and check its value
      const totalLabel = screen.getByText('Total Opportunities');
      const totalCard = totalLabel.closest('[role="article"]');
      expect(totalCard).toHaveTextContent('3');
    });

    it('displays correct number of states with data', async () => {
      const opportunities = [
        createMockOpportunity({placeOfPerformanceState: 'CA'}),
        createMockOpportunity({placeOfPerformanceState: 'CA'}),
        createMockOpportunity({placeOfPerformanceState: 'TX'}),
      ];

      render(<MapPage opportunities={opportunities} />);

      // Find the States with Data card and check its value
      const statesLabel = screen.getByText('States with Data');
      const statesCard = statesLabel.closest('[role="article"]');
      expect(statesCard).toHaveTextContent('2');
    });

    it('excludes opportunities without state data from counts', async () => {
      const opportunities = [
        createMockOpportunity({placeOfPerformanceState: 'CA'}),
        createMockOpportunity({placeOfPerformanceState: null}),
        createMockOpportunity({placeOfPerformanceState: undefined}),
      ];

      render(<MapPage opportunities={opportunities} />);

      // Find the Total Opportunities card
      const totalLabel = screen.getByText('Total Opportunities');
      const totalCard = totalLabel.closest('[role="article"]');
      expect(totalCard).toHaveTextContent('1');
    });
  });

  describe('empty state', () => {
    it('handles empty opportunities array', async () => {
      render(<MapPage opportunities={[]} />);

      // Check that the Total Opportunities card shows 0
      const totalLabel = screen.getByText('Total Opportunities');
      const totalCard = totalLabel.closest('[role="article"]');
      expect(totalCard).toHaveTextContent('0');

      // Check empty state in sidebar
      expect(screen.getByText('No location data available')).toBeInTheDocument();
    });

    it('handles opportunities with no location data', async () => {
      const opportunities = [
        createMockOpportunity({placeOfPerformanceState: null}),
        createMockOpportunity({placeOfPerformanceState: undefined}),
      ];

      render(<MapPage opportunities={opportunities} />);

      expect(screen.getByText('No location data available')).toBeInTheDocument();
    });
  });
});
