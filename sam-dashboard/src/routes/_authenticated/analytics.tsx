import {createFileRoute} from '@tanstack/react-router';
import {AnalyticsDashboardPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/analytics')({
  component: () => <AnalyticsDashboardPage />,
});
