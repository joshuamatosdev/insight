import {createFileRoute} from '@tanstack/react-router';
import {UsagePage} from '@/pages';

export const Route = createFileRoute('/_authenticated/usage')({
  component: () => <UsagePage />,
});
