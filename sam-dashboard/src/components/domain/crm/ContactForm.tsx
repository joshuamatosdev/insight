import { useState } from 'react';
import { Stack, HStack, Card, CardHeader, CardBody, CardFooter } from '../../catalyst/layout';
import { Text, Input, Select, Button } from '../../catalyst/primitives';
import type { ContactFormProps, ContactFormData, ContactFormErrors } from './ContactForm.types';
import type { ContactType, ContactStatus, CreateContactRequest } from '../../../types/crm';

const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: 'GOVERNMENT_CUSTOMER', label: 'Government Customer' },
  { value: 'CONTRACTING_OFFICER', label: 'Contracting Officer' },
  { value: 'CONTRACTING_SPECIALIST', label: 'Contracting Specialist' },
  { value: 'PROGRAM_MANAGER', label: 'Program Manager' },
  { value: 'TECHNICAL_POC', label: 'Technical POC' },
  { value: 'COR', label: 'COR' },
  { value: 'PRIME_CONTRACTOR', label: 'Prime Contractor' },
  { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
  { value: 'TEAMING_PARTNER', label: 'Teaming Partner' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'CONSULTANT', label: 'Consultant' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'OTHER', label: 'Other' },
];

const CONTACT_STATUSES: { value: ContactStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DO_NOT_CONTACT', label: 'Do Not Contact' },
  { value: 'ARCHIVED', label: 'Archived' },
];

function getInitialFormData(contact?: ContactFormProps['contact']): ContactFormData {
  if (contact !== undefined) {
    return {
      firstName: contact.firstName,
      lastName: contact.lastName,
      middleName: contact.middleName ?? '',
      prefix: contact.prefix ?? '',
      suffix: contact.suffix ?? '',
      contactType: contact.contactType,
      status: contact.status,
      jobTitle: contact.jobTitle ?? '',
      department: contact.department ?? '',
      email: contact.email ?? '',
      emailSecondary: contact.emailSecondary ?? '',
      phoneWork: contact.phoneWork ?? '',
      phoneMobile: contact.phoneMobile ?? '',
      addressLine1: contact.addressLine1 ?? '',
      addressLine2: contact.addressLine2 ?? '',
      city: contact.city ?? '',
      state: contact.state ?? '',
      postalCode: contact.postalCode ?? '',
      country: contact.country ?? '',
      linkedinUrl: contact.linkedinUrl ?? '',
      website: contact.website ?? '',
      notes: contact.notes ?? '',
      tags: contact.tags ?? '',
    };
  }
  return {
    firstName: '',
    lastName: '',
    middleName: '',
    prefix: '',
    suffix: '',
    contactType: 'OTHER',
    status: 'ACTIVE',
    jobTitle: '',
    department: '',
    email: '',
    emailSecondary: '',
    phoneWork: '',
    phoneMobile: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    linkedinUrl: '',
    website: '',
    notes: '',
    tags: '',
  };
}

export function ContactForm({ contact, onSubmit, onCancel, isLoading = false }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>(() => getInitialFormData(contact));
  const [errors, setErrors] = useState<ContactFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ContactFormErrors = {};

    if (formData.firstName.trim() === '') {
      newErrors.firstName = 'First name is required';
    }
    if (formData.lastName.trim() === '') {
      newErrors.lastName = 'Last name is required';
    }
    if (formData.email !== '' && formData.email.includes('@') === false) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() === false) {
      return;
    }

    const request: CreateContactRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      contactType: formData.contactType,
      status: formData.status,
    };

    if (formData.middleName !== '') request.middleName = formData.middleName;
    if (formData.prefix !== '') request.prefix = formData.prefix;
    if (formData.suffix !== '') request.suffix = formData.suffix;
    if (formData.jobTitle !== '') request.jobTitle = formData.jobTitle;
    if (formData.department !== '') request.department = formData.department;
    if (formData.email !== '') request.email = formData.email;
    if (formData.emailSecondary !== '') request.emailSecondary = formData.emailSecondary;
    if (formData.phoneWork !== '') request.phoneWork = formData.phoneWork;
    if (formData.phoneMobile !== '') request.phoneMobile = formData.phoneMobile;
    if (formData.addressLine1 !== '') request.addressLine1 = formData.addressLine1;
    if (formData.addressLine2 !== '') request.addressLine2 = formData.addressLine2;
    if (formData.city !== '') request.city = formData.city;
    if (formData.state !== '') request.state = formData.state;
    if (formData.postalCode !== '') request.postalCode = formData.postalCode;
    if (formData.country !== '') request.country = formData.country;
    if (formData.linkedinUrl !== '') request.linkedinUrl = formData.linkedinUrl;
    if (formData.website !== '') request.website = formData.website;
    if (formData.notes !== '') request.notes = formData.notes;
    if (formData.tags !== '') request.tags = formData.tags;

    await onSubmit(request);
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ContactFormErrors] !== undefined) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isEditing = contact !== undefined;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <Text variant="heading4">{isEditing ? 'Edit Contact' : 'New Contact'}</Text>
        </CardHeader>
        <CardBody>
          <Stack gap="lg">
            <HStack gap="md">
              <Input
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={errors.firstName}
              />
              <Input
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={errors.lastName}
              />
            </HStack>
            <HStack gap="md">
              <Select
                label="Contact Type"
                value={formData.contactType}
                onChange={(e) => handleChange('contactType', e.target.value)}
                options={CONTACT_TYPES}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={CONTACT_STATUSES}
              />
            </HStack>
            <HStack gap="md">
              <Input
                label="Job Title"
                value={formData.jobTitle}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
              />
              <Input
                label="Department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
              />
            </HStack>
            <HStack gap="md">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
              />
              <Input
                label="Work Phone"
                value={formData.phoneWork}
                onChange={(e) => handleChange('phoneWork', e.target.value)}
              />
            </HStack>
            <HStack gap="md">
              <Input
                label="Mobile Phone"
                value={formData.phoneMobile}
                onChange={(e) => handleChange('phoneMobile', e.target.value)}
              />
              <Input
                label="LinkedIn URL"
                value={formData.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
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
              {isLoading ? 'Saving...' : isEditing ? 'Update Contact' : 'Create Contact'}
            </Button>
          </HStack>
        </CardFooter>
      </Card>
    </form>
  );
}
