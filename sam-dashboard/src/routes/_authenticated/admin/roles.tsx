import {createFileRoute} from '@tanstack/react-router';
import {AdminRolesPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/admin/roles')({
  component: () => <AdminRolesPage />,
});
