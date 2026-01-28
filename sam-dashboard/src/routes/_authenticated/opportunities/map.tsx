import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useOpportunities} from '@/hooks';
import {MapPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/opportunities/map')({
  component: OpportunityMapRoute,
});

function OpportunityMapRoute() {
  const {opportunities} = useOpportunities();
  const navigate = useNavigate();

  const handleNavigate = (section: string) => {
    const routeMap: Record<string, string> = {
      'all-opportunities': '/opportunities',
      'sources-sought': '/opportunities/sources-sought',
      presolicitation: '/opportunities/presolicitation',
      solicitation: '/opportunities/solicitation',
    };
    const path = routeMap[section] ?? `/${section}`;
    navigate({to: path});
  };

  return <MapPage opportunities={opportunities} onNavigate={handleNavigate} />;
}
