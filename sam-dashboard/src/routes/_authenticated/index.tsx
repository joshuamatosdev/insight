import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useOpportunities} from '@/hooks';
import {DashboardPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardRoute,
});

function DashboardRoute() {
  const {opportunities} = useOpportunities();
  const navigate = useNavigate();

  const handleNavigate = (section: string) => {
    // Map section names to routes
    const routeMap: Record<string, string> = {
      'all-opportunities': '/opportunities',
      'sources-sought': '/opportunities/sources-sought',
      presolicitation: '/opportunities/presolicitation',
      solicitation: '/opportunities/solicitation',
      pipeline: '/pipeline',
      contracts: '/contracts',
      financial: '/financial',
      compliance: '/compliance',
      analytics: '/analytics',
    };

    const path = routeMap[section] ?? `/${section}`;
    navigate({to: path});
  };

  return <DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />;
}
