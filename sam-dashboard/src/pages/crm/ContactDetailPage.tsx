import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Box, Card, CardBody, CardHeader, Grid, HStack, Stack,} from '@/components/catalyst/layout';
import {PageHeading, PageHeadingActions, PageHeadingSection, PageHeadingTitle,} from '@/components/catalyst/navigation';
import {Badge, Button, Text} from '@/components/catalyst/primitives';
import {ContactForm, InteractionForm, InteractionTimeline} from '@/components/domain/crm';
import {useContact} from '@/hooks';
import {useContactInteractions} from '@/hooks/useInteractions';
import type {ContactStatus, ContactType, CreateContactRequest, CreateInteractionRequest} from '@/types/crm';

function getContactTypeLabel(type: ContactType): string {
  const labels: Record<ContactType, string> = {
    GOVERNMENT_CUSTOMER: 'Government Customer',
    CONTRACTING_OFFICER: 'Contracting Officer',
    CONTRACTING_SPECIALIST: 'Contracting Specialist',
    PROGRAM_MANAGER: 'Program Manager',
    TECHNICAL_POC: 'Technical POC',
    COR: 'COR',
    PRIME_CONTRACTOR: 'Prime Contractor',
    SUBCONTRACTOR: 'Subcontractor',
    TEAMING_PARTNER: 'Teaming Partner',
    VENDOR: 'Vendor',
    CONSULTANT: 'Consultant',
    PROSPECT: 'Prospect',
    INTERNAL: 'Internal',
    OTHER: 'Other',
  };
  return labels[type];
}

function getStatusVariant(status: ContactStatus): 'green' | 'gray' | 'red' | 'yellow' {
  const variants: Record<ContactStatus, 'green' | 'gray' | 'red' | 'yellow'> = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    DO_NOT_CONTACT: 'red',
    ARCHIVED: 'gray',
  };
  return variants[status];
}

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contact, isLoading, error, update, refresh } = useContact(id ?? '');
  const {
    interactions,
    isLoading: interactionsLoading,
    create: createInteraction,
    refresh: refreshInteractions,
  } = useContactInteractions(id ?? '');

  const [isEditing, setIsEditing] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditSubmit = async (data: CreateContactRequest) => {
    setIsSubmitting(true);
    try {
      await update(data);
      setIsEditing(false);
      await refresh();
    } catch (err) {
      console.error('Failed to update contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInteractionSubmit = async (data: CreateInteractionRequest) => {
    setIsSubmitting(true);
    try {
      await createInteraction(data);
      setShowInteractionForm(false);
      await refreshInteractions();
    } catch (err) {
      console.error('Failed to create interaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading === true) {
    return (
      <Box as="section" id="contact-detail">
        <Text variant="body" color="secondary">Loading contact...</Text>
      </Box>
    );
  }

  if (error !== null) {
    return (
      <Box as="section" id="contact-detail">
        <Text variant="body" color="danger">{error.message}</Text>
      </Box>
    );
  }

  if (contact === null) {
    return (
      <Box as="section" id="contact-detail">
        <Text variant="body" color="secondary">Contact not found</Text>
      </Box>
    );
  }

  if (isEditing === true) {
    return (
      <Box as="section" id="edit-contact">
        <ContactForm
          contact={contact}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
          isLoading={isSubmitting}
        />
      </Box>
    );
  }

  if (showInteractionForm === true) {
    return (
      <Box as="section" id="log-interaction">
        <InteractionForm
          onSubmit={handleInteractionSubmit}
          onCancel={() => setShowInteractionForm(false)}
          isLoading={isSubmitting}
          contactId={contact.id}
        />
      </Box>
    );
  }

  return (
    <Box as="section" id="contact-detail">
      <Stack gap="lg">
        <PageHeading>
          <PageHeadingSection>
            <PageHeadingTitle>{`${contact.firstName} ${contact.lastName}`}</PageHeadingTitle>
          </PageHeadingSection>
          <PageHeadingActions>
            <Button variant="ghost" onClick={() => navigate('/crm/contacts')}>
              Back to Contacts
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button onClick={() => setShowInteractionForm(true)}>
              Log Interaction
            </Button>
          </PageHeadingActions>
        </PageHeading>

        <Grid columns={2} gap="lg">
          <Card>
            <CardHeader>
              <HStack justify="between" align="center">
                <Text variant="heading5">Contact Information</Text>
                <HStack gap="sm">
                  <Badge color="blue">{getContactTypeLabel(contact.contactType)}</Badge>
                  <Badge color={getStatusVariant(contact.status)}>{contact.status}</Badge>
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stack gap="md">
                {contact.jobTitle !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Job Title</Text>
                    <Text variant="body">{contact.jobTitle}</Text>
                  </Stack>
                )}
                {contact.department !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Department</Text>
                    <Text variant="body">{contact.department}</Text>
                  </Stack>
                )}
                {contact.organizationName !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Organization</Text>
                    <Text variant="body">{contact.organizationName}</Text>
                  </Stack>
                )}
                {contact.email !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Email</Text>
                    <Text variant="body">{contact.email}</Text>
                  </Stack>
                )}
                {contact.phoneWork !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Work Phone</Text>
                    <Text variant="body">{contact.phoneWork}</Text>
                  </Stack>
                )}
                {contact.phoneMobile !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Mobile Phone</Text>
                    <Text variant="body">{contact.phoneMobile}</Text>
                  </Stack>
                )}
                {contact.linkedinUrl !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">LinkedIn</Text>
                    <Text variant="body">{contact.linkedinUrl}</Text>
                  </Stack>
                )}
              </Stack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text variant="heading5">Address</Text>
            </CardHeader>
            <CardBody>
              <Stack gap="md">
                {contact.addressLine1 !== null && (
                  <Text variant="body">{contact.addressLine1}</Text>
                )}
                {contact.addressLine2 !== null && (
                  <Text variant="body">{contact.addressLine2}</Text>
                )}
                {(contact.city !== null || contact.state !== null || contact.postalCode !== null) && (
                  <Text variant="body">
                    {[contact.city, contact.state, contact.postalCode].filter((v) => v !== null).join(', ')}
                  </Text>
                )}
                {contact.country !== null && (
                  <Text variant="body">{contact.country}</Text>
                )}
                {contact.addressLine1 === null && contact.city === null && (
                  <Text variant="bodySmall" color="secondary">No address on file</Text>
                )}
              </Stack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text variant="heading5">Notes</Text>
            </CardHeader>
            <CardBody>
              {contact.notes !== null ? (
                <Text variant="body">{contact.notes}</Text>
              ) : (
                <Text variant="bodySmall" color="secondary">No notes</Text>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text variant="heading5">Relationship</Text>
            </CardHeader>
            <CardBody>
              <Stack gap="md">
                {contact.relationshipScore !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Relationship Score</Text>
                    <Text variant="body">{contact.relationshipScore}/100</Text>
                  </Stack>
                )}
                {contact.lastContactDate !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Last Contact</Text>
                    <Text variant="body">{new Date(contact.lastContactDate).toLocaleDateString()}</Text>
                  </Stack>
                )}
                {contact.nextFollowupDate !== null && (
                  <Stack gap="xs">
                    <Text variant="bodySmall" color="secondary">Next Follow-up</Text>
                    <Text variant="body">{new Date(contact.nextFollowupDate).toLocaleDateString()}</Text>
                  </Stack>
                )}
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        <Card>
          <CardHeader>
            <HStack justify="between" align="center">
              <Text variant="heading5">Interaction History</Text>
              <Button variant="ghost" size="sm" onClick={() => setShowInteractionForm(true)}>
                Log Interaction
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <InteractionTimeline
              interactions={interactions}
              isLoading={interactionsLoading}
              emptyMessage="No interactions recorded yet"
            />
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}
