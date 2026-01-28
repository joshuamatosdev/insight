/**
 * ClearancesPage - Security clearances management
 */

import { useState, useCallback } from 'react';
import {
  Text,
  Button,
  Badge,
  Select,
  ShieldLockIcon,
  PlusIcon,
  RefreshIcon,
} from '../../components/catalyst/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  Stack,
  HStack,
  Flex,
  Grid,
  GridItem,
} from '../../components/catalyst/layout';
import { ClearanceCard, ClearanceForm } from '../../components/domain/compliance';
import { useClearances } from '../../hooks';
import type {
  SecurityClearance,
  ClearanceLevel,
  ClearanceFormState,
  CreateClearanceRequest,
} from '../../types/compliance.types';

const LEVEL_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Levels' },
  { value: 'CONFIDENTIAL', label: 'Confidential' },
  { value: 'SECRET', label: 'Secret' },
  { value: 'TOP_SECRET', label: 'Top Secret' },
  { value: 'TOP_SECRET_SCI', label: 'Top Secret / SCI' },
  { value: 'Q_CLEARANCE', label: 'Q Clearance (DOE)' },
  { value: 'L_CLEARANCE', label: 'L Clearance (DOE)' },
];

/**
 * Converts form state to API request
 */
function formStateToRequest(form: ClearanceFormState): CreateClearanceRequest {
  return {
    userId: form.userId.length > 0 ? form.userId : undefined,
    entityName: form.entityName.length > 0 ? form.entityName : undefined,
    clearanceType: form.clearanceType,
    clearanceLevel: form.clearanceLevel,
    investigationDate: form.investigationDate.length > 0 ? form.investigationDate : undefined,
    grantDate: form.grantDate.length > 0 ? form.grantDate : undefined,
    expirationDate: form.expirationDate.length > 0 ? form.expirationDate : undefined,
    reinvestigationDate: form.reinvestigationDate.length > 0 ? form.reinvestigationDate : undefined,
    polygraphType: form.polygraphType.length > 0 ? form.polygraphType : undefined,
    polygraphDate: form.polygraphDate.length > 0 ? form.polygraphDate : undefined,
    sponsoringAgency: form.sponsoringAgency.length > 0 ? form.sponsoringAgency : undefined,
    caseNumber: form.caseNumber.length > 0 ? form.caseNumber : undefined,
    cageCode: form.cageCode.length > 0 ? form.cageCode : undefined,
    facilityAddress: form.facilityAddress.length > 0 ? form.facilityAddress : undefined,
    fsoName: form.fsoName.length > 0 ? form.fsoName : undefined,
    fsoEmail: form.fsoEmail.length > 0 ? form.fsoEmail : undefined,
    fsoPhone: form.fsoPhone.length > 0 ? form.fsoPhone : undefined,
    sciAccess: form.sciAccess,
    sciPrograms: form.sciPrograms.length > 0 ? form.sciPrograms : undefined,
    sapAccess: form.sapAccess,
    notes: form.notes.length > 0 ? form.notes : undefined,
  };
}

/**
 * Converts clearance to form state for editing
 */
function clearanceToFormState(clearance: SecurityClearance): ClearanceFormState {
  return {
    userId: clearance.userId ?? '',
    entityName: clearance.entityName ?? '',
    clearanceType: clearance.clearanceType,
    clearanceLevel: clearance.clearanceLevel,
    investigationDate: clearance.investigationDate ?? '',
    grantDate: clearance.grantDate ?? '',
    expirationDate: clearance.expirationDate ?? '',
    reinvestigationDate: clearance.reinvestigationDate ?? '',
    polygraphType: clearance.polygraphType ?? '',
    polygraphDate: clearance.polygraphDate ?? '',
    sponsoringAgency: clearance.sponsoringAgency ?? '',
    caseNumber: clearance.caseNumber ?? '',
    cageCode: clearance.cageCode ?? '',
    facilityAddress: clearance.facilityAddress ?? '',
    fsoName: clearance.fsoName ?? '',
    fsoEmail: clearance.fsoEmail ?? '',
    fsoPhone: clearance.fsoPhone ?? '',
    sciAccess: clearance.sciAccess,
    sciPrograms: clearance.sciPrograms ?? '',
    sapAccess: clearance.sapAccess,
    notes: clearance.notes ?? '',
  };
}

export function ClearancesPage(): React.ReactElement {
  const [levelFilter, setLevelFilter] = useState<ClearanceLevel | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingClearance, setEditingClearance] = useState<SecurityClearance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    clearances,
    totalElements,
    totalPages,
    currentPage,
    isLoading,
    error: loadError,
    refresh,
    setPage,
    create,
    update,
    remove,
  } = useClearances(levelFilter);

  const handleLevelFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setLevelFilter(value.length > 0 ? (value as ClearanceLevel) : undefined);
    },
    []
  );

  const handleCreateClick = useCallback(() => {
    setEditingClearance(null);
    setShowForm(true);
    setError(null);
  }, []);

  const handleEditClick = useCallback((clearance: SecurityClearance) => {
    setEditingClearance(clearance);
    setShowForm(true);
    setError(null);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingClearance(null);
    setError(null);
  }, []);

  const handleSubmitForm = useCallback(
    async (formData: ClearanceFormState) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const request = formStateToRequest(formData);

        if (editingClearance !== null) {
          const result = await update(editingClearance.id, request);
          if (result === null) {
            setError('Failed to update clearance');
            return;
          }
        } else {
          const result = await create(request);
          if (result === null) {
            setError('Failed to create clearance');
            return;
          }
        }

        setShowForm(false);
        setEditingClearance(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingClearance, create, update]
  );

  const handleDeleteClick = useCallback(
    async (id: string) => {
      if (
        window.confirm('Are you sure you want to delete this clearance record?') === false
      ) {
        return;
      }

      const success = await remove(id);
      if (success === false) {
        setError('Failed to delete clearance');
      }
    },
    [remove]
  );

  const getFormInitialData = useCallback((): ClearanceFormState | undefined => {
    if (editingClearance !== null) {
      return clearanceToFormState(editingClearance);
    }
    return undefined;
  }, [editingClearance]);

  // Group clearances by level for display
  const clearancesByLevel = clearances.reduce((acc, clearance) => {
    const level = clearance.clearanceLevel;
    if (acc[level] === undefined) {
      acc[level] = [];
    }
    acc[level].push(clearance);
    return acc;
  }, {} as Record<ClearanceLevel, SecurityClearance[]>);

  return (
    <Section id="clearances">
      <SectionHeader
        title="Security Clearances"
        icon={<ShieldLockIcon size="lg" />}
        actions={
          showForm === false && (
            <HStack spacing="sm">
              <Button variant="outline" size="sm" onClick={refresh}>
                <HStack spacing="xs" align="center">
                  <RefreshIcon size="sm" />
                  <Text as="span" variant="bodySmall" color="muted">
                    Refresh
                  </Text>
                </HStack>
              </Button>
              <Button variant="primary" onClick={handleCreateClick}>
                <HStack spacing="xs" align="center">
                  <PlusIcon size="sm" />
                  <Text as="span" variant="bodySmall" color="white">
                    Add Clearance
                  </Text>
                </HStack>
              </Button>
            </HStack>
          )
        }
      />

      <Stack spacing="md">
        {/* Error Display */}
        {(error !== null || loadError !== null) && (
          <Card variant="outlined" style={{ borderColor: '#ef4444' }}>
            <CardBody padding="sm">
              <Text variant="bodySmall" color="danger">
                {error ?? loadError?.message}
              </Text>
            </CardBody>
          </Card>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <Card variant="elevated">
            <CardHeader>
              <Text variant="heading5">
                {editingClearance !== null
                  ? 'Edit Security Clearance'
                  : 'Add New Security Clearance'}
              </Text>
            </CardHeader>
            <CardBody>
              <ClearanceForm
                initialData={getFormInitialData()}
                onSubmit={handleSubmitForm}
                onCancel={handleCancelForm}
                isSubmitting={isSubmitting}
              />
            </CardBody>
          </Card>
        )}

        {/* Filters */}
        {showForm === false && (
          <Card variant="outlined">
            <CardBody padding="sm">
              <HStack justify="between" align="center">
                <HStack spacing="md" align="center">
                  <Text variant="bodySmall" color="muted">
                    Filter by Level:
                  </Text>
                  <Select
                    value={levelFilter ?? ''}
                    onChange={handleLevelFilterChange}
                    options={LEVEL_FILTER_OPTIONS}
                  />
                </HStack>

                <HStack spacing="sm" align="center">
                  <Text variant="caption" color="muted">
                    {totalElements} clearance{totalElements !== 1 ? 's' : ''}
                  </Text>
                  {totalPages > 1 && (
                    <Badge color="zinc">
                      Page {currentPage + 1} of {totalPages}
                    </Badge>
                  )}
                </HStack>
              </HStack>
            </CardBody>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && showForm === false && (
          <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
            <Text variant="body" color="muted">
              Loading clearances...
            </Text>
          </Flex>
        )}

        {/* Empty State */}
        {isLoading === false && showForm === false && clearances.length === 0 && (
          <Card variant="outlined">
            <CardBody>
              <Flex
                direction="column"
                align="center"
                gap="md"
                className="p-8"
              >
                <ShieldLockIcon size="xl" color="muted" />
                <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
                  No security clearances found.
                </Text>
                <Button variant="primary" onClick={handleCreateClick}>
                  <HStack spacing="xs" align="center">
                    <PlusIcon size="sm" />
                    <Text as="span" variant="bodySmall" color="white">
                      Add First Clearance
                    </Text>
                  </HStack>
                </Button>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Clearances List */}
        {isLoading === false && showForm === false && clearances.length > 0 && (
          <Grid columns="repeat(auto-fill, minmax(400px, 1fr))" gap="md">
            {clearances.map((clearance) => (
              <GridItem key={clearance.id}>
                <ClearanceCard
                  clearance={clearance}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </GridItem>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {showForm === false && totalPages > 1 && (
          <HStack justify="center" spacing="sm">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage - 1)}
              isDisabled={currentPage === 0}
            >
              Previous
            </Button>
            <Text variant="bodySmall" color="muted">
              Page {currentPage + 1} of {totalPages}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage + 1)}
              isDisabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </HStack>
        )}
      </Stack>
    </Section>
  );
}

export default ClearancesPage;
