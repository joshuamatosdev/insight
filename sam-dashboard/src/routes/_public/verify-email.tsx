import {createFileRoute} from '@tanstack/react-router';
import {z} from 'zod';
import {VerifyEmailPage} from '@/pages';

const verifyEmailSearchSchema = z.object({
    token: z.string().optional(),
});

export const Route = createFileRoute('/_public/verify-email')({
    component: () => <VerifyEmailPage/>,
    validateSearch: verifyEmailSearchSchema,
});
