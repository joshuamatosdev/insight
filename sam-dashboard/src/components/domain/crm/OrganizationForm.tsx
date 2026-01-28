import { useState } from 'react';
import { Stack, HStack, Card, CardHeader, CardBody, CardFooter } from '../../catalyst/layout';
import { Text, Input, Select, Button } from '../../catalyst/primitives';
import type { OrganizationFormProps, OrganizationFormData, OrganizationFormErrors } from './OrganizationForm.types';
import type { OrganizationType, OrganizationStatus, BusinessSize, CreateOrganizationRequest } from '../../../types/crm';

const ORG_TYPES: { value: OrganizationType; label: string }[] = [
  { value: 'GOVERNMENT_AGENCY', label: 'Government Agency' },
  { value: 'GOVERNMENT_OFFICE', label: 'Government Office' },
  { value: 'PRIME_CONTRACTOR', label: 'Prime Contractor' },
  { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
  { value: 'TEAMING_PARTNER', label: 'Teaming Partner' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'COMPETITOR', label: 'Competitor' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'OTHER', label: 'Other' },
];

const ORG_STATUSES: { value: OrganizationStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'DO_NOT_CONTACT', label: 'Do Not Contact' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const BUSINESS_SIZES: { value: BusinessSize | ''; label: string }[] = [
  { value: '', label: 'Select Size' },
  { value: 'LARGE', label: 'Large' },
  { value: 'SMALL', label: 'Small' },
  { value: 'SMALL_DISADVANTAGED', label: 'Small Disadvantaged' },
  { value: 'HUBZONE_SMALL', label: 'HUBZone Small' },
  { value: 'WOSB', label: 'WOSB' },
  { value: 'SDVOSB', label: 'SDVOSB' },
  { value: 'VOSB', label: 'VOSB' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

function getInitialFormData(org?: OrganizationFormProps['organization']): OrganizationFormData {
  if (org !== undefined) {
    return {
      name: org.name,
      legalName: org.legalName ?? '',
      dbaName: org.dbaName ?? '',
      organizationType: org.organizationType,
      status: org.status,
      businessSize: org.businessSize ?? '',
      uei: org.uei ?? '',
      cageCode: org.cageCode ?? '',
      phone: org.phone ?? '',
      email: org.email ?? '',
      website: org.website ?? '',
      addressLine1: org.addressLine1 ?? '',
      addressLine2: org.addressLine2 ?? '',
      city: org.city ?? '',
      state: org.state ?? '',
      postalCode: org.postalCode ?? '',
      country: org.country ?? '',
      naicsCodes: org.naicsCodes ?? '',
      primaryNaics: org.primaryNaics ?? '',
      capabilities: org.capabilities ?? '',
      notes: org.notes ?? '',
      tags: org.tags ?? '',
    };
  }
  return {
    name: '',
    legalName: '',
    dbaName: '',
    organizationType: 'OTHER',
    status: 'ACTIVE',
    businessSize: '',
    uei: '',
    cageCode: '',
    phone: '',
    email: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    naicsCodes: '',
    primaryNaics: '',
    capabilities: '',
    notes: '',
    tags: '',
  };
}

export function OrganizationForm({ organization, onSubmit, onCancel, isLoading = false }: OrganizationFormProps) {
  const [formData, setFormData] = useState<OrganizationFormData>(() => getInitialFormData(organization));
  const [errors, setErrors] = useState<OrganizationFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: OrganizationFormErrors = {};

    if (formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() === false) {
      return;
    }

    const request: CreateOrganizationRequest = {
      name: formData.name,
      organizationType: formData.organizationType,
      status: formData.status,
    };

    if (formData.legalName !== '') request.legalName = formData.legalName;
    if (formData.dbaName !== '') request.dbaName = formData.dbaName;
    if (formData.businessSize !== '') request.businessSize = formData.businessSize as BusinessSize;
    if (formData.uei !== '') request.uei = formData.uei;
    if (formData.cageCode !== '') request.cageCode = formData.cageCode;
    if (formData.phone !== '') request.phone = formData.phone;
    if (formData.email !== '') request.email = formData.email;
    if (formData.website !== '') request.website = formData.website;
    if (formData.addressLine1 !== '') request.addressLine1 = formData.addressLine1;
    if (formData.addressLine2 !== '') request.addressLine2 = formData.addressLine2;
    if (formData.city !== '') request.city = formData.city;
    if (formData.state !== '') request.state = formData.state;
    if (formData.postalCode !== '') request.postalCode = formData.postalCode;
    if (formData.country !== '') request.country = formData.country;
    if (formData.naicsCodes !== '') request.naicsCodes = formData.naicsCodes;
    if (formData.primaryNaics !== '') request.primaryNaics = formData.primaryNaics;
    if (formData.capabilities !== '') request.capabilities = formData.capabilities;
    if (formData.notes !== '') request.notes = formData.notes;
    if (formData.tags !== '') request.tags = formData.tags;

    await onSubmit(request);
  };

  const handleChange = (field: keyof OrganizationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof OrganizationFormErrors] !== undefined) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isEditing = organization !== undefined;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <Text variant="heading4">{isEditing ? 'Edit Organization' : 'New Organization'}</Text>
        </CardHeader>
        <CardBody>
          <Stack gap="lg">
            <Input
              label="Organization Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
            />
            <HStack gap="md">
              <Select
                label="Organization Type"
                value={formData.organizationType}
                onChange={(e) => handleChange('organizationType', e.target.value)}
                options={ORG_TYPES}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={ORG_STATUSES}
              />
            </HStack>
            <HStack gap="md">
              <Input
                label="UEI"
                value={formData.uei}
                onChange={(e) => handleChange('uei', e.target.value)}
              />
              <Input
                label="CAGE Code"
                value={formData.cageCode}
                onChange={(e) => handleChange('cageCode', e.target.value)}
              />
            </HStack>
            <HStack gap="md">
              <Select
                label="Business Size"
                value={formData.businessSize}
                onChange={(e) => handleChange('businessSize', e.target.value)}
                options={BUSINESS_SIZES}
              />
              <Input
                label="Primary NAICS"
                value={formData.primaryNaics}
                onChange={(e) => handleChange('primaryNaics', e.target.value)}
              />
            </HStack>
            <HStack gap="md">
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </HStack>
            <Input
              label="Website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />
            <HStack gap="md">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </HStack>
            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </Stack>
        </CardBody>
        <CardFooter>
          <HStack justify="end" gap="md">
            <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Organization' : 'Create Organization'}
            </Button>
          </HStack>
        </CardFooter>
      </Card>
    </form>
  );
}
