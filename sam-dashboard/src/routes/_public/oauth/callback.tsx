import {createFileRoute} from '@tanstack/react-router';
import {z} from 'zod';
import {OAuthCallbackPage} from '@/pages';

const oauthCallbackSearchSchema = z.object({
    provider: z.string().optional(),
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
    user_id: z.string().optional(),
    email: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
});

export const Route = createFileRoute('/_public/oauth/callback')({
    component: () => <OAuthCallbackPage/>,
    validateSearch: oauthCallbackSearchSchema,
});
