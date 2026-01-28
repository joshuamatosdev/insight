/**
 * ClearanceForm - Add/edit security clearance form
 */

import {ChangeEvent, FormEvent, useCallback, useState} from 'react';
import {Button, Input, Select, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, CardHeader, Grid, GridItem, HStack, Stack} from '../../catalyst/layout';
import type {
    ClearanceFormErrors,
    ClearanceFormProps,
    ClearanceFormState,
    ClearanceLevel,
    ClearanceType,
} from './Compliance.types';

const INITIAL_FORM_STATE: ClearanceFormState = {
  userId: '',
  entityName: '',
  clearanceType: 'PERSONNEL',
  clearanceLevel: 'SECRET',
  investigationDate: '',
  grantDate: '',
  expirationDate: '',
  reinvestigationDate: '',
  polygraphType: '',
  polygraphDate: '',
  sponsoringAgency: '',
  caseNumber: '',
  cageCode: '',
  facilityAddress: '',
  fsoName: '',
  fsoEmail: '',
  fsoPhone: '',
  sciAccess: false,
  sciPrograms: '',
  sapAccess: false,
  notes: '',
};

const CLEARANCE_TYPE_OPTIONS: Array<{ value: ClearanceType; label: string }> = [
  { value: 'PERSONNEL', label: 'Personnel Clearance' },
  { value: 'FACILITY', label: 'Facility Clearance' },
  { value: 'INTERIM_PERSONNEL', label: 'Interim Personnel Clearance' },
  { value: 'INTERIM_FACILITY', label: 'Interim Facility Clearance' },
];

const CLEARANCE_LEVEL_OPTIONS: Array<{ value: ClearanceLevel; label: string }> = [
  { value: 'CONFIDENTIAL', label: 'Confidential' },
  { value: 'SECRET', label: 'Secret' },
  { value: 'TOP_SECRET', label: 'Top Secret' },
  { value: 'TOP_SECRET_SCI', label: 'Top Secret / SCI' },
  { value: 'Q_CLEARANCE', label: 'Q Clearance (DOE)' },
  { value: 'L_CLEARANCE', label: 'L Clearance (DOE)' },
];

const POLYGRAPH_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'None' },
  { value: 'CI', label: 'Counter-Intelligence (CI)' },
  { value: 'FULL_SCOPE', label: 'Full Scope' },
  { value: 'LIFESTYLE', label: 'Lifestyle' },
];

/**
 * Validates the clearance form
 */
function validateForm(form: ClearanceFormState): ClearanceFormErrors {
  const errors: ClearanceFormErrors = {};

  if (form.clearanceType.length === 0) {
    errors.clearanceType = 'Clearance type is required';
  }

  if (form.clearanceLevel.length === 0) {
    errors.clearanceLevel = 'Clearance level is required';
  }

  // Either userId or entityName should be provided
  const isFacilityClearance =
    form.clearanceType === 'FACILITY' || form.clearanceType === 'INTERIM_FACILITY';
  if (isFacilityClearance === false && form.userId.length === 0) {
    // For personnel clearances, we might want to require user selection
    // but for now we'll allow empty
  }

  return errors;
}

/**
 * Checks if clearance type is facility-based
 */
function isFacilityType(type: ClearanceType): boolean {
  return type === 'FACILITY' || type === 'INTERIM_FACILITY';
}

export function ClearanceForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ClearanceFormProps): React.ReactElement {
  const [form, setForm] = useState<ClearanceFormState>(
    initialData ?? INITIAL_FORM_STATE
  );
  const [errors, setErrors] = useState<ClearanceFormErrors>({});

  const handleInputChange = useCallback(
    (field: keyof ClearanceFormState) =>
      (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = event.target;
        const value = target.type === 'checkbox'
          ? (target as HTMLInputElement).checked
          : target.value;
        setForm((prev) => ({ ...prev, [field]: value }));

        if (errors[field as keyof ClearanceFormErrors] !== undefined) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors]
  );

  const handleCheckboxChange = useCallback(
    (field: 'sciAccess' | 'sapAccess') => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.checked }));
    },
    []
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

  const showFacilityFields = isFacilityType(form.clearanceType);

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="md">
        {errors.general !== undefined && (
          <Box>
            <Text variant="bodySmall" color="danger">
              {errors.general}
            </Text>
          </Box>
        )}

        {/* Clearance Information */}
        <Card variant="outlined">
          <CardHeader>
            <Text variant="heading6" weight="semibold">
              Clearance Information
            </Text>
          </CardHeader>
          <CardBody>
            <Stack spacing="md">
              <Grid columns="1fr 1fr" gap="md">
                <GridItem>
                  <Box>
                    <Text
                      as="label"
                      variant="bodySmall"
                      weight="medium"
                    >
                      Clearance Type *
                    </Text>
                    <Select
                      value={form.clearanceType}
                      onChange={handleInputChange('clearanceType')}
                      options={CLEARANCE_TYPE_OPTIONS}
                      fullWidth
                      invalid={errors.clearanceType !== undefined}
                    />
                    {errors.clearanceType !== undefined && (
                      <Text
                        variant="caption"
                        color="danger"
                      >
                        {errors.clearanceType}
                      </Text>
                    )}
                  </Box>
                </GridItem>

                <GridItem>
                  <Box>
                    <Text
                      as="label"
                      variant="bodySmall"
                      weight="medium"
                    >
                      Clearance Level *
                    </Text>
                    <Select
                      value={form.clearanceLevel}
                      onChange={handleInputChange('clearanceLevel')}
                      options={CLEARANCE_LEVEL_OPTIONS}
                      fullWidth
                      invalid={errors.clearanceLevel !== undefined}
                    />
                    {errors.clearanceLevel !== undefined && (
                      <Text
                        variant="caption"
                        color="danger"
                      >
                        {errors.clearanceLevel}
                      </Text>
                    )}
                  </Box>
                </GridItem>
              </Grid>

              {showFacilityFields === false && (
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                  >
                    User ID
                  </Text>
                  <Input
                    type="text"
                    value={form.userId}
                    onChange={handleInputChange('userId')}
                    placeholder="Select or enter user ID"
                    fullWidth
                  />
                </Box>
              )}

              {showFacilityFields && (
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                  >
                    Entity/Facility Name
                  </Text>
                  <Input
                    type="text"
                    value={form.entityName}
                    onChange={handleInputChange('entityName')}
                    placeholder="Company or facility name"
                    fullWidth
                  />
                </Box>
              )}

              <Grid columns="1fr 1fr" gap="md">
                <GridItem>
                  <Box>
                    <Text
                      as="label"
                      variant="bodySmall"
                      weight="medium"
                    >
                      Sponsoring Agency
                    </Text>
                    <Input
                      type="text"
                      value={form.sponsoringAgency}
                      onChange={handleInputChange('sponsoringAgency')}
                      placeholder="e.g., DHS, DOD, etc."
                      fullWidth
                    />
                  </Box>
                </GridItem>

                <GridItem>
                  <Box>
                    <Text
                      as="label"
                      variant="bodySmall"
                      weight="medium"
                    >
                      Case Number
                    </Text>
                    <Input
                      type="text"
                      value={form.caseNumber}
                      onChange={handleInputChange('caseNumber')}
                      placeholder="Investigation case number"
                      fullWidth
                    />
                  </Box>
                </GridItem>
              </Grid>
            </Stack>
          </CardBody>
        </Card>

        {/* Dates */}
        <Card variant="outlined">
          <CardHeader>
            <Text variant="heading6" weight="semibold">
              Dates
            </Text>
          </CardHeader>
          <CardBody>
            <Grid columns="1fr 1fr" gap="md">
              <GridItem>
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                  >
                    Investigation Date
                  </Text>
                  <Input
                    type="date"
                    value={form.investigationDate}
                    onChange={handleInputChange('investigationDate')}
                    fullWidth
                  />
                </Box>
              </GridItem>

              <GridItem>
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                  >
                    Grant Date
                  </Text>
                  <Input
                    type="date"
                    value={form.grantDate}
                    onChange={handleInputChange('grantDate')}
                    fullWidth
                  />
                </Box>
              </GridItem>

              <GridItem>
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                  >
                    Expiration Date
                  </Text>
                  <Input
                    type="date"
                    value={form.expirationDate}
                    onChange={handleInputChange('expirationDate')}
                    fullWidth
                    invalid={errors.expirationDate !== undefined}
                  />
                </Box>
              </GridItem>

              <GridItem>
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                  >
                    Reinvestigation Date
                  </Text>
                  <Input
                    type="date"
                    value={form.reinvestigationDate}
                    onChange={handleInputChange('reinvestigationDate')}
                    fullWidth
                  />
                </Box>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Polygraph Information */}
        <Card variant="outlined">
          <CardHeader>
            <Text variant="heading6" weight="semibold">
              Polygraph Information
            </Text>
          </CardHeader>
          <CardBody>
            <Grid columns="1fr 1fr" gap="md">
              <GridItem>
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                  >
                    Polygraph Type
                  </Text>
                  <Select
                    value={form.polygraphType}
                    onChange={handleInputChange('polygraphType')}
                    options={POLYGRAPH_TYPE_OPTIONS}
                    fullWidth
                  />
                </Box>
              </GridItem>

              <GridItem>
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                  >
                    Polygraph Date
                  </Text>
                  <Input
                    type="date"
                    value={form.polygraphDate}
                    onChange={handleInputChange('polygraphDate')}
                    fullWidth
                  />
                </Box>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Special Access */}
        <Card variant="outlined">
          <CardHeader>
            <Text variant="heading6" weight="semibold">
              Special Access
            </Text>
          </CardHeader>
          <CardBody>
            <Stack spacing="md">
              <HStack spacing="lg">
                <Box>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.sciAccess}
                      onChange={handleCheckboxChange('sciAccess')}
                    />
                    <Text variant="bodySmall">SCI Access</Text>
                  </label>
                </Box>

                <Box>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.sapAccess}
                      onChange={handleCheckboxChange('sapAccess')}
                    />
                    <Text variant="bodySmall">SAP Access</Text>
                  </label>
                </Box>
              </HStack>

              {form.sciAccess && (
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                  >
                    SCI Programs
                  </Text>
                  <Input
                    type="text"
                    value={form.sciPrograms}
                    onChange={handleInputChange('sciPrograms')}
                    placeholder="List of SCI programs"
                    fullWidth
                  />
                </Box>
              )}
            </Stack>
          </CardBody>
        </Card>

        {/* Facility Security Officer - Only for Facility Clearances */}
        {showFacilityFields && (
          <Card variant="outlined">
            <CardHeader>
              <Text variant="heading6" weight="semibold">
                Facility Security Officer (FSO)
              </Text>
            </CardHeader>
            <CardBody>
              <Stack spacing="md">
                <Grid columns="1fr 1fr" gap="md">
                  <GridItem>
                    <Box>
                      <Text
                        as="label"
                        variant="bodySmall"
                        weight="medium"
                      >
                        CAGE Code
                      </Text>
                      <Input
                        type="text"
                        value={form.cageCode}
                        onChange={handleInputChange('cageCode')}
                        placeholder="5-character CAGE code"
                        fullWidth
                      />
                    </Box>
                  </GridItem>

                  <GridItem>
                    <Box>
                      <Text
                        as="label"
                        variant="bodySmall"
                        weight="medium"
                      >
                        FSO Name
                      </Text>
                      <Input
                        type="text"
                        value={form.fsoName}
                        onChange={handleInputChange('fsoName')}
                        placeholder="FSO full name"
                        fullWidth
                      />
                    </Box>
                  </GridItem>
                </Grid>

                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                  >
                    Facility Address
                  </Text>
                  <Input
                    type="text"
                    value={form.facilityAddress}
                    onChange={handleInputChange('facilityAddress')}
                    placeholder="Full facility address"
                    fullWidth
                  />
                </Box>

                <Grid columns="1fr 1fr" gap="md">
                  <GridItem>
                    <Box>
                      <Text
                        as="label"
                        variant="bodySmall"
                        weight="medium"
                      >
                        FSO Email
                      </Text>
                      <Input
                        type="email"
                        value={form.fsoEmail}
                        onChange={handleInputChange('fsoEmail')}
                        placeholder="fso@company.com"
                        fullWidth
                      />
                    </Box>
                  </GridItem>

                  <GridItem>
                    <Box>
                      <Text
                        as="label"
                        variant="bodySmall"
                        weight="medium"
                      >
                        FSO Phone
                      </Text>
                      <Input
                        type="tel"
                        value={form.fsoPhone}
                        onChange={handleInputChange('fsoPhone')}
                        placeholder="(555) 123-4567"
                        fullWidth
                      />
                    </Box>
                  </GridItem>
                </Grid>
              </Stack>
            </CardBody>
          </Card>
        )}

        {/* Notes */}
        <Card variant="outlined">
          <CardHeader>
            <Text variant="heading6" weight="semibold">
              Additional Notes
            </Text>
          </CardHeader>
          <CardBody>
            <Box>
              <Input
                type="text"
                value={form.notes}
                onChange={handleInputChange('notes')}
                placeholder="Any additional notes..."
                fullWidth
              />
            </Box>
          </CardBody>
        </Card>

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
            {initialData !== undefined ? 'Update Clearance' : 'Create Clearance'}
          </Button>
        </HStack>
      </Stack>
    </form>
  );
}

export default ClearanceForm;
