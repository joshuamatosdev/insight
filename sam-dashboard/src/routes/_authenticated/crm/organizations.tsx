import {createFileRoute} from '@tanstack/react-router';
import {OrganizationsPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/crm/organizations')({
    component: () => <OrganizationsPage/>,
});
