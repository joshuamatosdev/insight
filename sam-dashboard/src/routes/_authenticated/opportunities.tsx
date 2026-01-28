import {createFileRoute} from '@tanstack/react-router';
import {useOpportunities} from '@/hooks';
import {AllOpportunitiesPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/opportunities')({
    component: OpportunitiesRoute,
});

function OpportunitiesRoute() {
    const {opportunities} = useOpportunities();
    return <AllOpportunitiesPage opportunities={opportunities}/>;
}
