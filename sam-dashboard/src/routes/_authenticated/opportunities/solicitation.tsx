import {createFileRoute} from '@tanstack/react-router';
import {useOpportunities} from '@/hooks';
import {SolicitationPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/opportunities/solicitation')({
  component: SolicitationRoute,
});

function SolicitationRoute() {
  const {opportunities} = useOpportunities();
  return <SolicitationPage opportunities={opportunities} />;
}
