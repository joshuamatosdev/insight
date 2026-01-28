import {createFileRoute} from '@tanstack/react-router';
import {BillingPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/billing')({
    component: () => <BillingPage/>,
});
