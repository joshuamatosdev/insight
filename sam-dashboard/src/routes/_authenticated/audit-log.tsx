import {createFileRoute} from '@tanstack/react-router';
import {AuditLogPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/audit-log')({
    component: () => <AuditLogPage/>,
});
