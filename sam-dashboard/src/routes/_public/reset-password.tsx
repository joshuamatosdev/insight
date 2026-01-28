import {createFileRoute} from '@tanstack/react-router';
import {ResetPasswordPage} from '@/pages';

export const Route = createFileRoute('/_public/reset-password')({
  component: () => <ResetPasswordPage />,
});
