import {createFileRoute} from '@tanstack/react-router';
import {FeatureRequestsPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/portal/features')({
  component: () => <FeatureRequestsPage />,
});
