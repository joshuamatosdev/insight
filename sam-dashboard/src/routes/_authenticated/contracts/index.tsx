import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {ContractsPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/contracts/')({
  component: ContractsRoute,
});

function ContractsRoute() {
  const navigate = useNavigate();

  const handleContractSelect = (contractId: string) => {
    navigate({to: '/contracts/$contractId', params: {contractId}});
  };

  return <ContractsPage onContractSelect={handleContractSelect} />;
}
