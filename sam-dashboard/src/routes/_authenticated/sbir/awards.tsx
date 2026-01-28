import {createFileRoute} from '@tanstack/react-router';
import {SBIRAwardsPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/sbir/awards')({
  component: () => <SBIRAwardsPage />,
});
