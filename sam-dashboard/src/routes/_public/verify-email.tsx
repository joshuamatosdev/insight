import {createFileRoute} from '@tanstack/react-router';
import {VerifyEmailPage} from '@/pages';

export const Route = createFileRoute('/_public/verify-email')({
  component: () => <VerifyEmailPage />,
});
