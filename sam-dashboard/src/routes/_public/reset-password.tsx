import {createFileRoute} from '@tanstack/react-router';
import {z} from 'zod';
import {ResetPasswordPage} from '@/pages';

const resetPasswordSearchSchema = z.object({
    token: z.string().optional(),
});

export const Route = createFileRoute('/_public/reset-password')({
    component: () => <ResetPasswordPage/>,
    validateSearch: resetPasswordSearchSchema,
});
