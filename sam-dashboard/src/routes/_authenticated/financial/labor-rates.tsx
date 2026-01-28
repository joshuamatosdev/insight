import {createFileRoute} from '@tanstack/react-router';
import {LaborRatesPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/financial/labor-rates')({
    component: () => <LaborRatesPage/>,
});
