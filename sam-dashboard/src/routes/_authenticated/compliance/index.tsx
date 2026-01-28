import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {CompliancePage} from '@/pages';

export const Route = createFileRoute('/_authenticated/compliance/')({
  component: ComplianceRoute,
});

function ComplianceRoute() {
  const navigate = useNavigate();

  const handleNavigate = (section: string) => {
    const routeMap: Record<string, string> = {
      certifications: '/compliance/certifications',
      clearances: '/compliance/clearances',
      sbom: '/compliance/sbom',
    };
    const path = routeMap[section] ?? `/compliance/${section}`;
    navigate({to: path});
  };

  return <CompliancePage onNavigate={handleNavigate} />;
}
