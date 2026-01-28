import {createFileRoute} from '@tanstack/react-router';
import {MilestonesPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/portal/milestones')({
  component: () => <MilestonesPage />,
});
