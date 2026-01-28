import {createFileRoute, useNavigate, useSearch} from '@tanstack/react-router';
import {z} from 'zod';
import {LoginPage} from '@/pages';

const loginSearchSchema = z.object({
    redirect: z.string().optional(),
});

export const Route = createFileRoute('/_public/login')({
    validateSearch: loginSearchSchema,
    component: LoginRoute,
});

function LoginRoute() {
    const navigate = useNavigate();
    const {redirect: redirectUrl} = useSearch({from: '/_public/login'});

    const handleLoginSuccess = () => {
        navigate({to: redirectUrl ?? '/'});
    };

    return <LoginPage onLoginSuccess={handleLoginSuccess}/>;
}
