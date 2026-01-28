import {createFileRoute, Outlet, redirect} from '@tanstack/react-router';

export const Route = createFileRoute('/_public')({
    beforeLoad: ({context}) => {
        // If already authenticated, redirect to dashboard
        if (context.auth.isAuthenticated === true) {
            throw redirect({
                to: '/',
            });
        }
    },
    component: PublicLayout,
});

function PublicLayout() {
    return <Outlet/>;
}
