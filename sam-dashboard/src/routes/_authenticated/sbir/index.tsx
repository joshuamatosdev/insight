import {createFileRoute} from '@tanstack/react-router';
import {useOpportunities} from '@/hooks';
import {SBIRPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/sbir/')({
  component: SbirRoute,
});

function SbirRoute() {
  const {opportunities} = useOpportunities();
  return <SBIRPage opportunities={opportunities} />;
}
