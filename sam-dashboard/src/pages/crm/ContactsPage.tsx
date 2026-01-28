import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  HStack,
  Card,
  CardBody,
} from '@/components/catalyst/layout';
import {
  PageHeading,
  PageHeadingTitle,
  PageHeadingSection,
  PageHeadingActions,
} from '@/components/catalyst/navigation';
import { Input, Select, Button, Text } from '@/components/catalyst/primitives';
import { ContactList, ContactForm } from '@/components/domain/crm';
import { useContacts } from '@/hooks';
import type { Contact, ContactType, CreateContactRequest } from '@/types/crm';

const CONTACT_TYPE_OPTIONS: { value: ContactType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'GOVERNMENT_CUSTOMER', label: 'Government Customer' },
  { value: 'CONTRACTING_OFFICER', label: 'Contracting Officer' },
  { value: 'CONTRACTING_SPECIALIST', label: 'Contracting Specialist' },
  { value: 'PROGRAM_MANAGER', label: 'Program Manager' },
  { value: 'TECHNICAL_POC', label: 'Technical POC' },
  { value: 'PRIME_CONTRACTOR', label: 'Prime Contractor' },
  { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
  { value: 'TEAMING_PARTNER', label: 'Teaming Partner' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'OTHER', label: 'Other' },
];

export function ContactsPage() {
  const navigate = useNavigate();
  const {
    contacts,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    filters,
    setFilters,
    setPage,
    create,
    update,
    remove,
    refresh,
  } = useContacts();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFilters({ ...filters, search: value });
  };

  const handleTypeFilterChange = (value: string) => {
    if (value === '') {
      const { contactType: _unused, ...rest } = filters;
      void _unused;
      setFilters(rest);
    } else {
      setFilters({ ...filters, contactType: value as ContactType });
    }
  };

  const handleContactClick = (contact: Contact) => {
    navigate(`/crm/contacts/${contact.id}`);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
  };

  const handleDelete = async (contact: Contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`) === true) {
      try {
        await remove(contact.id);
      } catch (err) {
        console.error('Failed to delete contact:', err);
      }
    }
  };

  const handleCreateSubmit = async (data: CreateContactRequest) => {
    setIsSubmitting(true);
    try {
      await create(data);
      setShowCreateForm(false);
      await refresh();
    } catch (err) {
      console.error('Failed to create contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: CreateContactRequest) => {
    if (editingContact === null) return;
    setIsSubmitting(true);
    try {
      await update(editingContact.id, data);
      setEditingContact(null);
      await refresh();
    } catch (err) {
      console.error('Failed to update contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingContact(null);
  };

  if (showCreateForm === true) {
    return (
      <Box as="section" id="create-contact">
        <ContactForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      </Box>
    );
  }

  if (editingContact !== null) {
    return (
      <Box as="section" id="edit-contact">
        <ContactForm
          contact={editingContact}
          onSubmit={handleEditSubmit}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      </Box>
    );
  }

  return (
    <Box as="section" id="contacts">
      <Stack gap="lg">
        <PageHeading>
          <PageHeadingSection>
            <PageHeadingTitle>Contacts</PageHeadingTitle>
          </PageHeadingSection>
          <PageHeadingActions>
            <Button onClick={() => setShowCreateForm(true)}>Add Contact</Button>
          </PageHeadingActions>
        </PageHeading>

        <Card>
          <CardBody>
            <Stack gap="lg">
              <HStack gap="md">
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <Select
                  value={filters.contactType ?? ''}
                  onChange={(e) => handleTypeFilterChange(e.target.value)}
                  options={CONTACT_TYPE_OPTIONS}
                />
              </HStack>

              {error !== null && (
                <Text variant="body" color="danger">
                  {error.message}
                </Text>
              )}

              <ContactList
                contacts={contacts}
                isLoading={isLoading}
                onContactClick={handleContactClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              {totalPages > 1 && (
                <HStack justify="between" align="center">
                  <Text variant="bodySmall" color="secondary">
                    Showing {contacts.length} of {totalElements} contacts
                  </Text>
                  <HStack gap="sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Text variant="bodySmall">
                      Page {page + 1} of {totalPages}
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </HStack>
                </HStack>
              )}
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}
