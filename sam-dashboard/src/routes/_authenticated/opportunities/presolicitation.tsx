import {createFileRoute} from '@tanstack/react-router';
import {useOpportunities} from '@/hooks';
import {PresolicationPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/opportunities/presolicitation')({
    component: PresolicationRoute,
});

function PresolicationRoute() {
    const {opportunities} = useOpportunities();
    return <PresolicationPage opportunities={opportunities}/>;
}
