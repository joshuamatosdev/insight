import { useState, useCallback } from 'react';
import { Box } from '../../layout/Box';
import { Stack, HStack } from '../../layout/Stack';
import { Text } from '../../primitives/Text';
import { Badge } from '../../primitives/Badge';
import { PipelineCard } from './PipelineCard';
import type { PipelineStageColumnProps } from './PipelineStageColumn.types';
import type { PipelineOpportunity } from '../../../types/pipeline';

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '$0';
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function getStageTypeColor(stageType: string): string {
  switch (stageType) {
    case 'INITIAL':
      return 'var(--color-gray-500)';
    case 'IN_PROGRESS':
      return 'var(--color-primary)';
    case 'WON':
      return 'var(--color-success)';
    case 'LOST':
      return 'var(--color-danger)';
    default:
      return 'var(--color-border)';
  }
}

export function PipelineStageColumn({
  stage,
  opportunities,
  onOpportunityClick,
  onOpportunityEdit,
  onOpportunityDelete,
  onOpportunityDrop,
  totalValue = 0,
  weightedValue = 0,
}: PipelineStageColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const opportunityData = e.dataTransfer.getData('application/json');
      if (opportunityData.length === 0) {
        return;
      }

      try {
        const opportunity = JSON.parse(opportunityData) as PipelineOpportunity;
        if (opportunity.stageId !== stage.id && onOpportunityDrop !== undefined) {
          onOpportunityDrop(opportunity, stage.id);
        }
      } catch {
        // Invalid JSON, ignore
      }
    },
    [stage.id, onOpportunityDrop]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, opportunity: PipelineOpportunity) => {
      e.dataTransfer.setData('application/json', JSON.stringify(opportunity));
      e.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const stageColor = stage.color ?? getStageTypeColor(stage.stageType);

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minWidth: '300px',
        maxWidth: '350px',
        backgroundColor: isDragOver === true ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: isDragOver === true
          ? '2px dashed var(--color-primary)'
          : '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      {/* Column Header */}
      <Box
        style={{
          padding: 'var(--spacing-4)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
        }}
      >
        <HStack justify="between" align="center">
          <HStack gap="sm" align="center">
            <Box
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: stageColor,
              }}
            />
            <Text variant="bodySmall" weight="semibold">
              {stage.name}
            </Text>
          </HStack>
          <Badge color="gray" size="sm">
            {opportunities.length}
          </Badge>
        </HStack>

        <HStack justify="between" gap="md" style={{ marginTop: 'var(--spacing-2)' }}>
          <Stack gap="0">
            <Text variant="caption" color="secondary">
              Total Value
            </Text>
            <Text variant="bodySmall" weight="medium">
              {formatCurrency(totalValue)}
            </Text>
          </Stack>
          <Stack gap="0">
            <Text variant="caption" color="secondary">
              Weighted
            </Text>
            <Text variant="bodySmall" weight="medium">
              {formatCurrency(weightedValue)}
            </Text>
          </Stack>
          {stage.probability !== null && (
            <Stack gap="0">
              <Text variant="caption" color="secondary">
                Prob.
              </Text>
              <Text variant="bodySmall" weight="medium">
                {stage.probability}%
              </Text>
            </Stack>
          )}
        </HStack>
      </Box>

      {/* Opportunity Cards */}
      <Box
        style={{
          padding: 'var(--spacing-3)',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        <Stack gap="sm">
          {opportunities.map((opportunity) => (
            <Box
              key={opportunity.id}
              draggable={onOpportunityDrop !== undefined}
              onDragStart={(e) => handleDragStart(e, opportunity)}
              style={{ cursor: onOpportunityDrop !== undefined ? 'grab' : 'default' }}
            >
              <PipelineCard
                opportunity={opportunity}
                onClick={onOpportunityClick}
                onEdit={onOpportunityEdit}
                onDelete={onOpportunityDelete}
                showActions={onOpportunityEdit !== undefined || onOpportunityDelete !== undefined}
              />
            </Box>
          ))}

          {opportunities.length === 0 && (
            <Box
              style={{
                padding: 'var(--spacing-6)',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <Text variant="bodySmall" color="secondary">
                No opportunities
              </Text>
              <Text variant="caption" color="secondary">
                Drag opportunities here
              </Text>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
