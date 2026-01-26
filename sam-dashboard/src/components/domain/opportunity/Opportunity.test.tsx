import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  getOpportunityType,
  isSbirOpportunity,
  getSbirLabel,
  getSbirPhaseLabel,
  Opportunity,
} from './Opportunity.types';
import { OpportunityCard } from './OpportunityCard';
import { TypeBadge } from './TypeBadge';
import { Box } from '../../layout';

const mockOpportunity: Opportunity = {
  id: '1',
  title: 'Test Opportunity',
  solicitationNumber: 'SOL-001',
  type: 'Solicitation',
  naicsCode: '541512',
  postedDate: '2024-01-01',
  responseDeadLine: '2024-12-31',
  url: 'https://sam.gov/opp/1',
  sbirPhase: null,
  isSbir: false,
  isSttr: false,
  source: 'SAM.gov',
};

describe('getOpportunityType', () => {
  it('returns sources-sought for sources sought type', () => {
    expect(getOpportunityType('Sources Sought')).toBe('sources-sought');
  });

  it('returns presolicitation for presol type', () => {
    expect(getOpportunityType('Presolicitation')).toBe('presolicitation');
  });

  it('returns solicitation for solicitation type', () => {
    expect(getOpportunityType('Combined Synopsis/Solicitation')).toBe('solicitation');
  });

  it('returns other for unknown type', () => {
    expect(getOpportunityType('Unknown')).toBe('other');
  });

  it('returns other for undefined', () => {
    expect(getOpportunityType(undefined)).toBe('other');
  });
});

describe('isSbirOpportunity', () => {
  it('returns true for SBIR opportunity', () => {
    expect(isSbirOpportunity({ ...mockOpportunity, isSbir: true })).toBe(true);
  });

  it('returns true for STTR opportunity', () => {
    expect(isSbirOpportunity({ ...mockOpportunity, isSttr: true })).toBe(true);
  });

  it('returns false for non-SBIR/STTR opportunity', () => {
    expect(isSbirOpportunity(mockOpportunity)).toBe(false);
  });
});

describe('getSbirLabel', () => {
  it('returns STTR for STTR opportunity', () => {
    expect(getSbirLabel({ ...mockOpportunity, isSttr: true })).toBe('STTR');
  });

  it('returns SBIR for SBIR opportunity', () => {
    expect(getSbirLabel({ ...mockOpportunity, isSbir: true })).toBe('SBIR');
  });

  it('returns null for non-SBIR/STTR opportunity', () => {
    expect(getSbirLabel(mockOpportunity)).toBe(null);
  });
});

describe('getSbirPhaseLabel', () => {
  it('returns Phase I for I', () => {
    expect(getSbirPhaseLabel('I')).toBe('Phase I');
  });

  it('returns Phase II for II', () => {
    expect(getSbirPhaseLabel('II')).toBe('Phase II');
  });

  it('returns empty string for null', () => {
    expect(getSbirPhaseLabel(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(getSbirPhaseLabel(undefined)).toBe('');
  });
});

describe('TypeBadge', () => {
  it('renders with type badge', () => {
    render(<TypeBadge type="solicitation" label="Combined Synopsis/Solicitation" />);
    expect(screen.getByText('Combined Synopsis/Solicitation')).toBeInTheDocument();
  });

  it('renders with different types', () => {
    render(<TypeBadge type="sources-sought" label="Sources Sought" />);
    expect(screen.getByText('Sources Sought')).toBeInTheDocument();
  });
});

describe('OpportunityCard', () => {
  it('renders opportunity title', () => {
    render(<OpportunityCard opportunity={mockOpportunity} />);
    expect(screen.getByText('Test Opportunity')).toBeInTheDocument();
  });

  it('renders solicitation number', () => {
    render(<OpportunityCard opportunity={mockOpportunity} />);
    expect(screen.getByText('SOL-001')).toBeInTheDocument();
  });

  it('renders Posted Date label', () => {
    render(<OpportunityCard opportunity={mockOpportunity} />);
    expect(screen.getByText('Posted Date')).toBeInTheDocument();
  });

  it('renders Response Deadline label', () => {
    render(<OpportunityCard opportunity={mockOpportunity} />);
    expect(screen.getByText('Response Deadline')).toBeInTheDocument();
  });

  it('renders View on SAM.gov button', () => {
    render(<OpportunityCard opportunity={mockOpportunity} />);
    expect(screen.getByText('View on SAM.gov')).toBeInTheDocument();
  });

  it('renders with link to SAM.gov', () => {
    render(<OpportunityCard opportunity={mockOpportunity} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('handles missing title gracefully', () => {
    const oppWithNoTitle = { ...mockOpportunity, title: '' };
    render(<OpportunityCard opportunity={oppWithNoTitle} />);
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('renders extraBadge when provided', () => {
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        extraBadge={<Box as="span" data-testid="extra">Extra</Box>}
      />
    );
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });
});
