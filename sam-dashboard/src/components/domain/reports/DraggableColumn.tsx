import type { ColumnDefinition } from '../../../types/report.types';
import { Badge, Text, TrashIcon, IconButton } from '../../primitives';
import { Flex, Box } from '../../layout';

/**
 * Props for DraggableColumn component
 */
export interface DraggableColumnProps {
  column: ColumnDefinition;
  index: number;
  isDragging: boolean;
  isSelected: boolean;
  onDragStart: (e: React.DragEvent, column: ColumnDefinition, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onRemove?: (column: ColumnDefinition) => void;
  onToggleVisibility?: (column: ColumnDefinition) => void;
}

/**
 * A draggable column item for the report builder
 */
export function DraggableColumn({
  column,
  index,
  isDragging,
  isSelected,
  onDragStart,
  onDragEnd,
  onRemove,
  onToggleVisibility,
}: DraggableColumnProps): React.ReactElement {
  const handleDragStart = (e: React.DragEvent): void => {
    onDragStart(e, column, index);
  };

  const handleRemove = (): void => {
    if (onRemove !== undefined) {
      onRemove(column);
    }
  };

  const handleToggleVisibility = (): void => {
    if (onToggleVisibility !== undefined) {
      onToggleVisibility(column);
    }
  };

  return (
    <Box
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      style={{
        padding: 'var(--spacing-2) var(--spacing-3)',
        backgroundColor: isDragging
          ? 'var(--color-primary-light)'
          : isSelected
            ? 'var(--color-surface-container-high)'
            : 'var(--color-surface)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'background-color 150ms ease',
      }}
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="sm">
          <Box
            style={{
              width: '6px',
              height: '16px',
              backgroundColor: 'var(--color-outline)',
              borderRadius: '2px',
              marginRight: 'var(--spacing-1)',
            }}
          />
          <Text variant="bodySmall" weight="medium">
            {column.label}
          </Text>
          <Badge variant="secondary" size="sm">
            {column.field}
          </Badge>
        </Flex>
        <Flex align="center" gap="xs">
          {onToggleVisibility !== undefined && (
            <Badge
              variant={column.visible ? 'success' : 'default'}
              size="sm"
              style={{ cursor: 'pointer' }}
              onClick={handleToggleVisibility}
            >
              {column.visible ? 'Visible' : 'Hidden'}
            </Badge>
          )}
          {onRemove !== undefined && (
            <IconButton
              icon={<TrashIcon size="sm" />}
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              aria-label="Remove column"
            />
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default DraggableColumn;
