import {createFileRoute} from '@tanstack/react-router';
import {AlertsPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/alerts')({
    component: () => <AlertsPage/>,
});
