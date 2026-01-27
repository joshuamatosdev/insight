import { useMemo } from 'react';
import { Box } from '../../layout/Box';
import { HStack } from '../../layout/Stack';
import { Text } from '../../primitives/Text';
import { PipelineStageColumn } from './PipelineStageColumn';
import type { PipelineBoardProps } from './PipelineBoard.types';
import type { PipelineOpportunity } from '../../../types/pipeline';

export function PipelineBoard({
  pipeline,
  opportunities,
  stageSummaries,
  onOpportunityClick,
  onOpportunityEdit,
  onOpportunityDelete,
  onOpportunityMove,
  onDecision,
  isLoading = false,
}: PipelineBoardProps) {
  // Group opportunities by stage
  const opportunitiesByStage = useMemo(() => {
    const grouped = new Map<string, PipelineOpportunity[]>();

    // Initialize with empty arrays for all stages
    for (const stage of pipeline.stages) {
      grouped.set(stage.id, []);
    }

    // Group opportunities
    for (const opp of opportunities) {
      const existing = grouped.get(opp.stageId);
      if (existing !== undefined) {
        existing.push(opp);
      }
    }

    return grouped;
  }, [pipeline.stages, opportunities]);

  // Calculate totals per stage if not provided
  const calculatedSummaries = useMemo(() => {
    if (stageSummaries !== undefined) {
      return stageSummaries;
    }

    const summaries = new Map<string, { totalValue: number; weightedValue: number }>();

    for (const [stageId, opps] of opportunitiesByStage) {
      let totalValue = 0;
      let weightedValue = 0;

      for (const opp of opps) {
        if (opp.estimatedValue !== null) {
          totalValue += opp.estimatedValue;
        }
        if (opp.weightedValue !== null) {
          weightedValue += opp.weightedValue;
        }
      }

      summaries.set(stageId, { totalValue, weightedValue });
    }

    return summaries;
  }, [stageSummaries, opportunitiesByStage]);

  if (isLoading === true) {
    return (
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Text variant="body" color="secondary">
          Loading pipeline...
        </Text>
      </Box>
    );
  }

  const sortedStages = [...pipeline.stages].sort((a, b) => a.position - b.position);

  return (
    <Box
      style={{
        overflowX: 'auto',
        padding: 'var(--spacing-4)',
      }}
    >
      <HStack gap="md" align="stretch" style={{ minWidth: 'fit-content' }}>
        {sortedStages.map((stage) => {
          const stageOpportunities = opportunitiesByStage.get(stage.id) ?? [];
          const summary = calculatedSummaries.get(stage.id) ?? { totalValue: 0, weightedValue: 0 };

          return (
            <PipelineStageColumn
              key={stage.id}
              stage={stage}
              opportunities={stageOpportunities}
              onOpportunityClick={onOpportunityClick}
              onOpportunityEdit={onOpportunityEdit}
              onOpportunityDelete={onOpportunityDelete}
              onOpportunityDrop={onOpportunityMove}
              onDecision={onDecision}
              allStages={pipeline.stages}
              totalValue={summary.totalValue}
              weightedValue={summary.weightedValue}
            />
          );
        })}
      </HStack>
    </Box>
  );
}
