import {createFileRoute} from '@tanstack/react-router';
import {SprintTrackingPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/portal/sprints')({
  component: () => <SprintTrackingPage />,
});
