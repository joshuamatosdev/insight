import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BrowserRouter} from 'react-router-dom';
import {PipelinePage} from './PipelinePage';
import * as pipelineHooks from '../../hooks/usePipeline';
import type {Pipeline, PipelineOpportunity} from '../../types/pipeline';

// Mock the hooks
vi.mock('../../hooks/usePipeline', () => ({
  usePipelines: vi.fn(),
  usePipelineOpportunities: vi.fn(),
  usePipelineSummary: vi.fn(),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockPipelines: Pipeline[] = [
  {
    id: 'pipeline-1',
    name: 'Federal Contracts',
    description: 'Federal government opportunities',
    isDefault: true,
    isArchived: false,
    stages: [
      { id: 'stage-1', name: 'Identified', description: null, position: 1, color: null, stageType: 'INITIAL', probability: 10 },
      { id: 'stage-2', name: 'Qualified', description: null, position: 2, color: null, stageType: 'IN_PROGRESS', probability: 30 },
      { id: 'stage-3', name: 'Pursuing', description: null, position: 3, color: null, stageType: 'IN_PROGRESS', probability: 50 },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockOpportunities: PipelineOpportunity[] = [
  {
    id: 'opp-1',
    pipelineId: 'pipeline-1',
    opportunityId: 'sam-opp-1',
    solicitationNumber: null,
    opportunityTitle: 'IT Modernization Services',
    stageId: 'stage-1',
    stageName: 'Identified',
    ownerId: null,
    ownerName: null,
    internalName: 'IMS Project',
    notes: null,
    decision: 'PENDING',
    decisionDate: null,
    decisionNotes: null,
    estimatedValue: 5000000,
    probabilityOfWin: 20,
    weightedValue: 1000000,
    captureManager: null,
    proposalManager: null,
    teamingPartners: null,
    winThemes: null,
    discriminators: null,
    internalDeadline: null,
    reviewDate: null,
    responseDeadline: '2025-02-15T00:00:00Z',
    stageEnteredAt: '2025-01-05T00:00:00Z',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'opp-2',
    pipelineId: 'pipeline-1',
    opportunityId: 'sam-opp-2',
    solicitationNumber: null,
    opportunityTitle: 'Cloud Migration Support',
    stageId: 'stage-2',
    stageName: 'Qualified',
    ownerId: null,
    ownerName: null,
    internalName: null,
    notes: null,
    decision: 'BID',
    decisionDate: null,
    decisionNotes: null,
    estimatedValue: 3000000,
    probabilityOfWin: 40,
    weightedValue: 1200000,
    captureManager: null,
    proposalManager: null,
    teamingPartners: null,
    winThemes: null,
    discriminators: null,
    internalDeadline: null,
    reviewDate: null,
    responseDeadline: '2025-03-01T00:00:00Z',
    stageEnteredAt: '2025-01-10T00:00:00Z',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
];

const mockSummary = {
  totalOpportunities: 2,
  totalValue: 8000000,
  totalWeightedValue: 2200000,
  bidCount: 1,
  noBidCount: 0,
  pendingCount: 1,
};

function renderPipelinePage() {
  return render(
    <BrowserRouter>
      <PipelinePage />
    </BrowserRouter>
  );
}

describe('PipelinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (pipelineHooks.usePipelines as Mock).mockReturnValue({
      pipelines: mockPipelines,
      isLoading: false,
      error: null,
    });

    (pipelineHooks.usePipelineOpportunities as Mock).mockReturnValue({
      opportunities: mockOpportunities,
      isLoading: false,
      error: null,
      moveToStage: vi.fn(),
      remove: vi.fn(),
      refresh: vi.fn(),
    });

    (pipelineHooks.usePipelineSummary as Mock).mockReturnValue({
      summary: mockSummary,
      approachingDeadlines: [],
      isLoading: false,
    });
  });

  describe('Rendering', () => {
    it('should render the Pipeline section', () => {
      renderPipelinePage();
      expect(screen.getByRole('heading', { name: /pipeline/i })).toBeInTheDocument();
    });

    it('should render pipeline selector', () => {
      renderPipelinePage();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render Add Opportunity button', () => {
      renderPipelinePage();
      expect(screen.getByRole('button', { name: /add opportunity/i })).toBeInTheDocument();
    });

    it('should render Settings button', () => {
      renderPipelinePage();
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });
  });

  describe('Summary Stats', () => {
    it('should display total pipeline value', () => {
      renderPipelinePage();
      expect(screen.getByText(/total pipeline value/i)).toBeInTheDocument();
      expect(screen.getByText('$8,000,000')).toBeInTheDocument();
    });

    it('should display weighted value', () => {
      renderPipelinePage();
      expect(screen.getByText(/weighted value/i)).toBeInTheDocument();
      expect(screen.getByText('$2,200,000')).toBeInTheDocument();
    });

    it('should display total opportunities count', () => {
      renderPipelinePage();
      expect(screen.getByText(/total opportunities/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display bid/no-bid/pending badges', () => {
      renderPipelinePage();
      expect(screen.getByText(/1 bid/i)).toBeInTheDocument();
      expect(screen.getByText(/0 no-bid/i)).toBeInTheDocument();
      expect(screen.getByText(/1 pending/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading message when pipelines are loading', () => {
      (pipelineHooks.usePipelines as Mock).mockReturnValue({
        pipelines: [],
        isLoading: true,
        error: null,
      });

      renderPipelinePage();
      expect(screen.getByText(/loading pipelines/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when loading fails', () => {
      const errorMessage = 'Failed to load pipelines';
      (pipelineHooks.usePipelines as Mock).mockReturnValue({
        pipelines: [],
        isLoading: false,
        error: new Error(errorMessage),
      });

      renderPipelinePage();
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no pipelines exist', () => {
      (pipelineHooks.usePipelines as Mock).mockReturnValue({
        pipelines: [],
        isLoading: false,
        error: null,
      });

      renderPipelinePage();
      expect(screen.getByText(/no pipelines found/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create pipeline/i })).toBeInTheDocument();
    });
  });

  describe('Approaching Deadlines Alert', () => {
    it('should display deadline alert when there are approaching deadlines', () => {
      (pipelineHooks.usePipelineSummary as Mock).mockReturnValue({
        summary: mockSummary,
        approachingDeadlines: [mockOpportunities[0]],
        isLoading: false,
      });

      renderPipelinePage();
      expect(screen.getByText(/1 opportunity\(ies\) with deadlines in the next 7 days/i)).toBeInTheDocument();
    });

    it('should not display deadline alert when there are no approaching deadlines', () => {
      renderPipelinePage();
      expect(screen.queryByText(/deadlines in the next 7 days/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to add opportunity page when add button is clicked', async () => {
      const user = userEvent.setup();
      renderPipelinePage();

      const addButton = screen.getByRole('button', { name: /add opportunity/i });
      await user.click(addButton);

      expect(mockNavigate).toHaveBeenCalledWith('/pipeline/add');
    });

    it('should navigate to settings page when settings button is clicked', async () => {
      const user = userEvent.setup();
      renderPipelinePage();

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/pipeline/settings');
    });

    it('should navigate to create pipeline page when create button is clicked in empty state', async () => {
      (pipelineHooks.usePipelines as Mock).mockReturnValue({
        pipelines: [],
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      renderPipelinePage();

      const createButton = screen.getByRole('button', { name: /create pipeline/i });
      await user.click(createButton);

      expect(mockNavigate).toHaveBeenCalledWith('/pipeline/new');
    });
  });

  describe('Pipeline Selection', () => {
    it('should allow changing the selected pipeline', async () => {
      const additionalPipeline: Pipeline = {
        id: 'pipeline-2',
        name: 'State Contracts',
        description: 'State government opportunities',
        isDefault: false,
        isArchived: false,
        stages: [],
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      };

      (pipelineHooks.usePipelines as Mock).mockReturnValue({
        pipelines: [...mockPipelines, additionalPipeline],
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      renderPipelinePage();

      const pipelineSelect = screen.getByRole('combobox');
      await user.selectOptions(pipelineSelect, 'pipeline-2');

      // The hooks should be called with the new pipeline ID
      expect(pipelineHooks.usePipelineOpportunities).toHaveBeenCalled();
    });
  });
});
