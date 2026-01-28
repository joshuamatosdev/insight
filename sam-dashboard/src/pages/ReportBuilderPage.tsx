import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Flex,
  Stack,
  Box,
  Grid,
  GridItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../components/catalyst/layout';
import {
  Text,
  Button,
  Input,
  Select,
  Badge,
  Checkbox,
  CheckboxField,
} from '../components/catalyst/primitives';
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogActions,
  InlineAlert,
  InlineAlertDescription,
} from '../components/catalyst';
import { DraggableColumn, DropZone, FilterBuilder } from '../components/domain/reports';
import {
  PageHeading,
  PageHeadingSection,
  PageHeadingTitle,
  PageHeadingDescription,
  PageHeadingActions,
} from '../components/catalyst/navigation';
import type {
  EntityType,
  ColumnDefinition,
  FilterCondition,
  SortDirection,
  ReportBuilderFormState,
  ReportBuilderFormErrors,
  ReportExecutionResult,
  ReportPageState,
} from '../types/report.types';

const API_BASE = '/api/v1';

/**
 * Entity type options for the selector
 */
const ENTITY_TYPE_OPTIONS: Array<{ value: EntityType; label: string }> = [
  { value: 'OPPORTUNITY', label: 'Opportunities' },
  { value: 'CONTRACT', label: 'Contracts' },
  { value: 'PIPELINE', label: 'Pipelines' },
  { value: 'INVOICE', label: 'Invoices' },
  { value: 'CONTACT', label: 'Contacts' },
  { value: 'ORGANIZATION', label: 'Organizations' },
  { value: 'CERTIFICATION', label: 'Certifications' },
  { value: 'COMPLIANCE', label: 'Compliance Items' },
  { value: 'DELIVERABLE', label: 'Deliverables' },
  { value: 'BUDGET', label: 'Budget Items' },
];

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  try {
    const authData = localStorage.getItem('auth');
    if (authData !== null) {
      const parsed = JSON.parse(authData) as { accessToken?: string };
      return parsed.accessToken ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Initial form state
 */
const INITIAL_FORM_STATE: ReportBuilderFormState = {
  name: '',
  description: '',
  entityType: null,
  selectedColumns: [],
  filters: [],
  sortBy: '',
  sortDirection: 'ASC',
  isPublic: false,
};

/**
 * Props for ReportBuilderPage
 */
export interface ReportBuilderPageProps {
  reportId?: string;
  onSave?: (reportId: string) => void;
  onCancel?: () => void;
}

/**
 * Report Builder Page with drag-and-drop column configuration
 */
export function ReportBuilderPage({
  reportId,
  onSave,
  onCancel,
}: ReportBuilderPageProps): React.ReactElement {
  const [pageState, setPageState] = useState<ReportPageState>('loading');
  const [formState, setFormState] = useState<ReportBuilderFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<ReportBuilderFormErrors>({});
  const [availableColumns, setAvailableColumns] = useState<ColumnDefinition[]>([]);
  const [previewData, setPreviewData] = useState<ReportExecutionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Drag state
  const [draggedColumn, setDraggedColumn] = useState<ColumnDefinition | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const isEditMode = reportId !== undefined;

  /**
   * Fetch available columns for the selected entity type
   */
  const fetchAvailableColumns = useCallback(async (entityType: EntityType): Promise<void> => {
    const token = getAuthToken();
    if (token === null) {
      setErrors({ general: 'Not authenticated' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/report-definitions/columns/${entityType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok === false) {
        throw new Error('Failed to fetch columns');
      }

      const columns = (await response.json()) as ColumnDefinition[];
      setAvailableColumns(columns);
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Failed to load columns' });
    }
  }, []);

  /**
   * Load existing report for editing
   */
  const loadReport = useCallback(async (): Promise<void> => {
    if (reportId === undefined) {
      setPageState('loaded');
      return;
    }

    const token = getAuthToken();
    if (token === null) {
      setErrors({ general: 'Not authenticated' });
      setPageState('error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/report-definitions/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok === false) {
        throw new Error('Failed to load report');
      }

      const report = (await response.json()) as {
        name: string;
        description: string | null;
        entityType: EntityType;
        columns: ColumnDefinition[];
        filters: FilterCondition[];
        sortBy: string | null;
        sortDirection: SortDirection | null;
        isPublic: boolean;
      };

      setFormState({
        name: report.name,
        description: report.description ?? '',
        entityType: report.entityType,
        selectedColumns: report.columns,
        filters: report.filters,
        sortBy: report.sortBy ?? '',
        sortDirection: report.sortDirection ?? 'ASC',
        isPublic: report.isPublic,
      });

      await fetchAvailableColumns(report.entityType);
      setPageState('loaded');
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Failed to load report' });
      setPageState('error');
    }
  }, [reportId, fetchAvailableColumns]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  /**
   * Handle entity type change
   */
  const handleEntityTypeChange = async (entityType: EntityType): Promise<void> => {
    setFormState({
      ...INITIAL_FORM_STATE,
      name: formState.name,
      description: formState.description,
      entityType,
      isPublic: formState.isPublic,
    });
    await fetchAvailableColumns(entityType);
  };

  /**
   * Drag handlers
   */
  const handleDragStart = (e: React.DragEvent, column: ColumnDefinition, index: number): void => {
    setDraggedColumn(column);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (): void => {
    setDraggedColumn(null);
    setDraggedIndex(null);
    setIsDropTarget(false);
  };

  const handleDragOverAvailable = (e: React.DragEvent): void => {
    e.preventDefault();
  };

  const handleDragEnterDropZone = (): void => {
    setIsDropTarget(true);
  };

  const handleDragLeaveDropZone = (): void => {
    setIsDropTarget(false);
  };

  /**
   * Add column to selected
   */
  const handleAddColumn = (column: ColumnDefinition): void => {
    const alreadySelected = formState.selectedColumns.some((c) => c.field === column.field);
    if (alreadySelected === false) {
      setFormState({
        ...formState,
        selectedColumns: [...formState.selectedColumns, { ...column, visible: true }],
      });
    }
    setDraggedColumn(null);
    setDraggedIndex(null);
    setIsDropTarget(false);
  };

  /**
   * Remove column from selected
   */
  const handleRemoveColumn = (column: ColumnDefinition): void => {
    setFormState({
      ...formState,
      selectedColumns: formState.selectedColumns.filter((c) => c.field !== column.field),
    });
  };

  /**
   * Toggle column visibility
   */
  const handleToggleVisibility = (column: ColumnDefinition): void => {
    setFormState({
      ...formState,
      selectedColumns: formState.selectedColumns.map((c) =>
        c.field === column.field ? { ...c, visible: c.visible === false } : c
      ),
    });
  };

  /**
   * Reorder columns
   */
  const handleReorderColumns = (fromIndex: number, toIndex: number): void => {
    const columns = [...formState.selectedColumns];
    const [moved] = columns.splice(fromIndex, 1);
    if (moved !== undefined) {
      columns.splice(toIndex, 0, moved);
      setFormState({ ...formState, selectedColumns: columns });
      setDraggedIndex(toIndex);
    }
  };

  /**
   * Update filters
   */
  const handleFiltersChange = (filters: FilterCondition[]): void => {
    setFormState({ ...formState, filters });
  };

  /**
   * Preview report
   */
  const handlePreview = async (): Promise<void> => {
    if (validateForm() === false) {
      return;
    }

    const token = getAuthToken();
    if (token === null) {
      setErrors({ general: 'Not authenticated' });
      return;
    }

    setPageState('previewing');

    try {
      // First save the report as draft, then execute
      const reportPayload = {
        name: formState.name || 'Untitled Report',
        description: formState.description || null,
        entityType: formState.entityType,
        columns: formState.selectedColumns,
        filters: formState.filters,
        sortBy: formState.sortBy || null,
        sortDirection: formState.sortDirection,
        isPublic: false,
      };

      let currentReportId = reportId;

      if (currentReportId === undefined) {
        // Create temporary report
        const createResponse = await fetch(`${API_BASE}/report-definitions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reportPayload),
        });

        if (createResponse.ok === false) {
          throw new Error('Failed to create report for preview');
        }

        const created = (await createResponse.json()) as { id: string };
        currentReportId = created.id;
      }

      // Execute report
      const execResponse = await fetch(`${API_BASE}/report-definitions/${currentReportId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (execResponse.ok === false) {
        throw new Error('Failed to execute report');
      }

      const result = (await execResponse.json()) as ReportExecutionResult;
      setPreviewData(result);
      setPageState('loaded');
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Failed to preview report' });
      setPageState('error');
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: ReportBuilderFormErrors = {};

    if (formState.name.trim() === '') {
      newErrors.name = 'Report name is required';
    }

    if (formState.entityType === null) {
      newErrors.entityType = 'Please select an entity type';
    }

    if (formState.selectedColumns.length === 0) {
      newErrors.columns = 'Please select at least one column';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Save report
   */
  const handleSave = async (): Promise<void> => {
    if (validateForm() === false) {
      return;
    }

    const token = getAuthToken();
    if (token === null) {
      setErrors({ general: 'Not authenticated' });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: formState.name,
        description: formState.description || null,
        entityType: formState.entityType,
        columns: formState.selectedColumns,
        filters: formState.filters,
        sortBy: formState.sortBy || null,
        sortDirection: formState.sortDirection,
        isPublic: formState.isPublic,
      };

      const url = isEditMode
        ? `${API_BASE}/report-definitions/${reportId}`
        : `${API_BASE}/report-definitions`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok === false) {
        throw new Error('Failed to save report');
      }

      const saved = (await response.json()) as { id: string };
      setShowSaveDialog(false);

      if (onSave !== undefined) {
        onSave(saved.id);
      }
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Failed to save report' });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Get columns not yet selected
   */
  const getUnselectedColumns = (): ColumnDefinition[] => {
    const selectedFields = new Set(formState.selectedColumns.map((c) => c.field));
    return availableColumns.filter((c) => selectedFields.has(c.field) === false);
  };

  if (pageState === 'loading') {
    return (
      <Flex justify="center" align="center" className="min-h-[200px]">
        <Text variant="body">Loading report builder...</Text>
      </Flex>
    );
  }

  if (pageState === 'error' && errors.general !== undefined) {
    return (
      <Flex justify="center" align="center" className="min-h-[200px]">
        <Stack spacing="md" className="text-center">
          <Text variant="body" color="danger">
            {errors.general}
          </Text>
          <Button variant="primary" onClick={loadReport}>
            Retry
          </Button>
        </Stack>
      </Flex>
    );
  }

  return (
    <Stack spacing="lg">
      {/* Header */}
      <PageHeading>
        <PageHeadingSection>
          <PageHeadingTitle>{isEditMode ? 'Edit Report' : 'Create Report'}</PageHeadingTitle>
          <PageHeadingDescription>
            Build a custom report by selecting columns and filters
          </PageHeadingDescription>
        </PageHeadingSection>
        <PageHeadingActions>
          {onCancel !== undefined && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={formState.entityType === null || formState.selectedColumns.length === 0}
          >
            Preview
          </Button>
          <Button variant="primary" onClick={() => setShowSaveDialog(true)}>
            Save Report
          </Button>
        </PageHeadingActions>
      </PageHeading>

      {/* Error display */}
      {errors.general !== undefined && (
        <InlineAlert color="error">
          <InlineAlertDescription>{errors.general}</InlineAlertDescription>
        </InlineAlert>
      )}

      {/* Entity Type Selector */}
      <Card>
        <CardHeader>
          <Text variant="heading5">Data Source</Text>
        </CardHeader>
        <CardBody>
          <Box className="max-w-md">
            <Select
              value={formState.entityType ?? ''}
              onChange={(e) => handleEntityTypeChange(e.target.value as EntityType)}
              placeholder="Select data source..."
              options={ENTITY_TYPE_OPTIONS}
            />
            {errors.entityType !== undefined && (
              <Text variant="caption" color="danger" className="mt-1">
                {errors.entityType}
              </Text>
            )}
          </Box>
        </CardBody>
      </Card>

      {/* Column Selection */}
      {formState.entityType !== null && (
        <Grid columns={2} gap="lg">
          {/* Available Columns */}
          <GridItem>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Text variant="heading5">Available Columns</Text>
                  <Badge color="zinc">{getUnselectedColumns().length}</Badge>
                </Flex>
              </CardHeader>
              <CardBody>
                <Stack spacing="sm" onDragOver={handleDragOverAvailable}>
                  {getUnselectedColumns().map((column, index) => (
                    <Box
                      key={column.field}
                      onDoubleClick={() => handleAddColumn(column)}
                      title="Double-click or drag to add"
                    >
                      <DraggableColumn
                        column={column}
                        index={index}
                        isDragging={draggedColumn?.field === column.field}
                        isSelected={false}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    </Box>
                  ))}
                  {getUnselectedColumns().length === 0 && (
                    <Text variant="bodySmall" color="muted" className="text-center p-4">
                      All columns have been added to the report
                    </Text>
                  )}
                </Stack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Selected Columns */}
          <GridItem>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Text variant="heading5">Selected Columns</Text>
                  <Badge color="blue">{formState.selectedColumns.length}</Badge>
                </Flex>
              </CardHeader>
              <CardBody
                onDragEnter={handleDragEnterDropZone}
                onDragLeave={handleDragLeaveDropZone}
              >
                <DropZone
                  columns={formState.selectedColumns}
                  onDrop={handleAddColumn}
                  onReorder={handleReorderColumns}
                  onRemove={handleRemoveColumn}
                  onToggleVisibility={handleToggleVisibility}
                  draggedColumn={draggedColumn}
                  draggedIndex={draggedIndex}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDropTarget={isDropTarget}
                />
                {errors.columns !== undefined && (
                  <Text variant="caption" color="danger" className="mt-2">
                    {errors.columns}
                  </Text>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      )}

      {/* Filters */}
      {formState.entityType !== null && (
        <Card>
          <CardBody>
            <FilterBuilder
              filters={formState.filters}
              availableColumns={availableColumns}
              onChange={handleFiltersChange}
            />
          </CardBody>
        </Card>
      )}

      {/* Sort Configuration */}
      {formState.entityType !== null && formState.selectedColumns.length > 0 && (
        <Card>
          <CardHeader>
            <Text variant="heading5">Sort Configuration</Text>
          </CardHeader>
          <CardBody>
            <Flex gap="md">
              <Box className="flex-1">
                <Text as="label" variant="caption" color="muted" htmlFor="sortBy" className="mb-1">
                  Sort By
                </Text>
                <Select
                  id="sortBy"
                  value={formState.sortBy}
                  onChange={(e) => setFormState({ ...formState, sortBy: e.target.value })}
                  placeholder="None"
                  options={formState.selectedColumns.map((col) => ({
                    value: col.field,
                    label: col.label,
                  }))}
                />
              </Box>
              <Box className="flex-1">
                <Text as="label" variant="caption" color="muted" htmlFor="sortDirection" className="mb-1">
                  Direction
                </Text>
                <Select
                  id="sortDirection"
                  value={formState.sortDirection}
                  onChange={(e) =>
                    setFormState({ ...formState, sortDirection: e.target.value as SortDirection })
                  }
                  options={[
                    { value: 'ASC', label: 'Ascending' },
                    { value: 'DESC', label: 'Descending' },
                  ]}
                />
              </Box>
            </Flex>
          </CardBody>
        </Card>
      )}

      {/* Preview Results */}
      {previewData !== null && (
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Text variant="heading5">Preview Results</Text>
              <Badge color="cyan">{previewData.totalRecords} records</Badge>
            </Flex>
          </CardHeader>
          <CardBody padding="none">
            <Box className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    {previewData.columns
                      .filter((col) => col.visible)
                      .map((col) => (
                        <TableHeaderCell key={col.field}>{col.label}</TableHeaderCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.data.slice(0, 10).map((row, rowIndex) => (
                    <TableRow key={`row-${rowIndex}`}>
                      {previewData.columns
                        .filter((col) => col.visible)
                        .map((col) => (
                          <TableCell key={`${rowIndex}-${col.field}`}>
                            {String(row[col.field] ?? '-')}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            {previewData.totalRecords > 10 && (
              <Box className="p-3 text-center">
                <Text variant="bodySmall" color="muted">
                  Showing 10 of {previewData.totalRecords} records
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>
      )}

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} size="md">
        <DialogTitle>Save Report</DialogTitle>
        <DialogBody>
          <Stack spacing="md">
            <Box>
              <Text as="label" variant="caption" color="muted" htmlFor="reportName" className="mb-1">
                Report Name *
              </Text>
              <Input
                id="reportName"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="Enter report name..."
              />
              {errors.name !== undefined && (
                <Text variant="caption" color="danger" className="mt-1">
                  {errors.name}
                </Text>
              )}
            </Box>
            <Box>
              <Text as="label" variant="caption" color="muted" htmlFor="reportDescription" className="mb-1">
                Description
              </Text>
              <Input
                id="reportDescription"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Enter description..."
              />
            </Box>
            <CheckboxField>
              <Checkbox
                checked={formState.isPublic}
                onChange={(checked) => setFormState({ ...formState, isPublic: checked })}
              />
              <Text as="label" variant="bodySmall">Share with all team members</Text>
            </CheckboxField>
          </Stack>
        </DialogBody>
        <DialogActions>
          <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default ReportBuilderPage;
