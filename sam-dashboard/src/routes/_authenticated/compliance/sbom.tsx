import {createFileRoute} from '@tanstack/react-router';
import {SbomDashboardPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/compliance/sbom')({
  component: () => <SbomDashboardPage />,
});
