import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {CertificationDetailPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/compliance/certifications/$certificationId')({
  component: CertificationDetailRoute,
});

function CertificationDetailRoute() {
  const {certificationId} = Route.useParams();
  const navigate = useNavigate();

  return (
    <CertificationDetailPage
      certificationId={certificationId}
      onBack={() => navigate({to: '/compliance/certifications'})}
    />
  );
}
