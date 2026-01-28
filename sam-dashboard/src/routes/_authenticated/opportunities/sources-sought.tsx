import {createFileRoute} from '@tanstack/react-router';
import {useOpportunities} from '@/hooks';
import {SourcesSoughtPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/opportunities/sources-sought')({
  component: SourcesSoughtRoute,
});

function SourcesSoughtRoute() {
  const {opportunities} = useOpportunities();
  return <SourcesSoughtPage opportunities={opportunities} />;
}
