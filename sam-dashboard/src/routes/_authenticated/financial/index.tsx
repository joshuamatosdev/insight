import {createFileRoute} from '@tanstack/react-router';
import {FinancialDashboardPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/financial/')({
    component: () => <FinancialDashboardPage/>,
});
