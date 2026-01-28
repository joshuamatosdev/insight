/**
 * CertificationForm - Add/edit certification form
 */

import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { Text, Button, Input, Select } from '../../catalyst/primitives';
import { Card, CardHeader, CardBody, Stack, HStack, Box, Grid, GridItem } from '../../catalyst/layout';
import type {
  CertificationFormProps,
  CertificationFormState,
  CertificationFormErrors,
  CertificationType,
} from './Compliance.types';

const INITIAL_FORM_STATE: CertificationFormState = {
  certificationType: 'SAM_REGISTRATION',
  name: '',
  description: '',
  certificateNumber: '',
  issuingAgency: '',
  issueDate: '',
  expirationDate: '',
  renewalDate: '',
  naicsCode: '',
  sizeStandard: '',
  uei: '',
  cageCode: '',
  samRegistrationDate: '',
  samExpirationDate: '',
  eightAEntryDate: '',
  eightAGraduationDate: '',
  hubzoneCertificationDate: '',
  documentUrl: '',
  notes: '',
  reminderDaysBefore: '90',
};

const CERTIFICATION_TYPE_OPTIONS: Array<{ value: CertificationType; label: string }> = [
  { value: 'SAM_REGISTRATION', label: 'SAM Registration' },
  { value: 'EIGHT_A', label: '8(a) Business Development' },
  { value: 'HUBZONE', label: 'HUBZone' },
  { value: 'WOSB', label: 'Women-Owned Small Business (WOSB)' },
  { value: 'EDWOSB', label: 'Economically Disadvantaged WOSB' },
  { value: 'SDVOSB', label: 'Service-Disabled Veteran-Owned (SDVOSB)' },
  { value: 'VOSB', label: 'Veteran-Owned Small Business (VOSB)' },
  { value: 'SBA_MENTOR_PROTEGE', label: 'SBA Mentor-Protege' },
  { value: 'DBE', label: 'Disadvantaged Business Enterprise (DBE)' },
  { value: 'MBE', label: 'Minority Business Enterprise (MBE)' },
  { value: 'WBE', label: 'Women Business Enterprise (WBE)' },
  { value: 'SBE', label: 'Small Business Enterprise (SBE)' },
  { value: 'STATE_CERTIFICATION', label: 'State Certification' },
  { value: 'ISO_9001', label: 'ISO 9001' },
  { value: 'ISO_27001', label: 'ISO 27001' },
  { value: 'ISO_20000', label: 'ISO 20000' },
  { value: 'CMMI', label: 'CMMI' },
  { value: 'SOC2', label: 'SOC 2' },
  { value: 'FEDRAMP', label: 'FedRAMP' },
  { value: 'FACILITY_CLEARANCE', label: 'Facility Clearance' },
  { value: 'CMMC', label: 'CMMC' },
  { value: 'OTHER', label: 'Other' },
];

/**
 * Validates the certification form
 */
function validateForm(form: CertificationFormState): CertificationFormErrors {
  const errors: CertificationFormErrors = {};

  if (form.name.trim().length === 0) {
    errors.name = 'Certification name is required';
  } else if (form.name.length > 200) {
    errors.name = 'Certification name must be less than 200 characters';
  }

  if (form.certificationType.length === 0) {
    errors.certificationType = 'Certification type is required';
  }

  return errors;
}

/**
 * Checks if a certification type requires special fields
 */
function getRequiredFieldsForType(type: CertificationType): string[] {
  switch (type) {
    case 'SAM_REGISTRATION':
      return ['uei', 'cageCode', 'samRegistrationDate', 'samExpirationDate'];
    case 'EIGHT_A':
      return ['eightAEntryDate'];
    case 'HUBZONE':
      return ['hubzoneCertificationDate'];
    default:
      return [];
  }
}

export function CertificationForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CertificationFormProps): React.ReactElement {
  const [form, setForm] = useState<CertificationFormState>(
    initialData ?? INITIAL_FORM_STATE
  );
  const [errors, setErrors] = useState<CertificationFormErrors>({});

  const handleInputChange = useCallback(
    (field: keyof CertificationFormState) =>
      (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = event.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));

        if (errors[field as keyof CertificationFormErrors] !== undefined) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors]
  );

  const handleTypeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as CertificationType;
      setForm((prev) => ({ ...prev, certificationType: value }));
      if (errors.certificationType !== undefined) {
        setErrors((prev) => ({ ...prev, certificationType: undefined }));
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

  const requiredFields = getRequiredFieldsForType(form.certificationType);

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="md">
        {errors.general !== undefined && (
          <Box
            style={{
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              borderRadius: '0.375rem',
              border: '1px solid #ef4444',
            }}
          >
            <Text variant="bodySmall" color="danger">
              {errors.general}
            </Text>
          </Box>
        )}

        {/* Basic Information */}
        <Card variant="outlined">
          <CardHeader>
            <Text variant="heading6" weight="semibold">
              Basic Information
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
                      className="block mb-1"
                    >
                      Certification Type *
                    </Text>
                    <Select
                      value={form.certificationType}
                      onChange={handleTypeChange}
                      options={CERTIFICATION_TYPE_OPTIONS}
                      fullWidth
                      invalid={errors.certificationType !== undefined}
                    />
                    {errors.certificationType !== undefined && (
                      <Text
                        variant="caption"
                        color="danger"
                        className="mt-1"
                      >
                        {errors.certificationType}
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
                      className="block mb-1"
                    >
                      Certification Name *
                    </Text>
                    <Input
                      type="text"
                      value={form.name}
                      onChange={handleInputChange('name')}
                      placeholder="e.g., ISO 27001:2022 Certification"
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
                </GridItem>
              </Grid>

              <Box>
                <Text
                  as="label"
                  variant="bodySmall"
                  weight="medium"
                  className="block mb-1"
                >
                  Description
                </Text>
                <Input
                  type="text"
                  value={form.description}
                  onChange={handleInputChange('description')}
                  placeholder="Optional description"
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
                      className="block mb-1"
                    >
                      Certificate Number
                    </Text>
                    <Input
                      type="text"
                      value={form.certificateNumber}
                      onChange={handleInputChange('certificateNumber')}
                      placeholder="e.g., CERT-12345"
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
                      className="block mb-1"
                    >
                      Issuing Agency
                    </Text>
                    <Input
                      type="text"
                      value={form.issuingAgency}
                      onChange={handleInputChange('issuingAgency')}
                      placeholder="e.g., SBA, ISO, etc."
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
            <Grid columns="1fr 1fr 1fr" gap="md">
              <GridItem>
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                    className="block mb-1"
                  >
                    Issue Date
                  </Text>
                  <Input
                    type="date"
                    value={form.issueDate}
                    onChange={handleInputChange('issueDate')}
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
                    className="block mb-1"
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
                    className="block mb-1"
                  >
                    Renewal Date
                  </Text>
                  <Input
                    type="date"
                    value={form.renewalDate}
                    onChange={handleInputChange('renewalDate')}
                    fullWidth
                  />
                </Box>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* SAM.gov Details - Show for SAM_REGISTRATION */}
        {(form.certificationType === 'SAM_REGISTRATION' ||
          requiredFields.includes('uei')) && (
          <Card variant="outlined">
            <CardHeader>
              <Text variant="heading6" weight="semibold">
                SAM.gov Details
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
                      className="block mb-1"
                    >
                      UEI (Unique Entity Identifier)
                    </Text>
                    <Input
                      type="text"
                      value={form.uei}
                      onChange={handleInputChange('uei')}
                      placeholder="12-character UEI"
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
                      className="block mb-1"
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
                      className="block mb-1"
                    >
                      SAM Registration Date
                    </Text>
                    <Input
                      type="date"
                      value={form.samRegistrationDate}
                      onChange={handleInputChange('samRegistrationDate')}
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
                      className="block mb-1"
                    >
                      SAM Expiration Date
                    </Text>
                    <Input
                      type="date"
                      value={form.samExpirationDate}
                      onChange={handleInputChange('samExpirationDate')}
                      fullWidth
                    />
                  </Box>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        )}

        {/* 8(a) Details - Show for EIGHT_A */}
        {form.certificationType === 'EIGHT_A' && (
          <Card variant="outlined">
            <CardHeader>
              <Text variant="heading6" weight="semibold">
                8(a) Program Details
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
                      className="block mb-1"
                    >
                      8(a) Entry Date
                    </Text>
                    <Input
                      type="date"
                      value={form.eightAEntryDate}
                      onChange={handleInputChange('eightAEntryDate')}
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
                      className="block mb-1"
                    >
                      8(a) Graduation Date
                    </Text>
                    <Input
                      type="date"
                      value={form.eightAGraduationDate}
                      onChange={handleInputChange('eightAGraduationDate')}
                      fullWidth
                    />
                  </Box>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        )}

        {/* HUBZone Details - Show for HUBZONE */}
        {form.certificationType === 'HUBZONE' && (
          <Card variant="outlined">
            <CardHeader>
              <Text variant="heading6" weight="semibold">
                HUBZone Details
              </Text>
            </CardHeader>
            <CardBody>
              <Box>
                <Text
                  as="label"
                  variant="bodySmall"
                  weight="medium"
                  className="block mb-1"
                >
                  HUBZone Certification Date
                </Text>
                <Input
                  type="date"
                  value={form.hubzoneCertificationDate}
                  onChange={handleInputChange('hubzoneCertificationDate')}
                  fullWidth
                />
              </Box>
            </CardBody>
          </Card>
        )}

        {/* Additional Information */}
        <Card variant="outlined">
          <CardHeader>
            <Text variant="heading6" weight="semibold">
              Additional Information
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
                      className="block mb-1"
                    >
                      NAICS Code
                    </Text>
                    <Input
                      type="text"
                      value={form.naicsCode}
                      onChange={handleInputChange('naicsCode')}
                      placeholder="e.g., 541512"
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
                      className="block mb-1"
                    >
                      Reminder (Days Before Expiration)
                    </Text>
                    <Input
                      type="number"
                      value={form.reminderDaysBefore}
                      onChange={handleInputChange('reminderDaysBefore')}
                      placeholder="90"
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
                  className="block mb-1"
                >
                  Document URL
                </Text>
                <Input
                  type="url"
                  value={form.documentUrl}
                  onChange={handleInputChange('documentUrl')}
                  placeholder="https://..."
                  fullWidth
                />
              </Box>

              <Box>
                <Text
                  as="label"
                  variant="bodySmall"
                  weight="medium"
                  className="block mb-1"
                >
                  Notes
                </Text>
                <Input
                  type="text"
                  value={form.notes}
                  onChange={handleInputChange('notes')}
                  placeholder="Additional notes..."
                  fullWidth
                />
              </Box>
            </Stack>
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
            {initialData !== undefined ? 'Update Certification' : 'Create Certification'}
          </Button>
        </HStack>
      </Stack>
    </form>
  );
}

export default CertificationForm;
