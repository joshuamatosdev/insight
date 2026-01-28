import {createFileRoute} from '@tanstack/react-router';
import {ContractorDashboard} from '@/pages';

export const Route = createFileRoute('/_authenticated/portal/')({
  component: () => <ContractorDashboard />,
});
