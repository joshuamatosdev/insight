/**
 * Tests for AIInsightsPanel component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIInsightsPanel } from './AIInsightsPanel';

// Mock the AI service
vi.mock('../../../services/aiService', () => ({
  getOpportunitySummary: vi.fn(),
  getFitScore: vi.fn(),
  getRiskAssessment: vi.fn(),
}));

import {
  getOpportunitySummary,
  getFitScore,
  getRiskAssessment,
} from '../../../services/aiService';
import type {
  AISummary,
  AIFitScore,
  AIRiskAssessment,
} from '../../../services/aiService';

const mockSummary: AISummary = {
  executiveSummary: 'This contract provides IT modernization services for the agency.',
  keyPoints: ['Cloud migration', 'Security upgrades', '24/7 support'],
  scopeSummary: 'Full IT infrastructure modernization',
  timeline: ['Phase 1: Assessment - Q1', 'Phase 2: Implementation - Q2-Q3'],
  budgetAnalysis: 'Estimated value $2-5M',
  confidence: 92,
};

const mockFitScore: AIFitScore = {
  overallScore: 85,
  naicsScore: 95,
  pastPerformanceScore: 80,
  certificationScore: 75,
  geographicScore: 90,
  reasoning: 'Strong match based on NAICS codes and past performance',
  strengths: ['8(a) certified', 'HUBZone', 'Strong past performance in similar contracts'],
  weaknesses: ['Limited large-scale cloud experience'],
  recommendations: ['Partner with AWS specialist', 'Highlight security certifications'],
};

const mockRiskAssessment: AIRiskAssessment = {
  overallRisk: 'MEDIUM',
  risks: [
    {
      category: 'Schedule',
      description: 'Aggressive timeline for cloud migration',
      severity: 'MEDIUM',
      mitigation: 'Request phased approach',
    },
    {
      category: 'Technical',
      description: 'Legacy system integration complexity',
      severity: 'HIGH',
      mitigation: 'Engage integration specialists',
    },
  ],
  mitigations: ['Add contingency buffer', 'Early stakeholder engagement'],
  redFlags: ['Incumbent advantage'],
  complianceConcerns: ['FedRAMP certification required'],
};

describe('AIInsightsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getOpportunitySummary as ReturnType<typeof vi.fn>).mockResolvedValue(mockSummary);
    (getFitScore as ReturnType<typeof vi.fn>).mockResolvedValue(mockFitScore);
    (getRiskAssessment as ReturnType<typeof vi.fn>).mockResolvedValue(mockRiskAssessment);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the panel with AI Insights title', async () => {
    render(<AIInsightsPanel opportunityId="opp-123" />);

    expect(screen.getByText('AI Insights')).toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    render(<AIInsightsPanel opportunityId="opp-123" />);

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  it('displays summary tab by default', async () => {
    render(<AIInsightsPanel opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });

    expect(screen.getByText(mockSummary.executiveSummary)).toBeInTheDocument();
    expect(screen.getByText('Confidence: 92%')).toBeInTheDocument();
  });

  it('displays key points in summary', async () => {
    render(<AIInsightsPanel opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Key Points')).toBeInTheDocument();
    });

    expect(screen.getByText('• Cloud migration')).toBeInTheDocument();
    expect(screen.getByText('• Security upgrades')).toBeInTheDocument();
  });

  it('renders tab buttons', async () => {
    render(<AIInsightsPanel opportunityId="opp-123" />);

    expect(screen.getByRole('button', { name: 'Summary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fit Score' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Risks' })).toBeInTheDocument();
  });

  it('switches to fit score tab when clicked', async () => {
    const user = userEvent.setup();
    render(<AIInsightsPanel opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });

    const fitScoreTab = screen.getByRole('button', { name: 'Fit Score' });
    await user.click(fitScoreTab);

    await waitFor(() => {
      expect(screen.getByText('Overall Fit Score')).toBeInTheDocument();
    });

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('NAICS Match')).toBeInTheDocument();
  });

  it('displays strengths and weaknesses in fit score tab', async () => {
    const user = userEvent.setup();
    render(<AIInsightsPanel opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Fit Score' }));

    await waitFor(() => {
      expect(screen.getByText('Strengths')).toBeInTheDocument();
    });

    expect(screen.getByText('Gaps')).toBeInTheDocument();
    expect(screen.getByText('✓ 8(a) certified')).toBeInTheDocument();
  });

  it('switches to risk assessment tab when clicked', async () => {
    const user = userEvent.setup();
    render(<AIInsightsPanel opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Risks' }));

    await waitFor(() => {
      expect(screen.getByText('MEDIUM RISK')).toBeInTheDocument();
    });

    expect(screen.getByText('Identified Risks')).toBeInTheDocument();
  });

  it('displays individual risks with severity', async () => {
    const user = userEvent.setup();
    render(<AIInsightsPanel opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Risks' }));

    await waitFor(() => {
      expect(screen.getByText('Schedule')).toBeInTheDocument();
    });

    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText('Aggressive timeline for cloud migration')).toBeInTheDocument();
  });

  it('displays mitigations in risk tab', async () => {
    const user = userEvent.setup();
    render(<AIInsightsPanel opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Risks' }));

    await waitFor(() => {
      expect(screen.getByText('Mitigations')).toBeInTheDocument();
    });

    expect(screen.getByText('→ Add contingency buffer')).toBeInTheDocument();
  });

  it('shows error message when API fails', async () => {
    (getOpportunitySummary as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    render(<AIInsightsPanel opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('caches data when switching between tabs', async () => {
    const user = userEvent.setup();
    render(<AIInsightsPanel opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });

    // Switch to fit score
    await user.click(screen.getByRole('button', { name: 'Fit Score' }));
    await waitFor(() => {
      expect(screen.getByText('Overall Fit Score')).toBeInTheDocument();
    });

    // Switch back to summary - should not call API again
    await user.click(screen.getByRole('button', { name: 'Summary' }));
    await waitFor(() => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });

    // Summary should only be called once (cached)
    expect(getOpportunitySummary).toHaveBeenCalledTimes(1);
  });

  it('calls API with correct opportunity ID', async () => {
    render(<AIInsightsPanel opportunityId="test-opp-id" />);

    await waitFor(() => {
      expect(getOpportunitySummary).toHaveBeenCalledWith('test-opp-id');
    });
  });
});
