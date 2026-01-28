import {createFileRoute} from '@tanstack/react-router';
import {useOpportunities} from '@/hooks';
import {NAICSPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/naics/$naicsCode')({
  component: NaicsCodeRoute,
});

function NaicsCodeRoute() {
  const {naicsCode} = Route.useParams();
  const {opportunities} = useOpportunities();
  return <NAICSPage naicsCode={naicsCode} opportunities={opportunities} />;
}
