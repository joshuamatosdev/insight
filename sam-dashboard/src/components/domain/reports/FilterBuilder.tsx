import {useMemo, useState} from 'react';
import type {ColumnDefinition, FilterCondition, FilterOperator,} from '../../../types/report.types';
import {Button, IconButton, Input, PlusIcon, Select, Text, TrashIcon} from '../../catalyst/primitives';
import {Box, Card, CardBody, Flex, Stack} from '../../catalyst/layout';

/**
 * Filter operator options
 */
const FILTER_OPERATORS: Array<{ value: string; label: string }> = [
    {value: 'EQUALS', label: 'Equals'},
    {value: 'NOT_EQUALS', label: 'Not Equals'},
    {value: 'CONTAINS', label: 'Contains'},
    {value: 'NOT_CONTAINS', label: 'Does Not Contain'},
    {value: 'STARTS_WITH', label: 'Starts With'},
    {value: 'ENDS_WITH', label: 'Ends With'},
    {value: 'GREATER_THAN', label: 'Greater Than'},
    {value: 'LESS_THAN', label: 'Less Than'},
    {value: 'GREATER_THAN_OR_EQUALS', label: 'Greater Than or Equals'},
    {value: 'LESS_THAN_OR_EQUALS', label: 'Less Than or Equals'},
    {value: 'IS_NULL', label: 'Is Empty'},
    {value: 'IS_NOT_NULL', label: 'Is Not Empty'},
];

/**
 * Props for FilterBuilder component
 */
export interface FilterBuilderProps {
    filters: FilterCondition[];
    availableColumns: ColumnDefinition[];
    onChange: (filters: FilterCondition[]) => void;
}

/**
 * Filter builder component for creating report filters
 */
export function FilterBuilder({
                                  filters,
                                  availableColumns,
                                  onChange,
                              }: FilterBuilderProps): React.ReactElement {
    const [newFilter, setNewFilter] = useState<Partial<FilterCondition>>({
        field: '',
        operator: 'EQUALS',
        value: '',
    });

    const columnOptions = useMemo(() => {
        return availableColumns.map((col) => ({
            value: col.field,
            label: col.label,
        }));
    }, [availableColumns]);

    const handleAddFilter = (): void => {
        if (newFilter.field !== undefined && newFilter.field !== '' && newFilter.operator !== undefined) {
            const filter: FilterCondition = {
                field: newFilter.field,
                operator: newFilter.operator,
                value: newFilter.value ?? '',
            };
            onChange([...filters, filter]);
            setNewFilter({field: '', operator: 'EQUALS', value: ''});
        }
    };

    const handleRemoveFilter = (index: number): void => {
        const updated = filters.filter((_, i) => i !== index);
        onChange(updated);
    };

    const handleUpdateFilter = (index: number, field: keyof FilterCondition, value: string): void => {
        const updated = filters.map((filter, i) => {
            if (i === index) {
                return {...filter, [field]: value};
            }
            return filter;
        });
        onChange(updated);
    };

    const requiresValue = (operator: FilterOperator): boolean => {
        return operator !== 'IS_NULL' && operator !== 'IS_NOT_NULL';
    };

    return (
        <Stack spacing="md">
            <Text variant="heading5" weight="semibold">
                Filters
            </Text>

            {filters.length > 0 && (
                <Stack spacing="sm">
                    {filters.map((filter, index) => (
                        <Card key={`filter-${index}-${filter.field}`} variant="default">
                            <CardBody padding="sm">
                                <Flex gap="sm" align="end">
                                    <Box style={{flex: 1}}>
                                        <Text variant="caption" color="muted">
                                            Field
                                        </Text>
                                        <Select
                                            value={filter.field}
                                            onChange={(e) => handleUpdateFilter(index, 'field', e.target.value)}
                                            placeholder="Select field..."
                                            options={columnOptions}
                                        />
                                    </Box>
                                    <Box style={{flex: 1}}>
                                        <Text variant="caption" color="muted">
                                            Operator
                                        </Text>
                                        <Select
                                            value={filter.operator}
                                            onChange={(e) => handleUpdateFilter(index, 'operator', e.target.value)}
                                            options={FILTER_OPERATORS}
                                        />
                                    </Box>
                                    {requiresValue(filter.operator) && (
                                        <Box style={{flex: 1}}>
                                            <Text variant="caption" color="muted">
                                                Value
                                            </Text>
                                            <Input
                                                value={filter.value}
                                                onChange={(e) => handleUpdateFilter(index, 'value', e.target.value)}
                                                placeholder="Enter value..."
                                            />
                                        </Box>
                                    )}
                                    <IconButton
                                        icon={<TrashIcon size="sm"/>}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveFilter(index)}
                                        aria-label="Remove filter"
                                    />
                                </Flex>
                            </CardBody>
                        </Card>
                    ))}
                </Stack>
            )}

            {/* Add new filter */}
            <Card variant="default">
                <CardBody padding="sm">
                    <Flex gap="sm" align="end">
                        <Box style={{flex: 1}}>
                            <Text variant="caption" color="muted">
                                Field
                            </Text>
                            <Select
                                value={newFilter.field ?? ''}
                                onChange={(e) => setNewFilter({...newFilter, field: e.target.value})}
                                placeholder="Select field..."
                                options={columnOptions}
                            />
                        </Box>
                        <Box style={{flex: 1}}>
                            <Text variant="caption" color="muted">
                                Operator
                            </Text>
                            <Select
                                value={newFilter.operator ?? 'EQUALS'}
                                onChange={(e) => setNewFilter({
                                    ...newFilter,
                                    operator: e.target.value as FilterOperator
                                })}
                                options={FILTER_OPERATORS}
                            />
                        </Box>
                        {requiresValue(newFilter.operator ?? 'EQUALS') && (
                            <Box style={{flex: 1}}>
                                <Text variant="caption" color="muted">
                                    Value
                                </Text>
                                <Input
                                    value={newFilter.value ?? ''}
                                    onChange={(e) => setNewFilter({...newFilter, value: e.target.value})}
                                    placeholder="Enter value..."
                                />
                            </Box>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddFilter}
                            disabled={newFilter.field === undefined || newFilter.field === ''}
                        >
                            <PlusIcon size="sm"/>
                            Add
                        </Button>
                    </Flex>
                </CardBody>
            </Card>

            {filters.length === 0 && (
                <Text variant="bodySmall" color="muted">
                    No filters added. Add filters to narrow down your report data.
                </Text>
            )}
        </Stack>
    );
}

export default FilterBuilder;
