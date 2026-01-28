import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Box, HStack, Section, SectionHeader, Stack} from '../../components/catalyst/layout';
import {Badge, Button, Select, Text} from '../../components/catalyst/primitives';
import {PipelineBoard} from '../../components/domain/pipeline';
import {usePipelineOpportunities, usePipelines, usePipelineSummary,} from '../../hooks/usePipeline';
import type {PipelineOpportunity} from '../../types/pipeline';

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function PipelinePage() {
  const navigate = useNavigate();
  const { pipelines, isLoading: loadingPipelines, error: pipelinesError } = usePipelines();

  // Select first pipeline by default, or allow user to change
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');

  // Once pipelines load, select the default one
  const activePipeline = useMemo(() => {
    if (pipelines.length === 0) {
      return null;
    }
    if (selectedPipelineId !== '') {
      return pipelines.find((p) => p.id === selectedPipelineId) ?? null;
    }
    // Find default pipeline or use first one
    return pipelines.find((p) => p.isDefault === true) ?? pipelines.at(0) ?? null;
  }, [pipelines, selectedPipelineId]);

  const pipelineId = activePipeline?.id ?? '';

  const {
    opportunities,
    isLoading: loadingOpportunities,
    error: opportunitiesError,
    moveToStage,
    remove,
    refresh: refreshOpportunities,
  } = usePipelineOpportunities(pipelineId);

  const {
    summary,
    approachingDeadlines,
    isLoading: loadingSummary,
  } = usePipelineSummary(pipelineId);

  const handleOpportunityClick = (opportunity: PipelineOpportunity) => {
    navigate(`/pipeline/${pipelineId}/opportunity/${opportunity.id}`);
  };

  const handleOpportunityEdit = (opportunity: PipelineOpportunity) => {
    navigate(`/pipeline/${pipelineId}/opportunity/${opportunity.id}/edit`);
  };

  const handleOpportunityDelete = async (opportunity: PipelineOpportunity) => {
    if (
      window.confirm(
        `Remove "${opportunity.internalName ?? opportunity.opportunityTitle}" from pipeline?`
      ) === true
    ) {
      try {
        await remove(opportunity.id);
        await refreshOpportunities();
      } catch (err) {
        console.error('Failed to remove opportunity:', err);
      }
    }
  };

  const handleOpportunityMove = async (opportunity: PipelineOpportunity, stageId: string) => {
    try {
      await moveToStage(opportunity.id, stageId);
      await refreshOpportunities();
    } catch (err) {
      console.error('Failed to move opportunity:', err);
    }
  };

  const handlePipelineChange = (pipelineIdValue: string) => {
    setSelectedPipelineId(pipelineIdValue);
  };

  const pipelineOptions = useMemo(() => {
    return pipelines.map((p) => ({
      value: p.id,
      label: p.name + (p.isDefault === true ? ' (Default)' : ''),
    }));
  }, [pipelines]);

  const isLoading = loadingPipelines === true || loadingOpportunities === true || loadingSummary === true;
  const error = pipelinesError ?? opportunitiesError;

  if (error !== null) {
    return (
      <Section id="pipeline">
        <Box>
          <Text variant="body" color="danger">
            Error: {error.message}
          </Text>
        </Box>
      </Section>
    );
  }

  if (loadingPipelines === true) {
    return (
      <Section id="pipeline">
        <Box>
          <Text variant="body" color="secondary">
            Loading pipelines...
          </Text>
        </Box>
      </Section>
    );
  }

  if (pipelines.length === 0) {
    return (
      <Section id="pipeline">
        <Box>
          <Stack gap="md" align="center">
            <Text variant="heading4">No Pipelines Found</Text>
            <Text variant="body" color="secondary">
              Create a pipeline to start tracking opportunities.
            </Text>
            <Button onClick={() => navigate('/pipeline/new')}>
              Create Pipeline
            </Button>
          </Stack>
        </Box>
      </Section>
    );
  }

  return (
    <Section id="pipeline">
      <SectionHeader
        title="Pipeline"
        actions={
          <HStack gap="md" align="center">
            <Select
              value={activePipeline?.id ?? ''}
              onChange={(e) => handlePipelineChange(e.target.value)}
              options={pipelineOptions}
            />
            <Button variant="secondary" onClick={() => navigate('/pipeline/settings')}>
              Settings
            </Button>
            <Button onClick={() => navigate('/pipeline/add')}>
              Add Opportunity
            </Button>
          </HStack>
        }
      />

      {/* Summary Stats */}
      {summary !== null && (
        <HStack gap="lg" wrap="wrap">
          <Stack gap="xs">
            <Text variant="caption" color="secondary">
              Total Pipeline Value
            </Text>
            <Text variant="heading4">{formatCurrency(summary.totalValue)}</Text>
          </Stack>
          <Stack gap="xs">
            <Text variant="caption" color="secondary">
              Weighted Value
            </Text>
            <Text variant="heading4">{formatCurrency(summary.totalWeightedValue)}</Text>
          </Stack>
          <Stack gap="xs">
            <Text variant="caption" color="secondary">
              Total Opportunities
            </Text>
            <Text variant="heading4">{summary.totalOpportunities}</Text>
          </Stack>
          <HStack gap="sm">
            <Badge color="green" size="sm">
              {summary.bidCount} Bid
            </Badge>
            <Badge color="red" size="sm">
              {summary.noBidCount} No-Bid
            </Badge>
            <Badge color="yellow" size="sm">
              {summary.pendingCount} Pending
            </Badge>
          </HStack>
        </HStack>
      )}

      {/* Approaching Deadlines Alert */}
      {approachingDeadlines.length > 0 && (
        <Box
        >
          <HStack justify="between" align="center">
            <Text variant="bodySmall" color="warning" weight="semibold">
              {approachingDeadlines.length} opportunity(ies) with deadlines in the next 7 days
            </Text>
            <Button variant="ghost" size="sm" onClick={() => navigate('/pipeline/deadlines')}>
              View All
            </Button>
          </HStack>
        </Box>
      )}

      {/* Pipeline Board */}
      {activePipeline !== null && (
        <PipelineBoard
          pipeline={activePipeline}
          opportunities={opportunities}
          onOpportunityClick={handleOpportunityClick}
          onOpportunityEdit={handleOpportunityEdit}
          onOpportunityDelete={handleOpportunityDelete}
          onOpportunityMove={handleOpportunityMove}
          isLoading={isLoading}
        />
      )}
    </Section>
  );
}
