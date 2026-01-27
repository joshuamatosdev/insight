import type { ColumnDefinition } from '../../../types/report.types';
import { Text } from '../../catalyst/primitives';
import { Box, Stack } from '../../catalyst/layout';
import { DraggableColumn } from './DraggableColumn';

/**
 * Props for DropZone component
 */
export interface DropZoneProps {
  columns: ColumnDefinition[];
  onDrop: (column: ColumnDefinition) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (column: ColumnDefinition) => void;
  onToggleVisibility: (column: ColumnDefinition) => void;
  draggedColumn: ColumnDefinition | null;
  draggedIndex: number | null;
  onDragStart: (e: React.DragEvent, column: ColumnDefinition, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDropTarget: boolean;
  placeholder?: string;
}

/**
 * Drop zone for selected columns in the report builder
 */
export function DropZone({
  columns,
  onDrop,
  onReorder,
  onRemove,
  onToggleVisibility,
  draggedColumn,
  draggedIndex,
  onDragStart,
  onDragEnd,
  isDropTarget,
  placeholder = 'Drag columns here to add them to your report',
}: DropZoneProps): React.ReactElement {
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    if (draggedColumn !== null) {
      onDrop(draggedColumn);
    }
  };

  const handleDragOverItem = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
  };

  const isEmpty = columns.length === 0;

  return (
    <Box
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        minHeight: '200px',
        padding: '0.75rem',
        backgroundColor: isDropTarget
          ? '#dbeafe'
          : '#f4f4f5',
        border: `2px dashed ${isDropTarget ? '#2563eb' : '#d4d4d8'}`,
        borderRadius: '0.375rem',
        transition: 'all 150ms ease',
      }}
    >
      {isEmpty ? (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '176px',
          }}
        >
          <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
            {placeholder}
          </Text>
        </Box>
      ) : (
        <Stack spacing="sm">
          {columns.map((column, index) => (
            <Box
              key={column.field}
              onDragOver={(e) => handleDragOverItem(e, index)}
            >
              <DraggableColumn
                column={column}
                index={index}
                isDragging={draggedIndex === index}
                isSelected={true}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onRemove={onRemove}
                onToggleVisibility={onToggleVisibility}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default DropZone;
