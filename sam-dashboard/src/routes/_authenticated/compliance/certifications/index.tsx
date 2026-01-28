import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {CertificationsPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/compliance/certifications/')({
  component: CertificationsRoute,
});

function CertificationsRoute() {
  const navigate = useNavigate();

  const handleViewDetails = (cert: {id: string}) => {
    navigate({to: '/compliance/certifications/$certificationId', params: {certificationId: cert.id}});
  };

  return <CertificationsPage onViewDetails={handleViewDetails} />;
}
