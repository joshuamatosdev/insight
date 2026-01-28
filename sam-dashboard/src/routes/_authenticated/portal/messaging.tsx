import {createFileRoute} from '@tanstack/react-router';
import {MessagingPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/portal/messaging')({
    component: () => <MessagingPage/>,
});
