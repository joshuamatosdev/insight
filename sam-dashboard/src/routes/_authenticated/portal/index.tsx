import {createFileRoute} from '@tanstack/react-router';
import {ClientDashboard} from '@/pages';

export const Route = createFileRoute('/_authenticated/portal/')({
    component: () => <ClientDashboard/>,
});
