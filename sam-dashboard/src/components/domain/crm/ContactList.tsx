import { Stack } from '../../layout/Stack';
import { Text } from '../../primitives/Text';
import { ContactCard } from './ContactCard';
import type { Contact } from '../../../types/crm';

export interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  onContactClick?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  emptyMessage?: string;
}

export function ContactList({
  contacts,
  isLoading,
  onContactClick,
  onEdit,
  onDelete,
  emptyMessage = 'No contacts found',
}: ContactListProps) {
  if (isLoading === true) {
    return (
      <Stack gap="md">
        <Text variant="body" color="secondary">Loading contacts...</Text>
      </Stack>
    );
  }

  if (contacts.length === 0) {
    return (
      <Stack gap="md">
        <Text variant="body" color="secondary">{emptyMessage}</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onClick={onContactClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}
