import { useState, useCallback, useEffect, FormEvent, ChangeEvent } from 'react';
import {
  Text,
  Button,
  Input,
  Badge,
  BellIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from '../components/catalyst/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stack,
  HStack,
  Flex,
  Box,
  Grid,
  GridItem,
} from '../components/catalyst/layout';
import {
  fetchOpportunityAlerts,
  createOpportunityAlert,
  updateOpportunityAlert,
  deleteOpportunityAlert,
  toggleOpportunityAlert,
} from '../services/api';
import type {
  OpportunityAlert,
  AlertFormState,
  AlertFormErrors,
  CreateAlertRequest,
  UpdateAlertRequest,
} from './AlertsPage.types';

const INITIAL_FORM_STATE: AlertFormState = {
  name: '',
  description: '',
  naicsCodes: [],
  keywords: [],
  minValue: '',
  maxValue: '',
  enabled: true,
};

/**
 * Validates the alert form
 */
function validateForm(form: AlertFormState): AlertFormErrors {
  const errors: AlertFormErrors = {};

  if (form.name.trim().length === 0) {
    errors.name = 'Alert name is required';
  } else if (form.name.length > 100) {
    errors.name = 'Alert name must be less than 100 characters';
  }

  if (form.naicsCodes.length === 0 && form.keywords.length === 0) {
    errors.general = 'At least one NAICS code or keyword is required';
  }

  if (form.minValue !== '' && isNaN(Number(form.minValue))) {
    errors.minValue = 'Minimum value must be a valid number';
  }

  if (form.maxValue !== '' && isNaN(Number(form.maxValue))) {
    errors.maxValue = 'Maximum value must be a valid number';
  }

  if (
    form.minValue !== '' &&
    form.maxValue !== '' &&
    Number(form.minValue) > Number(form.maxValue)
  ) {
    errors.minValue = 'Minimum value cannot be greater than maximum value';
  }

  return errors;
}

/**
 * Parses comma-separated string into array of trimmed values
 */
function parseCommaSeparated(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Formats array to comma-separated string
 */
function formatCommaSeparated(arr: string[]): string {
  return arr.join(', ');
}

/**
 * Formats number value for display
 */
function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats date for display
 */
function formatDate(dateString: string | null): string {
  if (dateString === null) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Alert Card Component
 */
function AlertCard({
  alert,
  onEdit,
  onDelete,
  onToggle,
}: {
  alert: OpportunityAlert;
  onEdit: (alert: OpportunityAlert) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <Card variant="default">
      <CardHeader>
        <HStack justify="between" align="center">
          <HStack spacing="sm" align="center">
            <BellIcon
              size="sm"
              color={alert.enabled ? 'primary' : 'muted'}
            />
            <Text variant="heading6" weight="semibold">
              {alert.name}
            </Text>
          </HStack>
          <Badge
            variant={alert.enabled ? 'success' : 'secondary'}
            size="sm"
          >
            {alert.enabled ? 'Active' : 'Disabled'}
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody>
        <Stack spacing="md">
          {alert.description !== null && alert.description.length > 0 && (
            <Text variant="bodySmall" color="muted">
              {alert.description}
            </Text>
          )}

          <Grid columns="1fr 1fr" gap="md">
            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                NAICS Codes
              </Text>
              <Text variant="bodySmall">
                {alert.naicsCodes.length > 0
                  ? alert.naicsCodes.join(', ')
                  : 'Any'}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Keywords
              </Text>
              <Text variant="bodySmall">
                {alert.keywords.length > 0
                  ? alert.keywords.join(', ')
                  : 'Any'}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Value Range
              </Text>
              <Text variant="bodySmall">
                {alert.minValue !== null || alert.maxValue !== null
                  ? `${formatCurrency(alert.minValue)} - ${formatCurrency(alert.maxValue)}`
                  : 'Any'}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Created
              </Text>
              <Text variant="bodySmall">{formatDate(alert.createdAt)}</Text>
            </GridItem>
          </Grid>
        </Stack>
      </CardBody>

      <CardFooter>
        <HStack justify="between" align="center">
          <Button
            variant={alert.enabled ? 'outline' : 'primary'}
            size="sm"
            onClick={() => onToggle(alert.id)}
          >
            {alert.enabled ? 'Disable' : 'Enable'}
          </Button>

          <HStack spacing="sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(alert)}
              aria-label="Edit alert"
            >
              <PencilIcon size="sm" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(alert.id)}
              aria-label="Delete alert"
            >
              <TrashIcon size="sm" color="danger" />
            </Button>
          </HStack>
        </HStack>
      </CardFooter>
    </Card>
  );
}

/**
 * Alert Form Component
 */
function AlertForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialData: AlertFormState;
  onSubmit: (data: AlertFormState) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<AlertFormState>(initialData);
  const [naicsInput, setNaicsInput] = useState(formatCommaSeparated(initialData.naicsCodes));
  const [keywordsInput, setKeywordsInput] = useState(formatCommaSeparated(initialData.keywords));
  const [errors, setErrors] = useState<AlertFormErrors>({});

  const handleInputChange = useCallback(
    (field: keyof AlertFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field
      if (errors[field as keyof AlertFormErrors] !== undefined) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleNaicsChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setNaicsInput(event.target.value);
      setForm((prev) => ({
        ...prev,
        naicsCodes: parseCommaSeparated(event.target.value),
      }));
      if (errors.naicsCodes !== undefined || errors.general !== undefined) {
        setErrors((prev) => ({ ...prev, naicsCodes: undefined, general: undefined }));
      }
    },
    [errors]
  );

  const handleKeywordsChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setKeywordsInput(event.target.value);
      setForm((prev) => ({
        ...prev,
        keywords: parseCommaSeparated(event.target.value),
      }));
      if (errors.keywords !== undefined || errors.general !== undefined) {
        setErrors((prev) => ({ ...prev, keywords: undefined, general: undefined }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const validationErrors = validateForm(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      onSubmit(form);
    },
    [form, onSubmit]
  );

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack spacing="md">
        {errors.general !== undefined && (
          <Box className="p-3 bg-danger-bg rounded-md border border-red-500">
            <Text variant="bodySmall" color="danger">
              {errors.general}
            </Text>
          </Box>
        )}

        {/* Alert Name */}
        <Box>
          <Text as="label" variant="label" className="block mb-1">
            Alert Name *
          </Text>
          <Input
            type="text"
            value={form.name}
            onChange={handleInputChange('name')}
            placeholder="e.g., IT Services 541512"
            fullWidth
            invalid={errors.name !== undefined}
          />
          {errors.name !== undefined && (
            <Text
              variant="caption"
              color="danger"
              className="mt-1"
            >
              {errors.name}
            </Text>
          )}
        </Box>

        {/* Description */}
        <Box>
          <Text as="label" variant="label" className="block mb-1">
            Description
          </Text>
          <Input
            type="text"
            value={form.description}
            onChange={handleInputChange('description')}
            placeholder="Optional description for this alert"
            fullWidth
          />
        </Box>

        {/* NAICS Codes */}
        <Box>
          <Text as="label" variant="label" className="block mb-1">
            NAICS Codes
          </Text>
          <Input
            type="text"
            value={naicsInput}
            onChange={handleNaicsChange}
            placeholder="e.g., 541512, 541511, 518210"
            fullWidth
            invalid={errors.naicsCodes !== undefined}
          />
          <Text
            variant="caption"
            color="muted"
            className="mt-1"
          >
            Comma-separated NAICS codes to monitor
          </Text>
        </Box>

        {/* Keywords */}
        <Box>
          <Text as="label" variant="label" className="block mb-1">
            Keywords
          </Text>
          <Input
            type="text"
            value={keywordsInput}
            onChange={handleKeywordsChange}
            placeholder="e.g., cloud, security, data analytics"
            fullWidth
            invalid={errors.keywords !== undefined}
          />
          <Text
            variant="caption"
            color="muted"
            className="mt-1"
          >
            Comma-separated keywords to match in title or description
          </Text>
        </Box>

        {/* Value Range */}
        <Grid columns="1fr 1fr" gap="md">
          <GridItem>
            <Text as="label" variant="label" className="block mb-1">
              Minimum Value ($)
            </Text>
            <Input
              type="number"
              value={form.minValue}
              onChange={handleInputChange('minValue')}
              placeholder="e.g., 100000"
              fullWidth
              invalid={errors.minValue !== undefined}
            />
            {errors.minValue !== undefined && (
              <Text
                variant="caption"
                color="danger"
                className="mt-1"
              >
                {errors.minValue}
              </Text>
            )}
          </GridItem>

          <GridItem>
            <Text as="label" variant="label" className="block mb-1">
              Maximum Value ($)
            </Text>
            <Input
              type="number"
              value={form.maxValue}
              onChange={handleInputChange('maxValue')}
              placeholder="e.g., 5000000"
              fullWidth
              invalid={errors.maxValue !== undefined}
            />
            {errors.maxValue !== undefined && (
              <Text
                variant="caption"
                color="danger"
                className="mt-1"
              >
                {errors.maxValue}
              </Text>
            )}
          </GridItem>
        </Grid>

        {/* Submit buttons */}
        <HStack justify="end" spacing="sm">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {initialData.name !== '' ? 'Update Alert' : 'Create Alert'}
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
}

/**
 * Alerts Page Component
 */
export function AlertsPage(): React.ReactElement {
  const [alerts, setAlerts] = useState<OpportunityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<OpportunityAlert | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchOpportunityAlerts();
      setAlerts(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleCreateClick = useCallback(() => {
    setEditingAlert(null);
    setShowForm(true);
  }, []);

  const handleEditClick = useCallback((alert: OpportunityAlert) => {
    setEditingAlert(alert);
    setShowForm(true);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingAlert(null);
  }, []);

  const handleSubmitForm = useCallback(
    async (formData: AlertFormState) => {
      setIsSubmitting(true);
      try {
        if (editingAlert !== null) {
          // Update existing alert
          const request: UpdateAlertRequest = {
            name: formData.name,
            description: formData.description.length > 0 ? formData.description : undefined,
            naicsCodes: formData.naicsCodes,
            keywords: formData.keywords,
            minValue:
              formData.minValue !== '' ? Number(formData.minValue) : undefined,
            maxValue:
              formData.maxValue !== '' ? Number(formData.maxValue) : undefined,
            enabled: formData.enabled,
          };
          await updateOpportunityAlert(editingAlert.id, request);
        } else {
          // Create new alert
          const request: CreateAlertRequest = {
            name: formData.name,
            description: formData.description.length > 0 ? formData.description : undefined,
            naicsCodes: formData.naicsCodes,
            keywords: formData.keywords,
            minValue:
              formData.minValue !== '' ? Number(formData.minValue) : undefined,
            maxValue:
              formData.maxValue !== '' ? Number(formData.maxValue) : undefined,
            enabled: formData.enabled,
          };
          await createOpportunityAlert(request);
        }

        setShowForm(false);
        setEditingAlert(null);
        await loadAlerts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save alert');
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingAlert, loadAlerts]
  );

  const handleToggleAlert = useCallback(
    async (id: string) => {
      try {
        await toggleOpportunityAlert(id);
        await loadAlerts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to toggle alert');
      }
    },
    [loadAlerts]
  );

  const handleDeleteAlert = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this alert?') === false) {
        return;
      }

      try {
        await deleteOpportunityAlert(id);
        await loadAlerts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete alert');
      }
    },
    [loadAlerts]
  );

  const getFormInitialData = useCallback((): AlertFormState => {
    if (editingAlert !== null) {
      return {
        name: editingAlert.name,
        description: editingAlert.description ?? '',
        naicsCodes: editingAlert.naicsCodes,
        keywords: editingAlert.keywords,
        minValue: editingAlert.minValue !== null ? String(editingAlert.minValue) : '',
        maxValue: editingAlert.maxValue !== null ? String(editingAlert.maxValue) : '',
        enabled: editingAlert.enabled,
      };
    }
    return INITIAL_FORM_STATE;
  }, [editingAlert]);

  if (isLoading) {
    return (
      <Section id="alerts">
        <Flex justify="center" align="center" className="min-h-[300px]">
          <Text variant="body" color="muted">
            Loading alerts...
          </Text>
        </Flex>
      </Section>
    );
  }

  return (
    <Section id="alerts">
      <SectionHeader
        title="Opportunity Alerts"
        icon={<BellIcon size="lg" />}
        actions={
          showForm === false && (
            <Button variant="primary" onClick={handleCreateClick}>
              <HStack spacing="xs" align="center">
                <PlusIcon size="sm" />
                <Text as="span" variant="bodySmall" color="white">
                  Create Alert
                </Text>
              </HStack>
            </Button>
          )
        }
      />

      {error !== null && (
        <Box className="p-3 mb-4 bg-danger-bg rounded-md border border-red-500">
          <Text variant="bodySmall" color="danger">
            {error}
          </Text>
        </Box>
      )}

      {showForm && (
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <Text variant="heading5">
              {editingAlert !== null ? 'Edit Alert' : 'Create New Alert'}
            </Text>
          </CardHeader>
          <CardBody>
            <AlertForm
              initialData={getFormInitialData()}
              onSubmit={handleSubmitForm}
              onCancel={handleCancelForm}
              isSubmitting={isSubmitting}
            />
          </CardBody>
        </Card>
      )}

      {alerts.length === 0 && showForm === false ? (
        <Card variant="default">
          <CardBody>
            <Flex direction="column" align="center" gap="md" className="p-8">
              <BellIcon size="xl" color="muted" />
              <Stack spacing="xs" align="center">
                <Text variant="body" color="muted" className="text-center">
                  No alerts configured yet.
                </Text>
                <Text variant="body" color="muted" className="text-center">
                  Create an alert to get notified when matching opportunities are posted.
                </Text>
              </Stack>
              <Button variant="primary" onClick={handleCreateClick}>
                <HStack spacing="xs" align="center">
                  <PlusIcon size="sm" />
                  <Text as="span" variant="bodySmall" color="white">
                    Create Your First Alert
                  </Text>
                </HStack>
              </Button>
            </Flex>
          </CardBody>
        </Card>
      ) : (
        <Grid columns="repeat(auto-fill, minmax(400px, 1fr))" gap="md">
          {alerts.map((alert) => (
            <GridItem key={alert.id}>
              <AlertCard
                alert={alert}
                onEdit={handleEditClick}
                onDelete={handleDeleteAlert}
                onToggle={handleToggleAlert}
              />
            </GridItem>
          ))}
        </Grid>
      )}
    </Section>
  );
}

export default AlertsPage;
