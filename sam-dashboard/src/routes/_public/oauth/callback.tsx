import {createFileRoute} from '@tanstack/react-router';
import {OAuthCallbackPage} from '@/pages';

export const Route = createFileRoute('/_public/oauth/callback')({
  component: () => <OAuthCallbackPage />,
});
