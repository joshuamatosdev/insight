import {createFileRoute} from '@tanstack/react-router';
import {InteractionsPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/crm/interactions')({
  component: () => <InteractionsPage />,
});
