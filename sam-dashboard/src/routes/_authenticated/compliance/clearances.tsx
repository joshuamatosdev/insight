import {createFileRoute} from '@tanstack/react-router';
import {ClearancesPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/compliance/clearances')({
    component: () => <ClearancesPage/>,
});
