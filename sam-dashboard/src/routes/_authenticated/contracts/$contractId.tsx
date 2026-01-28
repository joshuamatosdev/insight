import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {ContractDetailPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/contracts/$contractId')({
  component: ContractDetailRoute,
});

function ContractDetailRoute() {
  const {contractId} = Route.useParams();
  const navigate = useNavigate();

  return (
    <ContractDetailPage
      contractId={contractId}
      onBack={() => navigate({to: '/contracts'})}
    />
  );
}
