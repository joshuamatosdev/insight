import {createFileRoute} from '@tanstack/react-router';
import {ScopeTrackerPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/portal/scope')({
  component: () => <ScopeTrackerPage />,
});
