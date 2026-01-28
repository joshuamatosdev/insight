import {createFileRoute} from '@tanstack/react-router';
import {UserRolesPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/admin/user-roles')({
    component: () => <UserRolesPage/>,
});
