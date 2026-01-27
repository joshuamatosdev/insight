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
      return '#71717a';
    case 'IN_PROGRESS':
      return '#2563eb';
    case 'WON':
      return '#10b981';
    case 'LOST':
      return '#ef4444';
    default:
      return '#e4e4e7';
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
        backgroundColor: isDragOver === true ? '#dbeafe' : '#f4f4f5',
        borderRadius: '0.5rem',
        border: isDragOver === true
          ? '2px dashed #2563eb'
          : '1px solid #e4e4e7',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      {/* Column Header */}
      <Box
        style={{
          padding: '1rem',
          borderBottom: '1px solid #e4e4e7',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '0.5rem',
          borderTopRightRadius: '0.5rem',
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

        <HStack justify="between" gap="md" className="mt-2">
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
          padding: '0.75rem',
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
                padding: '1.5rem',
                textAlign: 'center',
                borderRadius: '0.375rem',
                border: '1px dashed #e4e4e7',
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
