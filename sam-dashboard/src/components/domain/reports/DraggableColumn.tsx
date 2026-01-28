import type {ColumnDefinition} from '../../../types/report.types';
import {Badge, IconButton, Text, TrashIcon} from '../../catalyst/primitives';
import {Box, Flex} from '../../catalyst/layout';

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
        >
            <Flex justify="space-between" align="center">
                <Flex align="center" gap="sm">
                    <Box/>
                    <Text variant="bodySmall" weight="medium">
                        {column.label}
                    </Text>
                    <Badge color="zinc">
                        {column.field}
                    </Badge>
                </Flex>
                <Flex align="center" gap="xs">
                    {onToggleVisibility !== undefined && (
                        <Badge
                            color={column.visible ? 'green' : 'zinc'}
                            style={{cursor: 'pointer'}}
                            onClick={handleToggleVisibility}
                        >
                            {column.visible ? 'Visible' : 'Hidden'}
                        </Badge>
                    )}
                    {onRemove !== undefined && (
                        <IconButton
                            icon={<TrashIcon size="sm"/>}
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
