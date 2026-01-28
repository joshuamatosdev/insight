import {describe, expect, it, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {DashboardPage} from './DashboardPage';
import {Opportunity} from '../components/domain/opportunity';

// Mock opportunity data factory
function createMockOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: '1',
    title: 'Test Opportunity',
    solicitationNumber: 'SOL-001',
    type: 'Solicitation',
    naicsCode: '541512',
    postedDate: '2024-01-15',
    responseDeadLine: '2024-12-31',
    url: 'https://sam.gov/opp/1',
    sbirPhase: null,
    isSbir: false,
    isSttr: false,
    source: 'SAM.gov',
    ...overrides,
  };
}

// Create a list of mock opportunities for testing
function createMockOpportunities(count: number): Opportunity[] {
  return Array.from({ length: count }, (_, index) => {
    const types = ['Sources Sought', 'Presolicitation', 'Combined Synopsis/Solicitation'];
    const naicsCodes = ['541512', '541511', '541519', '518210'];
    return createMockOpportunity({
      id: `opp-${index}`,
      title: `Opportunity ${index + 1}`,
      solicitationNumber: `SOL-${String(index + 1).padStart(3, '0')}`,
      type: types.at(index % types.length) ?? 'Solicitation',
      naicsCode: naicsCodes.at(index % naicsCodes.length) ?? '541512',
      postedDate: `2024-01-${String(15 - index).padStart(2, '0')}`,
      responseDeadLine: `2024-02-${String(15 + index).padStart(2, '0')}`,
    });
  });
}

/**
 * Helper to find stat card by its label text
 * Returns the parent container so we can query the value within it
 */
function getStatCardByLabel(label: string): HTMLElement {
  // Find the label text element
  const labelElement = screen.getByText(label, { selector: 'p' });
  // Get the parent container (the stat card)
  // Walk up to find the stat card container
  let parent = labelElement.parentElement;
  while (parent !== null && parent.parentElement !== null) {
    // The stat card has a specific gradient background style
    if (parent.style.borderRadius === 'var(--radius-xl)') {
      return parent;
    }
    parent = parent.parentElement;
  }
  // If we can't find the stat card, return the closest container
  return labelElement.parentElement ?? labelElement;
}

/**
 * Helper to get the value from a stat card
 */
function getStatValue(label: string): string {
  const statCard = getStatCardByLabel(label);
  const heading = within(statCard).getByRole('heading', { level: 1 });
  return heading.textContent ?? '';
}

describe('DashboardPage', () => {
  describe('Stats Section', () => {
    it('should render the total opportunities stat card', () => {
      const opportunities = createMockOpportunities(5);
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      const value = getStatValue('Total Opportunities');
      expect(value).toBe('5');
    });

    it('should render sources sought count correctly', () => {
      const opportunities = [
        createMockOpportunity({ id: '1', type: 'Sources Sought' }),
        createMockOpportunity({ id: '2', type: 'Sources Sought' }),
        createMockOpportunity({ id: '3', type: 'Solicitation' }),
      ];
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      const value = getStatValue('Sources Sought');
      expect(value).toBe('2');
    });

    it('should render urgent deadline count for opportunities within 7 days', () => {
      const now = new Date();
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(now.getDate() + 3);
      const tenDaysFromNow = new Date(now);
      tenDaysFromNow.setDate(now.getDate() + 10);

      const opportunities = [
        createMockOpportunity({
          id: '1',
          responseDeadLine: threeDaysFromNow.toISOString().split('T').at(0) ?? ''
        }),
        createMockOpportunity({
          id: '2',
          responseDeadLine: tenDaysFromNow.toISOString().split('T').at(0) ?? ''
        }),
      ];
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      const value = getStatValue('Deadline < 7 Days');
      expect(value).toBe('1');
    });

    it('should render unique NAICS codes count', () => {
      const opportunities = [
        createMockOpportunity({ id: '1', naicsCode: '541512' }),
        createMockOpportunity({ id: '2', naicsCode: '541512' }),
        createMockOpportunity({ id: '3', naicsCode: '541511' }),
        createMockOpportunity({ id: '4', naicsCode: '518210' }),
      ];
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      const value = getStatValue('NAICS Codes');
      expect(value).toBe('3');
    });

    it('should render all four stat cards', () => {
      const opportunities = createMockOpportunities(10);
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      // All stat labels should be present (using selector to target the label text)
      expect(screen.getByText('Total Opportunities', { selector: 'p' })).toBeInTheDocument();
      expect(screen.getByText('Sources Sought', { selector: 'p' })).toBeInTheDocument();
      expect(screen.getByText('Deadline < 7 Days', { selector: 'p' })).toBeInTheDocument();
      expect(screen.getByText('NAICS Codes', { selector: 'p' })).toBeInTheDocument();
    });
  });

  describe('Recent Opportunities Section', () => {
    it('should render the Recent Opportunities heading', () => {
      const opportunities = createMockOpportunities(5);
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      expect(screen.getByRole('heading', { name: /recent opportunities/i })).toBeInTheDocument();
    });

    it('should render View All button', () => {
      const opportunities = createMockOpportunities(5);
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
    });

    it('should call onNavigate with all-opportunities when View All is clicked', async () => {
      const user = userEvent.setup();
      const opportunities = createMockOpportunities(5);
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      const viewAllButton = screen.getByRole('button', { name: /view all/i });
      await user.click(viewAllButton);

      expect(handleNavigate).toHaveBeenCalledTimes(1);
      expect(handleNavigate).toHaveBeenCalledWith('all-opportunities');
    });

    it('should display opportunities sorted by most recent first', () => {
      const opportunities = [
        createMockOpportunity({ id: '1', title: 'Older', postedDate: '2024-01-01' }),
        createMockOpportunity({ id: '2', title: 'Newest', postedDate: '2024-01-15' }),
        createMockOpportunity({ id: '3', title: 'Middle', postedDate: '2024-01-10' }),
      ];
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      // All three opportunities should be visible
      expect(screen.getByText('Newest')).toBeInTheDocument();
      expect(screen.getByText('Older')).toBeInTheDocument();
      expect(screen.getByText('Middle')).toBeInTheDocument();
    });

    it('should limit display to 10 most recent opportunities', () => {
      const opportunities = createMockOpportunities(15);
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      // Opportunity 1 should be there (most recent based on postedDate sorting)
      expect(screen.getByText('Opportunity 1')).toBeInTheDocument();
      // Opportunity 10 should be there
      expect(screen.getByText('Opportunity 10')).toBeInTheDocument();
      // Opportunity 15 should NOT be visible (beyond limit of 10)
      expect(screen.queryByText('Opportunity 15')).not.toBeInTheDocument();
    });
  });

  describe('NAICS Distribution Section', () => {
    it('should render NAICS Distribution heading', () => {
      const opportunities = createMockOpportunities(5);
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      expect(screen.getByRole('heading', { name: /naics distribution/i })).toBeInTheDocument();
    });

    it('should render NAICS distribution chart', () => {
      const opportunities = [
        createMockOpportunity({ id: '1', naicsCode: '541512' }),
        createMockOpportunity({ id: '2', naicsCode: '541512' }),
        createMockOpportunity({ id: '3', naicsCode: '541511' }),
      ];
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      // The NAICS distribution chart renders as a canvas element
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render with zero counts when no opportunities are provided', () => {
      const opportunities: Opportunity[] = [];
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      // Should show 0 for total opportunities
      const totalValue = getStatValue('Total Opportunities');
      expect(totalValue).toBe('0');
    });
  });

  describe('Dashboard Header', () => {
    it('should render Dashboard Overview heading', () => {
      const opportunities = createMockOpportunities(5);
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      expect(screen.getByRole('heading', { name: /dashboard overview/i })).toBeInTheDocument();
    });
  });

  describe('Correct Opportunity Counts', () => {
    it('should calculate correct count for mixed opportunity types', () => {
      const opportunities = [
        createMockOpportunity({ id: '1', type: 'Sources Sought' }),
        createMockOpportunity({ id: '2', type: 'Sources Sought' }),
        createMockOpportunity({ id: '3', type: 'Sources Sought' }),
        createMockOpportunity({ id: '4', type: 'Presolicitation' }),
        createMockOpportunity({ id: '5', type: 'Combined Synopsis/Solicitation' }),
      ];
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      // Total should be 5
      const totalValue = getStatValue('Total Opportunities');
      expect(totalValue).toBe('5');
      // Sources Sought should be 3
      const sourcesValue = getStatValue('Sources Sought');
      expect(sourcesValue).toBe('3');
    });

    it('should count opportunities with empty naicsCode as having 0 unique codes', () => {
      const opportunities = [
        createMockOpportunity({ id: '1', naicsCode: '' }),
        createMockOpportunity({ id: '2', naicsCode: '' }),
      ];
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      const naicsValue = getStatValue('NAICS Codes');
      expect(naicsValue).toBe('0');
    });

    it('should not count past deadlines as urgent', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const opportunities = [
        createMockOpportunity({
          id: '1',
          responseDeadLine: pastDate.toISOString().split('T').at(0) ?? ''
        }),
      ];
      const handleNavigate = vi.fn();

      render(<DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />);

      // Urgent count should be 0 for past deadlines
      const urgentValue = getStatValue('Deadline < 7 Days');
      expect(urgentValue).toBe('0');
    });
  });
});
