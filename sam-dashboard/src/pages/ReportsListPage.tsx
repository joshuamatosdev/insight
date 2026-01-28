import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
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
  Badge,
  Input,
  Select,
  IconButton,
} from '../components/catalyst/primitives';
import {
  TrashIcon,
  PencilIcon,
  DownloadIcon,
} from '../components/catalyst/primitives/Icon';
import {
  PageHeading,
  PageHeadingSection,
  PageHeadingTitle,
  PageHeadingDescription,
  PageHeadingActions,
} from '../components/catalyst/navigation';
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from '../components/catalyst';
import type {
  ReportDefinition,
  EntityType,
  PaginatedReportResponse,
  ReportPageState,
  ExportFormat,
} from '../types/report.types';

const API_BASE = '/api/v1';

/**
 * Entity type display labels
 */
const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  OPPORTUNITY: 'Opportunities',
  CONTRACT: 'Contracts',
  PIPELINE: 'Pipelines',
  INVOICE: 'Invoices',
  CONTACT: 'Contacts',
  ORGANIZATION: 'Organizations',
  CERTIFICATION: 'Certifications',
  COMPLIANCE: 'Compliance',
  DELIVERABLE: 'Deliverables',
  BUDGET: 'Budget',
};

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
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (dateString === null) {
    return '-';
  }
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Props for ReportsListPage
 */
export interface ReportsListPageProps {
  onCreateReport?: () => void;
  onEditReport?: (reportId: string) => void;
  onRunReport?: (reportId: string) => void;
}

/**
 * Reports List Page - displays saved reports with actions
 */
export function ReportsListPage({
  onCreateReport,
  onEditReport,
  onRunReport,
}: ReportsListPageProps): React.ReactElement {
  const [pageState, setPageState] = useState<ReportPageState>('loading');
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const pageSize = 10;

  /**
   * Fetch reports from API
   */
  const fetchReports = useCallback(async (): Promise<void> => {
    const token = getAuthToken();
    if (token === null) {
      setError('Not authenticated');
      setPageState('error');
      return;
    }

    try {
      setPageState('loading');

      const params = new URLSearchParams({
        page: String(currentPage),
        size: String(pageSize),
      });

      if (searchTerm !== '') {
        params.append('search', searchTerm);
      }

      if (entityTypeFilter !== '') {
        params.append('entityType', entityTypeFilter);
      }

      const response = await fetch(`${API_BASE}/report-definitions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok === false) {
        throw new Error('Failed to fetch reports');
      }

      const data = (await response.json()) as PaginatedReportResponse;
      setReports(data.content);
      setTotalElements(data.totalElements);
      setPageState('loaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
      setPageState('error');
    }
  }, [currentPage, searchTerm, entityTypeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /**
   * Handle search
   */
  const handleSearch = (value: string): void => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  /**
   * Handle entity type filter
   */
  const handleEntityTypeFilter = (value: string): void => {
    setEntityTypeFilter(value as EntityType | '');
    setCurrentPage(0);
  };

  /**
   * Run a report
   */
  const handleRunReport = async (reportId: string): Promise<void> => {
    if (onRunReport !== undefined) {
      onRunReport(reportId);
      return;
    }

    const token = getAuthToken();
    if (token === null) {
      setError('Not authenticated');
      return;
    }

    try {
      setPageState('executing');

      const response = await fetch(`${API_BASE}/report-definitions/${reportId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (response.ok === false) {
        throw new Error('Failed to execute report');
      }

      // Refresh the list to update run count
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run report');
      setPageState('error');
    }
  };

  /**
   * Export a report
   */
  const handleExportReport = async (reportId: string, format: ExportFormat): Promise<void> => {
    const token = getAuthToken();
    if (token === null) {
      setError('Not authenticated');
      return;
    }

    try {
      setExportingId(reportId);

      const response = await fetch(
        `${API_BASE}/report-definitions/${reportId}/export?format=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok === false) {
        throw new Error('Failed to export report');
      }

      // Get filename from content-disposition header
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `report.${format.toLowerCase()}`;
      if (contentDisposition !== null) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match !== null && match[1] !== undefined) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setExportingId(null);
    }
  };

  /**
   * Delete a report
   */
  const handleDeleteReport = async (reportId: string): Promise<void> => {
    const confirmed = window.confirm('Are you sure you want to delete this report?');
    if (confirmed === false) {
      return;
    }

    const token = getAuthToken();
    if (token === null) {
      setError('Not authenticated');
      return;
    }

    try {
      setDeletingId(reportId);

      const response = await fetch(`${API_BASE}/report-definitions/${reportId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok === false) {
        throw new Error('Failed to delete report');
      }

      // Refresh the list
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Toggle report public status
   */
  const handleTogglePublic = async (report: ReportDefinition): Promise<void> => {
    const token = getAuthToken();
    if (token === null) {
      setError('Not authenticated');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/report-definitions/${report.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: report.name,
          description: report.description,
          columns: report.columns,
          filters: report.filters,
          sortBy: report.sortBy,
          sortDirection: report.sortDirection,
          isPublic: report.isPublic === false,
        }),
      });

      if (response.ok === false) {
        throw new Error('Failed to update report');
      }

      // Refresh the list
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report');
    }
  };

  const totalPages = Math.ceil(totalElements / pageSize);

  if (pageState === 'loading' && reports.length === 0) {
    return (
      <Flex justify="center" align="center" className="min-h-[200px]">
        <Text variant="body">Loading reports...</Text>
      </Flex>
    );
  }

  if (pageState === 'error' && error !== null) {
    return (
      <Flex justify="center" align="center" className="min-h-[200px]">
        <Stack spacing="md" className="text-center">
          <Text variant="body" color="danger">
            {error}
          </Text>
          <Button variant="primary" onClick={fetchReports}>
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
          <PageHeadingTitle>Reports</PageHeadingTitle>
          <PageHeadingDescription>
            Manage your custom reports
          </PageHeadingDescription>
        </PageHeadingSection>
        {onCreateReport !== undefined && (
          <PageHeadingActions>
            <Button variant="primary" onClick={onCreateReport}>
              Create Report
            </Button>
          </PageHeadingActions>
        )}
      </PageHeading>

      {/* Filters */}
      <Card>
        <CardBody>
          <Grid columns={3} gap="md">
            <GridItem>
              <Text as="label" variant="caption" color="muted" htmlFor="reportSearch" className="mb-1">
                Search
              </Text>
              <Input
                id="reportSearch"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search reports..."
              />
            </GridItem>
            <GridItem>
              <Text as="label" variant="caption" color="muted" htmlFor="dataSourceFilter" className="mb-1">
                Data Source
              </Text>
              <Select
                id="dataSourceFilter"
                value={entityTypeFilter}
                onChange={(e) => handleEntityTypeFilter(e.target.value)}
                placeholder="All Sources"
                options={Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </GridItem>
            <Flex align="end">
              <Text variant="bodySmall" color="muted">
                {totalElements} report{totalElements !== 1 ? 's' : ''} found
              </Text>
            </Flex>
          </Grid>
        </CardBody>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardBody padding="none">
          {reports.length === 0 ? (
            <Box className="p-8">
              <EmptyState>
                <EmptyStateTitle>No reports found</EmptyStateTitle>
                <EmptyStateDescription>
                  Get started by creating your first report.
                </EmptyStateDescription>
                {onCreateReport !== undefined && (
                  <EmptyStateActions>
                    <Button variant="outline" onClick={onCreateReport}>
                      Create Your First Report
                    </Button>
                  </EmptyStateActions>
                )}
              </EmptyState>
            </Box>
          ) : (
            <Table striped>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Data Source</TableHeaderCell>
                  <TableHeaderCell>Columns</TableHeaderCell>
                  <TableHeaderCell>Runs</TableHeaderCell>
                  <TableHeaderCell>Last Run</TableHeaderCell>
                  <TableHeaderCell>Shared</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Stack spacing="xs">
                        <Text variant="bodySmall" weight="medium">
                          {report.name}
                        </Text>
                        {report.description !== null && (
                          <Text variant="caption" color="muted">
                            {report.description}
                          </Text>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Badge color="zinc">
                        {ENTITY_TYPE_LABELS[report.entityType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Text variant="bodySmall">
                        {report.columns.filter((c) => c.visible).length} columns
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text variant="bodySmall">{report.runCount}</Text>
                    </TableCell>
                    <TableCell>
                      <Text variant="bodySmall">{formatDate(report.lastRunAt)}</Text>
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={report.isPublic ? 'green' : 'zinc'}
                        className="cursor-pointer"
                        onClick={() => handleTogglePublic(report)}
                      >
                        {report.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Flex gap="xs">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunReport(report.id)}
                        >
                          Run
                        </Button>
                        {onEditReport !== undefined && (
                          <IconButton
                            icon={<PencilIcon size="sm" />}
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditReport(report.id)}
                            aria-label="Edit report"
                          />
                        )}
                        <IconButton
                          icon={<DownloadIcon size="sm" />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExportReport(report.id, 'CSV')}
                          disabled={exportingId === report.id}
                          aria-label="Export report"
                        />
                        <IconButton
                          icon={<TrashIcon size="sm" />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={deletingId === report.id}
                          aria-label="Delete report"
                        />
                      </Flex>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="center" gap="sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Flex align="center" gap="sm">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </Button>
            )).slice(
              Math.max(0, currentPage - 2),
              Math.min(totalPages, currentPage + 3)
            )}
          </Flex>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </Flex>
      )}
    </Stack>
  );
}

export default ReportsListPage;
