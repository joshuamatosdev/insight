import {createFileRoute} from '@tanstack/react-router';
import {ReportBuilderPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/reports/builder')({
  component: () => <ReportBuilderPage />,
});
