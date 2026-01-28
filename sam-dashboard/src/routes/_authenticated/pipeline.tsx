import {createFileRoute} from '@tanstack/react-router';
import {PipelinePage} from '@/pages';

export const Route = createFileRoute('/_authenticated/pipeline')({
  component: () => <PipelinePage />,
});
