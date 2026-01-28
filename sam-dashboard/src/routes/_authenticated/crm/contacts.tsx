import {createFileRoute} from '@tanstack/react-router';
import {ContactsPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/crm/contacts')({
  component: () => <ContactsPage />,
});
