import {createFileRoute} from '@tanstack/react-router';
import {MfaSetupPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/mfa-setup')({
    component: () => <MfaSetupPage/>,
});
