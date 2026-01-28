import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Box, Card, CardBody, CardHeader, Grid, HStack, Stack,} from '@/components/catalyst/layout';
import {PageHeading, PageHeadingActions, PageHeadingSection, PageHeadingTitle,} from '@/components/catalyst/navigation';
import {Badge, Button, Text} from '@/components/catalyst/primitives';
import {ContactList, InteractionTimeline, OrganizationForm} from '@/components/domain/crm';
import {useOrganization} from '@/hooks';
import {useOrganizationInteractions} from '@/hooks/useInteractions';
import {fetchContactsByOrganization} from '@/services/crmService';
import type {Contact, CreateOrganizationRequest, OrganizationStatus, OrganizationType} from '@/types/crm';

function getOrgTypeLabel(type: OrganizationType): string {
  const labels: Record<OrganizationType, string> = {
    GOVERNMENT_AGENCY: 'Government Agency',
    GOVERNMENT_OFFICE: 'Government Office',
    PRIME_CONTRACTOR: 'Prime Contractor',
    SUBCONTRACTOR: 'Subcontractor',
    TEAMING_PARTNER: 'Teaming Partner',
    VENDOR: 'Vendor',
    COMPETITOR: 'Competitor',
    PROSPECT: 'Prospect',
    CUSTOMER: 'Customer',
    OTHER: 'Other',
  };
  return labels[type];
}

function getStatusVariant(status: OrganizationStatus): 'green' | 'gray' | 'red' | 'yellow' {
  const variants: Record<OrganizationStatus, 'green' | 'gray' | 'red' | 'yellow'> = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    PROSPECT: 'yellow',
    DO_NOT_CONTACT: 'red',
    ARCHIVED: 'gray',
  };
  return variants[status];
}

export function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { organization, isLoading, error, update, refresh } = useOrganization(id ?? '');
  const {
    interactions,
    isLoading: interactionsLoading,
  } = useOrganizationInteractions(id ?? '');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadContacts = useCallback(async () => {
    if (id === undefined || id === '') return;
    setContactsLoading(true);
    try {
      const result = await fetchContactsByOrganization(id, 0, 10);
      setContacts(result.content);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setContactsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  const handleEditSubmit = async (data: CreateOrganizationRequest) => {
    setIsSubmitting(true);
    try {
      await update(data);
      setIsEditing(false);
      await refresh();
    } catch (err) {
      console.error('Failed to update organization:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactClick = (contact: Contact) => {
    navigate(`/crm/contacts/${contact.id}`);
  };

  if (isLoading === true) {
    return (
      <Box as="section" id="organization-detail">
        <Text variant="body" color="secondary">Loading organization...</Text>
      </Box>
    );
  }

  if (error !== null) {
    return (
      <Box as="section" id="organization-detail">
        <Text variant="body" color="danger">{error.message}</Text>
      </Box>
    );
  }

  if (organization === null) {
    return (
      <Box as="section" id="organization-detail">
        <Text variant="body" color="secondary">Organization not found</Text>
      </Box>
    );
  }

  if (isEditing === true) {
    return (
      <Box as="section" id="edit-organization">
        <OrganizationForm
          organization={organization}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
          isLoading={isSubmitting}
        />
      </Box>
    );
  }

  return (
    <Box as="section" id="organization-detail">
      <Stack gap="lg">
        <PageHeading>
          <PageHeadingSection>
            <PageHeadingTitle>{organization.name}</PageHeadingTitle>
          </PageHeadingSection>
          <PageHeadingActions>
            <Button variant="ghost" onClick={() => navigate('/crm/organizations')}>
              Back to Organizations
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </PageHeadingActions>
        </PageHeading>

        <Grid columns={2} gap="lg">
          <Card>
            <CardHeader>
              <HStack justify="between" align="center">
                <Text variant="heading5">Organization Details</Text>
                <HStack gap="sm">
                  <Badge color="blue">{getOrgTypeLabel(organization.organizationType)}</Badge>
                  <Badge color={getStatusVariant(organization.status)}>{organization.status}</Badge>
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stack gap="md">
                {organization.legalName !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Legal Name</Text>
                    <Text variant="body">{organization.legalName}</Text>
                  </Stack>
                )}
                {organization.uei !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">UEI</Text>
                    <Text variant="body">{organization.uei}</Text>
                  </Stack>
                )}
                {organization.cageCode !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">CAGE Code</Text>
                    <Text variant="body">{organization.cageCode}</Text>
                  </Stack>
                )}
                {organization.businessSize !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Business Size</Text>
                    <Text variant="body">{organization.businessSize}</Text>
                  </Stack>
                )}
                {organization.primaryNaics !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Primary NAICS</Text>
                    <Text variant="body">{organization.primaryNaics}</Text>
                  </Stack>
                )}
              </Stack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text variant="heading5">Contact Information</Text>
            </CardHeader>
            <CardBody>
              <Stack gap="md">
                {organization.phone !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Phone</Text>
                    <Text variant="body">{organization.phone}</Text>
                  </Stack>
                )}
                {organization.email !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Email</Text>
                    <Text variant="body">{organization.email}</Text>
                  </Stack>
                )}
                {organization.website !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Website</Text>
                    <Text variant="body">{organization.website}</Text>
                  </Stack>
                )}
                {(organization.city !== null || organization.state !== null) && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Location</Text>
                    <Text variant="body">
                      {[organization.city, organization.state].filter((v) => v !== null).join(', ')}
                    </Text>
                  </Stack>
                )}
              </Stack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text variant="heading5">Capabilities</Text>
            </CardHeader>
            <CardBody>
              {organization.capabilities !== null ? (
                <Text variant="body">{organization.capabilities}</Text>
              ) : (
                <Text variant="bodySmall" color="secondary">No capabilities listed</Text>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text variant="heading5">Notes</Text>
            </CardHeader>
            <CardBody>
              {organization.notes !== null ? (
                <Text variant="body">{organization.notes}</Text>
              ) : (
                <Text variant="bodySmall" color="secondary">No notes</Text>
              )}
            </CardBody>
          </Card>
        </Grid>

        <Card>
          <CardHeader>
            <HStack justify="between" align="center">
              <Text variant="heading5">Contacts ({contacts.length})</Text>
              <Button variant="ghost" size="sm" onClick={() => navigate('/crm/contacts')}>
                View All
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <ContactList
              contacts={contacts}
              isLoading={contactsLoading}
              onContactClick={handleContactClick}
              emptyMessage="No contacts for this organization"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Text variant="heading5">Interaction History</Text>
          </CardHeader>
          <CardBody>
            <InteractionTimeline
              interactions={interactions}
              isLoading={interactionsLoading}
              emptyMessage="No interactions recorded"
            />
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}
